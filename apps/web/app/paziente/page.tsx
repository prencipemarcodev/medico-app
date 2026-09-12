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
} from 'lucide-react'

export default function PazientePage() {
  const prossimaVisita = {
    data: 'Mercoledì, 9 Settembre 2026',
    ora: '09:00 - 09:20',
    dottore: 'Dott. Mario Verdi',
    motivo: 'Visita di controllo pressione arteriosa',
    tipo: 'Standard (20m)',
    stato: 'Confermata',
  }

  const storicoVisite = [
    {
      data: '15 Luglio 2026',
      motivo: 'Controllo esami annuali sangue e urine',
      esito: 'Terapia confermata, regolare',
    },
    {
      data: '02 Febbraio 2026',
      motivo: 'Sindrome influenzale con tosse',
      esito: 'Prescritta terapia antibiotica e riposo 5gg',
    },
  ]

  const richiesteAttive = [
    {
      tipo: 'medicinale',
      titolo: 'Ripetizione Cardicor 2.5mg',
      data: '08/09/2026',
      stato: 'In lavorazione',
      ritiro: 'PDF in app non appena firmato dal medico',
    },
  ]

  return (
    <div className="space-y-8 font-sans">
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
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● {prossimaVisita.stato}
              </span>
            </div>

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
          </div>

          {/* Storico Visite */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Storico Visite Recenti
            </h2>
            <div className="space-y-3">
              {storicoVisite.map((v, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{v.data}</span>
                    <span className="text-[11px] text-slate-400 font-semibold">Completata</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700">{v.motivo}</p>
                  <p className="text-[11px] text-slate-500 italic">{v.esito}</p>
                </div>
              ))}
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
              {richiesteAttive.map((req, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{req.titolo}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {req.stato}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{req.ritiro}</p>
                </div>
              ))}
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
    </div>
  )
}
