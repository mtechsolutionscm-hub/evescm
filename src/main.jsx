import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import App from './App'
import MscLogin from './MscLogin'
import CmsSite from './CmsSite'
import SocialShare from './SocialShare'
import './index.css'
import './logo-fix.css'
import './official-logo.css'

const SITE_VERSION='2026.09.21.01'
const VERSION_KEY='eves-site-version'
async function ensureFreshSite(){
 const current=localStorage.getItem(VERSION_KEY)
 if(current===SITE_VERSION) return
 localStorage.setItem(VERSION_KEY,SITE_VERSION)
 try{
  if('caches' in window){const keys=await caches.keys();await Promise.all(keys.map(key=>caches.delete(key)))}
  if('serviceWorker' in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(reg=>reg.unregister()))}
 }catch(_){}
 const url=new URL(window.location.href)
 url.searchParams.set('_eves',SITE_VERSION)
 window.location.replace(url.toString())
}
ensureFreshSite()

const SITE_VERSION='2026.09.21.01'
const VERSION_KEY='eves-site-version'
async function ensureFreshSite(){
 const current=localStorage.getItem(VERSION_KEY)
 if(current===SITE_VERSION) return
 localStorage.setItem(VERSION_KEY,SITE_VERSION)
 try{
  if('caches' in window){const keys=await caches.keys();await Promise.all(keys.map(key=>caches.delete(key)))}
  if('serviceWorker' in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(reg=>reg.unregister()))}
 }catch(_){}
 const url=new URL(window.location.href)
 url.searchParams.set('_eves',SITE_VERSION)
 window.location.replace(url.toString())
}
ensureFreshSite()
import './social.css'

const path=window.location.pathname.toLowerCase()
const isMsc=path==='/msc'||path.startsWith('/msc/')
const isLegacyAdmin=path==='/admin'||path.startsWith('/admin/')
if(isLegacyAdmin) window.history.replaceState({},'', '/msc')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>{isMsc||isLegacyAdmin?<MscLogin/>:<><CmsSite/><SocialShare/></>}</React.StrictMode>
)
