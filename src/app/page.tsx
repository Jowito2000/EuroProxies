'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PRICE_TIERS, getPricePerCard } from '@/lib/pricing'

const SUPPORTED_GAMES = [
  { abbr: 'MTG', name: 'Magic: The Gathering', symbol: '✦', format: '63×88 mm', logo: '/images/TCGs/Magic.png', logoScale: 'scale-100',
    from: '#3b1f8c', to: '#7c3aed', accent: '#c4b5fd', glow: 'rgba(124,58,237,0.35)' },
  { abbr: 'PKM', name: 'Pokémon TCG', symbol: '⚡', format: '63×88 mm', logo: '/images/TCGs/Pokemon.png', logoScale: 'scale-100',
    from: '#92400e', to: '#f59e0b', accent: '#fde68a', glow: 'rgba(245,158,11,0.35)' },
  { abbr: 'YGO', name: 'Yu-Gi-Oh!', symbol: '◆', format: '59×86 mm', logo: '/images/TCGs/YugiOh.png', logoScale: 'scale-110',
    from: '#1e3a8a', to: '#3b82f6', accent: '#93c5fd', glow: 'rgba(59,130,246,0.35)' },
  { abbr: 'LOR', name: 'Disney Lorcana', symbol: '✧', format: '63×88 mm', logo: '/images/TCGs/Lorcana.png', logoScale: 'scale-100',
    from: '#164e63', to: '#06b6d4', accent: '#67e8f9', glow: 'rgba(6,182,212,0.35)' },
  { abbr: 'OPC', name: 'One Piece TCG', symbol: '☠', format: '63×88 mm', logo: '/images/TCGs/OnePiece.png', logoScale: 'scale-[1.5]',
    from: '#7f1d1d', to: '#dc2626', accent: '#fca5a5', glow: 'rgba(239,68,68,0.35)' },
  { abbr: 'FaB', name: 'Flesh and Blood', symbol: '⚔', format: '63×88 mm', logo: '/images/TCGs/FleshAndBloodIcon.png', logoScale: 'scale-100',
    from: '#3f3f46', to: '#a1a1aa', accent: '#e4e4e7', glow: 'rgba(161,161,170,0.3)' },
  { abbr: 'SWU', name: 'StarWars Unlimited', symbol: '★', format: '63×88 mm', logo: '/images/TCGs/StarWarsUnlimited.png', logoScale: 'scale-[1.8]',
    from: '#065f46', to: '#10b981', accent: '#6ee7b7', glow: 'rgba(16,185,129,0.35)' },
  { abbr: 'DGM', name: 'Digimon TCG', symbol: '⬢', format: '63×88 mm', logo: '/images/TCGs/DigimonTCG.png', logoScale: 'scale-[1.4]',
    from: '#5b21b6', to: '#8b5cf6', accent: '#c4b5fd', glow: 'rgba(139,92,246,0.35)' }
]

const SHOWCASE_CARDS = [
  {
    abbr: 'YGO', name: 'Yu-Gi-Oh!', symbol: '◆',
    bg: 'linear-gradient(155deg, #0c1e4a 0%, #1e3a8a 45%, #3b82f6 80%, #1e40af 100%)',
    accent: '#93c5fd',
    glow: 'rgba(59,130,246,0.55)',
    img: '/images/YuGiOhDragonBlanco.png'
  },
  {
    abbr: 'PKM', name: 'Pokémon TCG', symbol: '⚡',
    bg: 'linear-gradient(155deg, #451a03 0%, #92400e 40%, #f59e0b 80%, #78350f 100%)',
    accent: '#fde68a',
    glow: 'rgba(245,158,11,0.55)',
    img: '/images/PokemonPikachuEx.png'
  },
  {
    abbr: 'MTG', name: 'Magic: The Gathering', symbol: '✦',
    bg: 'linear-gradient(155deg, #1e0a40 0%, #4c1d95 40%, #7c3aed 75%, #2e1065 100%)',
    accent: '#c4b5fd',
    glow: 'rgba(124,58,237,0.55)',
    img: '/images/MTGMininoGeneroso.png'
  },
  {
    abbr: 'LOR', name: 'Disney Lorcana', symbol: '✧',
    bg: 'linear-gradient(155deg, #083344 0%, #164e63 40%, #06b6d4 80%, #155e75 100%)',
    accent: '#67e8f9',
    glow: 'rgba(6,182,212,0.55)',
    img: '/images/LorcanaMickey.png'
  },
  {
    abbr: 'SWU', name: 'StarWars Unlimited', symbol: '★',
    bg: 'linear-gradient(155deg, #022c22 0%, #065f46 40%, #10b981 80%, #064e3b 100%)',
    accent: '#6ee7b7',
    glow: 'rgba(16,185,129,0.55)',
    img: '/images/StarWarsDarthVader.png'
  },
]

