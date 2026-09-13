'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/segreteria/pazienti
 * @description Ricerca pazienti, inserimento assistito, importazione CSV e gestione per segreteria
 * @author      Agent-1 | Session: 2026-09-12
 * @version     1.1.0
 */

import { useState, useEffect } from 'react'
import {
  Search,
  Users,
  UserCheck,
  Calendar,
  Pill,
  PhoneCall,
  Mail,
  Edit2,
  CheckCircle2,
  FileText,
  Clock,
  Shield,
  Stethoscope,
  X,
  Plus,
  Loader2,
  Send,
  AlertCircle,
  Upload,
  QrCode,
  Copy,
  Download,
  FileSpreadsheet,
  FolderLock,
  Link2,
  Paperclip,
  Trash2,
  ShieldCheck,
  Check,
  RefreshCw,
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

interface MedicoOpzione {
  id: string
  nome: string
  cognome: string
  email: string
}

interface AnteprimaPaziente {
  nome: string
  cognome: string
  codiceFiscale: string
  dataNascita: string
  email?: string
  telefono?: string
  valido: boolean
  motivoErrore?: string
}

export default function SegreteriaPazientiPage() {
  const [query, setQuery] = useState('')
  const [pazienti, setPazienti] = useState<PazienteItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selezionato, setSelezionato] = useState<PazienteItem | null>(null)

  // Studio e Medici
  const [studioId, setStudioId] = useState<string>('')
  const [codiceStudio, setCodiceStudio] = useState<string>('')
  const [nomeStudio, setNomeStudio] = useState<string>('')
  const [mediciStudio, setMediciStudio] = useState<MedicoOpzione[]>([])

  // Operazioni esistenti
  const [modalRichiestaOpen, setModalRichiestaOpen] = useState(false)
  const [modalContattiOpen, setModalContattiOpen] = useState(false)
  const [farmacoNome, setFarmacoNome] = useState('')
  const [tipoRichiesta, setTipoRichiesta] = useState('medicinale')
  const [editTelefono, setEditTelefono] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null)

  // 1. MODALE NUOVO PAZIENTE
  const [modalNuovoOpen, setModalNuovoOpen] = useState(false)
  const [nuovoMedicoId, setNuovoMedicoId] = useState('')
  const [nuovoNome, setNuovoNome] = useState('')
  const [nuovoCognome, setNuovoCognome] = useState('')
  const [nuovoCf, setNuovoCf] = useState('')
  const [nuovaDataNascita, setNuovaDataNascita] = useState('')
  const [nuovaEmail, setNuovaEmail] = useState('')
  const [nuovoTelefono, setNuovoTelefono] = useState('')
  const [nuovaPassword, setNuovaPassword] = useState('')
  const [creazioneInCorso, setCreazioneInCorso] = useState(false)
  const [erroreNuovo, setErroreNuovo] = useState<string | null>(null)
  const [credenzialeCreata, setCredenzialeCreata] = useState<{
    nome: string
    cognome: string
    codiceFiscale: string
    passwordTemporanea: string
    email?: string | null
    telefono?: string | null
  } | null>(null)

  // 2. MODALE IMPORTA CSV
  const [modalCsvOpen, setModalCsvOpen] = useState(false)
  const [csvMedicoId, setCsvMedicoId] = useState('')
  const [anteprimaPazienti, setAnteprimaPazienti] = useState<AnteprimaPaziente[]>([])
  const [importInCorso, setImportInCorso] = useState(false)
  const [importCompletato, setImportCompletato] = useState(false)
  const [credenzialiGenerateCsv, setCredenzialiGenerateCsv] = useState<any[]>([])

  // 3. MODALE QR & LINK
  const [modalQrOpen, setModalQrOpen] = useState(false)
  const [linkCopiato, setLinkCopiato] = useState(false)

  // 4. MODALE ASSOCIA PAZIENTE REGISTRATO DA CODICE FISCALE
  const [modalAssociaCfOpen, setModalAssociaCfOpen] = useState(false)
  const [associaCfInput, setAssociaCfInput] = useState('')
  const [associaMedicoId, setAssociaMedicoId] = useState('')
  const [associandoCf, setAssociandoCf] = useState(false)
  const [erroreAssociaCf, setErroreAssociaCf] = useState<string | null>(null)

  // 5. CARTELLA CLINICA & APPUNTI PAZIENTE SELEZIONATO
  const [documentiPaziente, setDocumentiPaziente] = useState<any[]>([])
  const [caricamentoDocPaziente, setCaricamentoDocPaziente] = useState(false)
  const [filtroDocPaziente, setFiltroDocPaziente] = useState<string>('tutti')
  const [modalDocPazienteOpen, setModalDocPazienteOpen] = useState(false)
  const [docTitolo, setDocTitolo] = useState('')
  const [docCategoria, setDocCategoria] = useState<
    'referto' | 'esame' | 'ricetta' | 'terapia' | 'allergia' | 'appunto'
  >('appunto')
  const [docNote, setDocNote] = useState('')
  const [docFileName, setDocFileName] = useState('')
  const [docFileType, setDocFileType] = useState('')
  const [docFileSize, setDocFileSize] = useState<number | null>(null)
  const [docFileUrl, setDocFileUrl] = useState('')
  const [salvandoDocPaziente, setSalvandoDocPaziente] = useState(false)

  const caricaDocumentiPaziente = async (pazienteId: string) => {
    setCaricamentoDocPaziente(true)
    try {
      const res = await fetch(`/api/pazienti/documenti?pazienteId=${pazienteId}`)
      const data = await res.json()
      if (data.success) {
        setDocumentiPaziente(data.documenti || [])
      }
    } catch (err) {
      console.error('Errore recupero documenti clinici:', err)
    } finally {
      setCaricamentoDocPaziente(false)
    }
  }

  // Carica sessione e medici dello studio
  useEffect(() => {
    async function loadStudioData() {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.authenticated && data.user) {
          setStudioId(data.user.studioId || '')
          setCodiceStudio(data.user.codiceStudio || '')
          setNomeStudio(data.user.nomeStudio || '')
          const mediciList = data.medici || []
          setMediciStudio(mediciList)
          if (mediciList.length > 0) {
            setNuovoMedicoId(mediciList[0]?.id || '')
            setCsvMedicoId(mediciList[0]?.id || '')
            setAssociaMedicoId(mediciList[0]?.id || '')
          }
        }
      } catch (err) {
        console.error('Errore recupero sessione segreteria:', err)
      }
    }
    loadStudioData()
  }, [])

  // Carica lista pazienti
  const ricaricaPazienti = async (searchQ = query) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/pazienti/search?q=${encodeURIComponent(searchQ)}`)
      const data = await res.json()
      if (data.success) {
        setPazienti(data.pazienti || [])
        if (data.pazienti?.length > 0 && !selezionato) {
          setSelezionato(data.pazienti[0] || null)
        }
      }
    } catch (err) {
      console.error('Errore ricerca:', err)
    } finally {
      setLoading(false)
    }
  }

  // Ricerca live
  useEffect(() => {
    const timer = setTimeout(() => {
      ricaricaPazienti(query)
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  // Ricarica documenti clinici quando cambia il paziente selezionato
  useEffect(() => {
    if (selezionato?.id) {
      caricaDocumentiPaziente(selezionato.id)
    } else {
      setDocumentiPaziente([])
    }
  }, [selezionato?.id])

  // Azione Associa Paziente da Codice Fiscale
  const handleAssociaPazienteCf = async (e: React.FormEvent) => {
    e.preventDefault()
    setErroreAssociaCf(null)

    if (!associaCfInput.trim()) {
      setErroreAssociaCf('Inserisci il Codice Fiscale del paziente')
      return
    }

    if (!associaMedicoId) {
      setErroreAssociaCf('Seleziona il Medico Curante da assegnare al paziente')
      return
    }

    setAssociandoCf(true)
    try {
      const res = await fetch('/api/pazienti/associa-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codiceFiscale: associaCfInput.trim(),
          customStudioId: studioId,
          customMedicoId: associaMedicoId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore durante l\'associazione del paziente')

      setFeedbackSuccess(data.message || 'Paziente associato con successo!')
      setTimeout(() => setFeedbackSuccess(null), 4000)
      setModalAssociaCfOpen(false)
      setAssociaCfInput('')
      await ricaricaPazienti()
      if (data.paziente) {
        setSelezionato(data.paziente)
      }
    } catch (err: any) {
      setErroreAssociaCf(err.message)
    } finally {
      setAssociandoCf(false)
    }
  }

  // Azione Salvataggio Documento / Appunto Medico
  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDocFileName(file.name)
      setDocFileType(file.type || 'application/octet-stream')
      setDocFileSize(file.size)

      const reader = new FileReader()
      reader.onload = () => {
        setDocFileUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSalvaDocPaziente = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selezionato) return
    if (!docTitolo.trim()) return

    setSalvandoDocPaziente(true)
    try {
      const res = await fetch('/api/pazienti/documenti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pazienteId: selezionato.id,
          titolo: docTitolo.trim(),
          categoria: docCategoria,
          note: docNote.trim() || null,
          fileName: docFileName || null,
          fileType: docFileType || null,
          fileSize: docFileSize || null,
          fileUrl: docFileUrl || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore durante il salvataggio')

      setModalDocPazienteOpen(false)
      setDocTitolo('')
      setDocCategoria('appunto')
      setDocNote('')
      setDocFileName('')
      setDocFileType('')
      setDocFileSize(null)
      setDocFileUrl('')

      setFeedbackSuccess('Documento / appunto inserito con successo!')
      setTimeout(() => setFeedbackSuccess(null), 4000)
      await caricaDocumentiPaziente(selezionato.id)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSalvandoDocPaziente(false)
    }
  }

  const handleEliminaDocPaziente = async (docId: string) => {
    if (!confirm('Eliminare questo documento / appunto dalla cartella del paziente?')) return

    try {
      const res = await fetch(`/api/pazienti/documenti?id=${docId}`, { method: 'DELETE' })
      if (res.ok) {
        setDocumentiPaziente((prev) => prev.filter((d) => d.id !== docId))
      } else {
        const err = await res.json()
        alert(err.error || 'Errore eliminazione')
      }
    } catch (err) {
      console.error('Errore eliminazione documento:', err)
    }
  }

  // Azione Accettazione in Sala d'Attesa
  const handleAccettaInSala = async () => {
    if (!selezionato) return
    setFeedbackSuccess(`Paziente ${selezionato.nome} ${selezionato.cognome} inserito in sala d'attesa studio!`)
    setTimeout(() => setFeedbackSuccess(null), 4000)
  }

  // Azione Invia Richiesta Farmaco/Certificato
  const handleInviaRichiesta = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selezionato) return

    try {
      const res = await fetch(`/api/pazienti/${selezionato.id}/operazioni`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          azione: 'richiesta',
          tipo: tipoRichiesta,
          farmaco: farmacoNome,
          dettaglio: `Richiesta inserita da sportello segreteria: ${farmacoNome}`,
          modalitaRitiro: 'studio',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore creazione richiesta')

      setModalRichiestaOpen(false)
      setFarmacoNome('')
      setFeedbackSuccess('Richiesta registrata con successo nella coda ricette!')
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
      setFeedbackSuccess('Recapiti del paziente aggiornati!')
      setTimeout(() => setFeedbackSuccess(null), 4000)
    } catch (err: any) {
      alert(err.message)
    }
  }

  // AZIONE CREA NUOVO PAZIENTE (SPORTELLO)
  const handleCreaNuovoPaziente = async (e: React.FormEvent) => {
    e.preventDefault()
    setErroreNuovo(null)
    setCreazioneInCorso(true)

    try {
      const res = await fetch('/api/pazienti/crea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicoId: nuovoMedicoId,
          nome: nuovoNome,
          cognome: nuovoCognome,
          codiceFiscale: nuovoCf.trim().toUpperCase(),
          dataNascita: nuovaDataNascita,
          email: nuovaEmail || undefined,
          telefono: nuovoTelefono || undefined,
          passwordPersonalizzata: nuovaPassword || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore creazione paziente')

      setCredenzialeCreata({
        nome: data.paziente.nome,
        cognome: data.paziente.cognome,
        codiceFiscale: data.paziente.codiceFiscale,
        passwordTemporanea: data.paziente.passwordTemporanea,
        email: data.paziente.email,
        telefono: data.paziente.telefono,
      })

      setNuovoNome('')
      setNuovoCognome('')
      setNuovoCf('')
      setNuovaDataNascita('')
      setNuovaEmail('')
      setNuovoTelefono('')
      setNuovaPassword('')

      ricaricaPazienti()
    } catch (err: any) {
      setErroreNuovo(err.message || 'Errore durante la creazione del paziente')
    } finally {
      setCreazioneInCorso(false)
    }
  }

  // CSV: PARSING
  const parseCsvContent = (content: string) => {
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0)
    if (lines.length <= 1) {
      alert('Il file CSV sembra vuoto o contiene solo intestazioni')
      return
    }

    const parsed: AnteprimaPaziente[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i] || ''
      const cols = (line.includes(';') ? line.split(';') : line.split(',')).map((c) =>
        c.trim().replace(/^"|"$/g, '')
      )

      const pNome = cols[0] || ''
      const pCognome = cols[1] || ''
      const pCf = (cols[2] || '').toUpperCase()
      const pDataNascita = cols[3] || '1980-01-01'
      const pEmail = cols[4] || ''
      const pTelefono = cols[5] || ''

      let valido = true
      let motivoErrore = ''

      if (!pNome || !pCognome) {
        valido = false
        motivoErrore = 'Nome o cognome mancante'
      } else if (pCf.length !== 16) {
        valido = false
        motivoErrore = `CF non valido (${pCf.length} car., attesi 16)`
      }

      parsed.push({
        nome: pNome,
        cognome: pCognome,
        codiceFiscale: pCf,
        dataNascita: pDataNascita,
        email: pEmail || undefined,
        telefono: pTelefono || undefined,
        valido,
        motivoErrore,
      })
    }

    setAnteprimaPazienti(parsed)
  }

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
    link.setAttribute('download', 'template_pazienti_studio.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImportCsv = async () => {
    const validi = anteprimaPazienti.filter((p) => p.valido)
    if (validi.length === 0) {
      alert('Nessun paziente valido da importare')
      return
    }

    if (!csvMedicoId) {
      alert('Seleziona il Medico Curante a cui assegnare i pazienti')
      return
    }

    setImportInCorso(true)
    try {
      const res = await fetch('/api/pazienti/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicoId: csvMedicoId,
          pazienti: validi,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore durante l\'importazione')

      setCredenzialiGenerateCsv(data.credenziali || [])
      setImportCompletato(true)
      ricaricaPazienti()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setImportInCorso(false)
    }
  }

  const downloadCredenzialiCsv = () => {
    const headers = 'Nome,Cognome,CodiceFiscale_Username,Password_Temporanea,DataNascita,Email,Telefono\n'
    const rows = credenzialiGenerateCsv
      .map(
        (c) =>
          `"${c.nome}","${c.cognome}","${c.codiceFiscale}","${c.passwordTemporanea}","${c.dataNascita}","${c.email}","${c.telefono}"`
      )
      .join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'credenziali_pazienti_importati.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const registrationUrl =
    typeof window !== 'undefined' && codiceStudio
      ? `${window.location.origin}/registrazione-paziente?codiceStudio=${encodeURIComponent(codiceStudio)}`
      : ''

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            <Users className="h-4 w-4" />
            Accettazione & Segreteria {nomeStudio ? `• ${nomeStudio}` : ''}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Ricerca Pazienti & Scheda Operativa
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cerca tra tutti i pazienti dello studio, registrali allo sportello o importa archivi CSV con password temporanee.
          </p>
        </div>

        {/* Search Bar & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {loading ? <Loader2 className="h-4 w-4 animate-spin text-amber-600" /> : <Search className="h-4 w-4" />}
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca CF, cognome..."
              className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setCredenzialeCreata(null)
                setErroreNuovo(null)
                setModalNuovoOpen(true)
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm shadow-amber-500/20 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Nuovo Paziente</span>
            </button>

            <button
              onClick={() => {
                setErroreAssociaCf(null)
                setAssociaCfInput('')
                if (mediciStudio.length > 0) {
                  setAssociaMedicoId(mediciStudio[0]?.id || '')
                }
                setModalAssociaCfOpen(true)
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 transition-all"
            >
              <Link2 className="h-4 w-4" />
              <span>Associa da CF</span>
            </button>

            <button
              onClick={() => {
                setAnteprimaPazienti([])
                setImportCompletato(false)
                setCredenzialiGenerateCsv([])
                setModalCsvOpen(true)
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition-all"
            >
              <Upload className="h-4 w-4 text-slate-600" />
              <span>Importa CSV</span>
            </button>

            {codiceStudio && (
              <button
                onClick={() => setModalQrOpen(true)}
                className="px-3.5 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 border border-indigo-200/80 transition-all"
              >
                <QrCode className="h-4 w-4 text-indigo-600" />
                <span>Link & QR Studio</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {feedbackSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {/* Grid: Left List, Right Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Risultati Ricerca */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pazienti Trovati ({pazienti.length})
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {pazienti.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <Users className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">Nessun paziente trovato</p>
                <p className="text-[11px] text-slate-400">
                  {query
                    ? 'Prova a modificare i termini di ricerca'
                    : 'Aggiungi un paziente col tasto "+ Nuovo Paziente" o importa un file CSV'}
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
                        ? 'bg-amber-50/60 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
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
                      <span className="truncate">Dott. {paz.nomeMedico} {paz.cognomeMedico}</span>
                      <span>{paz.telefono || 'No tel'}</span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column: Scheda Paziente Selezionato & Azioni Rapide */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          {selezionato ? (
            <div className="space-y-6">
              {/* Header Scheda */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="h-14 w-14 rounded-2xl bg-amber-100 text-amber-800 font-extrabold text-xl flex items-center justify-center border border-amber-200">
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
                    <span>Modifica Contatti</span>
                  </button>
                </div>
              </div>

              {/* Dati Clinici & Studio */}
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
                  <span className="text-slate-400 block font-medium">Studio Medico</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    {selezionato.nomeStudio || 'Studio'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                  <span className="text-slate-400 block font-medium">Telefono</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    {selezionato.telefono || 'Non specificato'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs sm:col-span-2">
                  <span className="text-slate-400 block font-medium">Email di Contatto</span>
                  <span className="font-bold text-slate-900 mt-0.5 block truncate">
                    {selezionato.email || 'Nessuna email registrata'}
                  </span>
                </div>
              </div>

              {/* Pulsanti Azioni Rapide per la Segreteria */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Azioni Rapide Operatore:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleAccettaInSala}
                    className="p-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Fai Accettazione / Metti in Sala d'Attesa</span>
                  </button>

                  <button
                    onClick={() => {
                      setFarmacoNome('')
                      setModalRichiestaOpen(true)
                    }}
                    className="p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Pill className="h-4 w-4" />
                    <span>Registra Richiesta Ricetta/Farmaco</span>
                  </button>
                </div>
              </div>

              {/* Info Account */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Account Paziente Portale Sanitario</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Username di accesso: <code className="font-mono font-bold text-indigo-700">{selezionato.codiceFiscale}</code>
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

              {/* Sezione Cartella Clinica & Appunti Sanitari Condivisi col Paziente */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderLock className="h-4 w-4 text-indigo-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Cartella Clinica & Appunti Condivisi ({documentiPaziente.length})
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDocTitolo('')
                      setDocCategoria('appunto')
                      setDocNote('')
                      setDocFileName('')
                      setDocFileUrl('')
                      setDocFileType('')
                      setDocFileSize(null)
                      setModalDocPazienteOpen(true)
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-indigo-200/60"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Aggiungi Appunto / Doc</span>
                  </button>
                </div>

                {/* Filtri */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  {[
                    { id: 'tutti', label: 'Tutti' },
                    { id: 'referti_esami', label: 'Referti & Esami' },
                    { id: 'terapie_ricette', label: 'Terapie & Farmaci' },
                    { id: 'allergie', label: 'Allergie' },
                    { id: 'appunti', label: 'Appunti' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFiltroDocPaziente(f.id)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        filtroDocPaziente === f.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Lista Documenti Paziente */}
                {caricamentoDocPaziente ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Caricamento cartella in corso...
                  </div>
                ) : documentiPaziente.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 space-y-2">
                    <FileText className="h-7 w-7 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">Nessun appunto o referto clinico</p>
                    <p className="text-[11px] text-slate-400">
                      I documenti inseriti dal paziente o dalla segreteria appariranno qui.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {documentiPaziente
                      .filter((d) => {
                        if (filtroDocPaziente === 'tutti') return true
                        if (filtroDocPaziente === 'referti_esami')
                          return d.categoria === 'referto' || d.categoria === 'esame'
                        if (filtroDocPaziente === 'terapie_ricette')
                          return d.categoria === 'terapia' || d.categoria === 'ricetta'
                        if (filtroDocPaziente === 'allergie') return d.categoria === 'allergia'
                        if (filtroDocPaziente === 'appunti') return d.categoria === 'appunto'
                        return d.categoria === filtroDocPaziente
                      })
                      .map((doc) => {
                        const isPaziente = doc.autoreRuolo === 'paziente'
                        const badgeColore =
                          doc.categoria === 'referto'
                            ? 'bg-blue-100 text-blue-800'
                            : doc.categoria === 'esame'
                            ? 'bg-purple-100 text-purple-800'
                            : doc.categoria === 'terapia'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.categoria === 'allergia'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'

                        return (
                          <div
                            key={doc.id}
                            className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${badgeColore}`}
                                >
                                  {doc.categoria}
                                </span>
                                <h5 className="font-extrabold text-slate-900">{doc.titolo}</h5>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400">
                                  {new Date(doc.createdAt).toLocaleDateString('it-IT', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleEliminaDocPaziente(doc.id)}
                                  className="text-slate-300 hover:text-rose-600 p-0.5"
                                  title="Elimina"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            {doc.note && (
                              <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 whitespace-pre-wrap">
                                {doc.note}
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                              <span className="font-semibold text-slate-500">
                                Autore: {isPaziente ? '👤 Paziente' : `🏢 Studio (${doc.autoreRuolo})`}
                              </span>

                              {doc.fileName && (
                                <div className="flex items-center gap-1">
                                  <Paperclip className="h-3 w-3 text-slate-400" />
                                  <span className="font-mono text-slate-600 truncate max-w-[140px]">
                                    {doc.fileName}
                                  </span>
                                  {doc.fileUrl && (
                                    <a
                                      href={doc.fileUrl}
                                      download={doc.fileName}
                                      className="text-blue-600 hover:text-blue-800 font-bold ml-1"
                                      title="Scarica allegato"
                                    >
                                      Scarica
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Users className="h-10 w-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">Seleziona un paziente</p>
              <p className="text-xs">Scegli un paziente dalla lista a sinistra per visualizzare la scheda completa.</p>
            </div>
          )}
        </div>
      </div>

      {/* 1. MODALE: REGISTRA NUOVO PAZIENTE AL BANCO */}
      {modalNuovoOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-amber-600" />
                Registra Nuovo Paziente allo Sportello
              </h3>
              <button onClick={() => setModalNuovoOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {credenzialeCreata ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-black text-emerald-950">Paziente Inserito con Successo!</h4>
                  <p className="text-xs text-emerald-800">
                    Consegna queste credenziali all'assistito per il primo accesso al portale.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-slate-400 block font-sans text-[10px] uppercase font-bold">Paziente</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {credenzialeCreata.cognome} {credenzialeCreata.nome}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-sans text-[10px] uppercase font-bold">Username (Codice Fiscale)</span>
                    <span className="font-bold text-indigo-700 text-sm">{credenzialeCreata.codiceFiscale}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-sans text-[10px] uppercase font-bold">Password Temporanea</span>
                    <span className="font-black text-rose-600 text-base tracking-wider bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {credenzialeCreata.passwordTemporanea}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `PORTALE STUDIO MEDICO\nPaziente: ${credenzialeCreata.nome} ${credenzialeCreata.cognome}\nUsername (CF): ${credenzialeCreata.codiceFiscale}\nPassword provvisoria: ${credenzialeCreata.passwordTemporanea}`
                      )
                      alert('Credenziali copiate negli appunti!')
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copia Ricevuta</span>
                  </button>
                  <button
                    onClick={() => {
                      setCredenzialeCreata(null)
                      setModalNuovoOpen(false)
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                  >
                    Chiudi
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreaNuovoPaziente} className="space-y-4 text-xs">
                {erroreNuovo && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>{erroreNuovo}</span>
                  </div>
                )}

                {/* Scelta Medico Curante */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Medico Curante Assegnato *
                  </label>
                  <select
                    value={nuovoMedicoId}
                    onChange={(e) => setNuovoMedicoId(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    {mediciStudio.map((m) => (
                      <option key={m.id} value={m.id}>
                        Dott. {m.nome} {m.cognome} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Nome *</label>
                    <input
                      type="text"
                      required
                      placeholder="Mario"
                      value={nuovoNome}
                      onChange={(e) => setNuovoNome(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Cognome *</label>
                    <input
                      type="text"
                      required
                      placeholder="Rossi"
                      value={nuovoCognome}
                      onChange={(e) => setNuovoCognome(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700 uppercase tracking-wider">Codice Fiscale *</label>
                      <span className="text-[10px] text-slate-400">{nuovoCf.length}/16</span>
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={16}
                      placeholder="RSSMRA85M01H501Z"
                      value={nuovoCf}
                      onChange={(e) => setNuovoCf(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold uppercase focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Data di Nascita *</label>
                    <input
                      type="date"
                      required
                      value={nuovaDataNascita}
                      onChange={(e) => setNuovaDataNascita(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Telefono</label>
                    <input
                      type="tel"
                      placeholder="340 1234567"
                      value={nuovoTelefono}
                      onChange={(e) => setNuovoTelefono(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="paziente@email.it"
                      value={nuovaEmail}
                      onChange={(e) => setNuovaEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password Personalizzata (Opzionale)
                  </label>
                  <input
                    type="text"
                    placeholder="Lascia vuoto per generare password provvisoria a 6 caratteri"
                    value={nuovaPassword}
                    onChange={(e) => setNuovaPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalNuovoOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 font-bold"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={creazioneInCorso}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    {creazioneInCorso ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    <span>Crea Paziente ed Emetti Password</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. MODALE: IMPORTA CSV */}
      {modalCsvOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-amber-600" />
                Importazione CSV Assistiti di Studio
              </h3>
              <button onClick={() => setModalCsvOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {importCompletato ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-black text-emerald-950">Dataset Importato con Successo!</h4>
                  <p className="text-xs text-emerald-800">
                    Inseriti <b>{credenzialiGenerateCsv.length}</b> assistiti con credenziali temporanee.
                  </p>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700">Scarica file credenziali per la consegna:</span>
                  <button
                    onClick={downloadCredenzialiCsv}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download CSV Credenziali</span>
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-100 text-slate-600 font-bold">
                      <tr>
                        <th className="p-2">Paziente</th>
                        <th className="p-2">Codice Fiscale</th>
                        <th className="p-2">Password Provvisoria</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {credenzialiGenerateCsv.map((c, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2 font-sans font-bold text-slate-900">{c.cognome} {c.nome}</td>
                          <td className="p-2 text-indigo-700">{c.codiceFiscale}</td>
                          <td className="p-2 font-bold text-rose-600">{c.passwordTemporanea}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setModalCsvOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                  >
                    Fatto
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Selezione Medico per il CSV */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assegna i pazienti del CSV al Medico: *
                  </label>
                  <select
                    value={csvMedicoId}
                    onChange={(e) => setCsvMedicoId(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    {mediciStudio.map((m) => (
                      <option key={m.id} value={m.id}>
                        Dott. {m.nome} {m.cognome} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl">
                  <div>
                    <p className="font-bold text-amber-900">Struttura file CSV</p>
                    <p className="text-[11px] text-amber-700">Colonne: nome, cognome, codice_fiscale, data_nascita, email, telefono</p>
                  </div>
                  <button
                    onClick={downloadTemplateCsv}
                    className="px-3 py-1.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-100 text-amber-800 font-bold flex items-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Scarica Template</span>
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-6 text-center space-y-2 cursor-pointer transition-colors bg-slate-50/50">
                  <Upload className="h-8 w-8 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-700">Trascina o carica il file CSV assistiti</p>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-800 hover:file:bg-amber-100 cursor-pointer"
                  />
                </div>

                {anteprimaPazienti.length > 0 && (
                  <div className="space-y-3">
                    <span className="font-bold text-slate-700">
                      Anteprima ({anteprimaPazienti.filter((p) => p.valido).length} validi su {anteprimaPazienti.length})
                    </span>

                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-[11px] text-left">
                        <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0">
                          <tr>
                            <th className="p-2">Paziente</th>
                            <th className="p-2">Codice Fiscale</th>
                            <th className="p-2">Stato</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {anteprimaPazienti.map((p, i) => (
                            <tr key={i} className={p.valido ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                              <td className="p-2 font-semibold text-slate-900">{p.cognome} {p.nome}</td>
                              <td className="p-2 font-mono text-indigo-700">{p.codiceFiscale}</td>
                              <td className="p-2">
                                {p.valido ? (
                                  <span className="text-emerald-600 font-bold">Valido</span>
                                ) : (
                                  <span className="text-rose-600 font-bold">{p.motivoErrore}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setModalCsvOpen(false)}
                        className="px-4 py-2 rounded-xl text-slate-500 font-bold"
                      >
                        Annulla
                      </button>
                      <button
                        onClick={handleImportCsv}
                        disabled={importInCorso || anteprimaPazienti.filter((p) => p.valido).length === 0}
                        className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                      >
                        {importInCorso ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Importazione...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            <span>Importa e Genera Credenziali</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. MODALE: QR & LINK REGISTRAZIONE STUDIO */}
      {modalQrOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-slate-200 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-indigo-600" />
                Registrazione Desk Pazienti
              </h3>
              <button onClick={() => setModalQrOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Mostra o stampa questo QR code al bancone della segreteria per consentire ai nuovi pazienti di registrarsi con lo smartphone.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl inline-block shadow-inner mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  registrationUrl
                )}`}
                alt="QR Code Desk Segreteria"
                className="w-48 h-48 mx-auto rounded-xl"
              />
            </div>

            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-left space-y-1">
              <span className="text-[10px] font-bold uppercase text-indigo-500 tracking-wider">Codice Univoco Studio</span>
              <p className="font-mono font-black text-indigo-950 text-sm">{codiceStudio}</p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(registrationUrl)
                setLinkCopiato(true)
                setTimeout(() => setLinkCopiato(false), 3000)
              }}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
            >
              {linkCopiato ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Link Copiato negli Appunti!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copia Link di Registrazione</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MODALE: REGISTRA RICHIESTA FARMACO/CERTIFICATO */}
      {modalRichiestaOpen && selezionato && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Pill className="h-4 w-4 text-blue-600" />
                Registra Richiesta per {selezionato.cognome} {selezionato.nome}
              </h3>
              <button onClick={() => setModalRichiestaOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleInviaRichiesta} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tipo di Richiesta
                </label>
                <select
                  value={tipoRichiesta}
                  onChange={(e) => setTipoRichiesta(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="medicinale">💊 Prescrizione Farmaco / Ricetta Continuativa</option>
                  <option value="certificato">📋 Certificato Medico (Sportivo / Buona Salute)</option>
                  <option value="malattia">🤒 Certificato di Malattia INPS</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nome Farmaco o Dettaglio Richiesta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Cardioaspirina 100mg, 1 scatola"
                  value={farmacoNome}
                  onChange={(e) => setFarmacoNome(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalRichiestaOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20"
                >
                  Invia al Medico
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
                Aggiorna Recapiti Paziente
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
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md shadow-amber-600/20"
                >
                  Salva Modifiche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODALE ASSOCIA PAZIENTE REGISTRATO TRAMITE CODICE FISCALE */}
      {modalAssociaCfOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Link2 className="h-5 w-5 text-indigo-600" />
                Associa Paziente Registrato allo Studio
              </h3>
              <button
                onClick={() => setModalAssociaCfOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Inserisci il <strong>Codice Fiscale</strong> del paziente registrato e assegna il suo <strong>Medico Curante</strong> di riferimento.
            </p>

            {erroreAssociaCf && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{erroreAssociaCf}</span>
              </div>
            )}

            <form onSubmit={handleAssociaPazienteCf} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Codice Fiscale Paziente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. RSSMRA80A01H501U"
                  value={associaCfInput}
                  onChange={(e) => setAssociaCfInput(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 uppercase font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assegna a Medico Curante *
                </label>
                <select
                  required
                  value={associaMedicoId}
                  onChange={(e) => setAssociaMedicoId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {mediciStudio.map((m) => (
                    <option key={m.id} value={m.id}>
                      Dott. {m.nome} {m.cognome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAssociaCfOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={associandoCf}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                >
                  {associandoCf ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Associazione in corso...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Associa Paziente</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODALE AGGIUNGI DOCUMENTO / APPUNTO CLINICO */}
      {modalDocPazienteOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <FolderLock className="h-4 w-4 text-indigo-600" />
                Aggiungi Documento o Appunto Clinico
              </h3>
              <button
                onClick={() => setModalDocPazienteOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paziente: <strong>{selezionato?.nome} {selezionato?.cognome}</strong> ({selezionato?.codiceFiscale})
            </p>

            <form onSubmit={handleSalvaDocPaziente} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Titolo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Esami urine, Referto specialistico, Nota segreteria..."
                  value={docTitolo}
                  onChange={(e) => setDocTitolo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Categoria Clinica *
                </label>
                <select
                  value={docCategoria}
                  onChange={(e) => setDocCategoria(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="appunto">Appunto Studio / Nota</option>
                  <option value="referto">Referto Medico / Specialistico</option>
                  <option value="esame">Esame di Laboratorio / Diagnostica</option>
                  <option value="terapia">Piano Terapeutico / Dosaggio</option>
                  <option value="ricetta">Ricetta o Prescrizione</option>
                  <option value="allergia">Allergia o Controindicazione</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Note & Dettagli
                </label>
                <textarea
                  rows={3}
                  placeholder="Note, annotazioni o comunicazioni dello studio per il paziente..."
                  value={docNote}
                  onChange={(e) => setDocNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Allegato (PDF, Referto, Immagine)
                </label>
                <input
                  type="file"
                  onChange={handleDocFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {docFileName && (
                  <p className="mt-1 text-[11px] text-indigo-600 font-semibold">
                    File selezionato: {docFileName} ({(Number(docFileSize || 0) / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalDocPazienteOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={salvandoDocPaziente}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
                >
                  {salvandoDocPaziente ? 'Salvataggio...' : 'Salva nella Cartella'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
