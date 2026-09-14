'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/segreteria/agenda
 * @description Vista agenda giornaliera per la segreteria: monitoraggio appuntamenti, lockup app e prenotazione telefonica
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.2.0
 */

import { useState, useEffect, useRef } from 'react'
import {
  CalendarDays,
  Clock,
  User,
  CheckCircle2,
  Lock,
  PhoneCall,
  UserPlus,
  AlertCircle,
  Search,
  X,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export interface PazienteOpzione {
  id: string
  nome: string
  cognome: string
  codiceFiscale: string
  telefono?: string | null
  email?: string | null
}

interface SegreteriaSlotItem {
  id: string
  oraInizio: string
  oraFine: string
  durata: string
  stato: 'libero' | 'prenotato' | 'bloccato'
  paziente: string
  telefono: string
  motivo: string
  tipoVisita: string
  origine: string
  codiceFiscale?: string
  pazienteId?: string
  lockedUntil?: string
}

export default function SegreteriaAgendaPage() {
  const { toast } = useToast()
  const [filtro, setFiltro] = useState<'tutti' | 'libero' | 'prenotato' | 'bloccato'>('tutti')
  const [giornoSelezionato, setGiornoSelezionato] = useState(2) // Mercoledì 9 Settembre
  const [modalPrenotaOpen, setModalPrenotaOpen] = useState(false)
  const [slotSceltoPerPrenota, setSlotSceltoPerPrenota] = useState<string | null>(null)
  const [pazienteNome, setPazienteNome] = useState('')
  const [pazienteTelefono, setPazienteTelefono] = useState('')
  const [pazienteMotivo, setPazienteMotivo] = useState('')
  const [pazienteSelezionato, setPazienteSelezionato] = useState<PazienteOpzione | null>(null)
  const [pazientiDatabase, setPazientiDatabase] = useState<PazienteOpzione[]>([])
  const [loadingPazienti, setLoadingPazienti] = useState(false)
  const [dropdownAperto, setDropdownAperto] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const giorni = [
    { nome: 'Lun', num: 7, mese: 'Set' },
    { nome: 'Mar', num: 8, mese: 'Set' },
    { nome: 'Mer', num: 9, mese: 'Set', isOggi: true },
    { nome: 'Gio', num: 10, mese: 'Set' },
    { nome: 'Ven', num: 11, mese: 'Set' },
    { nome: 'Sab', num: 12, mese: 'Set' },
  ]

  const [slots, setSlots] = useState<SegreteriaSlotItem[]>([
    {
      id: 'slot-1',
      oraInizio: '09:00',
      oraFine: '09:20',
      durata: '20 min',
      stato: 'prenotato' as const,
      paziente: 'Giulia Bianchi',
      codiceFiscale: 'BNCGLI88D50H501Y',
      telefono: '+39 347 1122334',
      motivo: 'Controllo esami del sangue',
      tipoVisita: 'Standard',
      origine: 'App Paziente',
    },
    {
      id: 'slot-2',
      oraInizio: '09:20',
      oraFine: '09:40',
      durata: '20 min',
      stato: 'libero' as const,
      paziente: '—',
      telefono: '—',
      motivo: 'Disponibile per prenotazione',
      tipoVisita: 'Standard',
      origine: '—',
    },
    {
      id: 'slot-3',
      oraInizio: '09:40',
      oraFine: '10:00',
      durata: '20 min',
      stato: 'libero' as const,
      paziente: '—',
      telefono: '—',
      motivo: 'Disponibile per prenotazione',
      tipoVisita: 'Standard',
      origine: '—',
    },
    {
      id: 'slot-4',
      oraInizio: '10:00',
      oraFine: '10:20',
      durata: '20 min',
      stato: 'libero' as const,
      paziente: '—',
      telefono: '—',
      motivo: 'Disponibile per prenotazione',
      tipoVisita: 'Standard',
      origine: '—',
    },
    {
      id: 'slot-5',
      oraInizio: '10:20',
      oraFine: '10:40',
      durata: '20 min',
      stato: 'libero' as const,
      paziente: '—',
      telefono: '—',
      motivo: 'Disponibile per prenotazione',
      tipoVisita: 'Standard',
      origine: '—',
    },
    {
      id: 'slot-6',
      oraInizio: '10:40',
      oraFine: '11:00',
      durata: '20 min',
      stato: 'libero' as const,
      paziente: '—',
      telefono: '—',
      motivo: 'Disponibile per prenotazione',
      tipoVisita: 'Standard',
      origine: '—',
    },
    {
      id: 'slot-7',
      oraInizio: '11:00',
      oraFine: '11:30',
      durata: '30 min',
      stato: 'libero' as const,
      paziente: '—',
      telefono: '—',
      motivo: 'Disponibile per prenotazione estesa',
      tipoVisita: 'Lunga (30m)',
      origine: '—',
    },
  ])

  // Caricamento pazienti per ricerca e autocomplete
  useEffect(() => {
    let mounted = true
    async function caricaPazienti() {
      setLoadingPazienti(true)
      try {
        const res = await fetch('/api/pazienti/search?limit=300')
        const data = await res.json()
        if (mounted && data.success && Array.isArray(data.pazienti)) {
          setPazientiDatabase(data.pazienti)
        }
      } catch (err) {
        console.error('Errore recupero pazienti studio:', err)
      } finally {
        if (mounted) setLoadingPazienti(false)
      }
    }
    caricaPazienti()
    return () => {
      mounted = false
    }
  }, [])

  // Chiusura dropdown se si clicca fuori
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setDropdownAperto(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Verifica se un paziente ha già una prenotazione per la giornata corrente
  const getPrenotazioneGiorno = (p: { id?: string; codiceFiscale?: string; nome?: string; cognome?: string }) => {
    const nomeComp = `${p.cognome || ''} ${p.nome || ''}`.toLowerCase().trim()
    const nomeInv = `${p.nome || ''} ${p.cognome || ''}`.toLowerCase().trim()
    const cf = p.codiceFiscale?.toUpperCase().trim()

    return slots.find((s) => {
      if (s.stato !== 'prenotato') return false
      if (p.id && s.pazienteId && s.pazienteId === p.id) return true
      if (cf && s.codiceFiscale && s.codiceFiscale.toUpperCase().trim() === cf) return true
      const sPaz = s.paziente?.toLowerCase().trim() || ''
      if (nomeComp && (sPaz === nomeComp || sPaz.includes(nomeComp))) return true
      if (nomeInv && (sPaz === nomeInv || sPaz.includes(nomeInv))) return true
      return false
    })
  }

  // Filtro pazienti per autocomplete
  const queryTerm = pazienteNome.toLowerCase().trim()
  const pazientiFiltrati =
    queryTerm.length === 0
      ? pazientiDatabase.slice(0, 15)
      : pazientiDatabase
          .filter((p) => {
            const matchNome = `${p.nome} ${p.cognome}`.toLowerCase().includes(queryTerm)
            const matchCognome = `${p.cognome} ${p.nome}`.toLowerCase().includes(queryTerm)
            const matchCf = p.codiceFiscale?.toLowerCase().includes(queryTerm)
            const matchTel = p.telefono?.toLowerCase().includes(queryTerm)
            return matchNome || matchCognome || matchCf || matchTel
          })
          .slice(0, 20)

  const slotsFiltrati = slots.filter((s) => {
    if (filtro === 'tutti') return true
    return s.stato === filtro
  })

  const apriPrenotazioneRapida = (slotId: string) => {
    setSlotSceltoPerPrenota(slotId)
    setPazienteNome('')
    setPazienteTelefono('')
    setPazienteMotivo('')
    setPazienteSelezionato(null)
    setFieldErrors({})
    setDropdownAperto(false)
    setModalPrenotaOpen(true)
  }

  const salvaPrenotazioneSportello = (e: React.FormEvent) => {
    e.preventDefault()
    if (!slotSceltoPerPrenota) return

    if (!pazienteNome.trim()) {
      setFieldErrors({ nome: 'Il nominativo del paziente è obbligatorio' })
      toast.error('Dati mancanti', 'Inserisci o seleziona il nominativo del paziente')
      return
    }

    // Controllo anti-doppia prenotazione
    const giaPrenotato = slots.find((s) => {
      if (s.stato !== 'prenotato' || s.id === slotSceltoPerPrenota) return false
      if (pazienteSelezionato?.id && s.pazienteId && s.pazienteId === pazienteSelezionato.id) return true
      if (
        pazienteSelezionato?.codiceFiscale &&
        s.codiceFiscale &&
        s.codiceFiscale.toUpperCase() === pazienteSelezionato.codiceFiscale.toUpperCase()
      )
        return true
      const normInput = pazienteNome.toLowerCase().trim()
      const normSlot = s.paziente.toLowerCase().trim()
      return normInput.length > 3 && (normSlot === normInput || normSlot.includes(normInput) || normInput.includes(normSlot))
    })

    if (giaPrenotato) {
      setFieldErrors({ nome: `Il paziente risulta già prenotato oggi alle ore ${giaPrenotato.oraInizio}` })
      toast.error(
        'Paziente già prenotato!',
        `Attenzione: ${pazienteNome.trim()} ha già un appuntamento alle ore ${giaPrenotato.oraInizio} (${giaPrenotato.motivo}). Non è possibile registrare una doppia prenotazione per la stessa giornata.`
      )
      return
    }

    setFieldErrors({})
    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotSceltoPerPrenota
          ? {
              ...s,
              stato: 'prenotato',
              paziente: pazienteNome.trim(),
              codiceFiscale: pazienteSelezionato?.codiceFiscale,
              pazienteId: pazienteSelezionato?.id,
              telefono: pazienteTelefono.trim() || '+39 Telefono non fornito',
              motivo: pazienteMotivo.trim() || 'Visita prenotata da sportello',
              origine: 'Sportello Segreteria',
            }
          : s
      )
    )

    toast.success('Appuntamento confermato!', `Slot assegnato a ${pazienteNome.trim()}`)
    setPazienteNome('')
    setPazienteTelefono('')
    setPazienteMotivo('')
    setPazienteSelezionato(null)
    setDropdownAperto(false)
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
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          style={{ colorScheme: 'light' }}
        >
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
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
              Digita per selezionare un assistito iscritto a sistema. Se il paziente ha già un appuntamento oggi, risulterà bloccato per prevenire doppie prenotazioni.
            </p>

            <form onSubmit={salvaPrenotazioneSportello} className="space-y-3.5">
              {/* Autocomplete Input Paziente */}
              <div ref={searchContainerRef} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Cerca Paziente Iscritto *
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {pazientiDatabase.length > 0 ? `${pazientiDatabase.length} a sistema` : 'Caricamento...'}
                  </span>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    {loadingPazienti ? (
                      <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={pazienteNome}
                    onFocus={() => setDropdownAperto(true)}
                    onChange={(e) => {
                      setPazienteNome(e.target.value)
                      setPazienteSelezionato(null)
                      setDropdownAperto(true)
                      if (fieldErrors.nome) setFieldErrors((p) => ({ ...p, nome: '' }))
                    }}
                    placeholder="Digita cognome, nome o codice fiscale..."
                    className={`w-full pl-9 pr-8 py-2.5 rounded-xl border text-xs font-semibold text-slate-900 bg-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all ${
                      fieldErrors.nome
                        ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                        : 'border-slate-200'
                    }`}
                  />
                  {pazienteNome && (
                    <button
                      type="button"
                      onClick={() => {
                        setPazienteNome('')
                        setPazienteSelezionato(null)
                        setPazienteTelefono('')
                        setDropdownAperto(false)
                      }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Dropdown dei suggerimenti pazienti */}
                {dropdownAperto && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 max-h-60 overflow-y-auto space-y-1">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 mb-1">
                      <span>Assistiti Registrati</span>
                      <span>{pazientiFiltrati.length} visualizzati</span>
                    </div>

                    {pazientiFiltrati.length > 0 ? (
                      pazientiFiltrati.map((p) => {
                        const prenotazioneOggi = getPrenotazioneGiorno(p)
                        const giaPrenotato = !!prenotazioneOggi

                        if (giaPrenotato) {
                          return (
                            <div
                              key={p.id}
                              className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 text-slate-500 cursor-not-allowed select-none flex items-center justify-between gap-2"
                              title={`Il paziente ${p.cognome} ${p.nome} ha già una visita oggi alle ore ${prenotazioneOggi.oraInizio}`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-700 text-xs line-through decoration-amber-600">
                                    {p.cognome} {p.nome}
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.2 rounded border border-amber-200">
                                    {p.codiceFiscale}
                                  </span>
                                </div>
                                <p className="text-[10px] text-amber-800 font-semibold mt-0.5 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3 shrink-0 text-amber-600" />
                                  Non cliccabile: già prenotato alle ore {prenotazioneOggi.oraInizio} ({prenotazioneOggi.motivo})
                                </p>
                              </div>
                              <span className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-amber-200 text-amber-950 shrink-0 flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                Già Prenotato
                              </span>
                            </div>
                          )
                        }

                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setPazienteNome(`${p.cognome} ${p.nome}`)
                              setPazienteTelefono(p.telefono || '')
                              setPazienteSelezionato(p)
                              setDropdownAperto(false)
                              if (fieldErrors.nome) setFieldErrors((prev) => ({ ...prev, nome: '' }))
                            }}
                            className="w-full text-left p-2.5 rounded-xl border border-transparent hover:border-amber-200 hover:bg-amber-50/70 transition-colors flex items-center justify-between gap-2 group"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-xs group-hover:text-amber-900">
                                  {p.cognome} {p.nome}
                                </span>
                                <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {p.codiceFiscale}
                                </span>
                              </div>
                              {p.telefono && (
                                <p className="text-[10px] text-slate-500 mt-0.5 font-sans">
                                  Tel: {p.telefono} {p.email ? `• ${p.email}` : ''}
                                </p>
                              )}
                            </div>
                            <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              Disponibile
                            </span>
                          </button>
                        )
                      })
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-500">
                        <p className="font-semibold text-slate-700">Nessun assistito trovato per "{queryTerm}"</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Puoi confermare l'inserimento manuale per un paziente occasionale non iscritto a sistema.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Assistito selezionato da anagrafica */}
                {pazienteSelezionato && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>
                        Selezionato: <strong>{pazienteSelezionato.cognome} {pazienteSelezionato.nome}</strong> (
                        <span className="font-mono text-[11px]">{pazienteSelezionato.codiceFiscale}</span>)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPazienteSelezionato(null)
                        setDropdownAperto(true)
                      }}
                      className="text-[10px] text-emerald-700 hover:underline font-bold"
                    >
                      Cambia
                    </button>
                  </div>
                )}

                {fieldErrors.nome && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 inline" /> {fieldErrors.nome}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Numero di Telefono</label>
                <input
                  type="tel"
                  value={pazienteTelefono}
                  onChange={(e) => setPazienteTelefono(e.target.value)}
                  placeholder="+39 340 1234567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motivo Visita</label>
                <input
                  type="text"
                  value={pazienteMotivo}
                  onChange={(e) => setPazienteMotivo(e.target.value)}
                  placeholder="Es. Visita controllo pressione"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
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
