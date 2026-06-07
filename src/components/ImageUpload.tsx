'use client'

import { useState } from 'react'
import { Upload, X, AlertCircle } from 'lucide-react'
import { uploadHospitalImage, deleteHospitalImage, getImagePath } from '@/lib/supabase/storage'

interface ImageUploadProps {
  hospitalId: string
  onUploadComplete: (imageUrl: string) => void
  currentImageUrl?: string
  imageType?: 'logo' | 'facility'
  label?: string
}

export default function ImageUpload({
  hospitalId,
  onUploadComplete,
  currentImageUrl,
  imageType = 'facility',
  label = 'Upload Image'
}: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setIsLoading(true)

    try {
      // Show preview immediately
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload file
      const imageUrl = await uploadHospitalImage(file, hospitalId, imageType)
      onUploadComplete(imageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreview(currentImageUrl || null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!currentImageUrl) return

    setIsLoading(true)
    try {
      const filePath = getImagePath(currentImageUrl)
      await deleteHospitalImage(filePath)
      setPreview(null)
      onUploadComplete('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {error && (
        <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {preview && (
        <div className="relative w-full max-w-xs">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
          />
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              {isLoading ? 'Uploading...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 5MB</p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading}
            className="hidden"
          />
        </label>
      </div>
    </div>
  )
}
