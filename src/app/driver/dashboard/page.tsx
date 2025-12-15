'use client';

import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/api-types';
import { useEffect } from 'react';
import {
  MapPin,
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Car,
  Calendar,
  TrendingUp,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout';

export default function DriverDashboard() {
  const { requireRole, user } = useAuth();

  // Protect route - only DRIVER
  useEffect(() => {
    requireRole(UserRole.DRIVER, '/unauthorized');
  }, [requireRole]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Driver Panel</h1>
              <p className="opacity-90 mt-1">Welcome back, {user?.phone}</p>
            </div>
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span className="font-medium">AVAILABLE</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DriverStatCard
            title="Trips Today"
            value="3"
            subtitle="2 completed"
            icon={<Calendar className="w-5 h-5 text-blue-600" />}
            color="blue"
          />
          <DriverStatCard
            title="Total Trips"
            value="156"
            subtitle="This month"
            icon={<Car className="w-5 h-5 text-green-600" />}
            color="green"
          />
          <DriverStatCard
            title="Passengers"
            value="1,234"
            subtitle="Lifetime"
            icon={<Users className="w-5 h-5 text-purple-600" />}
            color="purple"
          />
          <DriverStatCard
            title="Rating"
            value="4.8"
            subtitle="Average rating"
            icon={<Award className="w-5 h-5 text-yellow-600" />}
            color="yellow"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Today's Trips */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Trip */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-blue-900">
                    Current Trip
                  </h2>
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                    IN TRANSIT
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Route Info */}
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">Route</span>
                      <span className="text-sm font-bold text-blue-600">JKT-BDG-001</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5" />
                        <div>
                          <div className="font-medium">Jakarta</div>
                          <div className="text-sm text-gray-600">Terminal Kampung Rambutan</div>
                        </div>
                      </div>
                      <div className="ml-1.5 w-0.5 h-8 bg-gray-300" />
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5" />
                        <div>
                          <div className="font-medium">Bandung</div>
                          <div className="text-sm text-gray-600">Terminal Leuwi Panjang</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trip Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors">
                      <Navigation className="w-5 h-5" />
                      Update Location
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 font-medium py-3 rounded-lg transition-colors">
                      <Users className="w-5 h-5" />
                      View Passengers
                    </button>
                  </div>

                  {/* Trip Info */}
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-900">12</div>
                      <div className="text-xs text-gray-600">Passengers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-900">150</div>
                      <div className="text-xs text-gray-600">KM</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-900">2.5h</div>
                      <div className="text-xs text-gray-600">ETA</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Today's Schedule</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <TripCard
                    time="08:00 AM"
                    route="Jakarta - Bandung"
                    status="completed"
                    passengers={16}
                    vehicle="B 1234 ABC"
                  />
                  <TripCard
                    time="01:00 PM"
                    route="Bandung - Jakarta"
                    status="in-progress"
                    passengers={12}
                    vehicle="B 1234 ABC"
                  />
                  <TripCard
                    time="06:00 PM"
                    route="Jakarta - Bandung"
                    status="scheduled"
                    passengers={8}
                    vehicle="B 1234 ABC"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Performance This Month</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <PerformanceItem
                    label="On-Time Rate"
                    value="98%"
                    trend="+2%"
                    color="green"
                  />
                  <PerformanceItem
                    label="Completion Rate"
                    value="100%"
                    trend="0%"
                    color="blue"
                  />
                  <PerformanceItem
                    label="Avg Trip Time"
                    value="3.2h"
                    trend="-5%"
                    color="purple"
                  />
                  <PerformanceItem
                    label="Customer Rating"
                    value="4.8/5"
                    trend="+0.1"
                    color="yellow"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Quick Actions</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-lg transition-colors">
                    <CheckCircle className="w-5 h-5" />
                    Start Trip
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors">
                    <MapPin className="w-5 h-5" />
                    Update Status
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium rounded-lg transition-colors">
                    <Users className="w-5 h-5" />
                    Passenger List
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium rounded-lg transition-colors">
                    <AlertTriangle className="w-5 h-5" />
                    Report Issue
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Next Trip */}
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <h2 className="text-xl font-semibold text-purple-900">Next Trip</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">Departure</span>
                    <span className="font-bold text-purple-900">06:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">Route</span>
                    <span className="font-bold text-purple-900">JKT-BDG</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">Vehicle</span>
                    <span className="font-bold text-purple-900">B 1234 ABC</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">Passengers</span>
                    <span className="font-bold text-purple-900">8 / 16</span>
                  </div>
                  <div className="pt-3 border-t border-purple-200">
                    <div className="flex items-center gap-2 text-purple-700">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Starts in 3 hours 15 minutes</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Info */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Assigned Vehicle</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-gray-100 rounded-lg p-3 text-center">
                    <Car className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                    <div className="font-bold text-lg">B 1234 ABC</div>
                    <div className="text-sm text-gray-600">Mercedes Sprinter</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-gray-600">Type</div>
                      <div className="font-medium">EKSEKUTIF</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-gray-600">Capacity</div>
                      <div className="font-medium">16 seats</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <h2 className="text-lg font-semibold text-yellow-900">💡 Driver Tips</h2>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-yellow-900">
                  <li>• Update location every 10-15 minutes</li>
                  <li>• Check passenger list before departure</li>
                  <li>• Report any vehicle issues immediately</li>
                  <li>• Maintain communication with passengers</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ==================== COMPONENTS ====================

function DriverStatCard({
  title,
  value,
  subtitle,
  icon,
  color
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    yellow: 'bg-yellow-50 border-yellow-200',
  };

  return (
    <Card className={`border-2 ${colors[color]}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-white rounded-lg">
            {icon}
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-900 font-medium mt-1">{title}</div>
        <div className="text-xs text-gray-600 mt-0.5">{subtitle}</div>
      </CardContent>
    </Card>
  );
}

function TripCard({
  time,
  route,
  status,
  passengers,
  vehicle
}: {
  time: string;
  route: string;
  status: 'completed' | 'in-progress' | 'scheduled';
  passengers: number;
  vehicle: string;
}) {
  const statusConfig = {
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
    'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    scheduled: { label: 'Scheduled', color: 'bg-gray-100 text-gray-700' },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="text-center">
        <div className="font-bold text-lg">{time.split(':')[0]}</div>
        <div className="text-sm text-gray-600">{time.split(' ')[1]}</div>
      </div>
      <div className="flex-1">
        <div className="font-medium">{route}</div>
        <div className="text-sm text-gray-600">{vehicle} • {passengers} passengers</div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}

function PerformanceItem({
  label,
  value,
  trend,
  color
}: {
  label: string;
  value: string;
  trend: string;
  color: 'green' | 'blue' | 'purple' | 'yellow';
}) {
  const colors = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600',
  };

  const isPositive = trend.startsWith('+') || parseFloat(trend) > 0;

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${colors[color]}`}>{value}</div>
      <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {trend} vs last month
      </div>
    </div>
  );
}
