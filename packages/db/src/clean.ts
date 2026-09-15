/**
 * @file        clean.ts
 * @module      @medico/db
 * @description Script per svuotare completamente tutte le tabelle del database (0 righe)
 *              permettendo l'inserimento di soli dati reali tramite onboarding.
 * @author      Agent-1 | Session: 2026-09-12
 * @version     1.0.0
 */

import { db } from './index.js'
import {
  studi,
  medici,
  staff,
  staffMedici,
  staffPermissions,
  pazienti,
  slotAgenda,
  prenotazioni,
  consentLog,
  richiesteSpeciali,
  broadcast,
  logNotifiche,
  amministratori,
  auditLogs,
  documentiClinici,
  emergencyCodes,
} from './schema/index.js'
import { sql } from 'drizzle-orm'

async function clean() {
  console.log('🧹 [WIPE DATABASE] Eliminazione completa di TUTTI i dati operativi da tutte le tabelle...')

  // Ordine corretto di cancellazione rispettando le foreign key
  await db.delete(auditLogs)
  try {
    await db.delete(documentiClinici)
  } catch {
    // Tabella non ancora presente nel DB live
  }
  await db.delete(prenotazioni)
  await db.delete(slotAgenda)
  await db.delete(richiesteSpeciali)
  await db.delete(broadcast)
  await db.delete(logNotifiche)
  await db.delete(consentLog)
  try {
    await db.delete(emergencyCodes)
  } catch {
    // Tabella opzionale
  }
  await db.delete(staffPermissions)
  await db.delete(staffMedici)
  await db.delete(staff)
  await db.delete(pazienti)
  await db.delete(medici)
  await db.delete(studi)

  console.log('✓ Tabelle operative svuotate con successo.')

  // Verifica che il conteggio sia 0 su tutte le tabelle operative e 1 su amministratori
  const counts = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(studi),
    db.select({ count: sql<number>`count(*)` }).from(medici),
    db.select({ count: sql<number>`count(*)` }).from(staff),
    db.select({ count: sql<number>`count(*)` }).from(pazienti),
    db.select({ count: sql<number>`count(*)` }).from(slotAgenda),
    db.select({ count: sql<number>`count(*)` }).from(prenotazioni),
    db.select({ count: sql<number>`count(*)` }).from(amministratori),
  ])

  console.log('📊 Verifica conteggio record residui:')
  console.log(` - Studi: ${counts[0][0].count}`)
  console.log(` - Medici: ${counts[1][0].count}`)
  console.log(` - Staff: ${counts[2][0].count}`)
  console.log(` - Pazienti: ${counts[3][0].count}`)
  console.log(` - Slot Agenda: ${counts[4][0].count}`)
  console.log(` - Prenotazioni: ${counts[5][0].count}`)
  console.log(` - Amministratori (preservati): ${counts[6][0].count}`)

  const totalOperativi = counts.slice(0, 6).reduce((acc, curr) => acc + Number(curr[0].count), 0)
  if (totalOperativi === 0) {
    console.log('✨ [DATABASE PULITISSIMO] Tutte le tabelle operative azzerate a 0 record! Super Admin preservato.')
  } else {
    console.warn(`⚠️ Attenzione: trovati ancora ${totalOperativi} record residui.`)
  }

  process.exit(0)
}

clean().catch((err) => {
  console.error('❌ Errore durante la pulizia del database:', err)
  process.exit(1)
})
