import {useEffect,useState} from 'react'
import {BookOpen,Sprout,ShieldHeart,Handshake,Lightbulb,MailOpen,ArrowRight,MapPin,Mail,Phone,House,ChevronDown,Heart,Menu,X,Circle,WandSparkles,MessageCircle,Send} from 'lucide-react'
import {fetchPublicContent,subscribeToCms,subscribeNewsletter} from './cms'
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
const iconMap={
 'fa-book-open':BookOpen,'fa-seedling':Sprout,'fa-shield-heart':ShieldHeart,'fa-handshake-angle':Handshake,
 'fa-lightbulb':Lightbulb,'fa-envelope-open-text':MailOpen,'fa-arrow-right':ArrowRight,'fa-location-dot':MapPin,
 'fa-envelope':Mail,'fa-phone':Phone,'fa-house':House,'fa-chevron-down':ChevronDown,'fa-heart':Heart,
 'fa-bars':Menu,'fa-xmark':X,'fa-circle':Circle,'fa-wand-magic-sparkles':WandSparkles,'fa-comments':MessageCircle,
 'fa-paper-plane':Send
}
function I({n}){const Icon=iconMap[n]||Circle;return <i className={`fa-solid ${n} cms-icon`} aria-hidden="true"><Icon size="1em" strokeWidth={1.8}/></i>}
const defaultSiteText={fr:{home:'Accueil',organisation:'Organisation',action:'Action',resources:'Ressources',support:'Soutenir',mobile_home:'Accueil',topline:'Action ouverte à toutes et tous',objectives_label:'ODD · 5 OBJECTIFS SPÉCIFIQUES',objectives_fallback:'Une stratégie au service de l’inclusion, de la résilience et de la solidarité.',news_label:'NEWSROOM',news_title:'Actualités & perspectives',gallery_label:'GALERIE',gallery_title:'Le terrain en images',gallery_link:'Voir toute la galerie',hero_cta1:'Découvrir EVES',hero_cta2:'Soutenir notre action',newsletter_label:'NEWSLETTER EVES',newsletter_title:'Recevez les nouvelles d’EVES',newsletter_intro:'Actualités, programmes, ressources, opportunités et temps forts directement dans votre boîte mail.',newsletter_placeholder:'Votre adresse email',newsletter_button:'S’inscrire',newsletter_success:'Merci. Votre inscription est confirmée.',newsletter_exists:'Cette adresse est déjà inscrite.',newsletter_error:'Inscription impossible pour le moment. Réessayez.',gallery_page_label:'EVES · GALERIE',gallery_page_title:'Le terrain, les équipes et les communautés.',gallery_page_intro:'Des images authentiques pour raconter l’engagement d’EVES et les personnes au cœur de nos programmes.',news_page_label:'EVES NEWSROOM',news_page_title:'Actualités, analyses et terrain.',news_page_intro:'Avancées institutionnelles, programmes, partenariats et résultats.',read_more:'Lire',footer_contact:'Contact professionnel',footer_support:'Soutenir EVES',credit:'EVES · MTECHsolutions',not_found_title:'Page introuvable',not_found_body:'La page demandée n’est pas disponible.',article_not_found_title:'Article introuvable',article_not_found_body:'Cette publication n’existe pas ou n’est plus publiée.'},en:{home:'Home',organisation:'Organisation',action:'Action',resources:'Resources',support:'Support',mobile_home:'Home',topline:'Open action for all',objectives_label:'SDGs · 5 SPECIFIC OBJECTIVES',objectives_fallback:'A strategy serving inclusion, resilience and solidarity.',news_label:'NEWSROOM',news_title:'News & perspectives',gallery_label:'GALLERY',gallery_title:'Field work in images',gallery_link:'View the full gallery',hero_cta1:'Discover EVES',hero_cta2:'Support our action',newsletter_label:'EVES NEWSLETTER',newsletter_title:'Stay connected with EVES',newsletter_intro:'News, programmes, resources, opportunities and highlights delivered to your inbox.',newsletter_placeholder:'Your email address',newsletter_button:'Subscribe',newsletter_success:'Thank you. Your subscription is confirmed.',newsletter_exists:'This email is already subscribed.',newsletter_error:'Subscription failed. Please try again.',gallery_page_label:'EVES · GALLERY',gallery_page_title:'Field work, teams and communities.',gallery_page_intro:'Authentic images telling the EVES story and highlighting the people at the heart of our programmes.',news_page_label:'EVES NEWSROOM',news_page_title:'News, analysis and field stories.',news_page_intro:'Institutional progress, programmes, partnerships and results.',read_more:'Read',footer_contact:'Professional contact',footer_support:'Support EVES',credit:'EVES · MTECHsolutions',not_found_title:'Page not found',not_found_body:'The requested page is not available.',article_not_found_title:'Article not found',article_not_found_body:'This publication does not exist or is no longer published.'}}
const siteText=(config,lang)=>({...defaultSiteText[lang],...(config?.metadata?.site_text?.[lang]||{})})


