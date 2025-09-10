export interface ApplicationFormData {
  petId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  occupation: string
  housingType: string
  ownRent: string
  address: string
  landlordPermission?: string
  yardType: string
  householdSize: number
  previousPets: string
  currentPets: string
  petExperience?: string
  veterinarian?: string
  workSchedule: string
  exerciseCommitment: string
  travelFrequency: string
  petPreferences: string
  householdMembers: string
  allergies: string
  childrenAges?: string
  references: string
  emergencyContact: string
  agreements: number[]
}

export interface ApplicationWithDetails {
  id: string
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'withdrawn'
  submittedAt: string | null
  reviewedAt: string | null
  reviewerNotes: string | null
  createdAt: string
  updatedAt: string
  
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  occupation: string
  
  // Living Situation
  housingType: string
  ownRent: string
  address: string
  landlordPermission: string | null
  yardType: string
  householdSize: number
  
  // Pet Experience
  previousPets: string
  currentPets: string
  petExperience: string | null
  veterinarian: string | null
  
  // Lifestyle
  workSchedule: string
  exerciseCommitment: string
  travelFrequency: string
  petPreferences: string
  
  // Household
  householdMembers: string
  allergies: string
  childrenAges: string | null
  
  // Agreement
  references: string
  emergencyContact: string
  agreements: number[]
  
  pet: {
    id: string
    name: string
    breed: string | null
    age: string
    type: string
    images: string[]
    shelter: {
      id: string
      name: string
    }
  }
  
  adopter?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
  }
}

class ApplicationsService {
  private baseUrl = '/api/applications'

  async getApplications(user: any, filters: { status?: string } = {}): Promise<ApplicationWithDetails[]> {
    const params = new URLSearchParams()
    if (filters.status) {
      params.append('status', filters.status)
    }

    const url = `${this.baseUrl}${params.toString() ? `?${params.toString()}` : ''}`
    
    const response = await fetch(url, {
      headers: {
        'x-user-data': JSON.stringify(user),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch applications')
    }

    return response.json()
  }

  async getApplication(id: string, user: any): Promise<ApplicationWithDetails> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: {
        'x-user-data': JSON.stringify(user),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch application')
    }

    return response.json()
  }

  async submitApplication(applicationData: ApplicationFormData, user: any): Promise<ApplicationWithDetails> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-data': JSON.stringify(user),
      },
      body: JSON.stringify(applicationData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to submit application')
    }

    return response.json()
  }

  async saveDraft(applicationData: Partial<ApplicationFormData>, user: any): Promise<ApplicationWithDetails> {
    const response = await fetch(`${this.baseUrl}/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-data': JSON.stringify(user),
      },
      body: JSON.stringify(applicationData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to save draft')
    }

    return response.json()
  }

  async updateApplicationStatus(
    id: string, 
    status: string, 
    reviewerNotes: string | null,
    user: any
  ): Promise<ApplicationWithDetails> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-data': JSON.stringify(user),
      },
      body: JSON.stringify({ status, reviewerNotes }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update application status')
    }

    return response.json()
  }

  async withdrawApplication(id: string, user: any): Promise<ApplicationWithDetails> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-data': JSON.stringify(user),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to withdraw application')
    }

    return response.json()
  }

  // Helper function to calculate progress based on status
  getProgressForStatus(status: string): number {
    switch (status) {
      case 'draft':
        return 0
      case 'submitted':
        return 20
      case 'under_review':
        return 40
      case 'approved':
        return 100
      case 'rejected':
        return 40
      case 'withdrawn':
        return 20
      default:
        return 0
    }
  }

  // Helper function to get current step description based on status
  getCurrentStepForStatus(status: string): string {
    switch (status) {
      case 'draft':
        return 'Draft Saved'
      case 'submitted':
        return 'Application Submitted'
      case 'under_review':
        return 'Under Review'
      case 'approved':
        return 'Approved'
      case 'rejected':
        return 'Not Approved'
      case 'withdrawn':
        return 'Withdrawn'
      default:
        return 'Unknown'
    }
  }

  // Helper function to generate mock timeline based on status
  getTimelineForApplication(application: ApplicationWithDetails) {
    const timeline = []
    
    timeline.push({
      step: 'Application Submitted',
      date: application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : new Date(application.createdAt).toLocaleDateString(),
      completed: ['submitted', 'under_review', 'approved', 'rejected'].includes(application.status)
    })

    if (application.status !== 'withdrawn') {
      timeline.push({
        step: 'Initial Review',
        date: application.status === 'under_review' || application.status === 'approved' || application.status === 'rejected' ? 
          'In Progress' : 'Pending',
        completed: ['approved', 'rejected'].includes(application.status),
        scheduled: application.status === 'under_review'
      })

      if (application.status === 'approved') {
        timeline.push({
          step: 'Application Approved',
          date: application.reviewedAt ? new Date(application.reviewedAt).toLocaleDateString() : 'Recently',
          completed: true
        })
      } else if (application.status === 'rejected') {
        timeline.push({
          step: 'Application Not Approved',
          date: application.reviewedAt ? new Date(application.reviewedAt).toLocaleDateString() : 'Recently',
          completed: true
        })
      } else {
        timeline.push({
          step: 'Meet & Greet',
          date: 'TBD',
          completed: false
        })

        timeline.push({
          step: 'Home Visit',
          date: 'TBD',
          completed: false
        })

        timeline.push({
          step: 'Final Decision',
          date: 'TBD',
          completed: false
        })
      }
    } else {
      timeline.push({
        step: 'Application Withdrawn',
        date: new Date(application.updatedAt).toLocaleDateString(),
        completed: true
      })
    }

    return timeline
  }
}

export const applicationsService = new ApplicationsService()