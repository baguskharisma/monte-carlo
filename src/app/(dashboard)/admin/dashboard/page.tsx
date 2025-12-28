/**
 * Admin Dashboard Page
 * Displays admin's coin balance, pending proofs, recent bookings, active trips,
 * recent payment proofs, coin transaction history, and upcoming schedules
 */

'use client'

import Link from 'next/link'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { PaymentProofCard } from '@/components/payment-proof/PaymentProofCard'
import { ScheduleCard } from '@/components/schedule/ScheduleCard'
import { FormatCurrency } from '@/components/format/FormatCurrency'
import { FormatDate } from '@/components/format/FormatDate'
import { useCoinBalance, useMyTransactions } from '@/hooks/useCoinRequests'
import { usePaymentProofs, usePaymentProofStats } from '@/hooks/usePaymentProofs'
import { useTickets } from '@/hooks/useTickets'
import { useSchedules, useUpcomingSchedules } from '@/hooks/useSchedules'
import {
  Coins,
  Clock,
  Ticket,
  Calendar,
  FileText,
  Receipt,
  Bus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react'
import type { CoinTransaction } from '@/types/coin.types'

/**
 * AdminDashboardPage - Main dashboard for ADMIN role
 */
export default function AdminDashboardPage() {
  // Stats data
  const { data: coinBalance, isLoading: balanceLoading } = useCoinBalance()
  const { data: proofStats, isLoading: statsLoading } = usePaymentProofStats()
  const { data: recentTickets, isLoading: ticketsLoading } = useTickets({
    limit: 20,
    page: 1,
  })
  const { data: activeSchedules, isLoading: schedulesLoading } = useSchedules({
    status: 'DEPARTED',
  })

  // Card detail data
  const {
    data: pendingProofs,
    isLoading: proofsLoading,
    error: proofsError,
    refetch: refetchProofs,
  } = usePaymentProofs({ status: 'PENDING', page: 1, limit: 5 })

  const {
    data: myTransactions,
    isLoading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useMyTransactions({ limit: 5 })

  const {
    data: upcomingSchedules,
    isLoading: upcomingLoading,
    error: upcomingError,
    refetch: refetchUpcoming,
  } = useUpcomingSchedules(6)

  /**
   * Get icon for transaction type
   */
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'TOP_UP':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />
      case 'DEDUCTION':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />
      case 'REFUND':
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      default:
        return <Receipt className="h-4 w-4" />
    }
  }

  /**
   * Get description for transaction type
   */
  const getTransactionDescription = (transaction: CoinTransaction) => {
    switch (transaction.type) {
      case 'TOP_UP':
        return 'Coin top-up approved'
      case 'DEDUCTION':
        return transaction.description || 'Coin deduction'
      case 'REFUND':
        return transaction.description || 'Coin refund'
      default:
        return transaction.description || 'Transaction'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Monte Carlo Admin dashboard.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Coin Balance"
          value={coinBalance?.coinBalance || 0}
          icon={<Coins className="h-4 w-4" />}
          loading={balanceLoading}
          iconClassName="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
        />
        <StatCard
          title="Pending Proofs"
          value={proofStats?.pending || 0}
          icon={<Clock className="h-4 w-4" />}
          description="Awaiting review"
          loading={statsLoading}
          iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
        />
        <StatCard
          title="Recent Bookings"
          value={recentTickets?.meta?.total || 0}
          icon={<Ticket className="h-4 w-4" />}
          description="Last 20 bookings"
          loading={ticketsLoading}
          iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
        />
        <StatCard
          title="Active Trips"
          value={activeSchedules?.meta?.total || 0}
          icon={<Calendar className="h-4 w-4" />}
          description="Currently in transit"
          loading={schedulesLoading}
          iconClassName="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
        />
      </div>

      {/* Two-column layout: Recent Proofs + Transactions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Payment Proofs Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Recent Payment Proofs</CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/payment-proofs">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {proofsLoading && (
              <LoadingState message="Loading payment proofs..." />
            )}
            {proofsError && (
              <ErrorState
                message="Failed to load payment proofs"
                onRetry={refetchProofs}
              />
            )}
            {!proofsLoading &&
              !proofsError &&
              (!pendingProofs?.data || pendingProofs.data.length === 0) && (
                <EmptyState
                  icon={<FileText className="h-12 w-12" />}
                  title="No pending proofs"
                  message="All payment proofs have been reviewed"
                />
              )}
            {!proofsLoading &&
              !proofsError &&
              pendingProofs?.data &&
              pendingProofs.data.length > 0 && (
                <div className="space-y-3">
                  {pendingProofs.data.map((proof) => (
                    <PaymentProofCard
                      key={proof.id}
                      proof={proof}
                      showActions={false}
                    />
                  ))}
                </div>
              )}
          </CardContent>
        </Card>

        {/* Coin Transaction History Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Coin Transaction History</CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/coins/transactions">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {transactionsLoading && (
              <LoadingState message="Loading transactions..." />
            )}
            {transactionsError && (
              <ErrorState
                message="Failed to load transactions"
                onRetry={refetchTransactions}
              />
            )}
            {!transactionsLoading &&
              !transactionsError &&
              (!myTransactions?.data || myTransactions.data.length === 0) && (
                <EmptyState
                  icon={<Receipt className="h-12 w-12" />}
                  title="No transactions"
                  message="Your transaction history will appear here"
                />
              )}
            {!transactionsLoading &&
              !transactionsError &&
              myTransactions?.data &&
              myTransactions.data.length > 0 && (
                <div className="space-y-3">
                  {myTransactions.data.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-muted p-2">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {getTransactionDescription(transaction)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <FormatDate date={transaction.createdAt} />
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            transaction.type === 'TOP_UP' ||
                            transaction.type === 'REFUND'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'TOP_UP' ||
                          transaction.type === 'REFUND'
                            ? '+'
                            : '-'}
                          <FormatCurrency value={Math.abs(transaction.amount)} />
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Balance: <FormatCurrency value={transaction.balanceAfter} />
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Schedules Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Upcoming Schedules</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/schedules">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingLoading && <LoadingState message="Loading schedules..." />}
          {upcomingError && (
            <ErrorState
              message="Failed to load schedules"
              onRetry={refetchUpcoming}
            />
          )}
          {!upcomingLoading &&
            !upcomingError &&
            (!upcomingSchedules?.data || upcomingSchedules.data.length === 0) && (
              <EmptyState
                icon={<Bus className="h-12 w-12" />}
                title="No upcoming schedules"
                message="Upcoming schedules will appear here"
              />
            )}
          {!upcomingLoading &&
            !upcomingError &&
            upcomingSchedules?.data &&
            upcomingSchedules.data.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingSchedules.data.map((schedule) => (
                  <ScheduleCard key={schedule.id} schedule={schedule} />
                ))}
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
