'use client'

/**
 * @file        layout.tsx
 * @module      @medico/web/admin
 * @description Layout per l'amministratore di sistema con audit log e indicatori di salute piattaforma
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.3.0
 */

import { useState } from 'react'
import Link from 'next/link'
import {
  Shield,
  Building2,
  Database,
  Lock,
  FileSpreadsheet,
  Activity,
  LogOut,
  Server,
  Key,
  Menu,
  X,
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuAperto, setMobileMenuAperto] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      window.location.href = '/login'
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
      {/* Overlay mobile */}
      {mobileMenuAperto && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuAperto(false)}
        />
      )}

      {/* Sidebar Admin Responsive */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex-shrink-0 flex flex-col border-r border-slate-800 bg-slate-950 shadow-2xl transition-transform duration-300 md:static md:translate-x-0 ${
          mobileMenuAperto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-indigo-600/30 flex items-center justify-center border border-indigo-500/40 text-indigo-400">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-base leading-tight tracking-tight text-white">
                Supervisione
              </h1>
              <p className="text-xs text-indigo-400 font-medium">Console Amministrazione</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuAperto(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Gestione Rete
          </div>

          <div className="px-3.5 py-3 rounded-xl text-sm font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-600/20 flex items-center gap-3">
            <Building2 className="h-5 w-5" />
            <span>Studi Medici Accreditati</span>
          </div>

          <div className="px-3 pb-2 pt-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Sicurezza & GDPR (Art. 9)
          </div>

          <div className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-3">
            <Key className="h-4 w-4 text-amber-400" />
            <span>Emergency Codes (ADR-006)</span>
          </div>

          <div className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-3">
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>Audit Log Accessi Sanitari</span>
          </div>

          <div className="px-3 pb-2 pt-6 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Stato Infrastruttura
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">PostgreSQL 16:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Attivo
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Job Lock Cleanup:</span>
              <span className="text-blue-400 font-mono text-[11px]">Ogni 60s (OK)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Multi-tenant:</span>
              <span className="text-slate-300 font-semibold">Isolato (UUID)</span>
            </div>
          </div>
        </div>

        {/* Footer profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 m-3 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-950 text-indigo-400 font-bold flex items-center justify-center border border-indigo-800">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">Super Admin</p>
              <p className="text-[11px] text-slate-400 truncate">Sistemista Piattaforma</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Esci dalla piattaforma"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-900 min-w-0">
        <header className="h-16 md:h-20 flex-shrink-0 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 md:px-8 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuAperto(true)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700"
              aria-label="Apri menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] md:text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 truncate">
              <Activity className="h-3 w-3 md:h-3.5 md:w-3.5 text-indigo-400 animate-pulse flex-shrink-0" />
              <span className="truncate">Produzione • Operativo</span>
            </span>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] md:text-xs font-bold text-slate-200">PostgreSQL 16</p>
              <p className="text-[10px] md:text-[11px] text-emerald-400 font-medium">1.2 ms latenza</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 border border-slate-700 hover:border-rose-800/80 text-slate-300 hover:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Disconnetti e torna al Login"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Esci</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
