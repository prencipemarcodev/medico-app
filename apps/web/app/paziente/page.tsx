'use client'

/**
 * @file        page.tsx
 * @module      @medico/web/paziente
 * @description Home dashboard paziente: associazione studio (codice/operatore), visite, e cartella clinica condivisa con appunti sanitari
 * @author      Agent-1 | Session: 2026-09-13
 * @version     0.3.0
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
  Building2,
  Copy,
  Check,
  RefreshCw,
  FolderLock,
  FileUp,
  Paperclip,
  Trash2,
  Tag,
  ShieldCheck,
  UserCheck,
  Activity,
  AlertTriangle,
  FileCheck,
  Loader2,
} from 'lucide-react'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/toast'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { Skeleton, DocumentCardSkeleton } from '@/components/ui/skeleton'

interface DocumentoItem {
  id: string
  pazienteId: string
  studioId: string | null
  titolo: string
  categoria: 'referto' | 'esame' | 'ricetta' | 'terapia' | 'allergia' | 'appunto'
  note: string | null
  fileUrl: string | null
  fileName: string | null
  fileType: string | null
  fileSize: number | null
  autoreRuolo: string
  autoreId: string
  createdAt: string
}

interface MedicoStudio {
  id: string
  nome: string
  cognome: string
  specializzazione?: string | null
}

export default function PazientePage() {
  const toast = useToast()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [studioInfo, setStudioInfo] = useState<any>(null)
  const [mediciStudio, setMediciStudio] = useState<MedicoStudio[]>([])
  const [loadingUser, setLoadingUser] = useState(true)

  // Modale Password Temporanea
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false)
  const [nuovaPassword, setNuovaPassword] = useState('')
  const [confermaPassword, setConfermaPassword] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string>>({})
  const [savingPassword, setSavingPassword] = useState(false)

  // Sezione Associazione Studio (quando studioId è assente)
  const [codiceStudioInput, setCodiceStudioInput] = useState('')
  const [verificandoStudio, setVerificandoStudio] = useState(false)
  const [studioTrovato, setStudioTrovato] = useState<any>(null)
  const [mediciTrovati, setMediciTrovati] = useState<MedicoStudio[]>([])
  const [medicoSelezionatoId, setMedicoSelezionatoId] = useState('')
  const [associandoStudio, setAssociandoStudio] = useState(false)
  const [erroreAssociazione, setErroreAssociazione] = useState<string | null>(null)
  const [successoAssociazione, setSuccessoAssociazione] = useState<string | null>(null)
  const [cfCopiato, setCfCopiato] = useState(false)
  const [ricaricandoStato, setRicaricandoStato] = useState(false)

  // Sezione Cartella Clinica & Appunti Sanitari
  const [documenti, setDocumenti] = useState<DocumentoItem[]>([])
  const [caricamentoDocs, setCaricamentoDocs] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState<string>('tutti')
  const [modalDocOpen, setModalDocOpen] = useState(false)
  const [docTitolo, setDocTitolo] = useState('')
  const [docCategoria, setDocCategoria] = useState<
    'referto' | 'esame' | 'ricetta' | 'terapia' | 'allergia' | 'appunto'
  >('referto')
  const [docNote, setDocNote] = useState('')
  const [docFileName, setDocFileName] = useState('')
  const [docFileType, setDocFileType] = useState('')
  const [docFileSize, setDocFileSize] = useState<number | null>(null)
  const [docFileUrl, setDocFileUrl] = useState('')
  const [salvandoDoc, setSalvandoDoc] = useState(false)
  const [erroreDoc, setErroreDoc] = useState<string | null>(null)
  const [docFieldErrors, setDocFieldErrors] = useState<Record<string, string>>({})

  // Modale di conferma eliminazione documento
  const [docToDelete, setDocToDelete] = useState<DocumentoItem | null>(null)
  const [eliminandoDoc, setEliminandoDoc] = useState(false)

  // Visite e Richieste simulate
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

  // Carica stato utente e studio
  const fetchDatiUtente = async () => {
    try {
      const r = await fetch('/api/auth/me')
      const d = await r.json()
      if (d.authenticated && d.user) {
        setCurrentUser(d.user)
        setStudioInfo(d.studio || null)
        setMediciStudio(d.medici || [])
      }
    } catch (err) {
      console.error('Errore recupero sessione:', err)
    } finally {
      setLoadingUser(false)
    }
  }

  // Carica documenti clinici
  const fetchDocumenti = async () => {
    setCaricamentoDocs(true)
    try {
      const res = await fetch('/api/pazienti/documenti')
      const data = await res.json()
      if (data.success) {
        setDocumenti(data.documenti || [])
      }
    } catch (err) {
      console.error('Errore recupero documenti:', err)
    } finally {
      setCaricamentoDocs(false)
    }
  }

  useEffect(() => {
    fetchDatiUtente()
    fetchDocumenti()
  }, [])

  // Verifica Codice Studio
  const handleVerificaCodiceStudio = async (e: React.FormEvent) => {
    e.preventDefault()
    setErroreAssociazione(null)
    setSuccessoAssociazione(null)
    setStudioTrovato(null)
    setMediciTrovati([])

    if (!codiceStudioInput.trim()) {
      setErroreAssociazione('Inserisci un codice studio valido')
      toast.warning('Codice mancante', 'Inserisci il codice dello studio prima di verificare')
      return
    }

    setVerificandoStudio(true)
    try {
      const res = await fetch(
        `/api/pazienti/associa-studio?codiceStudio=${encodeURIComponent(codiceStudioInput.trim())}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Studio medico non trovato con questo codice')

      setStudioTrovato(data.studio)
      setMediciTrovati(data.medici || [])
      if (data.medici?.length > 0) {
        setMedicoSelezionatoId(data.medici[0]?.id || '')
      }
      toast.success('Studio trovato!', `Seleziona il tuo medico per ${data.studio?.nome}`)
    } catch (err: any) {
      const msg = err.message || 'Studio non trovato'
      setErroreAssociazione(msg)
      toast.error('Verifica fallita', msg)
    } finally {
      setVerificandoStudio(false)
    }
  }

  // Conferma Associazione Studio
  const handleConfermaAssociazione = async () => {
    if (!studioTrovato || !medicoSelezionatoId) {
      setErroreAssociazione('Seleziona il tuo medico curante per completare l\'associazione')
      toast.warning('Selezione richiesta', 'Scegli il medico curante dall\'elenco')
      return
    }

    setAssociandoStudio(true)
    setErroreAssociazione(null)

    try {
      const res = await fetch('/api/pazienti/associa-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codiceStudio: codiceStudioInput.trim(),
          medicoId: medicoSelezionatoId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore durante l\'associazione')

      const successMsg = `Profilo collegato con successo allo studio ${data.studio?.nome || ''}!`
      setSuccessoAssociazione(successMsg)
      toast.success('Associazione completata!', successMsg)
      setCurrentUser(data.paziente)
      await fetchDatiUtente()
      await fetchDocumenti()
    } catch (err: any) {
      const msg = err.message || 'Errore durante l\'associazione'
      setErroreAssociazione(msg)
      toast.error('Associazione fallita', msg)
    } finally {
      setAssociandoStudio(false)
    }
  }

  // Verifica Manuale Stato Associazione (se operatore l'ha fatto)
  const handleVerificaManuale = async () => {
    setRicaricandoStato(true)
    await fetchDatiUtente()
    await fetchDocumenti()
    setRicaricandoStato(false)
    toast.info('Stato sincronizzato', 'Dati profilo aggiornati dal database')
  }

  // Copia Codice Fiscale
  const handleCopiaCf = () => {
    if (currentUser?.codiceFiscale) {
      navigator.clipboard.writeText(currentUser.codiceFiscale)
      setCfCopiato(true)
      toast.success('Codice Fiscale copiato', currentUser.codiceFiscale)
      setTimeout(() => setCfCopiato(false), 2500)
    }
  }

  // Salvataggio Documento / Appunto
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDocFileName(file.name)
      setDocFileType(file.type || 'application/octet-stream')
      setDocFileSize(file.size)

      // Lettura base64 per anteprima e persistenza rapida
      const reader = new FileReader()
      reader.onload = () => {
        setDocFileUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
      if (docFieldErrors.file) {
        setDocFieldErrors((prev) => {
          const updated = { ...prev }
          delete updated.file
          return updated
        })
      }
    }
  }

  const handleSalvaDocumento = async (e: React.FormEvent) => {
    e.preventDefault()
    setErroreDoc(null)

    if (!docTitolo.trim()) {
      setDocFieldErrors({ titolo: 'Il titolo del documento o appunto è obbligatorio' })
      toast.warning('Campo obbligatorio', 'Inserisci il titolo del documento prima di salvare')
      return
    }

    setSalvandoDoc(true)
    try {
      const res = await fetch('/api/pazienti/documenti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
      if (!res.ok) throw new Error(data.error || 'Errore salvataggio documento')

      // Reset form
      setDocTitolo('')
      setDocCategoria('referto')
      setDocNote('')
      setDocFileName('')
      setDocFileType('')
      setDocFileSize(null)
      setDocFileUrl('')
      setDocFieldErrors({})
      setModalDocOpen(false)

      toast.success('Documento salvato!', 'Aggiunto con successo alla tua cartella clinica')
      // Ricarica documenti
      await fetchDocumenti()
    } catch (err: any) {
      const msg = err.message || 'Errore salvataggio documento'
      setErroreDoc(msg)
      toast.error('Salvataggio fallito', msg)
    } finally {
      setSalvandoDoc(false)
    }
  }

  // Esecuzione eliminazione documento confermata dalla modale
  const eseguiEliminazioneDocumento = async () => {
    if (!docToDelete) return

    setEliminandoDoc(true)
    try {
      const res = await fetch(`/api/pazienti/documenti?id=${docToDelete.id}`, { method: 'DELETE' })
      if (res.ok) {
        setDocumenti((prev) => prev.filter((d) => d.id !== docToDelete.id))
        toast.success('Documento eliminato', `"${docToDelete.titolo}" è stato rimosso dalla cartella clinica`)
        setDocToDelete(null)
      } else {
        const err = await res.json()
        toast.error('Errore eliminazione', err.error || 'Impossibile eliminare il documento')
      }
    } catch (err: any) {
      toast.error('Errore di connessione', err.message)
    } finally {
      setEliminandoDoc(false)
    }
  }

  // Cambio Password
  const handleCambiaPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordFieldErrors({})

    const errs: Record<string, string> = {}
    if (nuovaPassword.length < 6) {
      errs.nuova = 'La password deve contenere almeno 6 caratteri'
    }
    if (nuovaPassword !== confermaPassword) {
      errs.conferma = 'Le due password non corrispondono'
    }

    if (Object.keys(errs).length > 0) {
      setPasswordFieldErrors(errs)
      toast.warning('Dati non validi', 'Correggi i campi evidenziati in rosso')
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
      toast.success('Password aggiornata!', 'La tua password personale è stata salvata con successo')
      setCurrentUser({ ...currentUser, primoAccesso: false })
      setTimeout(() => {
        setModalPasswordOpen(false)
        setPasswordSuccess(false)
      }, 1500)
    } catch (err: any) {
      const msg = err.message || 'Errore durante il cambio password'
      setPasswordError(msg)
      toast.error('Errore cambio password', msg)
    } finally {
      setSavingPassword(false)
    }
  }

  // Filtro Documenti
  const documentiFiltrati = documenti.filter((d) => {
    if (filtroCategoria === 'tutti') return true
    if (filtroCategoria === 'referti_esami') return d.categoria === 'referto' || d.categoria === 'esame'
    if (filtroCategoria === 'terapie_ricette') return d.categoria === 'terapia' || d.categoria === 'ricetta'
    if (filtroCategoria === 'allergie') return d.categoria === 'allergia'
    if (filtroCategoria === 'appunti') return d.categoria === 'appunto'
    return d.categoria === filtroCategoria
  })

  // Ricerca nome medico curante assegnato
  const medicoCurante = mediciStudio.find((m) => m.id === currentUser?.medicoId)

  if (loadingUser) {
    return (
      <div className="space-y-8 font-sans">
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-48 rounded-lg" />
              <Skeleton className="h-4 w-72 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <Skeleton className="h-6 w-36 rounded-lg" />
              <Skeleton className="h-28 w-full rounded-2xl" />
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <Skeleton className="h-6 w-40 rounded-lg" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <Skeleton className="h-6 w-60 rounded-lg" />
          <DocumentCardSkeleton count={2} />
        </div>
      </div>
    )
  }

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

      {/* STATO 1: PAZIENTE NON ANCORA ASSOCIATO A UNO STUDIO MEDICO */}
      {!currentUser?.studioId && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/90 shadow-lg shadow-amber-500/5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 pb-5">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-amber-500/20">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200 inline-block mb-1.5">
                  ● Configurazione Iniziale Richiesta
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Collega il tuo profilo al tuo Studio Medico
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Benvenuto, <strong>{currentUser?.nome} {currentUser?.cognome}</strong>. Per prenotare visite e condividere referti, completa l&apos;associazione.
                </p>
              </div>
            </div>

            <button
              onClick={handleVerificaManuale}
              disabled={ricaricandoStato}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all self-start sm:self-auto"
              title="Controlla se la segreteria o il medico ti ha appena inserito"
            >
              <RefreshCw className={`h-4 w-4 text-slate-500 ${ricaricandoStato ? 'animate-spin' : ''}`} />
              <span>{ricaricandoStato ? 'Verifica in corso...' : 'Verifica Aggiornamenti'}</span>
            </button>
          </div>

          {successoAssociazione && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{successoAssociazione}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Opzione 1: Hai un Codice Studio */}
            <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Hai un Codice Studio Medico?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Inserisci il codice fornito dal tuo medico o dalla segreteria (es. <em>SM-2026-A1</em>).
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerificaCodiceStudio} className="space-y-3 pt-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Es. SM-2026-A1"
                      value={codiceStudioInput}
                      onChange={(e) => {
                        setCodiceStudioInput(e.target.value.toUpperCase())
                        if (erroreAssociazione) setErroreAssociazione(null)
                      }}
                      className={`w-full px-4 py-2.5 rounded-xl border uppercase font-mono font-bold text-xs text-slate-900 focus:outline-none transition-all ${
                        erroreAssociazione
                          ? 'border-rose-500 bg-rose-50/20 focus:ring-2 focus:ring-rose-500/20 pr-10'
                          : 'border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white'
                      }`}
                    />
                    {erroreAssociazione && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500 pointer-events-none" />
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={verificandoStudio}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                  >
                    {verificandoStudio ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      'Cerca'
                    )}
                  </button>
                </div>

                {erroreAssociazione && (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{erroreAssociazione}</span>
                  </p>
                )}
              </form>

              {/* Risultato Studio Trovato */}
              {studioTrovato && (
                <div className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-black text-sm text-slate-900">{studioTrovato.nome}</h4>
                      <p className="text-[11px] text-slate-500">
                        {studioTrovato.indirizzo || 'Studio Medico'}
                        {studioTrovato.telefono ? ` • Tel. ${studioTrovato.telefono}` : ''}
                      </p>
                    </div>
                  </div>

                  {mediciTrovati.length > 0 ? (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <label className="block text-[11px] font-bold uppercase text-slate-600 tracking-wider">
                        Seleziona il tuo Medico Curante *:
                      </label>
                      <select
                        value={medicoSelezionatoId}
                        onChange={(e) => setMedicoSelezionatoId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {mediciTrovati.map((m) => (
                          <option key={m.id} value={m.id}>
                            Dott. {m.nome} {m.cognome} {m.specializzazione ? `(${m.specializzazione})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-600 font-medium pt-2 border-t border-slate-100">
                      Nessun medico attualmente attivo in questo studio.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleConfermaAssociazione}
                    disabled={associandoStudio || !medicoSelezionatoId}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {associandoStudio ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Collegamento in corso...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Conferma Associazione allo Studio</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Opzione 2: In attesa di inserimento da parte dello studio */}
            <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      In attesa dell&apos;operatore dello studio?
                    </h3>
                    <p className="text-xs text-slate-500">
                      Se ti trovi allo studio o sei in contatto col medico, possono inserirti direttamente.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                    Il tuo Codice Fiscale da comunicare allo studio:
                  </span>
                  <div className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-mono font-black text-base text-indigo-700 tracking-wider">
                      {currentUser?.codiceFiscale || 'NON DISPONIBILE'}
                    </span>
                    <button
                      onClick={handleCopiaCf}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        cfCopiato
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {cfCopiato ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Copiato!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copia
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  L&apos;operatore (Dottore, Segretario o Admin) utilizzerà il tuo Codice Fiscale per abbinare la tua cartella al gestionale. Non appena l&apos;operazione sarà completata, la tua dashboard si sbloccherà automaticamente!
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleVerificaManuale}
                  disabled={ricaricandoStato}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${ricaricandoStato ? 'animate-spin' : ''}`} />
                  <span>Verifica se lo studio ti ha associato</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATO 2: PAZIENTE ASSOCIATO ALLO STUDIO MEDICO */}
      {currentUser?.studioId && (
        <>
          {/* Banner Medico Curante */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 md:p-8 text-white shadow-lg shadow-emerald-600/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start md:items-center gap-5">
              <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white font-bold text-xl shadow-inner">
                {medicoCurante ? `${medicoCurante.nome[0]}${medicoCurante.cognome[0]}` : 'MC'}
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-200 mb-1">
                  <span>Il Tuo Medico di Medicina Generale</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight">
                  {medicoCurante
                    ? `Dott. ${medicoCurante.nome} ${medicoCurante.cognome}`
                    : 'Dottore Curante Assegnato'}
                </h1>
                <p className="text-xs text-emerald-100 mt-1 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />{' '}
                    {studioInfo?.nome || currentUser?.nomeStudio || 'Studio Medico'}
                  </span>
                  {studioInfo?.indirizzo && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {studioInfo.indirizzo}
                    </span>
                  )}
                  {studioInfo?.telefono && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> {studioInfo.telefono}
                    </span>
                  )}
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

            {/* Right Column: Richieste Speciali & Farmaci */}
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
        </>
      )}

      {/* SEZIONE: CARTELLA CLINICA & APPUNTI SANITARI CONDIVISI */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
              <FolderLock className="h-4 w-4 text-emerald-600" />
              <span>Dossier Sanitario Personale & Condiviso</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Cartella Clinica & Appunti Sanitari
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              I documenti, referti ed appunti caricati qui sono crittografati e visibili{' '}
              <strong>esclusivamente a te, al tuo medico curante e alla segreteria</strong> dell&apos;unico studio medico associato.
            </p>
          </div>

          <button
            onClick={() => {
              setErroreDoc(null)
              setModalDocOpen(true)
            }}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm shadow-emerald-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Aggiungi Documento o Appunto</span>
          </button>
        </div>

        {/* Filtri per categoria */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'tutti', label: 'Tutti' },
            { id: 'referti_esami', label: 'Referti & Esami' },
            { id: 'terapie_ricette', label: 'Terapie & Farmaci' },
            { id: 'allergie', label: 'Allergie & Intolleranze' },
            { id: 'appunti', label: 'Appunti & Sintomi' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltroCategoria(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filtroCategoria === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lista Documenti e Appunti */}
        {caricamentoDocs ? (
          <DocumentCardSkeleton count={4} />
        ) : documentiFiltrati.length === 0 ? (
          <div className="p-10 text-center bg-slate-50/60 rounded-3xl border border-dashed border-slate-200 space-y-3">
            <FileText className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-sm text-slate-700">Nessun documento o appunto clinico</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Puoi caricare referti PDF, esami di laboratorio, segnalare allergie o annotare sintomi che vuoi sottoporre al tuo medico.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setErroreDoc(null)
                  setModalDocOpen(true)
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <Plus className="h-4 w-4" /> Aggiungi adesso
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentiFiltrati.map((doc) => {
              const isPaziente = doc.autoreRuolo === 'paziente'
              const badgeColore =
                doc.categoria === 'referto'
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : doc.categoria === 'esame'
                  ? 'bg-purple-100 text-purple-800 border-purple-200'
                  : doc.categoria === 'terapia'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : doc.categoria === 'allergia'
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200'

              return (
                <div
                  key={doc.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${badgeColore}`}
                      >
                        {doc.categoria}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-slate-400">
                          {new Date(doc.createdAt).toLocaleDateString('it-IT', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <button
                          onClick={() => setDocToDelete(doc)}
                          title="Elimina"
                          className="text-slate-300 hover:text-rose-600 p-1 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900">{doc.titolo}</h4>

                    {doc.note && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                        {doc.note}
                      </p>
                    )}

                    {doc.fileName && (
                      <div className="p-2.5 rounded-xl bg-slate-100/70 border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <Paperclip className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                          <span className="font-semibold text-slate-700 truncate">
                            {doc.fileName}
                          </span>
                        </div>
                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            download={doc.fileName}
                            className="p-1 text-emerald-700 hover:text-emerald-900 font-bold"
                            title="Scarica allegato"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-400">
                      Autore: {isPaziente ? 'Tu (Paziente)' : `Studio Medico (${doc.autoreRuolo})`}
                    </span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Condiviso con studio
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Aggiungi Documento / Appunto Clinico */}
      {modalDocOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FolderLock className="h-4 w-4 text-emerald-600" />
                Aggiungi alla Cartella Clinica
              </h3>
              <button
                onClick={() => setModalDocOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSalvaDocumento} className="space-y-4 text-xs">
              {erroreDoc && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                  {erroreDoc}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Titolo *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Es. Esami del sangue Febbraio 2026, Allergia a Penicillina..."
                    value={docTitolo}
                    onChange={(e) => {
                      setDocTitolo(e.target.value)
                      if (docFieldErrors.titolo) setDocFieldErrors((prev) => ({ ...prev, titolo: '' }))
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold text-slate-900 focus:outline-none transition-all ${
                      docFieldErrors.titolo
                        ? 'border-rose-500 bg-rose-50/20 focus:ring-2 focus:ring-rose-500/20 pr-10'
                        : 'border-slate-200 focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />
                  {docFieldErrors.titolo && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500 pointer-events-none" />
                  )}
                </div>
                {docFieldErrors.titolo && (
                  <p className="mt-1 text-[11px] text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{docFieldErrors.titolo}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Categoria Clinica *
                </label>
                <select
                  value={docCategoria}
                  onChange={(e) => setDocCategoria(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="referto">Referto Medico / Specialistico</option>
                  <option value="esame">Esame di Laboratorio / Diagnostica</option>
                  <option value="terapia">Terapia Farmacologica / Dosaggio</option>
                  <option value="ricetta">Ricetta o Prescrizione Precedente</option>
                  <option value="allergia">Allergia / Intolleranza Farmaco</option>
                  <option value="appunto">Appunto Clinico / Sintomi Avvertiti</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Note & Sintomi Dettagliati
                </label>
                <textarea
                  rows={3}
                  placeholder="Scrivi qui eventuali dettagli, sintomi avvertiti, reazioni o domande per il medico..."
                  value={docNote}
                  onChange={(e) => setDocNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Allegato (PDF, Immagine, Referto)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {docFileName && (
                  <p className="mt-1 text-[11px] text-emerald-600 font-semibold">
                    File selezionato: {docFileName} ({(Number(docFileSize || 0) / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalDocOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={salvandoDoc}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2"
                >
                  {salvandoDoc ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Salvataggio...</span>
                    </>
                  ) : (
                    'Salva nella Cartella'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Personalizzazione Password */}
      {modalPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-600" />
                Personalizza Password Personale
              </h3>
              <button
                onClick={() => setModalPasswordOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
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
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="Nuova password personale"
                      value={nuovaPassword}
                      onChange={(e) => {
                        setNuovaPassword(e.target.value)
                        if (passwordFieldErrors.nuova) setPasswordFieldErrors((prev) => ({ ...prev, nuova: '' }))
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold text-slate-900 focus:outline-none transition-all ${
                        passwordFieldErrors.nuova
                          ? 'border-rose-500 bg-rose-50/20 focus:ring-2 focus:ring-rose-500/20 pr-10'
                          : 'border-slate-200 focus:ring-2 focus:ring-amber-500'
                      }`}
                    />
                    {passwordFieldErrors.nuova && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500 pointer-events-none" />
                    )}
                  </div>
                  {passwordFieldErrors.nuova && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{passwordFieldErrors.nuova}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Conferma Nuova Password *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="Ripeti la nuova password"
                      value={confermaPassword}
                      onChange={(e) => {
                        setConfermaPassword(e.target.value)
                        if (passwordFieldErrors.conferma) setPasswordFieldErrors((prev) => ({ ...prev, conferma: '' }))
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold text-slate-900 focus:outline-none transition-all ${
                        passwordFieldErrors.conferma
                          ? 'border-rose-500 bg-rose-50/20 focus:ring-2 focus:ring-rose-500/20 pr-10'
                          : 'border-slate-200 focus:ring-2 focus:ring-amber-500'
                      }`}
                    />
                    {passwordFieldErrors.conferma && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-500 pointer-events-none" />
                    )}
                  </div>
                  {passwordFieldErrors.conferma && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{passwordFieldErrors.conferma}</span>
                    </p>
                  )}
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
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md shadow-amber-600/20 flex items-center gap-2"
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Salvataggio...</span>
                      </>
                    ) : (
                      'Salva Nuova Password'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Conferma Eliminazione Documento */}
      <ConfirmModal
        isOpen={!!docToDelete}
        title="Eliminare questo documento?"
        message={`Sei sicuro di voler eliminare definitivamente "${docToDelete?.titolo}" dalla tua cartella clinica? Questa azione non può essere annullata.`}
        confirmText="Elimina definitivamente"
        cancelText="Annulla"
        variant="danger"
        loading={eliminandoDoc}
        onConfirm={eseguiEliminazioneDocumento}
        onCancel={() => setDocToDelete(null)}
      />
    </div>
  )
}
