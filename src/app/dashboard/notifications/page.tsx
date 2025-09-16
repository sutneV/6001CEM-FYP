"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import {
  Bell,
  Clock,
  Calendar,
  Phone,
  Heart,
  Home,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Info,
  MapPin,
  AlertCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import { interviewsService, NotificationData } from "@/lib/services/interviews"
import { toast } from "sonner"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [loading, setLoading] = useState(true)
  const [responseDialog, setResponseDialog] = useState<{
    open: boolean
    notification?: NotificationData
  }>({ open: false })
  const [response, setResponse] = useState<boolean | null>(null)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await interviewsService.getNotifications(user)
      setNotifications(data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    if (!user) return

    try {
      await interviewsService.markNotificationAsRead(notificationId, user)
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, status: 'read' as const, readAt: new Date().toISOString() }
            : n
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleInterviewResponse = async () => {
    if (!responseDialog.notification || response === null) return

    try {
      const interviewId = responseDialog.notification.metadata?.interview_id
      if (!interviewId) throw new Error('Interview ID not found')

      await interviewsService.respondToInterview(interviewId, response, notes, user)

      toast.success(
        response
          ? 'Interview accepted successfully!'
          : 'Interview declined. The shelter has been notified.'
      )

      // Mark notification as read and refresh
      await markAsRead(responseDialog.notification.id)
      await fetchNotifications()

      setResponseDialog({ open: false })
      setResponse(null)
      setNotes("")
    } catch (error) {
      console.error('Error responding to interview:', error)
      toast.error('Failed to submit response')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'interview_scheduled':
        return <Calendar className="h-6 w-6 text-blue-600" />
      case 'interview_response':
        return <MessageSquare className="h-6 w-6 text-green-600" />
      case 'interview_reminder':
        return <Clock className="h-6 w-6 text-orange-600" />
      default:
        return <Info className="h-6 w-6 text-gray-600" />
    }
  }

  const getInterviewIcon = (type: string) => {
    switch (type) {
      case 'interview': return <Phone className="h-5 w-5 text-blue-600" />
      case 'meet_greet': return <Heart className="h-5 w-5 text-purple-600" />
      case 'home_visit': return <Home className="h-5 w-5 text-green-600" />
      default: return <Calendar className="h-5 w-5 text-gray-600" />
    }
  }

  const getInterviewLabel = (type: string) => {
    switch (type) {
      case 'interview': return 'Phone/Video Interview'
      case 'meet_greet': return 'Meet & Greet'
      case 'home_visit': return 'Home Visit'
      default: return 'Interview'
    }
  }

  const getNotificationColor = (type: string, status: string) => {
    const isUnread = status === 'pending' || status === 'sent'

    switch (type) {
      case 'interview_scheduled':
        return isUnread ? 'border-l-blue-500 bg-blue-50' : 'border-l-blue-300 bg-blue-25'
      case 'interview_response':
        return isUnread ? 'border-l-green-500 bg-green-50' : 'border-l-green-300 bg-green-25'
      case 'interview_reminder':
        return isUnread ? 'border-l-orange-500 bg-orange-50' : 'border-l-orange-300 bg-orange-25'
      default:
        return isUnread ? 'border-l-gray-500 bg-gray-50' : 'border-l-gray-300 bg-gray-25'
    }
  }

  const unreadCount = notifications.filter(n => n.status === 'pending' || n.status === 'sent').length

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to view notifications.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={fadeIn}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-2">
                Stay updated on your adoption applications and interviews
              </p>
            </div>
            <div className="flex items-center gap-4">
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {unreadCount} new notification{unreadCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

        {/* Notifications List */}
        <motion.div variants={fadeIn}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                <p className="text-gray-500 text-center max-w-md">
                  You'll receive notifications here when shelters schedule interviews or respond to your applications.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  variants={fadeIn}
                  whileHover={{ y: -2 }}
                  className="group"
                >
                  <Card
                    className={`border-l-4 transition-all cursor-pointer ${getNotificationColor(notification.type, notification.status)}`}
                    onClick={() => {
                      if (notification.status === 'pending' || notification.status === 'sent') {
                        markAsRead(notification.id)
                      }

                      if (notification.type === 'interview_scheduled') {
                        setResponseDialog({ open: true, notification })
                      }
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                {notification.title}
                              </h3>
                              <p className="text-gray-600 mt-1 leading-relaxed">
                                {notification.message}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {(notification.status === 'pending' || notification.status === 'sent') && (
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                              </Badge>
                            </div>
                          </div>

                          {/* Interview Details */}
                          {notification.type === 'interview_scheduled' && notification.metadata && (
                            <div className="mt-4 p-4 bg-white rounded-lg border">
                              <div className="flex items-center gap-2 mb-3">
                                {getInterviewIcon(notification.metadata.interview_type)}
                                <h4 className="font-medium">
                                  {getInterviewLabel(notification.metadata.interview_type)} Details
                                </h4>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  <span className="text-gray-600">
                                    {notification.metadata.scheduled_date && notification.metadata.scheduled_time
                                      ? format(new Date(`${notification.metadata.scheduled_date}T${notification.metadata.scheduled_time}`), 'EEEE, MMMM d, yyyy • h:mm a')
                                      : 'Date to be confirmed'
                                    }
                                  </span>
                                </div>
                                {notification.metadata.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600">{notification.metadata.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Heart className="h-4 w-4 text-gray-500" />
                                  <span className="text-gray-600">Pet: {notification.metadata.pet_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Home className="h-4 w-4 text-gray-500" />
                                  <span className="text-gray-600">Shelter: {notification.metadata.shelter_name}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Action Button */}
                          {notification.type === 'interview_scheduled' &&
                           (notification.status === 'pending' || notification.status === 'sent') && (
                            <div className="mt-4">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setResponseDialog({ open: true, notification })
                                }}
                                className="bg-teal-600 hover:bg-teal-700"
                              >
                                Respond to Interview Request
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Interview Response Dialog */}
      {responseDialog.notification && (
        <Dialog open={responseDialog.open} onOpenChange={(open) => {
          setResponseDialog({ open })
          if (!open) {
            setResponse(null)
            setNotes("")
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {getInterviewIcon(responseDialog.notification.metadata?.interview_type)}
                <div>
                  <div>Respond to {getInterviewLabel(responseDialog.notification.metadata?.interview_type)}</div>
                  <DialogDescription className="text-sm font-normal mt-1">
                    For {responseDialog.notification.metadata?.pet_name} with {responseDialog.notification.metadata?.shelter_name}
                  </DialogDescription>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Interview Details */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Date & Time</p>
                        <p className="text-sm text-gray-600">
                          {responseDialog.notification.metadata?.scheduled_date && responseDialog.notification.metadata?.scheduled_time
                            ? format(new Date(`${responseDialog.notification.metadata.scheduled_date}T${responseDialog.notification.metadata.scheduled_time}`), 'EEEE, MMMM d, yyyy • h:mm a')
                            : 'To be confirmed'
                          }
                        </p>
                      </div>
                    </div>
                    {responseDialog.notification.metadata?.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-gray-600">{responseDialog.notification.metadata.location}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Response Selection */}
              <div className="space-y-4">
                <h4 className="font-medium">Your Response</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={response === true ? "default" : "outline"}
                    className={`h-20 flex-col gap-2 ${
                      response === true
                        ? "bg-green-600 hover:bg-green-700"
                        : "hover:bg-green-50 hover:border-green-300"
                    }`}
                    onClick={() => setResponse(true)}
                  >
                    <CheckCircle2 className="h-6 w-6" />
                    Accept
                  </Button>
                  <Button
                    variant={response === false ? "destructive" : "outline"}
                    className={`h-20 flex-col gap-2 ${
                      response === false
                        ? ""
                        : "hover:bg-red-50 hover:border-red-300"
                    }`}
                    onClick={() => setResponse(false)}
                  >
                    <XCircle className="h-6 w-6" />
                    Decline
                  </Button>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Additional Notes (Optional)
                </label>
                <Textarea
                  placeholder={
                    response === true
                      ? "Any questions or special requests for the interview..."
                      : response === false
                      ? "Let us know if you'd like to reschedule or have other preferences..."
                      : "Add any notes or comments..."
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setResponseDialog({ open: false })}>
                Cancel
              </Button>
              <Button
                onClick={handleInterviewResponse}
                disabled={response === null}
                className={response === true ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {response === true ? "Accept Interview" : "Decline Interview"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}