/**
 * @file        audit.ts
 * @module      @medico/db/schema
 * @description Schema Drizzle per il registro audit immutabile di sicurezza e tracciamento (GDPR)
 * @author      Agent-1 | Session: 2026-09-12
 */

import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const auditLogs = pgTable('audit_logs', {
  id:          uuid('id').primaryKey().defaultRandom(),
  attoreId:    uuid('attore_id'),
  attoreEmail: text('attore_email'),
  ruolo:       text('ruolo'),
  azione:      text('azione').notNull(),
  entita:      text('entita'),
  entitaId:    text('entita_id'),
  dettagli:    jsonb('dettagli'),
  ip:          text('ip'),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
