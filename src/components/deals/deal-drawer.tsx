"use client";

import * as React from "react";
import { getDealDetail } from "@/server/actions/deals";
import { addDealNote } from "@/server/actions/deals";
import { analyzeDealRisk } from "@/server/actions/ai";
import { type DealDetailData } from "@/types";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  X, Building2, User, Calendar, DollarSign, TrendingUp,
  Clock, MessageSquare, Activity, Sparkles, AlertTriangle,
  ChevronRight, Loader2, Send
} from "lucide-react";
import { toast } from "sonner";

interface DealDrawerProps {
  dealId: string | null;
  onClose: () => void;
}

export function DealDrawer({ dealId, onClose }: DealDrawerProps) {
  const [deal, setDeal] = React.useState<DealDetailData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<"details" | "activity" | "ai">("details");
  const [noteContent, setNoteContent] = React.useState("");
  const [isAddingNote, setIsAddingNote] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  // Fetch deal when dealId changes
  React.useEffect(() => {
    if (!dealId) {
      setDeal(null);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    getDealDetail(dealId)
      .then((data) => {
        setDeal(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to load deal details. Please try again.");
        setIsLoading(false);
      });
  }, [dealId]);

  // Close on Escape
  React.useEffect(() => {
    if (!dealId) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dealId, onClose]);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!deal || !noteContent.trim()) return;
    setIsAddingNote(true);
    const res = await addDealNote({ dealId: deal.id, content: noteContent.trim() });
    if (res.success && res.note) {
      setDeal((prev) => prev ? { ...prev, notes: [res.note!, ...prev.notes] } : prev);
      setNoteContent("");
      toast.success("Note added successfully.");
    } else {
      toast.error(res.error || "Failed to add note.");
    }
    setIsAddingNote(false);
  }

  async function handleAnalyzeRisk() {
    if (!deal) return;
    setIsAnalyzing(true);
    const res = await analyzeDealRisk(deal.id);
    if (res.success && res.analysis) {
      setDeal((prev) => prev ? { ...prev, riskAnalysis: {
        riskScore: res.analysis!.riskScore,
        riskLevel: res.analysis!.riskLevel,
        stallDays: res.analysis!.stallDays,
        summary: res.analysis!.summary,
        recommendation: res.analysis!.recommendation,
      }} : prev);
      toast.success("AI Risk analysis complete!");
      setActiveTab("ai");
    } else {
      toast.error(res.error || "AI analysis failed.");
    }
    setIsAnalyzing(false);
  }

  if (!dealId) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/60">
              <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Deal Details</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {isLoading && (
            <div className="space-y-4 p-6">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="grid grid-cols-2 gap-3 pt-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <AlertTriangle className="h-8 w-8 text-rose-400" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{error}</p>
              <Button size="sm" variant="outline" onClick={() => { setError(null); setIsLoading(true); getDealDetail(dealId!).then(setDeal).finally(() => setIsLoading(false)); }}>
                Retry
              </Button>
            </div>
          )}

          {deal && !isLoading && (
            <>
              {/* Deal Title & Stage */}
              <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <h2 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">
                  {deal.title}
                </h2>
                <div className="mt-1.5 flex items-center space-x-2 text-sm">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium text-slate-600 dark:text-slate-300">{deal.account.name}</span>
                  {deal.account.industry && (
                    <span className="text-slate-400 dark:text-slate-500">· {deal.account.industry}</span>
                  )}
                </div>

                {/* Key Metrics Row */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                    <div className="flex items-center space-x-1.5 text-[11px] font-medium text-slate-500">
                      <DollarSign className="h-3 w-3" />
                      <span>Deal Value</span>
                    </div>
                    <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(deal.value)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-indigo-50/80 p-3 dark:bg-indigo-950/40">
                    <div className="flex items-center space-x-1.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                      <TrendingUp className="h-3 w-3" />
                      <span>Probability</span>
                    </div>
                    <div className="mt-1 text-base font-extrabold text-indigo-700 dark:text-indigo-300">
                      {deal.probability}%
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                    <div className="flex items-center space-x-1.5 text-[11px] font-medium text-slate-500">
                      <Calendar className="h-3 w-3" />
                      <span>Close Date</span>
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                      {formatDate(deal.expectedCloseDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Bar */}
              <div className="flex border-b border-slate-200 dark:border-slate-800">
                {(["details", "activity", "ai"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 px-4 py-2.5 text-xs font-semibold capitalize transition-colors",
                      activeTab === tab
                        ? "border-b-2 border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-300"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    )}
                  >
                    {tab === "activity" ? "Audit Trail" : tab === "ai" ? "✨ AI Risk" : "Details & Notes"}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {activeTab === "details" && (
                  <>
                    {/* Contact Info */}
                    {deal.contact && (
                      <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                        <div className="flex items-center space-x-1.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          <User className="h-3 w-3" />
                          <span>Key Contact</span>
                        </div>
                        <div className="font-semibold text-sm text-slate-900 dark:text-white">{deal.contact.fullName}</div>
                        {deal.contact.title && <div className="text-xs text-slate-500">{deal.contact.title}</div>}
                        {deal.contact.email && <div className="text-xs text-indigo-600 dark:text-indigo-400">{deal.contact.email}</div>}
                      </div>
                    )}

                    {/* Owner */}
                    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                      <div className="flex items-center space-x-1.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <User className="h-3 w-3" />
                        <span>Deal Owner</span>
                      </div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-white">{deal.owner.fullName}</div>
                      <div className="text-xs text-slate-500">{deal.owner.email}</div>
                    </div>

                    {/* Notes */}
                    <div>
                      <div className="flex items-center space-x-1.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <MessageSquare className="h-3 w-3" />
                        <span>Deal Notes ({deal.notes.length})</span>
                      </div>

                      {/* Add Note Form */}
                      <form onSubmit={handleAddNote} className="mb-3 flex gap-2">
                        <textarea
                          className="flex-1 resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          rows={2}
                          placeholder="Add a stakeholder note..."
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                        />
                        <Button type="submit" size="icon" className="h-10 w-10 shrink-0 self-end" disabled={isAddingNote || !noteContent.trim()}>
                          {isAddingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        </Button>
                      </form>

                      {deal.notes.length === 0 ? (
                        <div className="rounded-xl border-2 border-dashed border-slate-200 py-8 text-center dark:border-slate-800">
                          <MessageSquare className="mx-auto mb-1.5 h-6 w-6 text-slate-300 dark:text-slate-700" />
                          <p className="text-xs text-slate-500">No notes yet. Add one above.</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {deal.notes.map((note) => (
                            <div key={note.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                              <p className="text-xs text-slate-700 leading-relaxed dark:text-slate-300">{note.content}</p>
                              <div className="mt-1.5 flex items-center space-x-1 text-[11px] text-slate-400">
                                <span>{note.author.fullName}</span>
                                <span>·</span>
                                <span>{formatDate(note.createdAt)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {activeTab === "activity" && (
                  <div>
                    <div className="flex items-center space-x-1.5 pb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      <Activity className="h-3 w-3" />
                      <span>Audit Trail ({deal.activities.length} events)</span>
                    </div>
                    {deal.activities.length === 0 ? (
                      <div className="rounded-xl border-2 border-dashed border-slate-200 py-8 text-center dark:border-slate-800">
                        <Activity className="mx-auto mb-1.5 h-6 w-6 text-slate-300 dark:text-slate-700" />
                        <p className="text-xs text-slate-500">No activity recorded yet.</p>
                      </div>
                    ) : (
                      <div className="relative space-y-3">
                        {deal.activities.map((activity, idx) => (
                          <div key={activity.id} className="flex space-x-3">
                            <div className="relative flex flex-col items-center">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/60">
                                <Activity className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              {idx < deal.activities.length - 1 && (
                                <div className="mt-1 h-full w-px bg-slate-200 dark:bg-slate-800" />
                              )}
                            </div>
                            <div className="flex-1 pb-3">
                              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                {activity.actionType.replace(/_/g, " ")}
                              </p>
                              {activity.newValue && (
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  {activity.oldValue ? `${activity.oldValue} → ` : ""}
                                  {activity.newValue}
                                </p>
                              )}
                              <div className="mt-0.5 flex items-center space-x-1 text-[11px] text-slate-400">
                                <Clock className="h-2.5 w-2.5" />
                                <span>{activity.actor.fullName} · {formatDate(activity.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "ai" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-sm font-bold text-slate-900 dark:text-white">AI DealRisk Copilot</span>
                      </div>
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleAnalyzeRisk} disabled={isAnalyzing}>
                        {isAnalyzing ? <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" />Analyzing...</> : "Re-analyze"}
                      </Button>
                    </div>

                    {!deal.riskAnalysis ? (
                      <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 py-10 text-center dark:border-indigo-900/50 dark:bg-indigo-950/20">
                        <Sparkles className="mx-auto mb-3 h-8 w-8 text-indigo-400" />
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No risk analysis yet</p>
                        <p className="mt-1 text-xs text-slate-500">Click the button above to run AI analysis on this deal.</p>
                        <Button className="mt-4" size="sm" onClick={handleAnalyzeRisk} disabled={isAnalyzing}>
                          {isAnalyzing ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-2 h-3.5 w-3.5" />}
                          Analyze Deal Risk
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Risk Score */}
                        <div className={cn(
                          "rounded-xl border p-4",
                          deal.riskAnalysis.riskLevel === "HIGH"
                            ? "border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/30"
                            : deal.riskAnalysis.riskLevel === "MEDIUM"
                            ? "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30"
                            : "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30"
                        )}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className={cn("h-5 w-5", deal.riskAnalysis.riskLevel === "HIGH" ? "text-rose-600" : deal.riskAnalysis.riskLevel === "MEDIUM" ? "text-amber-600" : "text-emerald-600")} />
                              <span className="font-bold text-sm">{deal.riskAnalysis.riskLevel} RISK</span>
                            </div>
                            <span className={cn("font-extrabold text-2xl", deal.riskAnalysis.riskLevel === "HIGH" ? "text-rose-700 dark:text-rose-400" : deal.riskAnalysis.riskLevel === "MEDIUM" ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400")}>
                              {deal.riskAnalysis.riskScore}/100
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {deal.riskAnalysis.summary}
                          </p>
                          {deal.riskAnalysis.stallDays > 0 && (
                            <div className="mt-2 flex items-center space-x-1 text-[11px] font-medium text-slate-500">
                              <Clock className="h-3 w-3" />
                              <span>Stalled for {deal.riskAnalysis.stallDays} days</span>
                            </div>
                          )}
                        </div>

                        {/* Recommendation */}
                        <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                          <div className="flex items-center space-x-1.5 pb-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                            <ChevronRight className="h-3.5 w-3.5" />
                            <span>Recommended Next Action</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed dark:text-slate-300">
                            {deal.riskAnalysis.recommendation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
