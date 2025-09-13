"use client"

import dynamic from 'next/dynamic'

// Dynamically import the EventMap component to avoid SSR issues with MapBox
const EventMap = dynamic(() => import('./EventMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading interactive map...</p>
      </div>
    </div>
  )
})

export default function MapBoxWrapper() {
  return <EventMap />
}