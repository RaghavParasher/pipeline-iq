import type { Metadata } from "next";
import { getPipelineAnalytics } from "@/server/actions/analytics";
import { AnalyticsDashboardClient } from "./analytics-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Revenue Forecasting — PipelineIQ",
  description: "Weighted pipeline forecasting, stage funnel analytics, and win rate metrics.",
};

export default async function AnalyticsPage() {
  const analytics = await getPipelineAnalytics();

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-slate-500">Unable to load analytics. Please sign in.</p>
      </div>
    );
  }

  return <AnalyticsDashboardClient data={analytics} />;
}
