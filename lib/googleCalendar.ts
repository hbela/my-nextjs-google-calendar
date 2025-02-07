//import { google } from 'googleapis'
//import { getSession } from 'next-auth/react'

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

    const response = await fetch(
      `${CALENDAR_API_URL}/calendars/primary/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch calendar events')
    }

    const data = await response.json()
    return data.items
  } catch (error) {
    console.error('Error fetching calendar events:', error)
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
      throw new Error('Failed to create calendar event')
    }

    return response.json()
  } catch (error) {
    console.error('Error creating calendar event:', error)
    throw error
  }
}
