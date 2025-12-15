'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  className?: string;
  customItems?: BreadcrumbItem[];
}

// Custom labels for common routes
const ROUTE_LABELS: Record<string, string> = {
  // Admin routes
  admin: 'Admin',
  dashboard: 'Dashboard',
  schedules: 'Schedules',
  tickets: 'Tickets',
  documents: 'Travel Documents',
  vehicles: 'Vehicles',
  routes: 'Routes',
  users: 'Users',
  coins: 'Coin Management',
  'payment-proofs': 'Payment Proofs',
  reports: 'Reports',
  settings: 'Settings',

  // Driver routes
  driver: 'Driver',
  trips: 'My Trips',
  schedule: 'Schedule',
  performance: 'Performance',
  issues: 'Report Issue',

  // Customer routes
  customer: 'Customer',
  book: 'Book Ticket',
  bookings: 'My Bookings',

  // Common routes
  profile: 'Profile',
  notifications: 'Notifications',
  create: 'Create',
  edit: 'Edit',
};

export default function Breadcrumb({ className, customItems }: BreadcrumbProps) {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems;

    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Build breadcrumb items
    paths.forEach((path, index) => {
      const href = '/' + paths.slice(0, index + 1).join('/');
      const label = ROUTE_LABELS[path] || formatLabel(path);

      breadcrumbs.push({ label, href });
    });

    return breadcrumbs;
  };

  // Format label from path segment (fallback)
  const formatLabel = (segment: string): string => {
    // Handle IDs (numbers or UUIDs)
    if (/^\d+$/.test(segment) || /^[0-9a-f-]{36}$/i.test(segment)) {
      return `#${segment.substring(0, 8)}`;
    }

    // Format kebab-case to Title Case
    return segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumb on home page
  if (pathname === '/' || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className={cn('flex items-center gap-2 text-sm', className)} aria-label="Breadcrumb">
      {/* Home link */}
      <Link
        href="/"
        className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {/* Breadcrumb items */}
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <div key={item.href} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />

            {isLast ? (
              <span className="font-medium text-gray-900 truncate max-w-[200px]">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-600 hover:text-gray-900 transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

// Helper component for custom breadcrumb usage
export function CustomBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return <Breadcrumb customItems={items} />;
}