function Newsletter({lang,compact=false,section,config}){
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
 return <section className={compact?'cms-newsletter cms-newsletter-compact':'cms-newsletter'}><div><span><i className="fa-solid fa-envelope-open-text"/> {text.newsletter_label}</span><h2>{section?.[lang==="fr"?"title_fr":"title_en"]||<Txt lang={lang} fr={text.newsletter_title} en={text.newsletter_title}/>}</h2><p>{section?.[lang==="fr"?"intro_fr":"intro_en"]||<Txt lang={lang} fr={text.newsletter_intro} en={text.newsletter_intro}/>}</p></div><form onSubmit={submit}><label className="sr-only" htmlFor="newsletter-email">Email</label><input id="newsletter-email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder={text.newsletter_placeholder}/><button disabled={state==='loading'}>{state==='loading'?'...':<><Txt lang={lang} fr={text.newsletter_button} en={text.newsletter_button}/> <i className="fa-solid fa-arrow-right"/></>}</button>{state==='success'&&<small className="form-ok"><Txt lang={lang} fr={text.newsletter_success} en={text.newsletter_success}/></small>}{state==='exists'&&<small className="form-ok"><Txt lang={lang} fr={text.newsletter_exists} en={text.newsletter_exists}/></small>}{state==='error'&&<small className="form-error"><Txt lang={lang} fr={text.newsletter_error} en={text.newsletter_error}/></small>}</form></section>
}

