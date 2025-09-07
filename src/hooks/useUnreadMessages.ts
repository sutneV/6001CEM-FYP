import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function useUnreadMessages() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/messages/unread-count', {
        headers: {
          'x-user-data': JSON.stringify(user),
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unreadCount || 0)
      } else {
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchUnreadCount()

    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)

    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  return {
    unreadCount,
    loading,
    refresh: fetchUnreadCount,
  }
}