'use client'

/**
 * @file        layout.tsx
 * @module      @medico/web/segreteria
 * @description Layout per la postazione di segreteria e front-desk operativo
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.2.0
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  Users,
  CalendarDays,
  FileCheck,
  Radio,
  LogOut,
  Bell,
  CheckCircle2,
  Clock,
  PhoneCall,
  UserCheck,
  Search,
} from 'lucide-react'

export default function SegreteriaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/segreteria',
      label: "Sala d'Attesa & Sportello",
      icon: Users,
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
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar Segreteria */}
      <aside className="w-72 flex-shrink-0 flex flex-col border-r border-slate-200 bg-white shadow-sm z-10">
        {/* Studio Branding */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-100 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
          <div className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight tracking-tight">Postazione Sportello</h1>
            <p className="text-xs text-amber-100 font-medium">Segreteria • San Marco</p>
          </div>
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
            <Link
              href="/login"
              title="Esci"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="h-20 flex-shrink-0 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <UserCheck className="h-3.5 w-3.5 text-amber-600" />
              Postazione Operativa Segreteria • Accettazione e Sportello Attivi
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800">Orario Sportello: 08:30 - 13:00</p>
              <p className="text-[11px] text-slate-500">Linea telefonica attiva</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  )
}
