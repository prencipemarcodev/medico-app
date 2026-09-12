import { NextResponse } from 'next/server'
import { db, eq, recordAuditLog } from '@medico/db'
import { staff, staffMedici, staffPermissions } from '@medico/db/schema'
import { checkAuth } from '@/lib/server-auth'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAuth(['admin'])
  if ('response' in auth) return auth.response

  const { id: staffId } = await params
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'

  try {
    const [staffEsistente] = await db
      .select()
      .from(staff)
      .where(eq(staff.id, staffId))
      .limit(1)

    if (!staffEsistente) {
      return NextResponse.json({ error: 'Membro dello staff non trovato' }, { status: 404 })
    }

    // 1. Elimina permessi
    await db.delete(staffPermissions).where(eq(staffPermissions.staffId, staffId))

    // 2. Elimina associazioni ai medici
    await db.delete(staffMedici).where(eq(staffMedici.staffId, staffId))

    // 3. Elimina membro staff
    await db.delete(staff).where(eq(staff.id, staffId))

    await recordAuditLog({
      attoreId: auth.session.id,
      attoreEmail: auth.session.email,
      ruolo: 'admin',
      azione: 'STAFF_ELIMINATO',
      entita: 'staff',
      entitaId: staffId,
      dettagli: {
        nome: `${staffEsistente.nome} ${staffEsistente.cognome}`,
        email: staffEsistente.email,
        studioId: staffEsistente.studioId,
      },
      ip,
    })

    return NextResponse.json({
      success: true,
      message: `Staff ${staffEsistente.nome} ${staffEsistente.cognome} eliminato con successo`,
    })
  } catch (err: any) {
    console.error('Errore eliminazione staff:', err)
    return NextResponse.json(
      { error: err?.message || 'Errore durante l\'eliminazione dello staff' },
      { status: 500 }
    )
  }
}
