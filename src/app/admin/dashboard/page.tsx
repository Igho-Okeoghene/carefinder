// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import MDEditor from '@uiw/react-md-editor'
import { Plus, Edit, Trash2, Eye, EyeOff, LogOut, Star, AlertCircle } from 'lucide-react'

export default function AdminDashboard() {
  const [hospitals, setHospitals] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingHospital, setEditingHospital] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [formData, setFormData] = useState({
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

    await fetchData()
  }

  const fetchData = async () => {
    try {
      // Fetch hospitals
      const { data: hospitalsData, error: hospitalsError } = await supabase
        .from('hospitals')
        .select('*')
        .order('name')
      
      if (hospitalsError) {
        console.error('Error fetching hospitals:', hospitalsError)
      }

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError)
      }

      if (hospitalsData) {
        // Safe coordinate transformation
        const transformed = hospitalsData.map((h) => {
          let lat = 0, lng = 0
          
          // Handle different coordinate formats safely
          if (h.coordinates && typeof h.coordinates === 'object') {
            if (h.coordinates.coordinates && Array.isArray(h.coordinates.coordinates)) {
              // PostGIS format: { coordinates: [lng, lat] }
              lng = h.coordinates.coordinates[0] || 0
              lat = h.coordinates.coordinates[1] || 0
            } else if (h.coordinates.lat !== undefined && h.coordinates.lng !== undefined) {
              // Object format: { lat: x, lng: y }
              lat = h.coordinates.lat || 0
              lng = h.coordinates.lng || 0
            }
          }
          
          return {
            ...h,
            coordinates: { lat, lng },
            // Ensure arrays are always arrays
            specialties: Array.isArray(h.specialties) ? h.specialties : [],
            // Ensure ratings have defaults
            rating_avg: h.rating_avg || 0,
            rating_count: h.rating_count || 0
          }
        })
        setHospitals(transformed)
      }
      
      if (reviewsData) {
        // Transform reviews to match expected format safely
        const transformedReviews = reviewsData.map((r) => ({
          ...r,
          comment: r.comment || r.review_text || '',
          approved: r.approved || r.is_approved || false,
          rating: r.rating || 0
        }))
        setReviews(transformedReviews)
      }
    } catch (error) {
      console.error('Error in fetchData:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setValidationErrors({})

    // Basic validation
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Name is required'
    if (!formData.address.trim()) errors.address = 'Address is required'
    if (!formData.city.trim()) errors.city = 'City is required'
    if (!formData.lga.trim()) errors.lga = 'LGA is required'
    if (!formData.phone.trim()) errors.phone = 'Phone is required'
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    try {
      const hospitalData = {
        name: formData.name.trim(),
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        address: formData.address.trim(),
        city: formData.city.trim(),
        lga: formData.lga.trim(),
        coordinates: `POINT(${formData.lng} ${formData.lat})`,
        phone: formData.phone.trim(),
        email: formData.email || null,
        specialties: formData.specialties.filter(s => s.trim()),
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
        alert('Failed to save hospital: ' + error.message)
      } else {
        await fetchData()
        setShowForm(false)
        setEditingHospital(null)
        resetForm()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save hospital')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this hospital?')) {
      const { error } = await supabase
        .from('hospitals')
        .delete()
        .eq('id', id)
      
      if (error) {
        alert('Failed to delete hospital: ' + error.message)
      } else {
        await fetchData()
      }
    }
  }

  const handleModerateReview = async (reviewId, approve) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ approved: approve, is_approved: approve })
        .eq('id', reviewId)

      if (error) {
        alert('Failed to moderate review: ' + error.message)
      } else {
        await fetchData()
      }
    } catch (error) {
      console.error('Error moderating review:', error)
      alert('Failed to moderate review')
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
    setValidationErrors({})
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowForm(true)
                setEditingHospital(null)
                resetForm()
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Hospital
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Hospitals Management Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Manage Hospitals</h2>
          <div className="overflow-x-auto">
            {hospitals.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hospitals found. Click "Add Hospital" to create one.</p>
            ) : (
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
                  {hospitals.map((hospital) => (
                    <tr key={hospital.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{hospital.name || 'N/A'}</td>
                      <td className="px-4 py-2">{hospital.city || 'N/A'}</td>
                      <td className="px-4 py-2">{hospital.phone || 'N/A'}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{hospital.rating_avg?.toFixed(1) || '0.0'}</span>
                          <span className="text-gray-500 text-sm">({hospital.rating_count || 0})</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingHospital(hospital)
                              setFormData({
                                name: hospital.name || '',
                                address: hospital.address || '',
                                city: hospital.city || '',
                                lga: hospital.lga || '',
                                phone: hospital.phone || '',
                                email: hospital.email || '',
                                specialties: hospital.specialties || [],
                                ownership_type: hospital.ownership_type || 'public',
                                visiting_hours: hospital.visiting_hours || '',
                                description: hospital.description || '',
                                lat: hospital.coordinates?.lat || 0,
                                lng: hospital.coordinates?.lng || 0
                              })
                              setShowForm(true)
                            }}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(hospital.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Reviews Moderation Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Moderate Reviews</h2>
          <div className="space-y-4">
            {reviews.filter((r) => !r.approved).length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending reviews to moderate.</p>
            ) : (
              reviews.filter((review) => !review.approved).map((review) => (
                <div key={review.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
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
                          {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Unknown date'}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 mt-2">{review.comment}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleModerateReview(review.id, true)}
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleModerateReview(review.id, false)}
                        className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
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

              {/* Validation Errors Display */}
              {Object.keys(validationErrors).length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex gap-2 items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-800 mb-2">Please fix the following errors:</h3>
                      <ul className="space-y-1 text-sm text-red-700">
                        {Object.entries(validationErrors).map(([field, error]) => (
                          <li key={field}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {/* Basic Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter hospital name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Lagos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LGA *</label>
                    <input
                      type="text"
                      value={formData.lga}
                      onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Local Government Area"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., +234 123 456 7890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="hospital@example.com"
                  />
                </div>

                {/* Hospital Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialties (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.specialties.join(', ')}
                    onChange={(e) => setFormData({ ...formData, specialties: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Maternity, Emergency, Dental, Pediatric, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ownership Type</label>
                  <select
                    value={formData.ownership_type}
                    onChange={(e) => setFormData({ ...formData, ownership_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                {/* Markdown Editors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visiting Hours</label>
                  <MDEditor
                    value={formData.visiting_hours}
                    onChange={(val) => setFormData({ ...formData, visiting_hours: val || '' })}
                    preview="live"
                    style={{ borderRadius: '0.5rem' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <MDEditor
                    value={formData.description}
                    onChange={(val) => setFormData({ ...formData, description: val || '' })}
                    preview="live"
                    style={{ borderRadius: '0.5rem' }}
                  />
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 6.5244"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 3.3792"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {editingHospital ? 'Update Hospital' : 'Create Hospital'}
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false)
                      setEditingHospital(null)
                      resetForm()
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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