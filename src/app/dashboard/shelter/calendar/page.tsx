"use client"

import { useState } from "react"
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
  Users,
  MoreHorizontal
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Mock events data for shelter
const mockEvents = [
  {
    id: "1",
    title: "Home Visit - Bella Application",
    type: "visit",
    date: new Date(),
    time: "10:00 AM",
    location: "Tanjung Bungah, Penang",
    applicant: "Sarah Chen",
    description: "Home visit for Bella adoption application",
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },
  {
    id: "2",
    title: "Volunteer Training Session",
    type: "training",
    date: addDays(new Date(), 1),
    time: "2:00 PM",
    location: "Shelter Main Hall",
    participants: "8 volunteers",
    description: "Monthly volunteer orientation and training",
    color: "bg-green-100 text-green-800 border-green-200"
  },
  {
    id: "3",
    title: "Pet Health Check - Weekly",
    type: "health",
    date: addDays(new Date(), 2),
    time: "9:00 AM",
    location: "Shelter Clinic",
    vet: "Dr. Lim",
    description: "Weekly health examination for all shelter pets",
    color: "bg-red-100 text-red-800 border-red-200"
  },
  {
    id: "4",
    title: "Adoption Fair Setup",
    type: "event",
    date: addDays(new Date(), 4),
    time: "7:00 AM",
    location: "Gurney Plaza",
    staff: "5 staff members",
    description: "Setup for weekend adoption fair",
    color: "bg-purple-100 text-purple-800 border-purple-200"
  },
  {
    id: "5",
    title: "Interview - Max Application",
    type: "interview",
    date: addDays(new Date(), 6),
    time: "3:30 PM",
    location: "Shelter Office",
    applicant: "Ahmad Rahman",
    description: "Adoption interview for Max",
    color: "bg-orange-100 text-orange-800 border-orange-200"
  }
]

const getEventTypeIcon = (type: string) => {
  switch (type) {
    case 'visit': return '🏠'
    case 'training': return '🎓'
    case 'health': return '🏥'
    case 'event': return '🎉'
    case 'interview': return '👥'
    default: return '📅'
  }
}

export default function ShelterCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [viewType, setViewType] = useState<'month' | 'week' | 'day'>('month')

  // Generate calendar grid for current month
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

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
    return mockEvents.filter(event => isSameDay(event.date, date))
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
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <Button size="sm" variant="outline" className="h-8">
            <Users className="h-4 w-4 mr-2" />
            Staff Schedule
          </Button>
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 h-8">
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-6">
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
                        {(event.applicant || event.participants || event.staff) && (
                          <div className="flex items-center gap-1 opacity-75">
                            <User className="h-2 w-2" />
                            <span className="truncate">
                              {event.applicant || event.participants || event.staff}
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
                                className={`absolute left-1 right-1 top-1 text-xs p-1 rounded ${event.color} border cursor-pointer z-10`}
                                style={{ height: '56px' }}
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
                <div className="grid grid-cols-2 gap-px">
                  {/* Time Column */}
                  <div className="bg-white">
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div key={hour} className="h-20 border-b border-gray-100 px-4 py-2 flex items-start">
                        <span className="text-sm text-gray-500">
                          {hour === 0 ? '12:00 AM' : hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Events Column */}
                  <div className="bg-white relative">
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div key={hour} className="h-20 border-b border-gray-100 border-r border-gray-100 relative p-2">
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
                                <div className="flex items-center gap-1 text-xs opacity-75">
                                  <MapPin className="h-3 w-3" />
                                  <span>{event.location}</span>
                                </div>
                                {event.applicant && (
                                  <div className="flex items-center gap-1 text-xs opacity-75">
                                    <User className="h-3 w-3" />
                                    <span>Applicant: {event.applicant}</span>
                                  </div>
                                )}
                                {event.participants && (
                                  <div className="flex items-center gap-1 text-xs opacity-75">
                                    <Users className="h-3 w-3" />
                                    <span>{event.participants}</span>
                                  </div>
                                )}
                                {event.staff && (
                                  <div className="flex items-center gap-1 text-xs opacity-75">
                                    <Users className="h-3 w-3" />
                                    <span>{event.staff}</span>
                                  </div>
                                )}
                                <div className="text-xs text-gray-600 mt-1">{event.description}</div>
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

      {/* Event Details Popup */}
      {selectedDate && (
        <Popover open={!!selectedDate} onOpenChange={() => setSelectedDate(undefined)}>
          <PopoverTrigger asChild>
            <div />
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="center">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <p className="text-sm text-gray-500">
                {getEventsForDate(selectedDate).length} event{getEventsForDate(selectedDate).length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto p-2">
              {getEventsForDate(selectedDate).map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border ${event.color} mb-2`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{getEventTypeIcon(event.type)}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <div className="flex items-center gap-1 text-xs opacity-75 mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs opacity-75">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                      {event.applicant && (
                        <div className="flex items-center gap-1 text-xs opacity-75 mt-1">
                          <User className="h-3 w-3" />
                          <span>Applicant: {event.applicant}</span>
                        </div>
                      )}
                      {event.participants && (
                        <div className="flex items-center gap-1 text-xs opacity-75 mt-1">
                          <Users className="h-3 w-3" />
                          <span>{event.participants}</span>
                        </div>
                      )}
                      {event.staff && (
                        <div className="flex items-center gap-1 text-xs opacity-75 mt-1">
                          <Users className="h-3 w-3" />
                          <span>{event.staff}</span>
                        </div>
                      )}
                      {event.vet && (
                        <div className="flex items-center gap-1 text-xs opacity-75 mt-1">
                          <User className="h-3 w-3" />
                          <span>Vet: {event.vet}</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              {getEventsForDate(selectedDate).length === 0 && (
                <div className="p-8 text-center">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No events scheduled</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Event
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}