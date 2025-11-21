import { validatePassword, setAuthCookie } from '../../lib/auth'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { password } = req.body || {}
  if (!password) {
    return res.status(400).json({ error: 'Password required' })
  }

  if (validatePassword(password)) {
    setAuthCookie(res)
    return res.status(200).json({ ok: true })
  } else {
    return res.status(401).json({ error: 'Invalid password' })
  }
}
