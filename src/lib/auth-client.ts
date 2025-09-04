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

export async function registerUser(data: RegisterData): Promise<UserWithRole | null> {
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

    return result.user
  } catch (error) {
    console.error('Registration error:', error)
    return null
  }
}

export async function loginUser(data: LoginData): Promise<UserWithRole | null> {
  try {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Login failed')
    }

    return result.user
  } catch (error) {
    console.error('Login error:', error)
    return null
  }
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