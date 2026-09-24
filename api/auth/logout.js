import {json,verifySession,audit} from '../_eves.js'
export default async function handler(req,res){if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});const s=verifySession(req);if(s)await audit(s,'logout','auth','',{});res.setHeader('Set-Cookie','eves_admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');return json(res,200,{ok:true})}
