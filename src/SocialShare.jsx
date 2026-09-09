import React from 'react'

const shareUrl='https://evescm.vercel.app/'
const message='Découvrez EVES — Éducation, Protection et Émancipation au Cameroun.'

const channels=[
  {label:'WhatsApp',icon:'fa-brands fa-whatsapp',href:`https://wa.me/?text=${encodeURIComponent(message+' '+shareUrl)}`},
  {label:'Facebook',icon:'fa-brands fa-facebook-f',href:`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`},
  {label:'LinkedIn',icon:'fa-brands fa-linkedin-in',href:`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`},
  {label:'X',icon:'fa-brands fa-x-twitter',href:`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`},
  {label:'Email',icon:'fa-solid fa-envelope',href:`mailto:?subject=${encodeURIComponent('EVES — Éducation · Protection · Émancipation')}&body=${encodeURIComponent(message+'\n\n'+shareUrl)}`}
]

export default function SocialShare(){
 return <section className="social-share" aria-label="Partager EVES sur les réseaux sociaux">
   <div className="container social-share-inner">
     <div className="social-copy"><span className="eyebrow">SUIVEZ & PARTAGEZ</span><h2>Faites connaître <span>l’action EVES.</span></h2><p>Partagez nos actions, nos actualités et nos opportunités avec votre réseau.</p></div>
     <div className="social-actions">{channels.map(c=><a key={c.label} className={`social-button social-${c.label.toLowerCase()}`} href={c.href} target="_blank" rel="noopener noreferrer" aria-label={`Partager EVES sur ${c.label}`}><i className={c.icon} aria-hidden="true"></i><span>{c.label}</span></a>)}</div>
   </div>
 </section>
}
