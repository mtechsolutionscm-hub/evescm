import crypto from 'node:crypto'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ewbiujoxnzdivakvusxf.supabase.co'
const PUBLIC_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
const SERVER_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function verifySession(req){
  const cookies=Object.fromEntries((req.headers.cookie||'').split(';').filter(Boolean).map(x=>{const i=x.indexOf('=');return [x.slice(0,i).trim(),decodeURIComponent(x.slice(i+1))]}))
  const token=cookies.eves_admin_session
  const [body,sig]=(token||'').split('.')
  if(!body||!sig||!process.env.EVES_ADMIN_SESSION_SECRET)return null
  try{
    const expected=crypto.createHmac('sha256',process.env.EVES_ADMIN_SESSION_SECRET).update(body).digest('base64url')
    if(sig.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return null
    const payload=JSON.parse(Buffer.from(body,'base64url').toString())
    return payload.exp>Date.now()?payload:null
  }catch{return null}
}

async function sb(path,{method='GET',body,admin=false,headers={}}={}){
  const key=admin&&SERVER_KEY?SERVER_KEY:PUBLIC_KEY
  if(!key)throw new Error('Supabase API key is not configured')
  const r=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{method,headers:{apikey:key,Authorization:`Bearer ${key}`,...(body?{'Content-Type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined})
  const text=await r.text()
  let data
  try{data=text?JSON.parse(text):null}catch{data=text}
  if(!r.ok){const e=new Error(data?.message||data?.error_description||'Supabase request failed');e.status=r.status;e.data=data;throw e}
  return data
}

function json(res,status,data){res.status(status).setHeader('Cache-Control','no-store').json(data)}

export default async function handler(req,res){
  try{
    if(req.method==='GET'){
      const session=verifySession(req)
      const admin=Boolean(session&&SERVER_KEY)
      const kind=req.query?.kind
      const slug=req.query?.slug
      let path='cms_content?select=*&order=updated_at.desc'
      if(kind)path+=`&kind=eq.${encodeURIComponent(kind)}`
      if(slug)path+=`&slug=eq.${encodeURIComponent(slug)}`
      const data=await sb(path,{admin})
      const config=await sb('cms_config?select=*&id=eq.true',{admin})
      return json(res,200,{content:data,config:config?.[0]||null,admin})
    }
    const session=verifySession(req)
    if(!session)return json(res,401,{error:'Unauthorised'})
    if(!SERVER_KEY)return json(res,503,{error:'CMS server storage is not configured. Add SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) to Vercel production environment variables.'})

    if(req.method==='POST'||req.method==='PUT'){
      const input=typeof req.body==='string'?JSON.parse(req.body):req.body||{}
      if(input.action==='config'){
        const payload={...input.config}
        delete payload.id
        const data=await sb('cms_config?id=eq.true',{method:'PATCH',body:payload,admin:true,headers:{Prefer:'return=representation'}})
        return json(res,200,{ok:true,config:data?.[0]||null})
      }
      const c={...input.content}
      delete c.created_at; delete c.updated_at
      if(c.status==='published'&&!c.published_at)c.published_at=new Date().toISOString()
      const data=await sb('cms_content',{method:'POST',body:c,admin:true,headers:{Prefer:'resolution=merge-duplicates,return=representation'}})
      return json(res,200,{ok:true,content:data?.[0]||data})
    }

    if(req.method==='DELETE'){
      const id=req.query?.id
      if(!id)return json(res,400,{error:'Missing id'})
      await sb(`cms_content?id=eq.${encodeURIComponent(id)}`,{method:'DELETE',admin:true})
      return json(res,200,{ok:true})
    }
    return json(res,405,{error:'Method not allowed'})
  }catch(e){
    console.error('EVES CMS API',e)
    return json(res,e.status||500,{error:e.message||'CMS error',details:e.data||null})
  }
}
