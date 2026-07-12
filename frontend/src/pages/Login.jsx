import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [category, setCategory] = useState('photographer')
  const [experience, setExperience] = useState('amateur')
  const [contactNumber, setContactNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username,
            category,
            experience_level: experience,
            contact_number: contactNumber,
            role: 'shooter'
          }
        }
      })
      if (signUpError) {
        setError(signUpError.message)
      } else {
        alert(
          'Welcome to Litratalogo!\n\n' +
          'DATA PRIVACY NOTICE:\n' +
          'By using this platform, you agree to comply with the Data Privacy Act of 2012 (RA 10173). ' +
          'You are responsible for obtaining consent from clients before sharing their photos in your portfolio. ' +
          'No explicit content or misrepresentation of work is allowed. ' +
          'Violation may result in permanent ban from the platform.'
        )
        navigate('/dashboard')
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(signInError.message)
      } else {
        navigate('/dashboard')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur rounded-2xl p-8 w-full max-w-md border border-white/20">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          {isSignUp ? 'Create Shooter Account' : 'Shooter Login'}
        </h1>
        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
              <input type="tel" value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="Contact Number"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-blue-500">
                <option value="photographer" className="text-black">Photographer</option>
                <option value="videographer" className="text-black">Videographer</option>
                <option value="both" className="text-black">Both</option>
              </select>
              <select value={experience} onChange={e => setExperience(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-blue-500">
                <option value="amateur" className="text-black">Amateur</option>
                <option value="semi-pro" className="text-black">Semi-pro</option>
                <option value="professional" className="text-black">Professional</option>
              </select>
            </>
          )}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50">
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button onClick={() => { setIsSignUp(!isSignUp); setError('') }}
            className="text-blue-400 hover:text-blue-300 text-sm">
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
        <div className="mt-2 text-center">
          <Link to="/" className="text-gray-500 hover:text-gray-400 text-sm">Back to home</Link>
        </div>
      </div>
    </div>
  )
}
