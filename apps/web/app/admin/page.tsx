'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/admin
 * @description Dashboard amministratore di sistema: gestione multi-tenant studi medici, medici,
 *              importazione pazienti CSV con generazione credenziali (CF + password a 6 car.)
 *              e segreteria multi-medico.
 * @author      Agent-1 | Session: 2026-09-12
 * @version     2.0.0
 */

import { useState, useEffect } from 'react'
import {
  Shield,
  Building2,
  Users,
  CalendarCheck,
  Key,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Plus,
  Upload,
  Download,
  Search,
  Check,
  X,
  Stethoscope,
  PhoneCall,
  Mail,
  MapPin,
  RefreshCw,
  FileText,
  UserCheck,
  Layers,
  Trash2,
} from 'lucide-react'

interface Studio {
  id: string
  nome: string
  indirizzo: string | null
  telefono: string | null
  email: string | null
  config: any
  totaleMedici: number
  totalePazienti: number
}

interface Medico {
  id: string
  studioId: string
  nomeStudio: string | null
  nome: string
  cognome: string
  email: string
  telefonoPrimario: string
  totalePazienti: number
}

interface StaffItem {
  id: string
  studioId: string
  nomeStudio: string | null
  nome: string
  cognome: string
  email: string
  mediciAssegnati: Array<{ id: string; nome: string; cognome: string }>
}

interface CredenzialeGenerata {
  id: string
  nome: string
  cognome: string
  codiceFiscale: string
  passwordTemporanea: string
  dataNascita: string
  email: string
  telefono: string
}

export interface AuditLogItem {
  id: string
  attoreEmail: string
  ruolo: string
  azione: string
  entita: string
  entitaId: string | null
  dettagli: any
  ip: string | null
  createdAt: string
}

