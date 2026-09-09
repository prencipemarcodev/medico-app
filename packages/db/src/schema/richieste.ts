/**
 * @file        richieste.ts
 * @module      @medico/db/schema
 * @description Schema Drizzle per richieste speciali e broadcast — GDPR-SENSITIVE
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/archiviazione/database-schema#richieste_speciali]]
 */

// GDPR-SENSITIVE: payload contiene dati sanitari

import { pgTable, uuid, text, timestamp, jsonb, integer, date } from 'drizzle-orm/pg-core'
import { studi, medici } from './studi'
import { pazienti } from './pazienti'

export const richiesteSpeciali = pgTable('richieste_speciali', {
  id:              uuid('id').primaryKey().defaultRandom(),
  studioId:        uuid('studio_id').notNull().references(() => studi.id),
  pazienteId:      uuid('paziente_id').notNull().references(() => pazienti.id),
  medicoId:        uuid('medico_id').notNull().references(() => medici.id),
  tipo:            text('tipo').notNull(),
  sottotipo:       text('sottotipo'),
  payload:         jsonb('payload').notNull(),         // GDPR-SENSITIVE
  stato:           text('stato').notNull().default('in_attesa'),
  modalitaRitiro:  text('modalita_ritiro'),
  noteRifiuto:     text('note_rifiuto'),
  gestitaDa:       uuid('gestita_da'),
  gestitaAt:       timestamp('gestita_at', { withTimezone: true }),
  completataAt:    timestamp('completata_at', { withTimezone: true }),
  createdAt:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:       timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const broadcast = pgTable('broadcast', {
  id:            uuid('id').primaryKey().defaultRandom(),
  studioId:      uuid('studio_id').notNull().references(() => studi.id),
  inviatoDa:     uuid('inviato_da').notNull(),
  giornoTarget:  date('giorno_target').notNull(),
  testo:         text('testo').notNull(),
  canali:        text('canali').array().notNull(),
  nDestinatari:  integer('n_destinatari'),
  nInviati:      integer('n_inviati'),
  nFalliti:      integer('n_falliti'),
  stato:         text('stato').notNull().default('inviato'),
  createdAt:     timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
