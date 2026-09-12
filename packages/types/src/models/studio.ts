/**
 * @file        studio.ts
 * @module      @medico/types/models
 * @description Tipi per Studio e Medico
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/archiviazione/database-schema#studi]]
 */

export interface BroadcastTemplateConfig {
  id: string
  titolo: string
  testo: string
}

export interface OrarioGiorno {
  giorno: 'lunedi' | 'martedi' | 'mercoledi' | 'giovedi' | 'venerdi' | 'sabato'
  attivo: boolean
  oraInizioMattina: string
  oraFineMattina: string
  oraInizioPomeriggio?: string
  oraFinePomeriggio?: string
}

export interface PermessiSegreteriaConfig {
  evasioneRicetteContinuative: boolean
  accettazioneAppuntamenti: boolean
  invioBroadcastUrgenze: boolean
  visualizzazioneCartellaClinica: boolean
}

export interface StudioConfig {
  citta: string
  indirizzoCompleto: string
  recapitoUrgente?: string
  orariVisite: OrarioGiorno[]
  durataVisitaStandardMinuti: 10 | 20 | 30
  lockupMinutes: 5 | 10 | 15
  anticipoMaxPrenotazioneGiorni: number
  anticipoMinDisdettaOre: number
  fasciaRiservataUrgenze: boolean
  broadcastTemplates: BroadcastTemplateConfig[]
  permessiSegreteria: PermessiSegreteriaConfig
  messaggioPazientiApp?: string
  onboardingCompleted: boolean
}

export interface Studio {
  id: string
  nome: string
  indirizzo?: string
  telefono?: string
  email?: string
  config?: StudioConfig
  attivo: boolean
  createdAt: Date
  updatedAt: Date
}


export interface Medico {
  id: string
  studioId: string
  nome: string
  cognome: string
  email: string
  telefonoPrimario: string
  telefonoSecondario?: string
  attivo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Staff {
  id: string
  studioId: string
  medicoId: string
  nome: string
  cognome: string
  email: string
  attivo: boolean
  createdAt: Date
}

export interface StaffPermission {
  id: string
  staffId: string
  permesso: string
  grantedBy?: string
  grantedAt: Date
}
