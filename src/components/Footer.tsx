export default function Footer() {
  return (
    <footer className="footer-main" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] select-none flex items-center justify-center -z-10">
        <img src="/iconSimply.png" alt="" className="max-w-[400px] w-full object-contain" />
      </div>
      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          <div className="md:col-span-2">
            <div className="footer-logo mb-3">EuroProxy</div>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, maxWidth: '320px' }}>
              La plataforma europea de proxies TCG de calidad.
              Sube tus imágenes, elige acabado y recíbelas en casa.
            </p>
            <div className="flex gap-3 flex-wrap">
              {['MTG', 'Pokémon', 'Yu-Gi-Oh', 'Lorcana', 'One Piece'].map(g => (
                <span
                  key={g}
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#a78bfa' }}
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              Envíos
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <li className="flex justify-between">
                <span>España</span>
                <span style={{ color: '#c4b5fd' }}>4,99€</span>
              </li>
              <li className="flex justify-between">
                <span>Europa</span>
                <span style={{ color: '#c4b5fd' }}>11,99€</span>
              </li>
              <li className="flex justify-between">
                <span>Internacional</span>
                <span style={{ color: '#c4b5fd' }}>15,99€</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              Precios
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <li className="flex justify-between"><span>1–9 cartas</span><span style={{ color: '#c4b5fd' }}>1.50€</span></li>
              <li className="flex justify-between"><span>10–49 cartas</span><span style={{ color: '#c4b5fd' }}>1.25€</span></li>
              <li className="flex justify-between"><span>50–199 cartas</span><span style={{ color: '#c4b5fd' }}>1.00€</span></li>
              <li className="flex justify-between"><span>200+ cartas</span><span style={{ color: '#c4b5fd' }}>0.85€</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-legal-box mb-6">
          <p className="font-bold text-sm mb-1" style={{ color: 'var(--color-accent)' }}>
            ⚠ AVISO LEGAL IMPORTANTE
          </p>
          <p className="text-xs" style={{ color: 'rgba(245,158,11,0.8)' }}>
            Todos los productos son PROXIES no oficiales. No están afiliados ni aprobados por los editores de los juegos.
            No válidas para torneos oficiales. Solo para uso casual, testing de decks y entretenimiento personal.
          </p>
        </div>

        <div
          className="pt-4 pb-4 grid grid-cols-3 items-end text-xs gap-4"
          style={{ borderTop: '1px solid rgba(124,58,237,0.12)', color: 'var(--color-text-muted)' }}
        >
          <span className="pb-2">© {new Date().getFullYear()} EuroProxy. Todos los derechos reservados.</span>
          <div className="flex justify-center items-end overflow-hidden" style={{ height: '80px' }}>
            <img src="/favicon.png" alt="EuroProxy" className="w-56 object-contain object-bottom opacity-30" style={{ height: '224px', marginBottom: '-60px' }} />
          </div>
          <span className="text-right pb-2" style={{ color: 'rgba(124,58,237,0.5)' }}>Tu deck, nuestra calidad</span>
        </div>
      </div>
    </footer>
  )
}
