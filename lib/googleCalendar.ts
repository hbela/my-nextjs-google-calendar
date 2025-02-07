//import { google } from 'googleapis'
//import { getSession } from 'next-auth/react'
import * as Sentry from '@sentry/nextjs'

const CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3'

// export async function getGoogleCalendarClient(accessToken: string) {
//   const auth = new google.auth.OAuth2(
//     process.env.GOOGLE_CLIENT_ID,
//     process.env.GOOGLE_CLIENT_SECRET
//   )

//   auth.setCredentials({ access_token: accessToken })

//   return google.calendar({ version: 'v3', auth })
// }

export async function listCalendarEvents(accessToken: string, timeMin?: Date) {
  try {
    const params = new URLSearchParams({
      calendarId: 'primary',
      timeMin: timeMin?.toISOString() || new Date().toISOString(),
      maxResults: '10',
      singleEvents: 'true',
      orderBy: 'startTime',
    })

    console.log('[Server] Calendar API Request:', {
      timeMin: timeMin?.toISOString(),
      hasAccessToken: !!accessToken,
      tokenPrefix: accessToken?.substring(0, 10),
    })

    const response = await fetch(
      `${CALENDAR_API_URL}/calendars/primary/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('[Server] Calendar API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      })
      throw new Error(
        `Failed to fetch calendar events: ${response.status} ${response.statusText}${
          errorData ? ' - ' + JSON.stringify(errorData) : ''
        }`
      )
    }

    const data = await response.json()
    console.log('[Server] Calendar API Success:', {
      eventCount: data.items?.length || 0,
    })
    return data.items
  } catch (error) {
    console.error('[Server] Calendar API Exception:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    Sentry.captureException(error, {
      tags: {
        component: 'googleCalendar',
        action: 'listEvents',
      },
    })
    throw error
  }
}

export async function createCalendarEvent(
  accessToken: string,
  {
    summary,
    description,
    start,
    end,
  }: {
    summary: string
    description?: string
    start: Date
    end: Date
  }
) {
  try {
    const event = {
      summary,
      description,
      start: {
        dateTime: start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    }

    const response = await fetch(
      `${CALENDAR_API_URL}/calendars/primary/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(
        `Failed to create calendar event: ${response.status} ${response.statusText}${
          errorData ? ' - ' + JSON.stringify(errorData) : ''
        }`
      )
    }

    return response.json()
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        component: 'googleCalendar',
        action: 'createEvent',
      },
    })
    throw error
  }
}
