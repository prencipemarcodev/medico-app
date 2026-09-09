/**
 * @file        notifiche.ts
 * @module      @medico/db/schema
 * @description Schema Drizzle per log notifiche push e in-app
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/notifiche/sistema-notifiche]]
 */

import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { studi } from './studi'
import { pazienti } from './pazienti'

export const logNotifiche = pgTable('log_notifiche', {
  id:          uuid('id').primaryKey().defaultRandom(),
  studioId:    uuid('studio_id').notNull().references(() => studi.id),
  pazienteId:  uuid('paziente_id').references(() => pazienti.id),
  evento:      text('evento').notNull(),
  canale:      text('canale').notNull(),
  stato:       text('stato').notNull().default('in_coda'),
  tentativi:   integer('tentativi').notNull().default(1),
  inviatoAt:   timestamp('inviato_at', { withTimezone: true }),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
