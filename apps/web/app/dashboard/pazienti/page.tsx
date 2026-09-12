'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/dashboard/pazienti
 * @description Cartella clinica e ricerca assistiti per il Medico Curante (MMG)
 * @author      Agent-1 | Session: 2026-09-12
 * @version     1.0.0
 */

import { useState, useEffect } from 'react'
import {
  Search,
  Users,
  Stethoscope,
  Pill,
  Calendar,
  PhoneCall,
  Mail,
  Edit2,
  CheckCircle2,
  Clock,
  Shield,
  X,
  FileText,
  Loader2,
  Plus,
} from 'lucide-react'

interface PazienteItem {
  id: string
  nome: string
  cognome: string
  codiceFiscale: string
  dataNascita: string
  email: string | null
  telefono: string | null
  studioId: string
  nomeStudio: string | null
  medicoId: string
  nomeMedico: string | null
  cognomeMedico: string | null
  primoAccesso: boolean
}

export default function MedicoPazientiPage() {
  const [query, setQuery] = useState('')
  const [pazienti, setPazienti] = useState<PazienteItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selezionato, setSelezionato] = useState<PazienteItem | null>(null)

  // Operazioni
  const [modalPrescriviOpen, setModalPrescriviOpen] = useState(false)
  const [farmaco, setFarmaco] = useState('')
  const [modalContattiOpen, setModalContattiOpen] = useState(false)
  const [editTelefono, setEditTelefono] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null)

  // Ricerca live
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/pazienti/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        if (data.success) {
          setPazienti(data.pazienti || [])
          if (data.pazienti?.length > 0 && !selezionato) {
            setSelezionato(data.pazienti[0])
          }
        }
      } catch (err) {
        console.error('Errore ricerca:', err)
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  // Azione Chiama in Visita
  const handleChiamaVisita = () => {
    if (!selezionato) return
    setFeedbackSuccess(`Paziente ${selezionato.nome} ${selezionato.cognome} chiamato in ambulatorio!`)
    setTimeout(() => setFeedbackSuccess(null), 4000)
  }

  // Azione Emetti Prescrizione
  const handleEmettiPrescrizione = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selezionato) return

    try {
      const res = await fetch(`/api/pazienti/${selezionato.id}/operazioni`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          azione: 'richiesta',
          tipo: 'medicinale',
          farmaco,
          dettaglio: `Prescrizione medica emessa in ambulatorio: ${farmaco}`,
          modalitaRitiro: 'digitale',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore emissione prescrizione')

      setModalPrescriviOpen(false)
      setFarmaco('')
      setFeedbackSuccess(`Ricetta dematerializzata per ${farmaco} emessa con successo!`)
      setTimeout(() => setFeedbackSuccess(null), 4000)
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Azione Aggiorna Contatti
  const handleAggiornaContatti = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selezionato) return

    try {
      const res = await fetch(`/api/pazienti/${selezionato.id}/operazioni`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          azione: 'aggiorna_contatti',
          telefono: editTelefono,
          email: editEmail,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore aggiornamento contatti')

      setModalContattiOpen(false)
      setSelezionato({
        ...selezionato,
        telefono: editTelefono || null,
        email: editEmail || null,
      })
      setPazienti(
        pazienti.map((p) =>
          p.id === selezionato.id
            ? { ...p, telefono: editTelefono || null, email: editEmail || null }
            : p
        )
      )
      setFeedbackSuccess('Recapiti del paziente salvati!')
      setTimeout(() => setFeedbackSuccess(null), 4000)
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Stethoscope className="h-4 w-4" />
            Ambulatorio Medico Curante
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Cartella & Ricerca Assistiti
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consulta la scheda clinico-anagrafica dei pazienti in carico ed esegui prescrizioni immediate.
          </p>
        </div>

        {/* Live Search Bar */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> : <Search className="h-4 w-4" />}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca paziente per Cognome, Nome, CF..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 shadow-xs"
          />
        </div>
      </div>

      {feedbackSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {/* Grid: List & Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lista Assistiti */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Assistiti Trovati ({pazienti.length})
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {pazienti.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <Users className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">Nessun assistito trovato</p>
                <p className="text-[11px] text-slate-400">
                  {query ? 'Nessun risultato con questi parametri' : 'I pazienti compaiono non appena importati da CSV o registrati'}
                </p>
              </div>
            ) : (
              pazienti.map((paz) => {
                const isSelected = selezionato?.id === paz.id
                return (
                  <button
                    key={paz.id}
                    type="button"
                    onClick={() => setSelezionato(paz)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">
                          {paz.cognome} {paz.nome}
                        </h4>
                        <p className="font-mono text-[11px] text-indigo-700 font-bold mt-0.5">
                          {paz.codiceFiscale}
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                        {paz.dataNascita}
                      </span>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Curante: Dott. {paz.nomeMedico} {paz.cognomeMedico}</span>
                      <span>{paz.telefono || 'No tel'}</span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column: Scheda Clinica & Azioni Medico */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          {selezionato ? (
            <div className="space-y-6">
              {/* Header Scheda */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="h-14 w-14 rounded-2xl bg-blue-100 text-blue-800 font-extrabold text-xl flex items-center justify-center border border-blue-200">
                    {selezionato.nome[0]}
                    {selezionato.cognome[0]}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-900">
                      {selezionato.nome} {selezionato.cognome}
                    </h3>
                    <p className="text-xs font-mono font-bold text-indigo-600 mt-0.5">
                      CF: {selezionato.codiceFiscale}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditTelefono(selezionato.telefono || '')
                      setEditEmail(selezionato.email || '')
                      setModalContattiOpen(true)
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Recapiti</span>
                  </button>
                </div>
              </div>

              {/* Dati Clinico-Anagrafici */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                  <span className="text-slate-400 block font-medium">Data di Nascita</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{selezionato.dataNascita}</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                  <span className="text-slate-400 block font-medium">Medico Curante</span>
                  <span className="font-bold text-blue-700 mt-0.5 block">
                    Dott. {selezionato.nomeMedico} {selezionato.cognomeMedico}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                  <span className="text-slate-400 block font-medium">Telefono</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    {selezionato.telefono || 'Non specificato'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs sm:col-span-3">
                  <span className="text-slate-400 block font-medium">Email Registrata</span>
                  <span className="font-bold text-slate-900 mt-0.5 block truncate">
                    {selezionato.email || 'Nessuna email registrata'}
                  </span>
                </div>
              </div>

              {/* Azioni Medico */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Operazioni Cliniche in Ambulatorio:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleChiamaVisita}
                    className="p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Stethoscope className="h-4 w-4" />
                    <span>Chiama in Ambulatorio / Avvia Visita</span>
                  </button>

                  <button
                    onClick={() => {
                      setFarmaco('')
                      setModalPrescriviOpen(true)
                    }}
                    className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Pill className="h-4 w-4" />
                    <span>Prescrivi Ricetta / Farmaco</span>
                  </button>
                </div>
              </div>

              {/* Credenziali di Accesso del Paziente */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/70 text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-indigo-950">Credenziali Portale Paziente</p>
                  <p className="text-[11px] text-indigo-700 mt-0.5">
                    Username: <code className="font-mono font-bold text-indigo-900">{selezionato.codiceFiscale}</code>
                  </p>
                </div>
                {selezionato.primoAccesso ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    Password iniziale di 6 caratteri
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Password personalizzata
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Users className="h-10 w-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">Seleziona un assistito</p>
              <p className="text-xs">Scegli un paziente per consultare la cartella anagrafica.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODALE: EMETTI PRESCRIZIONE */}
      {modalPrescriviOpen && selezionato && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Pill className="h-4 w-4 text-emerald-600" />
                Emetti Ricetta per {selezionato.cognome} {selezionato.nome}
              </h3>
              <button onClick={() => setModalPrescriviOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEmettiPrescrizione} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Farmaco e Posologia *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Amoxicillina 1g, 1 compressa ogni 12 ore per 6 giorni"
                  value={farmaco}
                  onChange={(e) => setFarmaco(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <p className="text-[11px] text-slate-500">
                La prescrizione verrà dematerializzata e resa immediatamente visibile nell'app del paziente con codice NRE.
              </p>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalPrescriviOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  Firma ed Emetti Ricetta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE: MODIFICA CONTATTI */}
      {modalContattiOpen && selezionato && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-slate-600" />
                Modifica Recapiti Paziente
              </h3>
              <button onClick={() => setModalContattiOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAggiornaContatti} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Numero di Telefono
                </label>
                <input
                  type="text"
                  placeholder="Es. +39 340 1234567"
                  value={editTelefono}
                  onChange={(e) => setEditTelefono(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Es. paziente@email.it"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalContattiOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20"
                >
                  Salva Modifiche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
