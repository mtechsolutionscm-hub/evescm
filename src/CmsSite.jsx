import {Fragment,useEffect,useState} from 'react'
import {fetchPublicContent,subscribeToCms,subscribeNewsletter} from './cms'
import './cms-site.css'

const logo='/logo.svg'
const EVES_CONTACT={phone:'+237 694 641 402',whatsapp:'237694641402',email:'contact@eves.cm',address:'Yaoundé, Cameroun'}
const galleryImages=[
 {src:'/media/gallery/image-1.jpeg',alt:'EVES — communautés et jeunesse',caption:'Les communautés, les jeunes et les familles au cœur de l’action EVES.'},
 {src:'/media/gallery/image-2.jpeg',alt:'EVES — action de terrain',caption:'Une action de terrain construite avec les communautés.'},
 {src:'/media/gallery/image-3.jpeg',alt:'EVES — éducation et solidarité',caption:'Éducation, protection et solidarité pour renforcer la résilience.'}
]
const localGalleryMedia=galleryImages.map((x,i)=>({id:`local-${i+1}`,public_url:x.src,alt_fr:x.alt,alt_en:x.alt,caption_fr:x.caption,caption_en:x.caption}))
const allowedGalleryNames=['image-1.jpeg','image-2.jpeg','image-3.jpeg']
function galleryMedia(items){
 const allowed=(items||[]).filter(m=>allowedGalleryNames.includes(String(m.filename||'').toLowerCase())||allowedGalleryNames.some(n=>String(m.public_url||'').toLowerCase().endsWith('/'+n)))
 return allowed.length?allowed:localGalleryMedia
}
const links=[['/about','À propos'],['/causes','Objectifs'],['/projects','Programmes'],['/governance','Gouvernance'],['/advisory','Comité consultatif'],['/focal-points','Points focaux'],['/partners','Partenaires'],['/lab','Le Lab'],['/safehome','Safe Home'],['/resources','Ressources'],['/events','Événements'],['/gallery','Galerie'],['/news','Actualités & Blog'],['/volunteer','Devenir bénévole'],['/join','Nous rejoindre']]
const navGroups=[
 {label:'Organisation',items:[links[0],links[3],links[4],links[5],links[6]]},
 {label:'Action',items:[links[1],links[2],links[7],links[8]]},
 {label:'Ressources',items:[links[9],links[10],links[11],links[12]]}
]
const objectives=[
 {code:'SO1',title_fr:'Scolarisation et réinsertion',title_en:'School enrolment and re-entry',desc_fr:'Accès, maintien et réinsertion scolaire.',desc_en:'Supporting school access, retention and re-entry.',icon:'fa-book-open'},
 {code:'SO2',title_fr:'Résilience climatique et adaptation',title_en:'Climate resilience and adaptation',desc_fr:'Prévention, adaptation et pratiques durables face aux chocs climatiques.',desc_en:'Prevention, adaptation and sustainable practices in response to climate shocks.',icon:'fa-seedling'},
 {code:'SO3',title_fr:'Protection communautaire et VBG',title_en:'Community-based protection and GBV',desc_fr:'Prévention des violences basées sur le genre, protection et autonomisation.',desc_en:'Community-based protection, GBV prevention and empowerment.',icon:'fa-shield-heart'},
 {code:'SO4',title_fr:'Autonomisation socio-économique par l’ESS',title_en:'Socio-economic empowerment through the SSE',desc_fr:'Autonomisation économique, activités génératrices de revenus et économie sociale et solidaire.',desc_en:'Economic empowerment, income-generating activities and the Social and Solidarity Economy.',icon:'fa-handshake-angle'},
 {code:'SO5',title_fr:'Innovation, recherche et plaidoyer',title_en:'Innovation, research and advocacy',desc_fr:'Recherche, innovation, production de connaissances et plaidoyer fondé sur les preuves.',desc_en:'Research, innovation, knowledge production and evidence-based advocacy.',icon:'fa-lightbulb'}
]
function Txt({lang,fr,en}){return lang==='fr'?fr:en}
const iconPaths={
 'fa-book-open':'M3 5.5A2.5 2.5 0 0 1 5.5 3H11v17H5.5A2.5 2.5 0 0 1 3 17.5z M21 5.5A2.5 2.5 0 0 0 18.5 3H13v17h5.5a2.5 2.5 0 0 0 2.5-2.5z',
 'fa-seedling':'M12 21v-7 M12 14C7 14 4 11 4 6c5 0 8 3 8 8z M12 11c0-4 3-7 8-7 0 5-3 8-8 8',
 'fa-shield-heart':'M12 21s8-4 8-10V5l-8-3-8 3v6c0 6 8 10 8 10z M9 9.5c1-2 4-2 6 0 0 2-3 4-3 4s-3-2-3-4z',
 'fa-handshake-angle':'M4 12l4-4 4 3 4-4 4 4-4 4-4-3-4 3z M8 8l2-2 4 3 M12 11l2-2',
 'fa-lightbulb':'M9 18h6 M10 21h4 M8 14a6 6 0 1 1 8 0c-1 1-2 2-2 4h-4c0-2-1-3-2-4z',
 'fa-envelope-open-text':'M3 7l9 6 9-6 M4 5h16v14H4z M8 10h8',
 'fa-arrow-right':'M5 12h14 M13 6l6 6-6 6',
 'fa-location-dot':'M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
 'fa-envelope':'M3 5h18v14H3z M3 6l9 7 9-7',
 'fa-phone':'M6 3l4 2-2 4 4 4 4-2 2 4-2 3c-6 0-12-6-12-12z',
 'fa-house':'M3 11l9-8 9 8 M5 10v10h14V10 M9 20v-6h6v6',
 'fa-chevron-down':'M6 9l6 6 6-6',
 'fa-heart':'M20 8.5c0 5-8 10-8 10S4 13.5 4 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 2.5z',
 'fa-bars':'M4 7h16 M4 12h16 M4 17h16',
 'fa-xmark':'M6 6l12 12 M18 6L6 18',
 'fa-circle':'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z',
 'fa-wand-magic-sparkles':'M4 20L20 4 M8 4v4 M4 8h4 M17 15v5 M14.5 17.5h5 M17 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z',
 'fa-comments':'M4 5h16v11H8l-4 4z M8 9h8 M8 12h5',
 'fa-paper-plane':'M3 11l18-8-8 18-2-7z M11 14l10-11'
}
function I({n}){const d=iconPaths[n]||iconPaths['fa-circle'];return <span className={`cms-icon ${n}`} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg></span>}
const defaultSiteText={fr:{home:'Accueil',organisation:'Organisation',action:'Action',resources:'Ressources',support:'Soutenir',mobile_home:'Accueil',topline:'Action ouverte à toutes et tous',objectives_label:'ODD · 5 OBJECTIFS STRATÉGIQUES',objectives_fallback:'Une stratégie au service de l’inclusion, de la résilience et de la solidarité.',news_label:'NEWSROOM',news_title:'Actualités & perspectives',gallery_label:'GALERIE',gallery_title:'Le terrain en images',gallery_link:'Voir toute la galerie',hero_cta1:'Découvrir EVES',hero_cta2:'Soutenir notre action',newsletter_label:'NEWSLETTER EVES',newsletter_title:'Recevez les nouvelles d’EVES',newsletter_intro:'Actualités, programmes, ressources, opportunités et temps forts directement dans votre boîte mail.',newsletter_placeholder:'Votre adresse email',newsletter_button:'S’inscrire',newsletter_success:'Merci. Votre inscription est confirmée.',newsletter_exists:'Cette adresse est déjà inscrite.',newsletter_error:'Inscription impossible pour le moment. Réessayez.',gallery_page_label:'EVES · GALERIE',gallery_page_title:'Le terrain, les équipes et les communautés.',gallery_page_intro:'Des images authentiques pour raconter l’engagement d’EVES et les personnes au cœur de nos programmes.',news_page_label:'EVES NEWSROOM',news_page_title:'Actualités, analyses et terrain.',news_page_intro:'Avancées institutionnelles, programmes, partenariats et résultats.',read_more:'Lire',footer_contact:'Contact professionnel',footer_support:'Soutenir EVES',credit:'EVES · MTECHsolutions',not_found_title:'Page introuvable',not_found_body:'La page demandée n’est pas disponible.',article_not_found_title:'Article introuvable',article_not_found_body:'Cette publication n’existe pas ou n’est plus publiée.'},en:{home:'Home',organisation:'Organisation',action:'Action',resources:'Resources',support:'Support',mobile_home:'Home',topline:'Open action for all',objectives_label:'SDGs · 5 STRATEGIC OBJECTIVES',objectives_fallback:'A strategy serving inclusion, resilience and solidarity.',news_label:'NEWSROOM',news_title:'News & perspectives',gallery_label:'GALLERY',gallery_title:'Field work in images',gallery_link:'View the full gallery',hero_cta1:'Discover EVES',hero_cta2:'Support our action',newsletter_label:'EVES NEWSLETTER',newsletter_title:'Stay connected with EVES',newsletter_intro:'News, programmes, resources, opportunities and highlights delivered to your inbox.',newsletter_placeholder:'Your email address',newsletter_button:'Subscribe',newsletter_success:'Thank you. Your subscription is confirmed.',newsletter_exists:'This email is already subscribed.',newsletter_error:'Subscription failed. Please try again.',gallery_page_label:'EVES · GALLERY',gallery_page_title:'Field work, teams and communities.',gallery_page_intro:'Authentic images telling the EVES story and highlighting the people at the heart of our programmes.',news_page_label:'EVES NEWSROOM',news_page_title:'News, analysis and field stories.',news_page_intro:'Institutional progress, programmes, partnerships and results.',read_more:'Read',footer_contact:'Professional contact',footer_support:'Support EVES',credit:'EVES · MTECHsolutions',not_found_title:'Page not found',not_found_body:'The requested page is not available.',article_not_found_title:'Article not found',article_not_found_body:'This publication does not exist or is no longer published.'}}
const siteText=(config,lang)=>({...defaultSiteText[lang],...(config?.metadata?.site_text?.[lang]||{})})
const siteGlobal=(config,lang)=>{const g=config?.metadata?.global||{};const fr=lang==='fr';return {site_name:g.site_name||'EVES',top:fr?(g.top_fr||g.top||'Action ouverte à toutes et tous'):(g.top_en||g.top||'Open action for all'),email:g.email||'contact@eves.cm',phone:g.phone||EVES_CONTACT.phone,whatsapp:g.whatsapp||EVES_CONTACT.whatsapp,address:fr?(g.address_fr||g.address||EVES_CONTACT.address):(g.address_en||g.address||'Yaoundé, Cameroon'),footer:fr?(g.footer_fr||g.footer||'EVES agit pour des communautés plus inclusives, résilientes et solidaires.'):(g.footer_en||g.footer||'EVES works for more inclusive, resilient and caring communities.'),developer_name:g.developer_name||'MTECHsolutions',developer_phone:g.developer_phone||'237656987759',developer_message:fr?(g.developer_message_fr||g.developer_message||'Bonjour MTECHsolutions, je souhaite demander un devis pour une modification ou un projet web pour EVES.'):(g.developer_message_en||g.developer_message||'Hello MTECHsolutions, I would like to request a quote for a website modification or web project for EVES.')};}


