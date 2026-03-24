/**
 * Auth Layout
 * Centered card layout for authentication pages
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - Monte Carlo',
  description: 'Login to Monte Carlo',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md px-4">
        {/* Logo/Brand Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Monte Carlo
          </h1>
        </div>

        {/* Auth Card */}
        <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
          © {new Date().getFullYear()} Monte Carlo. All rights reserved.
        </p>
      </div>
    </div>
  );
}
