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
  status: 'draft' | 'submitted' | 'under_review' | 'interview_scheduled' | 'meet_greet_scheduled' | 'home_visit_scheduled' | 'pending_approval' | 'approved' | 'rejected' | 'withdrawn'
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
      case 'interview_scheduled':
        return 50
      case 'meet_greet_scheduled':
        return 65
      case 'home_visit_scheduled':
        return 80
      case 'pending_approval':
        return 90
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
      case 'interview_scheduled':
        return 'Interview Scheduled'
      case 'meet_greet_scheduled':
        return 'Meet & Greet Scheduled'
      case 'home_visit_scheduled':
        return 'Home Visit Scheduled'
      case 'pending_approval':
        return 'Pending Final Approval'
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

  // Helper function to generate timeline based on status
  getTimelineForApplication(application: ApplicationWithDetails) {
    const timeline = []
    
    // Define the complete workflow steps
    const workflowSteps = [
      { status: 'submitted', step: 'Application Submitted' },
      { status: 'under_review', step: 'Initial Review' },
      { status: 'interview_scheduled', step: 'Interview Scheduled' },
      { status: 'meet_greet_scheduled', step: 'Meet & Greet Scheduled' },
      { status: 'home_visit_scheduled', step: 'Home Visit Scheduled' },
      { status: 'pending_approval', step: 'Pending Final Approval' },
      { status: 'approved', step: 'Application Approved' },
      { status: 'rejected', step: 'Application Rejected' }
    ]

    // Handle withdrawn status separately
    if (application.status === 'withdrawn') {
      timeline.push({
        step: 'Application Submitted',
        date: application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : new Date(application.createdAt).toLocaleDateString(),
        completed: true
      })
      timeline.push({
        step: 'Application Withdrawn',
        date: new Date(application.updatedAt).toLocaleDateString(),
        completed: true
      })
      return timeline
    }

    // Get status hierarchy for determining completion
    const statusHierarchy = ['draft', 'submitted', 'under_review', 'interview_scheduled', 'meet_greet_scheduled', 'home_visit_scheduled', 'pending_approval', 'approved', 'rejected']
    const currentStatusIndex = statusHierarchy.indexOf(application.status)

    // Build timeline based on current status
    for (const workflowStep of workflowSteps) {
      const stepIndex = statusHierarchy.indexOf(workflowStep.status)
      
      // Skip draft status in timeline
      if (workflowStep.status === 'draft') continue
      
      // For terminal statuses (approved/rejected), only show if it's the current status
      if ((workflowStep.status === 'approved' || workflowStep.status === 'rejected')) {
        if (application.status === workflowStep.status) {
          timeline.push({
            step: workflowStep.step,
            date: application.reviewedAt ? new Date(application.reviewedAt).toLocaleDateString() : 'Recently',
            completed: true
          })
        }
        continue
      }

      // For other statuses, show based on progression
      if (stepIndex <= currentStatusIndex) {
        let date = 'Pending'
        
        if (workflowStep.status === 'submitted') {
          date = application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : new Date(application.createdAt).toLocaleDateString()
        } else if (stepIndex < currentStatusIndex) {
          // Completed steps - show as completed date (use updatedAt as approximation)
          date = new Date(application.updatedAt).toLocaleDateString()
        } else if (stepIndex === currentStatusIndex) {
          // Current step - show when it was set to this status
          date = new Date(application.updatedAt).toLocaleDateString()
        }
        
        timeline.push({
          step: workflowStep.step,
          date: date,
          completed: stepIndex < currentStatusIndex,
          scheduled: stepIndex === currentStatusIndex
        })
      } else {
        // Future steps
        timeline.push({
          step: workflowStep.step,
          date: 'To be scheduled',
          completed: false,
          scheduled: false
        })
      }
    }

    return timeline
  }
}

export const applicationsService = new ApplicationsService()