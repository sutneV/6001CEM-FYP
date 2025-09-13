"use client"

import { useState, useEffect } from 'react'
import Map, { Marker, Popup, NavigationControl, FullscreenControl, ScaleControl } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, ExternalLink } from 'lucide-react'

// Mock data for community events - in a real app, this would come from your API
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

export default function EventMap() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [mapRef, setMapRef] = useState<any>(null)
  const [is3DView, setIs3DView] = useState(true)
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/standard")

  // Get MapBox token from environment variables
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  // Debug token
  useEffect(() => {
    console.log('MapBox token:', MAPBOX_TOKEN ? `${MAPBOX_TOKEN.substring(0, 10)}...` : 'Not found')
  }, [])

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!mapLoaded && !mapError) {
        setMapError('Map loading timed out. Please check your MapBox token and internet connection.')
      }
    }, 10000) // 10 second timeout

    return () => clearTimeout(timeout)
  }, [mapLoaded, mapError])

  // 3D view control functions
  const toggle3DView = () => {
    if (!mapRef) return
    
    if (is3DView) {
      // Switch to 2D
      mapRef.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000
      })
    } else {
      // Switch to 3D
      mapRef.easeTo({
        pitch: 45,
        bearing: 0,
        duration: 1000
      })
    }
    setIs3DView(!is3DView)
  }

  const flyToLocation = (coordinates: number[]) => {
    if (!mapRef) return
    
    mapRef.flyTo({
      center: coordinates,
      zoom: 17,
      pitch: is3DView ? 60 : 0,
      duration: 2000
    })
  }

  // Check if MapBox token is available
  if (!MAPBOX_TOKEN) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Community Events Map</h1>
          <p className="text-gray-500 mt-2">
            Discover pet-related events and activities happening in your area
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="text-yellow-600">⚠️</div>
            <div>
              <h3 className="font-medium text-yellow-800">MapBox Token Required</h3>
              <p className="text-yellow-700 text-sm mt-1">
                Please add your MapBox token to the environment variables to enable the interactive map.
                <br />
                Get a free token at <a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-140px)] gap-4 p-4">
      {/* Main Map Area */}
      <div className="flex-1 relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
        <div className="h-full w-full relative">
                {mapError ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                    <div className="text-center p-6">
                      <div className="text-red-500 text-4xl mb-4">❌</div>
                      <h3 className="font-medium text-red-800 mb-2">Map Loading Error</h3>
                      <p className="text-red-600 text-sm">{mapError}</p>
                      <button 
                        onClick={() => {
                          setMapError(null)
                          setMapLoaded(false)
                        }}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : !mapLoaded ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading map...</p>
                    </div>
                  </div>
                ) : null}
                
                <Map
                  ref={(ref) => setMapRef(ref?.getMap())}
                  mapboxAccessToken={MAPBOX_TOKEN}
                  initialViewState={{
                    latitude: 40.7128,
                    longitude: -74.0060,
                    zoom: 15,
                    pitch: 45, // 3D tilt angle (0-60 degrees)
                    bearing: 0 // Map rotation
                  }}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle={mapStyle}
                  onLoad={(evt) => {
                    console.log('MapBox loaded successfully')
                    const map = evt.target
                    setMapRef(map)
                    
                    try {
                      // Wait for style to load before adding layers
                      map.on('style.load', () => {
                        try {
                          // Check if composite source exists (needed for 3D buildings)
                          if (map.getSource('composite')) {
                            // Add 3D buildings layer
                            map.addLayer({
                              id: '3d-buildings',
                              source: 'composite',
                              'source-layer': 'building',
                              filter: ['==', 'extrude', 'true'],
                              type: 'fill-extrusion',
                              minzoom: 15,
                              paint: {
                                'fill-extrusion-color': '#aaa',
                                'fill-extrusion-height': [
                                  'interpolate',
                                  ['linear'],
                                  ['zoom'],
                                  15,
                                  0,
                                  15.05,
                                  ['get', 'height']
                                ],
                                'fill-extrusion-base': [
                                  'interpolate',
                                  ['linear'],
                                  ['zoom'],
                                  15,
                                  0,
                                  15.05,
                                  ['get', 'min_height']
                                ],
                                'fill-extrusion-opacity': 0.8
                              }
                            })
                            console.log('3D buildings layer added successfully')
                          } else {
                            console.warn('Composite source not available, skipping 3D buildings')
                          }
                        } catch (layerError) {
                          console.warn('Could not add 3D buildings layer:', layerError)
                        }
                      })
                    } catch (error) {
                      console.warn('Error setting up 3D features:', error)
                    }
                    
                    setMapLoaded(true)
                  }}
                  onError={(event) => {
                    console.error('MapBox error details:', {
                      event,
                      error: event.error,
                      message: event.error?.message,
                      type: event.type,
                      target: event.target
                    })
                    
                    // Try fallback to simpler map style
                    if (mapStyle === "mapbox://styles/mapbox/standard") {
                      console.log('Trying fallback to light style...')
                      setMapStyle("mapbox://styles/mapbox/light-v11")
                      setMapError(null)
                      setMapLoaded(false)
                      return
                    }
                    
                    const errorMessage = event.error?.message || 
                                       event.message || 
                                       'Map failed to load. Please check your internet connection and MapBox token.'
                    setMapError(errorMessage)
                  }}
                  attributionControl={false}
                  reuseMaps={true}
                >
                  {/* Custom 3D Control Panel */}
                  <div className="absolute top-3 right-3 z-30 bg-white rounded-xl shadow-sm border border-gray-200 p-2 space-y-1">
                    <Button
                      size="sm"
                      variant={is3DView ? "default" : "outline"}
                      onClick={toggle3DView}
                      className="w-full text-xs h-7 bg-teal-500 hover:bg-teal-600"
                    >
                      {is3DView ? "3D" : "2D"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (mapRef) {
                          mapRef.easeTo({
                            center: [-74.0060, 40.7128],
                            zoom: 15,
                            pitch: is3DView ? 45 : 0,
                            bearing: 0,
                            duration: 1500
                          })
                        }
                      }}
                      className="w-full text-xs h-7 border-gray-200 hover:bg-gray-50"
                    >
                      Reset
                    </Button>
                  </div>
                  {/* 3D Navigation Controls */}
                  <NavigationControl position="bottom-right" showCompass={true} showZoom={true} />
                  <FullscreenControl position="bottom-left" />
                  <ScaleControl position="bottom-left" style={{ marginBottom: '60px' }} />
                  
                  {/* Enhanced 3D Event Markers */}
                  {mockEvents.map((event) => (
                    <Marker
                      key={event.id}
                      longitude={event.coordinates[0]}
                      latitude={event.coordinates[1]}
                      anchor="bottom"
                    >
                      <div 
                        className="cursor-pointer transform hover:scale-125 transition-all duration-300"
                        onClick={() => setSelectedEvent(event)}
                        style={{
                          filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))'
                        }}
                      >
                        {/* 3D-style marker with depth */}
                        <div className="relative">
                          {/* Shadow/base */}
                          <div className="absolute top-2 left-2 w-12 h-12 bg-gray-400 rounded-full opacity-30 blur-sm"></div>
                          
                          {/* Main marker */}
                          <div className="relative bg-gradient-to-br from-white to-gray-100 rounded-full p-3 shadow-2xl border-2 border-blue-500 hover:border-blue-600">
                            <span className="text-xl block transform hover:scale-110 transition-transform">
                              {getEventTypeIcon(event.type)}
                            </span>
                            
                            {/* 3D highlight */}
                            <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-80"></div>
                            
                            {/* Event type indicator */}
                            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                              event.type === 'adoption' ? 'bg-green-500' :
                              event.type === 'workshop' ? 'bg-blue-500' :
                              event.type === 'education' ? 'bg-purple-500' :
                              event.type === 'healthcare' ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`}></div>
                          </div>
                          
                          {/* Pulsing animation for selected event */}
                          {selectedEvent?.id === event.id && (
                            <div className="absolute inset-0 rounded-full border-2 border-blue-500 animate-ping opacity-75"></div>
                          )}
                        </div>
                      </div>
                    </Marker>
                  ))}

                  {selectedEvent && (
                    <Popup
                      longitude={selectedEvent.coordinates[0]}
                      latitude={selectedEvent.coordinates[1]}
                      anchor="top"
                      onClose={() => setSelectedEvent(null)}
                      closeButton={true}
                      closeOnClick={false}
                      className="min-w-[300px]"
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-2xl">{getEventTypeIcon(selectedEvent.type)}</span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{selectedEvent.description}</p>
                            <Badge className={getEventTypeColor(selectedEvent.type)} variant="secondary">
                              {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{selectedEvent.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{selectedEvent.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span>{selectedEvent.currentParticipants}/{selectedEvent.maxParticipants} participants</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <span className="font-semibold text-green-600">{selectedEvent.fee}</span>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Join Event
                          </Button>
                        </div>
                      </div>
                    </Popup>
                  )}
                </Map>
        </div>
      </div>

      {/* Events Sidebar - Messages Style */}
      <div className="w-80 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
              <p className="text-sm text-gray-500">{mockEvents.length} events found</p>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">Live</span>
            </div>
          </div>
        </div>
        
        {/* Events List */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-1 p-2">
            {mockEvents.map((event) => (
              <div 
                key={event.id} 
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedEvent?.id === event.id 
                    ? 'bg-teal-50 border border-teal-200' 
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
                onClick={() => {
                  setSelectedEvent(event)
                  flyToLocation(event.coordinates)
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">{getEventTypeIcon(event.type)}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-medium text-sm text-gray-900 leading-tight">
                        {event.title}
                      </h3>
                      <Badge className={`${getEventTypeColor(event.type)} text-xs`} variant="secondary">
                        {event.type}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(event.date).toLocaleDateString()} • {event.time}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="h-3 w-3" />
                          <span>{event.currentParticipants}/{event.maxParticipants}</span>
                        </div>
                        <span className="text-xs font-semibold text-green-600">
                          {event.fee}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  )
}