'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/paziente
 * @description Home dashboard paziente web: visite programmate, avvisi medico e richieste
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.2.0
 */

import Link from 'next/link'
import {
  CalendarCheck,
  Clock,
  MapPin,
  Phone,
  Stethoscope,
  Pill,
  FileText,
  AlertCircle,
  Plus,
  ChevronRight,
  Download,
  CheckCircle2,
  Lock,
  Key,
  X,
} from 'lucide-react'

import { useState, useEffect } from 'react'

export default function PazientePage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false)
  const [nuovaPassword, setNuovaPassword] = useState('')
  const [confermaPassword, setConfermaPassword] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated && d.user) {
          setCurrentUser(d.user)
        }
      })
      .catch(() => {})
  }, [])

  const handleCambiaPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    if (nuovaPassword.length < 6) {
      setPasswordError('La password deve contenere almeno 6 caratteri')
      return
    }
    if (nuovaPassword !== confermaPassword) {
      setPasswordError('Le due password non coincidono')
      return
    }

    setSavingPassword(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuovaPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore durante il cambio password')

      setPasswordSuccess(true)
      setCurrentUser({ ...currentUser, primoAccesso: false })
      setTimeout(() => {
        setModalPasswordOpen(false)
        setPasswordSuccess(false)
      }, 2000)
    } catch (err: any) {
      setPasswordError(err.message)
    } finally {
      setSavingPassword(false)
    }
  }

  const [prossimaVisita, setProssimaVisita] = useState<{
    data: string
    ora: string
    dottore: string
    motivo: string
    tipo: string
    stato: string
  } | null>(null)

  const [storicoVisite, setStoricoVisite] = useState<
    Array<{
      data: string
      motivo: string
      esito: string
    }>
  >([])

  const [richiesteAttive, setRichiesteAttive] = useState<
    Array<{
      tipo: string
      titolo: string
      data: string
      stato: string
      ritiro: string
    }>
  >([])

  return (
    <div className="space-y-8 font-sans">
      {/* Banner Primo Accesso Password Temporanea */}
      {currentUser?.primoAccesso && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-amber-950 text-sm">
                Primo Accesso: Password Temporanea Rilevata
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                Stai utilizzando la password provvisoria a 6 caratteri generata dallo studio. Ti consigliamo di impostare subito una password personale.
              </p>
            </div>
          </div>
          <button
            onClick={() => setModalPasswordOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all flex-shrink-0"
          >
            Personalizza Password
          </button>
        </div>
      )}

      {/* Banner Medico Curante */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 md:p-8 text-white shadow-lg shadow-emerald-600/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start md:items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white font-bold text-xl shadow-inner">
            MV
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-200 mb-1">
              <span>Il Tuo Medico di Medicina Generale</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Dott. Mario Verdi</h1>
            <p className="text-xs text-emerald-100 mt-1 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> Studio San Marco, Via Roma 123 (Milano)
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" /> +39 02 1234567
              </span>
            </p>
          </div>
        </div>

        <Link
          href="/paziente/prenota"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs shadow-md transition-all self-start md:self-auto"
        >
          <CalendarCheck className="h-4 w-4 text-emerald-700" />
          <span>Prenota Nuovo Appuntamento</span>
        </Link>
      </div>

      {/* Avviso Ufficiale dello Studio */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong className="font-bold">Comunicazione Studio:</strong> In caso di emergenza grave o pericolo di vita contattare il 112 o recarsi al Pronto Soccorso. Per visite domiciliari urgenti chiamare la segreteria entro le ore 10:00.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Prossimo Appuntamento & Storico */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card Prossimo Appuntamento */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-emerald-600" />
                Prossima Visita Fissata
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                {prossimaVisita ? `● ${prossimaVisita.stato}` : 'Nessuna visita attiva'}
              </span>
            </div>

            {prossimaVisita ? (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-base text-slate-900">{prossimaVisita.data}</p>
                    <p className="text-xs font-bold text-emerald-700 mt-0.5 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> Orario: {prossimaVisita.ora} ({prossimaVisita.tipo})
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/60 font-medium">
                  <strong>Motivo:</strong> {prossimaVisita.motivo}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Disdetta libera consentita fino a 2 ore prima
                  </span>
                  <button className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors">
                    Disdici Visita
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-3">
                <Clock className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Non hai visite in programma</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Scegli comodamente data e ora per il tuo prossimo controllo o visita medica.
                </p>
                <div className="pt-1">
                  <Link
                    href="/paziente/prenota"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <Plus className="h-4 w-4" /> Prenota Visita Adesso
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Storico Visite */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Storico Visite Recenti
            </h2>
            <div className="space-y-3">
              {storicoVisite.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Nessuna visita precedente presente in archivio.
                </div>
              ) : (
                storicoVisite.map((v, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{v.data}</span>
                      <span className="text-[11px] text-slate-400 font-semibold">Completata</span>
                    </div>
                    <p className="text-xs font-medium text-slate-700">{v.motivo}</p>
                    <p className="text-[11px] text-slate-500 italic">{v.esito}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Richieste Speciali & Documenti */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Richieste Attive & Certificati
            </h2>

            <div className="space-y-3">
              {richiesteAttive.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Nessuna richiesta attiva o ricetta in lavorazione.
                </div>
              ) : (
                richiesteAttive.map((req, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{req.titolo}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {req.stato}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{req.ritiro}</p>
                  </div>
                ))
              )}
            </div>

            {/* Quick action buttons for patient requests */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button className="w-full py-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all">
                <Pill className="h-4 w-4 text-blue-600" />
                <span>Richiedi Ripetizione Ricetta Farmaco</span>
              </button>
              <button className="w-full py-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all">
                <AlertCircle className="h-4 w-4 text-rose-600" />
                <span>Richiedi Certificato Malattia INPS</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Personalizzazione Password */}
      {modalPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-600" />
                Personalizza Password Personale
              </h3>
              <button onClick={() => setModalPasswordOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            {passwordSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Password aggiornata con successo!</span>
              </div>
            ) : (
              <form onSubmit={handleCambiaPassword} className="space-y-3 text-xs">
                {passwordError && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                    {passwordError}
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nuova Password * (Minimo 6 caratteri)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Nuova password personale"
                    value={nuovaPassword}
                    onChange={(e) => setNuovaPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Conferma Nuova Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Ripeti la nuova password"
                    value={confermaPassword}
                    onChange={(e) => setConfermaPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalPasswordOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 font-bold"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md shadow-amber-600/20"
                  >
                    {savingPassword ? 'Salvataggio...' : 'Salva Nuova Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

