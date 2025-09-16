import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db/config'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userHeader = request.headers.get('x-user-data')

    if (!userHeader) {
      return NextResponse.json({ error: 'User data required' }, { status: 401 })
    }

    const user = JSON.parse(userHeader)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const eventType = searchParams.get('eventType')

    let query = supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)

    // Apply filters
    if (startDate) query = query.gte('event_date', startDate)
    if (endDate) query = query.lte('event_date', endDate)
    if (eventType) query = query.eq('event_type', eventType)

    // Order by date
    query = query.order('event_date', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching calendar events:', error)
      return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 })
    }

    // For events with interview_id, get the actual interview status
    const transformedData = await Promise.all((data || []).map(async (event) => {
      if (event.interview_id) {
        // Get the actual interview status
        const { data: interview } = await supabase
          .from('interviews')
          .select('status, adopter_response')
          .eq('id', event.interview_id)
          .single()

        if (interview) {
          return {
            ...event,
            // Override is_confirmed based on actual interview status
            is_confirmed: interview.adopter_response === true || interview.status === 'confirmed',
            interview_status: interview.status,
            interview_response: interview.adopter_response
          }
        }
      }

      return event
    }))

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error in calendar events GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userHeader = request.headers.get('x-user-data')

    if (!userHeader) {
      return NextResponse.json({ error: 'User data required' }, { status: 401 })
    }

    const user = JSON.parse(userHeader)
    const body = await request.json()
    const {
      title,
      description,
      eventDate,
      eventTime,
      durationMinutes,
      location,
      eventType,
      interviewId
    } = body

    const { data: event, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: user.id,
        interview_id: interviewId,
        title,
        description,
        event_date: eventDate,
        event_time: eventTime,
        duration_minutes: durationMinutes,
        location,
        event_type: eventType,
        is_confirmed: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating calendar event:', error)
      return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 })
    }

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error in calendar events POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}