function Newsletter({lang,compact=false,section,config,id}){
 const text=siteText(config,lang); const [email,setEmail]=useState('')
 const [state,setState]=useState('idle')
 async function submit(e){
  e.preventDefault()
  if(!email.trim()) return
  setState('loading')
  let error=null;try{const result=await subscribeNewsletter(email.trim().toLowerCase(),lang);if(result?.exists){setState('exists');return}}catch(e){error=e}
  if(error){setState('error');return}
  setEmail('');setState('success')
 }
 return <section id={id} className={compact?'cms-newsletter cms-newsletter-compact':'cms-newsletter'}><div><span><I n="fa-envelope-open-text"/> {text.newsletter_label}</span><h2>{section?.[lang==="fr"?"title_fr":"title_en"]||<Txt lang={lang} fr={text.newsletter_title} en={text.newsletter_title}/>}</h2><p>{section?.[lang==="fr"?"intro_fr":"intro_en"]||<Txt lang={lang} fr={text.newsletter_intro} en={text.newsletter_intro}/>}</p></div><form onSubmit={submit}><label className="sr-only" htmlFor="newsletter-email">Email</label><input id="newsletter-email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder={text.newsletter_placeholder}/><button disabled={state==='loading'}>{state==='loading'?'...':<><Txt lang={lang} fr={text.newsletter_button} en={text.newsletter_button}/> <I n="fa-arrow-right"/></>}</button>{state==='success'&&<small className="form-ok"><Txt lang={lang} fr={text.newsletter_success} en={text.newsletter_success}/></small>}{state==='exists'&&<small className="form-ok"><Txt lang={lang} fr={text.newsletter_exists} en={text.newsletter_exists}/></small>}{state==='error'&&<small className="form-error"><Txt lang={lang} fr={text.newsletter_error} en={text.newsletter_error}/></small>}</form></section>
}

