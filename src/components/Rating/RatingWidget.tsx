'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface RatingWidgetProps {
  hospitalId: string
  onRatingSubmitted?: () => void
}

export default function RatingWidget({ hospitalId, onRatingSubmitted }: RatingWidgetProps) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useState(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  })

  const handleSubmit = async () => {
    if (!user) {
      alert('Please login to leave a review')
      return
    }

    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    setIsSubmitting(true)
    const { error } = await supabase
      .from('reviews')
      .insert({
        hospital_id: hospitalId,
        user_id: user.id,
        rating,
        review_text: reviewText || null,
        is_approved: false
      })

    if (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } else {
      setRating(0)
      setReviewText('')
      onRatingSubmitted?.()
      alert('Review submitted successfully! It will appear after admin approval.')
    }
    setIsSubmitting(false)
  }

  if (!user) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-gray-600">Please login to leave a review</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <h4 className="font-semibold mb-3">Rate this Hospital</h4>
      
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 ${
                (hover || rating) >= star
                  ? 'text-yellow-500 fill-current'
                  : 'text-gray-300'
              } transition-colors`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="Share your experience (optional)"
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-3"
      />

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  )
}