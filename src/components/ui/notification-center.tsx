"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import {
  Bell,
  Check,
  Clock,
  X,
  Calendar,
  Phone,
  Heart,
  Home,
  ChevronRight,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
  MessageSquare,
  MapPin,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import { interviewsService, NotificationData } from "@/lib/services/interviews"
import { toast } from "sonner"

interface InterviewResponseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notification: NotificationData
  onRespond: (response: boolean, notes?: string) => Promise<void>
  isLoading?: boolean
}

function InterviewResponseDialog({
  open,
  onOpenChange,
  notification,
  onRespond,
  isLoading = false,
}: InterviewResponseDialogProps) {
  const [response, setResponse] = useState<boolean | null>(null)
  const [notes, setNotes] = useState("")

  const interviewDetails = notification.metadata
  const interviewType = interviewDetails?.interview_type || 'interview'
  const petName = interviewDetails?.pet_name || 'Pet'
  const shelterName = interviewDetails?.shelter_name || 'Shelter'
  const scheduledDate = interviewDetails?.scheduled_date
  const scheduledTime = interviewDetails?.scheduled_time
  const location = interviewDetails?.location

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

  const handleSubmit = async () => {
    if (response === null) return
    await onRespond(response, notes)
    onOpenChange(false)
    setResponse(null)
    setNotes("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getInterviewIcon(interviewType)}
            <div>
              <div>Respond to {getInterviewLabel(interviewType)}</div>
              <DialogDescription className="text-sm font-normal mt-1">
                For {petName} with {shelterName}
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
                      {scheduledDate && scheduledTime
                        ? format(new Date(`${scheduledDate}T${scheduledTime}`), 'EEEE, MMMM d, yyyy • h:mm a')
                        : 'To be confirmed'
                      }
                    </p>
                  </div>
                </div>
                {location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-gray-600">{location}</p>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={response === null || isLoading}
            className={response === true ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isLoading ? "Submitting..." : response === true ? "Accept Interview" : "Decline Interview"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [responseDialog, setResponseDialog] = useState<{
    open: boolean
    notification?: NotificationData
  }>({ open: false })

  useEffect(() => {
    if (user) {
      fetchNotifications()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await interviewsService.getNotifications(user, { limit: 50 })
      setNotifications(data)
      setUnreadCount(data.filter(n => n.status === 'pending' || n.status === 'sent').length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
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
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const dismissNotification = async (notificationId: string) => {
    if (!user) return

    try {
      await interviewsService.dismissNotification(notificationId, user)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      const notification = notifications.find(n => n.id === notificationId)
      if (notification && (notification.status === 'pending' || notification.status === 'sent')) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error dismissing notification:', error)
    }
  }

  const handleInterviewResponse = async (response: boolean, notes?: string) => {
    if (!responseDialog.notification) return

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
    } catch (error) {
      console.error('Error responding to interview:', error)
      toast.error('Failed to submit response')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'interview_scheduled':
        return <Calendar className="h-4 w-4 text-blue-600" />
      case 'interview_response':
        return <MessageSquare className="h-4 w-4 text-green-600" />
      case 'interview_reminder':
        return <Clock className="h-4 w-4 text-orange-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'interview_scheduled':
        return 'border-l-blue-500 bg-blue-50'
      case 'interview_response':
        return 'border-l-green-500 bg-green-50'
      case 'interview_reminder':
        return 'border-l-orange-500 bg-orange-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className={`relative ${className}`}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} new</Badge>
            )}
          </div>

          <ScrollArea className="h-96">
            <div className="p-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Bell className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <AnimatePresence>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`p-3 mb-2 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-sm ${getNotificationColor(notification.type)}`}
                      onClick={() => {
                        if (notification.status === 'pending' || notification.status === 'sent') {
                          markAsRead(notification.id)
                        }

                        if (notification.type === 'interview_scheduled') {
                          setResponseDialog({ open: true, notification })
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <div className="flex items-center gap-1">
                              {(notification.status === 'pending' || notification.status === 'sent') && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  dismissNotification(notification.id)
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-400">
                              {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                            </p>
                            {notification.type === 'interview_scheduled' && (
                              <Button size="sm" variant="outline" className="h-6 text-xs">
                                Respond <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {responseDialog.notification && (
        <InterviewResponseDialog
          open={responseDialog.open}
          onOpenChange={(open) => setResponseDialog({ open })}
          notification={responseDialog.notification}
          onRespond={handleInterviewResponse}
        />
      )}
    </>
  )
}