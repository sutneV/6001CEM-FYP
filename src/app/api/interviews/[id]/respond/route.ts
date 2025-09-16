import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db/config'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userHeader = request.headers.get('x-user-data')

    if (!userHeader) {
      return NextResponse.json({ error: 'User data required' }, { status: 401 })
    }

    const user = JSON.parse(userHeader)
    const body = await request.json()
    const { adopterResponse, adopterResponseNotes } = body

    // Verify user is the adopter for this interview
    const { data: interview, error: fetchError } = await supabase
      .from('interviews')
      .select('adopter_id')
      .eq('id', params.id)
      .single()

    if (fetchError || !interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }

    if (interview.adopter_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update interview with response
    const { data: updatedInterview, error } = await supabase
      .from('interviews')
      .update({
        adopter_response: adopterResponse,
        adopter_response_notes: adopterResponseNotes,
        responded_at: new Date().toISOString(),
        status: adopterResponse ? 'confirmed' : 'cancelled'
      })
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating interview:', error)
      return NextResponse.json({ error: 'Failed to update interview' }, { status: 500 })
    }

    // Fetch related data separately to build the complete response
    const { data: applicationData } = await supabase
      .from('applications')
      .select('id, first_name, last_name, email, phone, pet_id')
      .eq('id', updatedInterview.application_id)
      .single()

    const { data: petData } = await supabase
      .from('pets')
      .select('id, name, type, breed')
      .eq('id', applicationData?.pet_id)
      .single()

    const { data: shelterData } = await supabase
      .from('shelters')
      .select('id, name')
      .eq('id', updatedInterview.shelter_id)
      .single()

    const { data: adopterData } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, phone')
      .eq('id', updatedInterview.adopter_id)
      .single()

    // Build the complete response
    const completeInterview = {
      ...updatedInterview,
      application: {
        ...applicationData,
        pet: petData
      },
      shelter: shelterData,
      adopter: adopterData
    }

    return NextResponse.json(completeInterview)
  } catch (error) {
    console.error('Error in interview respond:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}