function Shell({children,lang,setLang,config,navigation=[],sections=[],showNewsletter=true}){
 const [open,setOpen]=useState(false)
 const [expanded,setExpanded]=useState(null)
 const text=siteText(config,lang)
 const address=config?.address||'Yaoundé, Cameroun'
 const navItems=navigation.length?navigation:links.map(([href,label],i)=>({id:String(i),href,label_fr:label,label_en:label,parent_key:i<4?'organisation':i<6?'action':'ressources',visible:true}))
 const grouped=[[text.organisation,'organisation'],[text.action,'action'],[text.resources,'ressources']].map(([label,key])=>({label,items:navItems.filter(x=>x.parent_key===key)}))
 const menuLinks=links.concat([['/donate','Soutenir']])
 const toggleGroup=(label)=>setExpanded(x=>x===label?null:label)
 const newsletterSection=sections.find(x=>x.section_key==='newsletter')
 return <div className="cms-shell">
  <div className="cms-top"><span><i className="fa-solid fa-location-dot"/> {address} · {text.topline}</span><span><a href={`mailto:${config?.contact_email||'contact@eves.cm'}`}><i className="fa-solid fa-envelope"/> {config?.contact_email||'contact@eves.cm'}</a><a href={`tel:${config?.phone||'+237 656 987 759'}`}><i className="fa-solid fa-phone"/> {config?.phone||'+237 656 987 759'}</a></span></div>
  <header className="cms-header">
   <a href="/" className="cms-logo"><img src={config?.logo_url||logo} alt="Logo officiel EVES"/></a>
   <nav className="cms-desktop-nav" aria-label={text.home}>
    <a href="/"><i className="fa-solid fa-house"/> {text.home}</a>
    {grouped.map(group=><div className="cms-nav-dropdown" key={group.label}><button type="button">{group.label} <i className="fa-solid fa-chevron-down"/></button><div className="cms-nav-menu">{group.items.map(item=><a href={item.href} key={item.id}>{lang==='fr'?item.label_fr:item.label_en}</a>)}</div></div>)}
    <a className="cms-support" href="/donate"><i className="fa-solid fa-heart"/> <Txt lang={lang} fr={text.support} en={text.support}/></a>
    <button className="cms-lang" onClick={()=>setLang(lang==='fr'?'en':'fr')} aria-label="Changer de langue">{lang.toUpperCase()}</button>
   </nav>
   <button className="cms-menu" onClick={()=>setOpen(true)} aria-label="Ouvrir le menu"><i className="fa-solid fa-bars"/></button>
  </header>
  {open&&<><div className="cms-backdrop" onClick={()=>setOpen(false)}/><aside className="cms-drawer" aria-label="Menu mobile">
   <div className="cms-drawer-head"><img src={config?.logo_url||logo} alt="Logo officiel EVES"/><button onClick={()=>setOpen(false)} aria-label="Fermer"><i className="fa-solid fa-xmark"/></button></div>
   <a href="/" onClick={()=>setOpen(false)} className="cms-mobile-home"><i className="fa-solid fa-house"/> {text.mobile_home}</a>
   {grouped.map(group=><div className="cms-mobile-group" key={group.label}>
    <button type="button" className={expanded===group.label?'open':''} onClick={()=>toggleGroup(group.label)}>{group.label}<i className="fa-solid fa-chevron-down"/></button>
    {expanded===group.label&&<div className="cms-mobile-submenu">{group.items.map(item=><a href={item.href} key={item.id} onClick={()=>setOpen(false)}>{lang==='fr'?item.label_fr:item.label_en}</a>)}</div>}
   </div>)}
   <a href="/donate" onClick={()=>setOpen(false)} className="mobile-support"><i className="fa-solid fa-heart"/> <Txt lang={lang} fr={text.footer_support} en={text.footer_support}/></a>
   <button className="cms-mobile-lang" onClick={()=>{setLang(lang==='fr'?'en':'fr');setOpen(false)}}>{lang==='fr'?'English':'Français'}</button>
  </aside></>}
  {children}
  {showNewsletter&&newsletterSection?.visible!==false&&<Newsletter lang={lang} compact section={newsletterSection} config={config}/>} 
  <EvesAI lang={lang}/>\n  <footer className="cms-footer"><div><img src={config?.logo_url||logo} alt="Logo officiel EVES"/><p>{config?.[lang==='fr'?'footer_description_fr':'footer_description_en']||<Txt lang={lang} fr="Objectifs de développement durable & solidarité internationale. EVES agit pour des communautés plus inclusives, résilientes et solidaires." en="Sustainable Development Goals & international solidarity. EVES works for more inclusive, resilient and caring communities."/>}</p></div><div><h4>EVES</h4>{navItems.slice(0,7).map(item=><a href={item.href} key={item.id}>{lang==='fr'?item.label_fr:item.label_en}</a>)}</div><div><h4><Txt lang={lang} fr={text.footer_contact} en={text.footer_contact}/></h4><a href={`mailto:${config?.contact_email||'contact@eves.cm'}`}>{config?.contact_email||'contact@eves.cm'}</a><a href={`tel:${config?.phone||'+237 656 987 759'}`}>{config?.phone||'+237 656 987 759'}</a><p><i className="fa-solid fa-location-dot"/> {address}</p><a className="cms-footer-donate" href="/donate"><i className="fa-solid fa-heart"/> <Txt lang={lang} fr={text.footer_support} en={text.footer_support}/></a></div></footer>
  <div className="cms-credit">{text.credit}</div>
 </div>
}
function Home({pages,news,media,sections,navigation,config,lang,setLang}){
 const text=siteText(config,lang)
 const home=pages.find(x=>x.slug==='/')
 const posts=news.slice(0,3)
 const hero=sections.find(x=>x.section_key==='hero')
 const objectivesSection=sections.find(x=>x.section_key==='objectives')
 const gallerySection=sections.find(x=>x.section_key==='gallery')
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
      <a href={hero?.data?.cta1_href||"/about"} className="cms-btn">{hero?.data?.[lang==="fr"?"cta1_fr":"cta1_en"]||text.hero_cta1} <i className="fa-solid fa-arrow-right"/></a>
      <a href={hero?.data?.cta2_href||"/donate"} className="cms-btn outline">{hero?.data?.[lang==="fr"?"cta2_fr":"cta2_en"]||text.hero_cta2}</a>
    </div>
   </div>
  </section>
  {objectivesSection?.visible!==false&&<section className="cms-section"><div className="cms-heading"><span>{text.objectives_label}</span><h2>{objectivesSection?.[lang==="fr"?"title_fr":"title_en"]||text.objectives_fallback}</h2><p>{objectivesSection?.[lang==="fr"?"intro_fr":"intro_en"]}</p></div><div className="obj-grid">{(objectivesSection?.data?.items||objectives).map((o,i)=>{const code=o.code||"OS"+(i+1),title=o[lang==="fr"?"title_fr":"title_en"],desc=o[lang==="fr"?"desc_fr":"desc_en"],icon=o.icon||"fa-circle";return <article key={code}><i className={`fa-solid ${icon}`}/><small>{code}</small><h3>{title}</h3><p>{desc}</p><a href="/causes" aria-label={`${text.hero_cta1} ${code}`}><i className="fa-solid fa-arrow-right"/></a></article>})}</div></section>}
  {(sections.find(x=>x.section_key==='newsroom')?.visible!==false)&&<section className="cms-section"><div className="cms-heading"><span>{text.news_label}</span><h2>{text.news_title}</h2></div><div className="news-grid">{posts.map(p=><a href={`/news/${p.slug}`} className="news-card" key={p.id}><small>{p.category}</small><h3>{p[`title_${lang}`]||p.title_fr}</h3><p>{p[`excerpt_${lang}`]||p.excerpt_fr}</p><span>{p.published_at?new Date(p.published_at).toLocaleDateString(lang==='fr'?'fr-FR':'en-GB'):''} · <Txt lang={lang} fr={text.read_more} en={text.read_more}/></span></a>)}</div></section>}
  {gallerySection?.visible!==false&&<section className="cms-section cms-home-gallery"><div className="cms-heading"><span>{text.gallery_label}</span><h2>{gallerySection?.[lang==="fr"?"title_fr":"title_en"]||text.gallery_title}</h2><p>{gallerySection?.[lang==="fr"?"intro_fr":"intro_en"]}</p></div><div className="gallery-strip">{(gallerySection?.data?.media_ids?.length?gallerySection.data.media_ids.map(id=>media.find(m=>m.id===id)).filter(Boolean):media.slice(0,5)).map(image=><a href="/gallery" key={image.id||image.public_url}><img src={image.public_url||image.src} alt={image[lang==="fr"?"alt_fr":"alt_en"]||image.alt||""}/></a>)}</div><a className="cms-text-link" href="/gallery"><Txt lang={lang} fr={text.gallery_link} en={text.gallery_link}/> <i className="fa-solid fa-arrow-right"/></a></section>}
 </Shell>
}
function Gallery({media,navigation,sections,config,lang,setLang}){
 const text=siteText(config,lang)
 return <Shell {...{config,lang,setLang,navigation,sections}}><main className="cms-page"><div className="cms-page-hero"><span>{text.gallery_page_label}</span><h1>{text.gallery_page_title}</h1><p>{text.gallery_page_intro}</p></div><section className="cms-section"><div className="gallery-grid">{(media.length?media:galleryImages.map((x,i)=>({id:i,public_url:x.src,alt_fr:x.alt,caption_fr:x.caption}))).map((image,i)=><figure key={image.id}><img src={image.public_url} alt={image[lang==='fr'?'alt_fr':'alt_en']||image.alt_fr}/><figcaption><strong>0{i+1}</strong><span>{image[lang==='fr'?'caption_fr':'caption_en']||image.caption_fr}</span></figcaption></figure>)}</div></section></main></Shell>
}

