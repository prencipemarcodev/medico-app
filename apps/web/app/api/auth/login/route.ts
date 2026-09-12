import { NextResponse } from 'next/server'
import { db, verifyPassword, eq, or, sql } from '@medico/db'
import { amministratori, medici, staff, pazienti, studi } from '@medico/db/schema'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { identifier, password } = body

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Inserire Codice Fiscale / Email e Password' },
        { status: 400 }
      )
    }

    const cleanIdentifier = String(identifier).trim()
    const isEmail = cleanIdentifier.includes('@')

    // 1. Verifica Amministratore (per email)
    if (isEmail) {
      const [admin] = await db
        .select()
        .from(amministratori)
        .where(eq(sql`lower(${amministratori.email})`, cleanIdentifier.toLowerCase()))
        .limit(1)

      if (admin && admin.attivo) {
        const ok = verifyPassword(password, admin.passwordHash)
        if (ok) {
          const userPayload = {
            id: admin.id,
            nome: admin.nome,
            cognome: admin.cognome,
            email: admin.email,
            ruolo: 'admin',
          }
          const response = NextResponse.json({
            success: true,
            user: userPayload,
            redirectUrl: '/admin',
          })
          response.cookies.set('auth_session', JSON.stringify(userPayload), {
            path: '/',
            httpOnly: false, // Accessibile lato client per visualizzare nome e ruolo
            maxAge: 60 * 60 * 24 * 7,
          })
          return response
        }
      }
    }

    // 2. Verifica Medico Curante (per email)
    if (isEmail) {
      const [medico] = await db
        .select()
        .from(medici)
        .where(eq(sql`lower(${medici.email})`, cleanIdentifier.toLowerCase()))
        .limit(1)

      if (medico && medico.attivo) {
        const ok = verifyPassword(password, medico.passwordHash)
        if (ok) {
          const userPayload = {
            id: medico.id,
            nome: medico.nome,
            cognome: medico.cognome,
            email: medico.email,
            studioId: medico.studioId,
            ruolo: 'medico',
          }
          const response = NextResponse.json({
            success: true,
            user: userPayload,
            redirectUrl: '/dashboard',
          })
          response.cookies.set('auth_session', JSON.stringify(userPayload), {
            path: '/',
            httpOnly: false,
            maxAge: 60 * 60 * 24 * 7,
          })
          return response
        }
      }
    }

    // 3. Verifica Staff / Segreteria (per email)
    if (isEmail) {
      const [operatore] = await db
        .select()
        .from(staff)
        .where(eq(sql`lower(${staff.email})`, cleanIdentifier.toLowerCase()))
        .limit(1)

      if (operatore && operatore.attivo) {
        const ok = verifyPassword(password, operatore.passwordHash)
        if (ok) {
          const userPayload = {
            id: operatore.id,
            nome: operatore.nome,
            cognome: operatore.cognome,
            email: operatore.email,
            studioId: operatore.studioId,
            ruolo: 'segreteria',
          }
          const response = NextResponse.json({
            success: true,
            user: userPayload,
            redirectUrl: '/segreteria',
          })
          response.cookies.set('auth_session', JSON.stringify(userPayload), {
            path: '/',
            httpOnly: false,
            maxAge: 60 * 60 * 24 * 7,
          })
          return response
        }
      }
    }

    // 4. Verifica Paziente (per Codice Fiscale o Email)
    const upperCF = cleanIdentifier.toUpperCase()
    const [paziente] = await db
      .select()
      .from(pazienti)
      .where(
        or(
          eq(sql`upper(${pazienti.codiceFiscale})`, upperCF),
          eq(sql`lower(${pazienti.email})`, cleanIdentifier.toLowerCase())
        )
      )
      .limit(1)

    if (paziente && paziente.attivo) {
      const ok = verifyPassword(password, paziente.passwordHash)
      if (ok) {
        const userPayload = {
          id: paziente.id,
          nome: paziente.nome,
          cognome: paziente.cognome,
          codiceFiscale: paziente.codiceFiscale,
          email: paziente.email,
          studioId: paziente.studioId,
          medicoId: paziente.medicoId,
          primoAccesso: paziente.primoAccesso,
          ruolo: 'paziente',
        }
        const response = NextResponse.json({
          success: true,
          user: userPayload,
          redirectUrl: '/paziente',
        })
        response.cookies.set('auth_session', JSON.stringify(userPayload), {
          path: '/',
          httpOnly: false,
          maxAge: 60 * 60 * 24 * 7,
        })
        return response
      }
    }

    return NextResponse.json(
      { error: 'Credenziali non valide. Verifica Codice Fiscale/Email e Password.' },
      { status: 401 }
    )
  } catch (err: any) {
    console.error('Errore API login:', err)
    return NextResponse.json(
      { error: err?.message || 'Errore interno di autenticazione' },
      { status: 500 }
    )
  }
}
