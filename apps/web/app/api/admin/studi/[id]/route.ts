import { NextResponse } from 'next/server'
import { db, eq, recordAuditLog } from '@medico/db'
import {
  studi,
  medici,
  staff,
  staffMedici,
  staffPermissions,
  pazienti,
  slotAgenda,
  prenotazioni,
  richiesteSpeciali,
  broadcast,
} from '@medico/db/schema'
import { checkAuth } from '@/lib/server-auth'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAuth(['admin'])
  if ('response' in auth) return auth.response

  const { id: studioId } = await params
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'

  try {
    const [studioEsistente] = await db
      .select()
      .from(studi)
      .where(eq(studi.id, studioId))
      .limit(1)

    if (!studioEsistente) {
      return NextResponse.json({ error: 'Studio medico non trovato' }, { status: 404 })
    }

    // Eliminazione a cascata ordinata rispettando le foreign key
    await db.delete(prenotazioni).where(eq(prenotazioni.studioId, studioId))
    await db.delete(slotAgenda).where(eq(slotAgenda.studioId, studioId))
    await db.delete(richiesteSpeciali).where(eq(richiesteSpeciali.studioId, studioId))
    await db.delete(broadcast).where(eq(broadcast.studioId, studioId))

    // Recupera staff dello studio per pulire staffPermissions e staffMedici
    const staffDelloStudio = await db
      .select({ id: staff.id })
      .from(staff)
      .where(eq(staff.studioId, studioId))

    for (const st of staffDelloStudio) {
      await db.delete(staffPermissions).where(eq(staffPermissions.staffId, st.id))
      await db.delete(staffMedici).where(eq(staffMedici.staffId, st.id))
    }

    await db.delete(staff).where(eq(staff.studioId, studioId))
    await db.delete(pazienti).where(eq(pazienti.studioId, studioId))
    await db.delete(medici).where(eq(medici.studioId, studioId))
    await db.delete(studi).where(eq(studi.id, studioId))

    await recordAuditLog({
      attoreId: auth.session.id,
      attoreEmail: auth.session.email,
      ruolo: 'admin',
      azione: 'STUDIO_ELIMINATO',
      entita: 'studio',
      entitaId: studioId,
      dettagli: { nomeStudio: studioEsistente.nome, indirizzo: studioEsistente.indirizzo },
      ip,
    })

    return NextResponse.json({
      success: true,
      message: `Studio "${studioEsistente.nome}" e tutti i dati associati eliminati con successo`,
    })
  } catch (err: any) {
    console.error('Errore eliminazione studio:', err)
    return NextResponse.json(
      { error: err?.message || 'Errore durante l\'eliminazione dello studio' },
      { status: 500 }
    )
  }
}
