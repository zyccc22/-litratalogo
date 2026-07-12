import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Catalog({ session }) {
  const { category } = useParams()
  const [shooters, setShooters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchShooters()
  }, [category])

  async function fetchShooters() {
    setLoading(true)
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('role', 'shooter')
      .eq('is_public', true)

    if (category === 'photographer') query = query.eq('category', 'photographer')
    else if (category === 'videographer') query = query.eq('category', 'videographer')

    const { data, error } = await query.order('created_at', { ascending: false })
    if (!error) setShooters(data)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-gray-600 hover:text-gray-900">← Back</Link>
          <h1 className="text-xl font-bold text-gray-900">
            {category === 'photographer' ? 'Photographers' : category === 'videographer' ? 'Videographers' : 'All Shooters'}
          </h1>
          {!session && (
            <Link to="/client-entry" className="text-sm text-blue-600 hover:text-blue-700">Client Entry</Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : shooters.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No shooters found yet.</p>
            <p className="text-gray-400 mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {shooters.map(shooter => (
              <Link key={shooter.id} to={`/shooter/${shooter.id}`}
                className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {shooter.profile_photo ? (
                    <img src={shooter.profile_photo} alt={shooter.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl">📸</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{shooter.full_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">{shooter.category}</span>
                    <span className="text-sm bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{shooter.experience_level}</span>
                  </div>
                  {shooter.bio && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{shooter.bio}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
