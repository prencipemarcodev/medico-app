'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/segreteria
 * @description Dashboard operativa segreteria: sala d'attesa, accettazione e sportello ritiro
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.2.0
 */

import { useState } from 'react'
import {
  Users,
  CheckCircle2,
  Clock,
  PhoneCall,
  UserPlus,
  FileCheck,
  Building2,
  Stethoscope,
  ChevronRight,
  PackageCheck,
  Check,
} from 'lucide-react'

export default function SegreteriaPage() {
  // Sala d'attesa (inizializzata vuota per accogliere dati reali)
  const [salaAttesa, setSalaAttesa] = useState<
    Array<{
      id: string
      nome: string
      ora: string
      stato: 'in_attesa' | 'in_visita'
      motivo: string
      arrivatoAlle: string
    }>
  >([])

  // Ritiro ricette cartacee (inizializzato vuoto)
  const [ricetteDaRitirare, setRicetteDaRitirare] = useState<
    Array<{
      id: string
      paziente: string
      documento: string
      emessaIl: string
      consegnata: boolean
    }>
  >([])

  // Form rapido accettazione telefonica
  const [nomeTel, setNomeTel] = useState('')
  const [motivoTel, setMotivoTel] = useState('')
  const [prenotatoSuccess, setPrenotatoSuccess] = useState(false)

  const handleSegnaConsegnata = (id: string) => {
    setRicetteDaRitirare(
      ricetteDaRitirare.map((r) => (r.id === id ? { ...r, consegnata: true } : r))
    )
  }

  const handlePrenotaManuale = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nomeTel) return
    setSalaAttesa([
      ...salaAttesa,
      {
        id: String(Date.now()),
        nome: nomeTel,
        ora: '10:40',
        stato: 'in_attesa',
        motivo: motivoTel || 'Visita urgente richiesta al telefono',
        arrivatoAlle: 'In arrivo',
      },
    ])
    setNomeTel('')
    setMotivoTel('')
    setPrenotatoSuccess(true)
    setTimeout(() => setPrenotatoSuccess(false), 3000)
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            <Building2 className="h-4 w-4" />
            Sportello & Front-Desk
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Accettazione Pazienti & Ritiro Documenti
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestisci in tempo reale la presenza dei pazienti in sala d'attesa e la consegna delle ricette cartacee.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs flex items-center gap-3">
            <Users className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-extrabold text-slate-900">
                {salaAttesa.filter((p) => p.stato === 'in_attesa').length} Pazienti in Attesa
              </p>
              <p className="text-[11px] text-amber-700">
                {salaAttesa.some((p) => p.stato === 'in_visita')
                  ? '1 Paziente dentro con il dottore'
                  : 'Nessun paziente in ambulatorio'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Sala d'Attesa Live */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Sala d'Attesa Studio (Stato Attuale)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Visite e presenze allo sportello</p>
            </div>
            {salaAttesa.find((p) => p.stato === 'in_visita') ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                ● In Visita: {salaAttesa.find((p) => p.stato === 'in_visita')?.nome}
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                ● Studio Libero
              </span>
            )}
          </div>

          <div className="space-y-3">
            {salaAttesa.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <Users className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Nessun paziente in sala d'attesa</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  La sala d'attesa è attualmente vuota. Quando un paziente arriva o chiama allo sportello, puoi registrarlo tramite il form rapido sottostante.
                </p>
              </div>
            ) : (
              salaAttesa.map((paz) => (
                <div
                  key={paz.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    paz.stato === 'in_visita'
                      ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="font-mono text-xs font-bold text-slate-700 w-16 text-center py-2 bg-slate-100 rounded-xl">
                      {paz.ora}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{paz.nome}</span>
                        {paz.stato === 'in_visita' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                            In Ambulatorio
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            In Poltrona
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{paz.motivo}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Arrivo segnato: {paz.arrivatoAlle}</p>
                    </div>
                  </div>

                  <div>
                    {paz.stato === 'in_attesa' && (
                      <button
                        onClick={() =>
                          setSalaAttesa(
                            salaAttesa.map((x) =>
                              x.id === paz.id ? { ...x, stato: 'in_visita' } : { ...x, stato: 'in_attesa' }
                            )
                          )
                        }
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                      >
                        Fai Entrare
                      </button>
                    )}
                    {paz.stato === 'in_visita' && (
                      <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                        <Stethoscope className="h-4 w-4" /> In Visita
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form Rapido Prenotazione Telefonica */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <PhoneCall className="h-4 w-4 text-emerald-600" />
              Inserimento Visita Rapida (Telefonata o Sportello)
            </h3>
            <form onSubmit={handlePrenotaManuale} className="flex gap-2">
              <input
                type="text"
                placeholder="Nome e Cognome Paziente"
                value={nomeTel}
                onChange={(e) => setNomeTel(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white shadow-xs"
                required
              />
              <input
                type="text"
                placeholder="Motivo (es. Febbre alta)"
                value={motivoTel}
                onChange={(e) => setMotivoTel(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white shadow-xs"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
              >
                <UserPlus className="h-3.5 w-3.5" /> Aggiungi
              </button>
            </form>
            {prenotatoSuccess && (
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Paziente aggiunto con successo in sala d'attesa!
              </p>
            )}
          </div>
        </div>

        {/* Right: Sportello Ritiro Ricette & Certificati */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-amber-600" />
              Sportello Ritiro Ricette Fisiche
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ricette bianche/rosse e certificati in originale pronti per la consegna
            </p>
          </div>

          <div className="space-y-3">
            {ricetteDaRitirare.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <PackageCheck className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Nessuna ricetta da ritirare</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Al momento non ci sono ricette cartacee o certificati fisici in attesa di ritiro allo sportello.
                </p>
              </div>
            ) : (
              ricetteDaRitirare.map((r) => (
                <div
                  key={r.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                    r.consegnata
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-amber-50/40 border-amber-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">{r.paziente}</span>
                    <span className="text-[10px] font-semibold text-slate-400">{r.emessaIl}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 bg-white p-2 rounded-xl border border-slate-100">
                    {r.documento}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    {r.consegnata ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Consegnata al paziente
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSegnaConsegnata(r.id)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1"
                      >
                        <Check className="h-3.5 w-3.5" /> Segna come Consegnata
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
