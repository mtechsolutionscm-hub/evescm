import {useEffect,useState} from 'react'
import {fetchPublicContent,subscribeToCms,supabase} from './cms'
import './cms-site.css'

const logo='/logo.svg'
const galleryImages=[
 {src:'/gallery/eves-01.jpg',alt:'Enfants au cœur d’une communauté',caption:'Enfance, dignité et solidarité au cœur de l’action EVES.'},
 {src:'/gallery/eves-02.jpg',alt:'Mobilisation communautaire des enfants',caption:'Des communautés mobilisées autour de l’éducation et de la protection.'},
 {src:'/gallery/eves-03.jpg',alt:'Apprentissage en classe',caption:'L’éducation et le maintien à l’école comme leviers de résilience.'},
 {src:'/gallery/eves-04.jpg',alt:'Activité éducative communautaire',caption:'Des espaces d’apprentissage adaptés aux enfants et aux jeunes.'},
 {src:'/gallery/eves-05.jpg',alt:'Enfants et jeunes en communauté',caption:'Une action construite avec les enfants, les jeunes et leurs familles.'}
]
const links=[['/about','À propos'],['/causes','Objectifs'],['/projects','Programmes'],['/governance','Gouvernance'],['/advisory','Comité consultatif'],['/partners','Partenaires'],['/resources','Ressources'],['/events','Événements'],['/gallery','Galerie'],['/news','Actualités & Blog']]
const navGroups=[
 {label:'Organisation',items:[links[0],links[3],links[4],links[5]]},
 {label:'Action',items:[links[1],links[2]]},
 {label:'Ressources',items:[links[6],links[7],links[8],links[9]]}
]
const objectives=[['OS1','Scolarisation','Accès, maintien et réinsertion scolaire.','fa-book-open'],['OS2','Résilience climatique','Adaptation, prévention et pratiques durables.','fa-seedling'],['OS3','Protection & VBG','Prévention, protection et autonomisation.','fa-shield-heart'],['OS4','Économie sociale et solidaire','OESS, AGR et développement durable.','fa-handshake-angle'],['OS5','Innovation & plaidoyer','Recherche, innovation et mobilisation.','fa-lightbulb']]
function Txt({lang,fr,en}){return lang==='fr'?fr:en}

function Newsletter({lang,compact=false}){
 const [email,setEmail]=useState('')
 const [state,setState]=useState('idle')
 async function submit(e){
  e.preventDefault()
  if(!email.trim()) return
  setState('loading')
  const {error}=await supabase.from('newsletter_subscribers').insert({email:email.trim().toLowerCase(),language:lang,source:'website'})
  if(error?.code==='23505'){setState('exists');return}
  if(error){setState('error');return}
  setEmail('');setState('success')
 }
 return <section className={compact?'cms-newsletter cms-newsletter-compact':'cms-newsletter'}><div><span><i className="fa-solid fa-envelope-open-text"/> NEWSLETTER EVES</span><h2><Txt lang={lang} fr="Recevez les nouvelles d’EVES" en="Stay connected with EVES"/></h2><p><Txt lang={lang} fr="Actualités, programmes, ressources, opportunités et temps forts directement dans votre boîte mail." en="News, programmes, resources, opportunities and highlights delivered to your inbox."/></p></div><form onSubmit={submit}><label className="sr-only" htmlFor="newsletter-email">Email</label><input id="newsletter-email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder={lang==='fr'?'Votre adresse email':'Your email address'}/><button disabled={state==='loading'}>{state==='loading'?'...':<><Txt lang={lang} fr="S’inscrire" en="Subscribe"/> <i className="fa-solid fa-arrow-right"/></>}</button>{state==='success'&&<small className="form-ok"><Txt lang={lang} fr="Merci. Votre inscription est confirmée." en="Thank you. Your subscription is confirmed."/></small>}{state==='exists'&&<small className="form-ok"><Txt lang={lang} fr="Cette adresse est déjà inscrite." en="This email is already subscribed."/></small>}{state==='error'&&<small className="form-error"><Txt lang={lang} fr="Inscription impossible pour le moment. Réessayez." en="Subscription failed. Please try again."/></small>}</form></section>
}

