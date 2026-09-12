import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import App from './App'
import MscLogin from './MscLogin'
import SocialShare from './SocialShare'
import './index.css'
import './logo-fix.css'
import './official-logo.css'
import './social.css'

const path=window.location.pathname.toLowerCase()
const isMsc=path==='/msc'||path.startsWith('/msc/')
const isLegacyAdmin=path==='/admin'||path.startsWith('/admin/')
if(isLegacyAdmin) window.history.replaceState({},'', '/msc')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>{isMsc||isLegacyAdmin?<MscLogin/>:<><App/><SocialShare/></>}</React.StrictMode>
)
