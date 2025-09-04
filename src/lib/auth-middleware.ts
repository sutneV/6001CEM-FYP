import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { users, shelters } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export interface AuthenticatedUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  shelterId?: string
}

export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Get user ID from headers (you'll need to set this from the client)
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return null
    }

    // Fetch user from database
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      return null
    }

    // If user is a shelter, get their shelter ID
    let shelterId: string | undefined
    if (user.role === 'shelter') {
      const [shelter] = await db
        .select({ id: shelters.id })
        .from(shelters)
        .where(eq(shelters.userId, user.id))
        .limit(1)
      
      shelterId = shelter?.id
    }

    return {
      ...user,
      shelterId,
    }
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}

export function requireAuth(handler: (request: NextRequest, user: AuthenticatedUser, context?: any) => Promise<Response>) {
  return async (request: NextRequest, context?: any) => {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return handler(request, user, context)
  }
}

export function requireRole(allowedRoles: string[]) {
  return (handler: (request: NextRequest, user: AuthenticatedUser, context?: any) => Promise<Response>) => {
    return async (request: NextRequest, context?: any) => {
      const user = await getAuthenticatedUser(request)
      
      if (!user) {
        return Response.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      if (!allowedRoles.includes(user.role)) {
        return Response.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }
      
      return handler(request, user, context)
    }
  }
}