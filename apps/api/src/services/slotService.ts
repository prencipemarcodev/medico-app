/**
 * @file        slotService.ts
 * @module      @medico/api/services
 * @description Gestione transazionale degli slot e lock temporaneo (ADR-002)
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/architettura/decisioni-architetturali#ADR-002]]
 * @see         [[docs/areas/interfaccia/ux-flows#Flow-2]]
 */

import { db, slotAgenda, eq, and, lt, asc } from '@medico/db'
import crypto from 'node:crypto'

export interface LockResultSuccess {
  success: true
  slotId: string
  lockToken: string
  scadeAt: Date
  durataMinuti: number
}

export interface LockResultFailure {
  success: false
  code: 'NOT_FOUND' | 'SLOT_CLOSED' | 'ALREADY_BOOKED' | 'CURRENTLY_LOCKED'
  error: string
  lockedUntil?: Date
}

export type LockResult = LockResultSuccess | LockResultFailure

/**
 * @function    cleanupExpiredLocks
 * @description Sblocca gli slot il cui lock di 10 minuti è scaduto
 * @returns     Numero di slot sbloccati
 */
export async function cleanupExpiredLocks(): Promise<number> {
  const now = new Date()
  const sbloccati = await db
    .update(slotAgenda)
    .set({
      stato: 'libero',
      lockedUntil: null,
      lockToken: null,
      lockedBy: null,
      updatedAt: now,
    })
    .where(and(eq(slotAgenda.stato, 'bloccato'), lt(slotAgenda.lockedUntil, now)))
    .returning({ id: slotAgenda.id })

  return sbloccati.length
}

/**
 * @function    getAvailableSlots
 * @description Restituisce gli slot disponibili per un medico in una data specifica
 * @param       medicoId - ID del medico
 * @param       data - Data ISO (YYYY-MM-DD)
 */
export async function getAvailableSlots(medicoId: string, data: string) {
  // Pulizia preventiva dei lock scaduti
  await cleanupExpiredLocks()

  const slots = await db
    .select({
      id: slotAgenda.id,
      medicoId: slotAgenda.medicoId,
      studioId: slotAgenda.studioId,
      data: slotAgenda.data,
      oraInizio: slotAgenda.oraInizio,
      oraFine: slotAgenda.oraFine,
      durataMin: slotAgenda.durataMin,
      stato: slotAgenda.stato,
    })
    .from(slotAgenda)
    .where(
      and(
        eq(slotAgenda.medicoId, medicoId),
        eq(slotAgenda.data, data),
        eq(slotAgenda.stato, 'libero')
      )
    )
    .orderBy(asc(slotAgenda.oraInizio))

  return slots
}

/**
 * @function    lockSlot
 * @description Acquisisce un lock atomico di 10 minuti su uno slot (ADR-002)
 * @param       slotId - ID dello slot da bloccare
 * @param       pazienteId - ID opzionale del paziente richiedente
 */
export async function lockSlot(slotId: string, pazienteId?: string): Promise<LockResult> {
  return await db.transaction(async (tx) => {
    const now = new Date()

    // 1. SELECT FOR UPDATE: lock a livello di riga sul database
    const [slot] = await tx
      .select()
      .from(slotAgenda)
      .where(eq(slotAgenda.id, slotId))
      .for('update')

    if (!slot) {
      return { success: false, code: 'NOT_FOUND', error: 'Slot non trovato' }
    }

    if (slot.stato === 'chiuso') {
      return { success: false, code: 'SLOT_CLOSED', error: 'Lo slot selezionato è chiuso o non operativo' }
    }

    if (slot.stato === 'prenotato') {
      return { success: false, code: 'ALREADY_BOOKED', error: 'Lo slot è già stato prenotato da un altro paziente' }
    }

    // Se è bloccato e il lock è ancora valido -> conflitto
    if (slot.stato === 'bloccato' && slot.lockedUntil && slot.lockedUntil > now) {
      return {
        success: false,
        code: 'CURRENTLY_LOCKED',
        error: 'Lo slot è temporaneamente bloccato per un altro paziente. Riprova tra qualche minuto.',
        lockedUntil: slot.lockedUntil,
      }
    }

    // 2. Slot libero o lock precedente scaduto: assegna nuovo lock per 10 minuti
    const LOCK_MINUTI = 10
    const scadeAt = new Date(now.getTime() + LOCK_MINUTI * 60 * 1000)
    const lockToken = crypto.randomUUID()

    await tx
      .update(slotAgenda)
      .set({
        stato: 'bloccato',
        lockedUntil: scadeAt,
        lockToken,
        lockedBy: pazienteId ?? null,
        updatedAt: now,
      })
      .where(eq(slotAgenda.id, slotId))

    return {
      success: true,
      slotId: slot.id,
      lockToken,
      scadeAt,
      durataMinuti: LOCK_MINUTI,
    }
  })
}
