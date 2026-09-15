'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/dashboard/onboarding
 * @description Wizard onboarding iniziale configurazione studio medico
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.2.0
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Stethoscope,
  Building2,
  Clock,
  ShieldCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  Radio,
  UserCheck,
  AlertCircle,
  Loader2,
  Copy,
  Calendar,
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface FasciaOrario {
  attiva: boolean
  inizio: string
  fine: string
}

interface GiornoConfig {
  aperto: boolean
  mattina: FasciaOrario
  pomeriggio: FasciaOrario
}

type SettimanaConfig = Record<string, GiornoConfig>

const GIORNI_SETTIMANA: Array<{ key: string; label: string; short: string }> = [
  { key: 'lun', label: 'Lunedì', short: 'Lun' },
  { key: 'mar', label: 'Martedì', short: 'Mar' },
  { key: 'mer', label: 'Mercoledì', short: 'Mer' },
  { key: 'gio', label: 'Giovedì', short: 'Gio' },
  { key: 'ven', label: 'Venerdì', short: 'Ven' },
  { key: 'sab', label: 'Sabato', short: 'Sab' },
  { key: 'dom', label: 'Domenica', short: 'Dom' },
]

const DEFAULT_ORARI: SettimanaConfig = {
  lun: { aperto: true, mattina: { attiva: true, inizio: '09:00', fine: '12:30' }, pomeriggio: { attiva: true, inizio: '15:30', fine: '19:00' } },
  mar: { aperto: true, mattina: { attiva: true, inizio: '09:00', fine: '12:30' }, pomeriggio: { attiva: true, inizio: '15:30', fine: '19:00' } },
  mer: { aperto: true, mattina: { attiva: true, inizio: '09:00', fine: '12:30' }, pomeriggio: { attiva: true, inizio: '15:30', fine: '19:00' } },
  gio: { aperto: true, mattina: { attiva: true, inizio: '09:00', fine: '12:30' }, pomeriggio: { attiva: true, inizio: '15:30', fine: '19:00' } },
  ven: { aperto: true, mattina: { attiva: true, inizio: '09:00', fine: '12:30' }, pomeriggio: { attiva: true, inizio: '15:30', fine: '19:00' } },
  sab: { aperto: false, mattina: { attiva: false, inizio: '09:00', fine: '12:00' }, pomeriggio: { attiva: false, inizio: '15:00', fine: '18:00' } },
  dom: { aperto: false, mattina: { attiva: false, inizio: '09:00', fine: '12:00' }, pomeriggio: { attiva: false, inizio: '15:00', fine: '18:00' } },
}

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)

  // Form states (inizializzati vuoti per reale inserimento dati)
  const [nomeStudio, setNomeStudio] = useState('')
  const [citta, setCitta] = useState('')
  const [indirizzo, setIndirizzo] = useState('')
  const [nomeDottore, setNomeDottore] = useState('')
  const [cognomeDottore, setCognomeDottore] = useState('')
  const [emailDottore, setEmailDottore] = useState('')
  const [telefono, setTelefono] = useState('')

  // Orari settimanali e visita
  const [orariSettimanali, setOrariSettimanali] = useState<SettimanaConfig>(DEFAULT_ORARI)
  const [durataVisita, setDurataVisita] = useState<10 | 20 | 30>(20)
  const [lockupMinutes, setLockupMinutes] = useState<5 | 10 | 15>(10)
  const [anticipoMax, setAnticipoMax] = useState(30)
  const [anticipoDisdetta, setAnticipoDisdetta] = useState(2)
  const [riservaUrgenze, setRiservaUrgenze] = useState(true)

  const [delegaRicette, setDelegaRicette] = useState(true)
  const [delegaAccettazione, setDelegaAccettazione] = useState(true)

  const [caricamento, setCaricamento] = useState(false)
  const [caricamentoIniziale, setCaricamentoIniziale] = useState(true)
  const [salvato, setSalvato] = useState(false)
  const [errore, setErrore] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Recupera i dati esistenti dello studio e del medico
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/onboarding')
        if (res.ok) {
          const data = await res.json()
          if (data.studio) {
            setNomeStudio(data.studio.nome || '')
            setIndirizzo(data.studio.indirizzo || data.studio.config?.indirizzoCompleto || '')
            setTelefono(data.studio.telefono || '')
            if (data.studio.config?.citta) setCitta(data.studio.config.citta)
            if (data.studio.config?.orariSettimanali) {
              setOrariSettimanali((prev) => ({ ...prev, ...data.studio.config.orariSettimanali }))
            }
            if (data.studio.config?.durataVisitaStandardMinuti) {
              setDurataVisita(data.studio.config.durataVisitaStandardMinuti)
            }
            if (data.studio.config?.lockupMinutes) {
              setLockupMinutes(data.studio.config.lockupMinutes)
            }
          }
          if (data.medico) {
            setNomeDottore(data.medico.nome || '')
            setCognomeDottore(data.medico.cognome || '')
            setEmailDottore(data.medico.email || '')
            if (data.medico.telefono && !telefono) setTelefono(data.medico.telefono)
          }
        }
      } catch (err) {
        console.warn('Impossibile pre-caricare dati onboarding:', err)
      } finally {
        setCaricamentoIniziale(false)
      }
    }
    loadData()
  }, [])

  const copiaOrarioLunediAFeriali = () => {
    const lunedi = orariSettimanali['lun']
    if (!lunedi) return
    setOrariSettimanali((prev) => ({
      ...prev,
      mar: JSON.parse(JSON.stringify(lunedi)),
      mer: JSON.parse(JSON.stringify(lunedi)),
      gio: JSON.parse(JSON.stringify(lunedi)),
      ven: JSON.parse(JSON.stringify(lunedi)),
    }))
    toast.success('Orari applicati', 'Gli orari di Lunedì sono stati copiati su Martedì, Mercoledì, Giovedì e Venerdì.')
  }

  const validateStep1 = () => {
    const errs: Record<string, string> = {}
    if (!nomeStudio.trim()) errs.nomeStudio = 'Il nome dello studio è obbligatorio'
    if (!nomeDottore.trim()) errs.nomeDottore = 'Il nome del medico è obbligatorio'
    if (!cognomeDottore.trim()) errs.cognomeDottore = 'Il cognome del medico è obbligatorio'
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) {
      toast.warning('Dati mancanti', 'Compila tutti i campi contrassegnati in rosso.')
      return false
    }
    return true
  }

  const handleFinish = async () => {
    if (!validateStep1()) {
      setStep(1)
      return
    }

    setCaricamento(true)
    setErrore(null)

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeStudio,
          citta,
          indirizzo,
          telefono,
          nomeDottore,
          cognomeDottore,
          emailDottore,
          orariSettimanali,
          durataVisita,
          lockupMinutes,
          anticipoMax,
          anticipoDisdetta,
          riservaUrgenze,
          delegaRicette,
          delegaAccettazione,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Errore durante la creazione dello studio')
      }

      setSalvato(true)
      toast.success('Configurazione salvata!', `${data.slotsGenerati ?? 0} slot reali generati con successo.`)
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err: any) {
      setErrore(err?.message || 'Errore durante il salvataggio dei dati reali')
    } finally {
      setCaricamento(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8 font-sans">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
          <Sparkles className="h-3.5 w-3.5" />
          Configurazione Iniziale Studio Medico
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Benvenuto nel tuo Gestionale Sanitario
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Personalizza in 3 rapidi passaggi le regole operative del tuo studio. Potrai modificare tutto in seguito nel pannello Impostazioni.
        </p>
      </div>

      {/* Steps Progress Indicator */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {[
          { num: 1, label: 'Dati Studio & Medico', icon: Building2 },
          { num: 2, label: 'Orari & Durata Visite', icon: Clock },
          { num: 3, label: 'Slot Lock & Regole', icon: Lock },
        ].map((s, idx) => {
          const Icon = s.icon
          const isDone = step > s.num
          const isCurrent = step === s.num
          return (
            <div key={s.num} className="flex items-center gap-3 flex-1 last:flex-initial">
              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Passo {s.num}</p>
                <p className={`text-xs font-bold ${isCurrent ? 'text-slate-900' : 'text-slate-500'}`}>
                  {s.label}
                </p>
              </div>
              {idx < 2 && <div className="h-0.5 bg-slate-100 flex-1 mx-4 hidden sm:block" />}
            </div>
          )
        })}
      </div>

      {/* Step Contents */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        {step === 1 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">1. Anagrafica Studio e Medico Curante</h2>
              <p className="text-xs text-slate-500">I pazienti vedranno questi dati durante la prenotazione e nei promemoria</p>
            </div>

            {errore && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                ⚠️ {errore}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nome Studio Medico *
                </label>
                <input
                  type="text"
                  value={nomeStudio}
                  onChange={(e) => {
                    setNomeStudio(e.target.value)
                    if (fieldErrors.nomeStudio) setFieldErrors((p) => ({ ...p, nomeStudio: '' }))
                  }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none transition-all ${
                    fieldErrors.nomeStudio ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-200'
                  }`}
                  placeholder="es. Studio Medico Dott. Rossi"
                  required
                />
                {fieldErrors.nomeStudio && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 inline" /> {fieldErrors.nomeStudio}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Città
                </label>
                <input
                  type="text"
                  value={citta}
                  onChange={(e) => setCitta(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="es. Milano"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Telefono Studio / Segreteria
                </label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="es. +39 02 1234567"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Indirizzo Completo
                </label>
                <input
                  type="text"
                  value={indirizzo}
                  onChange={(e) => setIndirizzo(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="es. Via Roma 123, 20121 Milano (MI)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nome Medico Curante *
                </label>
                <input
                  type="text"
                  value={nomeDottore}
                  onChange={(e) => {
                    setNomeDottore(e.target.value)
                    if (fieldErrors.nomeDottore) setFieldErrors((p) => ({ ...p, nomeDottore: '' }))
                  }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none transition-all ${
                    fieldErrors.nomeDottore ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-200'
                  }`}
                  placeholder="es. Mario"
                  required
                />
                {fieldErrors.nomeDottore && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 inline" /> {fieldErrors.nomeDottore}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Cognome Medico Curante *
                </label>
                <input
                  type="text"
                  value={cognomeDottore}
                  onChange={(e) => {
                    setCognomeDottore(e.target.value)
                    if (fieldErrors.cognomeDottore) setFieldErrors((p) => ({ ...p, cognomeDottore: '' }))
                  }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none transition-all ${
                    fieldErrors.cognomeDottore ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-200'
                  }`}
                  placeholder="es. Rossi"
                  required
                />
                {fieldErrors.cognomeDottore && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 inline" /> {fieldErrors.cognomeDottore}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email Medico (Accesso Portale)
                </label>
                <input
                  type="email"
                  value={emailDottore}
                  onChange={(e) => setEmailDottore(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="es. mario.rossi@studio.it (se vuoto: generata automaticamente)"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">2. Orari di Visita e Durata Slot</h2>
                <p className="text-xs text-slate-500">
                  Imposta i giorni e gli orari di apertura dello studio: gli slot reali verranno calcolati automaticamente.
                </p>
              </div>

              <button
                type="button"
                onClick={copiaOrarioLunediAFeriali}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-colors self-start sm:self-auto"
              >
                <Copy className="h-3.5 w-3.5" />
                Copia Lunedì su Mar-Ven
              </button>
            </div>

            {/* Griglia Settimanale 7 Giorni */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Orari Settimanali Dettagliati
              </label>

              {GIORNI_SETTIMANA.map((g) => {
                const configGiorno = orariSettimanali[g.key] || {
                  aperto: false,
                  mattina: { attiva: false, inizio: '09:00', fine: '12:30' },
                  pomeriggio: { attiva: false, inizio: '15:30', fine: '19:00' },
                }

                return (
                  <div
                    key={g.key}
                    className={`p-4 rounded-2xl border transition-all ${
                      configGiorno.aperto
                        ? 'bg-white border-slate-200 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200/60 opacity-75'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                            configGiorno.aperto
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {g.label}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {configGiorno.aperto ? 'Studio aperto' : 'Studio chiuso (Riposo)'}
                        </span>
                      </div>

                      {/* Toggle Aperto / Chiuso */}
                      <button
                        type="button"
                        onClick={() =>
                          setOrariSettimanali((prev) => ({
                            ...prev,
                            [g.key]: {
                              ...configGiorno,
                              aperto: !configGiorno.aperto,
                              mattina: configGiorno.mattina || { attiva: true, inizio: '09:00', fine: '12:30' },
                              pomeriggio: configGiorno.pomeriggio || { attiva: true, inizio: '15:30', fine: '19:00' },
                            },
                          }))
                        }
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          configGiorno.aperto ? 'bg-sky-600' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            configGiorno.aperto ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {configGiorno.aperto && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                        {/* Fascia Mattina */}
                        <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-2">
                          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={configGiorno.mattina?.attiva ?? true}
                              onChange={(e) =>
                                setOrariSettimanali((prev) => ({
                                  ...prev,
                                  [g.key]: {
                                    ...configGiorno,
                                    mattina: {
                                      ...configGiorno.mattina,
                                      attiva: e.target.checked,
                                      inizio: configGiorno.mattina?.inizio || '09:00',
                                      fine: configGiorno.mattina?.fine || '12:30',
                                    },
                                  },
                                }))
                              }
                              className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500"
                            />
                            <span>Fascia Mattina</span>
                          </label>

                          {configGiorno.mattina?.attiva && (
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={configGiorno.mattina?.inizio || '09:00'}
                                onChange={(e) =>
                                  setOrariSettimanali((prev) => ({
                                    ...prev,
                                    [g.key]: {
                                      ...configGiorno,
                                      mattina: { ...configGiorno.mattina, attiva: true, inizio: e.target.value, fine: configGiorno.mattina?.fine || '12:30' },
                                    },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
                              />
                              <span className="text-xs text-slate-400 font-bold">-</span>
                              <input
                                type="time"
                                value={configGiorno.mattina?.fine || '12:30'}
                                onChange={(e) =>
                                  setOrariSettimanali((prev) => ({
                                    ...prev,
                                    [g.key]: {
                                      ...configGiorno,
                                      mattina: { ...configGiorno.mattina, attiva: true, fine: e.target.value, inizio: configGiorno.mattina?.inizio || '09:00' },
                                    },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
                              />
                            </div>
                          )}
                        </div>

                        {/* Fascia Pomeriggio */}
                        <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-2">
                          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={configGiorno.pomeriggio?.attiva ?? true}
                              onChange={(e) =>
                                setOrariSettimanali((prev) => ({
                                  ...prev,
                                  [g.key]: {
                                    ...configGiorno,
                                    pomeriggio: {
                                      ...configGiorno.pomeriggio,
                                      attiva: e.target.checked,
                                      inizio: configGiorno.pomeriggio?.inizio || '15:30',
                                      fine: configGiorno.pomeriggio?.fine || '19:00',
                                    },
                                  },
                                }))
                              }
                              className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500"
                            />
                            <span>Fascia Pomeriggio</span>
                          </label>

                          {configGiorno.pomeriggio?.attiva && (
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={configGiorno.pomeriggio?.inizio || '15:30'}
                                onChange={(e) =>
                                  setOrariSettimanali((prev) => ({
                                    ...prev,
                                    [g.key]: {
                                      ...configGiorno,
                                      pomeriggio: { ...configGiorno.pomeriggio, attiva: true, inizio: e.target.value, fine: configGiorno.pomeriggio?.fine || '19:00' },
                                    },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
                              />
                              <span className="text-xs text-slate-400 font-bold">-</span>
                              <input
                                type="time"
                                value={configGiorno.pomeriggio?.fine || '19:00'}
                                onChange={(e) =>
                                  setOrariSettimanali((prev) => ({
                                    ...prev,
                                    [g.key]: {
                                      ...configGiorno,
                                      pomeriggio: { ...configGiorno.pomeriggio, attiva: true, fine: e.target.value, inizio: configGiorno.pomeriggio?.inizio || '15:30' },
                                    },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Durata Standard della Visita Medica
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { min: 10 as const, label: '10 Minuti (Veloce)', desc: 'Ricette, certificati brevi, controlli rapidi' },
                  { min: 20 as const, label: '20 Minuti (Standard)', desc: 'Visita completa di medicina generale (Consigliato)' },
                  { min: 30 as const, label: '30 Minuti (Approfondita)', desc: 'Prima visita, anamnesi complessa o cronicità' },
                ].map((d) => (
                  <button
                    key={d.min}
                    type="button"
                    onClick={() => setDurataVisita(d.min)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      durataVisita === d.min
                        ? 'bg-sky-50/80 border-sky-600 ring-2 ring-sky-500/20 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <p className="font-extrabold text-sm text-slate-900">{d.label}</p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{d.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Riserva Automatica Slot per Urgenze</p>
                  <p className="text-[11px] text-slate-500">
                    Trattiene gli ultimi 2 slot della sessione mattutina per urgenze (non prenotabili via app dai pazienti)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRiservaUrgenze(!riservaUrgenze)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    riservaUrgenze ? 'bg-sky-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      riservaUrgenze ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">3. Regole Slot Lock, Anticipo e Deleghe Segreteria</h2>
              <p className="text-xs text-slate-500">I parametri anti-conflitto e l'autonomia dello staff</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Tempo di Lockup Slot (ADR-002)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { min: 5 as const, label: '5 Minuti', desc: 'Lock rapido (massima rotazione degli slot)' },
                  { min: 10 as const, label: '10 Minuti (Consigliato)', desc: 'Tempo ideale per compilare il motivo e note' },
                  { min: 15 as const, label: '15 Minuti', desc: 'Massima calma per pazienti anziani o meno esperti' },
                ].map((l) => (
                  <button
                    key={l.min}
                    type="button"
                    onClick={() => setLockupMinutes(l.min)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      lockupMinutes === l.min
                        ? 'bg-sky-50/80 border-sky-600 ring-2 ring-sky-500/20 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <p className="font-extrabold text-sm text-slate-900">{l.label}</p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{l.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Anticipo Massimo Prenotazione
                </label>
                <select
                  value={anticipoMax}
                  onChange={(e) => setAnticipoMax(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  <option value={15}>15 giorni in avanti</option>
                  <option value={30}>30 giorni in avanti (1 mese - Consigliato)</option>
                  <option value={60}>60 giorni in avanti (2 mesi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Anticipo Minimo per Disdetta Libera
                </label>
                <select
                  value={anticipoDisdetta}
                  onChange={(e) => setAnticipoDisdetta(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  <option value={2}>Fino a 2 ore prima della visita</option>
                  <option value={12}>Fino a 12 ore prima</option>
                  <option value={24}>Fino a 24 ore prima (1 giorno lavorativo)</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400">Deleghe alla Segreteria</p>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Evasione Autonoma Farmaci Continuativi</p>
                  <p className="text-[11px] text-slate-500">Consenti alla segreteria di approvare ricette ripetibili croniche</p>
                </div>
                <input
                  type="checkbox"
                  checked={delegaRicette}
                  onChange={(e) => setDelegaRicette(e.target.checked)}
                  className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <div>
                  <p className="text-xs font-bold text-slate-800">Assegnazione Slot Manuali allo Sportello</p>
                  <p className="text-[11px] text-slate-500">Consenti di inserire visite per pazienti che telefonano o si presentano</p>
                </div>
                <input
                  type="checkbox"
                  checked={delegaAccettazione}
                  onChange={(e) => setDelegaAccettazione(e.target.checked)}
                  className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Indietro
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !validateStep1()) {
                  return
                }
                setErrore(null)
                setStep(step + 1)
              }}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-sky-500/20 transition-all"
            >
              <span>Continua al Passo {step + 1}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={salvato || caricamento}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-60"
            >
              {salvato ? (
                <>
                  <Check className="h-4 w-4" /> Configurazione Salvata nel Database!
                </>
              ) : caricamento ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvataggio in Corso...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Salva Studio e Genera Agenda Reale
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