const CARD_POSITIONS = [
  { rot: -18, tx: -290, ty: 70,  scale: 1.10, z: 1, delay: 0.55 },
  { rot: -9,  tx: -160, ty: 25,  scale: 1.35, z: 3, delay: 0.40 },
  { rot: 0,   tx: 0,    ty: -12, scale: 1.65, z: 5, delay: 0.25 },
  { rot: 9,   tx: 160,  ty: 25,  scale: 1.35, z: 3, delay: 0.40 },
  { rot: 18,  tx: 290,  ty: 70,  scale: 1.10, z: 1, delay: 0.55 },
]

const SHIPPING = [
  { flag: '🇪🇸', zone: 'España',        price: '3 €',  days: '2–4 días hábiles' },
  { flag: '🇪🇺', zone: 'Europa',        price: '6 €',  days: '4–8 días hábiles' },
  { flag: '🌍',  zone: 'Internacional', price: '10 €', days: '7–14 días hábiles' },
]

const CONTACT_IDEAS = [
  { icon: '🃏', label: 'Proponer un nuevo TCG',      subject: 'Nuevo TCG' },
  { icon: '⚙️', label: 'Sugerir una función',        subject: 'Sugerencia de función' },
  { icon: '📦', label: 'Pedido especial / mayorista', subject: 'Pedido especial' },
  { icon: '🤝', label: 'Colaboración o partenariado', subject: 'Colaboración' },
]

const STEPS = [
  { num: '01', title: 'Sube tus imágenes',   desc: 'Arrastra tus cartas. JPG, PNG o WEBP. Validación automática de calidad.' },
  { num: '02', title: 'Configura tu pedido', desc: 'Elige juego y cantidad por carta. Precio calculado al instante.' },
  { num: '03', title: 'Pago seguro',         desc: 'Checkout con Stripe. Introduce tu dirección de envío.' },
  { num: '04', title: 'Recíbelas en casa',   desc: 'Enviamos desde España con tracking. Llegan en 3–7 días.' },
]

