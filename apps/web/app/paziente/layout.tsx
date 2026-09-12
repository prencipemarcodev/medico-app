'use client'

/**
 * @file        layout.tsx
 * @module      @medico/web/paziente
 * @description Layout per il portale paziente web desktop/tablet
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.2.0
 */

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

export default function PazienteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const nav = [
    { href: '/paziente', label: 'La Mia Salute' },
    { href: '/paziente/prenota', label: 'Prenota Visita' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/paziente" className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-lg tracking-tight block">
                Portale Sanitario Paziente
              </span>
              <span className="text-xs text-slate-400 font-medium">Studio Medico San Marco</span>
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
              <p className="text-xs font-bold text-slate-900">Marco Prencipe</p>
              <p className="text-[11px] text-slate-500">Curato: Dott. Mario Verdi</p>
            </div>
            <Link
              href="/login"
              title="Esci"
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>Studio Medico San Marco • Via Roma 123, Milano • Telefono: +39 02 1234567</p>
        <p className="mt-1 text-[11px] text-slate-400">Dati protetti conformemente al GDPR Regolamento UE 2016/679</p>
      </footer>
    </div>
  )
}
