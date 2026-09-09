import { useEffect, useState } from 'react'
import { ArrowRight, BookOpen, Brain, HeartHandshake, Leaf, Menu, ShieldCheck, Users, X } from 'lucide-react'

const causes = [
  { icon: BookOpen, title: 'Éducation & réinsertion', text: 'Parrainage scolaire, fournitures, transport, suivi individualisé et soutien scolaire pour les enfants et jeunes vulnérables.', target: '400', label: 'enfants et jeunes' },
  { icon: Leaf, title: 'Résilience climatique', text: 'Jardins scolaires, reboisement, recyclage, énergies propres et formation pratique pour les communautés.', target: '100–150', label: 'jeunes formés' },
  { icon: ShieldCheck, title: 'Protection de l’enfance', text: 'Prévention des violences, mariages précoces et cyberharcèlement, orientation et soutien psychosocial.', target: '1 500', label: 'familles sensibilisées' },
  { icon: HeartHandshake, title: 'ESS & autonomisation', text: 'Épargne solidaire, coopération, activités génératrices de revenus et renforcement des associations relais.', target: '150', label: 'ménages appuyés' },
  { icon: Brain, title: 'Innovation & leadership', text: 'Recherche-action, mentorat, laboratoire d’innovation, publications et plaidoyer porté par les jeunes.', target: '60', label: 'jeunes chercheurs' },
]

const stats = [
  ['400+', 'enfants & jeunes', 'maintenus ou réinsérés dans l’éducation'],
  ['25%', 'réduction visée', 'des mariages précoces ciblés'],
  ['+30%', 'revenus moyens', 'des ménages appuyés à 36 mois'],
  ['15', 'associations relais', 'formées et engagées'],
]

function Logo() {
  return <div className="eves-logo"><span>EV</span><strong>ES</strong><small>ÉDUQUER • PROTÉGER • ÉMANCIPER</small></div>
}

