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

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: 10
    })

    map.current.addControl(new mapboxgl.NavigationControl())

    return () => {
      map.current?.remove()
      markers.current.forEach(marker => marker.remove())
    }
  }, [])

  useEffect(() => {
    if (!map.current) return

    // Clear existing markers
    markers.current.forEach(marker => marker.remove())
    markers.current = []

    // Add new markers
    hospitals.forEach(hospital => {
      const { lat, lng } = hospital.coordinates
      const el = document.createElement('div')
      el.className = 'cursor-pointer w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg hover:bg-blue-700 transition-colors'
      el.textContent = '🏥'

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">${hospital.name}</h3>
                <p class="text-sm text-gray-600">${hospital.city}</p>
                <p class="text-sm text-yellow-600">★ ${hospital.rating_avg.toFixed(1)} (${hospital.rating_count})</p>
              </div>
            `)
        )
        .addTo(map.current!)

      if (onHospitalClick) {
        el.addEventListener('click', () => onHospitalClick(hospital))
      }

      markers.current.push(marker)
    })

    // Fit bounds to show all markers
    if (hospitals.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      hospitals.forEach(hospital => {
        bounds.extend([hospital.coordinates.lng, hospital.coordinates.lat])
      })
      map.current.fitBounds(bounds, { padding: 50 })
    }
  }, [hospitals, onHospitalClick])

  return <div ref={mapContainer} className="w-full h-full rounded-lg shadow-lg" />
}