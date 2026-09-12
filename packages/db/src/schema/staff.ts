/**
 * @file        staff.ts
 * @module      @medico/db/schema
 * @description Schema Drizzle per staff (segretari/assistenti) e permessi
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/archiviazione/database-schema#staff]]
 * @see         [[docs/areas/ruoli/ruoli-permessi]]
 */

import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'
import { studi } from './studi'
import { medici } from './studi'

export const staff = pgTable('staff', {
  id:           uuid('id').primaryKey().defaultRandom(),
  studioId:     uuid('studio_id').notNull().references(() => studi.id),
  medicoId:     uuid('medico_id').references(() => medici.id),
  nome:         text('nome').notNull(),
  cognome:      text('cognome').notNull(),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  attivo:       boolean('attivo').notNull().default(true),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const staffMedici = pgTable('staff_medici', {
  id:        uuid('id').primaryKey().defaultRandom(),
  staffId:   uuid('staff_id').notNull().references(() => staff.id, { onDelete: 'cascade' }),
  medicoId:  uuid('medico_id').notNull().references(() => medici.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const staffPermissions = pgTable('staff_permissions', {
  id:        uuid('id').primaryKey().defaultRandom(),
  staffId:   uuid('staff_id').notNull().references(() => staff.id),
  permesso:  text('permesso').notNull(),
  grantedBy: uuid('granted_by').references(() => medici.id),
  grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
})
