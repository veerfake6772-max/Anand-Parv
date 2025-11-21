// Simple auth helper for admin endpoints
// Set ADMIN_PASSWORD in .env.local for production

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const ADMIN_TOKEN = 'anand_parv_admin_token'

export function checkAuth(req) {
  const token = req.headers['x-admin-token'] || ''
  return token === ADMIN_PASSWORD
}

export function validatePassword(password) {
  return password === ADMIN_PASSWORD
}

export function setAuthCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `adminToken=${ADMIN_TOKEN}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
  )
}

export function getAuthToken(req) {
  const token = req.headers.cookie
    ?.split('; ')
    .find(row => row.startsWith('adminToken='))
    ?.split('=')[1]
  return token
}

export function isAuthenticated(req) {
  return getAuthToken(req) === ADMIN_TOKEN
}
