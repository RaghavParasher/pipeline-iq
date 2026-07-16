"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Kanban,
  TableProperties,
  BarChart3,
  Sparkles,
  Search,
  Building2,
} from "lucide-react";

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
    organization?: { name?: string };
  };
  onOpenCommandPalette: () => void;
}

export function Sidebar({ user, onOpenCommandPalette }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Pipeline Board",
      href: "/pipeline",
      icon: Kanban,
      badge: "Kanban",
    },
    {
      name: "Deals Table",
      href: "/deals",
      icon: TableProperties,
      badge: "CRUD",
    },
    {
      name: "Revenue Forecast",
      href: "/analytics",
      icon: BarChart3,
      badge: "AI",
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:flex">
      {/* Org Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
        <Link href="/pipeline" className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs dark:bg-indigo-500">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              PipelineIQ
            </span>
            <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
              RevOps v1.0
            </span>
          </div>
        </Link>
        <Badge variant="secondary" className="text-[10px] font-mono">
          {user?.role || "REP"}
        </Badge>
      </div>

      {/* Org Switcher / Info */}
      <div className="p-3">
        <div className="flex items-center space-x-2.5 rounded-lg border border-slate-200/80 bg-slate-50/80 p-2.5 dark:border-slate-800/80 dark:bg-slate-950/40">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
              {user?.organization?.name || "Acme RevOps Inc."}
            </span>
            <span className="truncate text-[11px] text-slate-500 dark:text-slate-400">
              Enterprise Workspace
            </span>
          </div>
        </div>
      </div>

      {/* Search Shortcut */}
      <div className="px-3 pb-2">
        <button
          onClick={onOpenCommandPalette}
          className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
        >
          <div className="flex items-center space-x-2">
            <Search className="h-3.5 w-3.5" />
            <span>Search deals...</span>
          </div>
          <kbd className="inline-flex h-5 items-center rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-500 shadow-2xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Nav Links */}
      <div className="flex-1 space-y-1 px-3 py-2">
        <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Core Views
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      isActive
                        ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info / User */}
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2 dark:bg-slate-950">
          <div className="flex min-w-0 items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {user?.name?.slice(0, 2).toUpperCase() || "DU"}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                {user?.name || "Demo User"}
              </span>
              <span className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                {user?.email || "demo@demo.com"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