function Shell({children,lang,setLang,config,navigation=[],sections=[],showNewsletter=true}){
 const [open,setOpen]=useState(false)
 const [expanded,setExpanded]=useState(null)
 const text=siteText(config,lang)
 const global=siteGlobal(config,lang)
 const address=global.address
 const fallbackNav=[{id:'home',href:'/',label_fr:'Accueil',label_en:'Home',parent_key:'',sort_order:10,visible:true},...links.map(([href,label],i)=>({id:String(i),href,label_fr:label,label_en:label,parent_key:i<=4?'organisation':i<=8?'action':i>=13?'soutenir':'ressources',sort_order:20+i*10,visible:true})),{id:'support',href:'/donate',label_fr:'Soutenir',label_en:'Support',parent_key:'soutenir',sort_order:200,visible:true}]
 const navItems=navigation.length?navigation:fallbackNav
 const grouped=[[text.organisation,'organisation'],[text.action,'action'],[text.resources,'ressources']].map(([label,key])=>({label,items:navItems.filter(x=>x.parent_key===key&&x.visible!==false)}))
 const menuLinks=links.concat([['/donate','Soutenir']])
 const toggleGroup=(label)=>setExpanded(x=>x===label?null:label)
 const newsletterSection=sections.find(x=>x.section_key==='newsletter')
 return <div className="cms-shell">
  <div className="cms-top"><span>{address} · {global.top||text.topline}</span><span><a href={`mailto:${global.email}`}>{global.email}</a><a href={`tel:${global.phone}`}>{global.phone}</a></span></div>
  <header className="cms-header">
   <a href="/" className="cms-logo"><img src={config?.logo_url||logo} alt="Logo officiel EVES"/></a>
   <nav className="cms-desktop-nav" aria-label={text.home}>
    <a href="/">{text.home}</a>
    {grouped.map(group=><div className="cms-nav-dropdown" key={group.label}><button type="button">{group.label} <span className="cms-chevron" aria-hidden="true"></span></button><div className="cms-nav-menu">{group.items.map(item=><a href={item.href} key={item.id}>{lang==='fr'?item.label_fr:item.label_en}</a>)}</div></div>)}
    <div className="cms-nav-dropdown cms-support-group"><button type="button" className="cms-support"><Txt lang={lang} fr={text.support} en={text.support}/> <span className="cms-chevron" aria-hidden="true"></span></button><div className="cms-nav-menu">{navItems.filter(x=>x.parent_key==='soutenir'&&x.visible!==false).map(item=><a href={item.href} key={item.id}>{lang==='fr'?item.label_fr:item.label_en}</a>)}</div></div>
    <button className="cms-lang" onClick={()=>setLang(lang==='fr'?'en':'fr')} aria-label="Changer de langue">{lang.toUpperCase()}</button>
   </nav>
   <button className="cms-menu" onClick={()=>setOpen(true)} aria-label="Ouvrir le menu"><span className="cms-menu-lines" aria-hidden="true"><b></b><b></b><b></b></span></button>
  </header>
  {open&&<><div className="cms-backdrop" onClick={()=>setOpen(false)}/><aside className="cms-drawer" aria-label="Menu mobile">
   <div className="cms-drawer-head"><img src={config?.logo_url||logo} alt="Logo officiel EVES"/><button onClick={()=>setOpen(false)} aria-label="Fermer"><span className="cms-close-mark" aria-hidden="true">×</span></button></div>
   <a href="/" onClick={()=>setOpen(false)} className="cms-mobile-home">{text.mobile_home}</a>
   {grouped.map(group=><div className="cms-mobile-group" key={group.label}>
    <button type="button" className={expanded===group.label?'open':''} onClick={()=>toggleGroup(group.label)}>{group.label}<span className="cms-chevron" aria-hidden="true"></span></button>
    {expanded===group.label&&<div className="cms-mobile-submenu">{group.items.map(item=><a href={item.href} key={item.id} onClick={()=>setOpen(false)}>{lang==='fr'?item.label_fr:item.label_en}</a>)}</div>}
   </div>)}
   <div className="cms-mobile-group mobile-support-group"><button type="button" className={expanded==='soutenir'?'open':''} onClick={()=>toggleGroup('soutenir')}><Txt lang={lang} fr={text.support} en={text.support}/><span className="cms-chevron" aria-hidden="true"></span></button>{expanded==='soutenir'&&<div className="cms-mobile-submenu">{navItems.filter(x=>x.parent_key==='soutenir'&&x.visible!==false).map(item=><a href={item.href} key={item.id} onClick={()=>setOpen(false)}>{lang==='fr'?item.label_fr:item.label_en}</a>)}</div>}</div>
   <button className="cms-mobile-lang" onClick={()=>{setLang(lang==='fr'?'en':'fr');setOpen(false)}}>{lang==='fr'?'English':'Français'}</button>
  </aside></>}
  {children}
  {showNewsletter&&newsletterSection?.visible!==false&&<Newsletter lang={lang} compact section={newsletterSection} config={config}/>} 
  <EvesAI lang={lang}/><footer className="cms-footer"><div><img src={config?.logo_url||logo} alt="Logo officiel EVES"/><p>{config?.[lang==='fr'?'footer_description_fr':'footer_description_en']||<Txt lang={lang} fr="Objectifs de développement durable & solidarité internationale. EVES agit pour des communautés plus inclusives, résilientes et solidaires." en="Sustainable Development Goals & international solidarity. EVES works for more inclusive, resilient and caring communities."/>}</p></div><div><h4>EVES</h4>{navItems.slice(0,7).map(item=><a href={item.href} key={item.id}>{lang==='fr'?item.label_fr:item.label_en}</a>)}</div><div><h4><Txt lang={lang} fr={text.footer_contact} en={text.footer_contact}/></h4><a href={`mailto:${EVES_CONTACT.email}`}>{EVES_CONTACT.email}</a><a href={`tel:${EVES_CONTACT.phone}`}>{EVES_CONTACT.phone}</a><p>{address}</p><a href={`https://wa.me/${String(global.whatsapp).replace(/\D/g,'')}`} target="_blank" rel="noreferrer">WhatsApp</a><a className="cms-footer-donate" href="/donate"><Txt lang={lang} fr={text.footer_support} en={text.footer_support}/></a></div></footer>
  <div className="cms-credit"><span>{text.credit}</span><a href={`https://wa.me/${String(global.developer_phone||'237656987759').replace(/\D/g,'')}?text=${encodeURIComponent(global.developer_message||'Hello MTECHsolutions, I would like to request a quote for an EVES website project.')}`} target="_blank" rel="noreferrer" title={lang==='fr'?'Demander un devis à MTECHsolutions':'Request a quote from MTECHsolutions'}>{lang==='fr'?'Développé par':'Developed by'} <strong>{global.developer_name||'MTECHsolutions'}</strong></a></div>
 </div>
}
function InstitutionalBridge({section,lang}){if(!section||section.visible===false)return null;const d=section.data||{};const fr=lang==='fr';return <section className="institutional-bridge"><div className="institutional-bridge-copy"><span>{section[fr?'title_fr':'title_en']||''}</span><h2>{d[fr?'headline_fr':'headline_en']||''}</h2><p>{section[fr?'intro_fr':'intro_en']||''}</p></div><div className="institutional-bridge-flow">{(d.steps||[]).map((x,i)=><Fragment key={i}><b>{x[fr?'fr':'en']||''}</b>{i<(d.steps||[]).length-1&&<i>→</i>}</Fragment>)}</div></section>}
function Home({pages,news,media,sections,navigation,config,lang,setLang}){
 const text=siteText(config,lang)
 const home=pages.find(x=>x.slug==='/')
 const posts=news.slice(0,3)
 const hero=sections.find(x=>x.section_key==='hero')
 const objectivesSection=sections.find(x=>x.section_key==='objectives')
 const gallerySection=sections.find(x=>x.section_key==='gallery')
 const theorySection=sections.find(x=>x.section_key==='theory')
 const institutionalSection=sections.find(x=>x.section_key==='institutional_bridge')
 const title=hero?.[lang==='fr'?'title_fr':'title_en']||'Ensemble, construisons un avenir plus inclusif et durable.'
 const body=hero?.[lang==='fr'?'intro_fr':'intro_en']||'EVES accompagne les enfants, les jeunes et leurs familles les plus vulnérables à travers les Objectifs de développement durable et la solidarité internationale.'
 const words=lang==='fr'?['Éduquer','Protéger','Agir']:['Educate','Protect','Act']
 return <Shell {...{lang,setLang,config,navigation,sections}}>
  <section className="cms-hero cms-hero-editorial">
   <div className="cms-hero-watermark"><img src={config?.logo_url||logo} alt="" aria-hidden="true"/></div>
   <div className="cms-hero-wordstack" aria-hidden="true">{words.map((word,i)=><span key={i}>{word}</span>)}</div>
   <div className="cms-hero-panel">
    <span className="cms-hero-kicker">{hero?.data?.[lang==='fr'?'eyebrow_fr':'eyebrow_en']||'ODD · OBJECTIFS DE DÉVELOPPEMENT DURABLE & SOLIDARITÉ INTERNATIONALE'}</span>
    <h1>{home?.metadata?.[lang==='fr'?'hero_title_fr':'hero_title_en']||title}</h1>
    <p>{home?.[`body_${lang}`]||body}</p>
    <div className="cms-hero-actions">
      <a href={hero?.data?.cta1_href||"/about"} className="cms-btn">{hero?.data?.[lang==="fr"?"cta1_fr":"cta1_en"]||text.hero_cta1} <I n="fa-arrow-right"/></a>
      <a href={hero?.data?.cta2_href||"/donate"} className="cms-btn outline">{hero?.data?.[lang==="fr"?"cta2_fr":"cta2_en"]||text.hero_cta2}</a>
    </div>
   </div>
  </section>
 {theorySection?.visible!==false&&<section className="cms-theory"><div className="cms-theory-brand"><img src={config?.logo_url||logo} alt="Logo officiel EVES"/></div><div className="cms-theory-copy"><span>{theorySection?.[lang==="fr"?"title_fr":"title_en"]||''}</span><h2>{theorySection?.data?.[lang==="fr"?"headline_fr":"headline_en"]||''}</h2><p>{theorySection?.[lang==="fr"?"intro_fr":"intro_en"]||''}</p></div><div className="cms-theory-flow">{(theorySection?.data?.steps||[]).map((x,i)=><Fragment key={i}><div><strong>{String(i+1).padStart(2,'0')}</strong><b>{x[lang==="fr"?"title_fr":"title_en"]||''}</b><span>{x[lang==="fr"?"desc_fr":"desc_en"]||''}</span></div>{i<(theorySection.data.steps.length-1)&&<i>→</i>}</Fragment>)}</div></section>}
  {institutionalSection?.visible!==false&&<InstitutionalBridge section={institutionalSection} lang={lang}/>} 
  {objectivesSection?.visible!==false&&<section className="cms-section"><div className="cms-heading"><span>{text.objectives_label}</span><h2>{objectivesSection?.[lang==="fr"?"title_fr":"title_en"]||text.objectives_fallback}</h2><p>{objectivesSection?.[lang==="fr"?"intro_fr":"intro_en"]}</p></div><div className="obj-grid">{(objectivesSection?.data?.items||objectives).map((o,i)=>{const code=o.code||"OS"+(i+1),title=o[lang==="fr"?"title_fr":"title_en"],desc=o[lang==="fr"?"desc_fr":"desc_en"],icon=o.icon||"fa-circle";return <article key={code}><I n={icon}/><small>{code}</small><h3>{title}</h3><p>{desc}</p><a href="/causes" aria-label={`${text.hero_cta1} ${code}`}><I n="fa-arrow-right"/></a></article>})}</div></section>}
  {(sections.find(x=>x.section_key==='newsroom')?.visible!==false)&&<section className="cms-section cms-newsroom"><div className="cms-heading cms-newsroom-heading"><span>{text.news_label}</span><h2>{text.news_title}</h2><p>{lang==='fr'?'Programmes, partenariats, publications et histoires de terrain.':'Programmes, partnerships, publications and field stories.'}</p></div>{posts.length>0?<div className="news-editorial-grid">{posts.map((p,i)=><a href={`/news/${p.slug}`} className={`news-card ${i===0?'news-card-featured':''}`} key={p.id}>{p.featured_image&&<div className="news-card-image"><img src={p.featured_image} alt=""/></div>}<div className="news-card-body"><div className="news-meta"><small>{p.category||'EVES'}</small><span>{p.published_at?new Date(p.published_at).toLocaleDateString(lang==='fr'?'fr-FR':'en-GB'):''}</span></div><h3>{p[`title_${lang}`]||p.title_fr}</h3><p>{p[`excerpt_${lang}`]||p.excerpt_fr}</p><span className="news-read">{text.read_more} <I n="fa-arrow-right"/></span></div></a>)}</div>:<div className="news-empty news-empty-editorial"><div className="news-empty-index">01</div><div className="news-empty-copy"><small>{text.news_label}</small><h3>{lang==='fr'?'La newsroom EVES se prépare.':'The EVES newsroom is being prepared.'}</h3><p>{lang==='fr'?'Les prochaines publications institutionnelles, actualités de programmes et histoires de terrain seront publiées ici.':'Institutional updates, programme news and field stories will be published here.'}</p></div><a href="#newsletter" className="cms-text-link">{lang==='fr'?'Recevoir les nouvelles':'Stay connected'} <I n="fa-arrow-right"/></a></div>}</section>}
  {gallerySection?.visible!==false&&<section className="cms-section cms-home-gallery"><div className="cms-heading"><span>{text.gallery_label}</span><h2>{gallerySection?.[lang==="fr"?"title_fr":"title_en"]||text.gallery_title}</h2><p>{gallerySection?.[lang==="fr"?"intro_fr":"intro_en"]}</p></div><div className="gallery-strip">{(gallerySection?.data?.media_ids?.length?gallerySection.data.media_ids.map(id=>media.find(m=>m.id===id)).filter(image=>image&&allowedGalleryNames.some(n=>String(image.filename||'').toLowerCase()===n)):galleryMedia(media)).slice(0,3).map(image=><a href="/gallery" key={image.id||image.public_url}><img src={image.public_url||image.src} alt={image[lang==="fr"?"alt_fr":"alt_en"]||image.alt||""}/></a>)}</div><a className="cms-text-link" href="/gallery"><Txt lang={lang} fr={text.gallery_link} en={text.gallery_link}/> <I n="fa-arrow-right"/></a></section>}
 </Shell>
}
function Gallery({media,navigation,sections,config,lang,setLang}){
 const text=siteText(config,lang)
 return <Shell {...{config,lang,setLang,navigation,sections}}><main className="cms-page"><div className="cms-page-hero"><span>{text.gallery_page_label}</span><h1>{text.gallery_page_title}</h1><p>{text.gallery_page_intro}</p></div><section className="cms-section"><div className="gallery-grid">{galleryMedia(media).slice(0,3).map((image,i)=><figure key={image.id}><img src={image.public_url} alt={image[lang==='fr'?'alt_fr':'alt_en']||image.alt_fr}/><figcaption><strong>0{i+1}</strong><span>{image[lang==='fr'?'caption_fr':'caption_en']||image.caption_fr}</span></figcaption></figure>)}</div></section></main></Shell>
}

