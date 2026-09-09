/**
 * @file        prenotazioni.ts
 * @module      @medico/types/models
 * @description Tipi per Slot agenda e Prenotazioni
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/archiviazione/database-schema#slot_agenda]]
 * @see         [[docs/areas/architettura/overview#Flusso-Critico]]
 */

import type { StatoSlot, TipologiaVisita, MotivoVisita, StatoPrenotazione } from '../enums'

export interface SlotAgenda {
  id: string
  medicoId: string
  studioId: string
  data: string           // ISO date: YYYY-MM-DD
  oraInizio: string      // HH:MM
  oraFine: string        // HH:MM
  durataMin: number
  stato: StatoSlot
  lockedUntil?: Date
  lockedBy?: string
  createdAt: Date
  updatedAt: Date
}

/** Slot come mostrato al paziente (senza dati di lock interni) */
export interface SlotDisponibile {
  id: string
  data: string
  oraInizio: string
  oraFine: string
  durataMin: number
}

/** Token restituito al paziente dopo il lock di uno slot */
export interface LockSlotResponse {
  slotId: string
  lockToken: string      // UUID univoco per validare la conferma
  scadeAt: Date          // quando scade il lock (10 min)
}

export interface Prenotazione {
  id: string
  studioId: string
  pazienteId: string
  medicoId: string
  slotId: string
  tipologiaVisita: TipologiaVisita
  motivoCategoria: MotivoVisita
  motivoNote?: string    // GDPR-SENSITIVE, max 300 chars
  stato: StatoPrenotazione
  gestitaDa?: string
  noteStaff?: string
  createdAt: Date
  updatedAt: Date
}

/** Input per creare una prenotazione dopo il lock */
export interface CreaPrenotazioneInput {
  slotId: string
  lockToken: string
  tipologiaVisita: TipologiaVisita
  motivoCategoria: MotivoVisita
  motivoNote?: string
}
