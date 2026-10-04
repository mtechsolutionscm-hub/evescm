import {createClient} from '@supabase/supabase-js'

/*
 * EVES CMS is hosted in the shared SafeHome Supabase project.
 * The publishable key is intentionally browser-safe; RLS on the eves_* tables
 * is the security boundary. Server/admin operations must never use this key.
 */
export const CMS_URL=import.meta.env.VITE_SUPABASE_URL||'https://mozwkfyiaqxwaoxwpkry.supabase.co'
export const CMS_KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_UhbESgvWxdswVun3Vo5uvw_xk0SvpPF'

export const supabase=createClient(CMS_URL,CMS_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
export const EVES_TABLES=[
 'eves_cms_config',
 'eves_cms_pages',
 'eves_cms_news',
 'eves_cms_media',
 'eves_cms_sections',
 'eves_cms_navigation',
 'eves_cms_newsletter_subscribers',
 'eves_cms_admins',
 'eves_cms_audit_log'
]

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

/*
 * Public newsletter signup works on static Namecheap hosting without requiring
 * a Node/Vercel API route. RLS allows anonymous inserts and the unique email
 * constraint prevents duplicate subscriptions.
 */
export async function subscribeNewsletter(email,language){
 const value=String(email||'').trim().toLowerCase()
 if(!/^\\S+@\\S+\\.\\S+$/.test(value)||value.length>254)throw new Error('Invalid email')
 const {error}=await supabase.from('eves_cms_newsletter_subscribers').insert({
  email:value,
  language:language==='en'?'en':'fr',
  source:'website'
 })
 if(error){
  if(error.code==='23505')return {ok:true,exists:true}
  throw new Error(error.message||'Subscription failed')
 }
 return {ok:true}
}
