import {createClient} from '@supabase/supabase-js'
export const CMS_URL=import.meta.env.VITE_SUPABASE_URL||'https://mozwkfyiaqxwaoxwpkry.supabase.co'
export const CMS_KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_UhbESgvWxdswVun3Vo5uvw_xk0SvpPF'
export const supabase=createClient(CMS_URL,CMS_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
const now=()=>new Date().toISOString()
export function mapRow(row){return{...row,tags:row.tags||[],seo_keywords:row.seo_keywords||[],metadata:row.metadata||{},data:row.data||{}}}
export async function fetchPublicContent(){
 const [config,pages,news,media,sections,navigation]=await Promise.all([
  supabase.from('eves_cms_config').select('*').eq('id',true).maybeSingle(),
  supabase.from('eves_cms_pages').select('*').in('status',['published','scheduled']).order('sort_order',{ascending:true}).order('updated_at',{ascending:false}),
  supabase.from('eves_cms_news').select('*').in('status',['published','scheduled']).order('published_at',{ascending:false,nullsFirst:false}).order('updated_at',{ascending:false}),
  supabase.from('eves_cms_media').select('*').eq('status','published').order('sort_order',{ascending:true}).order('created_at',{ascending:false}),
  supabase.from('eves_cms_sections').select('*').eq('visible',true).order('sort_order',{ascending:true}),
  supabase.from('eves_cms_navigation').select('*').eq('visible',true).order('sort_order',{ascending:true})
 ])
 const error=[config,pages,news,media,sections,navigation].find(x=>x.error)?.error
 if(error)throw error
 return {
  config:config.data||null,
  pages:(pages.data||[]).filter(x=>x.status==='published'||(x.status==='scheduled'&&x.published_at&&new Date(x.published_at)<=new Date())).map(mapRow),
  news:(news.data||[]).filter(x=>x.status==='published'||(x.status==='scheduled'&&x.published_at&&new Date(x.published_at)<=new Date())).map(mapRow),
  media:(media.data||[]).map(mapRow),
  sections:(sections.data||[]).map(mapRow),
  navigation:(navigation.data||[]).map(mapRow)
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
