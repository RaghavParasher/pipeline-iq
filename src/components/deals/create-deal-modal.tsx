"use client";

import * as React from "react";
import { createDeal } from "@/server/actions/deals";
import { type PipelineStageWithDeals } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultStageId?: string;
  stages: PipelineStageWithDeals[];
}

export function CreateDealModal({ isOpen, onClose, onSuccess, defaultStageId, stages }: CreateDealModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    title: "",
    value: "",
    probability: "50",
    stageId: defaultStageId || stages[0]?.id || "",
    accountId: "",
    accountName: "",
    ownerId: "",
    ownerName: "",
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  React.useEffect(() => {
    if (defaultStageId) setFormData(prev => ({ ...prev, stageId: defaultStageId }));
  }, [defaultStageId]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // We need real account/owner IDs — for demo we'll use a placeholder that the seed provides
    // In production these would be from combobox selectors
    const res = await createDeal({
      title: formData.title,
      value: parseFloat(formData.value),
      probability: parseInt(formData.probability),
      stageId: formData.stageId,
      accountId: formData.accountId || "placeholder",
      ownerId: formData.ownerId || "placeholder",
      expectedCloseDate: formData.expectedCloseDate,
      status: "OPEN",
    });

    if (res.success) {
      toast.success(`Deal "${formData.title}" created successfully!`);
      onSuccess();
      setFormData(prev => ({ ...prev, title: "", value: "", probability: "50" }));
    } else {
      setError(res.error || "Failed to create deal.");
    }
    setIsSubmitting(false);
  }

  const selectedStage = stages.find(s => s.id === formData.stageId);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/60">
                <Plus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">New Deal</span>
              {selectedStage && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                  {selectedStage.name}
                </span>
              )}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            {error && (
              <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="deal-title">Deal Title *</Label>
              <Input
                id="deal-title"
                required
                placeholder="e.g. Acme Corp — Enterprise Tier Expansion"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deal-value">Value ($) *</Label>
                <Input
                  id="deal-value"
                  type="number"
                  required
                  min="1"
                  placeholder="50000"
                  value={formData.value}
                  onChange={e => setFormData(prev => ({ ...prev, value: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deal-probability">Probability (%)</Label>
                <Input
                  id="deal-probability"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={e => setFormData(prev => ({ ...prev, probability: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deal-stage">Pipeline Stage *</Label>
              <select
                id="deal-stage"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-slate-900 dark:border-slate-800"
                value={formData.stageId}
                onChange={e => {
                  const stage = stages.find(s => s.id === e.target.value);
                  setFormData(prev => ({ ...prev, stageId: e.target.value, probability: stage?.defaultProbability.toString() || "50" }));
                }}
              >
                {stages.map(stage => (
                  <option key={stage.id} value={stage.id}>{stage.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deal-close-date">Expected Close Date *</Label>
              <Input
                id="deal-close-date"
                type="date"
                required
                value={formData.expectedCloseDate}
                onChange={e => setFormData(prev => ({ ...prev, expectedCloseDate: e.target.value }))}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.title || !formData.value}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Deal
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
