import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function HireRequest({ session, profile }) {
  const { shooterId } = useParams()
  const navigate = useNavigate()
  const [shooter, setShooter] = useState(null)
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [budget, setBudget] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchShooterData()
  }, [shooterId])

  async function fetchShooterData() {
    const { data: shooterData } = await supabase.from('profiles').select('*').eq('id', shooterId).single()
    setShooter(shooterData)
    const { data: servicesData } = await supabase.from('services').select('*').eq('shooter_id', shooterId)
    setServices(servicesData || [])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!eventDate || !eventTime || !location || !selectedService) {
      setError('Please fill in all required fields')
      return
    }
    setLoading(true)
    setError('')

    const clientId = localStorage.getItem('litratalogo_client_id') || profile?.id
    if (!clientId) {
      setError('No client ID found. Please enter as client first.')
      setLoading(false)
      return
    }

    const { error: bookingError } = await supabase.from('bookings').insert({
      client_id: clientId,
      shooter_id: shooterId,
      service_id: selectedService,
      event_date: eventDate,
      event_time: eventTime,
      location,
      notes,
      budget: budget ? parseFloat(budget) : null,
      status: 'pending'
    })

    if (bookingError) {
      setError(bookingError.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (!shooter) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur rounded-2xl p-8 w-full max-w-md border border-white/20 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-white mb-2">Hire Request Sent!</h1>
          <p className="text-gray-400 mb-6">
            Your request has been sent to {shooter.full_name}. They will review it and respond soon.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Payment terms: Cash on the day of the event, or as agreed between client and shooter.
          </p>
          <Link to={`/shooter/${shooterId}`} className="text-blue-400 hover:text-blue-300">Back to profile</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link to={`/shooter/${shooterId}`} className="text-gray-600 hover:text-gray-900">← Back to profile</Link>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hire {shooter.full_name}</h1>
          <p className="text-gray-500 mb-6">Fill in the details for your event booking.</p>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service *</label>
              <select value={selectedService} onChange={e => setSelectedService(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500">
                <option value="">Select a service</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name}{s.starting_price ? ` (₱${Number(s.starting_price).toLocaleString()})` : ''}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Time *</label>
                <input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Cagayan de Oro City" required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (optional)</label>
              <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. 15000"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Any special requests or details..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-medium disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Hire Request'}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-4">
            Payment terms: Cash by default, or as agreed between client and shooter. No in-app payment processing.
          </p>
        </div>
      </div>
    </div>
  )
}
