import { Link } from 'react-router-dom'

export default function Home({ session, profile }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-4">
          <h1 className="text-5xl font-bold mb-2">Litratalogo</h1>
          <p className="text-lg text-gray-400">A catalog of moments, and the people who capture them.</p>
        </div>

        <div className="text-center mb-2">
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Browse real portfolios, chat directly with shooters, and book with confidence.
            Created by <span className="text-gray-300">Zyc Anlagan Petalcorin</span> for Bukidnon, Cagayan de Oro, and Iligan.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10 mt-8">
          <Link to="/catalog/photographer" className="bg-white/10 backdrop-blur rounded-2xl p-8 text-center hover:bg-white/20 transition border border-white/20">
            <div className="text-5xl mb-4">📷</div>
            <h2 className="text-2xl font-semibold">Photographers</h2>
            <p className="text-gray-400 mt-2">Browse photographers in your area</p>
          </Link>
          <Link to="/catalog/videographer" className="bg-white/10 backdrop-blur rounded-2xl p-8 text-center hover:bg-white/20 transition border border-white/20">
            <div className="text-5xl mb-4">🎥</div>
            <h2 className="text-2xl font-semibold">Videographers</h2>
            <p className="text-gray-400 mt-2">Browse videographers in your area</p>
          </Link>
        </div>

        <div className="text-center mb-10">
          <Link to="/catalog/both" className="inline-block bg-white/10 backdrop-blur rounded-2xl p-6 hover:bg-white/20 transition border border-white/20">
            <div className="text-4xl mb-2">📸</div>
            <h2 className="text-xl font-semibold">Show Me Both</h2>
            <p className="text-gray-400">Photographers & Videographers</p>
          </Link>
        </div>

        <div className="text-center space-y-4">
          {!session ? (
            <>
              <p className="text-gray-400">Are you a photographer or videographer?</p>
              <Link to="/login" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition font-medium">
                Shooter Login / Sign Up
              </Link>
              <div className="mt-4">
                <Link to="/client-entry" className="text-blue-400 hover:text-blue-300 underline">
                  Browse as client (no account needed)
                </Link>
              </div>
            </>
          ) : profile?.role === 'shooter' ? (
            <Link to="/dashboard" className="inline-block bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition font-medium">
              Go to Dashboard
            </Link>
          ) : profile?.role === 'admin' ? (
            <Link to="/admin" className="inline-block bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 transition font-medium">
              Admin Panel
            </Link>
          ) : null}
        </div>

        <div className="text-center mt-12 text-gray-500 text-xs">
          <p>Bukidnon &bull; Cagayan de Oro &bull; Iligan</p>
        </div>
      </div>
    </div>
  )
}
