import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function ShooterProfile({ session, profile }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [shooter, setShooter] = useState(null)
  const [services, setServices] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (id) fetchData() }, [id])

  async function fetchData() {
    const { data: shooterData } = await supabase.from('profiles').select('*').eq('id', id).single()
    setShooter(shooterData)

    const { data: servicesData } = await supabase.from('services').select('*').eq('shooter_id', id)
    setServices(servicesData || [])

    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .eq('to_user_id', id)
      .eq('direction', 'client_to_shooter')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
    setReviews(reviewsData || [])

    setLoading(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>
  if (!shooter) return <div className="min-h-screen flex items-center justify-center"><p>Shooter not found</p></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={`/catalog/${shooter.category || 'both'}`} className="text-gray-600 hover:text-gray-900">← Back to catalog</Link>
          {session && (
            <button onClick={() => navigate(`/hire/${id}`)} className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition text-sm">
              Hire {shooter.full_name?.split(' ')[0]}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl flex-shrink-0">
              {shooter.profile_photo ? <img src={shooter.profile_photo} className="w-full h-full rounded-full object-cover" /> : '📸'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{shooter.full_name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full capitalize">{shooter.category}</span>
                <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full capitalize">{shooter.experience_level}</span>
              </div>
              {shooter.bio && <p className="text-gray-600 mt-4">{shooter.bio}</p>}
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Services</h2>
        <div className="grid gap-4 mb-8">
          {services.map(service => (
            <div key={service.id} className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{service.name}</h3>
                  {service.description && <p className="text-gray-600 mt-1">{service.description}</p>}
                  {service.starting_price && (
                    <p className="text-green-700 font-medium mt-2">Starting at ₱{Number(service.starting_price).toLocaleString()}</p>
                  )}
                </div>
                <button onClick={() => navigate(`/hire/${id}`)}
                  className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition whitespace-nowrap">
                  Hire Me
                </button>
              </div>
            </div>
          ))}
          {services.length === 0 && <p className="text-gray-500">No services listed yet.</p>}
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white rounded-2xl shadow-sm border p-4">
              <div className="flex items-center gap-1 mb-1">
                {[1,2,3,4,5].map(star => (
                  <span key={star} className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                ))}
              </div>
              {review.comment && <p className="text-gray-600">{review.comment}</p>}
            </div>
          ))}
          {reviews.length === 0 && <p className="text-gray-500">No reviews yet.</p>}
        </div>
      </div>
    </div>
  )
}
