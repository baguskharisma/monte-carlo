/**
 * Menu Configuration
 * Role-based navigation menus for the dashboard
 */

import {
  LayoutDashboard,
  Users,
  Coins,
  MapPin,
  Car,
  UserCheck,
  Receipt,
  FileText,
  History,
  BarChart3,
  Ticket,
  CalendarDays,
  ImageIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '@/types/user.types';

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string | number;
}

export type MenuConfig = Record<UserRole, MenuItem[]>;

/**
 * Navigation menu configuration for each role
 */
export const MENU_CONFIG: MenuConfig = {
  SUPER_ADMIN: [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/super-admin/dashboard',
    },
    {
      icon: Users,
      label: 'Admin Management',
      href: '/super-admin/admins',
    },
    {
      icon: Coins,
      label: 'Coin Requests',
      href: '/super-admin/coin-requests',
    },
    {
      icon: MapPin,
      label: 'Routes',
      href: '/super-admin/routes',
    },
    {
      icon: Car,
      label: 'Vehicles',
      href: '/super-admin/vehicles',
    },
    {
      icon: UserCheck,
      label: 'Drivers',
      href: '/super-admin/drivers',
    },
    {
      icon: Users,
      label: 'Customers',
      href: '/super-admin/customers',
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      href: '/super-admin/analytics/revenue',
    },
  ],

  ADMIN: [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/admin/dashboard',
    },
    {
      icon: ImageIcon,
      label: 'Payment Proofs',
      href: '/admin/payment-proofs',
      badge: 'Priority',
    },
    {
      icon: CalendarDays,
      label: 'Schedules',
      href: '/admin/schedules',
    },
    {
      icon: Ticket,
      label: 'Tickets',
      href: '/admin/tickets',
    },
    {
      icon: FileText,
      label: 'Travel Documents',
      href: '/admin/travel-documents',
    },
    {
      icon: Coins,
      label: 'Coin Balance',
      href: '/admin/coins/balance',
    },
    {
      icon: Receipt,
      label: 'Coin Transactions',
      href: '/admin/coins/transactions',
    },
  ],

  DRIVER: [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/driver/dashboard',
    },
    {
      icon: Car,
      label: 'My Trips',
      href: '/driver/trips',
    },
    {
      icon: History,
      label: 'Trip History',
      href: '/driver/trip-history',
    },
  ],

  // Customer role (not used in admin panel, but required for type completion)
  CUSTOMER: [],
};

/**
 * Get menu items for a specific role
 */
export function getMenuItems(role: UserRole): MenuItem[] {
  return MENU_CONFIG[role] || [];
}
