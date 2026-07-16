"use client";

import * as React from "react";
import { type PipelineAnalyticsData } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Target, Activity } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, FunnelChart, Funnel, LabelList, Cell
} from "recharts";

const STAGE_COLORS = ["#64748b", "#3b82f6", "#6366f1", "#f59e0b", "#10b981", "#f43f5e"];

export function AnalyticsDashboardClient({ data }: { data: PipelineAnalyticsData }) {
  const kpis = [
    {
      label: "Total Open Pipeline",
      value: formatCurrency(data.totalOpenValue),
      icon: TrendingUp,
      accent: false,
      sub: `${data.totalDealsCount} total deals tracked`,
    },
    {
      label: "Weighted Forecast",
      value: formatCurrency(data.weightedForecastValue),
      icon: Target,
      accent: true,
      sub: "probability-adjusted revenue",
    },
    {
      label: "Win Rate",
      value: `${data.averageWinRate}%`,
      icon: Activity,
      accent: false,
      sub: "based on closed deals",
    },
    {
      label: "Forecast Coverage",
      value: data.totalOpenValue > 0
        ? `${Math.round((data.weightedForecastValue / data.totalOpenValue) * 100)}%`
        : "0%",
      icon: BarChart3,
      accent: false,
      sub: "weighted / total pipeline",
    },
  ];

  const barData = data.stageBreakdown
    .filter(s => s.dealCount > 0)
    .map(s => ({
      name: s.stageName,
      "Total Value": Math.round(s.totalValue / 1000),
      "Weighted": Math.round(s.weightedValue / 1000),
    }));

  const funnelData = data.stageBreakdown
    .filter(s => s.dealCount > 0)
    .map((s, i) => ({
      name: s.stageName,
      value: s.dealCount,
      fill: STAGE_COLORS[i % STAGE_COLORS.length],
    }));

  return (
    <div className="flex flex-col space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/60">
          <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Revenue Forecasting</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Weighted pipeline analytics and stage conversion metrics
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.label}
              className={kpi.accent ? "border-indigo-200 bg-indigo-50/60 dark:border-indigo-900/50 dark:bg-indigo-950/30" : ""}
            >
              <CardContent className="pt-5">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {kpi.label}
                  </span>
                  <Icon className={`h-4 w-4 ${kpi.accent ? "text-indigo-500" : "text-slate-400"}`} />
                </div>
                <div className={`text-2xl font-extrabold tracking-tight ${kpi.accent ? "text-indigo-700 dark:text-indigo-300" : "text-slate-900 dark:text-white"}`}>
                  {kpi.value}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{kpi.sub}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bar Chart — Stage Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold">Stage Revenue Breakdown</CardTitle>
            <p className="text-xs text-slate-500">Total vs Weighted ($k) per stage</p>
          </CardHeader>
          <CardContent>
            {barData.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-slate-500">No open deal data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} unit="k" />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                    formatter={(value) => [`$${value}k`, undefined]}
                  />
                  <Bar dataKey="Total Value" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.85} />
                  <Bar dataKey="Weighted" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Funnel Chart — Deal Count per Stage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold">Pipeline Funnel</CardTitle>
            <p className="text-xs text-slate-500">Deal count per stage</p>
          </CardHeader>
          <CardContent>
            {funnelData.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-slate-500">No stage data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <FunnelChart>
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                    formatter={(value) => [`${value} deals`, undefined]}
                  />
                  <Funnel dataKey="value" data={funnelData} isAnimationActive>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList position="right" fill="#64748b" stroke="none" dataKey="name" style={{ fontSize: 11 }} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stage Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold">Stage-by-Stage Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Stage</th>
                  <th className="py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Deals</th>
                  <th className="py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Total Value</th>
                  <th className="py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Weighted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.stageBreakdown.map((stage, i) => (
                  <tr key={stage.stageId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STAGE_COLORS[i % STAGE_COLORS.length] }} />
                        <span className="font-medium text-slate-900 dark:text-white">{stage.stageName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono text-slate-600 dark:text-slate-400">{stage.dealCount}</td>
                    <td className="py-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(stage.totalValue)}</td>
                    <td className="py-3 text-right font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(stage.weightedValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
