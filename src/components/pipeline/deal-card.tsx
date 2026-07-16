"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { type DealCardData } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Building2,
  User,
  AlertTriangle,
  GripVertical,
  ChevronRight,
} from "lucide-react";

interface DealCardProps {
  deal: DealCardData;
  onSelectDeal: (deal: DealCardData) => void;
  isDragging?: boolean;
}

export function DealCard({ deal, onSelectDeal, isDragging }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: deal.id,
    data: {
      type: "DEAL",
      deal,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const dragging = isDragging || isSortableDragging;

  // Determine risk level badge if present
  const riskLevel = deal.riskAnalysis?.riskLevel;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col rounded-xl border bg-white p-3.5 shadow-xs transition-all hover:border-indigo-400 hover:shadow-md dark:bg-slate-900/90 dark:border-slate-800 dark:hover:border-indigo-500/80",
        dragging &&
          "z-50 rotate-1 scale-105 opacity-90 shadow-2xl ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950 cursor-grabbing"
      )}
    >
      {/* Top Header: Account & Drag Handle */}
      <div className="flex items-center justify-between pb-1.5">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Building2 className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          <span className="truncate max-w-[150px]">{deal.account.name}</span>
        </div>

        <div className="flex items-center space-x-1">
          {riskLevel && (
            <span
              title={`AI Risk Level: ${riskLevel} - ${deal.riskAnalysis?.summary}`}
              className={cn(
                "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase",
                riskLevel === "HIGH"
                  ? "bg-rose-500/15 text-rose-700 border border-rose-500/30 dark:text-rose-400"
                  : riskLevel === "MEDIUM"
                  ? "bg-amber-500/15 text-amber-700 border border-amber-500/30 dark:text-amber-400"
                  : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
              )}
            >
              <AlertTriangle className="mr-0.5 h-2.5 w-2.5" />
              {riskLevel}
            </span>
          )}

          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab rounded p-1 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 active:cursor-grabbing"
            title="Drag to move"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Deal Title */}
      <div
        onClick={() => onSelectDeal(deal)}
        className="cursor-pointer space-y-1 py-1"
      >
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
          {deal.title}
        </h4>
      </div>

      {/* Value & Probability */}
      <div
        onClick={() => onSelectDeal(deal)}
        className="cursor-pointer flex items-baseline justify-between pt-2 pb-2.5 border-b border-slate-100 dark:border-slate-800/80"
      >
        <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
          {formatCurrency(deal.value)}
        </span>
        <Badge
          variant={
            deal.probability >= 80
              ? "success"
              : deal.probability >= 50
              ? "default"
              : "secondary"
          }
          className="text-[10px] font-mono font-bold py-0"
        >
          {deal.probability}%
        </Badge>
      </div>

      {/* Footer Details: Close Date & Owner */}
      <div
        onClick={() => onSelectDeal(deal)}
        className="cursor-pointer flex items-center justify-between pt-2 text-[11px] text-slate-500 dark:text-slate-400"
      >
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(deal.expectedCloseDate)}</span>
        </div>

        <div className="flex items-center space-x-1">
          <User className="h-3 w-3" />
          <span className="truncate max-w-[80px]">
            {deal.owner.fullName.split(" ")[0]}
          </span>
        </div>
      </div>
    </div>
  );
}
