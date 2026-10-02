import {createClient} from '@supabase/supabase-js'
export const CMS_URL=import.meta.env.VITE_SUPABASE_URL
export const CMS_KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if(!CMS_URL||!CMS_KEY){
  console.warn('[EVES] Supabase public configuration is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the build environment.')
}
export const supabase=createClient(CMS_URL,CMS_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
const now=()=>new Date().toISOString()
export function mapRow(row){return{...row,tags:row.tags||[],seo_keywords:row.seo_keywords||[],metadata:row.metadata||{},data:row.data||{}}}
export async function fetchPublicContent(){
 const [configRes,pagesRes,newsRes,mediaRes,sectionsRes,navigationRes]=await Promise.all([
  supabase.from('eves_cms_config').select('*').eq('id',true).maybeSingle(),
  supabase.from('eves_cms_pages').select('*').order('sort_order',{ascending:true}).order('updated_at',{ascending:false}),
  supabase.from('eves_cms_news').select('*').order('published_at',{ascending:false,nullsFirst:false}).order('updated_at',{ascending:false}),
  supabase.from('eves_cms_media').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:false}),
  supabase.from('eves_cms_sections').select('*').order('sort_order',{ascending:true}),
  supabase.from('eves_cms_navigation').select('*').order('sort_order',{ascending:true})
 ])
 const firstError=[configRes,pagesRes,newsRes,mediaRes,sectionsRes,navigationRes].find(x=>x.error)?.error
 if(firstError) throw new Error(firstError.message||'Unable to load EVES public content')
 return {
  config:configRes.data||null,
  pages:(pagesRes.data||[]).map(mapRow),
  news:(newsRes.data||[]).map(mapRow),
  media:(mediaRes.data||[]).map(mapRow),
  sections:(sectionsRes.data||[]).map(mapRow),
  navigation:(navigationRes.data||[]).map(mapRow)
 }
}
export function subscribeToCms(onChange){
 let channel=null
 try{channel=supabase.channel('eves-cms-live')
  .on('postgres_changes',{event:'*',schema:'public',table:'eves_cms_config'},onChange)
  .on('postgres_changes',{event:'*',schema:'public',table:'eves_cms_pages'},onChange)
  .on('postgres_changes',{event:'*',schema:'public',table:'eves_cms_news'},onChange)
  .on('postgres_changes',{event:'*',schema:'public',table:'eves_cms_media'},onChange)
  .on('postgres_changes',{event:'*',schema:'public',table:'eves_cms_sections'},onChange)
  .on('postgres_changes',{event:'*',schema:'public',table:'eves_cms_navigation'},onChange)
  .subscribe()
 }catch(e){return()=>{}}
 return()=>channel&&supabase.removeChannel(channel)
}
export async function subscribeNewsletter(email,language){
 const r=await fetch('/api/newsletter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,language})})
 const j=await r.json()
 if(!r.ok)throw new Error(j.error||'Subscription failed')
 return j
}