function EvesAI({lang}){const[open,setOpen]=useState(false),[input,setInput]=useState(''),[busy,setBusy]=useState(false),[messages,setMessages]=useState([]);async function ask(){const q=input.trim();if(!q||busy)return;setMessages(m=>[...m,{role:'user',text:q}]);setInput('');setBusy(true);try{const r=await fetch('/api/ai-public',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q,lang})});const j=await r.json();if(!r.ok)throw Error(j.error||'EVES AI unavailable');setMessages(m=>[...m,{role:'ai',text:j.answer||''}])}catch(e){setMessages(m=>[...m,{role:'ai',text:lang==='fr'?'EVES AI est temporairement indisponible.':'EVES AI is temporarily unavailable.'}])}finally{setBusy(false)}}return <><button className="eves-ai-fab" onClick={()=>setOpen(true)} aria-label="EVES AI"><I n="fa-wand-magic-sparkles"/><span>EVES AI</span></button>{open&&<div className="eves-ai-panel"><div className="eves-ai-head"><div><b>EVES AI</b><small>{lang==='fr'?'Assistant officiel EVES':'Official EVES assistant'}</small></div><button onClick={()=>setOpen(false)} aria-label="Close"><I n="fa-xmark"/></button></div><div className="eves-ai-messages">{messages.length===0&&<div className="eves-ai-welcome"><I n="fa-comments"/><b>{lang==='fr'?'Comment pouvons-nous vous aider ?':'How can we help you?'}</b><p>{lang==='fr'?'Posez une question sur EVES, nos objectifs, programmes, actualités ou comment nous contacter.':'Ask about EVES, our objectives, programmes, news or how to contact us.'}</p></div>}{messages.map((m,i)=><div className={'eves-ai-msg '+m.role} key={i}><span>{m.role==='user'?(lang==='fr'?'Vous':'You'):'EVES AI'}</span><p>{m.text}</p></div>)}{busy&&<div className="eves-ai-msg ai"><span>EVES AI</span><p>…</p></div>}</div><form onSubmit={e=>{e.preventDefault();ask()}} className="eves-ai-compose"><input value={input} onChange={e=>setInput(e.target.value)} placeholder={lang==='fr'?'Votre question…':'Your question…'} maxLength={1200}/><button disabled={busy||!input.trim()}><I n="fa-paper-plane"/></button></form></div>}</>}

