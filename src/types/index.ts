export interface Hospital {
  id: string
  name: string
  slug: string
  address: string
  city: string
  lga: string
  coordinates: { lat: number; lng: number }
  phone: string
  email: string | null
  specialties: string[]
  ownership_type: 'public' | 'private'
  visiting_hours: string | null
  description: string | null
  rating_avg: number
  rating_count: number
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  hospital_id: string
  user_id: string
  rating: number
  review_text: string | null
  is_approved: boolean
  created_at: string
}

export interface SearchFilters {
  query?: string
  city?: string
  lga?: string
  specialties?: string[]
  ownership_type?: 'public' | 'private' | null
  radius?: number
  lat?: number
  lng?: number
}

export interface ShareableFilters extends SearchFilters {
  page?: number
  limit?: number
}