import {json,verifySession} from '../_eves.js'
export default function handler(req,res){if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});const s=verifySession(req);if(!s)return json(res,401,{authenticated:false});return json(res,200,{authenticated:true,email:s.email,expiresAt:s.exp,displayName:s.displayName||'EVES Administrator'})}
