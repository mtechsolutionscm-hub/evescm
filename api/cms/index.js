import {sb,json,verifySession,SERVER_KEY,audit} from '../_eves.js'
const publicFilter=()=>`or=(status.eq.published,and(status.eq.scheduled,published_at.lte.${encodeURIComponent(new Date().toISOString())}))`
export default async function handler(req,res){
 try{
  if(req.method==='GET'){
   const s=verifySession(req),admin=Boolean(s&&SERVER_KEY)
   const [config,pages,news,media,sections,navigation]=await Promise.all([
    sb('eves_cms_config?select=*&id=eq.true',{admin}),
    sb(`eves_cms_pages?select=*&${admin?'order=updated_at.desc':publicFilter()+'&order=sort_order.asc,updated_at.desc'}`,{admin}),
    sb(`eves_cms_news?select=*&${admin?'order=updated_at.desc':publicFilter()+'&order=published_at.desc.nullslast,updated_at.desc'}`,{admin}),
    sb(`eves_cms_media?select=*&${admin?'order=sort_order.asc,created_at.desc':'status.eq.published&order=sort_order.asc,created_at.desc'}`,{admin}),
    sb(`eves_cms_sections?select=*&${admin?'order=sort_order.asc':'visible.eq.true&order=sort_order.asc'}`,{admin}),
    sb(`eves_cms_navigation?select=*&${admin?'order=sort_order.asc':'visible.eq.true&order=sort_order.asc'}`,{admin})
   ])
   return json(res,200,{admin,config:config?.[0]||null,pages:pages||[],news:news||[],media:media||[],sections:sections||[],navigation:navigation||[]})
  }
  const s=verifySession(req);if(!s)return json(res,401,{error:'Unauthorised'});if(!SERVER_KEY)return json(res,503,{error:'CMS server storage is not configured. Add SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.'})
  if(req.method==='POST'||req.method==='PUT'){
   const input=typeof req.body==='string'?JSON.parse(req.body):req.body||{}
   if(input.action==='config'){const p={...input.config};delete p.id;delete p.created_at;const d=await sb('eves_cms_config?id=eq.true',{method:'PATCH',admin:true,body:{...p,updated_at:new Date().toISOString()},headers:{Prefer:'return=representation'}});await audit(s,'update','config','true',{});return json(res,200,{ok:true,config:d?.[0]||null})}
   if(input.action==='section'){const x={...input.section};delete x.id;delete x.created_at;delete x.updated_at;const d=await sb('eves_cms_sections',{method:'POST',admin:true,body:{...x,updated_at:new Date().toISOString()},headers:{Prefer:'resolution=merge-duplicates,return=representation'}});await audit(s,'upsert','section',d?.[0]?.id||x.section_key,{});return json(res,200,{ok:true,section:d?.[0]||d})}
   if(input.action==='sections-reorder'){for(let i=0;i<(input.ids||[]).length;i++)await sb(`eves_cms_sections?id=eq.${encodeURIComponent(input.ids[i])}`,{method:'PATCH',admin:true,body:{sort_order:(i+1)*10,updated_at:new Date().toISOString()},headers:{Prefer:'return=minimal'}});await audit(s,'reorder','sections','/',{});return json(res,200,{ok:true})}
   if(input.action==='navigation'){const x={...input.item};delete x.id;delete x.created_at;delete x.updated_at;const d=await sb('eves_cms_navigation',{method:'POST',admin:true,body:{...x,updated_at:new Date().toISOString()},headers:{Prefer:'resolution=merge-duplicates,return=representation'}});return json(res,200,{ok:true,item:d?.[0]||d})}
   if(input.action==='newsletter'){const d=await sb('eves_cms_newsletter_subscribers?select=id,email,language,status,source,subscribed_at&order=subscribed_at.desc',{admin:true});return json(res,200,{ok:true,subscribers:d||[]})}
   const type=input.type||input.content?.kind, c={...(input.content||{})};delete c.id;delete c.created_at;delete c.updated_at
   const table=type==='page'?'eves_cms_pages':type==='news'?'eves_cms_news':type==='media'?'eves_cms_media':null
   if(!table)return json(res,400,{error:'Unsupported CMS content type'})
   if((c.status==='published'||type==='news')&&!c.published_at&&c.status==='published')c.published_at=new Date().toISOString()
   const d=await sb(table,{method:'POST',admin:true,body:{...c,updated_at:new Date().toISOString()},headers:{Prefer:'resolution=merge-duplicates,return=representation'}})
   await audit(s,'upsert',type,d?.[0]?.id||c.slug||'',{});return json(res,200,{ok:true,[type]:d?.[0]||d})
  }
  if(req.method==='DELETE'){
   const type=String(req.query?.type||''),id=String(req.query?.id||''),table={page:'eves_cms_pages',news:'eves_cms_news',media:'eves_cms_media',section:'eves_cms_sections',navigation:'eves_cms_navigation'}[type]
   if(!id||!table)return json(res,400,{error:'Missing or unsupported resource'})
   await sb(`${table}?id=eq.${encodeURIComponent(id)}`,{method:'DELETE',admin:true});await audit(s,'delete',type,id,{});return json(res,200,{ok:true})
  }
  return json(res,405,{error:'Method not allowed'})
 }catch(e){console.error('EVES CMS API',e);return json(res,e.status||500,{error:e.message||'CMS error'})}
}
