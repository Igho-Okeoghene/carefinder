import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import HospitalCard from '@/components/Hospital/HospitalCard'
import { Hospital } from '@/types'

const mockHospital: Hospital = {
  id: '1',
  name: 'Test Hospital',
  slug: 'test-hospital',
  address: '123 Test St',
  city: 'Lagos',
  lga: 'Ikeja',
  coordinates: { lat: 6.5244, lng: 3.3792 },
  phone: '+234123456789',
  email: 'test@hospital.com',
  specialties: ['Emergency', 'Maternity'],
  ownership_type: 'public',
  visiting_hours: '9am-5pm',
  description: 'Test description',
  rating_avg: 4.5,
  rating_count: 10,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

describe('HospitalCard', () => {
  it('renders hospital information correctly', () => {
    render(<HospitalCard hospital={mockHospital} />)
    
    expect(screen.getByText('Test Hospital')).toBeInTheDocument()
    expect(screen.getByText('123 Test St, Lagos')).toBeInTheDocument()
    expect(screen.getByText('+234123456789')).toBeInTheDocument()
    expect(screen.getByText('public')).toBeInTheDocument()
    expect(screen.getByText('Emergency')).toBeInTheDocument()
    expect(screen.getByText('Maternity')).toBeInTheDocument()
  })

  it('displays rating correctly', () => {
    render(<HospitalCard hospital={mockHospital} />)
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('(10)')).toBeInTheDocument()
  })
})