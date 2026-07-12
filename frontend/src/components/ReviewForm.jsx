import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function ReviewForm({ fromUserId, toUserId, direction, onSubmitted }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('reviews').insert({
      from_user_id: fromUserId,
      to_user_id: toUserId,
      direction,
      rating,
      comment,
      visibility: direction === 'shooter_to_client' ? 'shooters_only' : 'public'
    })
    if (!error) {
      alert('Review submitted!')
      setComment('')
      setShow(false)
      if (onSubmitted) onSubmitted()
    } else {
      alert('Error: ' + error.message)
    }
    setLoading(false)
  }

  if (!show) {
    return <button onClick={() => setShow(true)} className="text-blue-600 hover:text-blue-700 text-sm">Leave a Review</button>
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
      <h3 className="font-semibold text-gray-900">Leave a Review</h3>
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map(star => (
          <button key={star} type="button" onClick={() => setRating(star)}
            className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition`}>
            ★
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="Your feedback..."
        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500" />
      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
        <button type="button" onClick={() => setShow(false)}
          className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  )
}
