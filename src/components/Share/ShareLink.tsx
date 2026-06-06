'use client'

import { useState } from 'react'
import { Share2, Copy, Check } from 'lucide-react'
import { SearchFilters } from '@/types'

interface ShareLinkProps {
  filters: SearchFilters
}

export default function ShareLink({ filters }: ShareLinkProps) {
  const [copied, setCopied] = useState(false)

  const generateShareableUrl = () => {
    const params = new URLSearchParams()
    
    if (filters.query) params.set('q', filters.query)
    if (filters.city) params.set('city', filters.city)
    if (filters.lga) params.set('lga', filters.lga)
    if (filters.specialties?.length) params.set('specialties', filters.specialties.join(','))
    if (filters.ownership_type) params.set('ownership', filters.ownership_type)
    if (filters.radius) params.set('radius', filters.radius.toString())
    if (filters.lat && filters.lng) {
      params.set('lat', filters.lat.toString())
      params.set('lng', filters.lng.toString())
    }
    
    return `${window.location.origin}/search?${params.toString()}`
  }

  const handleCopy = async () => {
    const url = generateShareableUrl()
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Share Search
        </>
      )}
    </button>
  )
}