import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Home from './pages/Home'
import ClientEntry from './pages/ClientEntry'
import Catalog from './pages/Catalog'
import ShooterProfile from './pages/ShooterProfile'
import Login from './pages/Login'
import ShooterDashboard from './pages/ShooterDashboard'
import HireRequest from './pages/HireRequest'
import AdminPanel from './pages/AdminPanel'
import PrivacyNotice from './components/PrivacyNotice'

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (!error) setProfile(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Home session={session} profile={profile} />} />
      <Route path="/client-entry" element={<ClientEntry />} />
      <Route path="/catalog/:category" element={<Catalog session={session} />} />
      <Route path="/shooter/:id" element={<ShooterProfile session={session} profile={profile} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard/*" element={session && profile?.role === 'shooter' ? <ShooterDashboard profile={profile} /> : <Navigate to="/login" />} />
      <Route path="/hire/:shooterId" element={session ? <HireRequest session={session} profile={profile} /> : <Navigate to="/client-entry" />} />
      <Route path="/admin/*" element={session && profile?.role === 'admin' ? <AdminPanel profile={profile} /> : <Navigate to="/login" />} />
      <Route path="/privacy" element={<PrivacyNotice />} />
    </Routes>
  )
}
