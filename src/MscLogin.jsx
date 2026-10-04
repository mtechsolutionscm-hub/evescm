import { useEffect, useState } from 'react'
import Admin from './Admin'
import './msc-login.css'

const LOGO = '/logo.svg'
const CMS_API=import.meta.env.VITE_EVES_CMS_API||'https://mozwkfyiaqxwaoxwpkry.supabase.co/functions/v1/eves-cms-admin'

export default function MscLogin(){
  const [status,setStatus]=useState('checking')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)

  useEffect(()=>{
    fetch(`${CMS_API}?action=session`,{headers:localStorage.getItem('eves_msc_token')?{Authorization:`Bearer ${localStorage.getItem('eves_msc_token')}`}:{}}).then(r=>r.ok?setStatus('authenticated'):setStatus('login')).catch(()=>setStatus('login'))
  },[])

  async function login(e){
    e.preventDefault(); setBusy(true); setError('')
    try{
      const r=await fetch(`${CMS_API}?action=login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})})
      const j=await r.json()
      if(!r.ok) throw new Error(j.error||'Authentication failed')
      localStorage.setItem('eves_msc_token',j.token); setStatus('authenticated'); setPassword('')
    }catch(err){setError(err.message)}finally{setBusy(false)}
  }

  if(status==='checking') return <div className="msc-loading"><span>EVES MSC</span></div>
  if(status==='authenticated') return <Admin />
  return <div className="msc-shell">
    <div className="msc-card">
      <div className="msc-logo"><img src={LOGO} alt="Logo officiel EVES" /></div>
      <span className="msc-kicker">EVES • MANAGEMENT & SECURITY CONSOLE</span>
      <h1>Administration sécurisée</h1>
      <p>Accédez à la gestion du site, du contenu bilingue, des publications et des ressources EVES.</p>
      <form onSubmit={login}>
        <label>Adresse e-mail<input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
        <label>Mot de passe<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
        {error&&<div className="msc-error">{error}</div>}
        <button disabled={busy}>{busy?'Connexion…':'Se connecter'} <span>→</span></button>
      </form>
      <small>Accès réservé aux administrateurs autorisés.</small>
    </div>
  </div>
}
