'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/paziente/prenota
 * @description Prenotazione appuntamento paziente con lock temporaneo 10 min (ADR-002)
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.2.0
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  FileText,
  Stethoscope,
  ChevronRight,
} from 'lucide-react'

export default function PrenotaVisitaPage() {
  const router = useRouter()
  const [dataSelezionata, setDataSelezionata] = useState('2026-09-09')
  const [slotSelezionato, setSlotSelezionato] = useState<string | null>(null)
  const [lockToken, setLockToken] = useState<string | null>(null)

  // Countdown timer 10 minuti (600 secondi)
  const [secondiRimanenti, setSecondiRimanenti] = useState(600)

  // Form prenotazione
  const [tipoVisita, setTipoVisita] = useState<'breve' | 'standard' | 'lunga'>('standard')
  const [motivoCategoria, setMotivoCategoria] = useState('controllo_routine')
  const [motivoNote, setMotivoNote] = useState('')
  const [confermato, setConfermato] = useState(false)

  const slotsDisponibili = [
    { id: 'slot-1', ora: '09:20 - 09:40', durata: '20 min', stato: 'libero' },
    { id: 'slot-2', ora: '09:40 - 10:00', durata: '20 min', stato: 'libero' },
    { id: 'slot-3', ora: '10:00 - 10:20', durata: '20 min', stato: 'libero' },
    { id: 'slot-4', ora: '10:20 - 10:40', durata: '20 min', stato: 'libero' },
    { id: 'slot-5', ora: '10:40 - 11:00', durata: '20 min', stato: 'libero' },
    { id: 'slot-6', ora: '11:00 - 11:30', durata: '30 min', stato: 'libero' },
  ]

  // Countdown tick
  useEffect(() => {
    if (!slotSelezionato || secondiRimanenti <= 0) return
    const timer = setInterval(() => {
      setSecondiRimanenti((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [slotSelezionato, secondiRimanenti])

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleSelectSlot = (id: string) => {
    setSlotSelezionato(id)
    setLockToken('demo-lock-uuid-9842')
    setSecondiRimanenti(600) // 10 min
  }

  const handleConferma = (e: React.FormEvent) => {
    e.preventDefault()
    setConfermato(true)
    setTimeout(() => {
      router.push('/paziente')
    }, 2000)
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
            <CalendarDays className="h-4 w-4" />
            Prenotazione Visita Medica
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Scegli Data e Orario con il Tuo Medico
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Dott. Mario Verdi • Studio Medico San Marco</p>
        </div>

        <Link
          href="/paziente"
          className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" /> Torna alla Home
        </Link>
      </div>

      {/* Lockup Banner if active */}
      {slotSelezionato && (
        <div className="p-5 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-100 uppercase tracking-wider">Slot Bloccato per Te (ADR-002)</p>
              <p className="text-sm font-extrabold text-white">
                Nessun altro paziente può prenotare questo orario
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/20">
            <Clock className="h-4 w-4 text-blue-200 animate-pulse" />
            <span className="text-xs text-blue-100 font-semibold">Tempo rimasto per confermare:</span>
            <span className="font-mono text-lg font-black text-white">{formatTimer(secondiRimanenti)}</span>
          </div>
        </div>
      )}

      {/* Main Booking Flow */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Step 1: Selezione Orari */}
        <div className="md:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">1. Orari Disponibili</h2>
            <p className="text-xs text-slate-500 mt-0.5">Seleziona lo slot più comodo per te</p>
          </div>

          <div className="space-y-2.5">
            {slotsDisponibili.map((slot) => {
              const isSelected = slotSelezionato === slot.id
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => handleSelectSlot(slot.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className={`h-4 w-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="font-extrabold text-sm text-slate-900">{slot.ora}</span>
                    <span className="text-xs text-slate-400">({slot.durata})</span>
                  </div>
                  {isSelected ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white">
                      Selezionato
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600">Disponibile</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Step 2: Dettagli Visita & Conferma */}
        <div className="md:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900">2. Motivo della Visita</h2>
              <p className="text-xs text-slate-500 mt-0.5">Fornisci al medico un breve riassunto</p>
            </div>

            <form onSubmit={handleConferma} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Tipologia Visita
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'breve' as const, label: 'Breve (10m)' },
                    { id: 'standard' as const, label: 'Standard (20m)' },
                    { id: 'lunga' as const, label: 'Approfondita' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTipoVisita(t.id)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        tipoVisita === t.id
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Categoria Motivo
                </label>
                <select
                  value={motivoCategoria}
                  onChange={(e) => setMotivoCategoria(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="controllo_routine">Visita di Controllo / Pressione</option>
                  <option value="esami_sangue">Visione Esami del Sangue / Diagnostica</option>
                  <option value="sintomi_acuti">Sintomi Acuti (Febbre, Dolore, Tosse)</option>
                  <option value="certificato">Certificato Medico Sportivo / Patente</option>
                  <option value="terapia_cronica">Aggiustamento Terapia Cronica</option>
                  <option value="altro">Altro motivo clinico</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Breve Descrizione / Sintomi (Opzionale, max 300 car.)
                </label>
                <textarea
                  rows={3}
                  maxLength={300}
                  value={motivoNote}
                  onChange={(e) => setMotivoNote(e.target.value)}
                  placeholder="Es. Controllo valori colesterolo dopo 3 mesi di terapia..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!slotSelezionato || confermato}
                  className={`w-full py-3.5 rounded-2xl text-xs font-extrabold text-white flex items-center justify-center gap-2 shadow-md transition-all ${
                    !slotSelezionato
                      ? 'bg-slate-300 cursor-not-allowed'
                      : confermato
                      ? 'bg-emerald-600'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  }`}
                >
                  {confermato ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Prenotazione Confermata! Reindirizzamento...
                    </>
                  ) : (
                    <>
                      <span>Conferma Prenotazione Definitiva</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            Riceverai una notifica di conferma istantanea. Se non riesci più a presentarti, ti preghiamo di disdire con almeno 2 ore di anticipo per liberare lo slot per altri pazienti.
          </div>
        </div>
      </div>
    </div>
  )
}
