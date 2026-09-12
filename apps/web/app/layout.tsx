/**
 * @file        layout.tsx
 * @module      @medico/web
 * @description Root layout Next.js — font, metadata, providers globali
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 */

import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'Studio Medico — Dashboard',
  description: 'Gestione prenotazioni e richieste dello studio medico',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-gray-50 antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
