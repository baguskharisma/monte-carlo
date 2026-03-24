'use client'

import type { Schedule } from '@/types/schedule.types'
import type { PassengerManifestItem, TripLog } from '@/types/driver-trip.types'
import { RouteDisplay } from '@/components/schedule/RouteDisplay'
import { FormatDate } from '@/components/format/FormatDate'
import { StatusBadge } from '@/components/badge/StatusBadge'
import { VehicleTypeBadge } from '@/components/badge/VehicleTypeBadge'
import { getTripStatusVariant } from '@/lib/status-utils'
import { CheckCircle, Circle } from 'lucide-react'

interface PrintableManifestProps {
  schedule: Schedule
  passengers: PassengerManifestItem[]
  tripLogs?: TripLog[]
}

/**
 * PrintableManifest Component
 * Print-optimized layout for passenger manifest
 */
export function PrintableManifest({
  schedule,
  passengers,
  tripLogs = [],
}: PrintableManifestProps) {
  const checkedInCount = passengers.filter(p => p.isCheckedIn).length

  return (
    <div id="manifest-print" className="bg-white text-black">
      {/* Header */}
      <div className="mb-6 border-b-2 border-gray-800 pb-4">
        <h1 className="text-2xl font-bold mb-2">Passenger Manifest</h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">Route:</p>
            <RouteDisplay
              origin={schedule.route?.origin || 'Unknown'}
              destination={schedule.route?.destination || 'Unknown'}
              routeCode={schedule.route?.routeCode}
            />
          </div>
          <div>
            <p className="font-medium">Status:</p>
            <StatusBadge
              status={schedule.status}
              variant={getTripStatusVariant(schedule.status)}
            />
          </div>
        </div>
      </div>

      {/* Trip Information */}
      <div className="mb-6 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="font-medium text-gray-600">Departure Time</p>
          <p className="font-semibold">
            <FormatDate date={schedule.departureTime} format="display-with-time" />
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-600">Vehicle</p>
          <p className="font-semibold">
            {schedule.vehicle?.vehicleNumber || '-'}
            {schedule.vehicle?.type && (
              <span className="ml-2">
                <VehicleTypeBadge type={schedule.vehicle.type} />
              </span>
            )}
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-600">Driver</p>
          <p className="font-semibold">{schedule.driver?.name || '-'}</p>
          {schedule.driver?.phone && (
            <p className="text-xs text-gray-600">{schedule.driver.phone}</p>
          )}
        </div>
      </div>

      {/* Passenger Summary */}
      <div className="mb-6 rounded-lg border-2 border-gray-300 bg-gray-50 p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{passengers.length}</p>
            <p className="text-sm text-gray-600">Total Passengers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{checkedInCount}</p>
            <p className="text-sm text-gray-600">Checked In</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">
              {passengers.length - checkedInCount}
            </p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>
      </div>

      {/* Passenger Table */}
      <table className="w-full border-collapse border-2 border-gray-800 mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-800 px-3 py-2 text-left font-bold text-xs">
              SEAT
            </th>
            <th className="border border-gray-800 px-3 py-2 text-left font-bold text-xs">
              PASSENGER NAME
            </th>
            <th className="border border-gray-800 px-3 py-2 text-left font-bold text-xs">
              TICKET #
            </th>
            <th className="border border-gray-800 px-3 py-2 text-left font-bold text-xs">
              PHONE
            </th>
            <th className="border border-gray-800 px-3 py-2 text-left font-bold text-xs">
              PICKUP ADDRESS
            </th>
            <th className="border border-gray-800 px-3 py-2 text-left font-bold text-xs">
              DROPOFF ADDRESS
            </th>
            <th className="border border-gray-800 px-3 py-2 text-left font-bold text-xs">
              STATUS
            </th>
          </tr>
        </thead>
        <tbody>
          {passengers.map((passenger, index) => (
            <tr key={passenger.passengerId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-800 px-3 py-2 text-center font-bold">
                {passenger.seatNumber || '-'}
              </td>
              <td className="border border-gray-800 px-3 py-2">
                <div className="font-medium">{passenger.passengerName}</div>
                {passenger.identityNumber && (
                  <div className="text-xs text-gray-600">ID: {passenger.identityNumber}</div>
                )}
              </td>
              <td className="border border-gray-800 px-3 py-2 font-mono text-xs">
                {passenger.ticketNumber}
              </td>
              <td className="border border-gray-800 px-3 py-2 text-sm">
                {passenger.phone || '-'}
              </td>
              <td className="border border-gray-800 px-3 py-2 text-sm">
                {passenger.pickupAddress || '-'}
              </td>
              <td className="border border-gray-800 px-3 py-2 text-sm">
                {passenger.dropoffAddress || '-'}
              </td>
              <td className="border border-gray-800 px-3 py-2 text-center">
                {passenger.isCheckedIn ? (
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium text-green-600">Checked</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1">
                    <Circle className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">Pending</span>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Trip Logs (if any) */}
      {tripLogs.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3 border-b border-gray-400 pb-2">
            Trip Updates
          </h2>
          <div className="space-y-2">
            {tripLogs.map((log) => (
              <div key={log.id} className="border-l-4 border-gray-400 pl-3 py-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{log.status}</p>
                  <p className="text-xs text-gray-600">
                    <FormatDate date={log.timestamp} format="display-with-time" />
                  </p>
                </div>
                {log.location && (
                  <p className="text-sm text-gray-700">Location: {log.location}</p>
                )}
                {log.notes && <p className="text-sm text-gray-600">Notes: {log.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 border-t border-gray-400 pt-4 text-xs text-gray-600">
        <p>
          Printed on: <FormatDate date={new Date().toISOString()} format="display-with-time" />
        </p>
        <p className="mt-1">
          This is an official passenger manifest document. Please verify all passenger information
          before departure.
        </p>
      </div>

      {/* Print-specific styles */}
      <style jsx>{`
        @media print {
          #manifest-print {
            padding: 20px;
          }

          table {
            page-break-inside: avoid;
          }

          tr {
            page-break-inside: avoid;
          }

          h1,
          h2 {
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  )
}
