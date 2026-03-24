/**
 * Coin Transaction List Component
 * Displays paginated transaction history with filtering
 */

'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { RelativeTime } from '@/components/format/RelativeTime'
import { useMyTransactions } from '@/hooks/useCoinRequests'
import { ArrowDown, ArrowUp, RotateCcw, Receipt } from 'lucide-react'
import type { CoinTransactionType } from '@/lib/constants'
import type { CoinTransaction } from '@/types/coin.types'

/**
 * Get transaction type badge variant and icon
 */
function getTransactionDisplay(type: CoinTransactionType) {
  switch (type) {
    case 'TOP_UP':
      return {
        variant: 'default' as const,
        icon: ArrowUp,
        label: 'Top-up',
        color: 'text-green-600',
      }
    case 'DEDUCTION':
      return {
        variant: 'destructive' as const,
        icon: ArrowDown,
        label: 'Deduction',
        color: 'text-red-600',
      }
    case 'REFUND':
      return {
        variant: 'secondary' as const,
        icon: RotateCcw,
        label: 'Refund',
        color: 'text-blue-600',
      }
    default:
      return {
        variant: 'outline' as const,
        icon: Receipt,
        label: type,
        color: 'text-gray-600',
      }
  }
}

interface TransactionItemProps {
  transaction: CoinTransaction
}

function TransactionItem({ transaction }: TransactionItemProps) {
  const display = getTransactionDisplay(transaction.type)
  const Icon = display.icon
  const isPositive = transaction.type === 'TOP_UP' || transaction.type === 'REFUND'

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`mt-1 ${display.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={display.variant}>{display.label}</Badge>
                <span className="text-xs text-muted-foreground">
                  <RelativeTime date={transaction.createdAt} />
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {transaction.description}
              </p>
              {transaction.referenceId && (
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  Ref: {transaction.referenceId.slice(0, 12)}...
                </p>
              )}
            </div>
          </div>

          <div className="text-right">
            <p className={`text-lg font-bold ${display.color}`}>
              {isPositive ? '+' : '-'}
              {Math.abs(transaction.amount).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              Balance: {transaction.balanceAfter.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function CoinTransactionList() {
  const [typeFilter, setTypeFilter] = useState<CoinTransactionType | 'ALL'>('ALL')

  const filters = typeFilter !== 'ALL' ? { type: typeFilter } : undefined
  const { data, isLoading, error, refetch } = useMyTransactions(filters)

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Filter by type:</label>
        <Select
          value={typeFilter}
          onValueChange={(value) => setTypeFilter(value as CoinTransactionType | 'ALL')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Transactions</SelectItem>
            <SelectItem value="TOP_UP">Top-ups</SelectItem>
            <SelectItem value="DEDUCTION">Deductions</SelectItem>
            <SelectItem value="REFUND">Refunds</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingState message="Loading transactions..." />}

      {/* Error State */}
      {error && (
        <ErrorState
          message="Failed to load transactions"
          onRetry={() => refetch()}
        />
      )}

      {/* Empty State */}
      {!isLoading && !error && (!data?.data || data.data.length === 0) && (
        <EmptyState
          icon={<Receipt className="h-12 w-12" />}
          title="No transactions found"
          message={
            typeFilter !== 'ALL'
              ? `No ${typeFilter.toLowerCase()} transactions yet`
              : 'Your transaction history will appear here'
          }
        />
      )}

      {/* Transaction List */}
      {!isLoading && !error && data?.data && data.data.length > 0 && (
        <>
          <div className="space-y-3">
            {data.data.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>

          {/* Pagination Info */}
          {data.pagination && (
            <div className="text-sm text-muted-foreground text-center pt-4">
              Showing {data.data.length} of {data.pagination.total} transaction
              {data.pagination.total !== 1 ? 's' : ''}
            </div>
          )}
        </>
      )}
    </div>
  )
}
