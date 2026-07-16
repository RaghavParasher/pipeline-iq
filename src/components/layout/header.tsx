"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Moon, Sun, Search, ShieldAlert } from "lucide-react";
import { useTheme } from "next-themes";

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
  onOpenCommandPalette: () => void;
}

export function Header({ user, onOpenCommandPalette }: HeaderProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Generate breadcrumb title from pathname
  const routeName = React.useMemo(() => {
    if (pathname.includes("/pipeline")) return "Pipeline Board";
    if (pathname.includes("/deals")) return "Dense Deals Table";
    if (pathname.includes("/analytics")) return "Revenue & Forecasting";
    return "Dashboard";
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center space-x-4">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Acme RevOps</span>
            <span>/</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {routeName}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Role Notice */}
        {user?.role === "ADMIN" && (
          <div className="hidden items-center space-x-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 sm:flex">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Admin Access Enforced</span>
          </div>
        )}

        {/* Search button trigger for mobile/desktop */}
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 text-xs text-slate-500 dark:text-slate-400"
          onClick={onOpenCommandPalette}
        >
          <Search className="mr-2 h-3.5 w-3.5" />
          <span>Search</span>
          <kbd className="ml-2 hidden rounded border bg-slate-100 px-1 font-mono text-[10px] dark:bg-slate-800 sm:inline-block">
            ⌘K
          </kbd>
        </Button>

        {/* Theme switcher */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Toggle Dark Mode"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Sign Out */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 text-xs text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="mr-1.5 h-3.5 w-3.5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
