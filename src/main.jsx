import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import App from './App'
import Admin from './Admin'
import SocialShare from './SocialShare'
import './index.css'
import './logo-fix.css'
import './social.css'

const isAdmin=window.location.pathname.startsWith('/admin')
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>{isAdmin?<Admin/>:<><App/><SocialShare/></>}</React.StrictMode>
)
