import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'

interface Activity {
  id: string
  type: 'booking' | 'payment' | 'review' | 'registration' | 'coin_request'
  user: {
    name: string
    avatar?: string
  }
  description: string
  timestamp: Date
}

interface RecentActivityListProps {
  activities?: Activity[]
}

const defaultActivities: Activity[] = [
  {
    id: '1',
    type: 'booking',
    user: { name: 'John Doe' },
    description: 'Booked "Bali Adventure Tour"',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
  },
  {
    id: '2',
    type: 'payment',
    user: { name: 'Jane Smith' },
    description: 'Completed payment for "Tokyo Express"',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
  },
  {
    id: '3',
    type: 'review',
    user: { name: 'Mike Johnson' },
    description: 'Left a 5-star review on "Paris Tour"',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: '4',
    type: 'registration',
    user: { name: 'Sarah Williams' },
    description: 'Created a new account',
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
  },
  {
    id: '5',
    type: 'coin_request',
    user: { name: 'Tom Brown' },
    description: 'Requested 1000 coins',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
  },
]

const activityColors = {
  booking: 'bg-blue-500',
  payment: 'bg-green-500',
  review: 'bg-yellow-500',
  registration: 'bg-purple-500',
  coin_request: 'bg-orange-500',
}

export function RecentActivityList({ activities = defaultActivities }: RecentActivityListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <div
                  className={`flex h-full w-full items-center justify-center text-white text-xs font-semibold ${
                    activityColors[activity.type]
                  }`}
                >
                  {activity.user.name.charAt(0)}
                </div>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{activity.user.name}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
