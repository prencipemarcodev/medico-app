'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/segreteria/agenda
 * @description Vista agenda giornaliera per la segreteria: monitoraggio appuntamenti, lockup app e prenotazione telefonica
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.2.0
 */

import { useState } from 'react'
import {
  CalendarDays,
  Clock,
  User,
  CheckCircle2,
  Lock,
  PhoneCall,
  UserPlus,
} from 'lucide-react'

export default function SegreteriaAgendaPage() {
  const [filtro, setFiltro] = useState<'tutti' | 'libero' | 'prenotato' | 'bloccato'>('tutti')
  const [giornoSelezionato, setGiornoSelezionato] = useState(2) // Mercoledì 9 Settembre
  const [modalPrenotaOpen, setModalPrenotaOpen] = useState(false)
  const [slotSceltoPerPrenota, setSlotSceltoPerPrenota] = useState<string | null>(null)
  const [pazienteNome, setPazienteNome] = useState('')
  const [pazienteTelefono, setPazienteTelefono] = useState('')
  const [pazienteMotivo, setPazienteMotivo] = useState('')

  const giorni = [
    { nome: 'Lun', num: 7, mese: 'Set' },
    { nome: 'Mar', num: 8, mese: 'Set' },
    { nome: 'Mer', num: 9, mese: 'Set', isOggi: true },
    { nome: 'Gio', num: 10, mese: 'Set' },
    { nome: 'Ven', num: 11, mese: 'Set' },
    { nome: 'Sab', num: 12, mese: 'Set' },
  ]

  const [slots, setSlots] = useState([
    {
      id: 'slot-1',
      oraInizio: '09:00',
      oraFine: '09:20',
      durata: '20 min',
      stato: 'prenotato',
      paziente: 'Marco Prencipe',
      telefono: '+39 333 9988776',
      motivo: 'Visita di controllo pressione arteriosa',
      tipoVisita: 'Standard',
      origine: 'App Paziente',
    },
    {
      id: 'slot-2',
      oraInizio: '09:20',
      oraFine: '09:40',
      durata: '20 min',
      stato: 'prenotato',
      paziente: 'Anna Bianchi',
      telefono: '+39 347 1122334',
      motivo: 'Controllo esami sangue e terapia ipertensiva',
      tipoVisita: 'Standard',
      origine: 'Sportello',
    },
    {
      id: 'slot-3',
      oraInizio: '09:40',
      oraFine: '10:00',
      durata: '20 min',
      stato: 'bloccato',
      paziente: 'Paziente in app (Lock ADR-002)',
      telefono: '—',
      motivo: 'Compilazione modulo di prenotazione in corso su smartphone',
      tipoVisita: 'Lock attivo',
      lockedUntil: 'Scade tra 6 min',
      origine: 'Lock Online',
    },
    {
      id: 'slot-4',
      oraInizio: '10:00',
      oraFine: '10:20',
      durata: '20 min',
      stato: 'libero',
      paziente: '—',
      telefono: '—',
      motivo: 'Slot disponibile per prenotazione online o allo sportello',
      tipoVisita: 'Libero',
      origine: '—',
    },
    {
      id: 'slot-5',
      oraInizio: '10:20',
      oraFine: '10:40',
      durata: '20 min',
      stato: 'prenotato',
      paziente: 'Chiara Romano',
      telefono: '+39 328 4455667',
      motivo: 'Certificato medico sportivo non agonistico',
      tipoVisita: 'Breve (10m)',
      origine: 'App Paziente',
    },
    {
      id: 'slot-6',
      oraInizio: '10:40',
      oraFine: '11:00',
      durata: '20 min',
      stato: 'libero',
      paziente: '—',
      telefono: '—',
      motivo: 'Slot disponibile',
      tipoVisita: 'Libero',
      origine: '—',
    },
    {
      id: 'slot-7',
      oraInizio: '11:00',
      oraFine: '11:30',
      durata: '30 min',
      stato: 'libero',
      paziente: '—',
      telefono: '—',
      motivo: 'Slot visita estesa disponibile',
      tipoVisita: 'Lunga (30m)',
      origine: '—',
    },
  ])

  const slotsFiltrati = slots.filter((s) => {
    if (filtro === 'tutti') return true
    return s.stato === filtro
  })

  const apriPrenotazioneRapida = (slotId: string) => {
    setSlotSceltoPerPrenota(slotId)
    setModalPrenotaOpen(true)
  }

  const salvaPrenotazioneSportello = (e: React.FormEvent) => {
    e.preventDefault()
    if (!slotSceltoPerPrenota || !pazienteNome) return

    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotSceltoPerPrenota
          ? {
              ...s,
              stato: 'prenotato',
              paziente: pazienteNome,
              telefono: pazienteTelefono || '+39 Telefono non fornito',
              motivo: pazienteMotivo || 'Visita prenotata da sportello',
              origine: 'Sportello Segreteria',
            }
          : s
      )
    )

    setPazienteNome('')
    setPazienteTelefono('')
    setPazienteMotivo('')
    setModalPrenotaOpen(false)
    setSlotSceltoPerPrenota(null)
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header & Date Navigation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            <CalendarDays className="h-4 w-4" />
            Agenda Visite Dott. Mario Verdi • Vista Segreteria
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Mercoledì, 9 Settembre 2026
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sportello San Marco • Monitoraggio slot liberi, prenotati e lock temporanei ADR-002
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
            {giorni.map((g, idx) => (
              <button
                key={g.num}
                type="button"
                onClick={() => setGiornoSelezionato(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  giornoSelezionato === idx
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {g.nome} {g.num}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              const primoLibero = slots.find((s) => s.stato === 'libero')
              if (primoLibero) apriPrenotazioneRapida(primoLibero.id)
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shadow-sm transition-all"
          >
            <UserPlus className="h-4 w-4" />
            Prenota da Sportello
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Slot Totali</span>
            <CalendarDays className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{slots.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Capacità ordinaria studio</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Disponibili</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {slots.filter((s) => s.stato === 'libero').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Prenotabili da pazienti o desk</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Prenotati</span>
            <User className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-600 mt-2">
            {slots.filter((s) => s.stato === 'prenotato').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Pazienti confermati in agenda</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Lock Attivi</span>
            <Lock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">
            {slots.filter((s) => s.stato === 'bloccato').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Prenotazione in corso (TTL 10m)</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(['tutti', 'prenotato', 'bloccato', 'libero'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFiltro(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                filtro === t
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t === 'tutti' ? 'Tutti gli slot' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Slots Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {slotsFiltrati.map((slot) => {
            const isLibero = slot.stato === 'libero'
            const isBloccato = slot.stato === 'bloccato'
            const isPrenotato = slot.stato === 'prenotato'

            return (
              <div
                key={slot.id}
                className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  isBloccato ? 'bg-amber-50/40' : isLibero ? 'hover:bg-slate-50/50' : 'bg-white'
                }`}
              >
                {/* Time & Duration */}
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div
                    className={`h-11 w-11 rounded-2xl flex items-center justify-center font-bold ${
                      isPrenotato
                        ? 'bg-blue-50 text-blue-600 border border-blue-100'
                        : isBloccato
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}
                  >
                    {isBloccato ? <Lock className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-slate-900">
                      {slot.oraInizio} - {slot.oraFine}
                    </p>
                    <p className="text-xs text-slate-400 font-medium">{slot.durata}</p>
                  </div>
                </div>

                {/* Patient & Reason */}
                <div className="flex-1 min-w-[260px]">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-bold ${
                        isPrenotato ? 'text-slate-900' : isBloccato ? 'text-amber-800' : 'text-slate-400'
                      }`}
                    >
                      {slot.paziente}
                    </p>
                    {slot.origine && slot.origine !== '—' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                        {slot.origine}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{slot.motivo}</p>
                  {slot.telefono && slot.telefono !== '—' && (
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <PhoneCall className="h-3 w-3" /> {slot.telefono}
                    </p>
                  )}
                </div>

                {/* Status Badge & Action */}
                <div className="flex items-center gap-3 justify-between md:justify-end">
                  {isPrenotato && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                      Prenotato
                    </span>
                  )}

                  {isBloccato && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <Lock className="h-3.5 w-3.5 text-amber-600" />
                      {slot.lockedUntil || 'Lock App'}
                    </span>
                  )}

                  {isLibero && (
                    <>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Disponibile
                      </span>

                      <button
                        type="button"
                        onClick={() => apriPrenotazioneRapida(slot.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors shadow-xs"
                      >
                        Assegna Paziente
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal Prenotazione Rapida Sportello */}
      {modalPrenotaOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                <UserPlus className="h-5 w-5" />
                Prenotazione Rapida Sportello
              </div>
              <button
                type="button"
                onClick={() => setModalPrenotaOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕ Chiudi
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Inserisci i dati del paziente per confermare l'appuntamento allo sportello o telefonicamente.
            </p>

            <form onSubmit={salvaPrenotazioneSportello} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome e Cognome Paziente</label>
                <input
                  type="text"
                  required
                  value={pazienteNome}
                  onChange={(e) => setPazienteNome(e.target.value)}
                  placeholder="Es. Marco Rossi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Numero di Telefono</label>
                <input
                  type="tel"
                  value={pazienteTelefono}
                  onChange={(e) => setPazienteTelefono(e.target.value)}
                  placeholder="+39 340 1234567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motivo Visita</label>
                <input
                  type="text"
                  value={pazienteMotivo}
                  onChange={(e) => setPazienteMotivo(e.target.value)}
                  placeholder="Es. Visita controllo pressione"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setModalPrenotaOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20"
                >
                  Conferma Appuntamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
