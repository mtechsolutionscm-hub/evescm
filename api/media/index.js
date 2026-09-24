import crypto from 'node:crypto'
import {sb,json,verifySession,SERVER_KEY,audit,SUPABASE_URL} from '../_eves.js'
const MAX_BYTES=8*1024*1024,allowed=new Set(['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','video/mp4','application/pdf'])
export default async function handler(req,res){
 const s=verifySession(req);if(!s)return json(res,401,{error:'Unauthorised'});if(!SERVER_KEY)return json(res,503,{error:'CMS server storage is not configured.'})
 try{
  if(req.method==='POST'){
   const input=typeof req.body==='string'?JSON.parse(req.body):req.body||{},mime=String(input.mime_type||''),base64=String(input.base64||'').replace(/^data:[^;]+;base64,/,'');const bytes=Buffer.from(base64,'base64')
   if(!allowed.has(mime))return json(res,400,{error:'Unsupported media type'});if(!bytes.length||bytes.length>MAX_BYTES)return json(res,400,{error:'Media must be between 1 byte and 8 MB'})
   const ext=(input.filename||'asset').split('.').pop().toLowerCase().replace(/[^a-z0-9]/g,'')||'bin',path=`eves/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${ext}`
   const up=await fetch(`${SUPABASE_URL}/storage/v1/object/eves-media/${path}`,{method:'POST',headers:{Authorization:`Bearer ${SERVER_KEY}`,apikey:SERVER_KEY,'Content-Type':mime,'x-upsert':'false'},body:bytes});if(!up.ok)throw Object.assign(new Error(await up.text()),{status:up.status})
   const public_url=`${SUPABASE_URL}/storage/v1/object/public/eves-media/${path}`,row=await sb('eves_cms_media',{method:'POST',admin:true,body:{storage_path:path,public_url,filename:String(input.filename||'asset'),alt_fr:String(input.alt_fr||''),alt_en:String(input.alt_en||''),caption_fr:String(input.caption_fr||''),caption_en:String(input.caption_en||''),mime_type:mime,size_bytes:bytes.length,kind:mime.startsWith('image/')?'image':mime.startsWith('video/')?'video':'document',status:'published'},headers:{Prefer:'return=representation'}})
   await audit(s,'upload','media',row?.[0]?.id||path,{filename:input.filename,size:bytes.length});return json(res,200,{ok:true,media:row?.[0]||row})
  }
  if(req.method==='DELETE'){const path=String(req.query?.path||'');if(!path.startsWith('eves/'))return json(res,400,{error:'Invalid storage path'});const del=await fetch(`${SUPABASE_URL}/storage/v1/object/eves-media/${path}`,{method:'DELETE',headers:{Authorization:`Bearer ${SERVER_KEY}`,apikey:SERVER_KEY}});if(!del.ok&&del.status!==404)throw Object.assign(new Error(await del.text()),{status:del.status});await sb(`eves_cms_media?storage_path=eq.${encodeURIComponent(path)}`,{method:'DELETE',admin:true});await audit(s,'delete','media',path,{});return json(res,200,{ok:true})}
  return json(res,405,{error:'Method not allowed'})
 }catch(e){return json(res,e.status||500,{error:e.message||'Media operation failed'})}
}
