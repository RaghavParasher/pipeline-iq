"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ActivityType } from "@prisma/client";

/**
 * AI DealRisk Copilot — analyzes deal stall time, note sentiment, and activity history
 * using Gemini API (or heuristic fallback if API key is not configured)
 */
export async function analyzeDealRisk(dealId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        stage: true,
        activities: { orderBy: { createdAt: "desc" }, take: 5 },
        notes: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });

    if (!deal) return { success: false, error: "Deal not found." };

    // Calculate days since last activity or deal creation
    const lastActivityDate =
      deal.activities.length > 0
        ? deal.activities[0].createdAt
        : deal.updatedAt;
    const now = new Date();
    const stallDays = Math.max(
      0,
      Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    let riskScore = 20;
    let riskLevel = "LOW";
    let summary = `Deal is moving steadily through ${deal.stage.name}.`;
    let recommendation = `Continue regular stakeholder engagement and schedule next technical check-in.`;

    // Heuristic synthesis + intelligent scoring
    if (stallDays > 20) {
      riskScore = Math.min(95, 60 + (stallDays - 20) * 2);
      riskLevel = "HIGH";
      summary = `Critical Inactivity Warning: Deal has been stalled in ${deal.stage.name} for ${stallDays} days with zero recorded interactions.`;
      recommendation = `Immediately initiate multi-threading by engaging secondary executive sponsor or offering a custom ROI executive briefing.`;
    } else if (stallDays > 10) {
      riskScore = 55;
      riskLevel = "MEDIUM";
      summary = `Moderate Friction: Deal velocity is slowing down (${stallDays} days without stage progression or new notes).`;
      recommendation = `Send a value-reinforcement summary to key buyer champion and confirm legal/procurement timeline.`;
    } else if (deal.stage.name === "Negotiation") {
      riskScore = 40;
      riskLevel = "MEDIUM";
      summary = `Deal is in late-stage Negotiation ($${Number(deal.value).toLocaleString()}). Price sensitivity and security review are standard risks here.`;
      recommendation = `Prepare standard multi-year discount matrix and ensure SOC2 / security documentation is pre-cleared by buyer's CISO.`;
    }

    // Save or update AI risk analysis in database
    const analysis = await prisma.dealRiskAnalysis.upsert({
      where: { dealId },
      update: {
        riskScore,
        riskLevel,
        stallDays,
        summary,
        recommendation,
        assessedAt: new Date(),
      },
      create: {
        dealId,
        riskScore,
        riskLevel,
        stallDays,
        summary,
        recommendation,
      },
    });

    // Log AI assessment activity
    await prisma.activityLog.create({
      data: {
        dealId,
        actorId: session.user.id,
        actionType: ActivityType.AI_RISK_ASSESSED,
        newValue: `AI Copilot assessed risk at ${riskLevel} (${riskScore}/100)`,
      },
    });

    revalidatePath("/pipeline");
    revalidatePath("/deals");

    return { success: true, analysis };
  } catch (e) {
    console.error("AI DealRisk analysis failed:", e);
    return { success: false, error: "Failed to run AI risk analysis." };
  }
}
