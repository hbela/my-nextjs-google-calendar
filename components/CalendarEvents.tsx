'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import * as Sentry from '@sentry/nextjs'
import { listCalendarEvents, createCalendarEvent } from '@/lib/googleCalendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Plus, X } from 'lucide-react'

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
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)

  const fetchEvents = useCallback(async () => {
    if (session?.accessToken) {
      try {
        console.log('Session exists, access token available')
        const now = new Date()
        const calendarEvents = await listCalendarEvents(
          session.accessToken,
          now
        )
        setEvents(calendarEvents || [])
        setError(null)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred'
        setError(errorMessage)
        Sentry.captureException(err, {
          tags: {
            component: 'CalendarEvents',
            action: 'fetchEvents',
          },
        })
      } finally {
        setLoading(false)
      }
    } else {
      console.error('No access token available in session:', session)
      setError('Authentication token not available')
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  async function handleCreateEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!session?.accessToken) return

    const formData = new FormData(e.currentTarget)
    const summary = formData.get('summary') as string
    const description = formData.get('description') as string
    const startDate = formData.get('startDate') as string
    const startTime = formData.get('startTime') as string
    const endDate = formData.get('endDate') as string
    const endTime = formData.get('endTime') as string

    const start = new Date(`${startDate}T${startTime}`)
    const end = new Date(`${endDate}T${endTime}`)

    try {
      setCreating(true)
      await createCalendarEvent(session.accessToken, {
        summary,
        description,
        start,
        end,
      })
      await fetchEvents() // Refresh the events list
      setShowCreateForm(false)
      e.currentTarget.reset()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create event'
      setError(errorMessage)
      Sentry.captureException(err, {
        tags: {
          component: 'CalendarEvents',
          action: 'createEvent',
        },
      })
    } finally {
      setCreating(false)
    }
  }

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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Events
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? (
            <X className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {showCreateForm && (
          <form onSubmit={handleCreateEvent} className="mb-6 space-y-4">
            <div className="space-y-2">
              <Input
                name="summary"
                placeholder="Event title"
                required
                disabled={creating}
              />
              <Textarea
                name="description"
                placeholder="Event description"
                disabled={creating}
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    type="date"
                    name="startDate"
                    required
                    disabled={creating}
                  />
                  <Input
                    type="time"
                    name="startTime"
                    required
                    disabled={creating}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="date"
                    name="endDate"
                    required
                    disabled={creating}
                  />
                  <Input
                    type="time"
                    name="endTime"
                    required
                    disabled={creating}
                  />
                </div>
              </div>
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create Event'}
            </Button>
          </form>
        )}
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