function PriceCalc() {
  const [count, setCount] = useState(60)
  const pricePerCard = getPricePerCard(count)
  const total = pricePerCard * count
  const savingsPct = Math.round((PRICE_TIERS[0].price - pricePerCard) / PRICE_TIERS[0].price * 100)
  const nextTier = PRICE_TIERS.find(t => t.min > count)

  const adjust = (delta: number) =>
    setCount(c => Math.max(1, Math.min(9999, c + delta)))

  return (
    <section className="ep-calc section-padding">
      <div className="max-w-4xl mx-auto px-4">
        <div className="ep-section-header">
          <h2 className="ep-section-title">
            Calcula tu <span className="gradient-text">pedido</span>
          </h2>
          <p className="ep-section-lead">
            Mueve el contador y ve el precio final al instante.
          </p>
        </div>

        <div className="ep-calc-card">
          {/* Counter */}
          <div className="ep-calc-row">
            <label className="ep-calc-label">Número de cartas</label>
            <div className="ep-calc-counter">
              <button className="ep-calc-btn" onClick={() => adjust(-10)} aria-label="−10">−10</button>
              <button className="ep-calc-btn" onClick={() => adjust(-1)}  aria-label="−1">−</button>
              <input
                type="number"
                className="ep-calc-input"
                value={count}
                min={1} max={9999}
                onChange={e => setCount(Math.max(1, Math.min(9999, parseInt(e.target.value) || 1)))}
              />
              <button className="ep-calc-btn" onClick={() => adjust(1)}   aria-label="+1">+</button>
              <button className="ep-calc-btn" onClick={() => adjust(10)}  aria-label="+10">+10</button>
            </div>
          </div>

          {/* Tier bar */}
          <div className="ep-calc-tiers">
            {PRICE_TIERS.map(tier => {
              const active = count >= tier.min && (tier.max === Infinity || count <= tier.max)
              const past   = tier.max !== Infinity && count > tier.max
              return (
                <div
                  key={tier.min}
                  className={`ep-calc-tier${active ? ' active' : ''}${past ? ' past' : ''}`}
                  onClick={() => setCount(tier.min)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setCount(tier.min)}
                >
                  <div className="ep-calc-tier-range">
                    {tier.max === Infinity ? `${tier.min}+` : `${tier.min}–${tier.max}`}
                  </div>
                  <div className="ep-calc-tier-price">{tier.price.toFixed(2)} €</div>
                  <div className="ep-calc-tier-unit">/ carta</div>
                </div>
              )
            })}
          </div>

          {/* Results */}
          <div className="ep-calc-results">
            <div className="ep-calc-result">
              <span className="ep-calc-result-label">Precio / carta</span>
              <span className="ep-calc-result-value">{pricePerCard.toFixed(2)} €</span>
            </div>
            <div className="ep-calc-result ep-calc-result-total">
              <span className="ep-calc-result-label">Total estimado</span>
              <span className="ep-calc-result-value ep-calc-result-big">{total.toFixed(2)} €</span>
            </div>
            <div className="ep-calc-result">
              <span className="ep-calc-result-label">Ahorro vs. unitario</span>
              <span className={`ep-calc-result-value${savingsPct > 0 ? ' ep-calc-green' : ''}`}>
                {savingsPct > 0 ? `−${savingsPct} %` : '—'}
              </span>
            </div>
          </div>

          {nextTier && (
            <div className="ep-calc-tip">
              <span className="ep-calc-tip-icon">💡</span>
              Añade{' '}
              <strong
                className="ep-calc-tip-link"
                onClick={() => setCount(nextTier.min)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setCount(nextTier.min)}
              >
                {nextTier.min - count} carta{nextTier.min - count !== 1 ? 's' : ''} más
              </strong>
              {' '}y el precio baja a{' '}
              <strong>{nextTier.price.toFixed(2)} €/carta</strong>
            </div>
          )}

          <Link href="/editor" className="cta-primary ep-calc-cta">
            Empezar con {count} carta{count !== 1 ? 's' : ''} →
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const [contactModalSubject, setContactModalSubject] = useState<string | null>(null);
  
  return (
    <>
      <ContactModal initialSubject={contactModalSubject} isOpen={contactModalSubject !== null} onClose={() => setContactModalSubject(null)} />
      {/* Legal banner */}
      <div className="legal-banner text-center py-2 px-4">
        ⚠ PROXIES no oficiales · Solo para uso casual y testing · No válidas para torneos oficiales ⚠
      </div>

      {/* ─── HERO ─── */}
      <section className="ep-hero">
        <div className="ep-hero-bg" />
        <div className="ep-hero-grid" />
        <div className="ep-hero-noise" />
        <div className="ep-hero-glow ep-hero-glow-1" />
        <div className="ep-hero-glow ep-hero-glow-2" />

        <div className="ep-hero-inner">
          {/* Left column — content */}
          <div className="ep-hero-content">
            <h1 className="ep-hero-title">
              <span className="ep-hero-title-line">Tus decks TCG,</span>
              <span className="ep-hero-title-grad">impresos en tu puerta.</span>
            </h1>

            <p className="ep-hero-lead">
              Sube tus cartas, elige el juego y recíbelas impresas con calidad
              profesional. Sin pedido mínimo. Sin suscripción. A toda Europa.
            </p>

            <div className="ep-hero-ctas">
              <Link href="/editor" className="cta-primary ep-hero-cta">
                Hacer mi pedido
                <span className="cta-arrow">→</span>
              </Link>
              <a href="#como-funciona" className="cta-ghost">
                <span className="ep-play-dot" />
                Ver cómo funciona
              </a>
            </div>

            <div className="ep-hero-meta">
              <div className="ep-hero-meta-item">
                <strong>10k+</strong>
                <span>cartas impresas</span>
              </div>
              <div className="ep-hero-meta-sep" />
              <div className="ep-hero-meta-item">
                <strong>50+</strong>
                <span>países</span>
              </div>
              <div className="ep-hero-meta-sep" />
              <div className="ep-hero-meta-item">
                <strong>0,70 €</strong>
                <span>desde / carta</span>
              </div>
              <div className="ep-hero-meta-sep" />
              <div className="ep-hero-meta-item">
                <strong>3–7 d</strong>
                <span>entrega UE</span>
              </div>
            </div>
          </div>

          {/* Right column — card showcase */}
          <div className="ep-hero-showcase" aria-hidden="true">
            <div className="ep-hero-halo" />
            <div className="ep-hero-rings">
              <span /><span /><span />
            </div>
            <div className="ep-showcase-stage">
              {SHOWCASE_CARDS.map((c, i) => {
                const p = CARD_POSITIONS[i]
                return (
                  <Link
                    href="/editor"
                    key={c.abbr}
                    className="ep-show-slot block"
                    style={{
                      '--rot': `${p.rot}deg`,
                      '--tx': `${p.tx}px`,
                      '--ty': `${p.ty}px`,
                      '--scale': p.scale,
                      '--z': p.z,
                      '--delay': `${p.delay}s`,
                      '--card-bg': c.bg,
                      '--card-accent': c.accent,
                      '--card-glow': c.glow,
                    } as React.CSSProperties}
                  >
                    <div 
                      className="ep-show-card relative bg-black/50 overflow-hidden border border-white/5"
                      style={{ 
                        aspectRatio: c.abbr === 'YGO' ? '59/86' : '63/88',
                        borderRadius: c.abbr === 'YGO' ? '5px' : '10px'
                      }}
                    >
                      <img src={c.img} alt={c.name} className="absolute inset-0 w-full h-full object-cover z-0" style={{ borderRadius: c.abbr === 'YGO' ? '5px' : '10px' }} />
                      <div className="absolute inset-0 border border-black/10 z-10 pointer-events-none" style={{ borderRadius: c.abbr === 'YGO' ? '5px' : '10px' }} />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="ep-hero-scroll" aria-hidden="true">
          <span className="ep-hero-scroll-label">Scroll</span>
          <span className="ep-hero-scroll-track">
            <span className="ep-hero-scroll-dot" />
          </span>
        </div>
      </section>

      {/* ─── SUPPORTED GAMES — bento grid ─── */}
      <section className="ep-games section-padding">
        <div className="max-w-6xl mx-auto px-4">
          <div className="ep-section-header">
            <h2 className="ep-section-title">
              Todos los TCG que <span className="gradient-text">juegas</span>
            </h2>
            <p className="ep-section-lead">
              Compatibilidad universal. Si tiene carta estándar, lo imprimimos —
              con cortes, sangrado y calidad profesional.
            </p>
          </div>

          <div className="ep-games-grid">
            {SUPPORTED_GAMES.map((g, i) => (
              <Link
                href="/editor"
                key={g.abbr}
                className="ep-game-tile block cursor-pointer"
                style={{
                  '--tile-from': g.from,
                  '--tile-to': g.to,
                  '--tile-accent': g.accent,
                  '--tile-glow': g.glow,
                  animationDelay: `${i * 0.05}s`,
                } as React.CSSProperties}
              >
                <div className="ep-game-tile-bar" aria-hidden />
                <div className="ep-game-tile-watermark" aria-hidden>{g.symbol}</div>
                <div className="flex items-center justify-center mb-5 h-24 mt-2 hover:scale-[1.02]">
                  <img src={g.logo} alt={g.name} className={`max-w-full max-h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)] transition-transform duration-300 group-hover:scale-110 ${g.logoScale || ''}`} />
                </div>
                <div className="ep-game-tile-name">{g.name}</div>
                <div className="ep-game-tile-meta">
                  <span className="ep-game-tile-check">
                    <span className="ep-game-tile-check-dot" />
                    Soportado
                  </span>
                  <span className="ep-game-tile-format">{g.format} · PDF</span>
                </div>
              </Link>
            ))}

            <button
              onClick={() => setContactModalSubject('Nuevo TCG')}
              className="ep-game-tile ep-game-tile-plus text-left w-full cursor-pointer transition-transform hover:scale-[1.02]"
              aria-label="Pedir soporte para un nuevo TCG"
            >
              <div className="ep-game-tile-plus-icon">
                <span>+</span>
              </div>
              <div className="ep-game-tile-plus-title">¿Tu próximo TCG?</div>
              <div className="ep-game-tile-plus-desc">
                Pídenoslo y lo añadimos al catálogo.
              </div>
              <span className="ep-game-tile-plus-arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="section-padding section-alt">
        <div className="max-w-6xl mx-auto px-4">
          <div className="ep-section-header">
            <h2 className="ep-section-title">
              Precios <span className="gradient-text">por volumen</span>
            </h2>
            <p className="ep-section-lead">
              Cuantas más cartas imprimes, más ahorras por unidad. Sin pedido mínimo.
            </p>
          </div>

          <div className="ep-price-grid">
            {PRICE_TIERS.map((tier, i) => (
              <div key={tier.min} className={`ep-price-card${i === 2 ? ' featured' : ''}`}>
                {i === 2 && <div className="ep-price-badge">Más popular</div>}
                <div className="ep-price-range">
                  {tier.max === Infinity ? `${tier.min}+ cartas` : `${tier.min}–${tier.max} cartas`}
                </div>
                <div className="ep-price-value">
                  <span className="ep-price-amount">{tier.price.toFixed(2)}</span>
                  <span className="ep-price-unit">€/carta</span>
                </div>
                {i > 0 && (
                  <div className="ep-price-saving">
                    −{((PRICE_TIERS[0].price - tier.price) / PRICE_TIERS[0].price * 100).toFixed(0)}% vs. unitario
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="ep-ship-section">
            <div className="ep-ship-heading">
              <span className="ep-ship-heading-icon">📦</span>
              <div>
                <div className="ep-ship-heading-title">Costes de envío</div>
                <div className="ep-ship-heading-sub">Salimos desde España · Tracking incluido en todos los envíos</div>
              </div>
            </div>
            <div className="ep-ship-cards">
              {SHIPPING.map(s => (
                <div key={s.zone} className="ep-ship-card">
                  <div className="ep-ship-card-route">
                    <span className="ep-ship-card-origin">🇪🇸</span>
                    <span className="ep-ship-card-line" aria-hidden>
                      <span /><span /><span />
                    </span>
                    <span className="ep-ship-card-dest">{s.flag}</span>
                  </div>
                  <div className="ep-ship-card-zone">{s.zone}</div>
                  <div className="ep-ship-card-price">{s.price}</div>
                  <div className="ep-ship-card-meta">
                    <span>⏱ {s.days}</span>
                    <span className="ep-ship-card-track">✓ Tracking</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="como-funciona" className="section-padding">
        <div className="max-w-5xl mx-auto px-4">
          <div className="ep-section-header">
            <h2 className="ep-section-title">
              De la imagen <span className="gradient-text">a tu puerta</span>
            </h2>
            <p className="ep-section-lead">Cuatro pasos. Sin complicaciones.</p>
          </div>

          <div className="ep-steps-grid">
            <div className="ep-steps-connector" />
            {STEPS.map((s, i) => (
              <div key={s.num} className="ep-step" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="ep-step-badge">
                  <span className="ep-step-num">{s.num}</span>
                </div>
                <div className="ep-step-title">{s.title}</div>
                <div className="ep-step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICE CALCULATOR ─── */}
      <PriceCalc />

      {/* ─── CREAR CARTAS / PROXIES ─── */}
      <section className="section-padding relative">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="bg-[#0b0b0e] border border-white/10 rounded-[2.5rem] p-12 md:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
              <span className="text-[12rem]">🎨</span>
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-white">
                ¿Aún no tienes tus <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 animate-gradient">cartas listas</span>?
              </h2>
              <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Descubre el gran arsenal de web apps con las mejores plantillas. Perfectas para diseñar <strong>Fakemon</strong>, importar <strong>Alt Arts</strong> o maquetar <strong>Proxies</strong> profesionales para imprimir.
              </p>
              <Link href="/crear-cartas" className="cta-primary inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all">
                Ver herramientas de creación <span className="cta-arrow">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section className="ep-contact section-padding section-alt">
        <div className="max-w-5xl mx-auto px-4">
          <div className="ep-contact-inner">
            <div className="ep-contact-content">
              <p className="ep-contact-eyebrow">Comunidad</p>
              <h2 className="ep-contact-title">
                ¿Tienes una <span className="gradient-text">idea nueva?</span>
              </h2>
              <p className="ep-contact-lead">
                EuroProxy lo estamos construyendo con la comunidad TCG.
                Nuevos juegos, funciones, pedidos especiales — todo suma
                y todo lo escuchamos.
              </p>
              <div className="ep-contact-ideas">
                {CONTACT_IDEAS.map(idea => (
                  <button
                    key={idea.label}
                    onClick={() => setContactModalSubject(idea.subject)}
                    className="ep-contact-idea w-full text-left bg-transparent border-none cursor-pointer"
                  >
                    <span className="ep-contact-idea-icon">{idea.icon}</span>
                    <span>{idea.label}</span>
                    <span className="ep-contact-idea-arrow">→</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="ep-contact-visual" aria-hidden>
              <div className="ep-contact-card">
                <div className="ep-contact-card-to">Para: EuroProxy</div>
                <div className="ep-contact-card-from">De: la comunidad TCG</div>
                <div className="ep-contact-card-divider" />
                <div className="ep-contact-card-body">
                  <div className="ep-contact-card-line" style={{ width: '85%' }} />
                  <div className="ep-contact-card-line" style={{ width: '72%' }} />
                  <div className="ep-contact-card-line" style={{ width: '60%' }} />
                </div>
                <div className="ep-contact-card-stamp">💜</div>
              </div>
              <button
                onClick={() => setContactModalSubject('Duda o Sugerencia General')}
                className="cta-primary ep-contact-btn w-full max-w-[200px] justify-center cursor-pointer"
              >
                ✉ Escríbenos
              </button>
              <p className="ep-contact-reply">Respondemos en menos de 24 h</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="ep-cta">
        <div className="ep-cta-bg" />
        <div className="ep-cta-grid" />
        <div className="ep-cta-glow" />

        <div className="ep-cta-inner">
          <h2 className="ep-cta-title">
            ¿Listo para imprimir <span className="gradient-text">tu deck perfecto?</span>
          </h2>
          <p className="ep-cta-lead">
            Únete a miles de jugadores que prueban sus decks con proxies de calidad.
            Sin suscripción, sin mínimos, sin complicaciones.
          </p>
          <Link href="/editor" className="cta-primary ep-cta-button">
            Empezar ahora <span className="cta-arrow">→</span>
          </Link>
          <p className="ep-cta-fine">
            PROXIES no oficiales · Solo para uso casual y testing de decks
          </p>
        </div>
      </section>
    </>
  )
}

function ContactModal({ isOpen, onClose, initialSubject }: { isOpen: boolean, onClose: () => void, initialSubject: string | null }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Error al enviar. Verifica tu conexión.');
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el formulario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111116] border border-white/10 rounded-3xl w-full max-w-lg p-8 shadow-[0_0_100px_rgba(124,58,237,0.15)] animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">Envíanos un mensaje</h3>
          <p className="text-gray-400">¿Tienes dudas, ideas, o un pedido especial? Te responderemos a tu correo en menos de 24 horas.</p>
        </div>

        {success ? (
           <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
             <span className="text-4xl mb-4">✨</span>
             <p className="font-semibold text-lg">¡Mensaje enviado!</p>
             <p className="text-sm mt-2 opacity-80">Te contactaremos lo más pronto posible.</p>
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-lg text-sm">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="email">Tu Correo Electrónico</label>
              <input required type="email" id="email" name="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" placeholder="tucorreo@ejemplo.com" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="subject">Asunto</label>
              <input required type="text" id="subject" name="subject" defaultValue={initialSubject || ''} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" placeholder="Ej: Pedido Especial o Mi TCG" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="message">Mensaje</label>
              <textarea required id="message" name="message" rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none" placeholder="Escribe tu mensaje aquí..."></textarea>
            </div>

            <button type="submit" disabled={loading} className="cta-primary w-full font-bold py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center">
              {loading ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
