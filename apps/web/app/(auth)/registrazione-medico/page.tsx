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
  const [completato, setCompletato] = useState(false)
  const [messaggioSuccesso, setMessaggioSuccesso] = useState('')

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
      setErroreCodice('Inserisci un codice valido (es. STU-ROMA-1001)')
      setStudioVerificato(null)
      return
    }

    setVerificandoCodice(true)
    setErroreCodice(null)

    try {
      const res = await fetch(`/api/studi/verifica-codice?codice=${encodeURIComponent(cleanCode)}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Codice Studio non trovato')
      }

      setStudioVerificato(data.studio)
      setCodiceStudio(cleanCode)
    } catch (err: any) {
      setErroreCodice(err.message || 'Errore durante la verifica del codice')
      setStudioVerificato(null)
    } finally {
      setVerificandoCodice(false)
    }
  }

  const handleRegistrazione = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studioVerificato) {
      setErrore('Verifica prima un Codice Studio valido')
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
          nome,
          cognome,
          email,
          telefono,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Errore durante la registrazione')
      }

      setMessaggioSuccesso(data.message)
      setCompletato(true)
    } catch (err: any) {
      setErrore(err.message || 'Errore durante la registrazione')
    } finally {
      setLoading(false)
    }
  }

  if (completato) {
    return (
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-xl border border-slate-200/80 space-y-6 text-center">
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
          <p className="text-indigo-700 font-semibold">{studioVerificato?.nome}</p>
          <p className="text-slate-500">{studioVerificato?.indirizzo || ''}</p>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
        >
          <span>Accedi al Portale</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl bg-white rounded-3xl p-8 shadow-xl border border-slate-200/80 space-y-6">
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
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          1. Inserisci il Codice Studio (ricevuto dall'Amministratore)
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
              }}
              placeholder="Es. STU-ROMA-1001"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <button
            type="button"
            onClick={() => verificaCodiceStudio()}
            disabled={verificandoCodice || !codiceStudio.trim()}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
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
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
          <span>{errore}</span>
        </div>
      )}

      {/* Step 2 & 3 Form: Abilitato solo se lo studio è verificato */}
      <form onSubmit={handleRegistrazione} className="space-y-4">
        {/* Scelta Ruolo */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            2. Seleziona il tuo Ruolo
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRuolo('medico')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                ruolo === 'medico'
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-950'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 font-extrabold text-xs">
                <Stethoscope className={`h-4 w-4 ${ruolo === 'medico' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>Medico MMG</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Agenda visite personale, cartella pazienti e prescrizioni
              </p>
            </button>

            <button
              type="button"
              onClick={() => setRuolo('collaboratore')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
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
              Nome
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Mario"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Cognome
            </label>
            <input
              type="text"
              value={cognome}
              onChange={(e) => setCognome(e.target.value)}
              placeholder="Rossi"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Indirizzo Email Professionale (Login)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dott.rossi@studiomedico.it"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Recapito Telefonico Primario
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <PhoneCall className="h-4 w-4" />
            </div>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+39 340 1234567"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Password Personale (min. 6 caratteri)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !studioVerificato}
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
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
          className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
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
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#090d16] p-4 sm:p-6 font-sans pt-safe pb-safe">
      <Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs">Caricamento modulo...</div>}>
        <RegistrazioneMedicoForm />
      </Suspense>
    </main>
  )
}
