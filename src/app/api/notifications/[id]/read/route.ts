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

    // Verify user owns this notification
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (fetchError || !notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    if (notification.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Mark as read
    const { data: updatedNotification, error } = await supabase
      .from('notifications')
      .update({
        status: 'read',
        read_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error marking notification as read:', error)
      return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 })
    }

    return NextResponse.json(updatedNotification)
  } catch (error) {
    console.error('Error in notification read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}