/**
 * Sidebar Component
 * Navigation sidebar with logo and menu
 */

'use client';

import { SidebarMenu } from '@/components/navigation/SidebarMenu';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed?: boolean;
  className?: string;
}

export function Sidebar({ isCollapsed = false, className }: SidebarProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col border-r bg-card',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center border-b px-4">
        {isCollapsed ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-lg font-bold">MC</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-lg font-bold">MC</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-none">
                Monte Carlo
              </span>
              <span className="text-xs text-muted-foreground">Admin Panel</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarMenu isCollapsed={isCollapsed} />
      </div>

      {/* Footer Section (optional) */}
      <div className="border-t p-4">
        {!isCollapsed && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} PT SCUDERIA HIVE DIGITAL
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
