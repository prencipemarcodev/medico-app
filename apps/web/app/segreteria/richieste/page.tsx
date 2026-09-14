'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/segreteria/richieste
 * @description Gestione sportello segreteria per ritiro ricette cartacee, certificati e stato prescrizioni
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.2.0
 */

import { useState } from 'react'
import {
  FileCheck,
  Search,
  CheckCircle2,
  Clock,
  Pill,
  FileText,
  Printer,
  PackageCheck,
  PhoneCall,
  User,
  AlertCircle,
  Filter,
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export default function SegreteriaRichiestePage() {
  const toast = useToast()
  const [filtro, setFiltro] = useState<'tutte' | 'da_ritirare' | 'consegnate' | 'digitali'>('tutte')
  const [searchQuery, setSearchQuery] = useState('')

  const [richieste, setRichieste] = useState<
    Array<{
      id: string
      paziente: string
      cf: string
      telefono: string
      tipo: string
      titolo: string
      dettagli: string
      emessaIl: string
      stato: 'da_ritirare' | 'digitale' | 'consegnata'
      modalita: string
      noteDesk: string
    }>
  >([])

  const handleConsegna = (id: string) => {
    setRichieste((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              stato: 'consegnata',
              noteDesk: `Consegnato allo sportello oggi alle ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            }
          : r
      )
    )
  }

  const richiesteFiltrate = richieste.filter((r) => {
    const matchesFilter =
      filtro === 'tutte' ||
      (filtro === 'da_ritirare' && r.stato === 'da_ritirare') ||
      (filtro === 'consegnate' && r.stato === 'consegnata') ||
      (filtro === 'digitali' && r.stato === 'digitale')

    const matchesSearch =
      r.paziente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cf.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.titolo.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            <FileCheck className="h-4 w-4" />
            Coda Ricette e Documenti da Sportello
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Ritiro Prescrizioni & Certificati
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestione consegne fisiche ai pazienti in sala d'attesa e verifica invio NRE digitali
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca per paziente, CF o farmaco..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white shadow-xs"
            />
        </div>
      </div>

      {/* Counters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Da Ritirare allo Sportello
            </span>
            <PackageCheck className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">
            {richieste.filter((r) => r.stato === 'da_ritirare').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Buste pronte per consegna al banco</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Prescrizioni Digitali
            </span>
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-600 mt-2">
            {richieste.filter((r) => r.stato === 'digitale').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">NRE generati e visibili in app</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Consegnate Oggi
            </span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {richieste.filter((r) => r.stato === 'consegnata').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Documenti già ritirati con firma</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { id: 'tutte', label: 'Tutte le richieste' },
          { id: 'da_ritirare', label: 'Da Ritirare al Banco' },
          { id: 'digitali', label: 'Inviate Digitalmente' },
          { id: 'consegnate', label: 'Già Consegnate' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFiltro(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              filtro === tab.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {richiesteFiltrate.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <PackageCheck className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-800">Nessuna richiesta presente in questa vista</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Le richieste di ricette, esami o certificati inviate dai pazienti compariranno automaticamente qui per essere evase dallo sportello.
            </p>
          </div>
        ) : (
          richiesteFiltrate.map((r) => {
          const isDaRitirare = r.stato === 'da_ritirare'
          const isConsegnata = r.stato === 'consegnata'
          const isDigitale = r.stato === 'digitale'

          return (
            <div
              key={r.id}
              className={`p-6 rounded-3xl border transition-all bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                isDaRitirare ? 'border-amber-200 ring-1 ring-amber-500/10' : 'border-slate-200/80'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                      isDaRitirare
                        ? 'bg-amber-100 text-amber-800'
                        : isConsegnata
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {isDaRitirare && <Clock className="h-3 w-3" />}
                    {isConsegnata && <CheckCircle2 className="h-3 w-3" />}
                    {isDigitale && <FileText className="h-3 w-3" />}
                    {isDaRitirare ? 'Pronta al Banco' : isConsegnata ? 'Consegnata' : 'Digitale'}
                  </span>

                  <span className="text-xs font-bold text-slate-400">• Emessa {r.emessaIl}</span>
                  <span className="text-xs font-medium text-slate-500">• {r.modalita}</span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{r.titolo}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{r.dettagli}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
                  <span className="flex items-center gap-1 text-slate-900 font-bold">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    {r.paziente}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{r.cf}</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <PhoneCall className="h-3.5 w-3.5 text-slate-400" />
                    {r.telefono}
                  </span>
                </div>

                {r.noteDesk && (
                  <p className="text-[11px] font-medium text-amber-700 bg-amber-50/70 px-3 py-1.5 rounded-xl border border-amber-100/80 inline-block mt-1">
                    Posizione: {r.noteDesk}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isDaRitirare && (
                  <button
                    type="button"
                    onClick={() => handleConsegna(r.id)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <PackageCheck className="h-4 w-4" />
                    Segna Consegnata al Paziente
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => toast.info('Stampa promemoria', `Invio comando di stampa promemoria per ${r.paziente}...`)}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                  title="Stampa etichetta o promemoria"
                >
                  <Printer className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        }))}
      </div>
    </div>
  )
}
