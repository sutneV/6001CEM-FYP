import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { db } from './db'
import { users, shelters } from './db/schema'
import { eq, and } from 'drizzle-orm'
import type { User } from './db/schema'

export interface UserWithRole extends Omit<User, 'password'> {
  shelter?: {
    id: string
    name: string
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export async function createUser(userData: {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  city?: string
  role: 'adopter' | 'shelter'
}): Promise<UserWithRole | null> {
  try {
    const existingUser = await db.select().from(users).where(eq(users.email, userData.email)).limit(1)

    if (existingUser.length > 0) {
      throw new Error('User with this email already exists')
    }

    const hashedPassword = await hashPassword(userData.password)

    // Generate verification token for adopters only
    const needsVerification = userData.role === 'adopter'
    const verificationToken = needsVerification ? crypto.randomBytes(32).toString('hex') : null
    const verificationTokenExpiry = needsVerification
      ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      : null

    const newUser = await db.insert(users).values({
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      city: userData.city,
      role: userData.role,
      emailVerified: !needsVerification, // Shelters are auto-verified
      verificationToken,
      verificationTokenExpiry,
    }).returning()

    if (newUser.length === 0) {
      throw new Error('Failed to create user')
    }

    const { password: _, ...userWithoutPassword } = newUser[0]
    return userWithoutPassword as UserWithRole
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

export async function createShelter(userId: string, shelterData: {
  name: string
  description?: string
  address?: string
  registrationNumber?: string
  website?: string
}): Promise<boolean> {
  try {
    await db.insert(shelters).values({
      userId,
      name: shelterData.name,
      description: shelterData.description,
      address: shelterData.address,
      registrationNumber: shelterData.registrationNumber,
      website: shelterData.website,
    })
    return true
  } catch (error) {
    console.error('Error creating shelter:', error)
    return false
  }
}

export async function authenticateUser(email: string, password: string): Promise<UserWithRole | null> {
  try {
    const userResult = await db.select().from(users).where(
      and(
        eq(users.email, email),
        eq(users.isActive, 'true')
      )
    ).limit(1)

    if (userResult.length === 0) {
      return null
    }

    const user = userResult[0]
    const passwordMatch = await verifyPassword(password, user.password)

    if (!passwordMatch) {
      return null
    }

    // Check if email is verified (only for adopters)
    if (user.role === 'adopter' && !user.emailVerified) {
      throw new Error('EMAIL_NOT_VERIFIED')
    }

    let userWithRole: UserWithRole = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      city: user.city,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      avatar: user.avatar,
      bio: user.bio,
      emailVerified: user.emailVerified,
    }

    if (user.role === 'shelter') {
      const shelterResult = await db.select().from(shelters).where(eq(shelters.userId, user.id)).limit(1)
      if (shelterResult.length > 0) {
        userWithRole.shelter = {
          id: shelterResult[0].id,
          name: shelterResult[0].name,
        }
      }
    }

    return userWithRole
  } catch (error) {
    console.error('Error authenticating user:', error)
    if (error instanceof Error && error.message === 'EMAIL_NOT_VERIFIED') {
      throw error
    }
    return null
  }
}

// Admin credentials are now stored in the database
// Use the same authenticateUser function for all users including admin

export function getRedirectPath(role: string): string {
  switch (role) {
    case 'adopter':
      return '/dashboard'
    case 'shelter':
      return '/dashboard/shelter'
    case 'admin':
      return '/dashboard/admin'
    default:
      return '/dashboard'
  }
}