'use client'

/**
 * @file        layout.tsx
 * @module      @medico/web/paziente
 * @description Layout per il portale paziente web desktop/tablet
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.2.0
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HeartPulse,
  CalendarCheck,
  ClipboardList,
  FileText,
  User,
  LogOut,
  Stethoscope,
  Phone,
  MapPin,
} from 'lucide-react'
import { AppLogo } from '@/components/AppLogo'

export default function PazienteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated && d.user) {
          setUser(d.user)
        }
      })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      window.location.href = '/login'
    }
  }

  const nav = [
    { href: '/paziente', label: 'La Mia Salute' },
    { href: '/paziente/prenota', label: 'Prenota Visita' },
  ]

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs pt-safe">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/paziente" className="flex items-center gap-3">
            <AppLogo size={42} />
            <div>
              <span className="font-black text-slate-900 text-lg tracking-tight block">
                Portale Sanitario Paziente
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {user?.nomeStudio ? user.nomeStudio : 'Studio Medico Curante'}
              </span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="hidden sm:flex items-center gap-2">
            {nav.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Patient pill & logout */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">
                {user ? `${user.nome} ${user.cognome}` : 'Paziente'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {user?.codiceFiscale || (user?.studioId ? 'Associato' : 'In attesa studio')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Esci dalla piattaforma"
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 pb-24 sm:pb-8">{children}</main>

      {/* Bottom Nav Mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-lg">
        {nav.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl text-xs font-bold transition-all ${
                isActive ? 'text-emerald-600 font-black' : 'text-slate-500'
              }`}
            >
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] text-center text-xs text-slate-400 mb-16 sm:mb-0">
        <p>Studio Medico • Piattaforma Sanitaria Integrata</p>
        <p className="mt-1 text-[11px] text-slate-400">Dati protetti conformemente al GDPR Regolamento UE 2016/679</p>
      </footer>
    </div>
  )
}
