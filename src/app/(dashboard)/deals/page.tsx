import type { Metadata } from "next";
import { getFilteredDeals } from "@/server/actions/deals";
import { getPipelineDeals } from "@/server/actions/deals";
import { DealsTableClient } from "./deals-table-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Deals Table — PipelineIQ",
  description: "Sortable, filterable, paginated deals table with URL-based state and bulk CSV export.",
};

interface DealsPageProps {
  searchParams: Promise<{
    query?: string;
    stageId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
  }>;
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const params = await searchParams;

  const [{ deals, total, pages }, stages] = await Promise.all([
    getFilteredDeals({
      query: params.query,
      stageId: params.stageId,
      status: params.status as "OPEN" | "WON" | "LOST" | undefined,
      sortBy: params.sortBy as "value" | "expectedCloseDate" | "createdAt" | "title" | undefined,
      sortOrder: params.sortOrder as "asc" | "desc" | undefined,
      page: params.page ? parseInt(params.page) : 1,
      limit: 25,
    }),
    getPipelineDeals(),
  ]);

  return (
    <DealsTableClient
      deals={deals}
      stages={stages}
      total={total}
      pages={pages}
      currentPage={params.page ? parseInt(params.page) : 1}
      currentFilters={{
        query: params.query || "",
        stageId: params.stageId || "ALL",
        status: params.status || "ALL",
        sortBy: params.sortBy || "createdAt",
        sortOrder: params.sortOrder || "desc",
      }}
    />
  );
}
