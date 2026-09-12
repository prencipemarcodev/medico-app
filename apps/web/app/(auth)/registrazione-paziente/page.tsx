'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/auth/registrazione-paziente
 * @description Pagina pubblica di registrazione autonoma per i Pazienti dello Studio Medico
 * @author      Agent-1 | Session: 2026-09-12
 * @version     1.0.0
 */

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Building2,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Key,
  Lock,
  User,
  Mail,
  PhoneCall,
  Calendar,
  ShieldCheck,
} from 'lucide-react'
import { AppLogo } from '@/components/AppLogo'

interface MedicoInfo {
  id: string
  nome: string
  cognome: string
  email: string
  telefonoPrimario: string | null
}

interface StudioInfo {
  id: string
  nome: string
  codiceStudio: string
  indirizzo: string | null
  telefono: string | null
}

function RegistrazionePazienteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [codiceStudio, setCodiceStudio] = useState('')
  const [verificandoStudio, setVerificandoStudio] = useState(false)
  const [studioVerificato, setStudioVerificato] = useState<StudioInfo | null>(null)
  const [mediciDisponibili, setMediciDisponibili] = useState<MedicoInfo[]>([])
  const [medicoSelezionatoId, setMedicoSelezionatoId] = useState<string>('')
  const [erroreStudio, setErroreStudio] = useState<string | null>(null)

  // Anagrafica Paziente
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [codiceFiscale, setCodiceFiscale] = useState('')
  const [dataNascita, setDataNascita] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [confermaPassword, setConfermaPassword] = useState('')
  const [accettaPrivacy, setAccettaPrivacy] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errore, setErrore] = useState<string | null>(null)
  const [registratoConSuccesso, setRegistratoConSuccesso] = useState(false)

  // Leggi parametri da URL (?codiceStudio=...&medicoId=...)
  useEffect(() => {
    const codeParam = searchParams.get('codiceStudio') || searchParams.get('codice')
    const medParam = searchParams.get('medicoId')

    if (codeParam) {
      setCodiceStudio(codeParam)
      eseguiVerificaStudio(codeParam, medParam)
    }
  }, [searchParams])

  const eseguiVerificaStudio = async (codiceDaVerificare: string, preselectedMedicoId?: string | null) => {
    const cleanCode = codiceDaVerificare.trim().toUpperCase()
    if (!cleanCode || cleanCode.length < 4) {
      setErroreStudio('Inserisci un codice valido (es. STU-ROMA-1001)')
      setStudioVerificato(null)
      return
    }

    setVerificandoStudio(true)
    setErroreStudio(null)

    try {
      const res = await fetch(`/api/studi/verifica-codice?codice=${encodeURIComponent(cleanCode)}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Studio medico non trovato o codice non valido')
      }

      setStudioVerificato(data.studio)
      setMediciDisponibili(data.medici || [])
      setCodiceStudio(cleanCode)

      // Se presente un medico nei parametri o se ce n'è solo uno, preselezionalo
      if (preselectedMedicoId && data.medici?.some((m: MedicoInfo) => m.id === preselectedMedicoId)) {
        setMedicoSelezionatoId(preselectedMedicoId)
      } else if (data.medici?.length === 1) {
        setMedicoSelezionatoId(data.medici[0].id)
      }
    } catch (err: any) {
      setErroreStudio(err.message || 'Errore verifica codice studio')
      setStudioVerificato(null)
    } finally {
      setVerificandoStudio(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrore(null)

    if (!studioVerificato) {
      setErrore('Verifica prima il Codice Studio fornito dalla segreteria')
      return
    }

    if (!medicoSelezionatoId) {
      setErrore('Seleziona il tuo Medico Curante tra i medici disponibili nello studio')
      return
    }

    const cleanCf = codiceFiscale.trim().toUpperCase()
    if (cleanCf.length !== 16) {
      setErrore('Il Codice Fiscale deve contenere esattamente 16 caratteri')
      return
    }

    if (password.length < 8) {
      setErrore('La password deve essere di almeno 8 caratteri')
      return
    }

    if (password !== confermaPassword) {
      setErrore('Le password inserite non coincidono')
      return
    }

    if (!accettaPrivacy) {
      setErrore('È necessario accettare il trattamento dei dati sanitari (GDPR)')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/registrazione-paziente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codiceStudio: studioVerificato.codiceStudio,
          medicoId: medicoSelezionatoId,
          nome,
          cognome,
          codiceFiscale: cleanCf,
          dataNascita,
          email: email || undefined,
          telefono: telefono || undefined,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Errore durante la registrazione')
      }

      setRegistratoConSuccesso(true)
      // Redirect al portale paziente dopo breve conferma
      setTimeout(() => {
        router.push('/paziente')
      }, 1500)
    } catch (err: any) {
      setErrore(err.message || 'Impossibile completare la registrazione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200/80 space-y-8 font-sans">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-1">
          <AppLogo size={68} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Registrazione Paziente
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Crea il tuo account sul portale del tuo Studio Medico Curante
        </p>
      </div>

      {/* Stato di Successo */}
      {registratoConSuccesso ? (
        <div className="p-8 text-center space-y-4 bg-emerald-50 rounded-2xl border border-emerald-200">
          <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-black text-emerald-950">Registrazione completata con successo!</h2>
          <p className="text-xs text-emerald-800">
            Il tuo account è stato creato ed è attivo. Accesso in corso alla tua area personale...
          </p>
          <div className="pt-2 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Box Errore Generale */}
          {errore && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
              <span>{errore}</span>
            </div>
          )}

          {/* 1. SEZIONE CODICE STUDIO */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              1. Codice Studio Medico *
            </label>
            <p className="text-[11px] text-slate-500">
              Inserisci il codice univoco rilasciato dal tuo studio o ambulatorio (es. <code>STU-ROMA-1001</code>).
            </p>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={codiceStudio}
                  onChange={(e) => {
                    setCodiceStudio(e.target.value.toUpperCase())
                    setStudioVerificato(null)
                  }}
                  placeholder="Es. STU-12345"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-xs uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
              </div>

              <button
                type="button"
                disabled={verificandoStudio || !codiceStudio}
                onClick={() => eseguiVerificaStudio(codiceStudio)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                {verificandoStudio ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Key className="h-3.5 w-3.5" />
                    <span>Verifica</span>
                  </>
                )}
              </button>
            </div>

            {erroreStudio && (
              <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{erroreStudio}</span>
              </p>
            )}

            {studioVerificato && (
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-start gap-2.5 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-emerald-950">{studioVerificato.nome}</p>
                  <p className="text-[11px] text-emerald-700">{studioVerificato.indirizzo || 'Studio Sanitario'}</p>
                </div>
              </div>
            )}
          </div>

          {/* 2. SELEZIONE MEDICO CURANTE */}
          {studioVerificato && (
            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-blue-900">
                2. Scegli il tuo Medico Curante *
              </label>

              {mediciDisponibili.length === 0 ? (
                <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  Nessun medico attualmente attivo registrato in questo studio. Contatta la segreteria.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {mediciDisponibili.map((med) => {
                    const isSelected = medicoSelezionatoId === med.id
                    return (
                      <button
                        key={med.id}
                        type="button"
                        onClick={() => setMedicoSelezionatoId(med.id)}
                        className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 ring-2 ring-blue-600'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          <Stethoscope className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-xs">
                            Dott. {med.nome} {med.cognome}
                          </p>
                          <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            Medico di Medicina Generale
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. DATI ANAGRAFICI */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
              3. Dati Anagrafici Paziente
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Mario"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Cognome *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Rossi"
                  value={cognome}
                  onChange={(e) => setCognome(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Codice Fiscale *
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">{codiceFiscale.length}/16</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="RSSMRA85M01H501Z"
                  value={codiceFiscale}
                  onChange={(e) => setCodiceFiscale(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Costituirà il tuo <b>Username</b> per accedere al portale.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Data di Nascita *
                </label>
                <input
                  type="date"
                  required
                  value={dataNascita}
                  onChange={(e) => setDataNascita(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Telefono Cellulare (consigliato)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <PhoneCall className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    placeholder="Es. 340 1234567"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Email (facoltativa)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="mario.rossi@email.it"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. PASSWORD DI ACCESSO */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
              4. Imposta Password di Accesso
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Password (min. 8 caratteri) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Almeno 8 caratteri"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Conferma Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Ripeti la password"
                    value={confermaPassword}
                    onChange={(e) => setConfermaPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Consenso Privacy GDPR */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <input
              type="checkbox"
              id="privacy"
              checked={accettaPrivacy}
              onChange={(e) => setAccettaPrivacy(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="privacy" className="text-xs text-slate-600 cursor-pointer">
              Dichiaro di aver preso visione dell'informativa sul trattamento dei dati sanitari (GDPR) e acconsento alla gestione della mia scheda assistito e delle ricette dematerializzate da parte dello studio medico curante.
            </label>
          </div>

          {/* Pulsante Invio */}
          <button
            type="submit"
            disabled={loading || !studioVerificato || !medicoSelezionatoId}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creazione account assistito in corso...</span>
              </>
            ) : (
              <>
                <span>Completa Registrazione ed Accedi</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          {/* Torna al login */}
          <div className="pt-2 text-center border-t border-slate-100">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-500 hover:text-blue-600 inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Hai già un account? Torna al Login</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}

export default function RegistrazionePazientePage() {
  return (
    <main className="min-h-[100dvh] bg-[#090d16] flex items-center justify-center p-4 sm:p-6 pt-safe pb-safe">
      <Suspense
        fallback={
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="text-xs font-bold">Caricamento modulo registrazione...</span>
          </div>
        }
      >
        <RegistrazionePazienteForm />
      </Suspense>
    </main>
  )
}