function BlockRenderer({blocks,media,lang}){return <div className="cms-content-blocks">{(blocks||[]).filter(b=>b.visible!==false).map((b,i)=>{const x=lang==='fr'?(b.fr||{}):(b.en||{});if(b.type==='richtext')return <section className="content-block richtext-block" key={b.id||i}><h2>{x.title}</h2>{(x.body||'').split('\n').filter(Boolean).map((p,j)=><p key={j}>{p}</p>)}</section>;if(b.type==='image'){const m=(media||[]).find(y=>y.id===b.media_id);return m?<figure className="content-block image-block" key={b.id||i}><img src={m.public_url} alt={m[lang==='fr'?'alt_fr':'alt_en']||m.alt_fr||m.filename}/>{(m[lang==='fr'?'caption_fr':'caption_en']||m.caption_fr)&&<figcaption>{m[lang==='fr'?'caption_fr':'caption_en']||m.caption_fr}</figcaption>}</figure>:null}if(b.type==='cta')return <section className="content-block cta-block" key={b.id||i}><div><h2>{x.label}</h2><p>{x.body}</p></div><a href={b.href||'/donate'}>{x.button||b.button||(lang==='fr'?'Découvrir':'Discover')} <I n="fa-arrow-right"/></a></section>;if(b.type==='quote')return <blockquote className="content-block quote-block" key={b.id||i}><p>“{x.body}”</p><cite>{x.author}</cite></blockquote>;if(b.type==='stats')return <section className="content-block stats-block" key={b.id||i}>{(x.items||[]).map((s,j)=><div key={j}><strong>{s.value||''}</strong><span>{s.label||''}</span></div>)}</section>;if(b.type==='cards')return <section className="content-block cards-block" key={b.id||i}>{(x.items||[]).map((card,j)=><article key={j}><span>{card.kicker||''}</span><h3>{card.title||''}</h3><p>{card.body||''}</p>{card.href&&<a href={card.href}>{card.link||'→'}</a>}</article>)}</section>;if(b.type==='spacer')return <div className="content-block spacer-block" style={{height:b.height||'80px'}} key={b.id||i}/>;return null})}</div>}
function Page({item,media,navigation,sections,config,lang,setLang}){const blocks=item.metadata?.blocks||[];return <Shell {...{config,lang,setLang,navigation,sections}}><main className="cms-page"><div className="cms-page-hero"><span>{item.category||'EVES'}</span><h1>{item[`title_${lang}`]||item.title_fr}</h1><p>{item[`excerpt_${lang}`]||item.excerpt_fr}</p></div><article>{blocks.length?<BlockRenderer blocks={blocks} media={media} lang={lang}/>:((item[`body_${lang}`]||item.body_fr||'').split('\n').filter(Boolean).map((p,i)=><p key={i}>{p}</p>))}</article></main></Shell>}

