import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PipelineIQ — Enterprise B2B Revenue Pipeline & Forecasting",
    template: "%s | PipelineIQ",
  },
  description:
    "PipelineIQ is a high-density Kanban deal pipeline with weighted revenue forecasting, row-level RBAC, and an AI deal-risk copilot for modern B2B sales teams.",
  keywords: ["CRM", "sales pipeline", "revenue forecasting", "deal management", "B2B sales"],
  authors: [{ name: "PipelineIQ Contributors" }],
  openGraph: {
    title: "PipelineIQ — Enterprise B2B Revenue Pipeline",
    description:
      "Weighted forecasting, optimistic Kanban drag-and-drop, row-level RBAC, and AI deal-risk copilot.",
    type: "website",
    locale: "en_US",
    siteName: "PipelineIQ",
  },
  twitter: {
    card: "summary_large_image",
    title: "PipelineIQ — Enterprise B2B Revenue Pipeline",
    description: "Weighted forecasting, Kanban pipeline, RBAC & AI deal-risk copilot.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
