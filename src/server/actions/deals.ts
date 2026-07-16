"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dealSchema, updateStageSchema, noteSchema } from "@/lib/validators";
import { type DealInput, type UpdateStageInput, type NoteInput } from "@/lib/validators";
import { type DealQueryParams, type PipelineStageWithDeals, type DealDetailData } from "@/types";
import { ActivityType, DealStatus } from "@prisma/client";

/**
 * Get all pipeline stages and active deals for the Kanban board
 */
export async function getPipelineDeals(): Promise<PipelineStageWithDeals[]> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return [];
  }

  const stages = await prisma.pipelineStage.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    orderBy: {
      orderIndex: "asc",
    },
    include: {
      deals: {
        where: {
          deletedAt: null,
          status: DealStatus.OPEN,
          // If REP, optional filter could apply if strict territory limits are enabled,
          // but across standard Kanban boards all team deals are visible
        },
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          account: {
            select: { id: true, name: true, industry: true },
          },
          contact: {
            select: { id: true, fullName: true, email: true, title: true },
          },
          owner: {
            select: { id: true, fullName: true, email: true },
          },
          riskAnalysis: {
            select: {
              riskScore: true,
              riskLevel: true,
              stallDays: true,
              summary: true,
              recommendation: true,
            },
          },
        },
      },
    },
  });

  return stages.map((stage) => {
    const deals = stage.deals.map((d) => ({
      ...d,
      value: Number(d.value),
      expectedCloseDate: d.expectedCloseDate.toISOString(),
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));

    const totalValue = deals.reduce((acc, curr) => acc + curr.value, 0);
    const weightedValue = deals.reduce(
      (acc, curr) => acc + curr.value * (stage.defaultProbability / 100),
      0
    );

    return {
      id: stage.id,
      name: stage.name,
      orderIndex: stage.orderIndex,
      defaultProbability: stage.defaultProbability,
      colorToken: stage.colorToken,
      organizationId: stage.organizationId,
      deals,
      totalValue,
      weightedValue,
    };
  });
}

/**
 * Get paginated, filtered, and sorted deals for the dense list view
 */
export async function getFilteredDeals(params: DealQueryParams) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { deals: [], total: 0, pages: 0 };
  }

  const {
    query,
    stageId,
    ownerId,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 25,
  } = params;

  // Build Prisma where clause with AND semantics
  const where: Record<string, unknown> = {
    stage: {
      organizationId: session.user.organizationId,
    },
    deletedAt: null,
  };

  if (query && query.trim() !== "") {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { account: { name: { contains: query, mode: "insensitive" } } },
    ];
  }

  if (stageId && stageId !== "ALL") {
    where.stageId = stageId;
  }

  if (ownerId && ownerId !== "ALL") {
    where.ownerId = ownerId;
  }

  if (status) {
    where.status = status;
  }

  const skip = (page - 1) * limit;

  const [rawDeals, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
      include: {
        account: { select: { id: true, name: true, industry: true } },
        contact: { select: { id: true, fullName: true, email: true, title: true } },
        owner: { select: { id: true, fullName: true, email: true } },
        stage: { select: { id: true, name: true, colorToken: true } },
        riskAnalysis: true,
      },
    }),
    prisma.deal.count({ where }),
  ]);

  const deals = rawDeals.map((d) => ({
    ...d,
    value: Number(d.value),
    expectedCloseDate: d.expectedCloseDate.toISOString(),
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));

  return {
    deals,
    total,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Get full detail of a single deal including notes and activity audit logs
 */
export async function getDealDetail(dealId: string): Promise<DealDetailData | null> {
  const session = await auth();
  if (!session?.user?.organizationId) return null;

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: {
      account: { select: { id: true, name: true, industry: true } },
      contact: { select: { id: true, fullName: true, email: true, title: true } },
      owner: { select: { id: true, fullName: true, email: true } },
      riskAnalysis: true,
      activities: {
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { id: true, fullName: true } } },
      },
      notes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, fullName: true } } },
      },
    },
  });

  if (!deal || deal.deletedAt) return null;

  return {
    ...deal,
    value: Number(deal.value),
    expectedCloseDate: deal.expectedCloseDate.toISOString(),
    createdAt: deal.createdAt.toISOString(),
    updatedAt: deal.updatedAt.toISOString(),
    activities: deal.activities.map((a) => ({
      id: a.id,
      actionType: a.actionType,
      oldValue: a.oldValue,
      newValue: a.newValue,
      createdAt: a.createdAt.toISOString(),
      actor: a.actor,
    })),
    notes: deal.notes.map((n) => ({
      id: n.id,
      content: n.content,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
      author: n.author,
    })),
  };
}

