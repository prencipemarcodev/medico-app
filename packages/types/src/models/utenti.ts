/**
 * @file        utenti.ts
 * @module      @medico/types/models
 * @description Tipi per Paziente e Consensi — GDPR-SENSITIVE
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/archiviazione/database-schema#pazienti]]
 * @see         [[docs/areas/sicurezza/privacy-gdpr]]
 */

// GDPR-SENSITIVE: questo file contiene tipi relativi a dati personali

import type { IntervallioReminder } from '../enums'

export interface Paziente {
  id: string
  studioId: string
  medicoId: string
  nome: string           // GDPR-SENSITIVE
  cognome: string        // GDPR-SENSITIVE
  dataNascita: Date      // GDPR-SENSITIVE
  codiceFiscale?: string // GDPR-SENSITIVE
  email: string          // GDPR-SENSITIVE
  telefono?: string      // GDPR-SENSITIVE
  pushConsenso: boolean
  reminderConfig: IntervallioReminder[]
  attivo: boolean
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

/** Profilo pubblico del paziente — senza dati sanitari */
export interface PazienteBase {
  id: string
  nome: string
  cognome: string
  email: string
  telefono?: string
}

export interface ConsentLog {
  id: string
  pazienteId: string
  tipo: string
  azione: string
  ip?: string
  createdAt: Date
}

/** Payload registrazione paziente */
export interface RegistrazionePazienteInput {
  nome: string
  cognome: string
  dataNascita: string
  codiceFiscale?: string
  email: string
  telefono?: string
  password: string
  medicoId: string
  studioId: string
  pushConsenso: boolean
  privacyAccettata: boolean
}