function EvesAI({lang}){const[open,setOpen]=useState(false),[input,setInput]=useState(''),[busy,setBusy]=useState(false),[messages,setMessages]=useState([]);async function ask(){const q=input.trim();if(!q||busy)return;setMessages(m=>[...m,{role:'user',text:q}]);setInput('');setBusy(true);try{const r=await fetch('/api/ai-public',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q,lang})});const j=await r.json();if(!r.ok)throw Error(j.error||'EVES AI unavailable');setMessages(m=>[...m,{role:'ai',text:j.answer||''}])}catch(e){setMessages(m=>[...m,{role:'ai',text:lang==='fr'?'EVES AI est temporairement indisponible.':'EVES AI is temporarily unavailable.'}])}finally{setBusy(false)}}return <><button className="eves-ai-fab" onClick={()=>setOpen(true)} aria-label="EVES AI"><I n="fa-wand-magic-sparkles"/><span>EVES AI</span></button>{open&&<div className="eves-ai-panel"><div className="eves-ai-head"><div><b>EVES AI</b><small>{lang==='fr'?'Assistant officiel EVES':'Official EVES assistant'}</small></div><button onClick={()=>setOpen(false)} aria-label="Close"><span className="cms-close-mark" aria-hidden="true">×</span></button></div><div className="eves-ai-messages">{messages.length===0&&<div className="eves-ai-welcome"><I n="fa-comments"/><b>{lang==='fr'?'Comment pouvons-nous vous aider ?':'How can we help you?'}</b><p>{lang==='fr'?'Posez une question sur EVES, nos objectifs, programmes, actualités ou comment nous contacter.':'Ask about EVES, our objectives, programmes, news or how to contact us.'}</p></div>}{messages.map((m,i)=><div className={'eves-ai-msg '+m.role} key={i}><span>{m.role==='user'?(lang==='fr'?'Vous':'You'):'EVES AI'}</span><p>{m.text}</p></div>)}{busy&&<div className="eves-ai-msg ai"><span>EVES AI</span><p>…</p></div>}</div><form onSubmit={e=>{e.preventDefault();ask()}} className="eves-ai-compose"><input value={input} onChange={e=>setInput(e.target.value)} placeholder={lang==='fr'?'Votre question…':'Your question…'} maxLength={1200}/><button disabled={busy||!input.trim()}><I n="fa-paper-plane"/></button></form></div>}</>}

