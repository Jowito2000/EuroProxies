const GAMES = [
  { name: 'MTG',       icon: '/images/TCGs/MTGIcon.png' },
  { name: 'Pokémon',   icon: '/images/TCGs/PokemonIcon.png' },
  { name: 'Yu-Gi-Oh',  icon: '/images/TCGs/YuGiOhIcon.png' },
  { name: 'Lorcana',   icon: '/images/TCGs/LorcanaIcon.png' },
]

const PRICES = [
  { range: '1–9',    price: '1.50€' },
  { range: '10–49',  price: '1.25€' },
  { range: '50–199', price: '1.00€' },
  { range: '200+',   price: '0.85€', best: true },
]

const SHIPPING = [
  { icon: '/icons/España.png',  zone: 'España',       price: '4,99€' },
  { icon: '/icons/Europe.png',  zone: 'Europa',        price: '11,99€' },
  { icon: '/icons/Mundo.png',   zone: 'Internacional', price: '15,99€' },
]

export default function Footer() {
  return (
    <footer className="footer-main" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="max-w-6xl mx-auto px-4 pt-14 pb-6 relative z-10">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-5">
            <div className="footer-logo mb-2">EuroProxy</div>
            <p className="text-base font-semibold mb-5" style={{ color: '#e2d9f3', lineHeight: 1.6, maxWidth: '340px' }}>
              La plataforma europea de proxies TCG.<br />
              Sube tus imágenes, elige el acabado y recíbelas en casa.
            </p>

            {/* Game badges with real icons */}
            <div className="flex flex-wrap gap-2">
              {GAMES.map(g => (
                <span
                  key={g.name}
                  className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{
                    background: 'rgba(124,58,237,0.12)',
                    border: '1px solid rgba(124,58,237,0.28)',
                    color: '#c4b5fd',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.icon} alt={g.name} style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                  {g.name}
                </span>
              ))}
            </div>
          </div>

          {/* Prices */}
          <div className="md:col-span-4">
            <h4
              className="text-xs font-extrabold uppercase tracking-[0.18em] mb-4 flex items-center gap-2"
              style={{ color: '#a78bfa' }}
            >
              <span style={{ display: 'inline-block', width: '16px', height: '2px', background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: '2px' }} />
              Precio por carta
            </h4>
            <div className="space-y-2">
              {PRICES.map(p => (
                <div
                  key={p.range}
                  className="flex items-center justify-between rounded-lg px-3 py-2"
                  style={{
                    background: p.best ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
                    border: p.best ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <span className="text-sm" style={{ color: p.best ? '#e2d9f3' : 'var(--color-text-muted)' }}>
                    {p.range} cartas
                  </span>
                  <span className="text-sm font-extrabold" style={{ color: p.best ? '#c4b5fd' : '#a78bfa' }}>
                    {p.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div className="md:col-span-3">
            <h4
              className="text-xs font-extrabold uppercase tracking-[0.18em] mb-4 flex items-center gap-2"
              style={{ color: '#a78bfa' }}
            >
              <span style={{ display: 'inline-block', width: '16px', height: '2px', background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: '2px' }} />
              Envíos
            </h4>
            <div className="space-y-2">
              {SHIPPING.map(s => (
                <div
                  key={s.zone}
                  className="flex items-center justify-between rounded-lg px-3 py-2"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.icon} alt={s.zone} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                    {s.zone}
                  </span>
                  <span className="text-sm font-extrabold" style={{ color: '#a78bfa' }}>{s.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="footer-legal-box mb-8">
          <p className="font-bold text-sm mb-1" style={{ color: 'var(--color-accent)' }}>⚠ AVISO LEGAL IMPORTANTE</p>
          <p className="text-xs" style={{ color: 'rgba(245,158,11,0.8)' }}>
            Todos los productos son PROXIES no oficiales. No están afiliados ni aprobados por los editores de los juegos.
            No válidas para torneos oficiales. Solo para uso casual, testing de decks y entretenimiento personal.
          </p>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid rgba(124,58,237,0.12)' }}
        >
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            © {new Date().getFullYear()} EuroProxy · Todos los derechos reservados.
          </span>
          <span
            className="text-sm font-bold tracking-wide"
            style={{
              background: 'linear-gradient(135deg, #a78bfa, #c4b5fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Tu deck, nuestra calidad ✦
          </span>
        </div>
      </div>
    </footer>
  )
}
