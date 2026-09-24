import crypto from 'node:crypto'

export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mozwkfyiaqxwaoxwpkry.supabase.co'
export const PUBLIC_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_UhbESgvWxdswVun3Vo5uvw_xk0SvpPF'
export const SERVER_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export function parseCookies(req){
  return Object.fromEntries((req.headers.cookie||'').split(';').filter(Boolean).map(x=>{
    const i=x.indexOf('=')
    return [x.slice(0,i).trim(),decodeURIComponent(x.slice(i+1))]
  }))
}
export function verifySession(req){
  const token=parseCookies(req).eves_admin_session
  const [body,sig]=(token||'').split('.')
  if(!body||!sig||!process.env.EVES_ADMIN_SESSION_SECRET)return null
  try{
    const expected=crypto.createHmac('sha256',process.env.EVES_ADMIN_SESSION_SECRET).update(body).digest('base64url')
    if(sig.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return null
    const payload=JSON.parse(Buffer.from(body,'base64url').toString())
    return payload?.exp>Date.now()?payload:null
  }catch{return null}
}
export async function sb(path,{method='GET',body,admin=false,headers={}}={}){
  const key=admin&&SERVER_KEY?SERVER_KEY:PUBLIC_KEY
  if(!key)throw Object.assign(new Error('Supabase API key is not configured'),{status:503})
  const r=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{method,headers:{apikey:key,Authorization:`Bearer ${key}`,...(body?{'Content-Type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined})
  const text=await r.text()
  let data=null
  try{data=text?JSON.parse(text):null}catch{data=text}
  if(!r.ok)throw Object.assign(new Error(data?.message||data?.error_description||'Supabase request failed'),{status:r.status,data})
  return data
}
export async function audit(session,action,resourceType='',resourceId='',details={}){
  if(!SERVER_KEY)return
  try{await sb('eves_cms_audit_log',{method:'POST',admin:true,body:{admin_email:session?.email||null,action,resource_type:resourceType,resource_id:resourceId?String(resourceId):null,details},headers:{Prefer:'return=minimal'}})}catch{}
}
export function json(res,status,data){res.status(status).setHeader('Cache-Control','no-store, max-age=0').json(data)}
export function signSession(email){
  const body=Buffer.from(JSON.stringify({email,exp:Date.now()+8*60*60*1000})).toString('base64url')
  const sig=crypto.createHmac('sha256',process.env.EVES_ADMIN_SESSION_SECRET).update(body).digest('base64url')
  return `${body}.${sig}`
}
export function verifyPassword(password,stored){
  try{
    const [scheme,n,r,p,saltB64,hashB64]=String(stored||'').split('$')
    if(scheme!=='scrypt')return false
    const salt=Buffer.from(saltB64.replace(/-/g,'+').replace(/_/g,'/')+'==','base64')
    const expected=Buffer.from(hashB64.replace(/-/g,'+').replace(/_/g,'/')+'==','base64')
    const actual=crypto.scryptSync(password,salt,expected.length,{N:Number(n),r:Number(r),p:Number(p),maxmem:64*1024*1024})
    return expected.length===actual.length&&crypto.timingSafeEqual(expected,actual)
  }catch{return false}
}
