"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Kanban, TableProperties, BarChart3, Building2, Sparkles, Plus } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  deals?: { id: string; title: string; value: number; account: { name: string } }[];
  onCreateDeal?: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  deals = [],
  onCreateDeal,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  // Close on Esc
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredDeals = query.trim() === ""
    ? deals.slice(0, 5)
    : deals.filter((d) =>
        d.title.toLowerCase().includes(query.toLowerCase()) ||
        d.account.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);

  const quickLinks = [
    { name: "Go to Pipeline Board", href: "/pipeline", icon: Kanban },
    { name: "Go to Dense Deals Table", href: "/deals", icon: TableProperties },
    { name: "Go to Revenue Forecasting", href: "/analytics", icon: BarChart3 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-4 pt-20 backdrop-blur-sm dark:bg-slate-950/80">
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 mr-3" />
          <input
            type="text"
            placeholder="Search deals, accounts, or navigation links..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500"
            autoFocus
          />
          <kbd className="hidden rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800 sm:inline-block">
            Esc to close
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Quick Actions */}
          {onCreateDeal && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Quick Actions
              </div>
              <button
                onClick={() => {
                  onClose();
                  onCreateDeal();
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
              >
                <div className="flex items-center space-x-3">
                  <Plus className="h-4 w-4" />
                  <span>Create New Deal...</span>
                </div>
                <span className="text-xs text-indigo-500 font-mono">Action</span>
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Navigation
            </div>
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.href}
                  onClick={() => {
                    router.push(link.href);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4 text-slate-400" />
                    <span>{link.name}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Route</span>
                </button>
              );
            })}
          </div>

          {/* Deal Matches */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {query.trim() === "" ? "Recent Deals" : "Matching Deals"}
            </div>
            {filteredDeals.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-slate-500">
                No deals found matching &ldquo;{query}&rdquo;.
              </div>
            ) : (
              filteredDeals.map((deal) => (
                <button
                  key={deal.id}
                  onClick={() => {
                    router.push(`/pipeline?dealId=${deal.id}`);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-900 truncate dark:text-slate-100">
                      {deal.title}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {deal.account.name}
                    </span>
                  </div>
                  <span className="shrink-0 font-bold text-indigo-600 dark:text-indigo-400 ml-3">
                    {formatCurrency(deal.value)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>PipelineIQ Command Palette</span>
          </div>
          <span>Use arrow keys or click to select</span>
        </div>
      </div>
    </div>
  );
}
