import {verifySession,SERVER_KEY,json,sb,audit} from '../_eves.js'

const OPENROUTER_URL='https://openrouter.ai/api/v1/chat/completions'
const MODEL=process.env.OPENROUTER_MODEL||'openrouter/free'

function clean(value,max=12000){return String(value||'').slice(0,max)}
function extractJson(raw){
  try{return JSON.parse(raw)}catch{}
  const fenced=String(raw||'').match(/```(?:json)?\s*([\s\S]*?)```/i)
  if(fenced)try{return JSON.parse(fenced[1])}catch{}
  const start=String(raw||'').indexOf('{'),end=String(raw||'').lastIndexOf('}')
  if(start>=0&&end>start)try{return JSON.parse(String(raw).slice(start,end+1))}catch{}
  return null
}
async function siteSnapshot(){
  const [config,pages,news,sections,navigation]=await Promise.all([
    sb('eves_cms_config?select=*&id=eq.true',{admin:true}),
    sb('eves_cms_pages?select=*&order=sort_order.asc,updated_at.desc',{admin:true}),
    sb('eves_cms_news?select=*&order=updated_at.desc',{admin:true}),
    sb('eves_cms_sections?select=*&order=sort_order.asc',{admin:true}),
    sb('eves_cms_navigation?select=*&order=sort_order.asc',{admin:true})
  ])
  return {
    config:config?.[0]||null,
    pages:(pages||[]).map(x=>({id:x.id,slug:x.slug,title_fr:x.title_fr,title_en:x.title_en,excerpt_fr:x.excerpt_fr,excerpt_en:x.excerpt_en,body_fr:x.body_fr,body_en:x.body_en,status:x.status,category:x.category,metadata:x.metadata||{}})),
    news:(news||[]).map(x=>({id:x.id,slug:x.slug,title_fr:x.title_fr,title_en:x.title_en,excerpt_fr:x.excerpt_fr,excerpt_en:x.excerpt_en,body_fr:x.body_fr,body_en:x.body_en,status:x.status,category:x.category,tags:x.tags||[],metadata:x.metadata||{}})),
    sections:sections||[],
    navigation:navigation||[]
  }
}
const system=(lang,mode)=>`You are the private editorial assistant for the EVES association website CMS. Work only from the supplied EVES CMS snapshot and the selected content. Do not invent statistics, partners, funding, legal facts, impact numbers, dates or programmes. You may improve clarity, structure, tone, accessibility, SEO and bilingual consistency. You are an assistant, not a publisher: NEVER claim that anything was saved or published. The human administrator must review and save every change.

Language: ${lang==='en'?'English':'French'}. Mode: ${mode}.
Return valid JSON only with this shape:
{"reply":"concise answer for the administrator","suggestions":[{"title":"short title","reason":"why","changes":[{"field":"body_fr","description":"what to change"}]}],"draft":null}
For rewrite mode, draft may contain ONLY editable fields from the selected page/news record: title_fr,title_en,excerpt_fr,excerpt_en,body_fr,body_en,category,tags,metadata. Preserve factual meaning and do not remove important content unless requested. If no selected record exists, draft must be null.
For suggestions/review mode, draft must normally be null.
Suggestions must be practical and specific. Never output HTML, JavaScript or database commands.`

export default async function handler(req,res){
 try{
  if(req.method!=='POST')return json(res,405,{error:'Method not allowed'})
  const session=verifySession(req)
  if(!session)return json(res,401,{error:'Unauthorised'})
  if(!SERVER_KEY)return json(res,503,{error:'CMS server storage is not configured.'})
  if(!process.env.OPENROUTER_API_KEY)return json(res,503,{error:'OpenRouter is not configured on this deployment. Add OPENROUTER_API_KEY in Vercel.'})
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{}
  const message=clean(body.message,6000)
  if(!message)return json(res,400,{error:'Message is required'})
  const mode=['suggest','rewrite','review'].includes(body.mode)?body.mode:'suggest'
  const lang=body.lang==='en'?'en':'fr'
  const target=body.target&&typeof body.target==='object'?body.target:null
  const snapshot=await siteSnapshot()
  const payload={request:message,selected_content:target,site:snapshot}
  const messages=[
    {role:'system',content:system(lang,mode)},
    {role:'user',content:JSON.stringify(payload)}
  ]
  const request={model:MODEL,messages,temperature:0.35,max_tokens:2800,response_format:{type:'json_object'}}
  let r=await fetch(OPENROUTER_URL,{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENROUTER_API_KEY}`,'Content-Type':'application/json','HTTP-Referer':'https://evescm.vercel.app','X-Title':'EVES CMS AI Assistant'},body:JSON.stringify(request)})
  let raw=await r.text()
  if(!r.ok){
    let retry=await fetch(OPENROUTER_URL,{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENROUTER_API_KEY}`,'Content-Type':'application/json','HTTP-Referer':'https://evescm.vercel.app','X-Title':'EVES CMS AI Assistant'},body:JSON.stringify({...request,response_format:undefined})})
    raw=await retry.text();r=retry
  }
  let out=null;try{out=JSON.parse(raw)}catch{}
  if(!r.ok)return json(res,r.status,{error:out?.error?.message||'OpenRouter request failed'})
  const content=out?.choices?.[0]?.message?.content||''
  const parsed=extractJson(content)
  const result=parsed||{reply:content,suggestions:[],draft:null}
  if(result.draft&&typeof result.draft!=='object')result.draft=null
  if(!Array.isArray(result.suggestions))result.suggestions=[]
  await audit(session,'ai_assistant','cms',target?.id||'',{mode,model:MODEL})
  return json(res,200,{...result,model:out?.model||MODEL})
 }catch(e){console.error('EVES AI API',e);return json(res,e.status||500,{error:e.message||'AI assistant error'})}
}
