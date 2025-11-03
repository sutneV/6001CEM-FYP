import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function usePendingApplications() {
  const { user } = useAuth()
  const [pendingCount, setPendingCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const fetchPendingCount = useCallback(async () => {
    if (!user || user.role !== 'shelter') {
      setPendingCount(0)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/applications?status=submitted,under_review', {
        headers: {
          'x-user-data': JSON.stringify(user),
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPendingCount(Array.isArray(data) ? data.length : 0)
      } else {
        setPendingCount(0)
      }
    } catch (error) {
      console.error('Error fetching pending applications count:', error)
      setPendingCount(0)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchPendingCount()

    // Refresh pending count every 60 seconds
    const interval = setInterval(fetchPendingCount, 60000)

    return () => clearInterval(interval)
  }, [fetchPendingCount])

  return {
    pendingCount,
    loading,
    refresh: fetchPendingCount,
  }
}
