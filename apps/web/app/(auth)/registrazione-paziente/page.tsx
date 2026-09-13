'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/auth/registrazione-paziente
 * @description Registrazione autonoma paziente con Codice Fiscale, dati anagrafici e credenziali
 * @author      Agent-1 | Session: 2026-09-13
 * @version     2.0.0
 */

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  Mail,
  PhoneCall,
  Calendar,
  Lock,
  Key,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Building2,
  Sparkles,
} from 'lucide-react'
import { AppLogo } from '@/components/AppLogo'

function RegistrazionePazienteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Dati Anagrafici
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [codiceFiscale, setCodiceFiscale] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [dataNascita, setDataNascita] = useState('')

  // Credenziali
  const [password, setPassword] = useState('')
  const [confermaPassword, setConfermaPassword] = useState('')
  const [accettaPrivacy, setAccettaPrivacy] = useState(false)

  // Codice Studio opzionale (se aperto da QR Code)
  const [codiceStudio, setCodiceStudio] = useState('')
  const [medicoId, setMedicoId] = useState('')

  const [loading, setLoading] = useState(false)
  const [errore, setErrore] = useState<string | null>(null)
  const [registratoConSuccesso, setRegistratoConSuccesso] = useState(false)

  useEffect(() => {
    const codeParam = searchParams.get('codiceStudio') || searchParams.get('codice')
    const medParam = searchParams.get('medicoId')
    if (codeParam) setCodiceStudio(codeParam)
    if (medParam) setMedicoId(medParam)
  }, [searchParams])

  // Calcolo automatico orientativo della data di nascita dal Codice Fiscale
  const handleCfChange = (val: string) => {
    const clean = val.toUpperCase().slice(0, 16)
    setCodiceFiscale(clean)

    if (clean.length === 16 && !dataNascita) {
      const yearPart = parseInt(clean.slice(6, 8), 10)
      const monthChar = clean[8]
      let dayPart = parseInt(clean.slice(9, 11), 10)
      if (!isNaN(yearPart) && !isNaN(dayPart)) {
        if (dayPart > 40) dayPart -= 40
        const months: Record<string, string> = {
          A: '01', B: '02', C: '03', D: '04', E: '05', H: '06',
          L: '07', M: '08', P: '09', R: '10', S: '11', T: '12',
        }
        const m = months[monthChar || '']
        if (m) {
          const currentShort = new Date().getFullYear() % 100
          const century = yearPart <= currentShort ? '20' : '19'
          setDataNascita(`${century}${yearPart.toString().padStart(2, '0')}-${m}-${dayPart.toString().padStart(2, '0')}`)
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrore(null)

    // Validazioni client
    if (!nome.trim() || !cognome.trim()) {
      setErrore('Inserisci nome e cognome')
      return
    }

    if (codiceFiscale.trim().length !== 16) {
      setErrore('Il Codice Fiscale deve contenere esattamente 16 caratteri')
      return
    }

    if (!telefono.trim()) {
      setErrore('Inserisci un numero di telefono / cellulare per i contatti sanitari')
      return
    }

    if (password.length < 8) {
      setErrore('La password deve contenere almeno 8 caratteri')
      return
    }

    if (password !== confermaPassword) {
      setErrore('Le due password non coincidono')
      return
    }

    if (!accettaPrivacy) {
      setErrore('È necessario confermare il trattamento dei dati personali GDPR')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/registrazione-paziente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          cognome: cognome.trim(),
          codiceFiscale: codiceFiscale.trim().toUpperCase(),
          dataNascita: dataNascita || undefined,
          telefono: telefono.trim(),
          email: email.trim() || undefined,
          password,
          codiceStudio: codiceStudio || undefined,
          medicoId: medicoId || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Errore durante la registrazione')
      }

      setRegistratoConSuccesso(true)
      setTimeout(() => {
        router.push('/paziente')
      }, 1500)
    } catch (err: any) {
      setErrore(err.message || 'Errore durante la registrazione')
    } finally {
      setLoading(false)
    }
  }

  if (registratoConSuccesso) {
    return (
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl border border-slate-200/80 space-y-6 text-center animate-in zoom-in-95 duration-300">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-emerald-100 text-emerald-600 items-center justify-center shadow-lg shadow-emerald-500/20 mb-2">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Registrazione Completata!
        </h2>
        <p className="text-sm text-slate-600 font-medium">
          Il tuo profilo sanitario è stato creato con successo. Accesso in corso al tuo portale paziente...
        </p>
        <div className="flex justify-center pt-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-1">
          <AppLogo size={68} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Iscrizione Portale Paziente
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Inserisci i tuoi dati personali per creare la tua cartella sanitaria personale
        </p>
      </div>

      {errore && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
          <span>{errore}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome e Cognome */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Nome *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Mario"
                className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Cognome *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={cognome}
                onChange={(e) => setCognome(e.target.value)}
                placeholder="Rossi"
                className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* Codice Fiscale */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Codice Fiscale * <span className="text-[11px] font-normal lowercase text-slate-400">(sarà il tuo username per accedere)</span>
          </label>
          <div className="relative">
            <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              required
              maxLength={16}
              value={codiceFiscale}
              onChange={(e) => handleCfChange(e.target.value)}
              placeholder="RSSMRA85M01H501Z"
              className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 text-sm font-mono font-bold text-slate-900 uppercase placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50"
            />
          </div>
        </div>

        {/* Telefono ed Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Telefono / Cellulare *
            </label>
            <div className="relative">
              <PhoneCall className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+39 333 1234567"
                className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Email <span className="text-[10px] font-normal lowercase text-slate-400">(opzionale)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mario.rossi@email.it"
                className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* Data di Nascita */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Data di Nascita <span className="text-[10px] font-normal lowercase text-slate-400">(rilevata dal Codice Fiscale)</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={dataNascita}
              onChange={(e) => setDataNascita(e.target.value)}
              className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50"
            />
          </div>
        </div>

        {/* Password e Conferma Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Password Personale *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 8 caratteri"
                className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Conferma Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={8}
                value={confermaPassword}
                onChange={(e) => setConfermaPassword(e.target.value)}
                placeholder="Ripeti la password"
                className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* Consenso Privacy */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              required
              checked={accettaPrivacy}
              onChange={(e) => setAccettaPrivacy(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
            />
            <span className="text-xs text-slate-600 leading-relaxed font-medium">
              Dichiaro di aver letto l'informativa privacy e acconsento al trattamento dei miei dati sanitari e anagrafici ai sensi del Regolamento UE 2016/679 (GDPR).
            </span>
          </label>
        </div>

        {/* Pulsante Invio */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creazione profilo in corso...</span>
            </>
          ) : (
            <>
              <span>Registrati & Accedi</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Link al Login */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <Link
          href="/login"
          className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Hai già un account? Accedi
        </Link>
        <span className="flex items-center gap-1 text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Accesso Sanitario GDPR
        </span>
      </div>
    </div>
  )
}

export default function RegistrazionePazientePage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#090d16] p-4 sm:p-6 font-sans pt-safe pb-safe">
      <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Caricamento modulo...</div>}>
        <RegistrazionePazienteForm />
      </Suspense>
    </main>
  )
}