function safeHtml(input=''){if(typeof document==='undefined')return input;const box=document.createElement('div');box.innerHTML=String(input);const allowed=['P','BR','STRONG','EM','U','H2','H3','H4','UL','OL','LI','BLOCKQUOTE','A'];box.querySelectorAll('*').forEach(el=>{if(!allowed.includes(el.tagName)){el.replaceWith(...Array.from(el.childNodes));return}Array.from(el.attributes).forEach(a=>{if(el.tagName==='A'&&a.name==='href'&&/^(https?:|mailto:|tel|\/)/i.test(a.value))return;el.removeAttribute(a.name)})});return box.innerHTML}
function BlockRenderer({blocks,media,lang}){return <div className="cms-content-blocks">{(blocks||[]).filter(b=>b.visible!==false).map((b,i)=>{const x=lang==='fr'?(b.fr||{}):(b.en||{});if(b.type==='richtext')return <section className="content-block richtext-block" key={b.id||i}><h2>{x.title}</h2>{(x.body||'').split('\n').filter(Boolean).map((p,j)=><p key={j}>{p}</p>)}</section>;if(b.type==='image'){const m=(media||[]).find(y=>y.id===b.media_id);return m?<figure className="content-block image-block" key={b.id||i}><img src={m.public_url} alt={m[lang==='fr'?'alt_fr':'alt_en']||m.alt_fr||m.filename}/>{(m[lang==='fr'?'caption_fr':'caption_en']||m.caption_fr)&&<figcaption>{m[lang==='fr'?'caption_fr':'caption_en']||m.caption_fr}</figcaption>}</figure>:null}if(b.type==='cta')return <section className="content-block cta-block" key={b.id||i}><div><h2>{x.label}</h2><p>{x.body}</p></div><a href={b.href||'/donate'}>{x.button||b.button||(lang==='fr'?'Découvrir':'Discover')} <I n="fa-arrow-right"/></a></section>;if(b.type==='quote')return <blockquote className="content-block quote-block" key={b.id||i}><p>“{x.body}”</p><cite>{x.author}</cite></blockquote>;if(b.type==='stats')return <section className="content-block stats-block" key={b.id||i}>{(x.items||[]).map((s,j)=><div key={j}><strong>{s.value||''}</strong><span>{s.label||''}</span></div>)}</section>;if(b.type==='cards')return <section className="content-block cards-block" key={b.id||i}>{(x.items||[]).map((card,j)=><article key={j}><span>{card.kicker||''}</span><h3>{card.title||''}</h3><p>{card.body||''}</p>{card.href&&<a href={card.href}>{card.link||'→'}</a>}</article>)}</section>;if(b.type==='spacer')return <div className="content-block spacer-block" style={{height:b.height||'80px'}} key={b.id||i}/>;return null})}</div>}
function Page({item,media,navigation,sections,config,lang,setLang}){const blocks=item.metadata?.blocks||[];const bridge=sections.find(x=>x.page_slug===item.slug&&x.section_key==='institutional_bridge');const body=item[`body_${lang}`]||item.body_fr||'';return <Shell {...{config,lang,setLang,navigation,sections}}><main className="cms-page"><div className="cms-page-hero"><span>{item.category||'EVES'}</span><h1>{item[`title_${lang}`]||item.title_fr}</h1><p>{item[`excerpt_${lang}`]||item.excerpt_fr}</p></div><InstitutionalBridge section={bridge} lang={lang}/><article>{blocks.length?<BlockRenderer blocks={blocks} media={media} lang={lang}/>:<div className="cms-rich-body" dangerouslySetInnerHTML={{__html:safeHtml(body.replace(/\n/g,'<br/>'))}}/>}</article></main></Shell>}