/**
 * Create a new deal
 */
export async function createDeal(input: DealInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = dealSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const data = parsed.data;

  try {
    const deal = await prisma.deal.create({
      data: {
        title: data.title,
        value: data.value,
        probability: data.probability,
        stageId: data.stageId,
        accountId: data.accountId,
        contactId: data.contactId || null,
        ownerId: data.ownerId,
        expectedCloseDate: new Date(data.expectedCloseDate),
        status: data.status,
      },
      include: {
        stage: true,
      },
    });

    // Audit activity log
    await prisma.activityLog.create({
      data: {
        dealId: deal.id,
        actorId: session.user.id,
        actionType: ActivityType.CREATED,
        newValue: `Created deal in ${deal.stage.name} stage ($${data.value.toLocaleString()})`,
      },
    });

    revalidatePath("/pipeline");
    revalidatePath("/deals");
    revalidatePath("/analytics");

    return { success: true, dealId: deal.id };
  } catch (e) {
    console.error("Failed to create deal:", e);
    return { success: false, error: "Database error occurred." };
  }
}

/**
 * Update deal stage via Kanban drag and drop (Optimistic UI support)
 */
export async function updateDealStage(input: UpdateStageInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = updateStageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid stage update payload." };
  }

  const { dealId, newStageId, newProbability } = parsed.data;

  try {
    const existingDeal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { stage: true },
    });

    if (!existingDeal) {
      return { success: false, error: "Deal not found." };
    }

    // RBAC Check: If role is REP, verify ownership or reject
    if (session.user.role === "REP" && existingDeal.ownerId !== session.user.id) {
      return { success: false, error: "Permission denied: You can only move your assigned deals." };
    }

    const newStage = await prisma.pipelineStage.findUnique({
      where: { id: newStageId },
    });

    if (!newStage) {
      return { success: false, error: "Target stage not found." };
    }

    // Update deal stage and set probability to new probability or stage default
    const updatedDeal = await prisma.deal.update({
      where: { id: dealId },
      data: {
        stageId: newStageId,
        probability: newProbability !== undefined ? newProbability : newStage.defaultProbability,
        status:
          newStage.name === "Closed Won"
            ? DealStatus.WON
            : newStage.name === "Closed Lost"
            ? DealStatus.LOST
            : DealStatus.OPEN,
      },
    });

    // Audit log entry
    await prisma.activityLog.create({
      data: {
        dealId,
        actorId: session.user.id,
        actionType: ActivityType.STAGE_CHANGE,
        oldValue: existingDeal.stage.name,
        newValue: newStage.name,
      },
    });

    revalidatePath("/pipeline");
    revalidatePath("/deals");
    revalidatePath("/analytics");

    return { success: true, deal: updatedDeal };
  } catch (e) {
    console.error("Stage update failed:", e);
    return { success: false, error: "Failed to move deal across stages." };
  }
}

/**
 * Soft delete a deal
 */
export async function deleteDeal(dealId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) return { success: false, error: "Deal not found." };

    if (session.user.role === "REP" && deal.ownerId !== session.user.id) {
      return { success: false, error: "Permission denied." };
    }

    await prisma.deal.update({
      where: { id: dealId },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/pipeline");
    revalidatePath("/deals");
    revalidatePath("/analytics");

    return { success: true };
  } catch (e) {
    console.error("Delete deal failed:", e);
    return { success: false, error: "Failed to delete deal." };
  }
}

/**
 * Add a note to a deal
 */
export async function addDealNote(input: NoteInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };

  try {
    const note = await prisma.dealNote.create({
      data: {
        dealId: parsed.data.dealId,
        authorId: session.user.id,
        content: parsed.data.content,
      },
      include: {
        author: { select: { id: true, fullName: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        dealId: parsed.data.dealId,
        actorId: session.user.id,
        actionType: ActivityType.NOTE_ADDED,
        newValue: "Added a new stakeholder note",
      },
    });

    revalidatePath("/pipeline");
    revalidatePath("/deals");

    return {
      success: true,
      note: {
        id: note.id,
        content: note.content,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        author: note.author,
      },
    };
  } catch (e) {
    console.error("Add note failed:", e);
    return { success: false, error: "Failed to save note." };
  }
}
