import {createClient} from '@supabase/supabase-js'
export const CMS_URL=import.meta.env.VITE_SUPABASE_URL||'https://mozwkfyiaqxwaoxwpkry.supabase.co'
export const CMS_KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_UhbESgvWxdswVun3Vo5uvw_xk0SvpPF'
export const supabase=createClient(CMS_URL,CMS_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
const now=()=>new Date().toISOString()
export function mapRow(row){return{...row,tags:row.tags||[],seo_keywords:row.seo_keywords||[],metadata:row.metadata||{},data:row.data||{}}}
export async function fetchPublicContent(){
 const response=await fetch('/api/cms?public=1',{cache:'no-store',headers:{Accept:'application/json'}})
 const payload=await response.json()
 if(!response.ok||payload?.error)throw new Error(payload?.error||'Unable to load EVES public content')
 return {
  config:payload.config||null,
  pages:(payload.pages||[]).map(mapRow),
  news:(payload.news||[]).map(mapRow),
  media:(payload.media||[]).map(mapRow),
  sections:(payload.sections||[]).map(mapRow),
  navigation:(payload.navigation||[]).map(mapRow)
 }
}
export function subscribeToCms(onChange){
 const channel=supabase.channel('eves-cms-live')
  .on('postgres_changes',{event:'*',schema:'public',table:'eves_cms_config'},onChange)
  .on('postgres_changes',{event:'*',schema:'public',table:'eves_cms_pages'},onChange)
  .on('postgres_changes',{event:'*',schema:'public',table:'eves_cms_news'},onChange)
  .on('postgres_changes',{event:'*',schema:'public',table:'eves_cms_media'},onChange)
  .on('postgres_changes',{event:'*',schema:'public',table:'eves_cms_sections'},onChange)
  .on('postgres_changes',{event:'*',schema:'public',table:'eves_cms_navigation'},onChange)
  .subscribe()
 return()=>supabase.removeChannel(channel)
}
export async function subscribeNewsletter(email,language){
 const r=await fetch('/api/newsletter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,language})})
 const j=await r.json()
 if(!r.ok)throw new Error(j.error||'Subscription failed')
 return j
}
