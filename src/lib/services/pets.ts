import { Pet, NewPet } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/session'

export interface PetWithShelter extends Pet {
  shelter: {
    id: string
    name: string
    address: string | null
  }
}

export interface PetFilters {
  type?: string
  age?: string
  size?: string
  status?: string
}

export class PetsService {
  private getAuthHeaders() {
    const user = getCurrentUser()
    return user ? { 'x-user-id': user.id } : {}
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || 'Something went wrong')
    }
    return response.json()
  }

  // For adopters - browse all available pets
  async getAllPets(filters?: PetFilters): Promise<PetWithShelter[]> {
    const searchParams = new URLSearchParams()
    if (filters?.type) searchParams.set('type', filters.type)
    if (filters?.age) searchParams.set('age', filters.age)
    if (filters?.size) searchParams.set('size', filters.size)
    if (filters?.status) searchParams.set('status', filters.status)

    const response = await fetch(`/api/pets?${searchParams.toString()}`)
    return this.handleResponse(response)
  }

  // For shelters - get their own pets
  async getShelterPets(): Promise<PetWithShelter[]> {
    const response = await fetch('/api/shelter/pets', {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      }
    })
    return this.handleResponse(response)
  }

  // Get specific pet
  async getPet(id: string): Promise<Pet> {
    const response = await fetch(`/api/shelter/pets/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      }
    })
    return this.handleResponse(response)
  }

  // Create new pet
  async createPet(petData: Omit<NewPet, 'id' | 'shelterId' | 'createdAt' | 'updatedAt'>): Promise<Pet> {
    const response = await fetch('/api/shelter/pets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify(petData),
    })
    return this.handleResponse(response)
  }

  // Update pet
  async updatePet(id: string, petData: Partial<NewPet>): Promise<Pet> {
    const response = await fetch(`/api/shelter/pets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify(petData),
    })
    return this.handleResponse(response)
  }

  // Delete pet
  async deletePet(id: string): Promise<void> {
    const response = await fetch(`/api/shelter/pets/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      }
    })
    await this.handleResponse(response)
  }
}

export const petsService = new PetsService()