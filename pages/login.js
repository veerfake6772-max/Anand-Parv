import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const data = await res.json()
      if (res.ok) {
        router.push('/admin')
      } else {
        setError(data?.error || 'Invalid password')
        setPassword('')
      }
    } catch (err) {
      setError('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '400px' }}>
      <h1>Admin Login</h1>
      <p>Enter the admin password to access registrations.</p>

      <form onSubmit={handleLogin}>
        <div className="field">
          <label>Admin Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            autoFocus
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {error && <p style={{ color: '#dc2626', marginTop: '12px' }}>{error}</p>}

      <hr style={{ marginTop: '24px' }} />
      <p>
        <a href="/" style={{ color: '#3b82f6' }}>
          ← Back to Registration
        </a>
      </p>
    </div>
  )
}
