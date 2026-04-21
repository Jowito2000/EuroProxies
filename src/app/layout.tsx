import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AuthProvider from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'EuroProxy – Proxies TCG de calidad',
  description: 'Imprime proxies de cartas TCG (MTG, Pokémon, Yu-Gi-Oh, Lorcana) y recíbelas en casa. Uso casual y testing de decks.',
  icons: {
    icon: '/iconSimply.png',
    shortcut: '/iconSimply.png',
    apple: '/iconSimply.png',
  },
  openGraph: {
    title: 'EuroProxy – Proxies TCG de calidad',
    description: 'Proxies para testing de decks. No válidas para torneos oficiales.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
