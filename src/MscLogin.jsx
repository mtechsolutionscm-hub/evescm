import { useEffect, useState } from 'react'
import Admin from './Admin'
import './msc-login.css'

const LOGO = '/logo.svg'
const CMS_API=import.meta.env.VITE_EVES_CMS_API||'https://mozwkfyiaqxwaoxwpkry.supabase.co/functions/v1/eves-cms-admin'
const cmsHeaders=(token)=>token?{Authorization:`Bearer ${token}`} : {}

function ResetPassword({token}){
  const [password,setPassword]=useState('')
  const [confirm,setConfirm]=useState('')
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')
  async function submit(e){
    e.preventDefault(); setBusy(true); setError(''); setMessage('')
    if(password.length<12){setError('Le nouveau mot de passe doit contenir au moins 12 caractères.');setBusy(false);return}
    if(password!==confirm){setError('Les deux mots de passe ne correspondent pas.');setBusy(false);return}
    try{
      const r=await fetch(`${CMS_API}?action=reset-password`,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({token,newPassword:password}),mode:'cors'})
      const j=await r.json()
      if(!r.ok) throw new Error(j.error||`Réinitialisation impossible (${r.status})`)
      setMessage('Mot de passe réinitialisé. Ce lien a été invalidé et ne peut plus être utilisé.')
      setPassword(''); setConfirm('')
      window.history.replaceState({},'',window.location.pathname)
    }catch(err){setError(err.message)}finally{setBusy(false)}
  }
  return <div className="msc-shell">
    <div className="msc-card">
      <div className="msc-logo"><img src={LOGO} alt="Logo officiel EVES" /></div>
      <span className="msc-kicker">EVES • MANAGEMENT & SECURITY CONSOLE</span>
      <h1>Réinitialiser l’accès</h1>
      <p>Définissez un nouveau mot de passe administrateur. Ce lien est à usage unique et sera supprimé immédiatement après réussite.</p>
      <form onSubmit={submit}>
        <label>Nouveau mot de passe<input type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} minLength={12} required /></label>
        <label>Confirmer le mot de passe<input type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} minLength={12} required /></label>
        {error&&<div className="msc-error">{error}</div>}
        {message&&<div className="msc-success">{message}</div>}
        {!message&&<button disabled={busy}>{busy?'Réinitialisation…':'Réinitialiser le mot de passe'} <span>→</span></button>}
      </form>
      <small>Le lien expire automatiquement et ne peut être réutilisé.</small>
    </div>
  </div>
}

export default function MscLogin(){
  const [status,setStatus]=useState('checking')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  const resetToken=new URLSearchParams(window.location.search).get('reset')

  useEffect(()=>{
    if(resetToken){setStatus('reset');return}
    let cancelled=false
    async function checkSession(){
      const token=localStorage.getItem('eves_msc_token')
      if(!token){if(!cancelled)setStatus('login');return}
      try{
        const r=await fetch(`${CMS_API}?action=session`,{headers:cmsHeaders(token),cache:'no-store',mode:'cors'})
        const j=await r.json().catch(()=>({}))
        if(!r.ok||j.authenticated!==true){
          localStorage.removeItem('eves_msc_token')
          if(!cancelled)setStatus('login')
          return
        }
        if(!cancelled)setStatus('authenticated')
      }catch{
        if(!cancelled)setStatus('login')
      }
    }
    checkSession()
    return()=>{cancelled=true}
  },[resetToken])

  async function login(e){
    e.preventDefault(); setBusy(true); setError('')
    try{
      const r=await fetch(`${CMS_API}?action=login`,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({email:email.trim().toLowerCase(),password}),mode:'cors'})
      const j=await r.json()
      if(!r.ok) throw new Error(j.error||`Authentication failed (${r.status})`)
      localStorage.setItem('eves_msc_token',j.token); setStatus('authenticated'); setPassword('')
    }catch(err){setError(err.message)}finally{setBusy(false)}
  }

  if(status==='checking') return <div className="msc-loading"><span>EVES MSC</span></div>
  if(status==='authenticated') return <Admin />
  if(status==='reset') return <ResetPassword token={resetToken} />
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
