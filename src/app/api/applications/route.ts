import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { applications, pets, shelters, users } from '@/lib/db/schema'
import { eq, and, desc, inArray } from 'drizzle-orm'

// GET /api/applications - List applications for the current user
export async function GET(request: NextRequest) {
  try {
    const userDataHeader = request.headers.get('x-user-data')
    if (!userDataHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = JSON.parse(userDataHeader)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Build query conditions
    const conditions = []
    
    // Filter by user role
    if (user.role === 'adopter') {
      conditions.push(eq(applications.adopterId, user.id))
    } else if (user.role === 'shelter') {
      // For shelter users, get applications for their pets
      const shelterResult = await db
        .select({ id: shelters.id })
        .from(shelters)
        .where(eq(shelters.userId, user.id))
        .limit(1)

      if (shelterResult.length === 0) {
        return NextResponse.json({ error: 'Shelter not found' }, { status: 404 })
      }

      // Get applications for pets belonging to this shelter
      const shelterPets = await db
        .select({ id: pets.id })
        .from(pets)
        .where(eq(pets.shelterId, shelterResult[0].id))

      if (shelterPets.length === 0) {
        return NextResponse.json([])
      }

      const petIds = shelterPets.map(pet => pet.id)
      conditions.push(inArray(applications.petId, petIds))
    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 })
    }

    if (status) {
      conditions.push(eq(applications.status, status as any))
    }

    let applicationsWithDetails

    if (user.role === 'adopter') {
      // For adopters, simpler query without adopter details
      applicationsWithDetails = await db
        .select({
          id: applications.id,
          status: applications.status,
          submittedAt: applications.submittedAt,
          createdAt: applications.createdAt,
          updatedAt: applications.updatedAt,
          reviewerNotes: applications.reviewerNotes,
          // Personal info
          firstName: applications.firstName,
          lastName: applications.lastName,
          email: applications.email,
          phone: applications.phone,
          dateOfBirth: applications.dateOfBirth,
          occupation: applications.occupation,
          // Living situation
          housingType: applications.housingType,
          ownRent: applications.ownRent,
          address: applications.address,
          landlordPermission: applications.landlordPermission,
          yardType: applications.yardType,
          householdSize: applications.householdSize,
          // Pet experience
          previousPets: applications.previousPets,
          currentPets: applications.currentPets,
          petExperience: applications.petExperience,
          veterinarian: applications.veterinarian,
          // Lifestyle
          workSchedule: applications.workSchedule,
          exerciseCommitment: applications.exerciseCommitment,
          travelFrequency: applications.travelFrequency,
          petPreferences: applications.petPreferences,
          // Household
          householdMembers: applications.householdMembers,
          allergies: applications.allergies,
          childrenAges: applications.childrenAges,
          // Agreement
          references: applications.references,
          emergencyContact: applications.emergencyContact,
          agreements: applications.agreements,
          pet: {
            id: pets.id,
            name: pets.name,
            breed: pets.breed,
            age: pets.age,
            type: pets.type,
            images: pets.images,
            shelter: {
              id: shelters.id,
              name: shelters.name,
            }
          }
        })
        .from(applications)
        .innerJoin(pets, eq(applications.petId, pets.id))
        .innerJoin(shelters, eq(pets.shelterId, shelters.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(applications.createdAt))
    } else {
      // For shelters, include adopter details
      applicationsWithDetails = await db
        .select({
          id: applications.id,
          status: applications.status,
          submittedAt: applications.submittedAt,
          createdAt: applications.createdAt,
          updatedAt: applications.updatedAt,
          reviewerNotes: applications.reviewerNotes,
          // Personal info
          firstName: applications.firstName,
          lastName: applications.lastName,
          email: applications.email,
          phone: applications.phone,
          dateOfBirth: applications.dateOfBirth,
          occupation: applications.occupation,
          // Living situation
          housingType: applications.housingType,
          ownRent: applications.ownRent,
          address: applications.address,
          landlordPermission: applications.landlordPermission,
          yardType: applications.yardType,
          householdSize: applications.householdSize,
          // Pet experience
          previousPets: applications.previousPets,
          currentPets: applications.currentPets,
          petExperience: applications.petExperience,
          veterinarian: applications.veterinarian,
          // Lifestyle
          workSchedule: applications.workSchedule,
          exerciseCommitment: applications.exerciseCommitment,
          travelFrequency: applications.travelFrequency,
          petPreferences: applications.petPreferences,
          // Household
          householdMembers: applications.householdMembers,
          allergies: applications.allergies,
          childrenAges: applications.childrenAges,
          // Agreement
          references: applications.references,
          emergencyContact: applications.emergencyContact,
          agreements: applications.agreements,
          pet: {
            id: pets.id,
            name: pets.name,
            breed: pets.breed,
            age: pets.age,
            type: pets.type,
            images: pets.images,
            shelter: {
              id: shelters.id,
              name: shelters.name,
            }
          },
          adopter: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            phone: users.phone,
          }
        })
        .from(applications)
        .innerJoin(pets, eq(applications.petId, pets.id))
        .innerJoin(shelters, eq(pets.shelterId, shelters.id))
        .innerJoin(users, eq(applications.adopterId, users.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(applications.createdAt))
    }

    return NextResponse.json(applicationsWithDetails)
  } catch (error) {
    console.error('Error fetching applications:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      user: user ? { id: user.id, role: user.role } : 'No user'
    })
    return NextResponse.json(
      { 
        error: 'Failed to fetch applications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/applications - Create a new application
export async function POST(request: NextRequest) {
  try {
    const userDataHeader = request.headers.get('x-user-data')
    if (!userDataHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = JSON.parse(userDataHeader)
    
    if (user.role !== 'adopter') {
      return NextResponse.json({ error: 'Only adopters can submit applications' }, { status: 403 })
    }

    const body = await request.json()
    const {
      petId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      occupation,
      housingType,
      ownRent,
      address,
      landlordPermission,
      yardType,
      householdSize,
      previousPets,
      currentPets,
      petExperience,
      veterinarian,
      workSchedule,
      exerciseCommitment,
      travelFrequency,
      petPreferences,
      householdMembers,
      allergies,
      childrenAges,
      references,
      emergencyContact,
      agreements,
    } = body

    // Validate required fields
    if (!petId || !firstName || !lastName || !email || !phone || !dateOfBirth || !occupation) {
      return NextResponse.json({ error: 'Missing required personal information' }, { status: 400 })
    }

    // Check if pet exists and is available
    const pet = await db
      .select({ id: pets.id, status: pets.status })
      .from(pets)
      .where(eq(pets.id, petId))
      .limit(1)

    if (pet.length === 0) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    if (pet[0].status !== 'available') {
      return NextResponse.json({ error: 'Pet is no longer available for adoption' }, { status: 400 })
    }

    // Check for existing application from this user for this pet
    const existingApplication = await db
      .select({ id: applications.id })
      .from(applications)
      .where(
        and(
          eq(applications.petId, petId),
          eq(applications.adopterId, user.id),
          // Don't allow new applications if there's already one that's not withdrawn
          eq(applications.status, 'submitted')
        )
      )
      .limit(1)

    if (existingApplication.length > 0) {
      return NextResponse.json({ error: 'You have already submitted an application for this pet' }, { status: 400 })
    }

    const newApplication = await db
      .insert(applications)
      .values({
        petId,
        adopterId: user.id,
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        occupation,
        housingType,
        ownRent,
        address,
        landlordPermission,
        yardType,
        householdSize,
        previousPets,
        currentPets,
        petExperience,
        veterinarian,
        workSchedule,
        exerciseCommitment,
        travelFrequency,
        petPreferences,
        householdMembers,
        allergies,
        childrenAges,
        references,
        emergencyContact,
        agreements,
        status: 'submitted',
        submittedAt: new Date(),
      })
      .returning()

    return NextResponse.json(newApplication[0])
  } catch (error) {
    console.error('Error creating application:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      user: user ? { id: user.id, role: user.role } : 'No user',
      petId
    })
    return NextResponse.json(
      { 
        error: 'Failed to create application',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}