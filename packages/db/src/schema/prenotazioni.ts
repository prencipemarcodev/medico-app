/**
 * @file        prenotazioni.ts
 * @module      @medico/db/schema
 * @description Schema Drizzle per prenotazioni — GDPR-SENSITIVE (motivoNote)
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/archiviazione/database-schema#prenotazioni]]
 */

// GDPR-SENSITIVE: motivoNote contiene testo libero del paziente

import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { studi, medici } from './studi'
import { pazienti } from './pazienti'
import { slotAgenda } from './slot'

export const prenotazioni = pgTable('prenotazioni', {
  id:               uuid('id').primaryKey().defaultRandom(),
  studioId:         uuid('studio_id').notNull().references(() => studi.id),
  pazienteId:       uuid('paziente_id').notNull().references(() => pazienti.id),
  medicoId:         uuid('medico_id').notNull().references(() => medici.id),
  slotId:           uuid('slot_id').notNull().unique().references(() => slotAgenda.id),
  tipologiaVisita:  text('tipologia_visita').notNull(),
  motivoCategoria:  text('motivo_categoria').notNull(),
  motivoNote:       text('motivo_note'),              // GDPR-SENSITIVE max 300 chars
  stato:            text('stato').notNull().default('confermata'),
  gestitaDa:        uuid('gestita_da'),
  noteStaff:        text('note_staff'),
  createdAt:        timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
