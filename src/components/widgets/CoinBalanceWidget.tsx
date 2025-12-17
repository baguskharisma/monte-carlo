/**
 * Coin Balance Widget Component
 * Displays admin's coin balance in the header
 */

'use client';

import Link from 'next/link';
import { Coins } from 'lucide-react';
import { useUser } from '@/stores/auth.store';
import { isAdmin } from '@/types/user.types';
import type { Admin } from '@/types/user.types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function CoinBalanceWidget() {
  const user = useUser();

  // Only show for admin users
  if (!user || !isAdmin(user)) {
    return null;
  }

  const adminUser = user as Admin;
  const coinBalance = adminUser.profile?.coinBalance ?? 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/admin/coins/balance"
            className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Coins className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold">
                {coinBalance.toLocaleString()}
              </span>
              <span className="hidden text-xs text-muted-foreground md:inline">
                Coins
              </span>
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Manage your coin balance</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
