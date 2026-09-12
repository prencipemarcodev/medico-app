import { cookies } from 'next/headers'
import { verifySessionToken, SessionPayload } from '@medico/db'
import { NextResponse } from 'next/server'

/**
 * Recupera e verifica crittograficamente la sessione dell'utente corrente.
 * Restituisce null se la sessione è mancante, scaduta o manomessa.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_session')?.value
  if (!token) return null

  return verifySessionToken(token)
}

/**
 * Assicura che la richiesta provenga da un utente con uno dei ruoli consentiti.
 * Se non autorizzato, restituisce una risposta NextResponse di errore (401 o 403).
 */
export async function checkAuth(
  allowedRoles?: Array<'admin' | 'medico' | 'segreteria' | 'paziente'>
): Promise<{ session: SessionPayload } | { response: NextResponse }> {
  const session = await getSession()

  if (!session) {
    return {
      response: NextResponse.json(
        { error: 'Autenticazione richiesta. Effettua il login.' },
        { status: 401 }
      ),
    }
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.ruolo)) {
    return {
      response: NextResponse.json(
        { error: 'Accesso negato. Permessi insufficienti per questa operazione.' },
        { status: 403 }
      ),
    }
  }

  return { session }
}
