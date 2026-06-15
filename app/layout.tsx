import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HorizonEnergie — Conformité tertiaire & BACS',
  description: 'Pilotez votre conformité au décret tertiaire et BACS. OPERAT, ENEDIS, CEE.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