function Shell({children,lang,setLang,config}){
 const [open,setOpen]=useState(false)
 const [expanded,setExpanded]=useState(null)
 const address=config?.extra?.address||'Yaoundé, Cameroun'
 const menuLinks=links.concat([['/donate','Soutenir']])
 const toggleGroup=(label)=>setExpanded(x=>x===label?null:label)
 return <div className="cms-shell">
  <div className="cms-top"><span><i className="fa-solid fa-location-dot"/> {address} · Action ouverte à toutes et tous</span><span><a href={`mailto:${config?.contact_email||'contact@eves.cm'}`}><i className="fa-solid fa-envelope"/> {config?.contact_email||'contact@eves.cm'}</a><a href={`tel:${config?.phone||'+237 656 987 759'}`}><i className="fa-solid fa-phone"/> {config?.phone||'+237 656 987 759'}</a></span></div>
  <header className="cms-header">
   <a href="/" className="cms-logo"><img src={config?.logo_url||logo} alt="Logo officiel EVES"/></a>
   <nav className="cms-desktop-nav" aria-label="Navigation principale">
    <a href="/"><i className="fa-solid fa-house"/> Accueil</a>
    <div className="cms-nav-dropdown"><button type="button" aria-haspopup="true">Organisation <i className="fa-solid fa-chevron-down"/></button><div className="cms-nav-menu">{navGroups[0].items.map(([u,t])=><a href={u} key={u}>{t}</a>)}</div></div>
    <div className="cms-nav-dropdown"><button type="button" aria-haspopup="true">Action <i className="fa-solid fa-chevron-down"/></button><div className="cms-nav-menu">{navGroups[1].items.map(([u,t])=><a href={u} key={u}>{t}</a>)}</div></div>
    <div className="cms-nav-dropdown"><button type="button" aria-haspopup="true">Ressources <i className="fa-solid fa-chevron-down"/></button><div className="cms-nav-menu">{navGroups[2].items.map(([u,t])=><a href={u} key={u}>{t}</a>)}</div></div>
    <a className="cms-support" href="/donate"><i className="fa-solid fa-heart"/> <Txt lang={lang} fr="Soutenir" en="Support"/></a>
    <button className="cms-lang" onClick={()=>setLang(lang==='fr'?'en':'fr')} aria-label="Changer de langue">{lang.toUpperCase()}</button>
   </nav>
   <button className="cms-menu" onClick={()=>setOpen(true)} aria-label="Ouvrir le menu"><i className="fa-solid fa-bars"/></button>
  </header>
  {open&&<><div className="cms-backdrop" onClick={()=>setOpen(false)}/><aside className="cms-drawer" aria-label="Menu mobile">
   <div className="cms-drawer-head"><img src={config?.logo_url||logo} alt="Logo officiel EVES"/><button onClick={()=>setOpen(false)} aria-label="Fermer"><i className="fa-solid fa-xmark"/></button></div>
   <a href="/" onClick={()=>setOpen(false)} className="cms-mobile-home"><i className="fa-solid fa-house"/> Accueil</a>
   {navGroups.map(group=><div className="cms-mobile-group" key={group.label}>
    <button type="button" className={expanded===group.label?'open':''} onClick={()=>toggleGroup(group.label)}>{group.label}<i className="fa-solid fa-chevron-down"/></button>
    {expanded===group.label&&<div className="cms-mobile-submenu">{group.items.map(([u,t])=><a href={u} key={u} onClick={()=>setOpen(false)}>{t}</a>)}</div>}
   </div>)}
   <a href="/donate" onClick={()=>setOpen(false)} className="mobile-support"><i className="fa-solid fa-heart"/> <Txt lang={lang} fr="Soutenir EVES" en="Support EVES"/></a>
   <button className="cms-mobile-lang" onClick={()=>{setLang(lang==='fr'?'en':'fr');setOpen(false)}}>{lang==='fr'?'English':'Français'}</button>
  </aside></>}
  {children}
  <Newsletter lang={lang} compact/>
  <footer className="cms-footer"><div><img src={config?.logo_url||logo} alt="Logo officiel EVES"/><p><Txt lang={lang} fr="Objectifs de développement durable & solidarité internationale. EVES agit pour des communautés plus inclusives, résilientes et solidaires." en="Sustainable Development Goals & international solidarity. EVES works for more inclusive, resilient and caring communities."/></p></div><div><h4>EVES</h4>{links.slice(0,7).map(([u,t])=><a href={u} key={u}>{t}</a>)}</div><div><h4><Txt lang={lang} fr="Contact professionnel" en="Professional contact"/></h4><a href={`mailto:${config?.contact_email||'contact@eves.cm'}`}>{config?.contact_email||'contact@eves.cm'}</a><a href={`tel:${config?.phone||'+237 656 987 759'}`}>{config?.phone||'+237 656 987 759'}</a><p><i className="fa-solid fa-location-dot"/> {address}</p><a className="cms-footer-donate" href="/donate"><i className="fa-solid fa-heart"/> <Txt lang={lang} fr="Soutenir EVES" en="Support EVES"/></a></div></footer>
  <div className="cms-credit">EVES · <strong>MTECHsolutions</strong></div>
 </div>
}
function Home({items,config,lang,setLang}){
 const [slide,setSlide]=useState(0)
 const home=items.find(x=>x.kind==='page'&&x.slug==='/')
 const posts=items.filter(x=>x.kind==='news').slice(0,3)
 useEffect(()=>{const t=setInterval(()=>setSlide(x=>(x+1)%galleryImages.length),5000);return()=>clearInterval(t)},[])
 const title=lang==='fr'?'Ensemble, construisons un avenir plus inclusif et durable.':'Together, building a more inclusive and sustainable future.'
 const body=lang==='fr'?'EVES accompagne les enfants, les jeunes et leurs familles les plus vulnérables à travers les Objectifs de développement durable et la solidarité internationale, en mobilisant l’éducation, la protection, la résilience climatique, l’économie sociale et solidaire, l’innovation et le plaidoyer.':'EVES supports vulnerable children, young people and families through the Sustainable Development Goals and international solidarity, mobilising education, protection, climate resilience, the social and solidarity economy, innovation and advocacy.'
 return <Shell {...{lang,setLang,config}}>
  <section className="cms-hero"><div className="cms-hero-collage">{galleryImages.map((image,i)=><figure key={image.src} className={i===slide?'active':''}><img src={image.src} alt={image.alt}/><figcaption>{image.caption}</figcaption></figure>)}</div><div className="cms-hero-shade"/><div className="cms-hero-copy"><img className="cms-hero-logo" src={config?.logo_url||logo} alt="Logo officiel EVES"/><span><i className="fa-solid fa-earth-africa"/> ODD · OBJECTIFS DE DÉVELOPPEMENT DURABLE & SOLIDARITÉ INTERNATIONALE</span><h1>{home?.metadata?.[lang==='fr'?'hero_title_fr':'hero_title_en']||title}</h1><p>{home?.[`body_${lang}`]||body}</p><a href="/about" className="cms-btn">Découvrir EVES <i className="fa-solid fa-arrow-right"/></a><a href="/donate" className="cms-btn outline">Soutenir notre action</a></div><div className="cms-dots">{galleryImages.map((_,i)=><button key={i} className={i===slide?'active':''} onClick={()=>setSlide(i)} aria-label={`Image ${i+1}`}/>)}</div></section>
  <section className="cms-section"><div className="cms-heading"><span>ODD · 5 OBJECTIFS SPÉCIFIQUES</span><h2><Txt lang={lang} fr="Une stratégie au service de l’inclusion, de la résilience et de la solidarité." en="A strategy for inclusion, resilience and solidarity."/></h2></div><div className="obj-grid">{objectives.map(([code,title,desc,icon])=><article key={code}><i className={`fa-solid ${icon}`}/><small>{code}</small><h3>{title}</h3><p>{desc}</p><a href="/causes" aria-label={`Découvrir ${code}`}><i className="fa-solid fa-arrow-right"/></a></article>)}</div></section>
  <section className="cms-section"><div className="cms-heading"><span>NEWSROOM</span><h2><Txt lang={lang} fr="Actualités & perspectives" en="News & perspectives"/></h2></div><div className="news-grid">{posts.map(p=><a href={`/news/${p.slug}`} className="news-card" key={p.id}><small>{p.category}</small><h3>{p[`title_${lang}`]||p.title_fr}</h3><p>{p[`excerpt_${lang}`]||p.excerpt_fr}</p><span>{p.published_at?new Date(p.published_at).toLocaleDateString(lang==='fr'?'fr-FR':'en-GB'):''} · <Txt lang={lang} fr="Lire" en="Read"/></span></a>)}</div></section>
  <section className="cms-section cms-home-gallery"><div className="cms-heading"><span>GALERIE</span><h2><Txt lang={lang} fr="Le terrain en images" en="Our work in pictures"/></h2><p><Txt lang={lang} fr="Découvrez quelques moments de terrain, de mobilisation et de vie communautaire." en="Explore moments from field work, mobilisation and community life."/></p></div><div className="gallery-strip">{galleryImages.map(image=><a href="/gallery" key={image.src}><img src={image.src} alt={image.alt}/></a>)}</div><a className="cms-text-link" href="/gallery"><Txt lang={lang} fr="Voir toute la galerie" en="View the full gallery"/> <i className="fa-solid fa-arrow-right"/></a></section>
 </Shell>
}

