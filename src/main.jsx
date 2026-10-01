import React from 'react'
import ReactDOM from 'react-dom/client'
import MscLogin from './MscLogin'
import CmsSite from './CmsSite'
import SocialShare from './SocialShare'
import './index.css'
import './logo-fix.css'
import './official-logo.css'
import './eves-editorial.css'

import './social.css'

const path=window.location.pathname.toLowerCase()
const isMsc=path==='/msc'||path.startsWith('/msc/')
const isLegacyAdmin=path==='/admin'||path.startsWith('/admin/')
if(isLegacyAdmin) window.history.replaceState({},'', '/msc')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>{isMsc||isLegacyAdmin?<MscLogin/>:<><CmsSite/><SocialShare/></>}</React.StrictMode>
)
