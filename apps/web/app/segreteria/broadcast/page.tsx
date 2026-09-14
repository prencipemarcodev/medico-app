'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/segreteria/broadcast
 * @description Pannello invio avvisi di ritardo e comunicazioni d'emergenza dalla postazione di segreteria
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.2.0
 */

import { useState } from 'react'
import { Radio, Send, Bell, Smartphone, CheckCircle2, Clock, AlertTriangle, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export default function SegreteriaBroadcastPage() {
  const { toast } = useToast()
  const [dataTarget, setDataTarget] = useState('2026-09-09')
  const [testo, setTesto] = useState(
    'AVVISO SEGRETERIA: Le visite odierne con il Dott. Mario Verdi subiranno un ritardo di circa 25 minuti causa emergenza clinica in studio. Ci scusiamo per l\'attesa.'
  )
  const [inviato, setInviato] = useState(false)
  const [erroreTesto, setErroreTesto] = useState<string | null>(null)

  const maxChars = 160
  const charsLeft = maxChars - testo.length

  const templateRapidi = [
    {
      titolo: 'Ritardo 20-30 min per Urgenza',
      testo:
        'AVVISO STUDIO: Si comunica che le visite del Dott. Mario Verdi hanno accumulato circa 25 minuti di ritardo per urgenze cliniche. Ci scusiamo per il disagio.',
    },
    {
      titolo: 'Visita Domiciliare Improvvisa',
      testo:
        'AVVISO SEGRETERIA: Il medico è momentaneamente fuori studio per visita urgente a domicilio. Rientro stimato ore 11:15. Grazie della collaborazione.',
    },
    {
      titolo: 'Invito a Presentarsi allo Sportello',
      testo:
        'Gentile paziente, ti invitiamo a confermare il tuo arrivo al desk di segreteria appena giunto in studio per ritirare il numero di chiamata.',
    },
  ]

  const handleSend = () => {
    if (!testo.trim()) {
      setErroreTesto('Inserisci il testo dell\'avviso prima di inviare')
      toast.error('Testo mancante', 'Il messaggio non può essere vuoto')
      return
    }
    setErroreTesto(null)
    setInviato(true)
    toast.success('Avviso inviato!', 'Notifica push recapitata ai 7 pazienti prenotati')
    setTimeout(() => setInviato(false), 5000)
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
          <Radio className="h-4 w-4" />
          Comunicazioni Front-Desk & Sportello
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Invia Avviso Ritardo ai Pazienti
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Notifica push istantanea inviata su smartphone a tutti i pazienti prenotati per il Dott. Mario Verdi nella giornata indicata.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Data Target Pazienti
            </label>
            <input
              type="date"
              value={dataTarget}
              onChange={(e) => setDataTarget(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 bg-white outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white shadow-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Verranno raggiunti i 7 pazienti prenotati oggi con notifiche push e badge in app.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Modelli Rapidi Segreteria
            </label>
            <div className="grid grid-cols-1 gap-2">
              {templateRapidi.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTesto(t.testo)}
                  className="text-left p-3 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all text-xs"
                >
                  <p className="font-bold text-slate-800">{t.titolo}</p>
                  <p className="text-slate-500 truncate mt-0.5">{t.testo}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Testo Notifica Push (SMS/App)
              </label>
              <span
                className={`text-xs font-mono font-bold ${
                  charsLeft < 0 ? 'text-red-600' : charsLeft < 20 ? 'text-amber-600' : 'text-slate-400'
                }`}
              >
                {charsLeft} car. rimasti
              </span>
            </div>
            <textarea
              rows={4}
              value={testo}
              onChange={(e) => {
                setTesto(e.target.value)
                if (erroreTesto) setErroreTesto(null)
              }}
              className={`w-full p-4 rounded-2xl border text-sm font-medium text-slate-900 bg-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white resize-none transition-all shadow-xs ${
                erroreTesto ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-200'
              }`}
              placeholder="Scrivi qui il messaggio..."
            />
            {erroreTesto && (
              <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 inline" /> {erroreTesto}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={inviato || testo.length === 0 || charsLeft < 0}
            className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              inviato
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
            }`}
          >
            {inviato ? (
              <>
                <CheckCircle2 className="h-5 w-5" /> Notifica Inviata a 7 Pazienti!
              </>
            ) : (
              <>
                <Send className="h-5 w-5" /> Invia Broadcast Ora
              </>
            )}
          </button>
        </div>

        {/* Live Smartphone Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm bg-slate-900 rounded-[44px] p-4 shadow-2xl border-4 border-slate-800">
            {/* Notch / Dynamic Island */}
            <div className="w-32 h-5 bg-black rounded-full mx-auto mb-6 flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-900 mr-2" />
            </div>

            {/* Lockscreen notification card */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-slate-100 text-slate-900 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-amber-500 flex items-center justify-center text-white">
                    <Bell className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Studio Medico San Marco
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Adesso</span>
              </div>

              <div>
                <p className="text-xs font-extrabold text-slate-900">Avviso Segreteria • Visita Odierna</p>
                <p className="text-xs text-slate-600 mt-1 leading-snug break-words">
                  {testo || 'Nessun testo inserito...'}
                </p>
              </div>
            </div>

            <div className="mt-28 text-center text-slate-500 text-[11px]">
              <p>Anteprima schermata di blocco paziente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
