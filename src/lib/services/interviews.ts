import { format } from 'date-fns'

export interface InterviewData {
  id: string
  applicationId: string
  shelterId: string
  adopterId: string
  type: 'interview' | 'meet_greet' | 'home_visit'
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
  scheduledDate: string
  scheduledTime: string
  durationMinutes: number
  location: string
  notes?: string
  shelterNotes?: string
  adopterResponse?: boolean // true = accepted, false = rejected, null = pending
  adopterResponseNotes?: string
  respondedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateInterviewData {
  applicationId: string
  type: 'interview' | 'meet_greet' | 'home_visit'
  date: Date
  time: string
  duration: string
  location: string
  notes?: string
}

export interface InterviewWithDetails extends InterviewData {
  application: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    pet: {
      id: string
      name: string
      type: string
      breed?: string
    }
  }
  shelter: {
    id: string
    name: string
  }
  adopter: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
}

export interface NotificationData {
  id: string
  userId: string
  type: 'interview_scheduled' | 'interview_response' | 'interview_reminder' | 'general'
  status: 'pending' | 'sent' | 'read' | 'dismissed'
  title: string
  message: string
  metadata: Record<string, any>
  readAt?: string
  createdAt: string
  updatedAt: string
}

class InterviewsService {
  private baseUrl = '/api/interviews'

  async scheduleInterview(interviewData: CreateInterviewData, user: any): Promise<InterviewWithDetails> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-data': JSON.stringify(user),
      },
      body: JSON.stringify({
        ...interviewData,
        scheduledDate: format(interviewData.date, 'yyyy-MM-dd'),
        scheduledTime: interviewData.time,
        durationMinutes: parseInt(interviewData.duration),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to schedule interview')
    }

    return response.json()
  }

  async getInterviews(user: any, filters: {
    status?: string
    type?: string
    startDate?: string
    endDate?: string
  } = {}): Promise<InterviewWithDetails[]> {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })

    const url = `${this.baseUrl}${params.toString() ? `?${params.toString()}` : ''}`

    const response = await fetch(url, {
      headers: {
        'x-user-data': JSON.stringify(user),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch interviews')
    }

    return response.json()
  }

  async getInterview(id: string, user: any): Promise<InterviewWithDetails> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: {
        'x-user-data': JSON.stringify(user),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch interview')
    }

    return response.json()
  }

  async respondToInterview(
    id: string,
    response: boolean,
    notes?: string,
    user?: any
  ): Promise<InterviewWithDetails> {
    const apiResponse = await fetch(`${this.baseUrl}/${id}/respond`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-data': JSON.stringify(user),
      },
      body: JSON.stringify({
        adopterResponse: response,
        adopterResponseNotes: notes,
      }),
    })

    if (!apiResponse.ok) {
      const error = await apiResponse.json()
      throw new Error(error.error || 'Failed to respond to interview')
    }

    return apiResponse.json()
  }

  async updateInterviewStatus(
    id: string,
    status: InterviewData['status'],
    notes?: string,
    user?: any
  ): Promise<InterviewWithDetails> {
    const response = await fetch(`${this.baseUrl}/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-data': JSON.stringify(user),
      },
      body: JSON.stringify({
        status,
        shelterNotes: notes,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update interview status')
    }

    return response.json()
  }

  async rescheduleInterview(
    id: string,
    newDate: Date,
    newTime: string,
    notes?: string,
    user?: any
  ): Promise<InterviewWithDetails> {
    const response = await fetch(`${this.baseUrl}/${id}/reschedule`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-data': JSON.stringify(user),
      },
      body: JSON.stringify({
        scheduledDate: newDate.toISOString().split('T')[0],
        scheduledTime: newTime,
        notes,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to reschedule interview')
    }

    return response.json()
  }

  async cancelInterview(id: string, reason?: string, user?: any): Promise<InterviewWithDetails> {
    const response = await fetch(`${this.baseUrl}/${id}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-data': JSON.stringify(user),
      },
      body: JSON.stringify({
        reason,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to cancel interview')
    }

    return response.json()
  }

  // Notification methods
  async getNotifications(user: any, filters: {
    status?: string
    type?: string
    limit?: number
  } = {}): Promise<NotificationData[]> {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString())
    })

    const url = `/api/notifications${params.toString() ? `?${params.toString()}` : ''}`

    const response = await fetch(url, {
      headers: {
        'x-user-data': JSON.stringify(user),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch notifications')
    }

    return response.json()
  }

  async markNotificationAsRead(id: string, user: any): Promise<NotificationData> {
    const response = await fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-data': JSON.stringify(user),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to mark notification as read')
    }

    return response.json()
  }

  async dismissNotification(id: string, user: any): Promise<NotificationData> {
    const response = await fetch(`/api/notifications/${id}/dismiss`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-data': JSON.stringify(user),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to dismiss notification')
    }

    return response.json()
  }

  // Calendar integration methods
  async getCalendarEvents(user: any, filters: {
    startDate?: string
    endDate?: string
    eventType?: string
  } = {}): Promise<any[]> {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })

    const url = `/api/calendar/events${params.toString() ? `?${params.toString()}` : ''}`

    const response = await fetch(url, {
      headers: {
        'x-user-data': JSON.stringify(user),
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch calendar events')
    }

    return response.json()
  }

  // Helper methods
  getInterviewTypeLabel(type: InterviewData['type']): string {
    switch (type) {
      case 'interview':
        return 'Phone/Video Interview'
      case 'meet_greet':
        return 'Meet & Greet'
      case 'home_visit':
        return 'Home Visit'
      default:
        return 'Interview'
    }
  }

  getInterviewStatusLabel(status: InterviewData['status']): string {
    switch (status) {
      case 'scheduled':
        return 'Scheduled'
      case 'confirmed':
        return 'Confirmed'
      case 'completed':
        return 'Completed'
      case 'cancelled':
        return 'Cancelled'
      case 'rescheduled':
        return 'Rescheduled'
      default:
        return 'Unknown'
    }
  }

  getInterviewStatusColor(status: InterviewData['status']): string {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'rescheduled':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  formatInterviewDateTime(date: string, time: string): string {
    const dateObj = new Date(`${date}T${time}`)
    return dateObj.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }
}

export const interviewsService = new InterviewsService()