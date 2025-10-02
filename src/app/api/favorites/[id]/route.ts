import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { favorites } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// DELETE /api/favorites/[id] - Remove a favorite
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userHeader = request.headers.get('x-user-data')
    if (!userHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = JSON.parse(userHeader)
    const favoriteId = params.id

    // Delete the favorite (only if it belongs to the user)
    const deleted = await db
      .delete(favorites)
      .where(and(eq(favorites.id, favoriteId), eq(favorites.userId, user.id)))
      .returning()

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Favorite not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing favorite:', error)
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 })
  }
}
