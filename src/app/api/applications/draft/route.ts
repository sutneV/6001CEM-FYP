import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { applications, pets } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// POST /api/applications/draft - Save application as draft
export async function POST(request: NextRequest) {
  try {
    const userDataHeader = request.headers.get('x-user-data')
    if (!userDataHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = JSON.parse(userDataHeader)
    
    if (user.role !== 'adopter') {
      return NextResponse.json({ error: 'Only adopters can save application drafts' }, { status: 403 })
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

    if (!petId) {
      return NextResponse.json({ error: 'Pet ID is required' }, { status: 400 })
    }

    // Check if pet exists
    const pet = await db
      .select({ id: pets.id })
      .from(pets)
      .where(eq(pets.id, petId))
      .limit(1)

    if (pet.length === 0) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    // Check for existing draft
    const existingDraft = await db
      .select({ id: applications.id })
      .from(applications)
      .where(
        and(
          eq(applications.petId, petId),
          eq(applications.adopterId, user.id),
          eq(applications.status, 'draft')
        )
      )
      .limit(1)

    let draftApplication

    if (existingDraft.length > 0) {
      // Update existing draft
      draftApplication = await db
        .update(applications)
        .set({
          firstName: firstName || '',
          lastName: lastName || '',
          email: email || '',
          phone: phone || '',
          dateOfBirth: dateOfBirth || '',
          occupation: occupation || '',
          housingType: housingType || '',
          ownRent: ownRent || '',
          address: address || '',
          landlordPermission: landlordPermission || '',
          yardType: yardType || '',
          householdSize: householdSize || 0,
          previousPets: previousPets || '',
          currentPets: currentPets || '',
          petExperience: petExperience || '',
          veterinarian: veterinarian || '',
          workSchedule: workSchedule || '',
          exerciseCommitment: exerciseCommitment || '',
          travelFrequency: travelFrequency || '',
          petPreferences: petPreferences || '',
          householdMembers: householdMembers || '',
          allergies: allergies || '',
          childrenAges: childrenAges || '',
          references: references || '',
          emergencyContact: emergencyContact || '',
          agreements: agreements || [],
          updatedAt: new Date(),
        })
        .where(eq(applications.id, existingDraft[0].id))
        .returning()
    } else {
      // Create new draft
      draftApplication = await db
        .insert(applications)
        .values({
          petId,
          adopterId: user.id,
          firstName: firstName || '',
          lastName: lastName || '',
          email: email || '',
          phone: phone || '',
          dateOfBirth: dateOfBirth || '',
          occupation: occupation || '',
          housingType: housingType || '',
          ownRent: ownRent || '',
          address: address || '',
          landlordPermission: landlordPermission || '',
          yardType: yardType || '',
          householdSize: householdSize || 0,
          previousPets: previousPets || '',
          currentPets: currentPets || '',
          petExperience: petExperience || '',
          veterinarian: veterinarian || '',
          workSchedule: workSchedule || '',
          exerciseCommitment: exerciseCommitment || '',
          travelFrequency: travelFrequency || '',
          petPreferences: petPreferences || '',
          householdMembers: householdMembers || '',
          allergies: allergies || '',
          childrenAges: childrenAges || '',
          references: references || '',
          emergencyContact: emergencyContact || '',
          agreements: agreements || [],
          status: 'draft',
        })
        .returning()
    }

    return NextResponse.json(draftApplication[0])
  } catch (error) {
    console.error('Error saving application draft:', error)
    return NextResponse.json(
      { error: 'Failed to save application draft' },
      { status: 500 }
    )
  }
}