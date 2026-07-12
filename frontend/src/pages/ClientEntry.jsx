import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function ClientEntry() {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !contact.trim()) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    setError('')

    let { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('full_name', name.trim())
      .eq('contact_number', contact.trim())
      .eq('role', 'client')
      .maybeSingle()

    let clientId
    if (existing) {
      clientId = existing.id
    } else {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          full_name: name.trim(),
          contact_number: contact.trim(),
          role: 'client',
          is_public: false
        })
        .select('id')
        .single()
      if (error) { setError(error.message); setLoading(false); return }
      clientId = data.id
    }

    localStorage.setItem('litratalogo_client_id', clientId)
    localStorage.setItem('litratalogo_client_name', name.trim())
    navigate('/catalog/both')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur rounded-2xl p-8 w-full max-w-md border border-white/20">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">Welcome to Litratalogo</h1>
        <p className="text-gray-400 text-center mb-6">Enter your details to start browsing</p>
        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="e.g. Juan Dela Cruz"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contact Number</label>
            <input
              type="tel" value={contact} onChange={e => setContact(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="e.g. 0917-123-4567"
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50">
            {loading ? 'Loading...' : 'Start Browsing'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <a href="/" className="text-blue-400 hover:text-blue-300 text-sm">Back to home</a>
        </div>
      </div>
    </div>
  )
}
