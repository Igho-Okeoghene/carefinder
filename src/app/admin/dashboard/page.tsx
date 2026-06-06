'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Hospital, Review } from '@/types'
import MDEditor from '@uiw/react-md-editor'
import { Plus, Edit, Trash2, Eye, EyeOff, LogOut } from 'lucide-react'

export default function AdminDashboard() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    lga: '',
    phone: '',
    email: '',
    specialties: [] as string[],
    ownership_type: 'public' as 'public' | 'private',
    visiting_hours: '',
    description: '',
    lat: 6.5244,
    lng: 3.3792
  })
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkAdminAndFetchData()
  }, [])

  const checkAdminAndFetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Check if user is admin (you can implement this check based on your auth setup)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      router.push('/')
      return
    }

    await fetchData()
  }

  const fetchData = async () => {
    const { data: hospitalsData } = await supabase
      .from('hospitals')
      .select('*')
      .order('name')
    
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*, hospitals(name)')
      .order('created_at', { ascending: false })

    if (hospitalsData) {
      const transformed = hospitalsData.map(h => ({
        ...h,
        coordinates: {
          lat: h.coordinates.coordinates[1],
          lng: h.coordinates.coordinates[0]
        }
      }))
      setHospitals(transformed)
    }
    if (reviewsData) setReviews(reviewsData)
    setLoading(false)
  }

  const handleSubmit = async () => {
    const hospitalData: any = {
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      address: formData.address,
      city: formData.city,
      lga: formData.lga,
      coordinates: `POINT(${formData.lng} ${formData.lat})`,
      phone: formData.phone,
      email: formData.email || null,
      specialties: formData.specialties,
      ownership_type: formData.ownership_type,
      visiting_hours: formData.visiting_hours || null,
      description: formData.description || null,
    }

    let error
    if (editingHospital) {
      const { error: updateError } = await supabase
        .from('hospitals')
        .update(hospitalData)
        .eq('id', editingHospital.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('hospitals')
        .insert([hospitalData])
      error = insertError
    }

    if (error) {
      console.error('Error saving hospital:', error)
      alert('Failed to save hospital')
    } else {
      await fetchData()
      setShowForm(false)
      setEditingHospital(null)
      resetForm()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this hospital?')) {
      const { error } = await supabase
        .from('hospitals')
        .delete()
        .eq('id', id)
      
      if (error) {
        alert('Failed to delete hospital')
      } else {
        await fetchData()
      }
    }
  }

  const handleModerateReview = async (reviewId: string, approve: boolean) => {
    const { error } = await supabase
      .from('reviews')
      .update({ is_approved: approve })
      .eq('id', reviewId)

    if (error) {
      alert('Failed to moderate review')
    } else {
      await fetchData()
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      lga: '',
      phone: '',
      email: '',
      specialties: [],
      ownership_type: 'public',
      visiting_hours: '',
      description: '',
      lat: 6.5244,
      lng: 3.3792
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowForm(true)
                setEditingHospital(null)
                resetForm()
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Hospital
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Hospitals Management */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Manage Hospitals</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">City</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Rating</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hospitals.map(hospital => (
                  <tr key={hospital.id} className="border-t">
                    <td className="px-4 py-2">{hospital.name}</td>
                    <td className="px-4 py-2">{hospital.city}</td>
                    <td className="px-4 py-2">{hospital.phone}</td>
                    <td className="px-4 py-2">{hospital.rating_avg.toFixed(1)}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingHospital(hospital)
                            setFormData({
                              name: hospital.name,
                              address: hospital.address,
                              city: hospital.city,
                              lga: hospital.lga,
                              phone: hospital.phone,
                              email: hospital.email || '',
                              specialties: hospital.specialties,
                              ownership_type: hospital.ownership_type,
                              visiting_hours: hospital.visiting_hours || '',
                              description: hospital.description || '',
                              lat: hospital.coordinates.lat,
                              lng: hospital.coordinates.lng
                            })
                            setShowForm(true)
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(hospital.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reviews Moderation */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Moderate Reviews</h2>
          <div className="space-y-4">
            {reviews.filter(r => !r.is_approved).length === 0 ? (
              <p className="text-gray-500">No pending reviews</p>
            ) : (
              reviews.filter(review => !review.is_approved).map(review => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.review_text && <p className="text-gray-700">{review.review_text}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleModerateReview(review.id, true)}
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        <Eye className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleModerateReview(review.id, false)}
                        className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        <EyeOff className="w-4 h-4" />
                        Hide
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add/Edit Hospital Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4">
                {editingHospital ? 'Edit Hospital' : 'Add New Hospital'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LGA *</label>
                    <input
                      type="text"
                      value={formData.lga}
                      onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
                  <input
                    type="text"
                    value={formData.specialties.join(', ')}
                    onChange={(e) => setFormData({ ...formData, specialties: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="Maternity, Emergency, Dental, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ownership Type</label>
                  <select
                    value={formData.ownership_type}
                    onChange={(e) => setFormData({ ...formData, ownership_type: e.target.value as 'public' | 'private' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visiting Hours (Markdown)</label>
                  <MDEditor
                    value={formData.visiting_hours}
                    onChange={(val) => setFormData({ ...formData, visiting_hours: val || '' })}
                    preview="live"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Markdown)</label>
                  <MDEditor
                    value={formData.description}
                    onChange={(val) => setFormData({ ...formData, description: val || '' })}
                    preview="live"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingHospital ? 'Update' : 'Create'} Hospital
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false)
                      setEditingHospital(null)
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}