"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock, MapPin, MessageSquare, AlertTriangle, CheckCircle, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import * as z from "zod"

const interviewFormSchema = z.object({
  type: z.enum(["interview", "meet_greet", "home_visit"]),
  date: z.date({
    required_error: "Please select a date.",
  }),
  time: z.string({
    required_error: "Please select a time.",
  }),
  duration: z.string().default("60"),
  location: z.string().min(1, "Location is required"),
  notes: z.string().optional(),
})

type InterviewFormValues = z.infer<typeof interviewFormSchema>

interface TimeSlot {
  time: string
  available: boolean
  conflicts: Array<{
    type: string
    time: string
    duration: number
  }>
}

interface AvailabilityData {
  date: string
  duration: number
  businessHours: {
    start: string
    end: string
  }
  timeSlots: TimeSlot[]
  totalSlots: number
  availableSlots: number
}

interface InterviewSchedulerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: string
  petName: string
  applicantName: string
  interviewType?: "interview" | "meet_greet" | "home_visit"
  onSchedule: (data: InterviewFormValues & { applicationId: string }) => Promise<void>
  isLoading?: boolean
}

const interviewTypes = {
  interview: {
    label: "Phone/Video Interview",
    description: "Initial screening interview with the applicant",
    icon: "📞",
    color: "bg-blue-100 text-blue-800",
    defaultLocation: "Video Call (Zoom/Teams)",
    defaultDuration: "30",
  },
  meet_greet: {
    label: "Meet & Greet",
    description: "In-person meeting between applicant and pet",
    icon: "🤝",
    color: "bg-purple-100 text-purple-800",
    defaultLocation: "Shelter facility",
    defaultDuration: "45",
  },
  home_visit: {
    label: "Home Visit",
    description: "Visit to applicant's home to assess environment",
    icon: "🏠",
    color: "bg-green-100 text-green-800",
    defaultLocation: "Applicant's residence",
    defaultDuration: "90",
  },
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30"
]

export function InterviewScheduler({
  open,
  onOpenChange,
  applicationId,
  petName,
  applicantName,
  interviewType,
  onSchedule,
  isLoading = false,
}: InterviewSchedulerProps) {
  const { user } = useAuth()
  const [selectedType, setSelectedType] = useState<keyof typeof interviewTypes>(
    interviewType || "interview"
  )
  const [availability, setAvailability] = useState<AvailabilityData | null>(null)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [conflictError, setConflictError] = useState<string | null>(null)

  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: {
      type: interviewType || "interview",
      duration: interviewTypes[selectedType].defaultDuration,
      location: interviewTypes[selectedType].defaultLocation,
      notes: "",
    },
  })

  // Fetch availability for selected date and duration
  const fetchAvailability = async (date: Date, duration: string) => {
    if (!user) {
      console.error('User not authenticated')
      return
    }

    try {
      setLoadingAvailability(true)
      const dateStr = format(date, 'yyyy-MM-dd')

      const response = await fetch(`/api/interviews/availability?date=${dateStr}&duration=${duration}`, {
        headers: {
          'x-user-data': JSON.stringify(user),
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch availability`)
      }

      const data = await response.json()
      setAvailability(data)
    } catch (error) {
      console.error('Error fetching availability:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to check availability')
      setAvailability(null)
    } finally {
      setLoadingAvailability(false)
    }
  }

  // Watch for date and duration changes
  const watchedDate = form.watch("date")
  const watchedDuration = form.watch("duration")

  useEffect(() => {
    if (watchedDate && watchedDuration && open && user) {
      fetchAvailability(watchedDate, watchedDuration)
      setSelectedDate(watchedDate)
    }
  }, [watchedDate, watchedDuration, open, user])

  const handleTypeChange = (type: keyof typeof interviewTypes) => {
    setSelectedType(type)
    form.setValue("type", type)
    form.setValue("location", interviewTypes[type].defaultLocation)
    form.setValue("duration", interviewTypes[type].defaultDuration)

    // Refetch availability with new duration
    if (watchedDate && user) {
      fetchAvailability(watchedDate, interviewTypes[type].defaultDuration)
    }
  }

  const onSubmit = async (data: InterviewFormValues) => {
    try {
      setConflictError(null)
      await onSchedule({ ...data, applicationId })
      form.reset()
      setAvailability(null)
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error scheduling interview:", error)

      // Handle conflict errors specifically
      if (error.message && error.message.includes('Time slot conflict')) {
        setConflictError(error.message)
        // Refresh availability to show updated conflicts
        if (data.date && user) {
          fetchAvailability(data.date, data.duration)
        }
      } else {
        toast.error(error.message || 'Failed to schedule interview')
      }
    }
  }

  const currentTypeConfig = interviewTypes[selectedType]

  // Don't render if user is not authenticated
  if (!user) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{currentTypeConfig.icon}</span>
            Schedule {currentTypeConfig.label}
          </DialogTitle>
          <DialogDescription>
            Schedule a {currentTypeConfig.label.toLowerCase()} for {applicantName}&apos;s application for {petName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Interview Type Selection */}
            <div className="space-y-3">
              <FormLabel>Interview Type</FormLabel>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(interviewTypes).map(([key, type]) => (
                  <div
                    key={key}
                    className={cn(
                      "flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all",
                      selectedType === key
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => handleTypeChange(key as keyof typeof interviewTypes)}
                  >
                    <span className="text-2xl mt-1">{type.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{type.label}</h4>
                        <Badge className={type.color} variant="secondary">
                          {key.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Selection */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            return date < today || date < new Date("1900-01-01")
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Select the date for the {currentTypeConfig.label.toLowerCase()}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Time Selection */}
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    {loadingAvailability ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-500">Checking availability...</p>
                        </div>
                      </div>
                    ) : availability ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                          {availability.timeSlots.map((slot) => (
                            <Button
                              key={slot.time}
                              type="button"
                              variant={field.value === slot.time ? "default" : "outline"}
                              size="sm"
                              className={cn(
                                "text-xs justify-center",
                                !slot.available && "opacity-50 cursor-not-allowed",
                                slot.available && field.value !== slot.time && "hover:bg-teal-50",
                                field.value === slot.time && "bg-teal-500 text-white"
                              )}
                              disabled={!slot.available}
                              onClick={() => field.onChange(slot.time)}
                            >
                              <div className="flex items-center gap-1">
                                {slot.available ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <X className="h-3 w-3" />
                                )}
                                {slot.time}
                              </div>
                            </Button>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500">
                          {availability.availableSlots} of {availability.totalSlots} slots available
                        </div>
                        {availability.availableSlots === 0 && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              No available time slots for the selected date and duration. Please choose a different date or shorter duration.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ) : (
                      <FormControl>
                        <div className="text-center p-4 text-gray-500">
                          <Clock className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">Select a date to view available time slots</p>
                        </div>
                      </FormControl>
                    )}
                    <FormDescription>
                      {availability ?
                        "Green slots are available, red slots are already booked" :
                        "Available time slots will appear after selecting a date"
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duration */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Estimated duration for the {currentTypeConfig.label.toLowerCase()}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Enter location"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Where the {currentTypeConfig.label.toLowerCase()} will take place
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Textarea
                        placeholder="Add any special instructions or notes for the applicant..."
                        className="pl-10 min-h-[100px]"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Any additional information or instructions for the applicant
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conflict Error Alert */}
            {conflictError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {conflictError}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Scheduling..." : `Schedule ${currentTypeConfig.label}`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}