import { createClient } from '@/lib/supabase/client'

const BUCKET_NAME = 'hospital-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function uploadHospitalImage(
  file: File,
  hospitalId: string,
  imageType: 'logo' | 'facility' = 'facility'
): Promise<string> {
  // Validate file
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG, and WebP images are allowed')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must be less than 5MB')
  }

  const supabase = createClient()

  // Create unique filename
  const timestamp = Date.now()
  const fileExt = file.name.split('.').pop()
  const fileName = `${hospitalId}/${imageType}-${timestamp}.${fileExt}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)

  return publicUrlData.publicUrl
}

export async function deleteHospitalImage(filePath: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

export function getImagePath(publicUrl: string): string {
  // Extract file path from public URL
  const baseUrl = `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${BUCKET_NAME}/`
  return publicUrl.replace(baseUrl, '')
}
