import { NextRequest, NextResponse } from 'next/server'
import { createUser, createShelter } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone, city, role, shelterName, shelterDescription } = body

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (role === 'shelter' && !shelterName) {
      return NextResponse.json(
        { error: 'Shelter name is required for shelter accounts' },
        { status: 400 }
      )
    }

    // Create user
    const newUser = await createUser({
      email,
      password,
      firstName,
      lastName,
      phone,
      city,
      role: role as 'adopter' | 'shelter',
    })

    if (!newUser) {
      return NextResponse.json(
        { error: 'Failed to create account. Email may already exist.' },
        { status: 400 }
      )
    }

    // If shelter, create shelter record
    if (role === 'shelter') {
      const shelterCreated = await createShelter(newUser.id, {
        name: shelterName,
        description: shelterDescription,
      })

      if (!shelterCreated) {
        return NextResponse.json(
          { error: 'Account created but failed to set up shelter profile.' },
          { status: 500 }
        )
      }

      // Add shelter info to user object
      newUser.shelter = {
        id: '', // This would be set by the createShelter function in a real implementation
        name: shelterName,
      }
    }

    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}