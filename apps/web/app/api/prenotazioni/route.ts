import { NextResponse } from 'next/server'
import { db, eq, and, sql, recordAuditLog } from '@medico/db'
import { slotAgenda, prenotazioni, pazienti } from '@medico/db/schema'
import { checkAuth } from '@/lib/server-auth'

/**
 * POST /api/prenotazioni
 * Finalizza e conferma una prenotazione con convalida del lockToken (ADR-002)
 */
export async function POST(request: Request) {
  const auth = await checkAuth(['paziente', 'medico', 'segreteria', 'admin'])
  if ('response' in auth) return auth.response

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'

  try {
    const body = await request.json()
    const {
      slotId,
      lockToken,
      pazienteId: customPazienteId,
      tipologiaVisita = 'standard',
      motivoCategoria = 'controllo_routine',
      motivoNote,
    } = body

    if (!slotId || !lockToken) {
      return NextResponse.json(
        { error: 'Parametri slotId e lockToken obbligatori' },
        { status: 400 }
      )
    }

    // Identifica il paziente: se il richiedente è un paziente, usa il suo ID
    let effettivoPazienteId = customPazienteId
    if (auth.session.ruolo === 'paziente') {
      effettivoPazienteId = auth.session.id
    }

    if (!effettivoPazienteId) {
      return NextResponse.json(
        { error: 'Paziente non specificato' },
        { status: 400 }
      )
    }

    // Transazione atomica su PostgreSQL con SELECT ... FOR UPDATE
    const transazione = await db.transaction(async (tx) => {
      const now = new Date()

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

      if (slot.stato === 'prenotato') {
        return {
          status: 409,
          data: {
            error: 'Questo slot è già stato confermato da un altro paziente.',
            code: 'ALREADY_BOOKED',
          },
        }
      }

      // Convalida lockToken e scadenza temporale
      if (
        slot.stato !== 'bloccato' ||
        slot.lockToken !== lockToken ||
        !slot.lockedUntil ||
        new Date(slot.lockedUntil) < now
      ) {
        return {
          status: 400,
          data: {
            error: 'Il tempo di 10 minuti per confermare è scaduto. Seleziona nuovamente lo slot.',
            code: 'LOCK_EXPIRED',
          },
        }
      }

      // 1. Inserimento record in tabella prenotazioni
      const [nuovaPrenotazione] = await tx
        .insert(prenotazioni)
        .values({
          studioId: slot.studioId,
          medicoId: slot.medicoId,
          pazienteId: effettivoPazienteId,
          slotId: slot.id,
          tipologiaVisita: tipologiaVisita as any,
          motivoCategoria,
          motivoNote: motivoNote?.trim() ? motivoNote.trim().slice(0, 300) : null,
          stato: 'confermata',
        })
        .returning()

      if (!nuovaPrenotazione) {
        return {
          status: 500,
          data: { error: 'Errore durante la creazione della prenotazione', code: 'INSERT_FAILED' },
        }
      }

      // 2. Aggiorna lo stato dello slot in 'prenotato' e rimuove il lock
      await tx
        .update(slotAgenda)
        .set({
          stato: 'prenotato',
          lockToken: null,
          lockedUntil: null,
          lockedBy: null,
          updatedAt: now,
        })
        .where(eq(slotAgenda.id, slot.id))

      return {
        status: 200,
        data: {
          success: true,
          prenotazione: nuovaPrenotazione,
          slot: {
            id: slot.id,
            data: slot.data,
            oraInizio: slot.oraInizio,
            oraFine: slot.oraFine,
          },
        },
      }
    })

    if (transazione.status === 200 && 'prenotazione' in transazione.data && transazione.data.prenotazione) {
      await recordAuditLog({
        attoreId: auth.session.id,
        attoreEmail: auth.session.email,
        ruolo: auth.session.ruolo,
        azione: 'PRENOTAZIONE_CREATA',
        entita: 'prenotazione',
        entitaId: transazione.data.prenotazione.id,
        dettagli: {
          slotId,
          pazienteId: effettivoPazienteId,
          data: transazione.data.slot.data,
          ora: transazione.data.slot.oraInizio,
        },
        ip,
      })
    }

    return NextResponse.json(transazione.data, { status: transazione.status })
  } catch (error: any) {
    console.error('Errore creazione prenotazione:', error)
    return NextResponse.json(
      { error: error?.message || 'Errore durante la finalizzazione della prenotazione' },
      { status: 500 }
    )
  }
}
