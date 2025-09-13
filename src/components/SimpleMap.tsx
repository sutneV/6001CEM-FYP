"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from 'lucide-react'

// Temporary simple map component while debugging MapBox
export default function SimpleMap() {
  const mockEvents = [
    {
      id: "1",
      title: "Pet Adoption Fair",
      description: "Join us for a fun-filled day of meeting adorable pets looking for their forever homes!",
      location: "Central Park, New York",
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
      date: "2024-01-22",
      time: "2:00 PM", 
      fee: "$25",
      maxParticipants: 30,
      currentParticipants: 18,
      organizer: "Brooklyn Pet Training",
      type: "workshop"
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Community Events Map</h1>
        <p className="text-gray-500 mt-2">
          Discover pet-related events and activities happening in your area
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placeholder Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Events Map
            </CardTitle>
            <CardDescription>
              Interactive map loading...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">MapBox is loading...</p>
                <p className="text-sm text-gray-400 mt-2">
                  Interactive map with event markers will appear here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event List */}
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
            <Card key={event.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🐕</span>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                      <div>{new Date(event.date).toLocaleDateString()} at {event.time}</div>
                      <div>Fee: {event.fee}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}