function Gallery({config,lang,setLang}){
 return <Shell {...{config,lang,setLang}}><main className="cms-page"><div className="cms-page-hero"><span>EVES · GALERIE</span><h1><Txt lang={lang} fr="Le terrain, les équipes et les communautés." en="Field work, teams and communities."/></h1><p><Txt lang={lang} fr="Des images authentiques pour raconter l’engagement d’EVES et les personnes au cœur de nos programmes." en="Authentic images telling the EVES story and highlighting the people at the heart of our programmes."/></p></div><section className="cms-section"><div className="gallery-grid">{galleryImages.map((image,i)=><figure key={image.src}><img src={image.src} alt={image.alt}/><figcaption><strong>0{i+1}</strong><span>{image.caption}</span></figcaption></figure>)}</div></section></main></Shell>
}

function Page({item,config,lang,setLang}){return <Shell {...{config,lang,setLang}}><main className="cms-page"><div className="cms-page-hero"><span>{item.category||'EVES'}</span><h1>{item[`title_${lang}`]||item.title_fr}</h1><p>{item[`excerpt_${lang}`]||item.excerpt_fr}</p></div><article>{(item[`body_${lang}`]||item.body_fr||'').split('\n').filter(Boolean).map((p,i)=><p key={i}>{p}</p>)}</article></main></Shell>}

