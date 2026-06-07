
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// Singleton client instance
export const supabase = createClient()

// Type definitions
export type Hospital = {
  id: string
  name: string
  slug: string
  address: string
  city: string
  lga: string
  phone: string
  email: string | null
  specialties: string[]
  ownership_type: 'public' | 'private'
  visiting_hours: string
  description: string | null
  rating_avg: number | null
  rating_count: number | null
  created_at: string
  updated_at: string
}


// Type for radius search results (includes distance_meters)
export type HospitalWithDistance = Hospital & {
  distance_meters: number
}

// Search functions
export async function getAllHospitals() {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .order('name')
  
  return { data: data as Hospital[] | null,error }
}

export async function searchHospitalsByText(searchTerm: string) {
  let query = supabase.from('hospitals').select('*')
  
  if (searchTerm && searchTerm.trim()) {
    query = query.or(
      `name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,lga.ilike.%${searchTerm}%`
    )
  }
  
  const { data, error } = await query.order('name')
  return { data: data as Hospital[] | null, error }
}

export async function searchHospitalsByRadius(
  longitude: number,
  latitude: number,
  radiusKm: number = 10
) {
  const { data, error } = await supabase
    .rpc('hospitals_within_radius', {
      center_lng: longitude,
      center_lat: latitude,
      radius_meters: radiusKm * 1000
    })
  
  if (error) {
    console.error('Radius search error:', error)
    return { data: null, error }
  }
  
  return { data: data as unknown as Hospital[] | null, error: null }
}

export async function getHospitalBySlug(slug: string) {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .eq('slug', slug)
    .single()
  
  return { data: data as Hospital | null, error }
}