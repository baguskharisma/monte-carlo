<<<<<<< HEAD
'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Breadcrumb from './Breadcrumb';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  showBreadcrumb?: boolean;
}

export default function DashboardLayout({
  children,
  showBreadcrumb = true,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Navbar */}
        <Navbar onMenuClick={toggleSidebar} />

        {/* Breadcrumb */}
        {showBreadcrumb && (
          <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
            <Breadcrumb />
          </div>
        )}

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
=======
/**
 * Dashboard Layout Component
 * Main layout wrapper with sidebar and header
 */

'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <VisuallyHidden>
            <SheetTitle>Navigation Menu</SheetTitle>
          </VisuallyHidden>
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/40 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
>>>>>>> 44fac76cb1a89256af69385d641ed87f3744a645
      </div>
    </div>
  );
}
<<<<<<< HEAD

// Optional: Layout variant without breadcrumb
export function DashboardLayoutNoBreadcrumb({ children }: { children: React.ReactNode }) {
  return <DashboardLayout showBreadcrumb={false}>{children}</DashboardLayout>;
}
=======
>>>>>>> 44fac76cb1a89256af69385d641ed87f3744a645