function News({news,navigation,sections,config,lang,setLang}){const text=siteText(config,lang);const posts=news;const newsletterSection=sections.find(x=>x.section_key==='newsletter');return <Shell {...{config,lang,setLang,navigation,sections,showNewsletter:false}}><main className="cms-page"><div className="cms-page-hero"><span>{text.news_page_label}</span><h1>{text.news_page_title}</h1><p>{text.news_page_intro}</p></div><div className="news-grid large">{posts.map(p=><a href={`/news/${p.slug}`} className="news-card" key={p.id}><small>{p.category}</small><h2>{p[`title_${lang}`]||p.title_fr}</h2><p>{p[`excerpt_${lang}`]||p.excerpt_fr}</p><span>{p.published_at?new Date(p.published_at).toLocaleDateString(lang==='fr'?'fr-FR':'en-GB'):''}</span></a>)}</div><Newsletter lang={lang} section={newsletterSection} config={config}/></main></Shell>}

export default function CmsSite(){
 const [state,setState]=useState({pages:[],news:[],media:[],sections:[],navigation:[],config:null})
 const [lang,setLang]=useState(()=>navigator.language?.toLowerCase().startsWith('fr')?'fr':'en')
 const path=window.location.pathname
 useEffect(()=>{let alive=true;const load=()=>fetchPublicContent().then(x=>alive&&setState(x)).catch(console.error);load();const stop=subscribeToCms(load);return()=>{alive=false;stop()}},[])
 if(path==='/gallery')return <Gallery media={state.media} navigation={state.navigation} sections={state.sections} config={state.config} lang={lang} setLang={setLang}/>
 if(path==='/news')return <News news={state.news} navigation={state.navigation} sections={state.sections} config={state.config} lang={lang} setLang={setLang}/>
 const item=state.pages.find(x=>x.slug===path)
 if(path.startsWith('/news/')){const n=state.news.find(x=>x.slug===path.slice(6));const text=siteText(state.config,lang);return n?<Page item={n} media={state.media} navigation={state.navigation} sections={state.sections} config={state.config} lang={lang} setLang={setLang}/>:<Page item={{title_fr:text.article_not_found_title,title_en:text.article_not_found_title,body_fr:text.article_not_found_body,body_en:text.article_not_found_body}} config={state.config} lang={lang} setLang={setLang}/>}
 const text=siteText(state.config,lang);return path==='/'||path==='/index.html'?<Home pages={state.pages} news={state.news} media={state.media} sections={state.sections} navigation={state.navigation} config={state.config} lang={lang} setLang={setLang}/>:item?<Page item={item} media={state.media} navigation={state.navigation} sections={state.sections} config={state.config} lang={lang} setLang={setLang}/>:<Page item={{title_fr:text.not_found_title,title_en:text.not_found_title,body_fr:text.not_found_body,body_en:text.not_found_body}} config={state.config} lang={lang} setLang={setLang}/>
}
