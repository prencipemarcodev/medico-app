'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/dashboard/richieste
 * @description Gestione coda FIFO richieste speciali (malattia, certificati, medicinali)
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.2.0
 */

import { useState } from 'react'
import {
  ClipboardList,
  AlertCircle,
  Pill,
  FileText,
  CheckCircle2,
  XCircle,
  Download,
  Calendar,
  Filter,
  Check,
} from 'lucide-react'

export default function RichiestePage() {
  const [categoria, setCategoria] = useState<'tutte' | 'malattia' | 'medicinale' | 'certificato'>('tutte')
  const [richieste, setRichieste] = useState<
    Array<{
      id: string
      paziente: string
      cf: string
      telefono: string
      tipo: string
      dataArrivo: string
      dettaglio: string
      sintomi?: string[]
      periodo?: string
      farmaco?: string
      terapiaCronica?: boolean
      modalitaRitiro: string
      stato: 'in_attesa' | 'completata' | 'rifiutata'
    }>
  >([])

  const handleEvadi = (id: string) => {
    setRichieste(richieste.map((r) => (r.id === id ? { ...r, stato: 'completata' } : r)))
  }

  const handleRifiuta = (id: string) => {
    setRichieste(richieste.map((r) => (r.id === id ? { ...r, stato: 'rifiutata' } : r)))
  }

  const richiesteFiltrate = richieste.filter((r) => {
    if (categoria === 'tutte') return true
    return r.tipo === categoria
  })

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            <ClipboardList className="h-4 w-4" />
            Coda Ordinata per Arrivo (ADR-004)
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Gestione Richieste Speciali
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            {richieste.filter((r) => r.stato === 'in_attesa').length} Richieste in Attesa
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm w-fit">
        {[
          { id: 'tutte', label: 'Tutte le Richieste' },
          { id: 'malattia', label: '🤒 Malattia' },
          { id: 'medicinale', label: '💊 Prescrizioni' },
          { id: 'certificato', label: '📋 Certificati' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoria(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              categoria === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {richiesteFiltrate.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <ClipboardList className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-800">Nessuna richiesta da evadere</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Non ci sono richieste di prescrizione farmaci o certificati in attesa per questa categoria.
            </p>
          </div>
        ) : (
          richiesteFiltrate.map((req) => (
          <div
            key={req.id}
            className={`p-6 rounded-3xl border transition-all space-y-4 ${
              req.stato === 'completata'
                ? 'bg-slate-50 border-slate-200 opacity-70'
                : req.stato === 'rifiutata'
                ? 'bg-rose-50/40 border-rose-200'
                : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
            }`}
          >
            {/* Top row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                  {req.id}
                </span>
                <span className="font-extrabold text-base text-slate-900">{req.paziente}</span>
                <span className="text-xs text-slate-500 font-mono">CF: {req.cf}</span>
                <span className="text-xs text-slate-400 font-medium">Tel: {req.telefono}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">{req.dataArrivo}</span>
                {req.modalitaRitiro === 'studio' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Ritiro in Studio
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    PDF in App
                  </span>
                )}
              </div>
            </div>

            {/* Content row */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-800">{req.dettaglio}</p>
              {req.sintomi && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-400">Sintomi dichiarati:</span>
                  {req.sintomi.map((s, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {req.periodo && (
                <p className="text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  📅 {req.periodo}
                </p>
              )}
              {req.farmaco && (
                <p className="text-xs font-medium text-slate-700 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 flex items-center gap-2">
                  <Pill className="h-4 w-4 text-blue-600" />
                  <span>{req.farmaco}</span>
                </p>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                {req.stato === 'completata' && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Evaso • Notifica inviata al paziente
                  </span>
                )}
                {req.stato === 'rifiutata' && (
                  <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                    <XCircle className="h-4 w-4" /> Rifiutata con motivazione inviata
                  </span>
                )}
              </div>

              {req.stato === 'in_attesa' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRifiuta(req.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                  >
                    Rifiuta con Motivo
                  </button>
                  <button
                    onClick={() => handleEvadi(req.id)}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approva ed Emetti
                  </button>
                </div>
              )}
            </div>
          </div>
        )))}
      </div>
    </div>
  )
}
