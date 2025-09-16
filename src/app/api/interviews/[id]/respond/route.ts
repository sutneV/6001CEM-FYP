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
      .single()

    if (error) {
      console.error('Error updating interview:', error)
      return NextResponse.json({ error: 'Failed to update interview' }, { status: 500 })
    }

    return NextResponse.json(updatedInterview)
  } catch (error) {
    console.error('Error in interview respond:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}