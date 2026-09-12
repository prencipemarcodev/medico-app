/**
 * @file        slot.ts
 * @module      @medico/db/schema
 * @description Schema Drizzle per slot agenda — include lock temporaneo anti-doppia prenotazione
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/archiviazione/database-schema#slot_agenda]]
 * @see         [[docs/areas/architettura/decisioni-architetturali#ADR-002]]
 */

import { pgTable, uuid, text, integer, timestamp, date, time, check } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { medici, studi } from './studi'
import { pazienti } from './pazienti'

export const slotAgenda = pgTable('slot_agenda', {
  id:          uuid('id').primaryKey().defaultRandom(),
  medicoId:    uuid('medico_id').notNull().references(() => medici.id),
  studioId:    uuid('studio_id').notNull().references(() => studi.id),
  data:        date('data').notNull(),
  oraInizio:   time('ora_inizio').notNull(),
  oraFine:     time('ora_fine').notNull(),
  durataMin:   integer('durata_min').notNull().default(20),
  // stato: libero | bloccato | prenotato | chiuso
  stato:       text('stato').notNull().default('libero'),
  // lock temporaneo 10 minuti — ADR-002
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  lockedBy:    uuid('locked_by').references(() => pazienti.id),
  lockToken:   text('lock_token'),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  checkStato: check('check_stato', sql`${table.stato} IN ('libero','bloccato','prenotato','chiuso')`),
  checkDurata: check('check_durata', sql`${table.durataMin} IN (10, 20, 30)`),
}))
