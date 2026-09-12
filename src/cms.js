import {createClient} from '@supabase/supabase-js'
export const CMS_URL='https://ewbiujoxnzdivakvusxf.supabase.co'
export const CMS_KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_k28mEYoflIV34dWjFgWiMg_Uc31qNb4'
export const supabase=createClient(CMS_URL,CMS_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
export function mapContent(row){return {...row,tags:row.tags||[],seo_keywords:row.seo_keywords||[],metadata:row.metadata||{}}}
export async function fetchPublicContent(){
 const [content,config]=await Promise.all([
  supabase.from('cms_content').select('*').in('status',['published','scheduled']).order('updated_at',{ascending:false}),
  supabase.from('cms_config').select('*').eq('id',true).maybeSingle()
 ])
 if(content.error)throw content.error
 return {content:(content.data||[]).filter(x=>x.status==='published'||(x.status==='scheduled'&&x.published_at&&new Date(x.published_at)<=new Date())).map(mapContent),config:config.data||null}
}
export function subscribeToCms(onChange){
 const channel=supabase.channel('eves-cms-live').on('postgres_changes',{event:'*',schema:'public',table:'cms_content'},onChange).on('postgres_changes',{event:'*',schema:'public',table:'cms_config'},onChange).subscribe()
 return ()=>supabase.removeChannel(channel)
}
