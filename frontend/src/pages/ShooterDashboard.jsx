import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import PrivacyNotice from '../components/PrivacyNotice'

function DashboardHome({ profile }) {
  const [bookingsCount, setBookingsCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [avgRating, setAvgRating] = useState(0)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    const { data: bookings } = await supabase.from('bookings').select('*').eq('shooter_id', profile.id)
    if (bookings) {
      setBookingsCount(bookings.length)
      setPendingCount(bookings.filter(b => b.status === 'pending').length)
    }
    const { data: reviews } = await supabase.from('reviews').select('rating').eq('to_user_id', profile.id).eq('direction', 'client_to_shooter')
    if (reviews && reviews.length > 0) {
      setAvgRating(Math.round(reviews.reduce((a, r) => a + r.rating, 0) / reviews.length * 10) / 10)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <p className="text-gray-500 text-sm">Total Bookings</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{bookingsCount}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <p className="text-gray-500 text-sm">Pending Requests</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <p className="text-gray-500 text-sm">Average Rating</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{avgRating || '—'}</p>
        </div>
      </div>
      <PrivacyNotice />
    </div>
  )
}

function ManageServices({ profile }) {
  const [services, setServices] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [externalLink, setExternalLink] = useState('')

  useEffect(() => { fetchServices() }, [])

  async function fetchServices() {
    const { data } = await supabase.from('services').select('*').eq('shooter_id', profile.id)
    setServices(data || [])
  }

  async function addService(e) {
    e.preventDefault()
    const { error } = await supabase.from('services').insert({
      shooter_id: profile.id, name, description,
      starting_price: price ? parseFloat(price) : null,
      external_link: externalLink
    })
    if (!error) { setShowForm(false); setName(''); setDescription(''); setPrice(''); setExternalLink(''); fetchServices() }
  }

  async function deleteService(id) {
    if (confirm('Delete this service?')) {
      await supabase.from('services').delete().eq('id', id)
      fetchServices()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Services</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition">
          {showForm ? 'Cancel' : '+ Add Service'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={addService} className="bg-white rounded-2xl shadow-sm border p-6 mb-6 space-y-4">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Service Name *" required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500" />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Starting Price (optional)"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500" />
            <input type="url" value={externalLink} onChange={e => setExternalLink(e.target.value)} placeholder="Video Link (YouTube/Vimeo/Drive)"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500" />
          </div>
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition">Save Service</button>
        </form>
      )}
      <div className="space-y-4">
        {services.map(service => (
          <div key={service.id} className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{service.name}</h3>
                {service.description && <p className="text-gray-600 mt-1">{service.description}</p>}
                {service.starting_price && <p className="text-green-700 font-medium mt-1">₱{Number(service.starting_price).toLocaleString()}</p>}
              </div>
              <button onClick={() => deleteService(service.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
            </div>
          </div>
        ))}
        {services.length === 0 && <p className="text-gray-500">No services yet. Add your first service!</p>}
      </div>
    </div>
  )
}

function ManageProfile({ profile }) {
  const [bio, setBio] = useState(profile.bio || '')
  const [isPublic, setIsPublic] = useState(profile.is_public || false)
  const [profilePhoto, setProfilePhoto] = useState(profile.profile_photo || '')
  const [saving, setSaving] = useState(false)

  async function saveProfile() {
    setSaving(true)
    await supabase.from('profiles').update({ bio, is_public: isPublic, profile_photo: profilePhoto }).eq('id', profile.id)
    setSaving(false)
    alert('Profile updated!')
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo URL</label>
          <input type="url" value={profilePhoto} onChange={e => setProfilePhoto(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Show in public catalog</label>
          <button onClick={() => setIsPublic(!isPublic)}
            className={`w-12 h-6 rounded-full transition ${isPublic ? 'bg-green-500' : 'bg-gray-300'} relative`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${isPublic ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>
        <button onClick={saveProfile} disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}

function ClientManager({ profile }) {
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    supabase.from('bookings').select('*, profiles!bookings_client_id_fkey(full_name, contact_number)').eq('shooter_id', profile.id)
      .order('created_at', { ascending: false }).then(({ data }) => setBookings(data || []))
  }, [])

  async function updateStatus(bookingId, status) {
    await supabase.from('bookings').update({ status }).eq('id', bookingId)
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status } : b))
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Client Manager</h2>
      <div className="space-y-4">
        {bookings.map(booking => (
          <div key={booking.id} className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{booking.profiles?.full_name || 'Unknown Client'}</h3>
                <p className="text-sm text-gray-500">{booking.profiles?.contact_number}</p>
                <p className="text-sm text-gray-600 mt-1">{booking.event_date} at {booking.event_time} — {booking.location}</p>
                {booking.notes && <p className="text-sm text-gray-500 mt-1">{booking.notes}</p>}
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize
                  ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'}`}>
                  {booking.status}
                </span>
                {booking.status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => updateStatus(booking.id, 'confirmed')} className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700">Confirm</button>
                    <button onClick={() => updateStatus(booking.id, 'rejected')} className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700">Reject</button>
                  </div>
                )}
                {booking.status === 'confirmed' && (
                  <button onClick={() => updateStatus(booking.id, 'completed')} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 mt-2">
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {bookings.length === 0 && <p className="text-gray-500">No bookings yet.</p>}
      </div>
    </div>
  )
}

function ManageCalendar({ profile }) {
  const [blocks, setBlocks] = useState([])
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('unavailable')

  useEffect(() => { fetchCalendar() }, [])

  async function fetchCalendar() {
    const { data } = await supabase.from('calendar_blocks').select('*').eq('shooter_id', profile.id).order('date', { ascending: true })
    setBlocks(data || [])
  }

  async function addBlock(e) {
    e.preventDefault()
    if (!date) return
    const { error } = await supabase.from('calendar_blocks').insert({ shooter_id: profile.id, date, status })
    if (error) { alert(error.message); return }
    setDate(''); fetchCalendar()
  }

  async function removeBlock(id) {
    await supabase.from('calendar_blocks').delete().eq('id', id)
    fetchCalendar()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Calendar / Availability</h2>
      <form onSubmit={addBlock} className="bg-white rounded-2xl shadow-sm border p-6 mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500">
            <option value="unavailable">Unavailable</option>
            <option value="booked">Booked</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition">Add</button>
      </form>
      <div className="space-y-2">
        {blocks.map(block => (
          <div key={block.id} className="bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between">
            <div>
              <span className="font-medium">{block.date}</span>
              <span className={`ml-2 text-sm px-2 py-0.5 rounded-full ${block.status === 'booked' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                {block.status}
              </span>
            </div>
            <button onClick={() => removeBlock(block.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
          </div>
        ))}
        {blocks.length === 0 && <p className="text-gray-500">No calendar blocks set.</p>}
      </div>
    </div>
  )
}

export default function ShooterDashboard({ profile }) {
  const navigate = useNavigate()

  const tabs = [
    { path: '', label: 'Home', icon: '🏠' },
    { path: 'services', label: 'Services', icon: '📦' },
    { path: 'clients', label: 'Client Manager', icon: '👥' },
    { path: 'calendar', label: 'Calendar', icon: '📅' },
    { path: 'profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm">← Home</Link>
            <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
          </div>
          <button onClick={() => { supabase.auth.signOut(); navigate('/') }} className="text-sm text-red-500 hover:text-red-700">Sign Out</button>
        </div>
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex gap-1 -mb-px">
            {tabs.map(tab => (
              <Link key={tab.path} to={`/dashboard/${tab.path}`}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition ${location.pathname === `/dashboard/${tab.path}` || (tab.path === '' && location.pathname === '/dashboard')
                  ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {tab.icon} {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route index element={<DashboardHome profile={profile} />} />
          <Route path="services" element={<ManageServices profile={profile} />} />
          <Route path="clients" element={<ClientManager profile={profile} />} />
          <Route path="calendar" element={<ManageCalendar profile={profile} />} />
          <Route path="profile" element={<ManageProfile profile={profile} />} />
        </Routes>
      </div>
    </div>
  )
}
