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

export default function SegreteriaRichiestePage() {
  const [filtro, setFiltro] = useState<'tutte' | 'da_ritirare' | 'consegnate' | 'digitali'>('tutte')
  const [searchQuery, setSearchQuery] = useState('')

  const [richieste, setRichieste] = useState([
    {
      id: 'req-rit-001',
      paziente: 'Paolo Rossi',
      cf: 'RSSPLA60M12H501U',
      telefono: '+39 320 1199887',
      tipo: 'ricetta_bianca',
      titolo: 'Xanax 0.50mg (Ricetta bianca non ripetibile)',
      dettagli: '1 scatola — Trattamento ansia. Richiesta copia cartacea con firma autografa per farmacia estera.',
      emessaIl: 'Oggi 08:30',
      stato: 'da_ritirare',
      modalita: 'Sportello San Marco (Cartaceo)',
      noteDesk: 'Busta già sigillata nel cassetto A1',
    },
    {
      id: 'req-rit-002',
      paziente: 'Elena Morandi',
      cf: 'MRNLNE85T50F205R',
      telefono: '+39 338 5544332',
      tipo: 'certificato',
      titolo: 'Certificato Medico di Buona Salute per Assunzione',
      dettagli: 'Certificato in originale per nuovo impiego aziendale, con bollo studio.',
      emessaIl: 'Ieri 18:00',
      stato: 'da_ritirare',
      modalita: 'Sportello San Marco (Cartaceo)',
      noteDesk: 'Pronto sul bancone principale',
    },
    {
      id: 'req-rit-003',
      paziente: 'Giovanni Ferri',
      cf: 'FRRGVN88A01F205Z',
      telefono: '+39 349 1234567',
      tipo: 'malattia',
      titolo: 'Certificato Telematico Malattia INPS',
      dettagli: 'Periodo 09/09 - 12/09 (4gg). N. Protocollo telematico rilasciato.',
      emessaIl: 'Oggi 08:45',
      stato: 'digitale',
      modalita: 'Digitale (SMS & Notifica App)',
      noteDesk: 'Ricevuta NRE inviata al paziente',
    },
    {
      id: 'req-rit-004',
      paziente: 'Sara Neri',
      cf: 'NRISRA74E45H501K',
      telefono: '+39 340 7654321',
      tipo: 'ricetta_dematerializzata',
      titolo: 'Cardicor 2.5 mg (Bisoprololo) — Ricetta Dematerializzata',
      dettagli: 'Terapia ipertensiva cronica. NRE generato dal medico.',
      emessaIl: 'Oggi 07:50',
      stato: 'digitale',
      modalita: 'Digitale (Fascicolo Sanitario & App)',
      noteDesk: 'Visibile in farmacia con TS',
    },
    {
      id: 'req-rit-005',
      paziente: 'Matteo Gatti',
      cf: 'GTTMTT92C15F205V',
      telefono: '+39 345 8899001',
      tipo: 'fisioterapia',
      titolo: 'Prescrizione Ciclo Fisioterapia e Rieducazione',
      dettagli: '10 sedute rieducazione posturale per rachialgia.',
      emessaIl: 'Ieri 16:30',
      stato: 'consegnata',
      modalita: 'Sportello San Marco (Cartaceo)',
      noteDesk: 'Ritirato dal paziente ieri alle 18:15 (Firmato registro)',
    },
  ])

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
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
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
        {richiesteFiltrate.map((r) => {
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
                  onClick={() => alert(`Stampa promemoria per ${r.paziente}`)}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                  title="Stampa etichetta o promemoria"
                >
                  <Printer className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}

        {richiesteFiltrate.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80">
            <FileCheck className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Nessuna prescrizione trovata</p>
            <p className="text-xs text-slate-400 mt-0.5">Modifica i filtri o la query di ricerca</p>
          </div>
        )}
      </div>
    </div>
  )
}
