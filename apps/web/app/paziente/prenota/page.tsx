'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/paziente/prenota
 * @description Prenotazione appuntamento paziente con disponibilità su 1 mese (30 giorni da oggi),
 *              carousel orizzontale navigabile con swipe/trascinamento, lock temporaneo 10 min (ADR-002),
 *              layout a due fasi reattivo e sblocco immediato al cambio data con conferma.
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.4.0
 */

import { useState, useEffect, useRef } from 'react'
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
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Info,
  Calendar,
  MoveHorizontal,
} from 'lucide-react'

interface Slot {
  id: string
  ora: string
  durata: string
  fascia: 'mattina' | 'pomeriggio'
}

interface GiornoCalendario {
  data: string
  giornoSettimana: string
  numero: number
  mese: string
  anno: number
  nomeCompleto: string
  isOggi?: boolean
  isChiuso?: boolean
  slots: Slot[]
}

/**
 * Genera l'elenco dei giorni per i prossimi 30 giorni a partire dalla data odierna
 */
function generaCalendario30Giorni(baseDate: Date = new Date('2026-09-12T08:00:00')): GiornoCalendario[] {
  const giorni: GiornoCalendario[] = []
  const nomiGiorni = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
  const nomiMesi = [
    'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
    'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'
  ]
  const nomiMesiCompleti = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ]
  const nomiGiorniCompleti = [
    'Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'
  ]

  for (let i = 0; i < 30; i++) {
    const d = new Date(baseDate)
    d.setDate(baseDate.getDate() + i)

    const dayOfWeek = d.getDay()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const dataStr = `${yyyy}-${mm}-${dd}`

    const isDomenica = dayOfWeek === 0
    const isSabato = dayOfWeek === 6

    const slots: Slot[] = []

    if (!isDomenica) {
      // Orari mattina studio
      slots.push(
        { id: `slot-${dataStr}-1`, ora: '09:00 - 09:20', durata: '20 min', fascia: 'mattina' },
        { id: `slot-${dataStr}-2`, ora: '09:20 - 09:40', durata: '20 min', fascia: 'mattina' },
        { id: `slot-${dataStr}-3`, ora: '09:40 - 10:00', durata: '20 min', fascia: 'mattina' },
        { id: `slot-${dataStr}-4`, ora: '10:20 - 10:40', durata: '20 min', fascia: 'mattina' },
        { id: `slot-${dataStr}-5`, ora: '10:40 - 11:00', durata: '20 min', fascia: 'mattina' },
        { id: `slot-${dataStr}-6`, ora: '11:00 - 11:30', durata: '30 min', fascia: 'mattina' }
      )

      // Orari pomeriggio (escluso il sabato)
      if (!isSabato) {
        slots.push(
          { id: `slot-${dataStr}-7`, ora: '15:00 - 15:30', durata: '30 min', fascia: 'pomeriggio' },
          { id: `slot-${dataStr}-8`, ora: '15:30 - 16:00', durata: '30 min', fascia: 'pomeriggio' },
          { id: `slot-${dataStr}-9`, ora: '16:00 - 16:30', durata: '30 min', fascia: 'pomeriggio' },
          { id: `slot-${dataStr}-10`, ora: '16:30 - 17:00', durata: '30 min', fascia: 'pomeriggio' }
        )
      }
    }

    giorni.push({
      data: dataStr,
      giornoSettimana: nomiGiorni[dayOfWeek] || 'Lun',
      numero: d.getDate(),
      mese: nomiMesi[d.getMonth()] || 'Set',
      anno: yyyy,
      nomeCompleto: `${nomiGiorniCompleti[dayOfWeek]} ${d.getDate()} ${nomiMesiCompleti[d.getMonth()]} ${yyyy}`,
      isOggi: i === 0,
      isChiuso: isDomenica,
      slots,
    })
  }

  return giorni
}

