import { useEffect, useState } from 'react'
import { ArrowRight, BookOpen, Brain, CheckCircle2, ChevronDown, Globe2, HeartHandshake, Leaf, Menu, ShieldCheck, Sparkles, Users, X } from 'lucide-react'

const programs = [
  { icon: BookOpen, tag: 'OS1', title: 'Éducation & réinsertion', text: 'Parrainage scolaire, suivi individualisé, fournitures, transport et soutien scolaire présentiel ou en ligne.', stat: '300 + 100', note: 'jeunes filles + autres enfants vulnérables' },
  { icon: Leaf, tag: 'OS2', title: 'Résilience climatique', text: 'Formation pratique, jardins scolaires, reboisement, recyclage, énergies propres et dialogue communautaire.', stat: '100–150', note: 'jeunes formés sur 3 ans' },
  { icon: ShieldCheck, tag: 'OS3', title: 'Protection & bien-être', text: 'Prévention des violences, mariages précoces et cyberharcèlement, orientation, signalement et soutien psychosocial.', stat: '1 500', note: 'familles sensibilisées' },
  { icon: HeartHandshake, tag: 'OS4', title: 'ESS & autonomisation', text: 'Épargne solidaire, coopération, AGR et renforcement des capacités des ménages et associations relais.', stat: '150', note: 'ménages appuyés' },
  { icon: Brain, tag: 'OS5', title: 'Innovation & leadership', text: 'Laboratoire d’innovation, recherche-action, mentorat, publications et plaidoyer national, CEEAC et UA.', stat: '60', note: 'jeunes en recherche-action' },
]

const impact = [
  ['400', 'enfants et jeunes', 'maintenus ou réinsérés dans l’éducation'],
  ['25%', 'de réduction visée', 'des mariages précoces dans les communautés ciblées'],
  ['+30%', 'de revenus moyens', 'des ménages appuyés à 36 mois'],
  ['15', 'associations relais', 'formées et engagées dans la protection'],
]

function Logo() {
  return <div className="brand-mark" aria-label="EVES"><span>EV</span><i>ES</i><small>ESS • ENFANCE • JEUNESSE</small></div>
}

