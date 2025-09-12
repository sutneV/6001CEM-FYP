import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { applications, pets, shelters, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// GET /api/applications/[id] - Get specific application
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userDataHeader = request.headers.get('x-user-data')
    if (!userDataHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = JSON.parse(userDataHeader)
    const applicationId = params.id

    const applicationWithDetails = await db
      .select({
        id: applications.id,
        status: applications.status,
        submittedAt: applications.submittedAt,
        reviewedAt: applications.reviewedAt,
        reviewerNotes: applications.reviewerNotes,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
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
      .where(eq(applications.id, applicationId))
      .limit(1)

    if (applicationWithDetails.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const application = applicationWithDetails[0]

    // Check permissions
    if (user.role === 'adopter' && application.adopter.id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    } else if (user.role === 'shelter') {
      // Check if the shelter owns the pet
      const shelterResult = await db
        .select({ id: shelters.id })
        .from(shelters)
        .where(eq(shelters.userId, user.id))
        .limit(1)

      if (shelterResult.length === 0 || shelterResult[0].id !== application.pet.shelter.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}

// PATCH /api/applications/[id] - Update application status (for shelters)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userDataHeader = request.headers.get('x-user-data')
    if (!userDataHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = JSON.parse(userDataHeader)
    const applicationId = params.id
    const body = await request.json()
    const { status, reviewerNotes } = body

    // Only shelters can update application status
    if (user.role !== 'shelter') {
      return NextResponse.json({ error: 'Only shelters can update application status' }, { status: 403 })
    }

    // Verify the application exists and belongs to the shelter's pets
    const applicationCheck = await db
      .select({
        id: applications.id,
        shelterId: shelters.id,
      })
      .from(applications)
      .innerJoin(pets, eq(applications.petId, pets.id))
      .innerJoin(shelters, eq(pets.shelterId, shelters.id))
      .where(
        and(
          eq(applications.id, applicationId),
          eq(shelters.userId, user.id)
        )
      )
      .limit(1)

    if (applicationCheck.length === 0) {
      return NextResponse.json({ error: 'Application not found or access denied' }, { status: 404 })
    }

    // Validate status
    const validStatuses = ['submitted', 'under_review', 'interview_scheduled', 'meet_greet_scheduled', 'home_visit_scheduled', 'pending_approval', 'approved', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updatedApplication = await db
      .update(applications)
      .set({
        status: status as any,
        reviewerNotes: reviewerNotes || null,
        reviewedAt: status === 'approved' || status === 'rejected' ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(applications.id, applicationId))
      .returning()

    return NextResponse.json(updatedApplication[0])
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

// DELETE /api/applications/[id] - Withdraw application (for adopters)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userDataHeader = request.headers.get('x-user-data')
    if (!userDataHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = JSON.parse(userDataHeader)
    const applicationId = params.id

    // Only adopters can withdraw their own applications
    if (user.role !== 'adopter') {
      return NextResponse.json({ error: 'Only adopters can withdraw applications' }, { status: 403 })
    }

    // Verify the application belongs to the user and can be withdrawn
    const application = await db
      .select({
        id: applications.id,
        status: applications.status,
        adopterId: applications.adopterId,
      })
      .from(applications)
      .where(eq(applications.id, applicationId))
      .limit(1)

    if (application.length === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (application[0].adopterId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Can't withdraw approved or rejected applications
    if (['approved', 'rejected'].includes(application[0].status)) {
      return NextResponse.json({ error: 'Cannot withdraw approved or rejected applications' }, { status: 400 })
    }

    const withdrawnApplication = await db
      .update(applications)
      .set({
        status: 'withdrawn',
        updatedAt: new Date(),
      })
      .where(eq(applications.id, applicationId))
      .returning()

    return NextResponse.json(withdrawnApplication[0])
  } catch (error) {
    console.error('Error withdrawing application:', error)
    return NextResponse.json(
      { error: 'Failed to withdraw application' },
      { status: 500 }
    )
  }
}