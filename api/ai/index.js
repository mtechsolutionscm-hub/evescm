import {verifySession,SERVER_KEY,json,sb,audit} from '../_eves.js'

const OPENROUTER_URL='https://openrouter.ai/api/v1/chat/completions'
const PRIMARY_MODEL='nvidia/nemotron-3.5-lightning:free'
const FALLBACK_MODEL='openrouter/free'
const MODEL=process.env.OPENROUTER_MODEL||PRIMARY_MODEL

function clean(value,max=12000){return String(value||'').slice(0,max)}
function extractJson(raw){
  try{return JSON.parse(raw)}catch{}
  const fenced=String(raw||'').match(/\`\`\`(?:json)?\s*([\\s\\S]*?)\`\`\`/i)
  if(fenced)try{return JSON.parse(fenced[1])}catch{}
  const start=String(raw||'').indexOf('{'),end=String(raw||'').lastIndexOf('}')
  if(start>=0&&end>start)try{return JSON.parse(String(raw).slice(start,end+1))}catch{}
  return null
}
function explicitCommand(message){
  return /\\b(chang(?:e|er)|modif(?:y|ie)|update|updat(?:e|er)|set|replace|remplac(?:e|er)|mettre|mets|ajout(?:e|er)|supprim(?:e|er)|corrig(?:e|er)|changeons)\\b/i.test(message)
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
const system=(lang,mode,canExecute)=>`You are EVES CMS AI, the central editorial and website operations assistant for the EVES association. Work ONLY from the supplied EVES CMS snapshot. Never invent facts, numbers, partners, programmes, contacts or legal information.

You can analyse, suggest improvements and prepare or execute narrowly scoped CMS changes. Language: ${lang==='en'?'English':'French'}. Mode: ${mode}. Explicit command detected: ${canExecute?'YES':'NO'}.

IMPORTANT:
- If an explicit change/update command is NOT detected, do NOT propose an executable operation. Give suggestions only.
- If an explicit command IS detected, identify the exact requested change. You may return one executable operation ONLY when the requested target and new value are clear and the target is an allowed CMS field.
- Safe allowed global fields: config.contact_email, config.phone, config.address, config.site_name, config.tagline_fr, config.tagline_en, config.footer_description_fr, config.footer_description_en.
- Safe content fields: selected page/news title_fr,title_en,excerpt_fr,excerpt_en,body_fr,body_en,category,tags,metadata.
- Section fields: title_fr,title_en,intro_fr,intro_en,visible and supported section data fields.
- Navigation fields: label_fr,label_en,href,visible.
- Never expose secrets or environment variables.
- Never publish automatically. An executable operation changes the saved CMS draft/data only; publication remains a separate human action.
- Return valid JSON only:
{"reply":"...","suggestions":[...],"operation":null}
operation shape: {"type":"config|page|news|section|navigation","id":"record id or true","changes":{"field":"new value"},"reason":"short explanation"}
For suggestions, operation MUST be null. Suggestions: [{"title":"...","reason":"...","changes":[{"field":"...","description":"..."}]}].`

async function callModel(messages,model){
  const request={model,messages,temperature:0.2,max_tokens:2200}
  const r=await fetch(OPENROUTER_URL,{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENROUTER_API_KEY}`,'Content-Type':'application/json','HTTP-Referer':'https://evescm.vercel.app','X-Title':'EVES CMS AI'},body:JSON.stringify(request)})
  const raw=await r.text();let out=null;try{out=JSON.parse(raw)}catch{}
  if(!r.ok)throw Object.assign(new Error(out?.error?.message||'OpenRouter request failed'),{status:r.status})
  return {out,model:out?.model||model}
}
async function applyOperation(op,snapshot){
  if(!op||!op.type||!op.changes||typeof op.changes!=='object')return null
  const allowedConfig=['contact_email','phone','address','site_name','tagline_fr','tagline_en','footer_description_fr','footer_description_en']
  if(op.type==='config'){
    if(op.id!=='true'&&op.id!==true)return null
    for(const k of Object.keys(op.changes))if(!allowedConfig.includes(k))return null
    const current=snapshot.config||{};const body={...current,...op.changes};delete body.id;delete body.created_at;delete body.updated_at
    const d=await sb('eves_cms_config?id=eq.true',{method:'PATCH',admin:true,body:{...body,updated_at:new Date().toISOString()},headers:{Prefer:'return=representation'}})
    return d?.[0]||body
  }
  const table=op.type==='page'?'eves_cms_pages':op.type==='news'?'eves_cms_news':op.type==='section'?'eves_cms_sections':op.type==='navigation'?'eves_cms_navigation':null
  if(!table||!op.id)return null
  const current=(snapshot[op.type==='page'?'pages':op.type==='news'?'news':op.type==='section'?'sections':'navigation']||[]).find(x=>String(x.id)===String(op.id))
  if(!current)return null
  const allowed=['title_fr','title_en','excerpt_fr','excerpt_en','body_fr','body_en','category','tags','metadata','intro_fr','intro_en','visible','label_fr','label_en','href','sort_order','data']
  for(const k of Object.keys(op.changes))if(!allowed.includes(k))return null
  const d=await sb(`${table}?id=eq.${encodeURIComponent(op.id)}`,{method:'PATCH',admin:true,body:{...op.changes,updated_at:new Date().toISOString()},headers:{Prefer:'return=representation'}})
  return d?.[0]||null
}

