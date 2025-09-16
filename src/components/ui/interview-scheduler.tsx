"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock, MapPin, MessageSquare } from "lucide-react"

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
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
  const [selectedType, setSelectedType] = useState<keyof typeof interviewTypes>(
    interviewType || "interview"
  )

  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: {
      type: interviewType || "interview",
      duration: interviewTypes[selectedType].defaultDuration,
      location: interviewTypes[selectedType].defaultLocation,
      notes: "",
    },
  })

  const handleTypeChange = (type: keyof typeof interviewTypes) => {
    setSelectedType(type)
    form.setValue("type", type)
    form.setValue("location", interviewTypes[type].defaultLocation)
    form.setValue("duration", interviewTypes[type].defaultDuration)
  }

  const onSubmit = async (data: InterviewFormValues) => {
    try {
      await onSchedule({ ...data, applicationId })
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Error scheduling interview:", error)
    }
  }

  const currentTypeConfig = interviewTypes[selectedType]

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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time">
                            {field.value && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {field.value}
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {time}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose an available time slot
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