function App() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const close = () => setOpen(false)

  return <div className="eves-site">
    <div className="topbar d-none d-lg-block">
      <div className="container d-flex justify-content-between align-items-center">
        <div><i className="bi bi-telephone me-2"/>Support: +237 694 641 402 <span className="mx-3">|</span><i className="bi bi-envelope me-2"/>mandou.ayiwouo@gmail.com</div>
        <div><span>Association camerounaise</span><span className="mx-3">•</span><a href="#contact">Nous contacter</a><span className="socials ms-4"><i className="bi bi-facebook"/><i className="bi bi-linkedin"/><i className="bi bi-instagram"/></span></div>
      </div>
    </div>

    <header className={`main-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container d-flex align-items-center justify-content-between">
        <a href="#home" className="brand" onClick={close}><Logo /></a>
        <button className="mobile-toggle d-lg-none" onClick={() => setOpen(!open)} aria-label="Ouvrir le menu">{open ? <X/> : <Menu/>}</button>
        <nav className={`main-nav ${open ? 'open' : ''}`}>
          <a href="#home" onClick={close}>ACCUEIL</a><a href="#about" onClick={close}>À PROPOS</a><a href="#causes" onClick={close}>CAUSES</a><a href="#approach" onClick={close}>NOTRE APPROCHE</a><a href="#impact" onClick={close}>IMPACT</a><a href="#contact" onClick={close}>CONTACT</a>
          <a className="donate-btn" href="mailto:mandou.ayiwouo@gmail.com?subject=Soutenir%20EVES">SOUTENIR EVES</a>
        </nav>
      </div>
    </header>

    <main>
      <section id="home" className="hero-section">
        <div className="hero-overlay"/>
        <div className="container position-relative h-100 d-flex align-items-center">
          <div className="hero-copy"><div className="hero-kicker">SOUTENIR LES CAUSES QUI COMPTENT</div><h1>Ensemble, faisons du monde <span>un meilleur endroit.</span></h1><p>EVES œuvre au Cameroun pour réduire les vulnérabilités éducatives, sociales et environnementales des enfants et des jeunes, avec une attention particulière aux jeunes filles et aux femmes musulmanes.</p><div className="hero-buttons"><a className="btn-eves btn-red" href="#causes">DÉCOUVRIR NOS ACTIONS <ArrowRight size={17}/></a><a className="btn-eves btn-outline-white" href="#about">EN SAVOIR PLUS</a></div></div>
          <div className="hero-caption d-none d-md-flex"><span>01</span><div><b>NOUN • OUEST CAMEROUN</b><small>Territoire pilote · 2027–2029</small></div></div>
        </div><div className="hero-arrows"><button aria-label="Précédent"><i className="bi bi-arrow-left"/></button><button aria-label="Suivant"><i className="bi bi-arrow-right"/></button></div>
      </section>

      <section className="intro-strip"><div className="container"><div className="row align-items-stretch g-0"><div className="col-lg-5 intro-message"><div className="mini-kicker"><span>✦</span> NOUS CROYONS EN CE QUE NOUS FAISONS</div><h2>Un soutien chaleureux & véritable <span>pour les personnes qui en ont besoin.</span></h2><p>Notre action part des communautés et renforce les solidarités qui existent déjà.</p></div><div className="col-lg-7 intro-panels"><a href="#contact" className="intro-panel panel-gold"><i className="bi bi-heart-fill"/><b>Soutenir<br/>EVES</b><small>Contribuer à nos actions</small></a><a href="#contact" className="intro-panel panel-teal"><i className="bi bi-people-fill"/><b>Devenir<br/>partenaire</b><small>Construire avec nous</small></a><a href="#contact" className="intro-panel panel-blue"><i className="bi bi-person-raised-hand"/><b>Devenir<br/>bénévole</b><small>Donner de son temps</small></a></div></div></div></section>

      <section id="about" className="section-padding about-section"><div className="container"><div className="row align-items-center g-5"><div className="col-lg-6"><div className="section-kicker">QUI SOMMES-NOUS</div><h2 className="section-title">Une société où chaque enfant peut <span>réaliser son potentiel.</span></h2><p>EVES — Éducation, Vulnérabilités de l’Enfance et de la Jeunesse, Économie Sociale et Solidaire — est une initiative camerounaise qui agit à l’intersection de l’éducation, de la protection, de l’autonomisation et de l’innovation.</p><p>Nous croyons que le changement durable naît lorsque les familles, associations locales, coopératives, jeunes et partenaires avancent ensemble.</p><a href="#approach" className="text-link">Découvrir notre approche <ArrowRight size={16}/></a></div><div className="col-lg-6"><div className="about-photo"><div className="photo-badge"><strong>2027</strong><span>Début du pilote</span></div></div></div></div></div></section>

      <section id="causes" className="causes-section section-padding"><div className="container"><div className="row align-items-end mb-5"><div className="col-lg-7"><div className="section-kicker">NOS CAUSES</div><h2 className="section-title">Les causes qui <span>nous mobilisent.</span></h2></div><div className="col-lg-5"><p className="section-intro">Cinq axes complémentaires forment une chaîne de transformation, du terrain jusqu’au plaidoyer et à l’influence.</p></div></div><div className="row g-4">{causes.map(({icon: Icon, ...cause}, index) => <div className="col-md-6 col-xl" key={cause.title}><article className="cause-card"><div className="cause-icon"><Icon size={24}/></div><span className="cause-number">0{index + 1}</span><h3>{cause.title}</h3><p>{cause.text}</p><div className="cause-target"><strong>{cause.target}</strong><small>{cause.label}</small></div></article></div>)}</div></div></section>

      <section id="impact" className="impact-section section-padding"><div className="container"><div className="section-kicker light">NOTRE IMPACT ATTENDU</div><h2 className="section-title light-title">Des objectifs mesurables.<br/><span>Une responsabilité partagée.</span></h2><div className="row stats-row">{stats.map(([n,t,d]) => <div className="col-6 col-lg-3 stat" key={t}><strong>{n}</strong><b>{t}</b><p>{d}</p></div>)}</div></div></section>

      <section id="approach" className="section-padding approach-section"><div className="container"><div className="row g-5"><div className="col-lg-6"><div className="section-kicker">NOTRE APPROCHE</div><h2 className="section-title">Nous ne créons pas à partir de zéro.<br/><span>Nous amplifions.</span></h2><p className="lead-copy">EVES s’appuie sur les réseaux locaux d’économie sociale et solidaire comme piliers territoriaux. Ils connaissent les familles, les réalités et les mécanismes de solidarité qui rendent le changement durable.</p></div><div className="col-lg-6"><div className="approach-list"><div><span>01</span><b>Ancrage communautaire</b><p>Identifier, accompagner et relier les acteurs locaux.</p></div><div><span>02</span><b>Protection & éducation</b><p>Suivi individualisé, orientation et soutien psychosocial.</p></div><div><span>03</span><b>Autonomisation</b><p>ESS, épargne solidaire, AGR et compétences numériques.</p></div><div><span>04</span><b>Innovation & influence</b><p>Recherche-action, mentorat et plaidoyer pour les politiques publiques.</p></div></div></div></div></div></section>

      <section className="quote-section"><div className="container text-center"><div className="quote-mark">“</div><blockquote>Les jeunes filles et garçons qui bénéficient du projet deviendront à leur tour les chercheuses, les mentors et les plaidoyeurs de demain.</blockquote><p>CHAÎNE DE TRANSFORMATION EVES</p></div></section>

      <section className="roadmap-section section-padding"><div className="container"><div className="section-kicker">FEUILLE DE ROUTE · 2027 → 2029</div><h2 className="section-title">Un pilote. Des preuves. <span>Une expansion responsable.</span></h2><div className="row roadmap g-0"><div className="col-md-4"><span>PHASE 1</span><strong>2027</strong><p>Baseline, associations pilotes, premiers parrainages et lancement du Laboratoire.</p></div><div className="col-md-4"><span>PHASE 2</span><strong>2028</strong><p>Consolidation des programmes, renforcement du réseau et extension guidée par les apprentissages.</p></div><div className="col-md-4"><span>PHASE 3</span><strong>2029</strong><p>Capitalisation, influence des politiques publiques et changement d’échelle selon les financements.</p></div></div></div></section>

      <section id="contact" className="cta-section"><div className="container"><div className="row align-items-center"><div className="col-lg-8"><div className="section-kicker">CONSTRUISONS LA SUITE ENSEMBLE</div><h2>Un partenariat peut devenir <span>une trajectoire de vie.</span></h2><p>EVES recherche des partenaires communautaires, institutionnels, académiques et financiers.</p></div><div className="col-lg-4 text-lg-end"><a className="btn-eves btn-white" href="mailto:mandou.ayiwouo@gmail.com?subject=Partenariat%20EVES">PROPOSER UN PARTENARIAT <ArrowRight size={17}/></a><div className="contact-details"><a href="tel:+237694641402">+237 694 641 402</a><a href="mailto:mandou.ayiwouo@gmail.com">mandou.ayiwouo@gmail.com</a></div></div></div></div></section>
    </main>

    <footer><div className="container"><div className="row g-4 align-items-end"><div className="col-lg-5"><Logo/><p className="footer-desc">Éducation • Vulnérabilités de l’Enfance et de la Jeunesse • Économie Sociale et Solidaire</p></div><div className="col-lg-4 footer-links"><a href="#about">À propos</a><a href="#causes">Causes</a><a href="#impact">Impact</a><a href="#contact">Contact</a></div><div className="col-lg-3 text-lg-end copyright">© 2026 EVES · Cameroun</div></div></div></footer>
  </div>
}

export default App
