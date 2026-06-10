'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Hospital } from '@/types'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

interface HospitalMapProps {
  hospitals: Hospital[]
  center?: [number, number]
  onHospitalClick?: (hospital: Hospital) => void
}

export default function HospitalMap({ hospitals, center = [3.3792, 6.5244], onHospitalClick }: HospitalMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const initMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: 10
    })

    map.current = initMap
    map.current.addControl(new mapboxgl.NavigationControl())

    // Wait for map to fully load
    map.current.on('load', () => {
      setMapLoaded(true)
    })

    return () => {
      map.current?.remove()
      markers.current.forEach(marker => marker.remove())
      map.current = null
    }
  }, [])

  // Add markers when map is loaded and hospitals change
  useEffect(() => {
    if (!mapLoaded || !map.current) return

    // Clear existing markers
    markers.current.forEach(marker => marker.remove())
    markers.current = []

    if (!hospitals.length) return

    // Add new markers
    hospitals.forEach(hospital => {
      // Skip if coordinates are invalid
      if (!hospital.coordinates?.lng || !hospital.coordinates?.lat) return

      const { lat, lng } = hospital.coordinates
      
      // Create custom marker element
      const el = document.createElement('div')
      el.className = 'cursor-pointer w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg hover:bg-blue-700 transition-colors'
      el.textContent = '🏥'

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold">${hospital.name || 'Hospital'}</h3>
          <p class="text-sm text-gray-600">${hospital.city || ''}</p>
          <p class="text-sm text-yellow-600">★ ${hospital.rating_avg?.toFixed(1) || '0.0'} (${hospital.rating_count || 0})</p>
        </div>
      `)

      // Create and add marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current!)

      // Add click handler
      if (onHospitalClick) {
        el.addEventListener('click', () => onHospitalClick(hospital))
      }

      markers.current.push(marker)
    })

    // Fit bounds to show all markers (only if we have valid markers)
    if (markers.current.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      hospitals.forEach(hospital => {
        if (hospital.coordinates?.lng && hospital.coordinates?.lat) {
          bounds.extend([hospital.coordinates.lng, hospital.coordinates.lat])
        }
      })
      map.current.fitBounds(bounds, { padding: 50 })
    }
  }, [hospitals, mapLoaded, onHospitalClick])

  // Handle center change (for location search)
  useEffect(() => {
    if (mapLoaded && map.current && center) {
      map.current.flyTo({
        center: center,
        zoom: 12,
        duration: 1000
      })
    }
  }, [center, mapLoaded])

  return <div ref={mapContainer} className="w-full h-full rounded-lg shadow-lg" />
}