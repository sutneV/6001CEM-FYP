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
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const limit = searchParams.get('limit')

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)

    // Apply filters
    if (status) query = query.eq('status', status)
    if (type) query = query.eq('type', type)

    // Order by created date (newest first)
    query = query.order('created_at', { ascending: false })

    // Apply limit
    if (limit) query = query.limit(parseInt(limit))

    const { data, error } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in notifications GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userHeader = request.headers.get('x-user-data')

    if (!userHeader) {
      return NextResponse.json({ error: 'User data required' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, type, title, message, metadata } = body

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        metadata: metadata || {}
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
    }

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Error in notifications POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}