function News({items,config,lang,setLang}){const posts=items.filter(x=>x.kind==='news');return <Shell {...{config,lang,setLang}}><main className="cms-page"><div className="cms-page-hero"><span>EVES NEWSROOM</span><h1><Txt lang={lang} fr="Actualités, analyses et terrain." en="News, analysis and field stories."/></h1><p><Txt lang={lang} fr="Avancées institutionnelles, programmes, partenariats et résultats." en="Institutional progress, programmes, partnerships and results."/></p></div><div className="news-grid large">{posts.map(p=><a href={`/news/${p.slug}`} className="news-card" key={p.id}><small>{p.category}</small><h2>{p[`title_${lang}`]||p.title_fr}</h2><p>{p[`excerpt_${lang}`]||p.excerpt_fr}</p><span>{p.published_at?new Date(p.published_at).toLocaleDateString(lang==='fr'?'fr-FR':'en-GB'):''}</span></a>)}</div></main></Shell>}

export default function CmsSite(){
 const [state,setState]=useState({content:[],config:null})
 const [lang,setLang]=useState(()=>navigator.language?.toLowerCase().startsWith('fr')?'fr':'en')
 const path=window.location.pathname
 useEffect(()=>{let alive=true;const load=()=>fetchPublicContent().then(x=>alive&&setState(x)).catch(console.error);load();const stop=subscribeToCms(load);return()=>{alive=false;stop()}},[])
 if(path==='/gallery')return <Gallery config={state.config} lang={lang} setLang={setLang}/>
 if(path==='/news')return <News items={state.content} config={state.config} lang={lang} setLang={setLang}/>
 const item=state.content.find(x=>x.kind==='page'&&x.slug===path)
 if(path.startsWith('/news/')){const n=state.content.find(x=>x.kind==='news'&&x.slug===path.slice(6));return n?<Page item={n} config={state.config} lang={lang} setLang={setLang}/>:<Page item={{title_fr:'Article introuvable',title_en:'Article not found',body_fr:'Cette publication n’existe pas ou n’est plus publiée.',body_en:'This publication does not exist or is no longer published.'}} config={state.config} lang={lang} setLang={setLang}/>}
 return path==='/'||path==='/index.html'?<Home items={state.content} config={state.config} lang={lang} setLang={setLang}/>:item?<Page item={item} config={state.config} lang={lang} setLang={setLang}/>:<Page item={{title_fr:'Page introuvable',title_en:'Page not found',body_fr:'La page demandée n’est pas disponible.',body_en:'The requested page is not available.'}} config={state.config} lang={lang} setLang={setLang}/>
}
