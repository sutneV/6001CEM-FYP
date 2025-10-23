import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { applications } from '@/lib/db/schema'

export async function GET() {
  try {
    console.log('Testing applications table query...')
    const result = await db.select().from(applications).limit(5)
    console.log('Query successful, found:', result.length, 'applications')
    return NextResponse.json({ success: true, count: result.length, sample: result })
  } catch (error) {
    console.error('Error querying applications:', error)
    return NextResponse.json(
      {
        error: 'Query failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null
      },
      { status: 500 }
    )
  }
}
