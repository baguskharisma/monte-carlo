/**
 * Sidebar Menu Component
 * Renders navigation menu items based on user role
 */

'use client';

import { useUser } from '@/stores/auth.store';
import { getMenuItems } from '@/config/menus';
import { SidebarMenuItem } from './SidebarMenuItem';

interface SidebarMenuProps {
  isCollapsed?: boolean;
}

export function SidebarMenu({ isCollapsed = false }: SidebarMenuProps) {
  const user = useUser();

  if (!user) {
    return null;
  }

  const menuItems = getMenuItems(user.role);

  return (
    <nav className="flex flex-col gap-1 p-2">
      {menuItems.map((item) => (
        <SidebarMenuItem
          key={item.href}
          icon={item.icon}
          label={item.label}
          href={item.href}
          badge={item.badge}
          isCollapsed={isCollapsed}
        />
      ))}
    </nav>
  );
}
