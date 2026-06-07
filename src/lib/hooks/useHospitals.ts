import { useState, useEffect, useCallback } from 'react'
import { 
  supabase, 
  getAllHospitals, 
  searchHospitalsByText, 
  searchHospitalsByRadius,
  type Hospital 
} from '@/lib/supabase/client'

export function useHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [useRadius, setUseRadius] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [radiusKm, setRadiusKm] = useState(10)

  const loadHospitals = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      let result
      
      if (useRadius && userLocation) {
        result = await searchHospitalsByRadius(
          userLocation.lng,
          userLocation.lat,
          radiusKm
        )
      } else if (searchTerm) {
        result = await searchHospitalsByText(searchTerm)
      } else {
        result = await getAllHospitals()
      }
      
      if (result.error) {
        setError(result.error.message)
        setHospitals([])
      } else {
        setHospitals(result.data || [])
      }
    } catch (err) {
      setError('Failed to load hospitals')
      setHospitals([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, useRadius, userLocation, radiusKm])

  useEffect(() => {
    loadHospitals()
  }, [loadHospitals])

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setUseRadius(true)
      },
      (err) => {
        setError('Unable to get your location. Please check permissions.')
        console.error(err)
      }
    )
  }, [])

  const clearRadiusSearch = useCallback(() => {
    setUseRadius(false)
    setUserLocation(null)
  }, [])

  return {
    hospitals,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    useRadius,
    setUseRadius,
    userLocation,
    radiusKm,
    setRadiusKm,
    getUserLocation,
    clearRadiusSearch,
    refetch: loadHospitals
  }
}