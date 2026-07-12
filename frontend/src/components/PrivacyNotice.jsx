import { useState } from 'react'

export default function PrivacyNotice() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
      <h3 className="font-semibold text-yellow-900 mb-2">Data Privacy Notice</h3>
      <p className="text-sm text-yellow-800 mb-3">
        By using Litratalogo, you agree to comply with the <strong>Data Privacy Act of 2012 (RA 10173)</strong>.
        As a shooter, you are responsible for:
      </p>
      <ul className="text-sm text-yellow-800 list-disc list-inside mb-3 space-y-1">
        <li>Obtaining consent from clients before sharing their photos in your portfolio</li>
        <li>Ensuring no explicit content is posted</li>
        <li>Not misrepresenting others' work as your own</li>
      </ul>
      <p className="text-sm text-yellow-800 mb-3">
        <strong>Violation consequence:</strong> Permanent ban from the platform, enforced by the SuperAdmin.
        The community will be notified that a policy violation occurred (without naming details).
      </p>
      <button onClick={() => setDismissed(true)}
        className="bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-yellow-700 transition">
        I Understand
      </button>
    </div>
  )
}
