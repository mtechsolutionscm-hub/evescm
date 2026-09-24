import {sb,json,signSession,verifyPassword,SERVER_KEY,audit} from '../_eves.js'
const attempts=new Map()
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'})
 if(!process.env.EVES_ADMIN_SESSION_SECRET||!SERVER_KEY)return json(res,503,{error:'CMS authentication is not configured on this deployment.'})
 try{
  const {email,password}=typeof req.body==='string'?JSON.parse(req.body):req.body||{}
  const normalized=String(email||'').trim().toLowerCase(),now=Date.now(),a=attempts.get(normalized)||{count:0,until:0}
  if(a.until>now)return json(res,429,{error:'Too many login attempts. Please wait a few minutes.'})
  const rows=await sb(`eves_cms_admins?select=id,email,password_hash,display_name,active&email=eq.${encodeURIComponent(normalized)}&limit=1`,{admin:true}),admin=rows?.[0]
  if(!admin?.active||!verifyPassword(String(password||''),admin.password_hash)){a.count++;if(a.count>=5){a.count=0;a.until=now+300000}attempts.set(normalized,a);return json(res,401,{error:'Invalid administrator credentials.'})}
  attempts.delete(normalized)
  await sb(`eves_cms_admins?id=eq.${encodeURIComponent(admin.id)}`,{method:'PATCH',admin:true,body:{last_login_at:new Date().toISOString(),updated_at:new Date().toISOString()},headers:{Prefer:'return=minimal'}})
  const session={email:admin.email,displayName:admin.display_name};await audit(session,'login','auth',admin.id,{})
  res.setHeader('Set-Cookie',`eves_admin_session=${encodeURIComponent(signSession(admin.email))}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`)
  return json(res,200,{ok:true,email:admin.email,displayName:admin.display_name})
 }catch(e){return json(res,e.status||500,{error:e.message||'Authentication failed'})}
}
