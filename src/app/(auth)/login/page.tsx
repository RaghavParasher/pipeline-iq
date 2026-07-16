"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

// Inner component that uses useSearchParams — must be wrapped in Suspense
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/pipeline";
  const urlError = searchParams.get("error");

  const [email, setEmail] = React.useState("demo@demo.com");
  const [password, setPassword] = React.useState("demo1234");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(
    urlError === "CredentialsSignin" ? "Invalid email or password." : null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid credentials. Please verify your email and password.");
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  async function handleQuickDemoSignIn() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await signIn("credentials", {
        email: "demo@demo.com",
        password: "demo1234",
        redirect: false,
      });
      if (res?.error) {
        setError(`Database Error: ${res.error}`);
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Server connection failed. Please check your database connection or Netlify logs.");
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex flex-col items-center space-y-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md dark:bg-indigo-500">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          PipelineIQ RevOps
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Weighted forecasting, row-level RBAC, and AI deal-risk copilot.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/80 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sign in to workspace</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Enter your credentials or use the 1-click reviewer login below.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            {error}
          </div>
        )}

        {/* Quick Demo Login */}
        <div className="rounded-lg bg-indigo-50/70 p-3 border border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/50">
          <div className="flex items-center space-x-1 text-xs font-semibold text-indigo-900 dark:text-indigo-300 mb-1">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Reviewer Zero-Friction Login</span>
          </div>
          <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mb-2">
            Sign in as Admin (<code>demo@demo.com</code>) to evaluate all CRUD &amp; AI features.
          </p>
          <Button
            type="button"
            size="sm"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            onClick={handleQuickDemoSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                1-Click Sign in as Demo Admin
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              Or sign in with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Default: demo1234
              </span>
            </div>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Built for the Digital Heroes Full Stack Developer Trial.
      </p>
    </div>
  );
}

// Outer page wraps LoginForm in Suspense (required by Next.js for useSearchParams)
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <React.Suspense
        fallback={
          <div className="flex flex-col items-center space-y-4">
            <div className="h-12 w-12 animate-pulse rounded-xl bg-indigo-200 dark:bg-indigo-900" />
            <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        }
      >
        <LoginForm />
      </React.Suspense>
    </div>
  );
}
