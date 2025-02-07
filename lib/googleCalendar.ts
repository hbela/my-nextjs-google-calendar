import { google } from 'googleapis'
import { getSession } from 'next-auth/react'

export async function getGoogleCalendarClient(accessToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  auth.setCredentials({ access_token: accessToken })

  return google.calendar({ version: 'v3', auth })
}

export async function listCalendarEvents(accessToken: string, timeMin?: Date) {
  try {
    const calendar = await getGoogleCalendarClient(accessToken)

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin?.toISOString() || new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    })

    return response.data.items
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
    const calendar = await getGoogleCalendarClient(accessToken)

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

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    })

    return response.data
  } catch (error) {
    console.error('Error creating calendar event:', error)
    throw error
  }
}
