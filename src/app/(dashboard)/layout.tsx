"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useSession } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);

  // Global keyboard listener for Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar
          user={session?.user}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
        <div className="flex min-w-0 flex-1 flex-col md:pl-64">
          <Header
            user={session?.user}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
      <Toaster position="bottom-right" richColors closeButton />
    </ThemeProvider>
  );
}
