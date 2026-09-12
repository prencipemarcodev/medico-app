'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/dashboard/agenda
 * @description Gestione visiva dell'agenda studio: slot temporali, lock e prenotazioni
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.2.0
 */

import { useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Search,
} from 'lucide-react'

interface SlotItem {
  id: string
  oraInizio: string
  oraFine: string
  durata: string
  stato: 'libero' | 'prenotato' | 'bloccato'
  paziente: string
  telefono: string
  motivo: string
  tipoVisita: string
  lockedUntil?: string
}

export default function AgendaPage() {
  const [filtro, setFiltro] = useState<'tutti' | 'libero' | 'prenotato' | 'bloccato'>('tutti')
  const [giornoSelezionato, setGiornoSelezionato] = useState(2) // Mercoledì 9 Settembre

  const giorni = [
    { nome: 'Lun', num: 7, mese: 'Set' },
    { nome: 'Mar', num: 8, mese: 'Set' },
    { nome: 'Mer', num: 9, mese: 'Set', isOggi: true },
    { nome: 'Gio', num: 10, mese: 'Set' },
    { nome: 'Ven', num: 11, mese: 'Set' },
    { nome: 'Sab', num: 12, mese: 'Set' },
  ]

  const slots: SlotItem[] = [
    {
      id: 'slot-1',
      oraInizio: '09:00',
      oraFine: '09:20',
      durata: '20 min',
      stato: 'libero' as const,
      paziente: '—',
      telefono: '—',
      motivo: 'Slot disponibile per prenotazione online o sportello',
      tipoVisita: 'Standard',
    },
    {
      id: 'slot-2',
      oraInizio: '09:20',
      oraFine: '09:40',
      durata: '20 min',
      stato: 'libero' as const,
      paziente: '—',
      telefono: '—',
      motivo: 'Slot disponibile per prenotazione online o sportello',
      tipoVisita: 'Standard',
    },
    {
      id: 'slot-3',
      oraInizio: '09:40',
      oraFine: '10:00',
      durata: '20 min',
      stato: 'libero' as const,
      paziente: '—',
      telefono: '—',
      motivo: 'Slot disponibile per prenotazione online o sportello',
      tipoVisita: 'Standard',
    },
    {
      id: 'slot-4',
      oraInizio: '10:00',
      oraFine: '10:20',
      durata: '20 min',
      stato: 'libero' as const,
      paziente: '—',
      telefono: '—',
      motivo: 'Slot disponibile per prenotazione online o sportello',
      tipoVisita: 'Standard',
    },
    {
      id: 'slot-5',
      oraInizio: '10:20',
      oraFine: '10:40',
      durata: '20 min',
      stato: 'libero' as const,
      paziente: '—',
      telefono: '—',
      motivo: 'Slot disponibile per prenotazione online o sportello',
      tipoVisita: 'Standard',
    },
    {
      id: 'slot-6',
      oraInizio: '10:40',
      oraFine: '11:00',
      durata: '20 min',
      stato: 'libero' as const,
      paziente: '—',
      telefono: '—',
      motivo: 'Slot disponibile',
      tipoVisita: 'Standard',
    },
    {
      id: 'slot-7',
      oraInizio: '11:00',
      oraFine: '11:30',
      durata: '30 min',
      stato: 'libero' as const,
      paziente: '—',
      telefono: '—',
      motivo: 'Slot visita estesa disponibile',
      tipoVisita: 'Lunga (30m)',
    },
  ]

  const slotsFiltrati = slots.filter((s) => {
    if (filtro === 'tutti') return true
    return s.stato === filtro
  })

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Date Navigation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <CalendarDays className="h-4 w-4" />
            Agenda Visite Dott. Mario Verdi
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Mercoledì, 9 Settembre 2026
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button className="p-2 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800">Settimana 37</span>
            <button className="p-2 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all">
            <Plus className="h-4 w-4" />
            Aggiungi Slot Extra
          </button>
        </div>
      </div>

      {/* Week Selector Bar */}
      <div className="grid grid-cols-6 gap-3">
        {giorni.map((g, idx) => {
          const isSelected = giornoSelezionato === idx
          return (
            <button
              key={g.num}
              onClick={() => setGiornoSelezionato(idx)}
              className={`p-4 rounded-2xl border text-center transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`text-xs font-bold uppercase ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                {g.nome}
              </div>
              <div className="text-2xl font-extrabold my-0.5">{g.num}</div>
              <div className={`text-[11px] font-semibold ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                {g.isOggi ? 'Oggi' : g.mese}
              </div>
            </button>
          )
        })}
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mr-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" /> Filtra Stato:
          </span>
          {(['tutti', 'libero', 'prenotato', 'bloccato'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filtro === f
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {f === 'tutti' ? 'Tutti gli Slot' : f}
            </button>
          ))}
        </div>

        <div className="text-xs font-medium text-slate-500">
          Mostrando <span className="font-bold text-slate-900">{slotsFiltrati.length}</span> slot
        </div>
      </div>

      {/* Slot Timeline List */}
      <div className="space-y-4">
        {slotsFiltrati.map((slot) => (
          <div
            key={slot.id}
            className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              slot.stato === 'prenotato'
                ? 'bg-white border-slate-200 shadow-sm'
                : slot.stato === 'bloccato'
                ? 'bg-amber-50/60 border-amber-200 shadow-sm'
                : 'bg-white border-dashed border-slate-300 hover:border-blue-400'
            }`}
          >
            {/* Left: Time & Badge */}
            <div className="flex items-start md:items-center gap-5">
              <div className="p-3 rounded-2xl bg-slate-100 text-slate-800 font-mono font-bold text-sm w-32 text-center border border-slate-200/60">
                <div>{slot.oraInizio} - {slot.oraFine}</div>
                <div className="text-[10px] text-slate-500 font-sans font-medium">{slot.durata}</div>
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-extrabold text-base text-slate-900">{slot.paziente}</h3>
                  {slot.stato === 'prenotato' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Prenotato
                    </span>
                  )}
                  {slot.stato === 'bloccato' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      In Lock (10 min)
                    </span>
                  )}
                  {slot.stato === 'libero' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                      Disponibile
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1">{slot.motivo}</p>
                {slot.telefono !== '—' && (
                  <p className="text-[11px] text-slate-400 mt-0.5">Tel: {slot.telefono}</p>
                )}
                {slot.lockedUntil && (
                  <p className="text-[11px] text-amber-700 font-semibold mt-0.5">{slot.lockedUntil}</p>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 self-end md:self-center">
              {slot.stato === 'prenotato' && (
                <>
                  <button className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors">
                    Sposta Orario
                  </button>
                  <button className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs">
                    Completa Visita
                  </button>
                </>
              )}
              {slot.stato === 'libero' && (
                <button className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs">
                  Assegna Paziente Manualmente
                </button>
              )}
              {slot.stato === 'bloccato' && (
                <button className="px-4 py-2 rounded-xl text-xs font-bold text-amber-800 hover:bg-amber-100 border border-amber-300 transition-colors">
                  Sblocca Forzatamente
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
