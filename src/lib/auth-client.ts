export interface UserWithRole {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  city: string | null
  role: string
  isActive: string
  createdAt: Date
  updatedAt: Date
  shelter?: {
    id: string
    name: string
  }
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  city?: string
  role: 'adopter' | 'shelter'
  shelterName?: string
  shelterDescription?: string
}

export interface LoginData {
  email: string
  password: string
}

export async function registerUser(data: RegisterData): Promise<{ user: UserWithRole | null, requiresVerification?: boolean, message?: string }> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Registration failed')
    }

    return {
      user: result.user,
      requiresVerification: result.requiresVerification,
      message: result.message
    }
  } catch (error) {
    console.error('Registration error:', error)
    return { user: null }
  }
}

export async function loginUser(data: LoginData): Promise<UserWithRole | null> {
  const response = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const result = await response.json()

  if (!response.ok) {
    const error = new Error(result.error || 'Login failed')
    ;(error as any).status = response.status
    throw error
  }

  return result.user
}

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