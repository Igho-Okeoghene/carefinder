import { z } from 'zod'

export const hospitalFormSchema = z.object({
  name: z.string().min(3, 'Hospital name must be at least 3 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  lga: z.string().min(2, 'LGA is required'),
  phone: z.string().regex(
    /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
    'Phone number format is invalid'
  ),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
  ownership_type: z.enum(['public', 'private']),
  visiting_hours: z.string().optional(),
  description: z.string().optional(),
  lat: z.number().min(-90, 'Latitude must be between -90 and 90').max(90),
  lng: z.number().min(-180, 'Longitude must be between -180 and 180').max(180),
})

export type HospitalFormData = z.infer<typeof hospitalFormSchema>

export const reviewModerationSchema = z.object({
  rating: z.number().min(1).max(5),
  review_text: z.string().optional(),
  is_approved: z.boolean(),
})

export const searchFiltersSchema = z.object({
  searchTerm: z.string().optional(),
  city: z.string().optional(),
  lga: z.string().optional(),
  specialty: z.string().optional(),
  ownershipType: z.enum(['public', 'private', 'all']).optional().default('all'),
  useRadius: z.boolean().optional().default(false),
  radiusKm: z.number().min(1).max(100).optional().default(10),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional()
})

export type SearchFilters = z.infer<typeof searchFiltersSchema>

// Hospital form validation
export const hospitalSchema = z.object({
  name: z.string().min(1, 'Hospital name is required'),
  slug: z.string().min(1, 'Slug is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  lga: z.string().min(1, 'LGA is required'),
  phone: z.string().regex(/^[\+\d\s-]+$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email address').optional(),
  specialties: z.array(z.string()).min(1, 'At least one specialty required'),
  ownership_type: z.enum(['public', 'private']),
  visiting_hours: z.string().optional(),
  description: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
})