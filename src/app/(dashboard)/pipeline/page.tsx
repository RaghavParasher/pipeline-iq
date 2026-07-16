import type { Metadata } from "next";
import { getPipelineDeals } from "@/server/actions/deals";
import { PipelineBoardClient } from "./pipeline-board-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pipeline Board — PipelineIQ",
  description: "Interactive Kanban deal pipeline with weighted revenue forecasting and optimistic drag-and-drop.",
};

export default async function PipelinePage() {
  const stages = await getPipelineDeals();

  return <PipelineBoardClient initialStages={stages} />;
}