export default async function handler(req,res){
 try{
  if(req.method!=='POST')return json(res,405,{error:'Method not allowed'})
  const session=verifySession(req)
  if(!session)return json(res,401,{error:'Unauthorised'})
  if(!SERVER_KEY)return json(res,503,{error:'CMS server storage is not configured.'})
  if(!process.env.OPENROUTER_API_KEY)return json(res,503,{error:'OpenRouter is not configured on this deployment.'})
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{}
  const message=clean(body.message,6000);if(!message)return json(res,400,{error:'Message is required'})
  const mode=['suggest','rewrite','review'].includes(body.mode)?body.mode:'suggest'
  const lang=body.lang==='en'?'en':'fr'
  const target=body.target&&typeof body.target==='object'?body.target:null
  const snapshot=await siteSnapshot()
  const canExecute=explicitCommand(message)
  const payload={request:message,selected_content:target,site:snapshot}
  const messages=[{role:'system',content:system(lang,mode,canExecute)},{role:'user',content:JSON.stringify(payload)}]
  let result
  try{result=await callModel(messages,MODEL)}catch(e){result=await callModel(messages,FALLBACK_MODEL)}
  const content=result.out?.choices?.[0]?.message?.content||''
  const parsed=extractJson(content)||{reply:content,suggestions:[],operation:null}
  if(!Array.isArray(parsed.suggestions))parsed.suggestions=[]
  if(!canExecute)parsed.operation=null
  let applied=null
  if(canExecute&&parsed.operation){
    try{applied=await applyOperation(parsed.operation,snapshot)}catch(e){console.error('EVES AI apply',e)}
    if(applied){
      parsed.reply=`${parsed.reply||'Modification appliquée.'} La modification a été enregistrée dans le CMS. Vérifiez-la avant publication.`
      parsed.applied=true
    }else{
      parsed.operation=null
      parsed.applied=false
      parsed.reply=`${parsed.reply||'Je peux préparer cette modification.'} Je n’ai pas appliqué la modification car la cible ou le champ n’était pas suffisamment sûr. Voici une proposition à vérifier.`
    }
  }
  await audit(session,'ai_assistant','cms',target?.id||parsed.operation?.id||'',{mode,model:result.model,applied:Boolean(applied)})
  return json(res,200,{...parsed,model:result.model,applied:Boolean(applied)})
 }catch(e){console.error('EVES AI API',e);return json(res,e.status||500,{error:e.message||'AI assistant error'})}
}
