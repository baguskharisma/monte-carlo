'use client';

import { useAuth } from '@/hooks/use-auth';
import { Menu, Bell, Search, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout, role, isSuperAdmin } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: 'Payment Approved',
      message: 'Ticket TKT-20251215-00123 payment verified',
      time: '5 min ago',
      read: false,
    },
    {
      id: 2,
      title: 'New Booking',
      message: 'Customer booked Jakarta - Bandung route',
      time: '15 min ago',
      read: false,
    },
    {
      id: 3,
      title: 'Schedule Updated',
      message: 'Route JKT-BDG-001 schedule modified',
      time: '1 hour ago',
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left side - Menu button & Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Hamburger menu */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          {/* Search bar - hidden on mobile */}
          <div className="hidden md:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search schedules, tickets, routes..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Right side - Notifications & Profile */}
        <div className="flex items-center gap-2">
          {/* Search button for mobile */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-gray-700" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <p className="text-xs text-gray-600">{unreadCount} unread</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      className={cn(
                        'w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0',
                        !notification.read && 'bg-blue-50'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-gray-200">
                  <Link
                    href="/notifications"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {/* Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>

              {/* User info - hidden on mobile */}
              <div className="hidden lg:block text-left">
                <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                  {user?.phone || 'User'}
                </div>
                <div className="text-xs text-gray-600">
                  {role === 'SUPER_ADMIN' && 'Super Admin'}
                  {role === 'ADMIN' && 'Admin'}
                  {role === 'DRIVER' && 'Driver'}
                  {role === 'CUSTOMER' && 'Customer'}
                </div>
              </div>

              <ChevronDown
                className={cn(
                  'w-4 h-4 text-gray-600 transition-transform duration-200',
                  isProfileOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="font-medium text-gray-900">{user?.phone || 'User'}</p>
                  <p className="text-sm text-gray-600">{user?.email || 'No email'}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    {role === 'SUPER_ADMIN' && 'Super Admin'}
                    {role === 'ADMIN' && 'Admin'}
                    {role === 'DRIVER' && 'Driver'}
                    {role === 'CUSTOMER' && 'Customer'}
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">My Profile</span>
                  </Link>

                  <Link
                    href="/profile/settings"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Settings</span>
                  </Link>

                  {isSuperAdmin && (
                    <>
                      <div className="my-2 border-t border-gray-200" />
                      <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-gray-700">System Settings</span>
                        <span className="ml-auto text-xs text-purple-600 font-medium">SA</span>
                      </Link>
                    </>
                  )}
                </div>

                {/* Logout */}
                <div className="border-t border-gray-200 pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 hover:bg-red-50 transition-colors text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
