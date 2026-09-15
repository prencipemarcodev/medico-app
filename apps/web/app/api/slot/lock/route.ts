import { NextResponse } from 'next/server'
import { db, eq, sql } from '@medico/db'
import { slotAgenda } from '@medico/db/schema'
import { getSession } from '@/lib/server-auth'
import crypto from 'crypto'

/**
 * POST /api/slot/lock
 * Acquisisce il lock atomico di 10 minuti su uno slot (ADR-002)
 * Body: { slotId: string }
 */
export async function POST(request: Request) {
  try {
    const session = await getSession()
    const body = await request.json()
    const { slotId } = body

    if (!slotId) {
      return NextResponse.json(
        { error: 'ID slot obbligatorio' },
        { status: 400 }
      )
    }

    // Eseguiamo la transazione con SELECT ... FOR UPDATE (pessimistic lock)
    const result = await db.transaction(async (tx) => {
      const now = new Date()

      // 1. Lock a livello di riga su PostgreSQL
      const [slot] = await tx
        .select()
        .from(slotAgenda)
        .where(eq(slotAgenda.id, slotId))
        .for('update')

      if (!slot) {
        return {
          status: 404,
          data: { error: 'Slot non trovato', code: 'NOT_FOUND' },
        }
      }

      // Verifica bloccante anti-passato: non è possibile bloccare o prenotare slot già trascorsi
      const dateParts = slot.data.split('-').map(Number)
      const timeParts = slot.oraInizio.split(':').map(Number)
      const slotYear = dateParts[0] ?? 2026
      const slotMonth = dateParts[1] ?? 1
      const slotDay = dateParts[2] ?? 1
      const slotHour = timeParts[0] ?? 0
      const slotMin = timeParts[1] ?? 0
      const slotStart = new Date(slotYear, slotMonth - 1, slotDay, slotHour, slotMin, 0)
      if (slotStart <= now) {
        return {
          status: 400,
          data: {
            error: 'Non è possibile prenotare uno slot per una data o un orario già trascorso.',
            code: 'SLOT_IN_PAST',
          },
        }
      }

      if (slot.stato === 'chiuso') {
        return {
          status: 400,
          data: { error: 'Lo slot selezionato non è disponibile', code: 'SLOT_CLOSED' },
        }
      }

      if (slot.stato === 'prenotato') {
        return {
          status: 409,
          data: {
            error: 'Lo slot è già stato prenotato da un altro paziente.',
            code: 'ALREADY_BOOKED',
          },
        }
      }

      // Se è già bloccato da qualcun altro e il lock non è scaduto
      const isLockedBySomeoneElse =
        slot.stato === 'bloccato' &&
        slot.lockedUntil &&
        new Date(slot.lockedUntil) > now &&
        (!session?.id || slot.lockedBy !== session.id)

      if (isLockedBySomeoneElse) {
        return {
          status: 409,
          data: {
            error: 'Lo slot è stato appena selezionato da un altro utente. Scegli un altro orario disponibile.',
            code: 'CURRENTLY_LOCKED',
            lockedUntil: slot.lockedUntil,
          },
        }
      }

      // 2. Assegna lock temporaneo di 10 minuti
      const LOCK_MINUTI = 10
      const scadeAt = new Date(now.getTime() + LOCK_MINUTI * 60 * 1000)
      const lockToken = crypto.randomUUID()

      const [updated] = await tx
        .update(slotAgenda)
        .set({
          stato: 'bloccato',
          lockedUntil: scadeAt,
          lockToken,
          lockedBy: session?.ruolo === 'paziente' ? session.id : null,
          updatedAt: now,
        })
        .where(eq(slotAgenda.id, slotId))
        .returning()

      if (!updated) {
        return {
          status: 500,
          data: { error: 'Impossibile aggiornare lo slot', code: 'UPDATE_FAILED' },
        }
      }

      return {
        status: 200,
        data: {
          success: true,
          slotId: updated.id,
          lockToken,
          lockedUntil: scadeAt,
          durataMinuti: LOCK_MINUTI,
          oraInizio: updated.oraInizio,
          oraFine: updated.oraFine,
          data: updated.data,
        },
      }
    })

    return NextResponse.json(result.data, { status: result.status })
  } catch (error: any) {
    console.error('Errore durante il lock dello slot:', error)
    return NextResponse.json(
      { error: error?.message || 'Errore interno durante il blocco dello slot' },
      { status: 500 }
    )
  }
}
