/**
 * Admin Detail Page (SUPER_ADMIN)
 * View admin profile and coin balance information
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { DetailRow } from '@/components/ui/DetailRow'
import { RoleBadge } from '@/components/badge/RoleBadge'
import { StatusBadge } from '@/components/badge/StatusBadge'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import { FormatDate } from '@/components/format/FormatDate'
import { useAdmin } from '@/hooks/useAdmins'
import { useAdminCoinTransactions } from '@/hooks/useCoinRequests'
import { ArrowLeft, User, Coins, History } from 'lucide-react'
import { DataTable } from '@/components/data-table/DataTable'
import type { Column } from '@/types/components.types'
import type { CoinTransaction } from '@/types/coin.types'

export default function AdminDetailPage() {
  const params = useParams()
  const router = useRouter()
  const adminId = params.id as string

  // Queries
  const { data: adminData, isLoading: adminLoading, error: adminError } = useAdmin(adminId)
  const { data: transactionsData, isLoading: transactionsLoading } = useAdminCoinTransactions(adminId)

  // Transaction columns
  const columns: Column<CoinTransaction>[] = [
    {
      id: 'createdAt',
      header: 'Date',
      cell: (transaction) => <FormatDate date={transaction.createdAt} format="display-with-time" />,
    },
    {
      id: 'type',
      header: 'Type',
      cell: (transaction) => (
        <StatusBadge
          status={transaction.type}
          variant={transaction.type === 'TOP_UP' || transaction.type === 'REFUND' ? 'success' : 'warning'}
        />
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      cell: (transaction) => (
        <span className={transaction.type === 'TOP_UP' || transaction.type === 'REFUND' ? 'text-green-600' : 'text-red-600'}>
          {transaction.type === 'TOP_UP' || transaction.type === 'REFUND' ? '+' : '-'}
          <FormatCurrency value={transaction.amount} />
        </span>
      ),
    },
    {
      id: 'balanceAfter',
      header: 'Balance After',
      cell: (transaction) => <FormatCurrency value={transaction.balanceAfter} />,
    },
    {
      id: 'description',
      header: 'Description',
      accessorKey: 'description',
    },
  ]

  if (adminLoading) {
    return <LoadingState message="Loading admin details..." />
  }

  if (adminError || !adminData) {
    return (
      <ErrorState
        message="Failed to load admin details"
        onRetry={() => router.back()}
      />
    )
  }

  // API returns admin data directly, not wrapped in { data: ... }
  const admin = (adminData as any) || (adminData?.data as any)

  // Check if admin data exists
  if (!admin) {
    return (
      <ErrorState
        message="Admin data not found"
        onRetry={() => router.back()}
      />
    )
  }

  // Extract data from nested structure (same as list page)
  const name = admin?.name || admin?.profile?.name || 'N/A'
  const email = admin?.user?.email || admin?.email || 'N/A'
  const phone = admin?.phone || 'N/A'
  const status = admin?.user?.status || admin?.status || 'ACTIVE'
  const role = admin?.user?.role || admin?.role
  const coinBalance = admin?.coinBalance || 0
  const createdAt = admin?.createdAt || admin?.user?.createdAt
  const updatedAt = admin?.updatedAt || admin?.user?.updatedAt

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Admin Details</h1>
          <p className="text-muted-foreground">
            View admin profile and transaction history
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DetailRow label="Name" value={name} />
          <DetailRow label="Email" value={email} />
          <DetailRow label="Phone" value={phone} />
          {role && <DetailRow label="Role" value={<RoleBadge role={role} />} />}
          <DetailRow
            label="Status"
            value={
              <StatusBadge
                status={status}
                variant={status === 'ACTIVE' ? 'success' : 'secondary'}
              />
            }
          />
          {createdAt && (
            <DetailRow
              label="Created At"
              value={<FormatDate date={createdAt} format="display-with-time" />}
            />
          )}
          {updatedAt && (
            <DetailRow
              label="Last Updated"
              value={<FormatDate date={updatedAt} format="display-with-time" />}
            />
          )}
        </CardContent>
      </Card>

      {/* Coin Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Coin Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            <FormatCurrency value={coinBalance} showSymbol />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Current available balance
          </p>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <LoadingState message="Loading transactions..." />
          ) : transactionsData && transactionsData.data.length > 0 ? (
            <DataTable columns={columns} data={transactionsData.data} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No transactions found for this admin
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
