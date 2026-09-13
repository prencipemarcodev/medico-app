'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/dashboard/impostazioni
 * @description Pannello impostazioni studio medico per modificare parametri operativi e regole
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.2.0
 */

import { useState } from 'react'
import {
  Settings,
  Building2,
  Clock,
  Lock,
  Radio,
  Users,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

type Tab = 'generale' | 'orari' | 'lockup' | 'broadcast' | 'deleghe'

export default function ImpostazioniPage() {
  const { toast } = useToast()
  const [tabAttiva, setTabAttiva] = useState<Tab>('generale')
  const [salvato, setSalvato] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 1. Generale
  const [nomeStudio, setNomeStudio] = useState('Studio Medico San Marco')
  const [citta, setCitta] = useState('Milano')
  const [indirizzo, setIndirizzo] = useState('Via Roma 123, 20121 Milano (MI)')
  const [telefono, setTelefono] = useState('+39 02 1234567')
  const [nomeDottore, setNomeDottore] = useState('Mario Verdi')
  const [messaggioPazienti, setMessaggioPazienti] = useState(
    'In caso di urgenza grave o pericolo di vita contattare immediatamente il 112 o il Pronto Soccorso.'
  )

  // 2. Orari & Durata
  const [durataVisita, setDurataVisita] = useState<10 | 20 | 30>(20)
  const [riservaUrgenze, setRiservaUrgenze] = useState(true)

  // 3. Lockup & Regole
  const [lockupMinutes, setLockupMinutes] = useState<5 | 10 | 15>(10)
  const [anticipoMax, setAnticipoMax] = useState(30)
  const [anticipoDisdetta, setAnticipoDisdetta] = useState(2)

  // 4. Template Broadcast
  const [templates, setTemplates] = useState([
    {
      id: '1',
      titolo: 'Ritardo visite 30 min',
      testo: 'Gentile paziente, a causa di un\'urgenza le visite odierne subiranno circa 30 minuti di ritardo. Ci scusiamo per il disagio.',
    },
    {
      id: '2',
      titolo: 'Chiusura Improvvisa Pomeriggio',
      testo: 'AVVISO STUDIO: Per improvvisa indisposizione del medico, lo studio oggi pomeriggio resterà chiuso. Sarete ricontattati per riprogrammare.',
    },
    {
      id: '3',
      titolo: 'Promemoria Esami del Sangue',
      testo: 'Promemoria: Per la visita di oggi si ricorda di portare il tesserino sanitario e gli ultimi esami del sangue.',
    },
  ])

  // 5. Deleghe Segreteria
  const [delegaRicette, setDelegaRicette] = useState(true)
  const [delegaAccettazione, setDelegaAccettazione] = useState(true)
  const [delegaBroadcast, setDelegaBroadcast] = useState(true)
  const [delegaCartella, setDelegaCartella] = useState(false)

  const handleSalva = () => {
    const errs: Record<string, string> = {}
    if (!nomeStudio.trim()) errs.nomeStudio = 'Il nome dello studio non può essere vuoto'
    if (!nomeDottore.trim()) errs.nomeDottore = 'Il nome del medico titolare non può essere vuoto'

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      setTabAttiva('generale')
      toast.error('Campi obbligatori mancanti', 'Correggi i campi evidenziati in rosso')
      return
    }

    setErrors({})
    setSalvato(true)
    toast.success('Impostazioni salvate', 'Parametri operativi dello studio aggiornati')
    setTimeout(() => setSalvato(false), 3000)
  }

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id))
    toast.info('Template eliminato', 'Il modello broadcast è stato rimosso')
  }

  const handleAddTemplate = () => {
    const nuovo = {
      id: String(Date.now()),
      titolo: 'Nuovo Template Personalizzato',
      testo: 'Inserisci qui il testo dell\'avviso per i tuoi pazienti...',
    }
    setTemplates([...templates, nuovo])
    toast.success('Template aggiunto', 'Nuovo modello pronto per essere compilato')
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Settings className="h-4 w-4" />
            Configurazione Studio Medico
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pannello Impostazioni & Personalizzazione
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Modifica in tempo reale i parametri operativi, i template e i permessi della segreteria.
          </p>
        </div>

        <button
          onClick={handleSalva}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
        >
          {salvato ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              Impostazioni Aggiornate!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salva Modifiche
            </>
          )}
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        {[
          { id: 'generale' as Tab, label: 'Identità & Studio', icon: Building2 },
          { id: 'orari' as Tab, label: 'Orari & Visite', icon: Clock },
          { id: 'lockup' as Tab, label: 'Regole Slot & Lockup', icon: Lock },
          { id: 'broadcast' as Tab, label: 'Template Broadcast', icon: Radio },
          { id: 'deleghe' as Tab, label: 'Deleghe Segreteria', icon: Users },
        ].map((t) => {
          const Icon = t.icon
          const isSelected = tabAttiva === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTabAttiva(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
        {/* Tab 1: Generale */}
        {tabAttiva === 'generale' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Informazioni Principali dello Studio
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nome Studio Medico *
                </label>
                <input
                  type="text"
                  value={nomeStudio}
                  onChange={(e) => {
                    setNomeStudio(e.target.value)
                    if (errors.nomeStudio) setErrors((p) => ({ ...p, nomeStudio: '' }))
                  }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    errors.nomeStudio ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
                {errors.nomeStudio && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 inline" /> {errors.nomeStudio}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Città
                </label>
                <input
                  type="text"
                  value={citta}
                  onChange={(e) => setCitta(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Indirizzo Studio
                </label>
                <input
                  type="text"
                  value={indirizzo}
                  onChange={(e) => setIndirizzo(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Telefono Studio / Segreteria
                </label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Nome Medico Curante Titolare *
                </label>
                <input
                  type="text"
                  value={nomeDottore}
                  onChange={(e) => {
                    setNomeDottore(e.target.value)
                    if (errors.nomeDottore) setErrors((p) => ({ ...p, nomeDottore: '' }))
                  }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    errors.nomeDottore ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
                {errors.nomeDottore && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 inline" /> {errors.nomeDottore}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Messaggio Fisso in Evidenza nell'App Paziente
                </label>
                <textarea
                  rows={3}
                  value={messaggioPazienti}
                  onChange={(e) => setMessaggioPazienti(e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Questo avviso comparirà in cima alla home page dell'app di tutti i tuoi pazienti.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Orari */}
        {tabAttiva === 'orari' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Orari delle Visite e Gestione Slot
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Durata Standard Visita Programmata
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[10, 20, 30].map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => setDurataVisita(min as any)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      durataVisita === min
                        ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <p className="font-extrabold text-sm text-slate-900">{min} Minuti</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {min === 20 ? 'Standard MMG consigliato' : min === 10 ? 'Visite brevi / ricette' : 'Prima visita approfondita'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Riserva Automatica Slot Urgenze</p>
                <p className="text-[11px] text-slate-500">
                  Esclude gli ultimi 2 slot della sessione mattutina dalla prenotazione online dei pazienti
                </p>
              </div>
              <input
                type="checkbox"
                checked={riservaUrgenze}
                onChange={(e) => setRiservaUrgenze(e.target.checked)}
                className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Lockup & Regole */}
        {tabAttiva === 'lockup' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Regole Anti-Conflitto e Disdette (ADR-002)
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Tempo di Lockup Slot (Minuti)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[5, 10, 15].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLockupMinutes(l as any)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      lockupMinutes === l
                        ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <p className="font-extrabold text-sm text-slate-900">{l} Minuti</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {l === 10 ? 'Consigliato (standard)' : l === 5 ? 'Rotazione rapida' : 'Tempo esteso'}
                    </p>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Durante questo tempo lo slot selezionato dal paziente rimane congelato ed invisibile agli altri utenti.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Anticipo Massimo di Prenotazione
                </label>
                <select
                  value={anticipoMax}
                  onChange={(e) => setAnticipoMax(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 outline-none"
                >
                  <option value={15}>15 giorni in avanti</option>
                  <option value={30}>30 giorni in avanti (1 mese)</option>
                  <option value={60}>60 giorni in avanti (2 mesi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Anticipo Minimo per Disdetta Libera
                </label>
                <select
                  value={anticipoDisdetta}
                  onChange={(e) => setAnticipoDisdetta(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 outline-none"
                >
                  <option value={2}>Fino a 2 ore prima</option>
                  <option value={12}>Fino a 12 ore prima</option>
                  <option value={24}>Fino a 24 ore prima</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Broadcast Templates */}
        {tabAttiva === 'broadcast' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Template Notifiche Broadcast</h2>
                <p className="text-xs text-slate-500">Messaggi predefiniti per comunicazioni rapide o ritardi</p>
              </div>
              <button
                onClick={handleAddTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
              >
                <Plus className="h-3.5 w-3.5" /> Aggiungi Template
              </button>
            </div>

            <div className="space-y-3">
              {templates.map((tpl) => (
                <div key={tpl.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={tpl.titolo}
                      onChange={(e) => {
                        const val = e.target.value
                        setTemplates(templates.map((x) => (x.id === tpl.id ? { ...x, titolo: val } : x)))
                      }}
                      className="font-bold text-xs text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleDeleteTemplate(tpl.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Elimina"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={tpl.testo}
                    onChange={(e) => {
                      const val = e.target.value
                      setTemplates(templates.map((x) => (x.id === tpl.id ? { ...x, testo: val } : x)))
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Deleghe Segreteria */}
        {tabAttiva === 'deleghe' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Permessi e Deleghe Operative alla Segreteria
            </h2>

            <div className="space-y-4">
              {[
                {
                  label: 'Evasione Autonoma Ricette Terapia Cronica',
                  desc: 'Consente alla segreteria di approvare e generare i promemoria per farmaci continuativi già presenti in scheda',
                  checked: delegaRicette,
                  onChange: setDelegaRicette,
                },
                {
                  label: 'Assegnazione e Spostamento Slot Manuali',
                  desc: 'Consente alla segreteria di inserire o modificare appuntamenti per pazienti che telefonano o si recano allo sportello',
                  checked: delegaAccettazione,
                  onChange: setDelegaAccettazione,
                },
                {
                  label: 'Invio Avvisi Broadcast di Studio',
                  desc: 'Consente alla segreteria di inviare notifiche push ai pazienti prenotati oggi (es. ritardo del medico)',
                  checked: delegaBroadcast,
                  onChange: setDelegaBroadcast,
                },
                {
                  label: 'Visualizzazione Diagnosi Cliniche Completa',
                  desc: 'Permette la consultazione delle note cliniche e anamnesi (Disabilitato di default per privacy GDPR)',
                  checked: delegaCartella,
                  onChange: setDelegaCartella,
                  warning: 'Attenzione: dati sanitari sensibili soggetti a consenso specifico GDPR Art. 9',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    {item.warning && (
                      <p className="text-[10px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> {item.warning}
                      </p>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.onChange(e.target.checked)}
                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
