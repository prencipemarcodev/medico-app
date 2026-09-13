import { NextResponse } from 'next/server'
import { db, eq, and, sql } from '@medico/db'
import { slotAgenda } from '@medico/db/schema'
import { getSession } from '@/lib/server-auth'

/**
 * POST /api/slot/unlock
 * Rilascia immediatamente un lock su uno slot quando l'utente cambia data o annulla
 * Body: { slotId: string, lockToken?: string }
 */
export async function POST(request: Request) {
  try {
    const session = await getSession()
    const body = await request.json()
    const { slotId, lockToken } = body

    if (!slotId) {
      return NextResponse.json({ error: 'slotId obbligatorio' }, { status: 400 })
    }

    // Aggiorna lo slot a libero se il token corrisponde o se è stato bloccato dall'utente loggato
    const condizioni = [eq(slotAgenda.id, slotId), eq(slotAgenda.stato, 'bloccato')]
    if (lockToken) {
      condizioni.push(eq(slotAgenda.lockToken, lockToken))
    } else if (session?.id) {
      condizioni.push(eq(slotAgenda.lockedBy, session.id))
    }

    const [unlocked] = await db
      .update(slotAgenda)
      .set({
        stato: 'libero',
        lockedUntil: null,
        lockToken: null,
        lockedBy: null,
        updatedAt: new Date(),
      })
      .where(and(...condizioni))
      .returning()

    return NextResponse.json({
      success: true,
      sbloccato: Boolean(unlocked),
    })
  } catch (error: any) {
    console.error('Errore sblocco slot:', error)
    return NextResponse.json(
      { error: error?.message || 'Errore durante lo sblocco dello slot' },
      { status: 500 }
    )
  }
}
