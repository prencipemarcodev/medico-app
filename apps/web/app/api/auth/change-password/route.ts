import { NextResponse } from 'next/server'
import { db, hashPassword, eq } from '@medico/db'
import { pazienti, medici, staff, amministratori } from '@medico/db/schema'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('auth_session')

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Sessione non autenticata' }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
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
        .set({ passwordHash: newHash, primoAccesso: false, updatedAt: new Date() })
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

    const response = NextResponse.json({ success: true, message: 'Password aggiornata con successo' })
    response.cookies.set('auth_session', JSON.stringify(session), {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
    })
    return response
  } catch (err: any) {
    console.error('Errore cambio password:', err)
    return NextResponse.json({ error: err?.message || 'Errore interno' }, { status: 500 })
  }
}
