/**
 * @file        admin.ts
 * @module      @medico/db/schema
 * @description Schema Drizzle per tabella amministratori di sistema
 * @author      Agent-1 | Session: 2026-09-12
 * @version     1.0.0
 */

import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const amministratori = pgTable('amministratori', {
  id:           uuid('id').primaryKey().defaultRandom(),
  nome:         text('nome').notNull(),
  cognome:      text('cognome').notNull(),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  ruolo:        text('ruolo').notNull().default('admin'),
  attivo:       boolean('attivo').notNull().default(true),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