export default function PrenotaVisitaPage() {
  const router = useRouter()

  // Calendario dinamico a 1 mese (30 giorni da oggi)
  const [calendarioGiorni, setCalendarioGiorni] = useState<GiornoCalendario[]>(() =>
    generaCalendario30Giorni()
  )

  const [dataSelezionata, setDataSelezionata] = useState<string>('2026-09-12')
  const [slotSelezionato, setSlotSelezionato] = useState<string | null>(null)

  // Countdown timer 10 minuti (600 secondi)
  const [secondiRimanenti, setSecondiRimanenti] = useState(600)
  const [bannerVisibile, setBannerVisibile] = useState(false)

  // Modale per conferma cambio data quando uno slot è già bloccato
  const [modalCambioData, setModalCambioData] = useState<{
    aperta: boolean
    targetData: string | null
  }>({
    aperta: false,
    targetData: null,
  })

  // Form prenotazione
  const [tipoVisita, setTipoVisita] = useState<'breve' | 'standard' | 'lunga'>('standard')
  const [motivoCategoria, setMotivoCategoria] = useState('controllo_routine')
  const [motivoNote, setMotivoNote] = useState('')
  const [confermato, setConfermato] = useState(false)

  // Riferimenti e stato per la navigazione orizzontale con swipe / drag
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftPos, setScrollLeftPos] = useState(0)
  const [hasDragged, setHasDragged] = useState(false)

  // Aggiornamento con la data reale client-side
  useEffect(() => {
    const reale = generaCalendario30Giorni(new Date())
    setCalendarioGiorni(reale)
    const primoConSlot = reale.find((g) => !g.isChiuso && g.slots.length > 0)
    if (primoConSlot) {
      setDataSelezionata(primoConSlot.data)
    }
  }, [])

  // Auto-scroll del carousel sulla data selezionata
  useEffect(() => {
    if (!carouselRef.current) return
    const el = carouselRef.current.querySelector<HTMLButtonElement>(`[data-date="${dataSelezionata}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [dataSelezionata])

  // Mouse Drag handlers per simulare lo swipe su desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return
    setIsDragging(true)
    setHasDragged(false)
    setStartX(e.pageX - carouselRef.current.offsetLeft)
    setScrollLeftPos(carouselRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return
    e.preventDefault()
    const x = e.pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    if (Math.abs(walk) > 6) {
      setHasDragged(true)
    }
    carouselRef.current.scrollLeft = scrollLeftPos - walk
  }

  const handleMouseUpOrLeave = () => {
    setIsDragging(false)
  }

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return
    const step = 320
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    })
  }

  const fallbackGiorno: GiornoCalendario = calendarioGiorni[0] as GiornoCalendario
  const giornoCorrente: GiornoCalendario =
    calendarioGiorni.find((g) => g.data === dataSelezionata) || fallbackGiorno
  const slotAttivoDettaglio = giornoCorrente.slots.find((s) => s.id === slotSelezionato)

  // Gestione comparsa animata del timer lock
  useEffect(() => {
    if (slotSelezionato) {
      const t = setTimeout(() => setBannerVisibile(true), 50)
      return () => clearTimeout(t)
    } else {
      setBannerVisibile(false)
    }
  }, [slotSelezionato])

  // Countdown tick
  useEffect(() => {
    if (!slotSelezionato || secondiRimanenti <= 0) return
    const timer = setInterval(() => {
      setSecondiRimanenti((prev) => {
        if (prev <= 1) {
          alert('Tempo per confermare scaduto! Lo slot è stato liberato per altri utenti.')
          setSlotSelezionato(null)
          return 600
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [slotSelezionato, secondiRimanenti])

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Click su un orario disponibile
  const handleSelectSlot = (id: string) => {
    setSlotSelezionato(id)
    setSecondiRimanenti(600) // 10 min TTL lock (ADR-002)
  }

  // Richiesta cambio data da parte dell'utente
  const handleRichiestaCambioData = (targetData: string) => {
    if (targetData === dataSelezionata) return

    // Se uno slot è attualmente bloccato, chiediamo conferma prima di sbloccarlo
    if (slotSelezionato) {
      setModalCambioData({
        aperta: true,
        targetData,
      })
    } else {
      setDataSelezionata(targetData)
    }
  }

  // Conferma rilascio slot e cambio data
  const confermaRilascioSlotECambiaData = () => {
    if (modalCambioData.targetData) {
      setDataSelezionata(modalCambioData.targetData)
    }
    setSlotSelezionato(null)
    setSecondiRimanenti(600)
    setModalCambioData({ aperta: false, targetData: null })
  }

  // Annulla cambio data
  const annullaCambioData = () => {
    setModalCambioData({ aperta: false, targetData: null })
  }

  // Sblocco manuale per tornare alla vista orizzontale
  const handleSbloccaManualmente = () => {
    setSlotSelezionato(null)
    setSecondiRimanenti(600)
  }

  const handleConferma = (e: React.FormEvent) => {
    e.preventDefault()
    setConfermato(true)
    setTimeout(() => {
      router.push('/paziente')
    }, 2000)
  }

  const hasSelectedSlot = Boolean(slotSelezionato)

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans transition-all duration-500 pb-12">
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
          className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Torna alla Home
        </Link>
      </div>

      {/* Lockup Banner with Smooth Entrance Animation */}
      <div
        className={`transition-all duration-500 ease-out overflow-hidden ${
          hasSelectedSlot && bannerVisibile
            ? 'max-h-40 opacity-100 translate-y-0 mb-6'
            : 'max-h-0 opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="p-5 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-blue-400/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-100 uppercase tracking-wider">
                Slot Bloccato per Te (ADR-002)
              </p>
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
      </div>

      {/* ========================================================================= */}
      {/* SELETTORE GIORNATA AD 1 MESE: CAROUSEL CON SWIPE E TRASCINAMENTO MOUSE     */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Seleziona Giornata
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Disponibilità a 1 Mese
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Visualizzati 30 giorni: da {calendarioGiorni[0]?.giornoSettimana} {calendarioGiorni[0]?.numero} {calendarioGiorni[0]?.mese} a {calendarioGiorni[calendarioGiorni.length - 1]?.giornoSettimana} {calendarioGiorni[calendarioGiorni.length - 1]?.numero} {calendarioGiorni[calendarioGiorni.length - 1]?.mese}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Gesture Hint */}
            <span className="text-[11px] font-semibold text-slate-500 hidden md:inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <MoveHorizontal className="h-3.5 w-3.5 text-blue-600" />
              Swipe orizzontale o trascina
            </span>

            {/* Frecce Navigazione Rapida */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:shadow-xs transition-all"
                title="Scorri indietro"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:shadow-xs transition-all"
                title="Scorri avanti"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel / Tab Strip Giorni (Swipeabile su Mobile & Draggable su Desktop) */}
        <div
          ref={carouselRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 select-none scroll-smooth ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            scrollbarWidth: 'thin',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {calendarioGiorni.map((g) => {
            const isAttivo = g.data === dataSelezionata
            const haSlots = g.slots.length > 0
            const isChiuso = g.isChiuso

            return (
              <button
                key={g.data}
                data-date={g.data}
                type="button"
                disabled={isChiuso}
                onClick={() => {
                  if (hasDragged) return
                  if (isChiuso) return
                  handleRichiestaCambioData(g.data)
                }}
                className={`flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-2xl border min-w-[96px] transition-all ${
                  isChiuso
                    ? 'bg-slate-50 text-slate-400 border-slate-200/60 opacity-60 cursor-not-allowed'
                    : isAttivo
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
                    : 'bg-slate-50/90 text-slate-700 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <span
                  className={`text-[11px] font-extrabold uppercase ${
                    isAttivo ? 'text-slate-300' : isChiuso ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {g.giornoSettimana}
                </span>

                <span className="text-xl font-black leading-tight my-0.5">{g.numero}</span>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isChiuso
                      ? 'bg-slate-200/80 text-slate-500'
                      : isAttivo
                      ? 'bg-white/20 text-white'
                      : haSlots
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isChiuso ? 'Chiuso' : haSlots ? `${g.slots.length} liberi` : 'Completo'}
                </span>
              </button>
            )
          })}
        </div>

        {hasSelectedSlot && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSbloccaManualmente}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 underline underline-offset-4"
            >
              Deseleziona slot bloccato e torna alla vista orizzontale
            </button>
          </div>
        )}
      </div>

      {/* Main Dynamic Booking Layout */}
      {!hasSelectedSlot ? (
        /* ========================================================================= */
        /* FASE 1: NESSUN ORARIO SELEZIONATO                                         */
        /* Il pannello 1 parte orizzontale a piena larghezza; il pannello 2 è celato */
        /* ========================================================================= */
        <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                1. Orari Disponibili per {giornoCorrente.nomeCompleto}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Clicca su uno degli orari sottostanti per bloccarlo e procedere con i dettagli della visita
              </p>
            </div>

            {!giornoCorrente.isChiuso && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>{giornoCorrente.slots.length} orari liberi</span>
              </div>
            )}
          </div>

          {/* Se lo studio è chiuso in quel giorno (es. Domenica) */}
          {giornoCorrente.isChiuso || giornoCorrente.slots.length === 0 ? (
            <div className="p-8 text-center bg-slate-50/70 rounded-3xl border border-slate-200 space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Studio Chiuso per Riposo Settimanale</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Il Dott. Mario Verdi non effettua visite in questa giornata. Puoi selezionare una delle date feriali dal calendario a scorrimento in alto.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const prossimoAperto = calendarioGiorni.find((g) => !g.isChiuso && g.slots.length > 0)
                    if (prossimoAperto) handleRichiestaCambioData(prossimoAperto.data)
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  Vai alla Prima Data Disponibile
                </button>
              </div>
            </div>
          ) : (
            /* Griglia Orari Orizzontale a piena larghezza */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {giornoCorrente.slots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => handleSelectSlot(slot.id)}
                  className="group p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-500 hover:ring-2 hover:ring-blue-500/20 text-left transition-all shadow-xs flex flex-col justify-between h-32"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 group-hover:border-blue-300 group-hover:bg-blue-100/50 flex items-center justify-center text-slate-600 group-hover:text-blue-600 transition-colors">
                      <Clock className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      Disponibile
                    </span>
                  </div>

                  <div>
                    <div className="font-black text-base text-slate-900 group-hover:text-blue-900 transition-colors">
                      {slot.ora}
                    </div>
                    <div className="text-xs text-slate-400 font-medium flex items-center justify-between mt-0.5">
                      <span>Durata: {slot.durata}</span>
                      <span className="text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        Blocca slot <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-3">
            <Info className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <span>
              Il menu successivo <strong>"2. Motivo della Visita"</strong> verrà mostrato non appena avrai selezionato un orario, che verrà temporaneamente riservato per 10 minuti.
            </span>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* FASE 2: ORARIO CLICCATO                                                   */
        /* Assume la forma e posizione a due colonne affiancate                      */
        /* Colonna 1: Orari Disponibili verticale (con slot selezionato evidenziato) */
        /* Colonna 2: Motivo della Visita con animazione fluida                      */
        /* ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Step 1: Lista Verticale Orari Disponibili (Come in Foto) */}
          <div className="md:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">1. Orari Disponibili</h2>
                <p className="text-xs text-slate-500 mt-0.5">Seleziona lo slot più comodo per te</p>
              </div>

              <button
                type="button"
                onClick={handleSbloccaManualmente}
                className="text-xs font-bold text-slate-400 hover:text-slate-700"
                title="Deseleziona slot"
              >
                Cambia
              </button>
            </div>

            <div className="space-y-2.5">
              {giornoCorrente.slots.map((slot) => {
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
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow-xs">
                        Selezionato
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600">Disponibile</span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  const prossimoGiorno = calendarioGiorni.find(
                    (g) => g.data !== dataSelezionata && !g.isChiuso
                  )
                  if (prossimoGiorno) handleRichiestaCambioData(prossimoGiorno.data)
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 underline underline-offset-4"
              >
                Vuoi consultare un'altra data?
              </button>
            </div>
          </div>

          {/* Step 2: Dettagli Visita & Conferma (Compare con Animazione) */}
          <div className="md:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5 flex flex-col justify-between animate-in fade-in slide-in-from-right-4 duration-500">
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
                    disabled={confermato}
                    className={`w-full py-3.5 rounded-2xl text-xs font-extrabold text-white flex items-center justify-center gap-2 shadow-md transition-all ${
                      confermato
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

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed mt-4">
              Riceverai una notifica di conferma istantanea. Se non riesci più a presentarti, ti preghiamo di disdire con almeno 2 ore di anticipo per liberare lo slot per altri pazienti.
            </div>
          </div>
        </div>
      )}

      {/* Modale Conferma Cambio Data & Rilascio Slot */}
      {modalCambioData.aperta && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="h-10 w-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Cambiare data e liberare lo slot?</h3>
                <p className="text-xs text-slate-500">Conferma per sbloccare l'orario</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-2 leading-relaxed">
              <p>
                Hai attualmente riservato lo slot delle{' '}
                <strong>{slotAttivoDettaglio?.ora || 'selezionato'}</strong> per{' '}
                <strong>{giornoCorrente.nomeCompleto}</strong>.
              </p>
              <p>
                Cambiando data, questo orario <strong>verrà immediatamente liberato</strong> per permettere ad altri pazienti di prenotarsi.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={annullaCambioData}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Mantieni slot attuale
              </button>
              <button
                type="button"
                onClick={confermaRilascioSlotECambiaData}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all"
              >
                Sì, libera slot e cambia data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
