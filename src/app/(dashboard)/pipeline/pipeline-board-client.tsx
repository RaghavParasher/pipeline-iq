"use client";

import * as React from "react";
import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { DealDrawer } from "@/components/deals/deal-drawer";
import { CommandPalette } from "@/components/command-palette";
import { CreateDealModal } from "@/components/deals/create-deal-modal";
import { type PipelineStageWithDeals, type DealCardData } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Kanban, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

interface PipelineBoardClientProps {
  initialStages: PipelineStageWithDeals[];
}

export function PipelineBoardClient({ initialStages }: PipelineBoardClientProps) {
  const router = useRouter();
  const [selectedDeal, setSelectedDeal] = React.useState<DealCardData | null>(null);
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [createInStageId, setCreateInStageId] = React.useState<string | undefined>();

  // Global Cmd+K listener
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Flatten all deals for the command palette search
  const allDeals = initialStages.flatMap((s) =>
    s.deals.map((d) => ({ id: d.id, title: d.title, value: d.value, account: d.account }))
  );

  // Calculate total pipeline KPIs from stage data
  const totalOpenValue = initialStages.reduce((acc, s) => acc + (s.totalValue || 0), 0);
  const totalWeightedValue = initialStages.reduce((acc, s) => acc + (s.weightedValue || 0), 0);
  const totalDeals = initialStages.reduce((acc, s) => acc + s.deals.length, 0);

  function handleCreateDealInStage(stageId: string) {
    setCreateInStageId(stageId);
    setIsCreateModalOpen(true);
  }

  function handleCreateDeal() {
    setCreateInStageId(undefined);
    setIsCreateModalOpen(true);
  }

  function handleDealCreated() {
    setIsCreateModalOpen(false);
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col">
      {/* Page Header */}
      <div className="flex flex-col space-y-4 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/60">
              <Kanban className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Deal Pipeline
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Drag cards between stages to update deal progress
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 text-xs"
              onClick={() => router.refresh()}
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button size="sm" className="h-9 gap-2 text-xs" onClick={handleCreateDeal}>
              <Plus className="h-3.5 w-3.5" />
              Add Deal
            </Button>
          </div>
        </div>

        {/* KPI Summary Strip */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Open Pipeline",
              value: `$${(totalOpenValue / 1000).toFixed(0)}k`,
              sub: `${totalDeals} active deals`,
            },
            {
              label: "Weighted Forecast",
              value: `$${(totalWeightedValue / 1000).toFixed(0)}k`,
              sub: "probability-adjusted",
              accent: true,
            },
            {
              label: "Active Stages",
              value: `${initialStages.filter(s => s.deals.length > 0).length}`,
              sub: `of ${initialStages.length} configured`,
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className={`rounded-xl border px-4 py-3 ${
                kpi.accent
                  ? "border-indigo-200 bg-indigo-50/60 dark:border-indigo-900/50 dark:bg-indigo-950/30"
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60"
              }`}
            >
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {kpi.label}
              </div>
              <div
                className={`mt-1 text-2xl font-extrabold tracking-tight ${
                  kpi.accent
                    ? "text-indigo-700 dark:text-indigo-300"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                {kpi.value}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500">{kpi.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      {initialStages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center dark:border-slate-800">
          <Kanban className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-700" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
            No Pipeline Stages
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Run <code className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-slate-800">npm run db:seed</code> to populate demo data.
          </p>
        </div>
      ) : (
        <KanbanBoard
          initialStages={initialStages}
          onSelectDeal={setSelectedDeal}
          onCreateDealInStage={handleCreateDealInStage}
        />
      )}

      {/* Deal Detail Drawer */}
      <DealDrawer
        dealId={selectedDeal?.id ?? null}
        onClose={() => setSelectedDeal(null)}
      />

      {/* Create Deal Modal */}
      <CreateDealModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleDealCreated}
        defaultStageId={createInStageId}
        stages={initialStages}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        deals={allDeals}
        onCreateDeal={handleCreateDeal}
      />
    </div>
  );
}
