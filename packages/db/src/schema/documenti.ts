/**
 * @file        documenti.ts
 * @module      @medico/db/schema
 * @description Schema Drizzle per la Cartella Clinica: documenti, referti e appunti clinici
 * @author      Agent-1 | Session: 2026-09-13
 * @version     1.0.0
 */

import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { pazienti } from './pazienti'
import { studi } from './studi'

export const documentiClinici = pgTable('documenti_clinici', {
  id:          uuid('id').primaryKey().defaultRandom(),
  pazienteId:  uuid('paziente_id').notNull().references(() => pazienti.id, { onDelete: 'cascade' }),
  studioId:    uuid('studio_id').references(() => studi.id, { onDelete: 'set null' }),
  titolo:      text('titolo').notNull(),
  categoria:   text('categoria').notNull().default('appunto'), // 'appunto', 'referto', 'esame', 'terapia', 'allergia', 'documento'
  note:        text('note'), // Testo dell'appunto o note cliniche
  fileUrl:     text('file_url'), // URL o data URL del documento allegato
  fileName:    text('file_name'),
  fileType:    text('file_type'),
  fileSize:    integer('file_size'),
  autoreRuolo: text('autore_ruolo').notNull().default('paziente'), // 'paziente', 'medico', 'segreteria'
  autoreId:    uuid('autore_id').notNull(),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
