/**
 * @file        pazienti.ts
 * @module      @medico/db/schema
 * @description Schema Drizzle per pazienti e log consensi — GDPR-SENSITIVE
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/archiviazione/database-schema#pazienti]]
 * @see         [[docs/areas/sicurezza/privacy-gdpr]]
 */

// GDPR-SENSITIVE: questo file contiene dati personali e sanitari

import { pgTable, uuid, text, boolean, timestamp, date, jsonb } from 'drizzle-orm/pg-core'
import { studi, medici } from './studi'

export const pazienti = pgTable('pazienti', {
  id:             uuid('id').primaryKey().defaultRandom(),
  studioId:       uuid('studio_id').references(() => studi.id),
  medicoId:       uuid('medico_id').references(() => medici.id),
  nome:           text('nome').notNull(),            // GDPR-SENSITIVE
  cognome:        text('cognome').notNull(),          // GDPR-SENSITIVE
  dataNascita:    date('data_nascita'),              // GDPR-SENSITIVE
  codiceFiscale:  text('codice_fiscale').notNull().unique(), // GDPR-SENSITIVE (Username)
  email:          text('email').unique(),                    // GDPR-SENSITIVE (Facoltativo per CSV)
  telefono:       text('telefono'),                          // GDPR-SENSITIVE
  passwordHash:   text('password_hash').notNull(),
  primoAccesso:   boolean('primo_accesso').notNull().default(true),
  pushConsenso:   boolean('push_consenso').notNull().default(false),
  reminderConfig: jsonb('reminder_config').notNull().default([]),
  attivo:         boolean('attivo').notNull().default(true),
  deletedAt:      timestamp('deleted_at', { withTimezone: true }),
  createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const consentLog = pgTable('consent_log', {
  id:          uuid('id').primaryKey().defaultRandom(),
  pazienteId:  uuid('paziente_id').notNull().references(() => pazienti.id),
  tipo:        text('tipo').notNull(),
  azione:      text('azione').notNull(),
  ip:          text('ip'),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
