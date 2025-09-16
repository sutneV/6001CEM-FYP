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
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    let query = supabase
      .from('interviews')
      .select(`
        *,
        application:applications(
          id,
          first_name,
          last_name,
          email,
          phone,
          pet:pets(
            id,
            name,
            type,
            breed
          )
        ),
        shelter:shelters(
          id,
          name
        ),
        adopter:users(
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)

    // Filter based on user role
    if (user.role === 'shelter') {
      query = query.eq('shelter_id', user.shelterId)
    } else if (user.role === 'adopter') {
      query = query.eq('adopter_id', user.id)
    }

    // Apply filters
    if (startDate) query = query.gte('scheduled_date', startDate)
    if (endDate) query = query.lte('scheduled_date', endDate)
    if (status) query = query.eq('status', status)
    if (type) query = query.eq('type', type)

    // Order by date
    query = query.order('scheduled_date', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching interviews:', error)
      return NextResponse.json({ error: 'Failed to fetch interviews' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in interviews GET:', error)
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

    if (user.role !== 'shelter') {
      return NextResponse.json({ error: 'Only shelters can schedule interviews' }, { status: 403 })
    }

    const body = await request.json()
    const {
      applicationId,
      type,
      scheduledDate,
      scheduledTime,
      durationMinutes,
      location,
      notes
    } = body

    // Get application details to get adopter_id and pet_id
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('adopter_id, pet_id')
      .eq('id', applicationId)
      .single()

    if (appError || !application) {
      console.error('Application query error:', appError)
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Get pet details to get shelter_id
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('shelter_id')
      .eq('id', application.pet_id)
      .single()

    if (petError || !pet) {
      console.error('Pet query error:', petError)
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    // Verify user owns this shelter
    const { data: shelter, error: shelterError } = await supabase
      .from('shelters')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (shelterError || !shelter) {
      return NextResponse.json({ error: 'Shelter not found' }, { status: 404 })
    }

    if (shelter.id !== pet.shelter_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Create interview
    const interviewData = {
      application_id: applicationId,
      shelter_id: shelter.id,
      adopter_id: application.adopter_id,
      type,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      duration_minutes: durationMinutes || 60, // Default to 60 minutes if not provided
      location,
      notes
    }

    console.log('Creating interview with data:', interviewData)

    let interview;

    // Try to create interview, handle trigger errors gracefully
    try {
      const { data: interviewResult, error } = await supabase
        .from('interviews')
        .insert(interviewData)
        .select('*')
        .single()

      if (error) {
        throw error
      }
      interview = interviewResult
    } catch (error: any) {
      console.error('Error creating interview:', error)
      console.error('Interview data that failed:', interviewData)

      // Check if it's the enum error from notification trigger
      if (error.message && error.message.includes('invalid input value for enum notification_type')) {
        console.log('Notification trigger failed due to enum mismatch, trying alternative approach...')

        // The trigger is preventing interview creation. We need to fix the enum first.
        return NextResponse.json({
          error: `Database configuration error: The notification_type enum is missing required values. To fix this, run the following SQL commands in your Supabase SQL editor:

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'interview_scheduled';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'interview_response';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'interview_reminder';

After running these commands, interview scheduling will work properly.`
        }, { status: 500 })
      } else {
        return NextResponse.json({
          error: `Failed to create interview: ${error.message || error.code || 'Unknown error'}`
        }, { status: 500 })
      }
    }

    // Fetch related data separately to build the complete response
    const { data: applicationData } = await supabase
      .from('applications')
      .select('id, first_name, last_name, email, phone')
      .eq('id', applicationId)
      .single()

    const { data: petData } = await supabase
      .from('pets')
      .select('id, name, type, breed')
      .eq('id', application.pet_id)
      .single()

    const { data: shelterData } = await supabase
      .from('shelters')
      .select('id, name')
      .eq('id', shelter.id)
      .single()

    const { data: adopterData } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, phone')
      .eq('id', application.adopter_id)
      .single()

    // Build the complete response
    const completeInterview = {
      ...interview,
      application: {
        ...applicationData,
        pet: petData
      },
      shelter: shelterData,
      adopter: adopterData
    }

    return NextResponse.json(completeInterview, { status: 201 })
  } catch (error) {
    console.error('Error in interviews POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}