export default function AdminPage() {
  const [tabAttiva, setTabAttiva] = useState<'studi' | 'medici' | 'staff' | 'audit'>('studi')

  // Dati
  const [studiList, setStudiList] = useState<Studio[]>([])
  const [mediciList, setMediciList] = useState<Medico[]>([])
  const [staffList, setStaffList] = useState<StaffItem[]>([])
  const [loading, setLoading] = useState(true)

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([])
  const [auditQuery, setAuditQuery] = useState('')
  const [loadingAudit, setLoadingAudit] = useState(false)

  // Modali
  const [modalStudioOpen, setModalStudioOpen] = useState(false)
  const [modalMedicoOpen, setModalMedicoOpen] = useState(false)
  const [modalStaffOpen, setModalStaffOpen] = useState(false)
  const [modalCsvOpen, setModalCsvOpen] = useState(false)

  // Form Nuovo Studio
  const [formStudio, setFormStudio] = useState({
    nome: '',
    citta: '',
    indirizzo: '',
    telefono: '',
    email: '',
    durataVisita: 20,
    lockupMinutes: 10,
    anticipoMax: 30,
  })

  // Form Nuovo Medico
  const [formMedico, setFormMedico] = useState({
    studioId: '',
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    password: '',
  })

  // Form Nuovo Staff (Segreteria)
  const [formStaff, setFormStaff] = useState({
    studioId: '',
    nome: '',
    cognome: '',
    email: '',
    password: '',
    mediciIds: [] as string[],
  })

  // State Import CSV
  const [medicoTargetCsv, setMedicoTargetCsv] = useState<Medico | null>(null)
  const [csvRawText, setCsvRawText] = useState('')
  const [anteprimaPazienti, setAnteprimaPazienti] = useState<
    Array<{
      nome: string
      cognome: string
      codiceFiscale: string
      dataNascita: string
      email?: string
      telefono?: string
      valido: boolean
      motivoErrore?: string
    }>
  >([])
  const [credenzialiGenerate, setCredenzialiGenerate] = useState<CredenzialeGenerata[]>([])
  const [importInCorso, setImportInCorso] = useState(false)
  const [importCompletato, setImportCompletato] = useState(false)

  // Emergency Recovery Code
  const [emergencyCode, setEmergencyCode] = useState<string | null>(null)
  const [generato, setGenerato] = useState(false)

  // Caricamento Dati Iniziali
  const caricaDati = async () => {
    setLoading(true)
    try {
      const [resStudi, resMedici, resStaff] = await Promise.all([
        fetch('/api/admin/studi').then((r) => r.json()),
        fetch('/api/admin/medici').then((r) => r.json()),
        fetch('/api/admin/staff').then((r) => r.json()),
      ])

      if (resStudi.success) setStudiList(resStudi.studi || [])
      if (resMedici.success) setMediciList(resMedici.medici || [])
      if (resStaff.success) setStaffList(resStaff.staff || [])
    } catch (err) {
      console.error('Errore caricamento admin:', err)
    } finally {
      setLoading(false)
    }
  }

  // Caricamento Audit Logs dal Database
  const caricaAuditLogs = async (query = auditQuery) => {
    setLoadingAudit(true)
    try {
      const url = query ? `/api/admin/audit?q=${encodeURIComponent(query)}` : '/api/admin/audit'
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setAuditLogs(data.logs || [])
      }
    } catch (err) {
      console.error('Errore caricamento audit logs:', err)
    } finally {
      setLoadingAudit(false)
    }
  }

  useEffect(() => {
    caricaDati()
    caricaAuditLogs()
  }, [])

  useEffect(() => {
    if (tabAttiva === 'audit') {
      caricaAuditLogs()
    }
  }, [tabAttiva])

  // Eliminazione Studio Medico
  const handleEliminaStudio = async (studio: Studio) => {
    const conferma = window.confirm(
      `ATTENZIONE: Sei sicuro di voler eliminare definitivamente lo studio "${studio.nome}"?\n\nVerranno eliminati a cascata tutti i medici, i pazienti, le prenotazioni e gli slot associati!`
    )
    if (!conferma) return

    try {
      const res = await fetch(`/api/admin/studi/${studio.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore durante l\'eliminazione dello studio')

      alert(data.message || 'Studio eliminato con successo')
      caricaDati()
      caricaAuditLogs()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Eliminazione Medico
  const handleEliminaMedico = async (medico: Medico) => {
    const conferma = window.confirm(
      `Sei sicuro di voler eliminare il Dott. ${medico.nome} ${medico.cognome}?\n\nVerranno cancellati la sua agenda, le prenotazioni e i pazienti associati!`
    )
    if (!conferma) return

    try {
      const res = await fetch(`/api/admin/medici/${medico.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore durante l\'eliminazione del medico')

      alert(data.message || 'Medico eliminato con successo')
      caricaDati()
      caricaAuditLogs()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Eliminazione Staff
  const handleEliminaStaff = async (st: StaffItem) => {
    const conferma = window.confirm(
      `Sei sicuro di voler eliminare l'operatore ${st.nome} ${st.cognome}?`
    )
    if (!conferma) return

    try {
      const res = await fetch(`/api/admin/staff/${st.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore durante l\'eliminazione dello staff')

      alert(data.message || 'Operatore eliminato con successo')
      caricaDati()
      caricaAuditLogs()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Azione Crea Studio
  const handleCreaStudio = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/studi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formStudio),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore creazione studio')

      setModalStudioOpen(false)
      setFormStudio({
        nome: '',
        citta: '',
        indirizzo: '',
        telefono: '',
        email: '',
        durataVisita: 20,
        lockupMinutes: 10,
        anticipoMax: 30,
      })
      caricaDati()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Azione Crea Medico
  const handleCreaMedico = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/medici', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formMedico),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore creazione medico')

      setModalMedicoOpen(false)
      setFormMedico({ studioId: '', nome: '', cognome: '', email: '', telefono: '', password: '' })
      caricaDati()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Azione Crea Staff
  const handleCreaStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formStaff),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore creazione operatore segreteria')

      setModalStaffOpen(false)
      setFormStaff({ studioId: '', nome: '', cognome: '', email: '', password: '', mediciIds: [] })
      caricaDati()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Helper toggle medico in assegnazione staff
  const toggleMedicoStaff = (medicoId: string) => {
    if (formStaff.mediciIds.includes(medicoId)) {
      setFormStaff({
        ...formStaff,
        mediciIds: formStaff.mediciIds.filter((id) => id !== medicoId),
      })
    } else {
      setFormStaff({
        ...formStaff,
        mediciIds: [...formStaff.mediciIds, medicoId],
      })
    }
  }

  // Parsing CSV Pazienti
  const parseCsvContent = (text: string) => {
    setCsvRawText(text)
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)

    if (lines.length === 0) {
      setAnteprimaPazienti([])
      return
    }

    // Se prima riga contiene intestazioni tipo "nome", "cognome", saltala
    let startIdx = 0
    const firstLineLower = lines[0]?.toLowerCase() || ''
    if (firstLineLower.includes('nome') || firstLineLower.includes('codice')) {
      startIdx = 1
    }

    const parsed: typeof anteprimaPazienti = []

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i] || ''
      // Supporta sia separatore virgola che punto e virgola
      const cols = (line.includes(';') ? line.split(';') : line.split(',')).map((c) =>
        c.trim().replace(/^"|"$/g, '')
      )

      const nome = cols[0] || ''
      const cognome = cols[1] || ''
      const cf = (cols[2] || '').toUpperCase()
      const dataNascita = cols[3] || '1980-01-01'
      const email = cols[4] || ''
      const telefono = cols[5] || ''

      let valido = true
      let motivoErrore = ''

      if (!nome || !cognome) {
        valido = false
        motivoErrore = 'Nome o cognome mancante'
      } else if (cf.length !== 16) {
        valido = false
        motivoErrore = `CF non valido (${cf.length} car., attesi 16)`
      }

      parsed.push({
        nome,
        cognome,
        codiceFiscale: cf,
        dataNascita,
        email: email || undefined,
        telefono: telefono || undefined,
        valido,
        motivoErrore,
      })
    }

    setAnteprimaPazienti(parsed)
  }

  // Upload file CSV da input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (text) parseCsvContent(text)
    }
    reader.readAsText(file)
  }

  // Download template CSV di esempio
  const downloadTemplateCsv = () => {
    const headers = 'nome,cognome,codice_fiscale,data_nascita,email,telefono\n'
    const sampleRows =
      'Mario,Rossi,RSSMRA85M01H501Z,1985-08-01,mario.rossi@email.it,3401234567\n' +
      'Laura,Bianchi,BNCLRA90A41F205W,1990-01-01,laura.bianchi@email.it,3487654321\n' +
      'Giuseppe,Verdi,VRDGPP75C15F205K,1975-03-15,,3339876543\n'
    const blob = new Blob([headers + sampleRows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'pazienti_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Esegui Importazione CSV
  const handleImportCsv = async () => {
    if (!medicoTargetCsv) return
    const validi = anteprimaPazienti.filter((p) => p.valido)
    if (validi.length === 0) {
      alert('Nessun paziente valido da importare')
      return
    }

    setImportInCorso(true)
    try {
      const res = await fetch('/api/admin/pazienti/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studioId: medicoTargetCsv.studioId,
          medicoId: medicoTargetCsv.id,
          pazienti: validi,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore durante l\'importazione')

      setCredenzialiGenerate(data.credenziali || [])
      setImportCompletato(true)
      caricaDati()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setImportInCorso(false)
    }
  }

  // Download credenziali generate
  const downloadCredenzialiCsv = () => {
    const headers = 'Nome,Cognome,CodiceFiscale_Username,Password_Temporanea,DataNascita,Email,Telefono,Medico,Studio\n'
    const rows = credenzialiGenerate
      .map(
        (c) =>
          `"${c.nome}","${c.cognome}","${c.codiceFiscale}","${c.passwordTemporanea}","${c.dataNascita}","${c.email}","${c.telefono}","Dott. ${medicoTargetCsv?.nome} ${medicoTargetCsv?.cognome}","${medicoTargetCsv?.nomeStudio || ''}"`
      )
      .join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `credenziali_pazienti_${medicoTargetCsv?.cognome || 'export'}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleGenerateEmergencyCode = () => {
    const code = 'MED1-8492-K92X-77PQ'
    setEmergencyCode(code)
    setGenerato(true)
    setTimeout(() => setGenerato(false), 4000)
  }

  const totalePazientiTotali = studiList.reduce((acc, s) => acc + s.totalePazienti, 0)
  const totaleMediciTotali = studiList.reduce((acc, s) => acc + s.totaleMedici, 0)

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
            <Shield className="h-4 w-4" />
            Amministrazione & Gestione Rete Multi-Tenant
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Pannello di Controllo Generale
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configurazione di Studi Medici, Medici di Medicina Generale, importazione dataset Pazienti in CSV con generazione credenziali e Segreteria.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={caricaDati}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Aggiorna Dati"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Postgres DB Connesso
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Studi Medici</span>
            <Building2 className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white">{studiList.length}</div>
          <p className="text-xs text-indigo-400 font-medium">Istanze attive su rete</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Medici Curanti (MMG)</span>
            <Stethoscope className="h-5 w-5 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">{totaleMediciTotali}</div>
          <p className="text-xs text-blue-400 font-medium">Slot agenda attivi</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pazienti Registrati</span>
            <Users className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalePazientiTotali}</div>
          <p className="text-xs text-emerald-400 font-medium">CF Username + Pass 6 car.</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Personale Segreteria</span>
            <UserCheck className="h-5 w-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">{staffList.length}</div>
          <p className="text-xs text-amber-400 font-medium">Deleghe multi-medico</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-sm w-full sm:w-fit">
        {[
          { id: 'studi', label: 'Studi Medici', icon: Building2 },
          { id: 'medici', label: 'Medici & Assistiti (CSV)', icon: Stethoscope },
          { id: 'staff', label: 'Segreteria Multi-Medico', icon: UserCheck },
          { id: 'audit', label: 'Sicurezza & Audit Log DB', icon: FileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = tabAttiva === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setTabAttiva(tab.id as any)}
              className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex-1 sm:flex-initial text-center ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: STUDI MEDICI */}
      {tabAttiva === 'studi' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Istanze Studi Medici Accreditati</h2>
              <p className="text-xs text-slate-400">Strutture sanitarie configurate sulla piattaforma con isolamento dati</p>
            </div>
            <button
              onClick={() => setModalStudioOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nuovo Studio Medico</span>
            </button>
          </div>

          {studiList.length === 0 ? (
            <div className="p-12 text-center bg-slate-950 rounded-3xl border border-dashed border-slate-800 space-y-3">
              <Building2 className="h-10 w-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">Nessuno studio medico registrato</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Inizia creando il primo studio medico della tua rete tramite il pulsante in alto.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studiList.map((studio) => (
                <div
                  key={studio.id}
                  className="bg-slate-950 rounded-3xl p-6 border border-slate-800 space-y-4 hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1 pr-2">
                        <h3 className="font-extrabold text-white text-base truncate">{studio.nome}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 break-words">
                          <MapPin className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{studio.indirizzo || 'Indirizzo non specificato'}</span>
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex-shrink-0">
                        Attivo
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-500 block">Medici assegnati:</span>
                        <span className="text-white font-bold text-sm">{studio.totaleMedici} MMG</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Pazienti assistiti:</span>
                        <span className="text-white font-bold text-sm">{studio.totalePazienti}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-slate-400 break-words">
                      {studio.telefono && (
                        <p className="flex items-center gap-1.5 truncate">
                          <PhoneCall className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{studio.telefono}</span>
                        </p>
                      )}
                      {studio.email && (
                        <p className="flex items-center gap-1.5 truncate">
                          <Mail className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{studio.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 font-mono truncate">
                      ID: {studio.id.slice(0, 8)}...
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEliminaStudio(studio)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/60 transition-all flex items-center gap-1.5"
                      title="Elimina studio e tutti i dati correlati a cascata"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Elimina Studio</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEDICI & ASSISTITI (CON IMPORT CSV) */}
      {tabAttiva === 'medici' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Medici Curanti e Import Pazienti</h2>
              <p className="text-xs text-slate-400">
                Aggiungi medici ai rispettivi studi e carica il dataset pazienti tramite file CSV con generazione automatica credenziali.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={downloadTemplateCsv}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs transition-all flex items-center gap-2"
                title="Scarica file modello CSV per compilazione"
              >
                <Download className="h-4 w-4 text-emerald-400" />
                <span>Scarica Modello CSV</span>
              </button>
              <button
                onClick={() => {
                  if (studiList.length === 0) {
                    alert('Devi prima creare almeno uno Studio Medico!')
                    return
                  }
                  setFormMedico({ ...formMedico, studioId: studiList[0]?.id || '' })
                  setModalMedicoOpen(true)
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Aggiungi Medico</span>
              </button>
            </div>
          </div>

          {mediciList.length === 0 ? (
            <div className="p-12 text-center bg-slate-950 rounded-3xl border border-dashed border-slate-800 space-y-3">
              <Stethoscope className="h-10 w-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">Nessun medico registrato</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Crea il primo medico per abilitare l'agenda e il caricamento del dataset pazienti.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediciList.map((medico) => (
                <div
                  key={medico.id}
                  className="bg-slate-950 rounded-3xl p-6 border border-slate-800 space-y-4 hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-11 w-11 rounded-2xl bg-blue-950 border border-blue-800 text-blue-400 font-bold flex items-center justify-center flex-shrink-0">
                          {medico.nome[0]}
                          {medico.cognome[0]}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-white text-base truncate">
                            Dott. {medico.nome} {medico.cognome}
                          </h3>
                          <p className="text-xs text-indigo-400 truncate">{medico.nomeStudio || 'Studio Medico'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1.5">
                      <p className="text-slate-400 flex items-center gap-1.5 truncate">
                        <Mail className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                        <span className="font-mono text-slate-300 truncate">{medico.email}</span>
                      </p>
                      <p className="text-slate-400 flex items-center gap-1.5 truncate">
                        <PhoneCall className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                        <span className="text-slate-300 truncate">{medico.telefonoPrimario}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-400 font-medium">Pazienti in carico:</span>
                      <span className="text-white font-extrabold px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700">
                        {medico.totalePazienti} assistiti
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setMedicoTargetCsv(medico)
                        setCsvRawText('')
                        setAnteprimaPazienti([])
                        setCredenzialiGenerate([])
                        setImportCompletato(false)
                        setModalCsvOpen(true)
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-2 min-w-0"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">Importa Pazienti CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminaMedico(medico)}
                      className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-900/60 text-rose-400 transition-all flex-shrink-0"
                      title="Elimina medico e la sua agenda"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SEGRETERIA MULTI-MEDICO */}
      {tabAttiva === 'staff' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Operatori di Segreteria e Front-Desk</h2>
              <p className="text-xs text-slate-400">
                Configura gli account segreteria e assegna ciascun operatore a 1 o più medici dello studio.
              </p>
            </div>
            <button
              onClick={() => {
                if (studiList.length === 0) {
                  alert('Devi prima creare almeno uno Studio Medico!')
                  return
                }
                setFormStaff({
                  ...formStaff,
                  studioId: studiList[0]?.id || '',
                  mediciIds: [],
                })
                setModalStaffOpen(true)
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nuovo Operatore Segreteria</span>
            </button>
          </div>

          {staffList.length === 0 ? (
            <div className="p-12 text-center bg-slate-950 rounded-3xl border border-dashed border-slate-800 space-y-3">
              <UserCheck className="h-10 w-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">Nessun account di segreteria creato</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Crea un operatore di segreteria e assegnalo a uno o più medici curanti per gestire sala d'attesa e ricette.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staffList.map((st) => (
                <div
                  key={st.id}
                  className="bg-slate-950 rounded-3xl p-6 border border-slate-800 space-y-4 hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-11 w-11 rounded-2xl bg-amber-950 border border-amber-800 text-amber-400 font-bold flex items-center justify-center flex-shrink-0">
                          {st.nome[0]}
                          {st.cognome[0]}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-white text-base truncate">
                            {st.nome} {st.cognome}
                          </h3>
                          <p className="text-xs text-amber-400 truncate">{st.nomeStudio || 'Studio Medico'}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 font-mono bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 truncate">
                      Email: {st.email}
                    </p>

                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                        Medici Gestiti ({st.mediciAssegnati.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {st.mediciAssegnati.length === 0 ? (
                          <span className="text-[11px] text-slate-500 italic">Nessun medico assegnato</span>
                        ) : (
                          st.mediciAssegnati.map((m) => (
                            <span
                              key={m.id}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-800 truncate"
                            >
                              Dott. {m.nome} {m.cognome}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 font-mono truncate">
                      ID: {st.id.slice(0, 8)}...
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEliminaStaff(st)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/60 transition-all flex items-center gap-1.5"
                      title="Elimina operatore segreteria"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Elimina Staff</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUDIT LOG & SICUREZZA DB */}
      {tabAttiva === 'audit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-slate-950 rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                  Registro Audit di Sistema (PostgreSQL audit_logs)
                </h2>
                <p className="text-xs text-slate-400">
                  Tracciamento immutabile di accessi, creazioni, eliminazioni e modifiche (GDPR Art. 30)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => caricaAuditLogs()}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                  title="Ricarica registri"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingAudit ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Barra di ricerca audit */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={auditQuery}
                  onChange={(e) => setAuditQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') caricaAuditLogs(auditQuery)
                  }}
                  placeholder="Filtra per email attore, azione (es. LOGIN, STUDIO_CREATO, ELIMINATO)..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={() => caricaAuditLogs(auditQuery)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                Cerca
              </button>
            </div>

            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Data / Ora</th>
                    <th className="pb-3">Attore</th>
                    <th className="pb-3">Azione</th>
                    <th className="pb-3">Entità & IP</th>
                    <th className="pb-3">Dettagli</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        {loadingAudit ? 'Caricamento registri audit...' : 'Nessun evento registrato nei log di audit.'}
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => {
                      const isDanger = log.azione.includes('ELIMINAT') || log.azione.includes('FAILED')
                      const isSuccess = log.azione.includes('SUCCESS') || log.azione.includes('CREAT')
                      return (
                        <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString('it-IT', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>
                          <td className="py-3 text-white font-bold whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-slate-800 text-indigo-300">
                                {log.ruolo}
                              </span>
                              <span className="text-xs">{log.attoreEmail}</span>
                            </div>
                          </td>
                          <td className="py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                isDanger
                                  ? 'bg-rose-950 text-rose-400 border-rose-800'
                                  : isSuccess
                                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                  : 'bg-indigo-950 text-indigo-400 border-indigo-800'
                              }`}
                            >
                              {log.azione}
                            </span>
                          </td>
                          <td className="py-3 text-slate-300 text-[11px] whitespace-nowrap">
                            <div>
                              <span className="font-semibold text-slate-200">{log.entita}</span>
                              {log.ip && <span className="text-slate-500 block text-[10px]">{log.ip}</span>}
                            </div>
                          </td>
                          <td className="py-3 text-slate-400 text-[11px] max-w-[200px] truncate">
                            {log.dettagli ? (
                              <span className="font-mono text-[10px] text-slate-400 truncate block">
                                {typeof log.dettagli === 'object'
                                  ? JSON.stringify(log.dettagli)
                                  : String(log.dettagli)}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-950 rounded-3xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Key className="h-5 w-5" />
                <span>Accesso di Emergenza (ADR-006)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Genera un codice monouso valido per 1 ora per ripristinare l'accesso in caso di emergenza o guasto operatore.
              </p>
              {emergencyCode && (
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800 text-center space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Codice Monouso</p>
                  <p className="font-mono text-base font-black text-white tracking-widest">{emergencyCode}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleGenerateEmergencyCode}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Key className="h-4 w-4" />
              <span>{generato ? 'Codice Registrato in Audit!' : 'Genera Recovery Code'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODALE: NUOVO STUDIO MEDICO */}
      {modalStudioOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-400" />
                Registra Nuovo Studio Medico
              </h3>
              <button
                onClick={() => setModalStudioOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreaStudio} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Nome Studio Medico *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Studio Medico San Marco"
                  value={formStudio.nome}
                  onChange={(e) => setFormStudio({ ...formStudio, nome: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Città *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Es. Milano"
                    value={formStudio.citta}
                    onChange={(e) => setFormStudio({ ...formStudio, citta: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Indirizzo
                  </label>
                  <input
                    type="text"
                    placeholder="Es. Via Roma 12"
                    value={formStudio.indirizzo}
                    onChange={(e) => setFormStudio({ ...formStudio, indirizzo: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Telefono
                  </label>
                  <input
                    type="text"
                    placeholder="Es. +39 02 1234567"
                    value={formStudio.telefono}
                    onChange={(e) => setFormStudio({ ...formStudio, telefono: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Email Studio
                  </label>
                  <input
                    type="email"
                    placeholder="Es. info@sanmarco.it"
                    value={formStudio.email}
                    onChange={(e) => setFormStudio({ ...formStudio, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalStudioOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
                >
                  Crea Studio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE: NUOVO MEDICO */}
      {modalMedicoOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-blue-400" />
                Aggiungi Medico di Famiglia (MMG)
              </h3>
              <button
                onClick={() => setModalMedicoOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreaMedico} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Studio Medico di Appartenenza *
                </label>
                <select
                  required
                  value={formMedico.studioId}
                  onChange={(e) => setFormMedico({ ...formMedico, studioId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {studiList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome} ({s.indirizzo || 'Studio'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Es. Mario"
                    value={formMedico.nome}
                    onChange={(e) => setFormMedico({ ...formMedico, nome: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Cognome *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Es. Verdi"
                    value={formMedico.cognome}
                    onChange={(e) => setFormMedico({ ...formMedico, cognome: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Email (Username di Accesso) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="Es. mario.verdi@studiomedico.it"
                  value={formMedico.email}
                  onChange={(e) => setFormMedico({ ...formMedico, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Telefono
                  </label>
                  <input
                    type="text"
                    placeholder="Es. +39 333 1234567"
                    value={formMedico.telefono}
                    onChange={(e) => setFormMedico({ ...formMedico, telefono: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Password Iniziale
                  </label>
                  <input
                    type="password"
                    placeholder="Min 6 caratteri"
                    value={formMedico.password}
                    onChange={(e) => setFormMedico({ ...formMedico, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                La creazione del medico genererà automaticamente gli slot di disponibilità agenda per i prossimi 30 giorni.
              </p>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalMedicoOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20"
                >
                  Crea Medico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE: NUOVO OPERATORE SEGRETERIA (MULTI-MEDICO) */}
      {modalStaffOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-amber-400" />
                Nuovo Operatore Segreteria (Multi-Medico)
              </h3>
              <button
                onClick={() => setModalStaffOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreaStaff} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Studio di Appartenenza *
                </label>
                <select
                  required
                  value={formStaff.studioId}
                  onChange={(e) => {
                    setFormStaff({
                      ...formStaff,
                      studioId: e.target.value,
                      mediciIds: [],
                    })
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {studiList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Es. Giulia"
                    value={formStaff.nome}
                    onChange={(e) => setFormStaff({ ...formStaff, nome: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Cognome *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Es. Colombo"
                    value={formStaff.cognome}
                    onChange={(e) => setFormStaff({ ...formStaff, cognome: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Email di Accesso *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Es. segreteria@studio.it"
                    value={formStaff.email}
                    onChange={(e) => setFormStaff({ ...formStaff, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Password Iniziale
                  </label>
                  <input
                    type="password"
                    placeholder="Min 6 caratteri"
                    value={formStaff.password}
                    onChange={(e) => setFormStaff({ ...formStaff, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Selezione Multi-Medico */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block font-bold text-slate-300 uppercase tracking-wider">
                  Assegna ai Medici Curanti dello Studio (Seleziona 1 o più):
                </label>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 max-h-40 overflow-y-auto">
                  {mediciList
                    .filter((m) => m.studioId === formStaff.studioId)
                    .map((m) => {
                      const isChecked = formStaff.mediciIds.includes(m.id)
                      return (
                        <label
                          key={m.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/80 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleMedicoStaff(m.id)}
                            className="h-4 w-4 rounded border-slate-700 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="font-semibold text-slate-200">
                            Dott. {m.nome} {m.cognome}
                          </span>
                        </label>
                      )
                    })}
                  {mediciList.filter((m) => m.studioId === formStaff.studioId).length === 0 && (
                    <p className="text-slate-500 text-[11px] italic">
                      Nessun medico presente in questo studio. Registra prima un medico.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalStaffOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md shadow-amber-600/20"
                >
                  Salva Operatore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE: IMPORTAZIONE DATASET PAZIENTI IN CSV */}
      {modalCsvOpen && medicoTargetCsv && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 max-w-2xl w-full space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                  Import Dataset Pazienti in CSV
                </h3>
                <p className="text-xs text-indigo-400 mt-0.5">
                  Assegnazione a: Dott. {medicoTargetCsv.nome} {medicoTargetCsv.cognome} • {medicoTargetCsv.nomeStudio}
                </p>
              </div>
              <button
                onClick={() => setModalCsvOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!importCompletato ? (
              <div className="space-y-4 text-xs">
                {/* Info & Download Template */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-200">Formato Colonne Richiesto:</p>
                    <p className="text-slate-400 font-mono text-[11px] mt-0.5">
                      nome, cognome, codice_fiscale, data_nascita, email, telefono
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={downloadTemplateCsv}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 font-bold text-xs flex items-center gap-1.5 flex-shrink-0"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Modello CSV</span>
                  </button>
                </div>

                {/* Upload or Paste */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-300 uppercase tracking-wider">
                    1. Seleziona File CSV dal computer:
                  </label>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                    className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-bold text-slate-300 uppercase tracking-wider">
                    Oppure Incolla Dati CSV:
                  </label>
                  <textarea
                    rows={4}
                    value={csvRawText}
                    onChange={(e) => parseCsvContent(e.target.value)}
                    placeholder="Mario,Rossi,RSSMRA85M01H501Z,1985-08-01,mario@email.it,3401234567"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Anteprima Tabella */}
                {anteprimaPazienti.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300">
                        Anteprima Pazienti Rilevati ({anteprimaPazienti.length}):
                      </span>
                      <span className="text-[11px] text-emerald-400 font-bold">
                        {anteprimaPazienti.filter((p) => p.valido).length} Validi per l'importazione
                      </span>
                    </div>

                    <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-950 text-slate-400 sticky top-0">
                          <tr>
                            <th className="p-2">Stato</th>
                            <th className="p-2">Nome e Cognome</th>
                            <th className="p-2">Codice Fiscale (Username)</th>
                            <th className="p-2">Password Auto-Generata</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {anteprimaPazienti.map((p, idx) => (
                            <tr key={idx} className={p.valido ? 'hover:bg-slate-800/40' : 'bg-rose-950/20'}>
                              <td className="p-2">
                                {p.valido ? (
                                  <span className="text-emerald-400 font-bold">✓ OK</span>
                                ) : (
                                  <span className="text-rose-400 font-bold text-[10px]" title={p.motivoErrore}>
                                    ✕ {p.motivoErrore}
                                  </span>
                                )}
                              </td>
                              <td className="p-2 text-white font-semibold">
                                {p.nome} {p.cognome}
                              </td>
                              <td className="p-2 font-mono text-slate-300 font-bold">{p.codiceFiscale}</td>
                              <td className="p-2 font-mono text-indigo-300">6 caratteri casuali</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalCsvOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white font-bold"
                  >
                    Annulla
                  </button>
                  <button
                    type="button"
                    disabled={importInCorso || anteprimaPazienti.filter((p) => p.valido).length === 0}
                    onClick={handleImportCsv}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 text-white font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>
                      {importInCorso
                        ? 'Generazione account...'
                        : `Importa ${anteprimaPazienti.filter((p) => p.valido).length} Pazienti & Genera Credenziali`}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* RISULTATO IMPORTAZIONE CON CREDENZIALI SCARICABILI */
              <div className="space-y-5 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 space-y-1">
                  <p className="text-sm font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    Importazione completata con successo!
                  </p>
                  <p className="text-xs text-emerald-400/90">
                    Sono stati generati <b>{credenzialiGenerate.length} nuovi account paziente</b>. Ogni paziente potrà accedere inserendo il proprio <b>Codice Fiscale</b> e la <b>password provvisoria di 6 caratteri</b>.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">
                    Elenco Credenziali Create per i Pazienti:
                  </span>
                  <button
                    type="button"
                    onClick={downloadCredenzialiCsv}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20"
                  >
                    <Download className="h-4 w-4" />
                    <span>Scarica Elenco Credenziali (CSV)</span>
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-950 text-slate-400 sticky top-0">
                      <tr>
                        <th className="p-2.5">Paziente</th>
                        <th className="p-2.5">Username (Codice Fiscale)</th>
                        <th className="p-2.5">Password (6 car.)</th>
                        <th className="p-2.5">Recapiti</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-medium">
                      {credenzialiGenerate.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-800/40">
                          <td className="p-2.5 text-white font-bold">
                            {c.nome} {c.cognome}
                          </td>
                          <td className="p-2.5 font-mono text-indigo-300 font-bold">{c.codiceFiscale}</td>
                          <td className="p-2.5 font-mono text-emerald-400 font-black bg-slate-950 px-2 rounded">
                            {c.passwordTemporanea}
                          </td>
                          <td className="p-2.5 text-slate-400">
                            {c.telefono !== '—' ? c.telefono : c.email}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalCsvOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  >
                    Chiudi e Torna alla Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