function News({news,navigation,sections,config,lang,setLang}){const text=siteText(config,lang);const posts=news;const newsletterSection=sections.find(x=>x.section_key==='newsletter');return <Shell {...{config,lang,setLang,navigation,sections,showNewsletter:false}}><main className="cms-page"><div className="cms-page-hero"><span>{text.news_page_label}</span><h1>{text.news_page_title}</h1><p>{text.news_page_intro}</p></div><div className="news-editorial-grid news-editorial-page">{posts.length>0?posts.map((p,i)=><a href={`/news/${p.slug}`} className={`news-card ${i===0?'news-card-featured':''}`} key={p.id}>{p.featured_image&&<div className="news-card-image"><img src={p.featured_image} alt=""/></div>}<div className="news-card-body"><div className="news-meta"><small>{p.category||'EVES'}</small><span>{p.published_at?new Date(p.published_at).toLocaleDateString(lang==='fr'?'fr-FR':'en-GB'):''}</span></div><h2>{p[`title_${lang}`]||p.title_fr}</h2><p>{p[`excerpt_${lang}`]||p.excerpt_fr}</p><span className="news-read">{text.read_more} <I n="fa-arrow-right"/></span></div></a>):<div className="news-empty news-empty-page news-empty-editorial"><div className="news-empty-index">01</div><div className="news-empty-copy"><small>{text.news_page_label}</small><h2>{lang==='fr'?'Aucune actualité publiée pour le moment.':'No stories have been published yet.'}</h2><p>{lang==='fr'?'La newsroom sera mise à jour avec les prochaines avancées, publications et histoires de terrain d’EVES.':'The newsroom will be updated with EVES programme updates, publications and field stories.'}</p></div></div>}</div><Newsletter id="newsletter" lang={lang} section={newsletterSection} config={config}/></main></Shell>}

