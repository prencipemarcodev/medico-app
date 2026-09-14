import { NextResponse } from 'next/server'
import { db, hashPassword, eq, createSessionToken, recordAuditLog } from '@medico/db'
import { pazienti, medici, staff, amministratori } from '@medico/db/schema'
import { getSession } from '@/lib/server-auth'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Sessione non autenticata o scaduta' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
    const body = await request.json()
    const { nuovaPassword } = body

    if (!nuovaPassword || typeof nuovaPassword !== 'string' || nuovaPassword.length < 6) {
      return NextResponse.json(
        { error: 'La nuova password deve contenere almeno 6 caratteri' },
        { status: 400 }
      )
    }

    const newHash = hashPassword(nuovaPassword)

    if (session.ruolo === 'paziente') {
      await db
        .update(pazienti)
        .set({ passwordHash: newHash, primoAccesso: false, passwordIniziale: null, updatedAt: new Date() })
        .where(eq(pazienti.id, session.id))

      session.primoAccesso = false
    } else if (session.ruolo === 'medico') {
      await db
        .update(medici)
        .set({ passwordHash: newHash, updatedAt: new Date() })
        .where(eq(medici.id, session.id))
    } else if (session.ruolo === 'segreteria') {
      await db
        .update(staff)
        .set({ passwordHash: newHash })
        .where(eq(staff.id, session.id))
    } else if (session.ruolo === 'admin') {
      await db
        .update(amministratori)
        .set({ passwordHash: newHash, updatedAt: new Date() })
        .where(eq(amministratori.id, session.id))
    }

    await recordAuditLog({
      attoreId: session.id,
      attoreEmail: session.email,
      ruolo: session.ruolo,
      azione: 'CAMBIO_PASSWORD',
      entita: session.ruolo,
      entitaId: session.id,
      ip,
    })

    const newSignedToken = createSessionToken(session)
    const response = NextResponse.json({ success: true, message: 'Password aggiornata con successo' })

    response.cookies.set('auth_session', newSignedToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (err: any) {
    console.error('Errore cambio password:', err)
    return NextResponse.json({ error: err?.message || 'Errore interno' }, { status: 500 })
  }
}
