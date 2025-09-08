import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export interface Community {
  id: string
  name: string
  description: string
  category: string
  bannerImage?: string | null
  ownerId: string
  ownerType: 'adopter' | 'shelter'
  memberCount: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
  isMember: boolean
  memberRole: 'owner' | 'moderator' | 'member' | null
}

export interface CreateCommunityData {
  name: string
  description: string
  category: string
  bannerImage?: string
  isPublic?: boolean
}

export const useCommunities = () => {
  const [communities, setCommunities] = useState<Community[]>([])
  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchCommunities = async (category?: string, search?: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (category && category !== 'all') params.append('category', category)
      if (search) params.append('search', search)

      const headers: HeadersInit = {}
      if (user) {
        headers['x-user-id'] = user.id
        headers['x-user-role'] = user.role
      }

      const response = await fetch(`/api/communities?${params.toString()}`, {
        headers,
      })
      const data = await response.json()

      if (data.success) {
        setCommunities(data.data)
        
        // Filter joined communities from the main list
        const joined = data.data.filter((community: Community) => community.isMember)
        setJoinedCommunities(joined)
      } else {
        setError(data.error || 'Failed to fetch communities')
      }
    } catch (err) {
      setError('Failed to fetch communities')
      console.error('Error fetching communities:', err)
    } finally {
      setLoading(false)
    }
  }

  const createCommunity = async (communityData: CreateCommunityData) => {
    try {
      if (!user) {
        throw new Error('Authentication required')
      }

      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-role': user.role,
        },
        body: JSON.stringify(communityData),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh communities list
        await fetchCommunities()
        return data.data
      } else {
        throw new Error(data.error || 'Failed to create community')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create community'
      setError(message)
      throw new Error(message)
    }
  }

  const joinCommunity = async (communityId: string) => {
    try {
      if (!user) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: {
          'x-user-id': user.id,
          'x-user-role': user.role,
        },
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setCommunities(prev =>
          prev.map(community =>
            community.id === communityId
              ? { ...community, isMember: true, memberCount: community.memberCount + 1 }
              : community
          )
        )
        
        // Add to joined communities
        const joinedCommunity = communities.find(c => c.id === communityId)
        if (joinedCommunity) {
          setJoinedCommunities(prev => [...prev, { ...joinedCommunity, isMember: true }])
        }

        return true
      } else {
        throw new Error(data.error || 'Failed to join community')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join community'
      setError(message)
      throw new Error(message)
    }
  }

  const leaveCommunity = async (communityId: string) => {
    try {
      if (!user) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id,
          'x-user-role': user.role,
        },
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setCommunities(prev =>
          prev.map(community =>
            community.id === communityId
              ? { ...community, isMember: false, memberCount: Math.max(0, community.memberCount - 1) }
              : community
          )
        )
        
        // Remove from joined communities
        setJoinedCommunities(prev => prev.filter(c => c.id !== communityId))

        return true
      } else {
        throw new Error(data.error || 'Failed to leave community')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to leave community'
      setError(message)
      throw new Error(message)
    }
  }

  const getCommunityById = useCallback(async (communityId: string) => {
    try {
      const headers: HeadersInit = {}
      if (user) {
        headers['x-user-id'] = user.id
        headers['x-user-role'] = user.role
      }

      const response = await fetch(`/api/communities/${communityId}`, {
        headers,
      })

      const data = await response.json()

      if (data.success) {
        return data.data
      } else {
        throw new Error(data.error || 'Failed to fetch community')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch community'
      setError(message)
      throw new Error(message)
    }
  }, [user, setError])

  useEffect(() => {
    fetchCommunities()
  }, [user])

  return {
    communities,
    joinedCommunities,
    loading,
    error,
    fetchCommunities,
    createCommunity,
    joinCommunity,
    leaveCommunity,
    getCommunityById,
    setError,
  }
}