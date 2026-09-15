import { NextResponse } from 'next/server'
import { db, eq, and, sql, desc, asc } from '@medico/db'
import { slotAgenda, medici, pazienti } from '@medico/db/schema'
import { getSession } from '@/lib/server-auth'

/**
 * GET /api/slot
 * Parametri query:
 *  - data: 'YYYY-MM-DD' (opzionale, default oggi)
 *  - medicoId: UUID (opzionale se il paziente ha già un medico assegnato)
 */
export async function GET(request: Request) {
  try {
    const session = await getSession()
    const { searchParams } = new URL(request.url)
    const dataParam = searchParams.get('data') || new Date().toISOString().split('T')[0]
    let medicoId = searchParams.get('medicoId')

    // Se il medicoId non è fornito e l'utente è un paziente loggato, recuperiamo il suo medico curante
    if (!medicoId && session?.ruolo === 'paziente') {
      const [paziente] = await db
        .select({ medicoId: pazienti.medicoId })
        .from(pazienti)
        .where(eq(pazienti.id, session.id))
        .limit(1)

      medicoId = paziente?.medicoId || null
    }

    // 1. Manutenzione automatica lazy: sblocca eventuali slot con TTL 10m scaduto
    await db
      .update(slotAgenda)
      .set({
        stato: 'libero',
        lockedUntil: null,
        lockToken: null,
        lockedBy: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(slotAgenda.stato, 'bloccato'),
          sql`${slotAgenda.lockedUntil} < NOW()`
        )
      )

    // 2. Query slot per la data (e medicoId se specificato)
    const condizioni = [eq(slotAgenda.data, dataParam!)]
    if (medicoId) {
      condizioni.push(eq(slotAgenda.medicoId, medicoId))
    }

    let slots = await db
      .select({
        id: slotAgenda.id,
        medicoId: slotAgenda.medicoId,
        studioId: slotAgenda.studioId,
        data: slotAgenda.data,
        oraInizio: slotAgenda.oraInizio,
        oraFine: slotAgenda.oraFine,
        durataMin: slotAgenda.durataMin,
        stato: slotAgenda.stato,
        lockedUntil: slotAgenda.lockedUntil,
        lockedBy: slotAgenda.lockedBy,
      })
      .from(slotAgenda)
      .where(and(...condizioni))
      .orderBy(asc(slotAgenda.oraInizio))

    const now = new Date()
    const mappedSlots = slots.map((s) => {
      // Parsa data e ora inizio dello slot nel tempo locale
      const dateParts = s.data.split('-').map(Number)
      const timeParts = s.oraInizio.split(':').map(Number)
      const year = dateParts[0] ?? 2026
      const month = dateParts[1] ?? 1
      const day = dateParts[2] ?? 1
      const hour = timeParts[0] ?? 0
      const minute = timeParts[1] ?? 0
      const slotStart = new Date(year, month - 1, day, hour, minute, 0)
      const isPast = slotStart <= now

      return {
        ...s,
        isPast,
        // Se lo slot è nel passato e risultava ancora libero, viene marcato come chiuso
        stato: isPast && s.stato === 'libero' ? ('chiuso' as const) : s.stato,
      }
    })

    return NextResponse.json({
      data: dataParam,
      medicoId,
      currentUserId: session?.id || null,
      slots: mappedSlots,
    })
  } catch (error: any) {
    console.error('Errore nel recupero degli slot:', error)
    return NextResponse.json(
      { error: error?.message || 'Errore durante il recupero della disponibilità' },
      { status: 500 }
    )
  }
}
