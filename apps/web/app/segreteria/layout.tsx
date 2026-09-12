'use client'

/**
 * @file        layout.tsx
 * @module      @medico/web/segreteria
 * @description Layout per la postazione di segreteria e front-desk operativo
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.3.0
 */

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Search,
  CalendarDays,
  FileCheck,
  Radio,
  Building2,
  PhoneCall,
  UserCheck,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { AppLogo } from '@/components/AppLogo'

export default function SegreteriaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuAperto, setMobileMenuAperto] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      window.location.href = '/login'
    }
  }

  const navItems = [
    {
      href: '/segreteria',
      label: 'Panoramica Studio',
      icon: Building2,
    },
    {
      href: '/segreteria/pazienti',
      label: 'Ricerca Pazienti & Scheda',
      icon: Search,
    },
    {
      href: '/segreteria/agenda',
      label: 'Agenda Giornaliera',
      icon: CalendarDays,
    },
    {
      href: '/segreteria/richieste',
      label: 'Coda Ricette & Ritiro',
      icon: FileCheck,
      badge: '3',
    },
    {
      href: '/segreteria/broadcast',
      label: 'Invia Avviso Ritardo',
      icon: Radio,
    },
  ]

  return (
    <div className="flex h-[100dvh] min-h-[100dvh] overflow-hidden bg-slate-50 font-sans">
      {/* Overlay mobile */}
      {mobileMenuAperto && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuAperto(false)}
        />
      )}

      {/* Sidebar Segreteria Responsive */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex-shrink-0 flex flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 md:static md:translate-x-0 pt-safe pb-safe ${
          mobileMenuAperto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Studio Branding */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <AppLogo size={36} />
            <div>
              <h1 className="font-bold text-base leading-tight tracking-tight">Sportello</h1>
              <p className="text-xs text-amber-400 font-medium">Segreteria Studio</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuAperto(false)}
            className="md:hidden p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Operazioni Front-Desk
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuAperto(false)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive
                        ? 'bg-white text-amber-800'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}

          <div className="pt-6 px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Medico di Riferimento
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <p className="font-bold text-slate-900">Medico Titolare</p>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> In Studio
            </p>
            <p className="text-[11px] text-slate-400">Ambulatorio Libero</p>
          </div>
        </div>

        {/* Staff profile */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-3 rounded-2xl border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center border border-amber-200">
              ST
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">Operatore Studio</p>
              <p className="text-[11px] text-slate-500 truncate">Postazione Segreteria</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Esci dalla piattaforma"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <header className="h-16 md:h-20 flex-shrink-0 flex items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 md:px-8 gap-3 pt-safe">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuAperto(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Apri menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] md:text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 truncate">
              <UserCheck className="h-3 w-3 md:h-3.5 md:w-3.5 text-amber-600 flex-shrink-0" />
              <span className="truncate">Segreteria • Sportello Attivo</span>
            </span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] md:text-xs font-bold text-slate-800">08:30 - 13:00</p>
              <p className="text-[10px] md:text-[11px] text-slate-500">Sportello</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Disconnetti e torna al Login"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Esci</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">{children}</main>
      </div>
    </div>
  )
}
