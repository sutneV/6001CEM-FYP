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

    if (user.role !== 'shelter') {
      return NextResponse.json({ error: 'Only shelters can check availability' }, { status: 403 })
    }

    const date = searchParams.get('date')
    const duration = parseInt(searchParams.get('duration') || '60')

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    // Get shelter ID
    const { data: shelter, error: shelterError } = await supabase
      .from('shelters')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (shelterError || !shelter) {
      return NextResponse.json({ error: 'Shelter not found' }, { status: 404 })
    }

    // Get all existing interviews for this date
    const { data: existingInterviews, error: interviewsError } = await supabase
      .from('interviews')
      .select('scheduled_time, duration_minutes, type')
      .eq('shelter_id', shelter.id)
      .eq('scheduled_date', date)
      .in('status', ['scheduled', 'confirmed'])

    if (interviewsError) {
      console.error('Error fetching existing interviews:', interviewsError)
      return NextResponse.json({ error: 'Failed to check existing appointments' }, { status: 500 })
    }

    // Define business hours (9:00 AM to 7:30 PM)
    const businessStart = '09:00'
    const businessEnd = '19:30'

    // Generate all possible time slots (30-minute intervals)
    const timeSlots = []
    const start = new Date(`2000-01-01T${businessStart}:00`)
    const end = new Date(`2000-01-01T${businessEnd}:00`)

    while (start <= end) {
      const timeString = start.toTimeString().slice(0, 5)
      timeSlots.push(timeString)
      start.setMinutes(start.getMinutes() + 30)
    }

    // Check availability for each time slot
    const availability = timeSlots.map(timeSlot => {
      const slotStart = new Date(`${date}T${timeSlot}`)
      const slotEnd = new Date(slotStart.getTime() + duration * 60000)

      // Check if this slot conflicts with any existing interview
      const hasConflict = existingInterviews?.some(interview => {
        const existingStart = new Date(`${date}T${interview.scheduled_time}`)
        const existingEnd = new Date(existingStart.getTime() + (interview.duration_minutes || 60) * 60000)

        // Check if times overlap
        return (slotStart < existingEnd && slotEnd > existingStart)
      })

      // Get conflicts for this slot
      const conflicts = existingInterviews?.filter(interview => {
        const existingStart = new Date(`${date}T${interview.scheduled_time}`)
        const existingEnd = new Date(existingStart.getTime() + (interview.duration_minutes || 60) * 60000)

        return (slotStart < existingEnd && slotEnd > existingStart)
      }).map(interview => ({
        type: interview.type,
        time: interview.scheduled_time,
        duration: interview.duration_minutes
      }))

      return {
        time: timeSlot,
        available: !hasConflict,
        conflicts: conflicts || []
      }
    })

    // Filter out past time slots for today
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const currentTime = now.toTimeString().slice(0, 5)

    const filteredAvailability = availability.filter(slot => {
      if (date === today) {
        return slot.time > currentTime
      }
      return true
    })

    return NextResponse.json({
      date,
      duration,
      businessHours: {
        start: businessStart,
        end: businessEnd
      },
      timeSlots: filteredAvailability,
      totalSlots: filteredAvailability.length,
      availableSlots: filteredAvailability.filter(slot => slot.available).length
    })

  } catch (error) {
    console.error('Error in availability GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}