'use client'

/**
 * @file        layout.tsx
 * @module      @medico/web/admin
 * @description Layout per l'amministratore di sistema con audit log e indicatori di salute piattaforma
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.2.0
 */

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
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
      {/* Sidebar Admin */}
      <aside className="w-72 flex-shrink-0 flex flex-col border-r border-slate-800 bg-slate-950 shadow-2xl z-10">
        {/* Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-900">
          <div className="h-11 w-11 rounded-xl bg-indigo-600/30 flex items-center justify-center border border-indigo-500/40 text-indigo-400">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-base leading-tight tracking-tight text-white">
              Supervisione Piattaforma
            </h1>
            <p className="text-xs text-indigo-400 font-medium">Console Amministrazione Globale</p>
          </div>
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
            <span>Audit Log Accessi Dati Sanitari</span>
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
            <Link
              href="/login"
              title="Esci"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-900">
        <header className="h-20 flex-shrink-0 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-8">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
              <Activity className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
              Ambiente di Produzione • Tutti i Nodi Operativi
            </span>
          </div>

          <div className="text-right">
            <p className="text-xs font-bold text-slate-200">Database: medico_app (Postgres 16.15)</p>
            <p className="text-[11px] text-slate-400">Latenza query: 1.2 ms</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  )
}
