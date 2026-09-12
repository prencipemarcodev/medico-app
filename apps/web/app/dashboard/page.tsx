'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/dashboard
 * @description Panoramica principale dello studio medico con KPI, timeline visite e richieste urgenti
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.2.0
 */

import Link from 'next/link'
import {
  Users,
  CalendarCheck,
  Clock,
  AlertCircle,
  FileText,
  Pill,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  UserCheck,
  Stethoscope,
  Phone,
  Radio,
} from 'lucide-react'

interface KpiItem {
  label: string
  value: string
  sub: string
  icon: any
  color: string
  trend?: string | null
  badge?: string | null
}

export default function DashboardPage() {
  const kpis: KpiItem[] = [
    {
      label: 'Visite Oggi',
      value: '0',
      sub: 'Nessuna visita in programma',
      icon: CalendarCheck,
      color: 'blue',
      trend: null,
    },
    {
      label: 'Slot Liberi',
      value: '0',
      sub: 'Genera slot da Onboarding o Agenda',
      icon: Clock,
      color: 'emerald',
      trend: null,
    },
    {
      label: 'Coda Richieste',
      value: '0',
      sub: 'Nessuna richiesta da evadere',
      icon: AlertCircle,
      color: 'amber',
      badge: null,
    },
    {
      label: 'Pazienti Curati',
      value: '0',
      sub: 'In attesa di registrazione',
      icon: Users,
      color: 'indigo',
      trend: null,
    },
  ]

  const agendaOggi: Array<{
    ora: string
    paziente: string
    motivo: string
    tipo: string
    stato: 'completata' | 'in_attesa' | 'confermata' | 'bloccato' | 'libero'
  }> = []

  const richiesteUrgenti: Array<{
    id: string
    tipo: string
    paziente: string
    data: string
    dettaglio: string
    badgeColor: string
    icon: any
  }> = []

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-1">
            <span>Pannello Medico Curante</span>
            <span>•</span>
            <span className="text-blue-600 font-semibold">Studio Medico di Medicina Generale</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pannello di Controllo Giornaliero
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/broadcast"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
          >
            <Radio className="h-4 w-4 text-amber-500" />
            Invia Broadcast
          </Link>
          <Link
            href="/dashboard/agenda"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <CalendarCheck className="h-4 w-4" />
            Gestisci Agenda
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {kpi.label}
                </span>
                <div className={`p-2.5 rounded-2xl bg-${kpi.color}-50 text-${kpi.color}-600 border border-${kpi.color}-100`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {kpi.value}
              </div>
              <p className="mt-1 text-xs text-slate-500 font-medium">{kpi.sub}</p>
              {kpi.trend && (
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  <span className="text-emerald-600">●</span> {kpi.trend}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Main Grid: Agenda Oggi + Coda Richieste */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Agenda in Tempo Reale */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-blue-600" />
                Agenda Visite di Oggi
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Aggiornamento live slot e presenze studio</p>
            </div>
            <Link
              href="/dashboard/agenda"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Vedi calendario completo <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {agendaOggi.length === 0 ? (
              <div className="p-10 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <CalendarCheck className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Nessuna visita in programma per oggi</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Non ci sono ancora appuntamenti fissati per la giornata odierna. Le nuove prenotazioni effettuate dai pazienti o dalla segreteria appariranno qui in tempo reale.
                </p>
              </div>
            ) : (
              agendaOggi.map((slot, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    slot.stato === 'completata'
                      ? 'bg-slate-50/70 border-slate-200 text-slate-500 opacity-80'
                      : slot.stato === 'bloccato'
                      ? 'bg-amber-50/50 border-amber-200/80'
                      : slot.stato === 'libero'
                      ? 'bg-white border-dashed border-slate-300 hover:border-blue-400'
                      : 'bg-white border-slate-200 shadow-sm hover:border-blue-500'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="font-mono text-xs font-bold text-slate-700 w-24">
                      {slot.ora}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{slot.paziente}</span>
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          {slot.tipo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{slot.motivo}</p>
                    </div>
                  </div>

                  <div>
                    {slot.stato === 'completata' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Visita Chiusa
                      </span>
                    )}
                    {slot.stato === 'in_attesa' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        In Sala d'Attesa
                      </span>
                    )}
                    {slot.stato === 'confermata' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Confermata
                      </span>
                    )}
                    {slot.stato === 'bloccato' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        <Clock className="h-3.5 w-3.5 animate-spin" />
                        In Prenotazione
                      </span>
                    )}
                    {slot.stato === 'libero' && (
                      <span className="text-xs font-semibold text-slate-400">Libero</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Richieste Pendenti */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Richieste in Coda (FIFO)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Malattia, prescrizioni e certificati</p>
            </div>
            <Link
              href="/dashboard/richieste"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Gestisci tutte <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4 flex-1">
            {richiesteUrgenti.length === 0 ? (
              <div className="p-10 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <AlertCircle className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Nessuna richiesta in coda</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Al momento non ci sono richieste di rinnovo farmaci o certificati inviate dai pazienti.
                </p>
              </div>
            ) : (
              richiesteUrgenti.map((req) => {
                const Icon = req.icon
                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${req.badgeColor}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {req.tipo.toUpperCase()}
                        </span>
                        <span className="font-bold text-sm text-slate-900">{req.paziente}</span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400">{req.data}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium bg-white p-2.5 rounded-xl border border-slate-100">
                      {req.dettaglio}
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Link
                        href="/dashboard/richieste"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        Emetti / Valuta
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Broadcast Quick Tip */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100/80">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-600 text-white">
                <Radio className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Comunicazione Imprevisti</p>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  In caso di ritardo o chiusura urgente, puoi inviare una notifica push a tutti i pazienti prenotati oggi con 1 click.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
