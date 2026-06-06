'use client'

import { Hospital } from '@/types'
import { MapPin, Phone, Mail, Star, Building2 } from 'lucide-react'
import Link from 'next/link'

interface HospitalCardProps {
  hospital: Hospital
}

export default function HospitalCard({ hospital }: HospitalCardProps) {
  return (
    <Link href={`/hospitals/${hospital.slug}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-5 cursor-pointer border border-gray-100">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-800">{hospital.name}</h3>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="font-semibold text-sm">{hospital.rating_avg.toFixed(1)}</span>
            <span className="text-gray-500 text-sm">({hospital.rating_count})</span>
          </div>
        </div>

        <div className="space-y-2 text-gray-600">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
            <span className="text-sm">{hospital.address}, {hospital.city}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span className="text-sm">{hospital.phone}</span>
          </div>

          {hospital.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{hospital.email}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="text-sm capitalize">{hospital.ownership_type}</span>
          </div>

          {hospital.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {hospital.specialties.slice(0, 3).map(specialty => (
                <span key={specialty} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                  {specialty}
                </span>
              ))}
              {hospital.specialties.length > 3 && (
                <span className="text-xs text-gray-500">+{hospital.specialties.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}