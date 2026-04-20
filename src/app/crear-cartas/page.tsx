import Link from 'next/link'

export default function CrearCartasPage() {
  return (
    <div className="min-h-screen bg-[#060608] pt-28 pb-20 relative overflow-hidden text-gray-200">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[600px] h-[500px] bg-orange-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors mb-8 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 glass-panel">
            <span>←</span> Volver al inicio
          </Link>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Construye tus <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 animate-gradient">Proxies</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            La comunidad TCG ha creado herramientas espectaculares. Ya sea que busques crear desde cero, aplicar de arte alternativo o manipular plantillas enteras: este es tu arsenal.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-10">
          
          {/* Categoría 1: Crear desde cero */}
          <div className="group relative bg-[#0d0d12]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
            <div className="absolute -inset-px bg-gradient-to-b from-purple-500/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
            
            <div className="absolute top-4 right-6 text-7xl opacity-5 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 transform origin-bottom-right">🎨</div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="inline-flex shadow-lg shadow-purple-500/20 items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white mb-8 border border-white/10">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Crear desde cero</h2>
              <p className="text-gray-400 mb-8 text-sm leading-relaxed flex-grow">
                Diseña una carta completamente originial. Inventa nuevos ataques, habilidades, estadísticas y sube tu propia ilustración. Perfecto para Fakemon o formatos custom.
              </p>
              <ul className="space-y-3">
                <PlatformLink url="https://mtgcardsmith.com/" name="MTG Cardsmith" game="Magic: The Gathering" color="hover:border-purple-500/50" />
                <PlatformLink url="https://pokecardmaker.net/" name="PokéCardMaker" game="Pokémon TCG" color="hover:border-purple-500/50" />
                <PlatformLink url="https://yugiohcardmaker.net/" name="Yu-Gi-Oh! Card Maker" game="Yu-Gi-Oh!" color="hover:border-purple-500/50" />
              </ul>
            </div>
          </div>

          {/* Categoría 2: Alt Art / Promos */}
          <div className="group relative bg-[#0d0d12]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
            <div className="absolute -inset-px bg-gradient-to-b from-orange-500/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />

            <div className="absolute top-4 right-6 text-7xl opacity-5 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 transform origin-bottom-right">🖼️</div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="inline-flex shadow-lg shadow-orange-500/20 items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white mb-8 border border-white/10">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Arte Alternativo</h2>
              <p className="text-gray-400 mb-8 text-sm leading-relaxed flex-grow">
                Mantén las estadísticas reales, pero con ilustraciones épicas, marcos full-art o crossovers geniales. Ideal para dar un toque Premium a tus decks favoritos.
              </p>
              <ul className="space-y-3">
                <PlatformLink url="https://cardconjurer.onrender.com/" name="Card Conjurer" game="Marcos infinitos (MTG)" color="hover:border-orange-500/50" />
                <PlatformLink url="https://mpcfill.com/" name="MPC Fill" game="Repositorio gigante de la comunidad" color="hover:border-orange-500/50" />
                <PlatformLink url="https://www.mtg-print.com/" name="MTG Print" game="Generador de hojas listas" color="hover:border-orange-500/50" />
              </ul>
            </div>
          </div>

          {/* Categoría 3: General / Plantillas */}
          <div className="group relative bg-[#0d0d12]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300">
             <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
             <div className="absolute -inset-px bg-gradient-to-b from-blue-500/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />

             <div className="absolute top-4 right-6 text-7xl opacity-5 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 transform origin-bottom-right">🛠️</div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="inline-flex shadow-lg shadow-blue-500/20 items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white mb-8 border border-white/10">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Herramientas Profesionales</h2>
              <p className="text-gray-400 mb-8 text-sm leading-relaxed flex-grow">
                Software avanzado y plantillas maestras donde puedes programar visualmente colecciones completas e iterar mecánicas de forma masiva.
              </p>
              <ul className="space-y-3">
                <PlatformLink url="https://magicseteditor.boards.net/" name="Magic Set Editor" game="Software Desktop (Sets Enteros)" color="hover:border-blue-500/50" />
                <PlatformLink url="https://www.dextrous.com.au/" name="Dextrous" game="Workflow para Games Designers" color="hover:border-blue-500/50" />
                <PlatformLink url="https://limitlesstcg.com/tools/proxies" name="Limitless TCG" game="Listado rápido de Pokémon" color="hover:border-blue-500/50" />
              </ul>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-24 text-center relative max-w-4xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
          <div className="relative bg-[#111116] border border-white/10 rounded-3xl p-12 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[url('/grain.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            <h3 className="text-3xl font-extrabold text-white mb-4 tracking-tight">¿Imágenes Listas? Despiértalas.</h3>
            <p className="text-gray-400 mb-10 text-lg max-w-2xl mx-auto">
              Sube tus creaciones en JPG, PNG o WEBP directo a nuestro editor. Nosotros nos encargamos de que luzcan idénticas al feel & touch de las reales en tu mesa de juego.
            </p>
            <Link href="/editor" className="cta-primary inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all">
              Ir al Editor para Imprimir 
              <span className="cta-arrow">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlatformLink({ url, name, game, color }: { url: string, name: string, game: string, color: string }) {
  return (
    <li>
      <a href={url} target="_blank" rel="noopener noreferrer" className={`group/link flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 ${color} transition-all duration-300`}>
        <div>
          <span className="text-white font-semibold block text-[15px] group-hover/link:text-transparent group-hover/link:bg-clip-text group-hover/link:bg-gradient-to-r group-hover/link:from-white group-hover/link:to-gray-400">{name}</span>
          <span className="text-xs text-gray-500 mt-1 block">{game}</span>
        </div>
        <svg className="w-5 h-5 text-gray-600 group-hover/link:text-white transition-colors transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
      </a>
    </li>
  )
}