export default function CmsSite(){
 const [state,setState]=useState({pages:[],news:[],media:[],sections:[],navigation:[],config:null})
 const [lang,setLang]=useState(()=>navigator.language?.toLowerCase().startsWith('fr')?'fr':'en')
 const path=((window.location.pathname||'/').replace(/\/+$/,'')||'/')
 useEffect(()=>{let alive=true;const load=()=>fetchPublicContent().then(x=>alive&&setState(x)).catch(console.error);load();const stop=subscribeToCms(load);return()=>{alive=false;stop()}},[])
 if(path==='/gallery')return <Gallery media={state.media} navigation={state.navigation} sections={state.sections} config={state.config} lang={lang} setLang={setLang}/>
 if(path==='/news')return <News news={state.news} navigation={state.navigation} sections={state.sections} config={state.config} lang={lang} setLang={setLang}/>
 const item=state.pages.find(x=>x.slug===path)
 if(path.startsWith('/news/')){const n=state.news.find(x=>x.slug===path.slice(6));const text=siteText(state.config,lang);return n?<Page item={n} media={state.media} navigation={state.navigation} sections={state.sections} config={state.config} lang={lang} setLang={setLang}/>:<Page item={{title_fr:text.article_not_found_title,title_en:text.article_not_found_title,body_fr:text.article_not_found_body,body_en:text.article_not_found_body}} config={state.config} lang={lang} setLang={setLang}/>}
 const text=siteText(state.config,lang);return path==='/'||path==='/index.html'?<Home pages={state.pages} news={state.news} media={state.media} sections={state.sections} navigation={state.navigation} config={state.config} lang={lang} setLang={setLang}/>:item?<Page item={item} media={state.media} navigation={state.navigation} sections={state.sections} config={state.config} lang={lang} setLang={setLang}/>:<Page item={{title_fr:text.not_found_title,title_en:text.not_found_title,body_fr:text.not_found_body,body_en:text.not_found_body}} config={state.config} lang={lang} setLang={setLang}/>
}
