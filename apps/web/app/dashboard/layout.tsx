'use client'

/**
 * @file        layout.tsx
 * @module      @medico/web/dashboard
 * @description Layout professionale della dashboard con sidebar, navigazione attiva e profilo medico
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.2.0
 */

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Radio,
  Users,
  ShieldCheck,
  Bell,
  LogOut,
  Stethoscope,
  ChevronRight,
  Clock,
  Settings,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Panoramica', icon: LayoutDashboard },
  { href: '/dashboard/agenda', label: 'Agenda & Slot', icon: CalendarDays },
  { href: '/dashboard/pazienti', label: 'Cartella Pazienti', icon: Users },
  { href: '/dashboard/richieste', label: 'Coda Richieste', icon: ClipboardList, badge: '3' },
  { href: '/dashboard/broadcast', label: 'Broadcast Avvisi', icon: Radio },
  { href: '/dashboard/impostazioni', label: 'Impostazioni Studio', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuAperto, setMobileMenuAperto] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Overlay mobile */}
      {mobileMenuAperto && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuAperto(false)}
        />
      )}

      {/* Sidebar Responsive */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex-shrink-0 flex flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 md:static md:translate-x-0 ${
          mobileMenuAperto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Studio Branding */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight tracking-tight">Studio Medico</h1>
            <p className="text-xs text-blue-100 font-medium">San Marco • Milano</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Menu Principale
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive
                        ? 'bg-white text-blue-700'
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
            Gestione & Sicurezza
          </div>
          <div className="px-3 py-2 text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>GDPR Compliance: Attiva</span>
          </div>
          <div className="px-3 py-1 text-xs text-slate-400 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>Lock Slot: 10 min TTL</span>
          </div>
        </div>

        {/* Doctor profile card in footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-3 rounded-2xl border">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center border border-blue-200">
                MV
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">Dott. Mario Verdi</p>
              <p className="text-[11px] text-slate-500 truncate">MMG Curante</p>
            </div>
            <Link
              href="/login"
              title="Disconnetti"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 sm:h-20 flex-shrink-0 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuAperto(!mobileMenuAperto)}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 md:hidden"
              aria-label="Apri menu"
            >
              {mobileMenuAperto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 truncate max-w-[200px] sm:max-w-none">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Studio Operativo • MMG
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
            </button>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-800">Mercoledì, 9 Settembre</p>
              <p className="text-[11px] text-slate-500">Orario visite: 09:00 - 13:00</p>
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
