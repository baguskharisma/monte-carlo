'use client';

import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/api-types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  FileText,
  Car,
  Route,
  Users,
  DollarSign,
  Settings,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Award,
  Package,
  BarChart3,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
  badge?: string;
  superAdminOnly?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  // Admin & Super Admin
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    label: 'Schedules',
    href: '/admin/schedules',
    icon: <Calendar className="w-5 h-5" />,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    label: 'Tickets',
    href: '/admin/tickets',
    icon: <Ticket className="w-5 h-5" />,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    label: 'Travel Documents',
    href: '/admin/documents',
    icon: <FileText className="w-5 h-5" />,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    label: 'Vehicles',
    href: '/admin/vehicles',
    icon: <Car className="w-5 h-5" />,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    label: 'Routes',
    href: '/admin/routes',
    icon: <Route className="w-5 h-5" />,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    label: 'Manage Users',
    href: '/admin/users',
    icon: <Users className="w-5 h-5" />,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    superAdminOnly: true,
  },
  {
    label: 'Coin Management',
    href: '/admin/coins',
    icon: <DollarSign className="w-5 h-5" />,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    label: 'Payment Proofs',
    href: '/admin/payment-proofs',
    icon: <CheckCircle className="w-5 h-5" />,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    badge: '5',
  },
  {
    label: 'Reports',
    href: '/admin/reports',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  },
  {
    label: 'System Settings',
    href: '/admin/settings',
    icon: <Settings className="w-5 h-5" />,
    roles: [UserRole.SUPER_ADMIN],
    superAdminOnly: true,
  },

  // Driver
  {
    label: 'Dashboard',
    href: '/driver/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: [UserRole.DRIVER],
  },
  {
    label: 'My Trips',
    href: '/driver/trips',
    icon: <MapPin className="w-5 h-5" />,
    roles: [UserRole.DRIVER],
  },
  {
    label: 'Schedule',
    href: '/driver/schedule',
    icon: <Calendar className="w-5 h-5" />,
    roles: [UserRole.DRIVER],
  },
  {
    label: 'Performance',
    href: '/driver/performance',
    icon: <Award className="w-5 h-5" />,
    roles: [UserRole.DRIVER],
  },
  {
    label: 'Report Issue',
    href: '/driver/issues',
    icon: <AlertTriangle className="w-5 h-5" />,
    roles: [UserRole.DRIVER],
  },

  // Customer
  {
    label: 'Dashboard',
    href: '/customer/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: [UserRole.CUSTOMER],
  },
  {
    label: 'Book Ticket',
    href: '/customer/book',
    icon: <Ticket className="w-5 h-5" />,
    roles: [UserRole.CUSTOMER],
  },
  {
    label: 'My Bookings',
    href: '/customer/bookings',
    icon: <Package className="w-5 h-5" />,
    roles: [UserRole.CUSTOMER],
  },
  {
    label: 'Travel Documents',
    href: '/customer/documents',
    icon: <FileText className="w-5 h-5" />,
    roles: [UserRole.CUSTOMER],
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { role, isSuperAdmin, hasAnyRole } = useAuth();

  // Filter menu items based on user role
  const filteredMenuItems = MENU_ITEMS.filter((item) => {
    // Check if user has required role
    if (!hasAnyRole(item.roles)) return false;

    // Check super admin only items
    if (item.superAdminOnly && !isSuperAdmin) return false;

    return true;
  });

  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">Travel App</span>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="text-xs text-gray-600 mb-1">Current Role</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-semibold text-sm text-gray-900">
              {role === UserRole.SUPER_ADMIN && 'Super Admin'}
              {role === UserRole.ADMIN && 'Admin'}
              {role === UserRole.DRIVER && 'Driver'}
              {role === UserRole.CUSTOMER && 'Customer'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => onClose()}
                  className={cn(
                    'flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'transition-colors',
                        isActive(item.href) ? 'text-blue-600' : 'text-gray-500'
                      )}
                    >
                      {item.icon}
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </div>

                  {/* Badge */}
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">
                      {item.badge}
                    </span>
                  )}

                  {/* Super Admin badge */}
                  {item.superAdminOnly && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      SA
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50">
            <Settings className="w-5 h-5 text-gray-500" />
            <Link
              href="/profile/settings"
              className="text-sm text-gray-700 hover:text-gray-900 font-medium"
            >
              Settings
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
