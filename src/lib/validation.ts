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