function App() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => { const on = () => setScrolled(window.scrollY > 24); window.addEventListener('scroll', on); return () => window.removeEventListener('scroll', on) }, [])
  const close = () => setOpen(false)
  return <div className="site">
    <header className={scrolled ? 'header scrolled' : 'header'}>
      <a className="logo-link" href="#top" onClick={close}><Logo /></a>
      <button className="menu" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
      <nav className={open ? 'nav open' : 'nav'}>
        <a href="#mission" onClick={close}>Notre mission</a>
        <a href="#programmes" onClick={close}>Programmes</a>
        <a href="#impact" onClick={close}>Impact</a>
        <a href="#approche" onClick={close}>Notre approche</a>
        <a href="#contact" className="nav-cta" onClick={close}>Nous rejoindre <ArrowRight size={16}/></a>
      </nav>
    </header>

    <main id="top">
      <section className="hero">
        <div className="hero-glow one"/><div className="hero-glow two"/>
        <div className="hero-content">
          <div className="eyebrow"><span className="pulse"/> Association camerounaise • Économie sociale et solidaire</div>
          <h1>Donner aux jeunes vulnérables <em>les moyens de leur avenir.</em></h1>
          <p className="lead">EVES agit pour réduire les vulnérabilités éducatives, sociales et environnementales des enfants et des jeunes au Cameroun — avec une attention particulière aux jeunes filles et femmes musulmanes.</p>
          <div className="actions"><a className="btn primary" href="#programmes">Découvrir notre action <ArrowRight size={18}/></a><a className="btn ghost" href="#mission">Notre vision <ChevronDown size={17}/></a></div>
          <div className="hero-note"><Globe2 size={17}/><span><strong>Noun, Ouest</strong> — territoire pilote · Extension progressive selon les besoins et les financements.</span></div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="orb"><div className="orb-inner"><span>EVES</span><small>ÉDUQUER · PROTÉGER · ÉMANCIPER</small></div></div>
          <div className="float-card card-a"><ShieldCheck size={20}/><div><b>Protection</b><span>des enfants</span></div></div>
          <div className="float-card card-b"><Leaf size={20}/><div><b>Résilience</b><span>climatique</span></div></div>
          <div className="float-card card-c"><Users size={20}/><div><b>Leadership</b><span>des jeunes</span></div></div>
        </div>
      </section>

      <section className="statement" id="mission">
        <div className="section-label">01 — Notre raison d’être</div>
        <div className="statement-grid"><h2>Une société où chaque enfant peut <span>réaliser son potentiel.</span></h2><div><p>Nous voulons bâtir une société inclusive dans laquelle chaque enfant et chaque jeune vulnérable, fille ou garçon, sans distinction de religion ni d’origine, accède à une éducation de qualité et à des opportunités équitables.</p><p>Notre modèle amplifie les forces déjà présentes dans les communautés : associations locales, tontines, coopératives, solidarité familiale et leadership des jeunes.</p></div></div>
      </section>

      <section className="programmes" id="programmes">
        <div className="section-head"><div><div className="section-label">02 — Nos axes d’intervention</div><h2>Une chaîne de transformation,<br/><span>du terrain au plaidoyer.</span></h2></div><p>Le projet EVES 2027–2029 articule cinq objectifs complémentaires, portés avec les communautés et les associations de développement local.</p></div>
        <div className="program-grid">{programs.map(({icon: Icon, ...p}) => <article className="program" key={p.tag}><div className="program-top"><div className="icon"><Icon size={21}/></div><span>{p.tag}</span></div><h3>{p.title}</h3><p>{p.text}</p><div className="program-stat"><strong>{p.stat}</strong><span>{p.note}</span></div></article>)}</div>
      </section>

      <section className="impact" id="impact">
        <div className="section-label">03 — Impact attendu</div><h2>Des objectifs mesurables.<br/><span>Une responsabilité partagée.</span></h2>
        <div className="impact-grid">{impact.map(([n,t,d]) => <div className="impact-item" key={t}><strong>{n}</strong><b>{t}</b><p>{d}</p></div>)}</div>
        <div className="impact-bottom"><Sparkles size={19}/><p>Le suivi-évaluation, les enquêtes semestrielles, les rapports des associations relais et un tableau de bord numérique soutiennent une culture de transparence et d’apprentissage.</p></div>
      </section>

      <section className="approach" id="approche">
        <div className="section-label">04 — Notre approche</div>
        <div className="approach-grid"><div><h2>Nous ne créons pas à partir de zéro.<br/><span>Nous amplifions.</span></h2><p className="large">EVES s’appuie sur les réseaux locaux d’économie sociale et solidaire comme piliers territoriaux : ils connaissent les familles, les réalités et les mécanismes de solidarité qui rendent le changement durable.</p></div>
          <div className="steps"><div><span>01</span><b>Ancrage communautaire</b><p>Identifier, accompagner et relier les acteurs locaux.</p></div><div><span>02</span><b>Protection & éducation</b><p>Suivi individualisé, orientation et soutien psychosocial.</p></div><div><span>03</span><b>Autonomisation</b><p>ESS, épargne solidaire, AGR et compétences numériques ciblées.</p></div><div><span>04</span><b>Innovation & influence</b><p>Produire des savoirs, mentorer les jeunes et éclairer les politiques publiques.</p></div></div>
        </div>
      </section>

      <section className="quote"><div className="quote-mark">“</div><blockquote>Les jeunes filles et garçons qui bénéficient du projet deviendront à leur tour les chercheuses, les mentors et les plaidoyeurs de demain.</blockquote><p>— Approche EVES · chaîne de transformation durable</p></section>

      <section className="roadmap"><div className="section-label">05 — 2027 → 2029</div><h2>Un pilote. Des preuves. <span>Une expansion responsable.</span></h2><div className="timeline"><div><b>Phase 1</b><strong>2027</strong><p>Constitution, baseline, associations pilotes, premiers parrainages et lancement du Laboratoire.</p></div><div><b>Phase 2</b><strong>2028</strong><p>Consolidation des programmes, renforcement du réseau et extension guidée par les apprentissages.</p></div><div><b>Phase 3</b><strong>2029</strong><p>Capitalisation, influence des politiques publiques et changement d’échelle selon les financements.</p></div></div></section>

      <section className="cta" id="contact"><div className="cta-inner"><div><div className="eyebrow">Construisons la suite ensemble</div><h2>Un partenariat peut devenir<br/><em>une trajectoire de vie.</em></h2><p>EVES recherche des partenaires communautaires, institutionnels, académiques et financiers pour faire vivre cette approche.</p></div><div className="cta-actions"><a className="btn light" href="mailto:mandou.ayiwouo@gmail.com?subject=Partenariat%20EVES">Proposer un partenariat <ArrowRight size={18}/></a><a className="contact-line" href="tel:+237694641402">+237 694 641 402</a><a className="contact-line" href="mailto:mandou.ayiwouo@gmail.com">mandou.ayiwouo@gmail.com</a></div></div></section>
    </main>
    <footer><div className="footer-brand"><Logo/><p>Éducation • Vulnérabilités de l’Enfance et de la Jeunesse<br/>• Économie Sociale et Solidaire</p></div><div className="footer-links"><a href="#mission">Mission</a><a href="#programmes">Programmes</a><a href="#impact">Impact</a><a href="#contact">Contact</a></div><div className="copyright">© 2026 EVES · Cameroun</div></footer>
  </div>
}
export default App
