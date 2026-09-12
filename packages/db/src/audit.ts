/**
 * @file        audit.ts
 * @module      @medico/db
 * @description Helper per la registrazione di log di audit di sicurezza nel database
 * @author      Agent-1 | Session: 2026-09-12
 */

import { db } from './client'
import { auditLogs } from './schema/audit'

export interface AuditLogEntry {
  attoreId?: string | null
  attoreEmail?: string | null
  ruolo?: string | null
  azione: string
  entita?: string | null
  entitaId?: string | null
  dettagli?: any
  ip?: string | null
}

/**
 * Registra in modo immutabile un evento di audit nel database
 */
export async function recordAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      attoreId: entry.attoreId || null,
      attoreEmail: entry.attoreEmail || null,
      ruolo: entry.ruolo || null,
      azione: entry.azione,
      entita: entry.entita || null,
      entitaId: entry.entitaId || null,
      dettagli: entry.dettagli ? entry.dettagli : null,
      ip: entry.ip || null,
    })
  } catch (err) {
    console.error('Errore durante la registrazione dell\'audit log:', err)
  }
}
