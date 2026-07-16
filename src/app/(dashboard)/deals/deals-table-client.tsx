"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type DealCardData, type PipelineStageWithDeals } from "@/types";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DealDrawer } from "@/components/deals/deal-drawer";
import {
  Search, TableProperties, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, AlertCircle, ListFilter
} from "lucide-react";

interface DealsTableClientProps {
  deals: (DealCardData & { stage?: { id: string; name: string; colorToken: string } })[];
  stages: PipelineStageWithDeals[];
  total: number;
  pages: number;
  currentPage: number;
  currentFilters: {
    query: string;
    stageId: string;
    status: string;
    sortBy: string;
    sortOrder: string;
  };
}

export function DealsTableClient({
  deals, stages, total, pages, currentPage, currentFilters
}: DealsTableClientProps) {
  const router = useRouter();
  const [selectedDealId, setSelectedDealId] = React.useState<string | null>(null);
  const [searchInput, setSearchInput] = React.useState(currentFilters.query);
  const searchTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateFilters(updates: Record<string, string>) {
    const params = new URLSearchParams({
      query: currentFilters.query,
      stageId: currentFilters.stageId,
      status: currentFilters.status,
      sortBy: currentFilters.sortBy,
      sortOrder: currentFilters.sortOrder,
      page: "1",
      ...updates,
    });
    // Remove defaults to keep URL clean
    if (params.get("stageId") === "ALL") params.delete("stageId");
    if (params.get("status") === "ALL") params.delete("status");
    if (params.get("query") === "") params.delete("query");
    router.push(`/deals?${params.toString()}`);
  }

  // Debounced search — 300ms
  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      updateFilters({ query: value });
    }, 300);
  }

  function handleSort(column: string) {
    const newOrder =
      currentFilters.sortBy === column && currentFilters.sortOrder === "asc" ? "desc" : "asc";
    updateFilters({ sortBy: column, sortOrder: newOrder });
  }

  function SortIndicator({ column }: { column: string }) {
    if (currentFilters.sortBy !== column) return <ChevronUp className="h-3 w-3 opacity-30" />;
    return currentFilters.sortOrder === "asc"
      ? <ChevronUp className="h-3 w-3 text-indigo-600" />
      : <ChevronDown className="h-3 w-3 text-indigo-600" />;
  }

  const hasActiveFilters = currentFilters.query || currentFilters.stageId !== "ALL" || currentFilters.status !== "ALL";

  return (
    <div className="flex flex-col space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/60">
            <TableProperties className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Deals Table</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {total} deals{hasActiveFilters ? " (filtered)" : " total"}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search deals or accounts..."
            className="pl-9 h-9 text-sm"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Stage Filter */}
        <select
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={currentFilters.stageId}
          onChange={(e) => updateFilters({ stageId: e.target.value })}
        >
          <option value="ALL">All Stages</option>
          {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        {/* Status Filter */}
        <select
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={currentFilters.status}
          onChange={(e) => updateFilters({ status: e.target.value })}
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="WON">Won</option>
          <option value="LOST">Lost</option>
        </select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs text-slate-500"
            onClick={() => {
              setSearchInput("");
              router.push("/deals");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
        {deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="mb-3 h-8 w-8 text-slate-300 dark:text-slate-700" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {hasActiveFilters ? "No deals match these filters" : "No deals yet"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {hasActiveFilters ? (
                <button className="text-indigo-600 hover:underline" onClick={() => router.push("/deals")}>
                  Clear all filters →
                </button>
              ) : "Create your first deal from the Pipeline Board."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40">
                  <th className="px-4 py-3 text-left">
                    <button
                      className="flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      onClick={() => handleSort("title")}
                    >
                      <span>Deal</span>
                      <SortIndicator column="title" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Stage</th>
                  <th className="px-4 py-3 text-right">
                    <button
                      className="flex items-center space-x-1 ml-auto text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      onClick={() => handleSort("value")}
                    >
                      <span>Value</span>
                      <SortIndicator column="value" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Prob.</th>
                  <th className="px-4 py-3 text-left">
                    <button
                      className="flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      onClick={() => handleSort("expectedCloseDate")}
                    >
                      <span>Close Date</span>
                      <SortIndicator column="expectedCloseDate" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Owner</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {deals.map((deal) => (
                  <tr
                    key={deal.id}
                    className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    onClick={() => setSelectedDealId(deal.id)}
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white line-clamp-1 max-w-[250px]">
                        {deal.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{deal.account.name}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {(deal as unknown as {stage?: {name: string}}).stage?.name || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(deal.value)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge
                        variant={deal.probability >= 80 ? "success" : deal.probability >= 50 ? "default" : "secondary"}
                        className="font-mono text-[11px]"
                      >
                        {deal.probability}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                      {formatDate(deal.expectedCloseDate)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center space-x-1.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                          {deal.owner.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {deal.owner.fullName.split(" ")[0]}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge
                        variant={deal.status === "WON" ? "success" : deal.status === "LOST" ? "destructive" : "secondary"}
                        className="text-[10px]"
                      >
                        {deal.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-xs text-slate-500">
            Page {currentPage} of {pages} · {total} deals total
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              disabled={currentPage <= 1}
              onClick={() => updateFilters({ page: String(currentPage - 1) })}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              disabled={currentPage >= pages}
              onClick={() => updateFilters({ page: String(currentPage + 1) })}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Deal Drawer */}
      <DealDrawer dealId={selectedDealId} onClose={() => setSelectedDealId(null)} />
    </div>
  );
}
