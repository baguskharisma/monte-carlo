'use client';

import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/api-types';
import { useEffect } from 'react';
import {
  Users,
  Car,
  Route,
  Calendar,
  Ticket,
  FileText,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout';

export default function AdminDashboard() {
  const { requireAnyRole, user, role, isSuperAdmin, isAdmin } = useAuth();

  // Protect route - only ADMIN and SUPER_ADMIN
  useEffect(() => {
    requireAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN], '/unauthorized');
  }, [requireAnyRole]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard'}
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.phone}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blue-700">{role}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Schedules"
            value="24"
            change="+12%"
            icon={<Calendar className="w-5 h-5 text-blue-600" />}
            trend="up"
          />
          <StatCard
            title="Active Tickets"
            value="156"
            change="+8%"
            icon={<Ticket className="w-5 h-5 text-green-600" />}
            trend="up"
          />
          <StatCard
            title="Total Revenue"
            value="Rp 45.2M"
            change="+23%"
            icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
            trend="up"
          />
          <StatCard
            title="Pending Approvals"
            value="8"
            change="-5%"
            icon={<AlertCircle className="w-5 h-5 text-orange-600" />}
            trend="down"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Quick Actions</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <ActionButton
                    icon={<Calendar className="w-6 h-6" />}
                    label="Create Schedule"
                    href="/admin/schedules/create"
                  />
                  <ActionButton
                    icon={<Ticket className="w-6 h-6" />}
                    label="Book Ticket"
                    href="/admin/tickets/create"
                  />
                  <ActionButton
                    icon={<FileText className="w-6 h-6" />}
                    label="Travel Document"
                    href="/admin/documents/create"
                  />
                  <ActionButton
                    icon={<Car className="w-6 h-6" />}
                    label="Manage Vehicles"
                    href="/admin/vehicles"
                  />
                  <ActionButton
                    icon={<Route className="w-6 h-6" />}
                    label="Manage Routes"
                    href="/admin/routes"
                  />
                  <ActionButton
                    icon={<Users className="w-6 h-6" />}
                    label="Manage Users"
                    href="/admin/users"
                    superAdminOnly={true}
                    isSuperAdmin={isSuperAdmin}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Recent Activities</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ActivityItem
                    icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                    title="Payment Approved"
                    description="Ticket TKT-20251215-00123 payment verified"
                    time="5 minutes ago"
                  />
                  <ActivityItem
                    icon={<Ticket className="w-5 h-5 text-blue-600" />}
                    title="New Booking"
                    description="Customer booked Jakarta - Bandung route"
                    time="15 minutes ago"
                  />
                  <ActivityItem
                    icon={<Calendar className="w-5 h-5 text-purple-600" />}
                    title="Schedule Created"
                    description="New schedule for route JKT-BDG-001"
                    time="1 hour ago"
                  />
                  <ActivityItem
                    icon={<AlertCircle className="w-5 h-5 text-orange-600" />}
                    title="Payment Pending"
                    description="3 payment proofs awaiting approval"
                    time="2 hours ago"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Coin Management & Pending Tasks */}
          <div className="space-y-6">
            {/* Coin Balance */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Coin Balance</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="w-6 h-6" />
                      <span className="text-sm opacity-90">Available</span>
                    </div>
                    <div className="text-3xl font-bold">250,000</div>
                    <div className="text-sm opacity-90 mt-1">Coins</div>
                  </div>

                  <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-3 rounded-lg transition-colors">
                    Request Top-Up
                  </button>

                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ticket Bookings</span>
                      <span className="font-medium">12 × 10k</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Travel Docs</span>
                      <span className="font-medium">3 × 10k</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                      <span>Total Used</span>
                      <span className="text-red-600">-150k</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Approvals */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Pending Approvals</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <PendingItem
                    title="Payment Proof"
                    count={5}
                    href="/admin/payment-proofs"
                    color="orange"
                  />
                  <PendingItem
                    title="Coin Requests"
                    count={3}
                    href="/admin/coin-requests"
                    color="blue"
                    superAdminOnly={true}
                    isSuperAdmin={isSuperAdmin}
                  />
                  <PendingItem
                    title="New Drivers"
                    count={2}
                    href="/admin/drivers"
                    color="green"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Super Admin Only Section */}
            {isSuperAdmin && (
              <Card className="border-2 border-purple-200 bg-purple-50">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-purple-900">
                    Super Admin Tools
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-purple-100 text-purple-900 font-medium transition-colors">
                      System Settings
                    </button>
                    <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-purple-100 text-purple-900 font-medium transition-colors">
                      Manage Admins
                    </button>
                    <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-purple-100 text-purple-900 font-medium transition-colors">
                      View All Balances
                    </button>
                    <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-purple-100 text-purple-900 font-medium transition-colors">
                      System Reports
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ==================== COMPONENTS ====================

function StatCard({
  title,
  value,
  change,
  icon,
  trend
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            {icon}
          </div>
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-600 mt-1">{title}</div>
      </CardContent>
    </Card>
  );
}

function ActionButton({
  icon,
  label,
  href,
  superAdminOnly = false,
  isSuperAdmin = false
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  superAdminOnly?: boolean;
  isSuperAdmin?: boolean;
}) {
  // Hide if super admin only but user is not super admin
  if (superAdminOnly && !isSuperAdmin) {
    return null;
  }

  return (
    <a
      href={href}
      className="flex flex-col items-center justify-center p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
    >
      <div className="text-gray-600 group-hover:text-blue-600 transition-colors mb-2">
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-700 text-center group-hover:text-blue-600 transition-colors">
        {label}
      </span>
      {superAdminOnly && (
        <span className="text-xs text-purple-600 mt-1">Super Admin</span>
      )}
    </a>
  );
}

function ActivityItem({
  icon,
  title,
  description,
  time
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0 mt-1">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900">{title}</div>
        <div className="text-sm text-gray-600 truncate">{description}</div>
        <div className="text-xs text-gray-500 mt-1">{time}</div>
      </div>
    </div>
  );
}

function PendingItem({
  title,
  count,
  href,
  color = 'orange',
  superAdminOnly = false,
  isSuperAdmin = false
}: {
  title: string;
  count: number;
  href: string;
  color?: 'orange' | 'blue' | 'green';
  superAdminOnly?: boolean;
  isSuperAdmin?: boolean;
}) {
  // Hide if super admin only but user is not super admin
  if (superAdminOnly && !isSuperAdmin) {
    return null;
  }

  const colors = {
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
  };

  return (
    <a
      href={href}
      className={`flex items-center justify-between p-3 rounded-lg border-2 hover:shadow-md transition-all ${colors[color]}`}
    >
      <span className="font-medium">{title}</span>
      <span className="text-xl font-bold">{count}</span>
    </a>
  );
}
