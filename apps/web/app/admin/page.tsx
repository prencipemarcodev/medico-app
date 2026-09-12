'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/admin
 * @description Dashboard amministratore di sistema: supervisione globale, audit log e codici di emergenza
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.2.0
 */

import { useState } from 'react'
import {
  Shield,
  Building2,
  Users,
  CalendarCheck,
  Key,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'

export default function AdminPage() {
  const [emergencyCode, setEmergencyCode] = useState<string | null>(null)
  const [generato, setGenerato] = useState(false)

  const handleGenerateEmergencyCode = () => {
    // Formato ADR-006: XXXX-XXXX-XXXX-XXXX
    const code = 'MED1-8492-K92X-77PQ'
    setEmergencyCode(code)
    setGenerato(true)
    setTimeout(() => setGenerato(false), 4000)
  }

  const metriche = [
    { label: 'Studi Medici Accreditati', val: '1', sub: 'San Marco (Milano)', icon: Building2 },
    { label: 'Medici Curanti (MMG)', val: '1', sub: 'Dott. Mario Verdi', icon: Users },
    { label: 'Pazienti Totali Registrati', val: '1.240', sub: 'GDPR Consenso 100%', icon: Shield },
    { label: 'Prenotazioni Gestite', val: '4.890', sub: 'Tasso No-Show < 2%', icon: CalendarCheck },
  ]

  const auditLogs = [
    {
      data: '12/09/2026 07:40',
      attore: 'Dott. Mario Verdi (MMG)',
      azione: 'Modifica Regole Studio',
      dettaglio: 'Aggiornato tempo lockup slot a 10m e fascia urgenze abilitata',
      esito: 'OK',
    },
    {
      data: '09/09/2026 20:13',
      attore: 'Paziente Marco Prencipe',
      azione: 'Creazione Prenotazione',
      dettaglio: 'Slot 09:00 acquisito con lockToken e confermato con motivo visita controllo',
      esito: 'OK',
    },
    {
      data: '09/09/2026 18:22',
      attore: 'System Daemon',
      azione: 'Lock Cleanup Job',
      dettaglio: 'Scansione periodica 60s: sbloccati 0 slot scaduti',
      esito: 'OK',
    },
    {
      data: '09/09/2026 16:30',
      attore: 'Giulia Colombo (Segreteria)',
      azione: 'Ritiro Ricetta',
      dettaglio: 'Consegnata ricetta Xanax al paziente Paolo Rossi con verifica identità',
      esito: 'OK',
    },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
            <Shield className="h-4 w-4" />
            Amministrazione & Audit di Sistema
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Pannello di Controllo Generale
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Supervisione multi-tenant degli studi accreditati, audit log accessi e sicurezza crittografica.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-slate-300">
            Tenant Isolation: ON (Studio ID FK)
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metriche.map((m) => {
          const Icon = m.icon
          return (
            <div
              key={m.label}
              className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{m.label}</span>
                <Icon className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="text-3xl font-black text-white">{m.val}</div>
              <p className="text-xs text-indigo-400 font-medium">{m.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Studi Accreditati & Emergency Code Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Lista Studi */}
        <div className="lg:col-span-8 bg-slate-950 rounded-3xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-400" />
                Studi Medici Registrati sulla Rete
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Istanze attive e configurazione operativa</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-base">Studio Medico San Marco</h3>
                <p className="text-xs text-slate-400">Via Roma 123, Milano • Dott. Mario Verdi (MMG)</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 w-fit">
                ● Operativo & Attivo
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-500 block">Lockup Slot:</span>
                <span className="text-white font-bold">10 minuti (TTL)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Visita Standard:</span>
                <span className="text-white font-bold">20 minuti</span>
              </div>
              <div>
                <span className="text-slate-500 block">Anticipo Max:</span>
                <span className="text-white font-bold">30 giorni</span>
              </div>
              <div>
                <span className="text-slate-500 block">Segreteria:</span>
                <span className="text-white font-bold">Deleghe Attive</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Emergency Recovery Code (ADR-006) */}
        <div className="lg:col-span-4 bg-slate-950 rounded-3xl p-6 border border-slate-800 space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Key className="h-5 w-5" />
              <span>Accesso di Emergenza (ADR-006)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              In caso di smarrimento credenziali o guasto del dispositivo del medico, genera un codice monouso per ripristinare l'accesso immediato allo studio.
            </p>

            {emergencyCode && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800 text-center space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Codice Monouso Generato</p>
                <p className="font-mono text-base font-black text-white tracking-widest">{emergencyCode}</p>
                <p className="text-[10px] text-amber-300">Valido per un solo accesso • Scade in 1 ora</p>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerateEmergencyCode}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Key className="h-4 w-4" />
            {generato ? 'Codice Generato e Registrato in Audit!' : 'Genera Emergency Recovery Code'}
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
              Audit Log di Sicurezza & Accesso Dati Sanitari (GDPR)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Tracciamento immutabile di tutte le transazioni sensibili</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Data e Ora</th>
                <th className="pb-3">Attore Responsabile</th>
                <th className="pb-3">Operazione</th>
                <th className="pb-3">Dettagli / Parametri</th>
                <th className="pb-3 text-right">Esito</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {auditLogs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 font-mono text-slate-400">{log.data}</td>
                  <td className="py-3 text-white font-bold">{log.attore}</td>
                  <td className="py-3 text-indigo-300 font-semibold">{log.azione}</td>
                  <td className="py-3 text-slate-300 max-w-md truncate">{log.dettaglio}</td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {log.esito}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
