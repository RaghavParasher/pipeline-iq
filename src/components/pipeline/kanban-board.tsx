"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn, formatCurrency } from "@/lib/utils";
import { type PipelineStageWithDeals, type DealCardData } from "@/types";
import { DealCard } from "./deal-card";
import { updateDealStage } from "@/server/actions/deals";
import { toast } from "sonner";
import { Plus, Sparkles, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanBoardProps {
  initialStages: PipelineStageWithDeals[];
  onSelectDeal: (deal: DealCardData) => void;
  onCreateDealInStage?: (stageId: string) => void;
}

export function KanbanBoard({
  initialStages,
  onSelectDeal,
  onCreateDealInStage,
}: KanbanBoardProps) {
  const [stages, setStages] = React.useState<PipelineStageWithDeals[]>(initialStages);
  const [activeDeal, setActiveDeal] = React.useState<DealCardData | null>(null);

  // Sync state if initialStages prop refreshes from server revalidation
  React.useEffect(() => {
    setStages(initialStages);
  }, [initialStages]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires 5px movement before drag activates (so click events work cleanly)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const activeData = active.data.current;
    if (activeData?.type === "DEAL" && activeData.deal) {
      setActiveDeal(activeData.deal as DealCardData);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const activeDealId = active.id as string;
    const overId = over.id as string;

    // Find current stage containing activeDeal
    let sourceStageIndex = -1;
    let dealObj: DealCardData | null = null;

    stages.forEach((stage, sIdx) => {
      const found = stage.deals.find((d) => d.id === activeDealId);
      if (found) {
        sourceStageIndex = sIdx;
        dealObj = found;
      }
    });

    if (sourceStageIndex === -1 || !dealObj) return;

    // Determine target stage: if over overId matches a stage.id or overId matches a deal inside a stage
    let targetStageIndex = -1;
    stages.forEach((stage, sIdx) => {
      if (stage.id === overId || stage.deals.some((d) => d.id === overId)) {
        targetStageIndex = sIdx;
      }
    });

    if (targetStageIndex === -1 || sourceStageIndex === targetStageIndex) return;

    const sourceStage = stages[sourceStageIndex];
    const targetStage = stages[targetStageIndex];

    // --- Optimistic UI Update ---
    const previousStages = [...stages];
    const safeDeal = dealObj as DealCardData;
    const updatedDeal: DealCardData = {
      ...safeDeal,
      stageId: targetStage.id,
      probability: targetStage.defaultProbability,
    };

    const newStages = stages.map((stage) => {
      if (stage.id === sourceStage.id) {
        const remainingDeals = stage.deals.filter((d) => d.id !== activeDealId);
        return {
          ...stage,
          deals: remainingDeals,
          totalValue: remainingDeals.reduce((acc, curr) => acc + curr.value, 0),
          weightedValue: remainingDeals.reduce(
            (acc, curr) => acc + curr.value * (stage.defaultProbability / 100),
            0
          ),
        };
      }
      if (stage.id === targetStage.id) {
        const newDeals = [updatedDeal, ...stage.deals];
        return {
          ...stage,
          deals: newDeals,
          totalValue: newDeals.reduce((acc, curr) => acc + curr.value, 0),
          weightedValue: newDeals.reduce(
            (acc, curr) => acc + curr.value * (stage.defaultProbability / 100),
            0
          ),
        };
      }
      return stage;
    });

    setStages(newStages);

    // Call server action
    const res = await updateDealStage({
      dealId: activeDealId,
      newStageId: targetStage.id,
      newProbability: targetStage.defaultProbability,
    });

    if (!res.success) {
      // Rollback on error
      setStages(previousStages);
      toast.error(res.error || "Failed to move deal across stages.");
    } else {
      toast.success(
        `Moved "${safeDeal.title}" to ${targetStage.name} (${targetStage.defaultProbability}%)`
      );
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full min-h-[750px] w-full items-start space-x-4 overflow-x-auto pb-6 pt-2">
        {stages.map((stage) => {
          const dealIds = stage.deals.map((d) => d.id);

          return (
            <div
              key={stage.id}
              className="flex max-h-full w-80 shrink-0 flex-col rounded-2xl border border-slate-200/80 bg-slate-100/70 p-3 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/50"
            >
              {/* Column Header */}
              <div className="flex flex-col space-y-1.5 pb-3 pt-1 px-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {stage.name}
                    </h3>
                    <span className="flex h-5 items-center justify-center rounded-full bg-slate-200 px-2 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {stage.deals.length}
                    </span>
                  </div>

                  {onCreateDealInStage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 dark:hover:bg-slate-800"
                      onClick={() => onCreateDealInStage(stage.id)}
                      title="Quick Add Deal to Stage"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Revenue Totals Header */}
                <div className="flex items-center justify-between rounded-lg bg-white/80 px-2.5 py-1.5 border border-slate-200/60 dark:bg-slate-950/60 dark:border-slate-800/60">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium uppercase text-slate-400 dark:text-slate-500">
                      Total Stage
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {formatCurrency(stage.totalValue || 0)}
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="flex items-center space-x-0.5 text-[10px] font-medium uppercase text-indigo-600 dark:text-indigo-400">
                      <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                      Forecast ({stage.defaultProbability}%)
                    </span>
                    <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300">
                      {formatCurrency(stage.weightedValue || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Column Cards Container (`dnd-kit/SortableContext`) */}
              <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
                <div className="flex flex-1 flex-col space-y-2.5 overflow-y-auto px-0.5 min-h-[120px]">
                  {stage.deals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-8 text-center dark:border-slate-800">
                      <AlertCircle className="h-6 w-6 text-slate-300 dark:text-slate-600 mb-1" />
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        No deals in {stage.name}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Drag cards here
                      </span>
                    </div>
                  ) : (
                    stage.deals.map((deal) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        onSelectDeal={onSelectDeal}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      {/* Drag Overlay for smooth dragging preview */}
      <DragOverlay>
        {activeDeal ? (
          <div className="w-80">
            <DealCard deal={activeDeal} onSelectDeal={() => {}} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
