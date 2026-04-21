import Link from 'next/link'

const CATEGORIES = [
  {
    title: 'Crear desde cero',
    desc: 'Diseña una carta completamente original. Inventa nuevos ataques, habilidades, estadísticas y sube tu propia ilustración. Perfecto para Fakemon o formatos custom.',
    glow: 'from-purple-500/10',
    border: 'from-purple-500/30',
    badge: { bg: 'linear-gradient(135deg,#7c3aed,#4f46e5)', icon: '/images/TCGs/MTGIcon.png' },
    watermark: '/images/TCGs/PokemonIcon.png',
    hoverBorder: 'hover:border-purple-500/50',
    links: [
      { url: 'https://mtgcardsmith.com/',    name: 'MTG Cardsmith',       game: 'Magic: The Gathering', icon: '/images/TCGs/MTGIcon.png' },
      { url: 'https://pokecardmaker.net/',   name: 'PokéCardMaker',       game: 'Pokémon TCG',          icon: '/images/TCGs/PokemonIcon.png' },
      { url: 'https://yugiohcardmaker.net/', name: 'Yu-Gi-Oh! Card Maker',game: 'Yu-Gi-Oh!',            icon: '/images/TCGs/YuGiOhIcon.png' },
    ],
  },
  {
    title: 'Arte Alternativo',
    desc: 'Mantén las estadísticas reales, pero con ilustraciones épicas, marcos full-art o crossovers geniales. Ideal para dar un toque Premium a tus decks favoritos.',
    glow: 'from-orange-500/10',
    border: 'from-orange-500/30',
    badge: { bg: 'linear-gradient(135deg,#f97316,#dc2626)', icon: '/images/TCGs/LorcanaIcon.png' },
    watermark: '/images/TCGs/Magic.png',
    hoverBorder: 'hover:border-orange-500/50',
    links: [
      { url: 'https://cardconjurer.onrender.com/', name: 'Card Conjurer', game: 'Marcos infinitos (MTG)',              icon: '/images/TCGs/MTGIcon.png' },
      { url: 'https://mpcfill.com/',               name: 'MPC Fill',     game: 'Repositorio gigante de la comunidad', icon: '/images/TCGs/Magic.png' },
      { url: 'https://www.mtg-print.com/',         name: 'MTG Print',    game: 'Generador de hojas listas',           icon: '/images/TCGs/MTGIcon.png' },
    ],
  },
  {
    title: 'Herramientas Profesionales',
    desc: 'Software avanzado y plantillas maestras donde puedes programar visualmente colecciones completas e iterar mecánicas de forma masiva.',
    glow: 'from-blue-500/10',
    border: 'from-blue-500/30',
    badge: { bg: 'linear-gradient(135deg,#3b82f6,#06b6d4)', icon: '/images/TCGs/YuGiOhIcon.png' },
    watermark: '/images/TCGs/Pokemon.png',
    hoverBorder: 'hover:border-blue-500/50',
    links: [
      { url: 'https://magicseteditor.boards.net/', name: 'Magic Set Editor', game: 'Software Desktop (Sets Enteros)',   icon: '/images/TCGs/MTGIcon.png' },
      { url: 'https://www.dextrous.com.au/',       name: 'Dextrous',         game: 'Workflow para Games Designers',    icon: '/images/TCGs/DigimonTCG.png' },
      { url: 'https://limitlesstcg.com/tools/proxies', name: 'Limitless TCG', game: 'Listado rápido de Pokémon',      icon: '/images/TCGs/PokemonIcon.png' },
    ],
  },
]

export default function CrearCartasPage() {
  return (
    <div className="min-h-screen bg-[#060608] pt-28 pb-20 relative overflow-hidden">

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[600px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">

        {/* Header */}
        <div className="text-center mb-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium mb-8 px-4 py-2 rounded-full border transition-colors"
            style={{ color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            ← Volver al inicio
          </Link>
          <div className="ep-section-header">
            <h1 className="ep-section-title" style={{ fontSize: 'clamp(2.5rem,6vw,4.5rem)' }}>
              Construye tus <span className="gradient-text">Proxies</span>
            </h1>
            <p className="ep-section-lead">
              La comunidad TCG ha creado herramientas espectaculares. Ya sea que busques crear desde cero, aplicar arte alternativo o manipular plantillas enteras: este es tu arsenal.
            </p>
          </div>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-10">
          {CATEGORIES.map(cat => (
            <div
              key={cat.title}
              className="group relative backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300"
              style={{ background: 'rgba(13,13,18,0.8)' }}
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${cat.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl`} />
              <div className={`absolute -inset-px bg-gradient-to-b ${cat.border} to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm`} />

              {/* Watermark TCG logo */}
              <div className="absolute top-4 right-4 w-28 h-28 opacity-[0.05] group-hover:opacity-[0.12] transition-all duration-500 pointer-events-none">
                <img src={cat.watermark} alt="" className="w-full h-full object-contain" />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                {/* Icon only, no badge box */}
                <img 
                  src={cat.badge.icon} 
                  alt="" 
                  className="w-14 h-14 object-contain mb-8 filter drop-shadow-[0_4px_12px_rgba(255,255,255,0.1)]" 
                />

                <h2 className="text-2xl font-bold text-white mb-4">{cat.title}</h2>
                <p className="text-sm leading-relaxed flex-grow mb-8" style={{ color: 'var(--color-text-muted)' }}>
                  {cat.desc}
                </p>

                <ul className="space-y-3">
                  {cat.links.map(link => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group/link flex items-center gap-3 p-3 rounded-xl border border-white/5 transition-all duration-300 ${cat.hoverBorder}`}
                        style={{ background: 'rgba(255,255,255,0.04)' }}
                      >
                        {/* Icon removed per request */}
                        <div className="flex-1 min-w-0">
                          <span className="text-white font-semibold block text-sm group-hover/link:text-purple-300 transition-colors">{link.name}</span>
                          <span className="text-xs block mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{link.game}</span>
                        </div>
                        <svg className="shrink-0 w-4 h-4 transition-all transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" style={{ color: 'var(--color-text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <div className="ep-section-header mb-10">
            <h2 className="ep-section-title">
              ¿Imágenes listas? <span className="gradient-text">Despiértalas.</span>
            </h2>
            <p className="ep-section-lead">
              Sube tus creaciones en JPG, PNG o WEBP directo a nuestro editor. Nos encargamos de que luzcan idénticas al feel & touch de las reales en tu mesa de juego.
            </p>
          </div>

          <div className="flex justify-center items-center gap-4 mb-10 flex-wrap">
            {[
              { src: '/images/TCGs/MTGIcon.png',      label: 'MTG' },
              { src: '/images/TCGs/PokemonIcon.png',  label: 'Pokémon' },
              { src: '/images/TCGs/YuGiOhIcon.png',   label: 'Yu-Gi-Oh!' },
              { src: '/images/TCGs/LorcanaIcon.png',  label: 'Lorcana' },
              { src: '/images/TCGs/StarWarsUnlimited.png', label: 'Star Wars' },
            ].map(tcg => (
              <div key={tcg.label} className="flex flex-col items-center gap-2 group/icon">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center p-3 transition-all duration-300"
                  style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}
                >
                  <img src={tcg.src} alt={tcg.label} className="w-full h-full object-contain opacity-70 transition-opacity" />
                </div>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{tcg.label}</span>
              </div>
            ))}
          </div>

          <Link href="/editor" className="cta-primary inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all">
            Ir al Editor para Imprimir
            <span className="cta-arrow">→</span>
          </Link>
        </div>

      </div>
    </div>
  )
}
