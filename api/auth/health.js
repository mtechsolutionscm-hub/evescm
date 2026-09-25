import { json, SERVER_KEY, SUPABASE_URL } from '../_eves.js'

export default async function handler(req,res){
  if(req.method!=='GET') return json(res,405,{error:'Method not allowed'})
  const checks={
    supabaseUrlConfigured:!!SUPABASE_URL,
    serverKeyConfigured:!!SERVER_KEY,
    sessionSecretConfigured:!!process.env.EVES_ADMIN_SESSION_SECRET,
  }
  let databaseReachable=false
  let databaseError=''
  if(SERVER_KEY){
    try{
      const endpoint=SUPABASE_URL+'/rest/v1/eves_cms_admins?select=id&limit=1'
      const r=await fetch(endpoint,{headers:{apikey:SERVER_KEY,Authorization:'Bearer '+SERVER_KEY}})
      databaseReachable=r.ok
      if(!r.ok) databaseError='Supabase returned HTTP '+r.status
    }catch(e){databaseError=e?.message||'Supabase request failed'}
  }
  return json(res,200,{ok:checks.serverKeyConfigured&&checks.sessionSecretConfigured&&databaseReachable,checks,databaseReachable,databaseError})
}
