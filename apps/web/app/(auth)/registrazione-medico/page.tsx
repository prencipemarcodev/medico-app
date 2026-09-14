'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/auth/registrazione-medico
 * @description Pagina di onboarding e registrazione autonoma per Medici e Collaboratori con Codice Studio
 * @author      Agent-1 | Session: 2026-09-12
 * @version     1.0.0
 */

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Stethoscope,
  Building2,
  UserCheck,
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
  ShieldCheck,
} from 'lucide-react'
import { AppLogo } from '@/components/AppLogo'
import { useToast } from '@/components/ui/toast'
import {
  validateEmail,
  validateTelefono,
  validatePassword,
  validateRequired,
} from '@/lib/validation'

interface StudioVerificato {
  id: string
  nome: string
  codiceStudio: string
  indirizzo: string | null
  telefono: string | null
}

function RegistrazioneMedicoForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()

  const [codiceStudio, setCodiceStudio] = useState('')
  const [verificandoCodice, setVerificandoCodice] = useState(false)
  const [studioVerificato, setStudioVerificato] = useState<StudioVerificato | null>(null)
  const [erroreCodice, setErroreCodice] = useState<string | null>(null)

  // Form dati personali
  const [ruolo, setRuolo] = useState<'medico' | 'collaboratore'>('medico')
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [errore, setErrore] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [completato, setCompletato] = useState(false)
  const [messaggioSuccesso, setMessaggioSuccesso] = useState('')

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  // Inizializza codice studio da query param ?codice=...
  useEffect(() => {
    const paramCodice = searchParams.get('codice')
    if (paramCodice) {
      setCodiceStudio(paramCodice)
      verificaCodiceStudio(paramCodice)
    }
  }, [searchParams])

  const verificaCodiceStudio = async (codiceDaVerificare = codiceStudio) => {
    const cleanCode = codiceDaVerificare.trim().toUpperCase()
    if (!cleanCode || cleanCode.length < 4) {
      setErroreCodice('Inserisci un codice studio valido (es. STU-ROMA-1001)')
      setStudioVerificato(null)
      toast.warning('Codice mancante', 'Inserisci il codice studio prima di verificare')
      return
    }

    setVerificandoCodice(true)
    setErroreCodice(null)

    try {
      const res = await fetch(`/api/studi/verifica-codice?codice=${encodeURIComponent(cleanCode)}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Codice Studio non trovato o non valido')
      }

      setStudioVerificato(data.studio)
      setCodiceStudio(cleanCode)
      toast.success('Studio verificato', `Collegato a ${data.studio.nome}`)
    } catch (err: any) {
      const msg = err.message || 'Errore durante la verifica del codice'
      setErroreCodice(msg)
      setStudioVerificato(null)
      toast.error('Verifica fallita', msg)
    } finally {
      setVerificandoCodice(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!studioVerificato) {
      errors.codiceStudio = 'Devi prima verificare con successo un Codice Studio valido'
    }

    const vNome = validateRequired(nome, 'Il nome')
    if (!vNome.valid) errors.nome = vNome.error!

    const vCognome = validateRequired(cognome, 'Il cognome')
    if (!vCognome.valid) errors.cognome = vCognome.error!

    const vEmail = validateEmail(email, true)
    if (!vEmail.valid) errors.email = vEmail.error!

    const vTel = validateTelefono(telefono, true)
    if (!vTel.valid) errors.telefono = vTel.error!

    const vPwd = validatePassword(password, 6)
    if (!vPwd.valid) errors.password = vPwd.error!

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleRegistrazione = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.warning('Dati non validi', 'Controlla i campi contrassegnati in rosso')
      return
    }

    setLoading(true)
    setErrore(null)

    try {
      const res = await fetch('/api/auth/registrazione-medico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codiceStudio,
          ruolo,
          nome: nome.trim(),
          cognome: cognome.trim(),
          email: email.trim().toLowerCase(),
          telefono: telefono.trim(),
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Errore durante la registrazione')
      }

      toast.success('Registrazione completata!', data.message || 'Account attivato con successo')
      setMessaggioSuccesso(data.message)
      setCompletato(true)
    } catch (err: any) {
      const msg = err.message || 'Errore durante la registrazione'
      setErrore(msg)
      toast.error('Registrazione non riuscita', msg)
      if (msg.toLowerCase().includes('email')) {
        setFieldErrors((prev) => ({ ...prev, email: msg }))
      }
    } finally {
      setLoading(false)
    }
  }

  if (completato) {
    return (
      <div className="w-full max-w-lg bg-white rounded-2xl p-8 shadow-xl border border-slate-200/80 space-y-6 text-center">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-emerald-100 text-emerald-600 items-center justify-center shadow-lg shadow-emerald-500/20 mb-2">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Registrazione Completata!
        </h2>
        <p className="text-sm text-slate-600 font-medium">
          {messaggioSuccesso}
        </p>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-1">
          <p className="font-bold text-slate-800">Studio di appartenenza:</p>
          <p className="text-sky-700 font-semibold">{studioVerificato?.nome}</p>
          <p className="text-slate-500">{studioVerificato?.indirizzo || ''}</p>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="w-full py-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm shadow-sky-600/20 transition-all"
        >
          <span>Accedi al Portale</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200/80 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-1">
          <AppLogo size={68} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Iscrizione Medico & Collaboratore
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Associa il tuo account professionale allo studio medico di riferimento tramite Codice Invito
        </p>
      </div>

      {/* Step 1: Codice Studio */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          fieldErrors.codiceStudio ? 'bg-rose-50/40 border-rose-400' : 'bg-slate-50 border-slate-200'
        } space-y-3`}
      >
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          1. Inserisci il Codice Studio (ricevuto dall'Amministratore) *
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Key className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={codiceStudio}
              onChange={(e) => {
                setCodiceStudio(e.target.value.toUpperCase())
                setStudioVerificato(null)
                setErroreCodice(null)
                clearFieldError('codiceStudio')
              }}
              placeholder="Es. STU-ROMA-1001"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-mono font-bold uppercase focus:outline-none transition-all ${
                fieldErrors.codiceStudio
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/60 text-rose-900 focus:border-rose-600'
                  : 'border-slate-200 text-slate-900 focus:ring-2 focus:ring-sky-500 bg-white'
              }`}
            />
          </div>
          <button
            type="button"
            onClick={() => verificaCodiceStudio()}
            disabled={verificandoCodice || !codiceStudio.trim()}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {verificandoCodice ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>Verifica</span>
            )}
          </button>
        </div>

        {erroreCodice && (
          <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{erroreCodice}</span>
          </p>
        )}

        {fieldErrors.codiceStudio && (
          <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{fieldErrors.codiceStudio}</span>
          </p>
        )}

        {studioVerificato && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Studio Verificato: {studioVerificato.nome}</span>
            </div>
            <p className="text-emerald-700 text-[11px]">
              {studioVerificato.indirizzo || 'Sede operativa accreditata'}
            </p>
          </div>
        )}
      </div>

      {/* Error notification */}
      {errore && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
          <span>{errore}</span>
        </div>
      )}

      {/* Step 2 & 3 Form: Abilitato solo se lo studio è verificato */}
      <form onSubmit={handleRegistrazione} className="space-y-4" noValidate>
        {/* Scelta Ruolo */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            2. Seleziona il tuo Ruolo *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRuolo('medico')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                ruolo === 'medico'
                  ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/20 text-sky-950'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 font-extrabold text-xs">
                <Stethoscope className={`h-4 w-4 ${ruolo === 'medico' ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>Medico MMG</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Agenda visite personale, cartella pazienti e prescrizioni
              </p>
            </button>

            <button
              type="button"
              onClick={() => setRuolo('collaboratore')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                ruolo === 'collaboratore'
                  ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-950'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 font-extrabold text-xs">
                <UserCheck className={`h-4 w-4 ${ruolo === 'collaboratore' ? 'text-amber-600' : 'text-slate-400'}`} />
                <span>Segreteria</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Accettazione sala d'attesa, sportello e coda richieste
              </p>
            </button>
          </div>
        </div>

        {/* Dati Anagrafici */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Nome *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value)
                clearFieldError('nome')
              }}
              placeholder="Mario"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                fieldErrors.nome
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/40 text-rose-900 focus:outline-none focus:border-rose-600'
                  : 'border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50'
              }`}
            />
            {fieldErrors.nome && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{fieldErrors.nome}</span>
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Cognome *
            </label>
            <input
              type="text"
              value={cognome}
              onChange={(e) => {
                setCognome(e.target.value)
                clearFieldError('cognome')
              }}
              placeholder="Rossi"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                fieldErrors.cognome
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/40 text-rose-900 focus:outline-none focus:border-rose-600'
                  : 'border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50'
              }`}
            />
            {fieldErrors.cognome && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{fieldErrors.cognome}</span>
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Indirizzo Email Professionale (Login) *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                clearFieldError('email')
              }}
              placeholder="dott.rossi@studiomedico.it"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                fieldErrors.email
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/40 text-rose-900 focus:outline-none focus:border-rose-600'
                  : 'border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50'
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-semibold">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{fieldErrors.email}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Recapito Telefonico Primario *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <PhoneCall className="h-4 w-4" />
            </div>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => {
                setTelefono(e.target.value)
                clearFieldError('telefono')
              }}
              placeholder="+39 340 1234567"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                fieldErrors.telefono
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/40 text-rose-900 focus:outline-none focus:border-rose-600'
                  : 'border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50'
              }`}
            />
          </div>
          {fieldErrors.telefono && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-semibold">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{fieldErrors.telefono}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Password Personale (min. 6 caratteri) *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                clearFieldError('password')
              }}
              placeholder="••••••••"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                fieldErrors.password
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/40 text-rose-900 focus:outline-none focus:border-rose-600'
                  : 'border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50'
              }`}
            />
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-semibold">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{fieldErrors.password}</span>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !studioVerificato}
          className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm shadow-sky-600/20 transition-all cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creazione profilo e configurazione agenda...</span>
            </>
          ) : (
            <>
              <span>Completa Registrazione ed Entra</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer login link */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <Link
          href="/login"
          className="font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Torna al Login
        </Link>
        <span className="flex items-center gap-1 text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Accesso Sanitario GDPR
        </span>
      </div>
    </div>
  )
}

export default function RegistrazioneMedicoPage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-slate-50 p-4 sm:p-6 font-sans pt-safe pb-safe">
      <Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs">Caricamento modulo...</div>}>
        <RegistrazioneMedicoForm />
      </Suspense>
    </main>
  )
}
