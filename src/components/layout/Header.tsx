/**
 * Header Component
 * Top navigation bar with breadcrumbs, coin widget, and user menu
 */

'use client';

import { usePathname } from 'next/navigation';
import { Menu, Bell, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserMenu } from '@/components/navigation/UserMenu';
import { CoinBalanceWidget } from '@/components/widgets/CoinBalanceWidget';
import { useAdmin } from '@/hooks/useAdmins';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface HeaderProps {
  onMenuClick?: () => void;
}

interface BreadcrumbSegment {
  label: string;
  href: string;
  isLast: boolean;
}

// UUID pattern detection
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function generateBreadcrumbs(pathname: string, adminName?: string | null): BreadcrumbSegment[] {
  const segments = pathname.split('/').filter(Boolean);

  return segments
    .map((segment, index) => {
      // Check if this is the last segment and it's a UUID (likely an ID)
      const isLast = index === segments.length - 1;
      const isUUID = UUID_PATTERN.test(segment);
      
      // If this is a UUID and we're on the last segment, only include if we have admin name
      if (isLast && isUUID) {
        if (adminName) {
          // Use admin name if available
          return {
            label: adminName,
            href: '/' + segments.slice(0, index + 1).join('/'),
            isLast: true,
          };
        } else {
          // Skip this segment if name is not available yet
          return null;
        }
      }
      
      // Format segment for display
      const label = segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        label,
        href: '/' + segments.slice(0, index + 1).join('/'),
        isLast: isLast && !isUUID, // Only mark as last if it's not a UUID
      };
    })
    .filter((segment): segment is BreadcrumbSegment => segment !== null);
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  
  // Extract admin ID from pathname if we're on admin detail page
  const segments = pathname.split('/').filter(Boolean);
  const isAdminDetailPage = segments[0] === 'super-admin' && segments[1] === 'admins' && segments[2];
  const adminId = isAdminDetailPage && UUID_PATTERN.test(segments[2]) ? segments[2] : '';
  
  // Fetch admin data if we're on detail page
  const { data: adminData } = useAdmin(adminId);
  
  // Extract admin name
  const admin = adminData?.data || (adminData as any);
  const adminName = admin?.name || admin?.profile?.name || null;
  
  const breadcrumbs = generateBreadcrumbs(pathname, adminName);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Breadcrumbs */}
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center">
              {index > 0 && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
              )}
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Coin Balance Widget (ADMIN only) */}
        <CoinBalanceWidget />

        {/* Notification Bell */}
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
          >
            0
          </Badge>
        </Button>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
