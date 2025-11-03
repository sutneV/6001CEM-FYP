"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  addDays, 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth, 
  isToday,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks
} from "date-fns"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User,
  MoreHorizontal,
  Phone,
  Heart,
  Home
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { interviewsService } from "@/lib/services/interviews"


// JSX-based icon helper to match adopter calendar
const getEventTypeIcon = (type: string) => {
  switch (type) {
    case 'interview':
      return <Phone className="h-3 w-3" />
    case 'meet_greet':
      return <Heart className="h-3 w-3" />
    case 'home_visit':
      return <Home className="h-3 w-3" />
    case 'visit':
      return <MapPin className="h-3 w-3" />
    case 'appointment':
    case 'training':
    case 'health':
    case 'event':
    default:
      return <CalendarIcon className="h-3 w-3" />
  }
}

export default function ShelterCalendarPage() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [viewType, setViewType] = useState<'month' | 'week' | 'day'>('month')
  const [calendarEvents, setCalendarEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Generate calendar grid for current month
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Fetch calendar events
  useEffect(() => {
    if (user) {
      fetchCalendarEvents()
    }
  }, [user, currentDate, viewType])

  const fetchCalendarEvents = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Get date range based on view type
      let startDate, endDate

      if (viewType === 'month') {
        startDate = format(calendarStart, 'yyyy-MM-dd')
        endDate = format(calendarEnd, 'yyyy-MM-dd')
      } else if (viewType === 'week') {
        startDate = format(startOfWeek(currentDate), 'yyyy-MM-dd')
        endDate = format(endOfWeek(currentDate), 'yyyy-MM-dd')
      } else {
        startDate = format(currentDate, 'yyyy-MM-dd')
        endDate = format(currentDate, 'yyyy-MM-dd')
      }

      const events = await interviewsService.getCalendarEvents(user, {
        startDate,
        endDate,
      })

      // Transform events to match the expected format
      const transformedEvents = events.map(event => ({
        id: event.id,
        title: event.title,
        type: event.event_type,
        date: new Date(event.event_date),
        time: format(new Date(`${event.event_date}T${event.event_time}`), 'h:mm a'),
        location: event.location || '',
        description: event.description || '',
        color: getEventTypeColor(event.event_type, event.is_confirmed, event.interview_status, event.interview_response),
        isConfirmed: event.is_confirmed,
        interviewId: event.interview_id,
        interviewStatus: event.interview_status,
        interviewResponse: event.interview_response,
      }))

      setCalendarEvents(transformedEvents)
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      setCalendarEvents([])
    } finally {
      setLoading(false)
    }
  }

  const getEventTypeColor = (type: string, isConfirmed: boolean, interviewStatus?: string, interviewResponse?: boolean | null) => {
    // Handle interview-specific statuses
    if (['interview', 'meet_greet', 'home_visit'].includes(type)) {
      // If interview was declined (response is false or status is cancelled)
      if (interviewResponse === false || interviewStatus === 'cancelled') {
        return "bg-red-100 text-red-800 border-red-300"
      }

      // If interview was confirmed (response is true or status is confirmed)
      if (interviewResponse === true || interviewStatus === 'confirmed' || isConfirmed) {
        const confirmedColors = {
          interview: "bg-blue-100 text-blue-800 border-blue-300",
          meet_greet: "bg-purple-100 text-purple-800 border-purple-300",
          home_visit: "bg-green-100 text-green-800 border-green-300",
        }
        return confirmedColors[type as keyof typeof confirmedColors]
      }

      // Pending interviews (no response yet)
      const pendingColors = {
        interview: "bg-blue-50 text-blue-700 border-blue-200",
        meet_greet: "bg-purple-50 text-purple-700 border-purple-200",
        home_visit: "bg-green-50 text-green-700 border-green-200",
      }
      return pendingColors[type as keyof typeof pendingColors]
    }

    // Non-interview events
    const baseColors = {
      training: "bg-green-100 text-green-800 border-green-200",
      health: "bg-red-100 text-red-800 border-red-200",
      event: "bg-purple-100 text-purple-800 border-purple-200",
    }

    return baseColors[type as keyof typeof baseColors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (viewType === 'month') {
        setCurrentDate(subMonths(currentDate, 1))
      } else if (viewType === 'week') {
        setCurrentDate(subWeeks(currentDate, 1))
      } else if (viewType === 'day') {
        setCurrentDate(addDays(currentDate, -1))
      }
    } else {
      if (viewType === 'month') {
        setCurrentDate(addMonths(currentDate, 1))
      } else if (viewType === 'week') {
        setCurrentDate(addWeeks(currentDate, 1))
      } else if (viewType === 'day') {
        setCurrentDate(addDays(currentDate, 1))
      }
    }
  }

  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => isSameDay(event.date, date))
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="h-[calc(100vh-140px)] bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shelter Calendar</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage shelter operations and appointments
            </p>
          </div>
          
          {/* Month Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h2 className="text-xl font-semibold text-gray-900 min-w-[160px] text-center">
              {viewType === 'month' && format(currentDate, 'MMMM yyyy')}
              {viewType === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`}
              {viewType === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
            </h2>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewType === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('month')}
            className="h-8"
          >
            Month
          </Button>
          <Button
            variant={viewType === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('week')}
            className="h-8"
          >
            Week
          </Button>
          <Button
            variant={viewType === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('day')}
            className="h-8"
          >
            Day
          </Button>
        </div>
      </div>


      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Calendar Grid */}
        <div className={`transition-all duration-300 p-6 ${selectedDate ? 'flex-[2]' : 'flex-1'}`}>
          <div className="h-full">
            <AnimatePresence mode="wait">
            {viewType === 'month' && (
              <motion.div
                key="month"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-full"
              >
                {/* Week Header */}
              <div className="grid grid-cols-7 gap-px mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="p-3 text-center">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {day}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calendar Cells */}
              <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden" style={{ height: 'calc(100% - 60px)' }}>
                {calendarDays.map((date, index) => {
              const dayEvents = getEventsForDate(date)
              const isCurrentMonth = isSameMonth(date, currentDate)
              const isSelected = selectedDate && isSameDay(date, selectedDate)
              const isToday_ = isToday(date)

              return (
                <motion.div
                  key={date.toISOString()}
                  className={`bg-white p-2 cursor-pointer transition-all relative border ${
                    !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                  } ${isSelected ? 'bg-gray-100 border-teal-400' : 'border-transparent'} ${
                    isToday_ ? 'bg-teal-50' : ''
                  }`}
                  onClick={() => setSelectedDate(date)}
                >
                  {/* Date Number */}
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`text-sm font-medium ${
                        isToday_ ? 'bg-teal-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''
                      }`}
                    >
                      {format(date, 'd')}
                    </span>
                    {dayEvents.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 text-gray-400 hover:text-gray-600"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event, eventIndex) => (
                      <motion.div
                        key={event.id}
                        whileHover={{ scale: 1.05 }}
                        className={`text-xs p-1 rounded ${event.color} border cursor-pointer`}
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle event click
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-[10px]">{getEventTypeIcon(event.type)}</span>
                          <span className="truncate font-medium">
                            {event.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-75">
                          <Clock className="h-2 w-2" />
                          <span>{event.time}</span>
                        </div>
                        {event.interviewId && (
                          <div className="flex items-center gap-1 opacity-75">
                            <span className="text-[8px]">
                              {event.interviewResponse === true || event.interviewStatus === 'confirmed' ? '✓' :
                               event.interviewResponse === false || event.interviewStatus === 'cancelled' ? '✕' :
                               '?'}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                    
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 font-medium">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
              </div>
              </motion.div>
            )}

            {viewType === 'week' && (
              <motion.div
                key="week"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-full"
              >
                {/* Week Days Header */}
              <div className="grid grid-cols-8 gap-px mb-2">
                <div className="p-3"></div> {/* Empty corner for time column */}
                {eachDayOfInterval({ 
                  start: startOfWeek(currentDate), 
                  end: endOfWeek(currentDate) 
                }).map((day) => (
                  <div key={day.toISOString()} className="p-3 text-center">
                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {format(day, 'EEE')}
                    </div>
                    <div className={`text-lg font-semibold mt-1 ${
                      isToday(day) ? 'bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-gray-900'
                    }`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Week Grid */}
              <div className="grid grid-cols-8 gap-px bg-gray-200 rounded-lg overflow-hidden flex-1">
                {/* Time Column */}
                <div className="bg-white">
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div key={hour} className="h-16 border-b border-gray-100 px-2 py-1 text-xs text-gray-500">
                      {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                    </div>
                  ))}
                </div>

                {/* Week Days */}
                {eachDayOfInterval({ 
                  start: startOfWeek(currentDate), 
                  end: endOfWeek(currentDate) 
                }).map((day) => (
                  <div key={day.toISOString()} className="bg-white relative">
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div key={hour} className="h-16 border-b border-gray-100 border-r border-gray-100 relative">
                        {getEventsForDate(day).map((event, eventIndex) => {
                          const eventHour = parseInt(event.time.split(':')[0])
                          const isAM = event.time.includes('AM')
                          const eventHour24 = isAM ? (eventHour === 12 ? 0 : eventHour) : (eventHour === 12 ? 12 : eventHour + 12)
                          
                          if (eventHour24 === hour) {
                            return (
                              <div
                                key={event.id}
                                className={`absolute left-1 right-1 top-1 text-xs p-1 rounded ${event.color} border cursor-pointer z-10 overflow-hidden whitespace-nowrap`}
                                style={{ height: 28 }}
                              >
                                <div className="font-medium truncate">{event.title}</div>
                                <div className="text-[10px] opacity-75">{event.time}</div>
                              </div>
                            )
                          }
                          return null
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              </motion.div>
            )}

            {viewType === 'day' && (
              <motion.div
                key="day"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-full"
              >
                {/* Day Header */}
              <div className="flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {format(currentDate, 'EEEE')}
                  </div>
                  <div className={`text-2xl font-bold mt-2 ${
                    isToday(currentDate) ? 'bg-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto' : 'text-gray-900'
                  }`}>
                    {format(currentDate, 'd')}
                  </div>
                </div>
              </div>

              {/* Day Schedule */}
              <div className="flex-1 bg-gray-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-[120px_1fr] gap-0">
                  {/* Time Column */}
                  <div className="bg-white">
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div key={hour} className="h-20 border-b border-r border-gray-100 px-4 py-2 flex items-start">
                        <span className="text-sm text-gray-500">
                          {hour === 0 ? '12:00 AM' : hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Events Column */}
                  <div className="bg-white relative">
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div key={hour} className="h-20 border-b border-gray-100 relative p-2">
                        {getEventsForDate(currentDate).map((event, eventIndex) => {
                          const eventHour = parseInt(event.time.split(':')[0])
                          const isAM = event.time.includes('AM')
                          const eventHour24 = isAM ? (eventHour === 12 ? 0 : eventHour) : (eventHour === 12 ? 12 : eventHour + 12)
                          
                          if (eventHour24 === hour) {
                            return (
                              <div
                                key={event.id}
                                className={`w-full text-sm p-3 rounded ${event.color} border cursor-pointer mb-1`}
                              >
                                <div className="font-medium">{event.title}</div>
                                <div className="flex items-center gap-1 text-xs opacity-75 mt-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{event.time}</span>
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-1 text-xs opacity-75">
                                    <MapPin className="h-3 w-3" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                                {event.interviewId && (
                                  <div className="flex items-center gap-1 text-xs opacity-75">
                                    <span className="text-[8px]">
                                      {event.interviewResponse === true || event.interviewStatus === 'confirmed' ? '✓' :
                                       event.interviewResponse === false || event.interviewStatus === 'cancelled' ? '✕' :
                                       '?'}
                                    </span>
                                    <span>
                                      {event.interviewResponse === true || event.interviewStatus === 'confirmed' ? 'Confirmed' :
                                       event.interviewResponse === false || event.interviewStatus === 'cancelled' ? 'Declined' :
                                       'Pending'}
                                    </span>
                                  </div>
                                )}
                                <div className="text-xs text-gray-600 mt-1 whitespace-pre-line">{event.description}</div>
                              </div>
                            )
                          }
                          return null
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>

        {/* Slide-in Event Details Panel */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-l border-gray-200 bg-white overflow-hidden"
            >
                {/* Panel Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {format(selectedDate, 'EEEE')}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(selectedDate, 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedDate(undefined)}
                      className="h-10 w-10 p-0 hover:bg-white/50 rounded-full"
                    >
                      <Plus className="h-5 w-5 rotate-45 text-gray-600" />
                    </Button>
                  </div>
                  <div className="mt-3">
                    <span className="text-sm text-teal-700 bg-teal-100 px-3 py-1 rounded-full">
                      {getEventsForDate(selectedDate).length} event{getEventsForDate(selectedDate).length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Events List */}
                <div className="overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                  {getEventsForDate(selectedDate).map((event) => (
                    <div
                      key={event.id}
                      className={`p-5 rounded-xl border ${event.color} bg-white shadow-sm hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-2xl mt-1">{getEventTypeIcon(event.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-lg text-gray-900">{event.title}</h4>
                            {event.interviewId && (
                              <Badge
                                variant={
                                  event.interviewResponse === true || event.interviewStatus === 'confirmed' ? "default" :
                                  event.interviewResponse === false || event.interviewStatus === 'cancelled' ? "destructive" :
                                  "outline"
                                }
                                className={
                                  event.interviewResponse === true || event.interviewStatus === 'confirmed' ? "bg-green-600 text-white" :
                                  event.interviewResponse === false || event.interviewStatus === 'cancelled' ? "bg-red-600 text-white" :
                                  ""
                                }
                              >
                                {event.interviewResponse === true || event.interviewStatus === 'confirmed' ? "Confirmed" :
                                 event.interviewResponse === false || event.interviewStatus === 'cancelled' ? "Declined" :
                                 "Pending"}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4 text-teal-600" />
                              <span>{event.time}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4 text-teal-600" />
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mt-3 leading-relaxed whitespace-pre-line">{event.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {getEventsForDate(selectedDate).length === 0 && (
                    <div className="text-center py-16">
                      <CalendarIcon className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                      <p className="text-lg text-gray-500 mb-4">No events scheduled</p>
                      <p className="text-sm text-gray-400 mb-6">This day is free for new appointments</p>
                      <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Event
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
