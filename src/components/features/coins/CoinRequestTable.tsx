import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'

interface CoinRequest {
  id: string
  user: {
    name: string
    email: string
  }
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  requestDate: Date
  notes?: string
}

interface CoinRequestTableProps {
  requests?: CoinRequest[]
  onApprove?: (requestId: string) => void
  onReject?: (requestId: string) => void
}

const defaultRequests: CoinRequest[] = [
  {
    id: '1',
    user: { name: 'John Doe', email: 'john@example.com' },
    amount: 1000,
    status: 'pending',
    requestDate: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '2',
    user: { name: 'Jane Smith', email: 'jane@example.com' },
    amount: 500,
    status: 'pending',
    requestDate: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: '3',
    user: { name: 'Mike Johnson', email: 'mike@example.com' },
    amount: 2000,
    status: 'pending',
    requestDate: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
]

const statusVariants = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
} as const

export function CoinRequestTable({
  requests = defaultRequests,
  onApprove,
  onReject,
}: CoinRequestTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Coin Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Request Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{request.user.name}</span>
                    <span className="text-xs text-muted-foreground">{request.user.email}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{request.amount.toLocaleString()} coins</TableCell>
                <TableCell>
                  <Badge variant={statusVariants[request.status]}>
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {request.requestDate.toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  {request.status === 'pending' && (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onApprove?.(request.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onReject?.(request.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
