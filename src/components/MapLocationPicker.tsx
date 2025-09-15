"use client"

import { useState, useCallback, useRef } from "react"
import Map, { Marker, Popup } from "react-map-gl"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

// Penang coordinates as default center
const PENANG_CENTER = {
  latitude: 5.4164,
  longitude: 100.3327
}

interface MapLocationPickerProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address?: string }) => void
  initialLocation?: { latitude: number; longitude: number }
  height?: string
  className?: string
}

export default function MapLocationPicker({
  onLocationSelect,
  initialLocation,
  height = "400px",
  className = ""
}: MapLocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number
    longitude: number
    address?: string
  } | null>(initialLocation || null)
  
  const [viewState, setViewState] = useState({
    longitude: initialLocation?.longitude || PENANG_CENTER.longitude,
    latitude: initialLocation?.latitude || PENANG_CENTER.latitude,
    zoom: 12
  })

  const [showPopup, setShowPopup] = useState(false)
  const mapRef = useRef<any>(null)

  // Get readable address from coordinates (reverse geocoding)
  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      if (!mapboxToken) {
        console.warn('Mapbox access token not found')
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&limit=1`
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data.features && data.features.length > 0) {
          return data.features[0].place_name
        }
      }
    } catch (error) {
      console.error('Error getting address:', error)
    }
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }

  const handleMapClick = useCallback(async (event: any) => {
    const { lngLat } = event
    const latitude = lngLat.lat
    const longitude = lngLat.lng
    
    // Get address for the location
    const address = await getAddressFromCoordinates(latitude, longitude)
    
    const location = {
      latitude,
      longitude,
      address
    }
    
    setSelectedLocation(location)
    setShowPopup(true)
  }, [])

  const confirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation)
      setShowPopup(false)
    }
  }

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          const address = await getAddressFromCoordinates(latitude, longitude)
          
          const location = {
            latitude,
            longitude,
            address
          }
          
          setSelectedLocation(location)
          setViewState({
            latitude,
            longitude,
            zoom: 15
          })
          setShowPopup(true)
        },
        (error) => {
          console.error("Error getting current location:", error)
        }
      )
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="mb-3 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Click on the map to select event location
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          className="text-xs"
        >
          <MapPin className="h-3 w-3 mr-1" />
          Use My Location
        </Button>
      </div>
      
      <div style={{ height }} className="relative rounded-lg overflow-hidden border">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onClick={handleMapClick}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          style={{ width: "100%", height: "100%" }}
        >
          {selectedLocation && (
            <>
              <Marker
                latitude={selectedLocation.latitude}
                longitude={selectedLocation.longitude}
                anchor="bottom"
              >
                <div className="bg-teal-500 p-2 rounded-full shadow-lg">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
              </Marker>
              
              {showPopup && (
                <Popup
                  latitude={selectedLocation.latitude}
                  longitude={selectedLocation.longitude}
                  onClose={() => setShowPopup(false)}
                  anchor="top"
                  offset={[0, -10]}
                  className="max-w-xs"
                >
                  <div className="p-3">
                    <div className="text-sm font-medium mb-2">Selected Location</div>
                    <div className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {selectedLocation.address}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={confirmLocation}
                        className="bg-teal-500 hover:bg-teal-600 text-white"
                      >
                        Confirm Location
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowPopup(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Popup>
              )}
            </>
          )}
        </Map>
      </div>
      
      {selectedLocation && (
        <div className="mt-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-teal-600" />
            <span className="font-medium text-teal-800">Selected:</span>
            <span className="text-teal-700 flex-1 line-clamp-1">
              {selectedLocation.address}
            </span>
          </div>
          <div className="text-xs text-teal-600 mt-1">
            {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
          </div>
        </div>
      )}
    </div>
  )
}