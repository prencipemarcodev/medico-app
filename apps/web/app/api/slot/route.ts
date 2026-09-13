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

    // Se non ci sono slot nel DB per questa data e abbiamo un medico/studio, generiamo gli slot standard
    if (slots.length === 0 && medicoId) {
      const [medico] = await db
        .select({ id: medici.id, studioId: medici.studioId })
        .from(medici)
        .where(eq(medici.id, medicoId))
        .limit(1)

      if (medico) {
        const orariDefault = [
          { start: '09:00', end: '09:20', durata: 20 },
          { start: '09:20', end: '09:40', durata: 20 },
          { start: '09:40', end: '10:00', durata: 20 },
          { start: '10:20', end: '10:40', durata: 20 },
          { start: '10:40', end: '11:00', durata: 20 },
          { start: '11:00', end: '11:30', durata: 30 },
          { start: '15:00', end: '15:30', durata: 30 },
          { start: '15:30', end: '16:00', durata: 30 },
          { start: '16:00', end: '16:30', durata: 30 },
          { start: '16:30', end: '17:00', durata: 30 },
        ]

        const newSlotsValues = orariDefault.map((o) => ({
          medicoId: medico.id,
          studioId: medico.studioId,
          data: dataParam!,
          oraInizio: o.start,
          oraFine: o.end,
          durataMin: o.durata,
          stato: 'libero' as const,
        }))

        await db.insert(slotAgenda).values(newSlotsValues).onConflictDoNothing()

        slots = await db
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
      }
    }

    return NextResponse.json({
      data: dataParam,
      medicoId,
      currentUserId: session?.id || null,
      slots,
    })
  } catch (error: any) {
    console.error('Errore nel recupero degli slot:', error)
    return NextResponse.json(
      { error: error?.message || 'Errore durante il recupero della disponibilità' },
      { status: 500 }
    )
  }
}
