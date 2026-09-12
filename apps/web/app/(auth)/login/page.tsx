'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/auth
 * @description Pagina di accesso unificata reale con autenticazione DB e routing RBAC
 * @author      Agent-1 | Session: 2026-09-12
 * @version     1.0.0
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  Lock,
  User,
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Credenziali non valide')
      }

      // Reindirizzamento al portale associato al ruolo autenticato
      router.push(data.redirectUrl || '/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Errore durante l\'accesso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900/5 p-6 font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-xl border border-slate-200/80 space-y-7">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white items-center justify-center shadow-lg shadow-blue-500/25 mb-1">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Portale Studio Medico</h1>
          <p className="text-xs text-slate-500 font-medium">
            Accesso sicuro per Pazienti, Medici, Segreteria e Amministrazione
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Codice Fiscale o Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Es. Codice Fiscale (16 car.) o email@studio.it"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                required
                autoComplete="username"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              I pazienti accedono con il proprio <b>Codice Fiscale</b>, il personale con l'email.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password personale o codice a 6 caratteri"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                required
                autoComplete="current-password"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Per i pazienti: inserisci la password provvisoria di 6 caratteri ricevuta dallo studio.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifica credenziali in corso...</span>
              </>
            ) : (
              <>
                <span>Accedi alla Piattaforma</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Crittografia Sanitaria & GDPR
          </span>
          <span>Accesso Multi-Tenant Isolato</span>
        </div>
      </div>
    </main>
  )
}
