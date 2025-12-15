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
      </div>
    </div>
  );
}

// Optional: Layout variant without breadcrumb
export function DashboardLayoutNoBreadcrumb({ children }: { children: React.ReactNode }) {
  return <DashboardLayout showBreadcrumb={false}>{children}</DashboardLayout>;
}
