import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import App from './App'
import SocialShare from './SocialShare'
import './index.css'
import './logo-fix.css'
import './social.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><><App /><SocialShare /></></React.StrictMode>
)
