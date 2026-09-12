import crypto from 'node:crypto'

function cookie(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const secret = process.env.EVES_ADMIN_SESSION_SECRET
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url')
  return `${body}.${sig}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const expectedEmail = process.env.EVES_ADMIN_EMAIL
  const expectedPassword = process.env.EVES_ADMIN_PASSWORD
  const secret = process.env.EVES_ADMIN_SESSION_SECRET
  if (!expectedEmail || !expectedPassword || !secret) {
    return res.status(503).json({ error: 'Admin authentication is not configured on this deployment.' })
  }
  try {
    const { email, password } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    if (email !== expectedEmail || password !== expectedPassword) {
      return res.status(401).json({ error: 'Invalid administrator credentials.' })
    }
    const payload = { email: expectedEmail, exp: Date.now() + 8 * 60 * 60 * 1000 }
    res.setHeader('Set-Cookie', cookie('eves_admin_session', sign(payload), 8 * 60 * 60))
    return res.status(200).json({ ok: true, email: expectedEmail })
  } catch {
    return res.status(400).json({ error: 'Invalid request.' })
  }
}
