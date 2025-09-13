"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, ExternalLink } from 'lucide-react'

// Mock data for community events
const mockEvents = [
  {
    id: "1",
    title: "Pet Adoption Fair",
    description: "Join us for a fun-filled day of meeting adorable pets looking for their forever homes!",
    location: "Central Park, New York",
    coordinates: [-73.965, 40.782],
    date: "2024-01-20",
    time: "10:00 AM",
    fee: "Free",
    maxParticipants: 100,
    currentParticipants: 45,
    organizer: "NYC Animal Shelter",
    type: "adoption"
  },
  {
    id: "2", 
    title: "Dog Training Workshop",
    description: "Learn essential dog training techniques from professional trainers.",
    location: "Community Center, Brooklyn",
    coordinates: [-73.950, 40.678],
    date: "2024-01-22",
    time: "2:00 PM", 
    fee: "$25",
    maxParticipants: 30,
    currentParticipants: 18,
    organizer: "Brooklyn Pet Training",
    type: "workshop"
  },
  {
    id: "3",
    title: "Cat Care Seminar",
    description: "Everything you need to know about caring for your feline friends.",
    location: "Library Hall, Queens",
    coordinates: [-73.794, 40.728],
    date: "2024-01-25",
    time: "6:00 PM",
    fee: "Free",
    maxParticipants: 50,
    currentParticipants: 32,
    organizer: "Queens Cat Society",
    type: "education"
  },
  {
    id: "4",
    title: "Pet Vaccination Drive",
    description: "Free vaccinations for your pets. Bring your furry friends!",
    location: "Veterinary Clinic, Manhattan",
    coordinates: [-73.985, 40.748],
    date: "2024-01-27",
    time: "9:00 AM",
    fee: "Free",
    maxParticipants: 80,
    currentParticipants: 23,
    organizer: "Manhattan Vet Clinic",
    type: "healthcare"
  },
  {
    id: "5",
    title: "Pet Photography Session",
    description: "Professional photos of your pets for adoption profiles and keepsakes.",
    location: "Photo Studio, Staten Island", 
    coordinates: [-74.150, 40.579],
    date: "2024-01-30",
    time: "11:00 AM",
    fee: "$15",
    maxParticipants: 25,
    currentParticipants: 12,
    organizer: "Pet Portrait Pro",
    type: "photo"
  }
]

const getEventTypeColor = (type: string) => {
  switch (type) {
    case 'adoption': return 'bg-green-100 text-green-800'
    case 'workshop': return 'bg-blue-100 text-blue-800'
    case 'education': return 'bg-purple-100 text-purple-800'
    case 'healthcare': return 'bg-red-100 text-red-800'
    case 'photo': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getEventTypeIcon = (type: string) => {
  switch (type) {
    case 'adoption': return '🐕'
    case 'workshop': return '🎓'
    case 'education': return '📚'
    case 'healthcare': return '🏥'
    case 'photo': return '📸'
    default: return '📅'
  }
}

export default function EventMapSimple() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Community Events Map</h1>
        <p className="text-gray-500 mt-2">
          Discover pet-related events and activities happening in your area
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section - Placeholder for now */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Events Near You
              </CardTitle>
              <CardDescription>
                Interactive MapBox will be available when the module loads correctly
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[600px] w-full bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <MapPin className="h-16 w-16 text-teal-500 mx-auto" />
                    <div className="absolute top-0 left-0 w-full h-full">
                      <div className="animate-ping absolute h-4 w-4 bg-teal-400 rounded-full top-2 left-8"></div>
                      <div className="animate-ping absolute h-3 w-3 bg-blue-400 rounded-full top-6 right-6 animation-delay-300"></div>
                      <div className="animate-ping absolute h-3 w-3 bg-green-400 rounded-full bottom-4 left-6 animation-delay-600"></div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Interactive Map Loading</h3>
                    <p className="text-gray-500 max-w-md">
                      The full MapBox integration with interactive markers and popups will appear here once module resolution is fixed.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {mockEvents.slice(0, 4).map((event, index) => (
                      <div key={event.id} className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse" style={{animationDelay: `${index * 200}ms`}}></div>
                        <span className="text-xs text-gray-600">{event.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event List Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                {mockEvents.length} events found
              </CardDescription>
            </CardHeader>
          </Card>

          {mockEvents.map((event) => (
            <Card 
              key={event.id} 
              className={`cursor-pointer transition-all duration-300 ${
                selectedEvent?.id === event.id 
                  ? 'ring-2 ring-teal-500 shadow-lg scale-105' 
                  : 'hover:shadow-lg hover:scale-105'
              }`}
              onClick={() => setSelectedEvent(event)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">{getEventTypeIcon(event.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{event.title}</h3>
                      <Badge className={getEventTypeColor(event.type)} variant="secondary">
                        {event.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.currentParticipants}/{event.maxParticipants} joined
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-semibold text-green-600">
                        {event.fee}
                      </span>
                      <Button 
                        size="sm" 
                        variant={selectedEvent?.id === event.id ? "default" : "outline"}
                        className={selectedEvent?.id === event.id ? "bg-teal-600 hover:bg-teal-700" : ""}
                      >
                        {selectedEvent?.id === event.id ? "Selected" : "View Details"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Selected Event Details */}
          {selectedEvent && (
            <Card className="border-teal-200 bg-teal-50">
              <CardHeader>
                <CardTitle className="text-teal-800">Selected Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div><strong>Organizer:</strong> {selectedEvent.organizer}</div>
                  <div><strong>Capacity:</strong> {selectedEvent.currentParticipants}/{selectedEvent.maxParticipants} participants</div>
                  <div><strong>Status:</strong> 
                    <Badge className="ml-2 bg-green-100 text-green-800">
                      {selectedEvent.maxParticipants - selectedEvent.currentParticipants} spots left
                    </Badge>
                  </div>
                  <Button className="w-full mt-4 bg-teal-600 hover:bg-teal-700">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Register for Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <style jsx>{`
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        .animation-delay-600 {
          animation-delay: 600ms;
        }
      `}</style>
    </div>
  )
}