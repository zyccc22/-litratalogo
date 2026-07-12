import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function AdminPanel({ profile }) {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showBanModal, setShowBanModal] = useState(null)
  const [banReason, setBanReason] = useState('')
  const [actionType, setActionType] = useState('remove')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (!error) setUsers(data)
    setLoading(false)
  }

  async function handleAction() {
    if (!showBanModal || !banReason.trim()) return
    const { error } = await supabase.from('admin_actions').insert({
      admin_id: profile.id,
      target_user_id: showBanModal.id,
      action: actionType,
      reason: banReason,
      notice_sent: true
    })
    if (!error) {
      if (actionType === 'remove' || actionType === 'ban') {
        await supabase.from('profiles').update({ is_public: false }).eq('id', showBanModal.id)
        if (actionType === 'ban') {
          const { data } = await supabase.from('profiles').select('id').eq('role', 'shooter').eq('is_public', true)
          if (data && data.length > 0) {
            await supabase.from('notifications', true).insert({
              message: 'A user has been removed from the platform for a policy violation.',
              for_role: 'shooter'
            })
          }
        }
      }
      setShowBanModal(null)
      setBanReason('')
      fetchUsers()
    } else {
      alert('Error: ' + error.message)
    }
  }

  const filtered = users.filter(u => {
    if (filter !== 'all' && u.role !== filter) return false
    if (search && !u.full_name?.toLowerCase().includes(search.toLowerCase()) && !u.username?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm">← Home</Link>
            <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
          </div>
          <button onClick={() => { supabase.auth.signOut(); navigate('/') }} className="text-sm text-red-500 hover:text-red-700">Sign Out</button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500" />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500">
            <option value="all">All Roles</option>
            <option value="client">Clients</option>
            <option value="shooter">Shooters</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Username</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Role</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Contact</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Public</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4">{user.full_name || '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{user.username || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'shooter' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{user.contact_number || '—'}</td>
                  <td className="px-6 py-4">{user.is_public ? '✅' : '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setShowBanModal(user)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium">
                      {user.role === 'admin' ? '—' : 'Remove / Ban'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-gray-500 py-8">No users found.</p>}
        </div>

        {showBanModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Action: {showBanModal.full_name}</h2>
              <p className="text-sm text-gray-500 mb-4">Current role: {showBanModal.role}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                  <select value={actionType} onChange={e => setActionType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500">
                    <option value="warn">Warn</option>
                    <option value="remove">Remove (hide from catalog)</option>
                    <option value="ban">Permanent Ban</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Notice</label>
                  <textarea value={banReason} onChange={e => setBanReason(e.target.value)} rows={3} required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowBanModal(null)} className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button onClick={handleAction} className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700">
                    Confirm {actionType === 'warn' ? 'Warning' : actionType === 'remove' ? 'Removal' : 'Ban'}
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
