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
  Settings,
  Copy,
  ExternalLink,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  ShieldAlert,
  ShieldCheck,
  ArrowUpDown,
  FileDown,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { Skeleton, CardSkeleton, TableRowsSkeleton } from '@/components/ui/skeleton'

interface Studio {
  id: string
  nome: string
  codiceStudio: string | null
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
  const toast = useToast()
  const [tabAttiva, setTabAttiva] = useState<'studi' | 'medici' | 'staff' | 'audit'>('studi')

  // Dati
  const [studiList, setStudiList] = useState<Studio[]>([])
  const [mediciList, setMediciList] = useState<Medico[]>([])
  const [staffList, setStaffList] = useState<StaffItem[]>([])
  const [loading, setLoading] = useState(true)

  // Conferma Eliminazione Non Bloccante
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'studio' | 'medico' | 'staff'
    id: string
    name: string
    details?: string
  } | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Stati Salvataggio Modali
  const [savingStudio, setSavingStudio] = useState(false)
  const [savingMedico, setSavingMedico] = useState(false)
  const [savingStaff, setSavingStaff] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([])
  const [auditQuery, setAuditQuery] = useState('')
  const [auditFiltroRuolo, setAuditFiltroRuolo] = useState<string>('tutti')
  const [auditFiltroCategoria, setAuditFiltroCategoria] = useState<string>('tutte')
  const [auditPagina, setAuditPagina] = useState(1)
  const [auditRighePerPagina, setAuditRighePerPagina] = useState(25)
  const [loadingAudit, setLoadingAudit] = useState(false)
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogItem | null>(null)
  const [jsonCopiato, setJsonCopiato] = useState(false)
  const [modalEmergencyOpen, setModalEmergencyOpen] = useState(false)

  // Modali Creazione
  const [modalStudioOpen, setModalStudioOpen] = useState(false)
  const [modalMedicoOpen, setModalMedicoOpen] = useState(false)
  const [modalStaffOpen, setModalStaffOpen] = useState(false)
  const [modalCsvOpen, setModalCsvOpen] = useState(false)

  // Modali Modifica
  const [modalEditStudioOpen, setModalEditStudioOpen] = useState(false)
  const [studioInModifica, setStudioInModifica] = useState<Studio | null>(null)
  const [formEditStudio, setFormEditStudio] = useState({
    nome: '',
    citta: '',
    indirizzo: '',
    telefono: '',
    email: '',
    durataVisita: 20,
    lockupMinutes: 10,
    anticipoMax: 30,
  })

  const [modalEditMedicoOpen, setModalEditMedicoOpen] = useState(false)
  const [medicoInModifica, setMedicoInModifica] = useState<Medico | null>(null)
  const [formEditMedico, setFormEditMedico] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    studioId: '',
  })

  const [modalEditStaffOpen, setModalEditStaffOpen] = useState(false)
  const [staffInModifica, setStaffInModifica] = useState<StaffItem | null>(null)
  const [formEditStaff, setFormEditStaff] = useState({
    nome: '',
    cognome: '',
    email: '',
    studioId: '',
    mediciIds: [] as string[],
  })

  // Clipboard
  const [copiatoId, setCopiatoId] = useState<string | null>(null)
  const copiaTesto = (testo: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(testo)
      setCopiatoId(id)
      setTimeout(() => setCopiatoId(null), 2500)
    }
  }

  // Form Nuovo Studio con opzione Medico contestuale
  const [formStudio, setFormStudio] = useState({
    nome: '',
    citta: '',
    indirizzo: '',
    telefono: '',
    email: '',
    durataVisita: 20,
    lockupMinutes: 10,
    anticipoMax: 30,
    // Medico contestuale
    opzioneMedico: 'nessuno' as 'nessuno' | 'nuovo' | 'esistente',
    nomeMedico: '',
    cognomeMedico: '',
    emailMedico: '',
    telefonoMedico: '',
    passwordMedico: '',
    assegnaMedicoId: '',
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
  const caricaAuditLogs = async (query = auditQuery, ruolo = auditFiltroRuolo) => {
    setLoadingAudit(true)
    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set('q', query.trim())
      if (ruolo && ruolo !== 'tutti') params.set('ruolo', ruolo)
      params.set('limit', '300')
      const res = await fetch(`/api/admin/audit?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setAuditLogs(data.logs || [])
        setAuditPagina(1)
      }
    } catch (err) {
      console.error('Errore caricamento audit logs:', err)
    } finally {
      setLoadingAudit(false)
    }
  }

  // Filtro client-side combinato
  const auditLogsFiltrati = auditLogs.filter((log) => {
    if (auditFiltroRuolo !== 'tutti' && log.ruolo?.toLowerCase() !== auditFiltroRuolo.toLowerCase()) {
      return false
    }

    if (auditFiltroCategoria !== 'tutte') {
      const az = log.azione.toUpperCase()
      if (auditFiltroCategoria === 'auth' && !az.includes('LOGIN') && !az.includes('LOGOUT') && !az.includes('PASSWORD')) {
        return false
      }
      if (auditFiltroCategoria === 'creazione' && !az.includes('CREAT') && !az.includes('SUCCESS') && !az.includes('REGISTR')) {
        return false
      }
      if (auditFiltroCategoria === 'modifica' && !az.includes('MODIF') && !az.includes('AGGIORN') && !az.includes('UPDATE')) {
        return false
      }
      if (auditFiltroCategoria === 'eliminazione' && !az.includes('ELIMIN') && !az.includes('DELETE') && !az.includes('FAILED')) {
        return false
      }
      if (auditFiltroCategoria === 'clinica' && !az.includes('ASSOCIAZ') && !az.includes('DOCUMENT') && !az.includes('PAZIENTE')) {
        return false
      }
    }

    if (auditQuery.trim()) {
      const q = auditQuery.toLowerCase().trim()
      const matchEmail = log.attoreEmail?.toLowerCase().includes(q)
      const matchAzione = log.azione?.toLowerCase().includes(q)
      const matchEntita = log.entita?.toLowerCase().includes(q)
      const matchIp = log.ip?.toLowerCase().includes(q)
      const matchDettagli = typeof log.dettagli === 'object'
        ? JSON.stringify(log.dettagli).toLowerCase().includes(q)
        : String(log.dettagli || '').toLowerCase().includes(q)
      if (!matchEmail && !matchAzione && !matchEntita && !matchIp && !matchDettagli) {
        return false
      }
    }

    return true
  })

  // Paginazione tabellare
  const totalePagineAudit = Math.max(1, Math.ceil(auditLogsFiltrati.length / auditRighePerPagina))
  const indiceInizioAudit = (auditPagina - 1) * auditRighePerPagina
  const auditLogsPaginati = auditLogsFiltrati.slice(indiceInizioAudit, indiceInizioAudit + auditRighePerPagina)

  // Esportazione CSV
  const esportaAuditCsv = () => {
    if (auditLogsFiltrati.length === 0) {
      toast.warning('Nessun record', 'Nessun record da esportare con i filtri attuali.')
      return
    }
    const headers = 'ID,DataOra,Ruolo,AttoreEmail,Azione,Entita,EntitaId,IP,Dettagli\n'
    const rows = auditLogsFiltrati
      .map((l) => {
        const dettagliStr = l.dettagli ? JSON.stringify(l.dettagli).replace(/"/g, '""') : ''
        return `"${l.id}","${l.createdAt}","${l.ruolo}","${l.attoreEmail}","${l.azione}","${l.entita}","${l.entitaId || ''}","${l.ip || ''}","${dettagliStr}"`
      })
      .join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success('Esportazione completata', `File scaricato: audit_logs_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  // Sintesi leggibile dettagli per la riga della tabella
  const formatAuditDetailsSummary = (log: AuditLogItem) => {
    if (!log.dettagli) return '—'
    const d = log.dettagli

    if (log.azione === 'LOGIN_SUCCESS') return 'Autenticazione riuscita con token di sessione'
    if (log.azione === 'LOGIN_FAILED') return `Tentativo non autorizzato (${d.motivo || 'Credenziali errate'})`
    if (d.nomeStudio) return `Studio: ${d.nomeStudio}`
    if (d.titolo) return `Doc: "${d.titolo}" (${d.categoria || 'appunto'})`
    if (d.codiceFiscale) return `CF: ${d.codiceFiscale}`
    if (d.conteggio) return `${d.conteggio} record elaborati`
    if (d.motivo) return `Motivo: ${d.motivo}`

    if (typeof d === 'object') {
      const entries = Object.entries(d).filter(([k]) => k !== 'password' && k !== 'passwordHash')
      if (entries.length === 0) return '—'
      return entries.slice(0, 2).map(([k, v]) => `${k}: ${String(v)}`).join(' • ')
    }

    return String(d)
  }

  // Copia JSON
  const copiaJsonLog = (log: AuditLogItem) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2))
    setJsonCopiato(true)
    toast.info('JSON copiato', 'Payload del log copiato negli appunti')
    setTimeout(() => setJsonCopiato(false), 2000)
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

  // Esecuzione eliminazione confermata da modale
  const handleConfermaEliminazione = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      if (confirmDelete.type === 'studio') {
        const res = await fetch(`/api/admin/studi/${confirmDelete.id}`, { method: 'DELETE' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Errore durante l\'eliminazione dello studio')
        toast.success('Studio eliminato', data.message || `Studio "${confirmDelete.name}" rimosso con successo`)
      } else if (confirmDelete.type === 'medico') {
        const res = await fetch(`/api/admin/medici/${confirmDelete.id}`, { method: 'DELETE' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Errore durante l\'eliminazione del medico')
        toast.success('Medico eliminato', data.message || `Medico "${confirmDelete.name}" rimosso con successo`)
      } else if (confirmDelete.type === 'staff') {
        const res = await fetch(`/api/admin/staff/${confirmDelete.id}`, { method: 'DELETE' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Errore durante l\'eliminazione dello staff')
        toast.success('Operatore eliminato', data.message || `Operatore "${confirmDelete.name}" rimosso con successo`)
      }
      setConfirmDelete(null)
      caricaDati()
      caricaAuditLogs()
    } catch (err: any) {
      toast.error('Errore eliminazione', err.message || 'Operazione fallita')
    } finally {
      setDeleting(false)
    }
  }

  // Eliminazione Studio Medico (apre modale)
  const handleEliminaStudio = (studio: Studio) => {
    setConfirmDelete({
      type: 'studio',
      id: studio.id,
      name: studio.nome,
      details: 'Verranno eliminati a cascata tutti i medici, i pazienti, le prenotazioni e gli slot associati a questo studio!',
    })
  }

  // Eliminazione Medico (apre modale)
  const handleEliminaMedico = (medico: Medico) => {
    setConfirmDelete({
      type: 'medico',
      id: medico.id,
      name: `Dott. ${medico.nome} ${medico.cognome}`,
      details: 'Verranno cancellati la sua agenda, le prenotazioni e i pazienti associati!',
    })
  }

  // Eliminazione Staff (apre modale)
  const handleEliminaStaff = (st: StaffItem) => {
    setConfirmDelete({
      type: 'staff',
      id: st.id,
      name: `${st.nome} ${st.cognome}`,
      details: 'L\'operatore perderà immediatamente l\'accesso alla segreteria dello studio.',
    })
  }

  // Modifica Studio
  const handleApriModificaStudio = (studio: Studio) => {
    setStudioInModifica(studio)
    setFormEditStudio({
      nome: studio.nome,
      citta: studio.config?.citta || '',
      indirizzo: studio.config?.indirizzoCompleto || studio.indirizzo || '',
      telefono: studio.telefono || '',
      email: studio.email || '',
      durataVisita: studio.config?.durataVisitaStandardMinuti || 20,
      lockupMinutes: studio.config?.lockupMinutes || 10,
      anticipoMax: studio.config?.anticipoMaxPrenotazioneGiorni || 30,
    })
    setModalEditStudioOpen(true)
  }

  const handleSalvaModificaStudio = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studioInModifica) return
    try {
      const res = await fetch(`/api/admin/studi/${studioInModifica.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formEditStudio.nome,
          indirizzo: formEditStudio.indirizzo
            ? `${formEditStudio.indirizzo.trim()}, ${formEditStudio.citta.trim()}`
            : formEditStudio.citta.trim(),
          telefono: formEditStudio.telefono,
          email: formEditStudio.email,
          config: {
            citta: formEditStudio.citta.trim(),
            indirizzoCompleto: formEditStudio.indirizzo.trim(),
            durataVisitaStandardMinuti: Number(formEditStudio.durataVisita),
            lockupMinutes: Number(formEditStudio.lockupMinutes),
            anticipoMaxPrenotazioneGiorni: Number(formEditStudio.anticipoMax),
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore modifica studio')
      toast.success('Studio aggiornato', `Le impostazioni di "${formEditStudio.nome}" sono state salvate`)
      setModalEditStudioOpen(false)
      setStudioInModifica(null)
      caricaDati()
      caricaAuditLogs()
    } catch (err: any) {
      toast.error('Errore modifica studio', err.message || 'Impossibile salvare le modifiche')
    } finally {
      setSavingStudio(false)
    }
  }

  // Modifica Medico
  const handleApriModificaMedico = (medico: Medico) => {
    setMedicoInModifica(medico)
    setFormEditMedico({
      nome: medico.nome,
      cognome: medico.cognome,
      email: medico.email,
      telefono: medico.telefonoPrimario || '',
      studioId: medico.studioId,
    })
    setModalEditMedicoOpen(true)
  }

  const handleSalvaModificaMedico = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!medicoInModifica) return
    setSavingMedico(true)
    try {
      const res = await fetch(`/api/admin/medici/${medicoInModifica.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEditMedico),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore modifica medico')
      toast.success('Medico aggiornato', `Dati di Dott. ${formEditMedico.nome} ${formEditMedico.cognome} salvati`)
      setModalEditMedicoOpen(false)
      setMedicoInModifica(null)
      caricaDati()
      caricaAuditLogs()
    } catch (err: any) {
      toast.error('Errore modifica medico', err.message || 'Impossibile salvare le modifiche')
    } finally {
      setSavingMedico(false)
    }
  }

  // Modifica Staff
  const handleApriModificaStaff = (st: StaffItem) => {
    setStaffInModifica(st)
    setFormEditStaff({
      nome: st.nome,
      cognome: st.cognome,
      email: st.email,
      studioId: st.studioId,
      mediciIds: st.mediciAssegnati.map((m) => m.id),
    })
    setModalEditStaffOpen(true)
  }

  const toggleMedicoEditStaff = (medicoId: string) => {
    if (formEditStaff.mediciIds.includes(medicoId)) {
      setFormEditStaff({
        ...formEditStaff,
        mediciIds: formEditStaff.mediciIds.filter((id) => id !== medicoId),
      })
    } else {
      setFormEditStaff({
        ...formEditStaff,
        mediciIds: [...formEditStaff.mediciIds, medicoId],
      })
    }
  }

  const handleSalvaModificaStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!staffInModifica) return
    setSavingStaff(true)
    try {
      const res = await fetch(`/api/admin/staff/${staffInModifica.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEditStaff),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore modifica operatore staff')
      toast.success('Staff aggiornato', `Dati di ${formEditStaff.nome} ${formEditStaff.cognome} salvati`)
      setModalEditStaffOpen(false)
      setStaffInModifica(null)
      caricaDati()
      caricaAuditLogs()
    } catch (err: any) {
      toast.error('Errore modifica staff', err.message || 'Impossibile salvare le modifiche')
    } finally {
      setSavingStaff(false)
    }
  }

  // Azione Crea Studio
  const handleCreaStudio = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingStudio(true)
    try {
      const res = await fetch('/api/admin/studi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formStudio),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore creazione studio')

      toast.success('Studio creato!', `Studio "${formStudio.nome}" registrato con successo`)
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
        opzioneMedico: 'nessuno',
        nomeMedico: '',
        cognomeMedico: '',
        emailMedico: '',
        telefonoMedico: '',
        passwordMedico: '',
        assegnaMedicoId: '',
      })
      caricaDati()
      caricaAuditLogs()
    } catch (err: any) {
      toast.error('Errore creazione studio', err.message || 'Impossibile creare lo studio')
    } finally {
      setSavingStudio(false)
    }
  }

  // Azione Crea Medico
  const handleCreaMedico = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingMedico(true)
    try {
      const res = await fetch('/api/admin/medici', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formMedico),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore creazione medico')

      toast.success('Medico aggiunto!', `Dott. ${formMedico.nome} ${formMedico.cognome} creato con successo`)
      setModalMedicoOpen(false)
      setFormMedico({ studioId: '', nome: '', cognome: '', email: '', telefono: '', password: '' })
      caricaDati()
    } catch (err: any) {
      toast.error('Errore creazione medico', err.message || 'Impossibile creare il medico')
    } finally {
      setSavingMedico(false)
    }
  }

  // Azione Crea Staff
  const handleCreaStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingStaff(true)
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formStaff),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore creazione operatore segreteria')

      toast.success('Operatore creato!', `Account di ${formStaff.nome} ${formStaff.cognome} creato con successo`)
      setModalStaffOpen(false)
      setFormStaff({ studioId: '', nome: '', cognome: '', email: '', password: '', mediciIds: [] })
      caricaDati()
    } catch (err: any) {
      toast.error('Errore creazione staff', err.message || 'Impossibile creare l\'operatore')
    } finally {
      setSavingStaff(false)
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
      toast.warning('Nessun record valido', 'Nessun paziente valido trovato nel file CSV da importare')
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

      toast.success(
        'Importazione completata!',
        `${data.credenziali?.length || validi.length} pazienti importati con credenziali generate.`
      )
      setCredenzialiGenerate(data.credenziali || [])
      setImportCompletato(true)
      caricaDati()
    } catch (err: any) {
      toast.error('Errore importazione CSV', err.message || 'Impossibile completare l\'importazione')
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
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
            <Shield className="h-4 w-4" />
            <span>Amministrazione & Gestione Rete Multi-Tenant</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Pannello di Controllo Generale
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configurazione studi medici, medici curanti (MMG), dataset assistiti con credenziali e segreteria.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={caricaDati}
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Aggiorna Dati"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Postgres Connesso
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-400">Studi Medici</span>
            <Building2 className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums font-mono">{studiList.length}</div>
          <p className="text-xs text-slate-500 font-medium">Istanze attive su rete</p>
        </div>

        <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-400">Medici Curanti (MMG)</span>
            <Stethoscope className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums font-mono">{totaleMediciTotali}</div>
          <p className="text-xs text-slate-500 font-medium">Slot agenda attivi</p>
        </div>

        <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-400">Pazienti Registrati</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums font-mono">{totalePazientiTotali}</div>
          <p className="text-xs text-slate-500 font-medium">Accessi CF & credenziali</p>
        </div>

        <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-400">Personale Segreteria</span>
            <UserCheck className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums font-mono">{staffList.length}</div>
          <p className="text-xs text-slate-500 font-medium">Deleghe multi-medico</p>
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

          {loading ? (
            <CardSkeleton count={3} />
          ) : studiList.length === 0 ? (
            <div className="p-12 text-center bg-slate-950 rounded-xl border border-dashed border-slate-800 space-y-3">
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
                  className="bg-slate-950 rounded-xl p-6 border border-slate-800 space-y-4 hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between"
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

                    {/* Codice Studio per Onboarding */}
                    {studio.codiceStudio && (
                      <div className="p-2.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider">
                            Codice Studio Invito
                          </span>
                          <span className="font-mono text-xs font-black text-white truncate block">
                            {studio.codiceStudio}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copiaTesto(studio.codiceStudio!, studio.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-700/60 text-indigo-200 text-[11px] font-semibold flex items-center gap-1.5 transition-all flex-shrink-0"
                          title="Copia codice invito per auto-registrazione"
                        >
                          {copiatoId === studio.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-300">Copiato</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copia</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 font-mono truncate">
                      ID: {studio.id.slice(0, 8)}...
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleApriModificaStudio(studio)}
                        className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-all"
                        title="Modifica impostazioni studio"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEliminaStudio(studio)}
                        className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 border border-rose-900/60 transition-all"
                        title="Elimina studio e tutti i dati correlati a cascata"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
                    toast.warning('Studio richiesto', 'Devi prima creare almeno uno Studio Medico!')
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

          {loading ? (
            <CardSkeleton count={3} />
          ) : mediciList.length === 0 ? (
            <div className="p-12 text-center bg-slate-950 rounded-xl border border-dashed border-slate-800 space-y-3">
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
                  className="bg-slate-950 rounded-xl p-6 border border-slate-800 space-y-4 hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between"
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
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleApriModificaMedico(medico)}
                        className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all flex-shrink-0"
                        title="Modifica dati medico"
                      >
                        <Settings className="h-4 w-4" />
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
                  toast.warning('Studio richiesto', 'Devi prima creare almeno uno Studio Medico!')
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

          {loading ? (
            <CardSkeleton count={3} />
          ) : staffList.length === 0 ? (
            <div className="p-12 text-center bg-slate-950 rounded-xl border border-dashed border-slate-800 space-y-3">
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
                  className="bg-slate-950 rounded-xl p-6 border border-slate-800 space-y-4 hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between"
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
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleApriModificaStaff(st)}
                        className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-all"
                        title="Modifica operatore segreteria"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEliminaStaff(st)}
                        className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 border border-rose-900/60 transition-all"
                        title="Elimina operatore segreteria"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUDIT LOG & SICUREZZA DB */}
      {tabAttiva === 'audit' && (
        <div className="w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-sm flex flex-col">
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-950">
            <div>
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Registro Audit di Sistema (PostgreSQL audit_logs)
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/80 text-[10px] font-mono font-semibold text-emerald-400">
                  GDPR Art. 30
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Tracciamento immutabile di accessi, creazioni, eliminazioni e consultazione cartelle cliniche.
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <button
                type="button"
                onClick={() => caricaAuditLogs()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Ricarica registri dal database"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingAudit ? 'animate-spin' : ''}`} />
                <span>Aggiorna</span>
              </button>
              <button
                type="button"
                onClick={esportaAuditCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Esporta in formato CSV i log attualmente filtrati"
              >
                <FileDown className="h-3.5 w-3.5 text-indigo-400" />
                <span>Esporta CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setModalEmergencyOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-600/40 hover:bg-amber-500/20 text-xs font-semibold text-amber-300 transition-colors"
                title="Accesso di emergenza operatore (ADR-006)"
              >
                <Key className="h-3.5 w-3.5 text-amber-400" />
                <span>Accesso di Emergenza</span>
              </button>
            </div>
          </div>

          {/* Sticky Filter Toolbar */}
          <div className="p-3 sm:p-4 bg-slate-900/60 border-b border-slate-800 flex flex-col gap-3">
            {/* Top Row: Search input and count */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={auditQuery}
                  onChange={(e) => {
                    setAuditQuery(e.target.value)
                    setAuditPagina(1)
                  }}
                  placeholder="Cerca per email, azione (LOGIN, ELIMINA, CREA), entità, IP o dettagli..."
                  className="w-full pl-9 pr-8 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                {auditQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuditQuery('')
                      setAuditPagina(1)
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                    title="Cancella filtro di ricerca"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-400">
                <span className="font-semibold text-slate-200 tabular-nums font-mono">
                  {auditLogsFiltrati.length}
                </span>
                <span>{auditLogsFiltrati.length === 1 ? 'evento trovato' : 'eventi trovati'}</span>
                {auditLogsFiltrati.length !== auditLogs.length && (
                  <span className="text-slate-500 text-[11px]">(su {auditLogs.length} totali)</span>
                )}
              </div>
            </div>

            {/* Bottom Row: Quick filters by Role & Category */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mr-1">
                <Filter className="h-3.5 w-3.5 text-slate-500" />
                <span>Ruolo:</span>
              </div>
              {(['tutti', 'admin', 'medico', 'segreteria', 'paziente'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setAuditFiltroRuolo(r)
                    setAuditPagina(1)
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                    auditFiltroRuolo === r
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {r === 'tutti' ? 'Tutti i ruoli' : r}
                </button>
              ))}

              <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mr-1">
                <span>Azione:</span>
              </div>
              <select
                value={auditFiltroCategoria}
                onChange={(e) => {
                  setAuditFiltroCategoria(e.target.value as any)
                  setAuditPagina(1)
                }}
                className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="tutte">Tutte le azioni</option>
                <option value="auth">Accessi & Autenticazione (LOGIN / LOGOUT)</option>
                <option value="creazione">Creazioni & Registrazioni</option>
                <option value="modifica">Modifiche & Aggiornamenti</option>
                <option value="eliminazione">Eliminazioni & Errori</option>
                <option value="clinica">Cartella Clinica & Pazienti</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="sticky top-0 bg-slate-900/95 border-b border-slate-800 text-slate-400 font-semibold text-[11px] backdrop-blur z-10">
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Data / Ora</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Attore</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Ruolo</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Azione</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Entità & Target</th>
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Indirizzo IP</th>
                  <th className="py-2.5 px-3.5 min-w-[200px]">Dettagli Evento</th>
                  <th className="py-2.5 px-3.5 text-right whitespace-nowrap">Ispezione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-normal">
                {loadingAudit ? (
                  <TableRowsSkeleton rows={8} cols={8} />
                ) : auditLogsPaginati.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <ShieldAlert className="h-6 w-6 text-slate-600 mb-1" />
                        <p className="text-sm font-semibold text-slate-400">Nessun evento registrato trovato</p>
                        <p className="text-xs text-slate-600">Prova a modificare i filtri di ricerca o la categoria selezionata.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  auditLogsPaginati.map((log, idx) => {
                    const isDanger = log.azione.includes('ELIMINAT') || log.azione.includes('FAILED') || log.azione.includes('DELETE')
                    const isSuccess = log.azione.includes('SUCCESS') || log.azione.includes('CREAT') || log.azione.includes('REGISTR')
                    const isWarning = log.azione.includes('MODIF') || log.azione.includes('UPDATE') || log.azione.includes('REVOCA')
                    const summary = formatAuditDetailsSummary(log)

                    return (
                      <tr
                        key={log.id}
                        className={`hover:bg-indigo-950/20 transition-colors ${idx % 2 === 1 ? 'bg-slate-900/30' : 'bg-transparent'}`}
                      >
                        {/* Data / Ora con tabular-nums font-mono */}
                        <td className="py-2.5 px-3.5 text-slate-300 font-mono text-[11px] tabular-nums whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('it-IT', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>

                        {/* Attore */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className="font-semibold text-white text-xs">{log.attoreEmail}</span>
                        </td>

                        {/* Ruolo */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border ${
                              log.ruolo === 'ADMIN'
                                ? 'bg-purple-950/60 text-purple-300 border-purple-800/80'
                                : log.ruolo === 'MEDICO'
                                ? 'bg-blue-950/60 text-blue-300 border-blue-800/80'
                                : log.ruolo === 'SEGRETERIA'
                                ? 'bg-amber-950/60 text-amber-300 border-amber-800/80'
                                : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                            }`}
                          >
                            {log.ruolo}
                          </span>
                        </td>

                        {/* Azione con badge semantico */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isDanger
                                ? 'bg-rose-950/70 text-rose-300 border-rose-800/80'
                                : isSuccess
                                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80'
                                : isWarning
                                ? 'bg-amber-950/70 text-amber-300 border-amber-800/80'
                                : 'bg-indigo-950/70 text-indigo-300 border-indigo-800/80'
                            }`}
                          >
                            {log.azione}
                          </span>
                        </td>

                        {/* Entità & Target */}
                        <td className="py-2.5 px-3.5 text-slate-300 text-xs whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-200">{log.entita}</span>
                            {log.entitaId && (
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1 rounded border border-slate-800" title={`ID Entità: ${log.entitaId}`}>
                                #{log.entitaId.slice(0, 8)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Indirizzo IP con tabular-nums font-mono */}
                        <td className="py-2.5 px-3.5 text-slate-400 font-mono text-[11px] tabular-nums whitespace-nowrap">
                          {log.ip || '—'}
                        </td>

                        {/* Dettagli sintetici leggibili */}
                        <td className="py-2.5 px-3.5 text-slate-400 text-xs max-w-xs">
                          <span className="truncate block" title={typeof log.dettagli === 'object' ? JSON.stringify(log.dettagli) : String(log.dettagli || '')}>
                            {summary}
                          </span>
                        </td>

                        {/* Tasto Ispezione / Dettagli */}
                        <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedAuditLog(log)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-colors text-xs font-semibold"
                          >
                            <Eye className="h-3 w-3 text-indigo-400" />
                            <span>Dettagli</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span>
                Mostrati <strong className="text-white font-mono">{auditLogsFiltrati.length === 0 ? 0 : indiceInizioAudit + 1}</strong> - <strong className="text-white font-mono">{Math.min(indiceInizioAudit + auditRighePerPagina, auditLogsFiltrati.length)}</strong> di <strong className="text-white font-mono">{auditLogsFiltrati.length}</strong>
              </span>

              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-slate-500">Righe:</span>
                <select
                  value={auditRighePerPagina}
                  onChange={(e) => {
                    setAuditRighePerPagina(Number(e.target.value))
                    setAuditPagina(1)
                  }}
                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs focus:outline-none cursor-pointer"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAuditPagina((p) => Math.max(1, p - 1))}
                disabled={auditPagina <= 1}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Precedente</span>
              </button>

              <span className="px-2 py-1 font-mono text-slate-300">
                Pag. <strong className="text-white">{auditPagina}</strong> / {totalePagineAudit}
              </span>

              <button
                type="button"
                onClick={() => setAuditPagina((p) => Math.min(totalePagineAudit, p + 1))}
                disabled={auditPagina >= totalePagineAudit}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <span>Successiva</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE: NUOVO STUDIO MEDICO */}
      {modalStudioOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 max-w-lg w-full space-y-5">
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Durata Visita (min)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={formStudio.durataVisita}
                    onChange={(e) => setFormStudio({ ...formStudio, durataVisita: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Lockup (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={formStudio.lockupMinutes}
                    onChange={(e) => setFormStudio({ ...formStudio, lockupMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Anticipo Max (gg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={formStudio.anticipoMax}
                    onChange={(e) => setFormStudio({ ...formStudio, anticipoMax: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* SEZIONE: MEDICO DI RIFERIMENTO CONTESTUALE */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-indigo-400 uppercase tracking-wider">
                    Medico di Riferimento dello Studio
                  </label>
                  <span className="text-[11px] text-slate-400">Opzionale o contestuale</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStudio({ ...formStudio, opzioneMedico: 'nessuno' })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      formStudio.opzioneMedico === 'nessuno'
                        ? 'border-indigo-500 bg-indigo-950/40 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold block text-xs">Invito / Codice</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Iscrizione autonoma</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormStudio({ ...formStudio, opzioneMedico: 'nuovo' })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      formStudio.opzioneMedico === 'nuovo'
                        ? 'border-indigo-500 bg-indigo-950/40 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold block text-xs">Crea Medico</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Nuovo profilo + agenda</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormStudio({ ...formStudio, opzioneMedico: 'esistente' })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      formStudio.opzioneMedico === 'esistente'
                        ? 'border-indigo-500 bg-indigo-950/40 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold block text-xs">Assegna Esistente</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Da medici registrati</span>
                  </button>
                </div>

                {/* Info auto-registrazione con Codice Studio */}
                {formStudio.opzioneMedico === 'nessuno' && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                    💡 Lo studio riceverà un <b>Codice Studio univoco</b>. Medici e collaboratori potranno registrarsi in totale autonomia inserendo il codice nella pagina di registrazione.
                  </div>
                )}

                {/* Form creazione nuovo medico contestuale */}
                {formStudio.opzioneMedico === 'nuovo' && (
                  <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 space-y-3">
                    <p className="text-[11px] text-indigo-300 font-medium">
                      Inserisci i dettagli del medico: verrà creato l'account e generata l'agenda di disponibilità per i prossimi 30 giorni.
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Nome Medico *</label>
                        <input
                          type="text"
                          required={formStudio.opzioneMedico === 'nuovo'}
                          placeholder="Es. Mario"
                          value={formStudio.nomeMedico}
                          onChange={(e) => setFormStudio({ ...formStudio, nomeMedico: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Cognome Medico *</label>
                        <input
                          type="text"
                          required={formStudio.opzioneMedico === 'nuovo'}
                          placeholder="Es. Rossi"
                          value={formStudio.cognomeMedico}
                          onChange={(e) => setFormStudio({ ...formStudio, cognomeMedico: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Email Medico *</label>
                        <input
                          type="email"
                          required={formStudio.opzioneMedico === 'nuovo'}
                          placeholder="Es. dott.rossi@studio.it"
                          value={formStudio.emailMedico}
                          onChange={(e) => setFormStudio({ ...formStudio, emailMedico: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Telefono Primario</label>
                        <input
                          type="text"
                          placeholder="Es. +39 333 1234567"
                          value={formStudio.telefonoMedico}
                          onChange={(e) => setFormStudio({ ...formStudio, telefonoMedico: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Password Iniziale Medico (opzionale, default: Medico2026!)
                      </label>
                      <input
                        type="text"
                        placeholder="Lascia vuoto per default: Medico2026!"
                        value={formStudio.passwordMedico}
                        onChange={(e) => setFormStudio({ ...formStudio, passwordMedico: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* Selezione medico esistente */}
                {formStudio.opzioneMedico === 'esistente' && (
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-300">
                      Seleziona Medico da associare allo studio:
                    </label>
                    {mediciList.length === 0 ? (
                      <p className="text-[11px] text-amber-400">Nessun medico esistente disponibile nel sistema.</p>
                    ) : (
                      <select
                        value={formStudio.assegnaMedicoId}
                        onChange={(e) => setFormStudio({ ...formStudio, assegnaMedicoId: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">-- Seleziona un medico --</option>
                        {mediciList.map((m) => (
                          <option key={m.id} value={m.id}>
                            Dott. {m.nome} {m.cognome} ({m.email})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
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
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 max-w-lg w-full space-y-5">
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
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 max-w-lg w-full space-y-5">
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
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 max-w-2xl w-full space-y-5 max-h-[90vh] overflow-y-auto">
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

      {/* MODALE: MODIFICA STUDIO MEDICO */}
      {modalEditStudioOpen && studioInModifica && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-400" />
                Modifica Studio Medico
              </h3>
              <button
                onClick={() => {
                  setModalEditStudioOpen(false)
                  setStudioInModifica(null)
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSalvaModificaStudio} className="space-y-4 text-xs">
              {/* Badge Codice Studio */}
              {studioInModifica.codiceStudio && (
                <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider">
                      Codice Invito Studio
                    </span>
                    <span className="font-mono text-xs font-black text-white">
                      {studioInModifica.codiceStudio}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copiaTesto(studioInModifica.codiceStudio!, 'edit-studio-code')}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-700/60 text-indigo-200 text-[11px] font-semibold flex items-center gap-1.5 transition-all"
                  >
                    {copiatoId === 'edit-studio-code' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copiato</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copia</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Nome Studio Medico *
                </label>
                <input
                  type="text"
                  required
                  value={formEditStudio.nome}
                  onChange={(e) => setFormEditStudio({ ...formEditStudio, nome: e.target.value })}
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
                    value={formEditStudio.citta}
                    onChange={(e) => setFormEditStudio({ ...formEditStudio, citta: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Indirizzo
                  </label>
                  <input
                    type="text"
                    value={formEditStudio.indirizzo}
                    onChange={(e) => setFormEditStudio({ ...formEditStudio, indirizzo: e.target.value })}
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
                    value={formEditStudio.telefono}
                    onChange={(e) => setFormEditStudio({ ...formEditStudio, telefono: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Email Studio
                  </label>
                  <input
                    type="email"
                    value={formEditStudio.email}
                    onChange={(e) => setFormEditStudio({ ...formEditStudio, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Durata Visita (min)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={formEditStudio.durataVisita}
                    onChange={(e) => setFormEditStudio({ ...formEditStudio, durataVisita: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Lockup (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={formEditStudio.lockupMinutes}
                    onChange={(e) => setFormEditStudio({ ...formEditStudio, lockupMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Anticipo Max (gg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={formEditStudio.anticipoMax}
                    onChange={(e) => setFormEditStudio({ ...formEditStudio, anticipoMax: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setModalEditStudioOpen(false)
                    setStudioInModifica(null)
                  }}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
                >
                  Salva Modifiche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE: MODIFICA MEDICO */}
      {modalEditMedicoOpen && medicoInModifica && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-400" />
                Modifica Dati Medico
              </h3>
              <button
                onClick={() => {
                  setModalEditMedicoOpen(false)
                  setMedicoInModifica(null)
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSalvaModificaMedico} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Studio Medico di Appartenenza *
                </label>
                <select
                  required
                  value={formEditMedico.studioId}
                  onChange={(e) => setFormEditMedico({ ...formEditMedico, studioId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {studiList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome} ({s.indirizzo || 'N/D'})
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
                    value={formEditMedico.nome}
                    onChange={(e) => setFormEditMedico({ ...formEditMedico, nome: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Cognome *
                  </label>
                  <input
                    type="text"
                    required
                    value={formEditMedico.cognome}
                    onChange={(e) => setFormEditMedico({ ...formEditMedico, cognome: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Email Professionale *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEditMedico.email}
                    onChange={(e) => setFormEditMedico({ ...formEditMedico, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Telefono Primario
                  </label>
                  <input
                    type="text"
                    value={formEditMedico.telefono}
                    onChange={(e) => setFormEditMedico({ ...formEditMedico, telefono: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setModalEditMedicoOpen(false)
                    setMedicoInModifica(null)
                  }}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
                >
                  Salva Modifiche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE: MODIFICA OPERATORE STAFF */}
      {modalEditStaffOpen && staffInModifica && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 max-w-lg w-full space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-amber-400" />
                Modifica Operatore Segreteria
              </h3>
              <button
                onClick={() => {
                  setModalEditStaffOpen(false)
                  setStaffInModifica(null)
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSalvaModificaStaff} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Studio Medico *
                </label>
                <select
                  required
                  value={formEditStaff.studioId}
                  onChange={(e) => setFormEditStaff({ ...formEditStaff, studioId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {studiList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome} ({s.indirizzo || 'N/D'})
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
                    value={formEditStaff.nome}
                    onChange={(e) => setFormEditStaff({ ...formEditStaff, nome: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Cognome *
                  </label>
                  <input
                    type="text"
                    required
                    value={formEditStaff.cognome}
                    onChange={(e) => setFormEditStaff({ ...formEditStaff, cognome: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Email Operatore *
                </label>
                <input
                  type="email"
                  required
                  value={formEditStaff.email}
                  onChange={(e) => setFormEditStaff({ ...formEditStaff, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Selezione Multi-medico per lo staff */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block font-bold text-slate-300 uppercase tracking-wider">
                  Medici Assegnati a questo operatore:
                </label>
                <p className="text-[11px] text-slate-400">
                  L'operatore potrà accedere alla sala d'attesa, messaggi e ricette solo dei medici selezionati.
                </p>

                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-900 rounded-xl border border-slate-800">
                  {mediciList
                    .filter((m) => !formEditStaff.studioId || m.studioId === formEditStaff.studioId)
                    .map((m) => {
                      const isChecked = formEditStaff.mediciIds.includes(m.id)
                      return (
                        <label
                          key={m.id}
                          className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all ${
                            isChecked ? 'bg-indigo-950/60 border border-indigo-700/60 text-white' : 'hover:bg-slate-800/60 text-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleMedicoEditStaff(m.id)}
                            className="h-4 w-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
                          />
                          <span className="font-semibold text-xs truncate">
                            Dott. {m.nome} {m.cognome} ({m.email})
                          </span>
                        </label>
                      )
                    })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setModalEditStaffOpen(false)
                    setStaffInModifica(null)
                  }}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md shadow-amber-600/20"
                >
                  Salva Modifiche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE: DETTAGLI AUDIT LOG */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 sm:p-6 max-w-2xl w-full space-y-4 max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Dettaglio Evento Audit #{selectedAuditLog.id.slice(0, 8)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditLog(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1">
              {/* Griglia Metadati */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block font-medium">Data & Ora Registrazione</span>
                  <span className="font-mono text-slate-200 tabular-nums font-semibold">
                    {new Date(selectedAuditLog.createdAt).toLocaleString('it-IT', {
                      dateStyle: 'full',
                      timeStyle: 'medium',
                    })}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block font-medium">Indirizzo IP Connessione</span>
                  <span className="font-mono text-slate-200 tabular-nums">
                    {selectedAuditLog.ip || 'Non rilevato'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block font-medium">Attore Operazione</span>
                  <span className="text-white font-semibold">{selectedAuditLog.attoreEmail}</span>
                </div>

                <div>
                  <span className="text-slate-500 block font-medium">Ruolo e Privilegi</span>
                  <span className="font-mono text-indigo-300 font-bold uppercase">{selectedAuditLog.ruolo}</span>
                </div>

                <div>
                  <span className="text-slate-500 block font-medium">Azione Eseguita</span>
                  <span className="font-mono text-white font-bold">{selectedAuditLog.azione}</span>
                </div>

                <div>
                  <span className="text-slate-500 block font-medium">Entità Coinvolta</span>
                  <span className="text-slate-200 font-medium">
                    {selectedAuditLog.entita} {selectedAuditLog.entitaId ? `(ID: ${selectedAuditLog.entitaId})` : ''}
                  </span>
                </div>
              </div>

              {/* Payload JSON */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Payload Dati Evento (JSON)</span>
                  <button
                    type="button"
                    onClick={() => copiaJsonLog(selectedAuditLog)}
                    className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 font-semibold transition-colors"
                  >
                    {jsonCopiato ? '✓ Copiato negli appunti' : 'Copia JSON'}
                  </button>
                </div>

                <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-64 whitespace-pre-wrap leading-relaxed">
                  {selectedAuditLog.dettagli ? JSON.stringify(selectedAuditLog.dettagli, null, 2) : '{\n  "messaggio": "Nessun payload aggiuntivo"\n}'}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedAuditLog(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE: ACCESSO DI EMERGENZA (ADR-006) */}
      {modalEmergencyOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Key className="h-5 w-5" />
                <h3 className="text-base font-bold text-white">Accesso di Emergenza (ADR-006)</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalEmergencyOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Genera un codice monouso valido per 1 ora per ripristinare l'accesso ai sistemi in caso di guasto o indisponibilità dell'operatore autorizzato.
              </p>
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/60 text-xs text-amber-200">
                Tutti i codici di emergenza generati e utilizzati vengono registrati in modo permanente nel log di audit.
              </div>

              {emergencyCode && (
                <div className="p-4 rounded-lg bg-amber-950/40 border border-amber-800 text-center space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Codice Monouso Generato</p>
                  <p className="font-mono text-lg font-black text-white tracking-widest select-all">{emergencyCode}</p>
                  <p className="text-[10px] text-slate-400">Valido per 60 minuti dalla generazione</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setModalEmergencyOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Chiudi
              </button>
              <button
                type="button"
                onClick={handleGenerateEmergencyCode}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Key className="h-4 w-4" />
                <span>{generato ? 'Codice Registrato in Audit!' : 'Genera Recovery Code'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Conferma Eliminazione Non Bloccante */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        title={
          confirmDelete?.type === 'studio'
            ? 'Eliminare lo Studio Medico?'
            : confirmDelete?.type === 'medico'
            ? 'Eliminare il Medico Curante?'
            : 'Eliminare l\'Operatore di Segreteria?'
        }
        description={`Sei sicuro di voler eliminare definitivamente "${confirmDelete?.name}"? ${confirmDelete?.details || ''}`}
        confirmText="Elimina definitivamente"
        cancelText="Annulla"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleConfermaEliminazione}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  )
}
