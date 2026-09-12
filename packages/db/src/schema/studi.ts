/**
 * @file        studi.ts
 * @module      @medico/db/schema
 * @description Schema Drizzle per tabelle studi e medici
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/archiviazione/database-schema#studi]]
 */

import { pgTable, uuid, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const studi = pgTable('studi', {
  id:         uuid('id').primaryKey().defaultRandom(),
  nome:       text('nome').notNull(),
  indirizzo:  text('indirizzo'),
  telefono:   text('telefono'),
  email:      text('email'),
  config:     jsonb('config'),
  attivo:     boolean('attivo').notNull().default(true),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:  timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const medici = pgTable('medici', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  studioId:            uuid('studio_id').notNull().references(() => studi.id),
  nome:                text('nome').notNull(),
  cognome:             text('cognome').notNull(),
  email:               text('email').notNull().unique(),
  telefonoPrimario:    text('telefono_primario').notNull(),
  telefonoSecondario:  text('telefono_secondario'),
  passwordHash:        text('password_hash').notNull(),
  attivo:              boolean('attivo').notNull().default(true),
  createdAt:           timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:           timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const emergencyCodes = pgTable('emergency_codes', {
  id:        uuid('id').primaryKey().defaultRandom(),
  medicoId:  uuid('medico_id').notNull().references(() => medici.id),
  codeHash:  text('code_hash').notNull(),
  usato:     boolean('usato').notNull().default(false),
  usatoAt:   timestamp('usato_at', { withTimezone: true }),
  usatoIp:   text('usato_ip'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
