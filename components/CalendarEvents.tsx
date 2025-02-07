'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { listCalendarEvents } from '@/lib/googleCalendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
}

export default function CalendarEvents() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      if (session?.accessToken) {
        try {
          const calendarEvents = await listCalendarEvents(session.accessToken)
          setEvents(calendarEvents || [])
        } catch (err) {
          setError('Failed to fetch calendar events')
          console.error('Error fetching calendar events:', err)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchEvents()
  }, [session])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Loading calendar events...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <Calendar className="h-5 w-5" />
            {error}
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-muted-foreground">No upcoming events</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex flex-col space-y-1 border-b pb-4 last:border-0"
              >
                <h3 className="font-medium">{event.summary}</h3>
                {event.description && (
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                )}
                <div className="text-sm text-muted-foreground">
                  {new Date(event.start.dateTime).toLocaleString()} -{' '}
                  {new Date(event.end.dateTime).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
