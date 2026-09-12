'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/auth
 * @description Pagina di accesso unificata con routing RBAC (Admin, Medico, Segreteria, Paziente)
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.3.0
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Building2,
  Users,
  Shield,
  Key,
  CheckCircle2,
} from 'lucide-react'

type Ruolo = 'admin' | 'medico' | 'segreteria' | 'paziente'

export default function LoginPage() {
  const router = useRouter()
  const [ruolo, setRuolo] = useState<Ruolo>('medico')
  const [email, setEmail] = useState('mario.verdi@studiomedicosanmarco.it')
  const [password, setPassword] = useState('••••••••')

  const profiliDemo = [
    {
      id: 'medico' as Ruolo,
      nome: 'Dott. Mario Verdi',
      titolo: 'Medico Curante (MMG)',
      email: 'mario.verdi@studiomedicosanmarco.it',
      destinazione: '/dashboard',
      icon: Stethoscope,
      color: 'blue',
      desc: 'Gestione visite, agenda e firma ricette',
    },
    {
      id: 'segreteria' as Ruolo,
      nome: 'Giulia Colombo',
      titolo: 'Segreteria Studio',
      email: 'segreteria@studiomedicosanmarco.it',
      destinazione: '/segreteria',
      icon: Building2,
      color: 'amber',
      desc: 'Sala d\'attesa, accettazione e sportello ricette',
    },
    {
      id: 'paziente' as Ruolo,
      nome: 'Marco Prencipe',
      titolo: 'Paziente Curato',
      email: 'marco.prencipe@paziente.it',
      destinazione: '/paziente',
      icon: Users,
      color: 'emerald',
      desc: 'Prenotazione online, promemoria e ricette',
    },
    {
      id: 'admin' as Ruolo,
      nome: 'Admin di Sistema',
      titolo: 'Supervisore Piattaforma',
      email: 'admin@medicoapp.it',
      destinazione: '/admin',
      icon: Shield,
      color: 'indigo',
      desc: 'Studi accreditati, audit log GDPR e sicurezza',
    },
  ]

  const handleSelectRuolo = (r: Ruolo) => {
    setRuolo(r)
    const p = profiliDemo.find((x) => x.id === r)
    if (p) setEmail(p.email)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const target = profiliDemo.find((p) => p.id === ruolo)?.destinazione ?? '/dashboard'
    router.push(target)
  }

  const profiloAttivo = profiliDemo.find((p) => p.id === ruolo)!

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900/5 p-6 font-sans">
      <div className="w-full max-w-xl bg-white rounded-3xl p-8 shadow-xl border border-slate-200/80 space-y-7">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white items-center justify-center shadow-lg shadow-blue-500/25 mb-1">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Portale Sanitario Studio Medico</h1>
          <p className="text-xs text-slate-500 font-medium">
            Accesso unificato con reindirizzamento automatico basato sul ruolo (RBAC)
          </p>
        </div>

        {/* 4 Roles Selector Tabs */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Seleziona Profilo di Accesso (Demo Rapida)
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {profiliDemo.map((p) => {
              const Icon = p.icon
              const isSelected = ruolo === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectRuolo(p.id)}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-blue-600" />
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`h-4 w-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold text-slate-900">{p.titolo}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600 truncate">{p.nome}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{p.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Email Account
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <span className="text-xs font-semibold text-slate-400">
                (Compilata per test rapido)
              </span>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all"
          >
            <span>Accedi come {profiloAttivo.titolo}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Crittografia Sanitaria GDPR
          </span>
          <span>Reindirizza a: <code className="font-mono text-slate-700 font-bold">{profiloAttivo.destinazione}</code></span>
        </div>
      </div>
    </main>
  )
}
