import crypto from 'node:crypto'

function verify(token) {
  const [body, sig] = (token || '').split('.')
  if (!body || !sig || !process.env.EVES_ADMIN_SESSION_SECRET) return null
  const expected = crypto.createHmac('sha256', process.env.EVES_ADMIN_SESSION_SECRET).update(body).digest('base64url')
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
  return payload.exp > Date.now() ? payload : null
}

export default function handler(req, res) {
  const cookies = Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map(x => {
    const i = x.indexOf('='); return [x.slice(0, i).trim(), decodeURIComponent(x.slice(i + 1))]
  }))
  const session = verify(cookies.eves_admin_session)
  if (!session) return res.status(401).json({ authenticated: false })
  return res.status(200).json({ authenticated: true, email: session.email, expiresAt: session.exp })
}
