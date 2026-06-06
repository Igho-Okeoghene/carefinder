'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, MapPin, Star, Building2, Activity } from 'lucide-react'
import { SearchFilters } from '@/types'

const SPECIALTIES = ['Maternity', 'Emergency', 'Dental', 'Pediatric', 'Cardiology', 'Orthopedics', 'Ophthalmology']

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void
  initialFilters?: SearchFilters
  onUseMyLocation?: () => void
  isLocating?: boolean
}

export default function SearchBar({ onSearch, initialFilters, onUseMyLocation, isLocating }: SearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {})
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleSpecialtyToggle = (specialty: string) => {
    const current = filters.specialties || []
    const updated = current.includes(specialty)
      ? current.filter(s => s !== specialty)
      : [...current, specialty]
    setFilters({ ...filters, specialties: updated })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="space-y-4">
        {/* Main Search Input */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by hospital name, city, or LGA..."
              value={filters.query || ''}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Search
          </button>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <Filter className="w-4 h-4" />
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            {/* City and LGA */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="City"
                value={filters.city || ''}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Local Government Area"
                value={filters.lga || ''}
                onChange={(e) => setFilters({ ...filters, lga: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Radius Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Radius (km)
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Radius in km"
                  value={filters.radius || ''}
                  onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) || undefined })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={onUseMyLocation}
                  disabled={isLocating}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  {isLocating ? 'Locating...' : 'Use My Location'}
                </button>
              </div>
            </div>

            {/* Specialties */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialties
              </label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map(specialty => (
                  <button
                    key={specialty}
                    onClick={() => handleSpecialtyToggle(specialty)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.specialties?.includes(specialty)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>

            {/* Ownership Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ownership Type
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setFilters({ ...filters, ownership_type: 'public' })}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    filters.ownership_type === 'public'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Public
                </button>
                <button
                  onClick={() => setFilters({ ...filters, ownership_type: 'private' })}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    filters.ownership_type === 'private'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  Private
                </button>
                {filters.ownership_type && (
                  <button
                    onClick={() => setFilters({ ...filters, ownership_type: null })}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}