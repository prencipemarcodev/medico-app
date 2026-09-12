'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/dashboard/broadcast
 * @description Pannello invio messaggi broadcast di emergenza con live preview notifica
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.2.0
 */

import { useState } from 'react'
import { Radio, AlertTriangle, Send, Bell, Smartphone, CheckCircle2 } from 'lucide-react'

export default function BroadcastPage() {
  const [dataTarget, setDataTarget] = useState('2026-09-09')
  const [testo, setTesto] = useState('Gentile paziente, a causa di una visita domiciliare urgente, le visite pomeridiane subiranno un ritardo di circa 30 minuti.')
  const [inviato, setInviato] = useState(false)

  const maxChars = 160
  const charsLeft = maxChars - testo.length

  const templateRapidi = [
    {
      titolo: 'Ritardo 30 minuti',
      testo: 'Gentile paziente, a causa di un\'urgenza le visite odierne subiranno circa 30 minuti di ritardo. Ci scusiamo per il disagio.',
    },
    {
      titolo: 'Chiusura Improvvisa Pomeriggio',
      testo: 'AVVISO STUDIO: Per improvvisa indisposizione del medico, lo studio oggi pomeriggio resterà chiuso. Sarete ricontattati per riprogrammare.',
    },
    {
      titolo: 'Promemoria Esami',
      testo: 'Promemoria: Per la visita di oggi si ricorda di portare il tesserino sanitario e gli ultimi esami del sangue.',
    },
  ]

  const handleSend = () => {
    setInviato(true)
    setTimeout(() => setInviato(false), 5000)
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
          <Radio className="h-4 w-4" />
          Comunicazioni d'Emergenza
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Invio Broadcast Pazienti Prenotati
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Notifica push istantanea inviata a tutti i pazienti con visita programmata nella giornata selezionata.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Seleziona Giornata Target
            </label>
            <input
              type="date"
              value={dataTarget}
              onChange={(e) => setDataTarget(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs font-medium text-emerald-600 mt-1.5 flex items-center gap-1">
              ✓ 7 pazienti trovati con prenotazione attiva in questa data
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Template Rapidi Consigliati
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {templateRapidi.map((t) => (
                <button
                  key={t.titolo}
                  type="button"
                  onClick={() => setTesto(t.testo)}
                  className="p-3 rounded-xl border border-slate-200 text-left hover:bg-slate-50 hover:border-blue-300 transition-all"
                >
                  <p className="text-xs font-bold text-slate-800">{t.titolo}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                3. Testo del Messaggio
              </label>
              <span className={`text-xs font-mono font-bold ${charsLeft < 20 ? 'text-rose-600' : 'text-slate-400'}`}>
                {charsLeft} caratteri rimasti
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={maxChars}
              value={testo}
              onChange={(e) => setTesto(e.target.value)}
              className="w-full p-4 rounded-2xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-xs"
              placeholder="Inserisci il testo dell'avviso da notificare..."
            />
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 leading-relaxed font-medium">
              Attenzione: l'invio broadcast è irrevocabile. Verrà recapitata una notifica push ad alta priorità sullo smartphone di tutti i pazienti prenotati.
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={inviato}
            className={`w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md ${
              inviato
                ? 'bg-emerald-600 shadow-emerald-600/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
            }`}
          >
            {inviato ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Broadcast Inviato con Successo a 7 Pazienti!
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Invia Notifica Push Immediata
              </>
            )}
          </button>
        </div>

        {/* Smartphone Notification Preview */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              <Smartphone className="h-4 w-4 text-slate-500" />
              Anteprima Schermo Smartphone
            </div>
            <p className="text-xs text-slate-500">Come vedrà la notifica il paziente</p>
          </div>

          {/* Phone Frame */}
          <div className="w-[300px] bg-slate-900 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800">
            {/* Notch */}
            <div className="w-28 h-4 bg-black rounded-full mx-auto mb-4" />

            {/* Lockscreen card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-md space-y-2 border border-white/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-md bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                    🏥
                  </div>
                  <span className="text-[11px] font-bold text-slate-900">Studio Medico</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Adesso</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Comunicazione dal Dott. Mario Verdi</p>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  {testo || 'Nessun testo inserito'}
                </p>
              </div>
            </div>

            <div className="h-16 flex items-center justify-center text-white/30 text-[10px]">
              Tocca per aprire l'app
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
