import { NextResponse } from 'next/server'
import { db, sql, eq, and, or, isNull, recordAuditLog, hashPassword, generateTemporaryPassword } from '@medico/db'
import { pazienti } from '@medico/db/schema'
import { checkAuth } from '@/lib/server-auth'

export async function POST(request: Request) {
  const auth = await checkAuth(['admin', 'segreteria'])
  if ('response' in auth) return auth.response

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'

  try {
    const body = await request.json().catch(() => ({}))
    const { studioId, medicoId, pazienteId } = body

    const conditions = [
      eq(pazienti.attivo, true),
      eq(pazienti.primoAccesso, true),
      or(isNull(pazienti.passwordIniziale), eq(pazienti.passwordIniziale, ''))!,
    ]

    // Isolamento sicurezza per ruolo segreteria
    if (auth.session.ruolo === 'segreteria') {
      if (auth.session.studioId) {
        conditions.push(eq(pazienti.studioId, auth.session.studioId))
      }
    } else if (studioId) {
      conditions.push(eq(pazienti.studioId, studioId))
    }

    if (medicoId) {
      conditions.push(eq(pazienti.medicoId, medicoId))
    }

    if (pazienteId) {
      conditions.push(eq(pazienti.id, pazienteId))
    }

    // Seleziona i pazienti candidati (SOLO primo_accesso = true e senza password iniziale valorizzata)
    // Non tocca in alcun modo gli utenti vecchi o attivi che hanno già la loro password personale!
    const candidati = await db
      .select({
        id: pazienti.id,
        nome: pazienti.nome,
        cognome: pazienti.cognome,
        codiceFiscale: pazienti.codiceFiscale,
        dataNascita: pazienti.dataNascita,
        email: pazienti.email,
        telefono: pazienti.telefono,
        studioId: pazienti.studioId,
        medicoId: pazienti.medicoId,
      })
      .from(pazienti)
      .where(and(...conditions))
      .limit(1000)

    if (candidati.length === 0) {
      return NextResponse.json({
        success: true,
        totaleGenerati: 0,
        message: 'Tutti i pazienti in 1° accesso dispongono già di credenziali provvisorie. Nessun utente necessita di generazione.',
        credenziali: [],
      })
    }

    const credenziali: Array<{
      id: string
      nome: string
      cognome: string
      codiceFiscale: string
      passwordTemporanea: string
      dataNascita: string
      email: string
      telefono: string
    }> = []

    const updatesWithHash: Array<[string, string, string]> = []

    for (const p of candidati) {
      const pwd = generateTemporaryPassword(6)
      const hash = hashPassword(pwd)
      credenziali.push({
        id: p.id,
        nome: p.nome,
        cognome: p.cognome,
        codiceFiscale: p.codiceFiscale,
        passwordTemporanea: pwd,
        dataNascita: p.dataNascita || '—',
        email: p.email || '—',
        telefono: p.telefono || '—',
      })
      updatesWithHash.push([p.id, pwd, hash])
    }

    // Aggiornamento massivo ad altissime prestazioni in singola query atomica
    if (updatesWithHash.length > 0) {
      const valuesList = updatesWithHash.map(([id, pwd, hash]) => 
        sql`(${id}::uuid, ${pwd}, ${hash})`
      )
      
      await db.execute(sql`
        UPDATE pazienti AS p
        SET 
          password_iniziale = v.pwd,
          password_hash = v.hash,
          primo_accesso = true,
          updated_at = NOW()
        FROM (VALUES ${sql.join(valuesList, sql`, `)}) AS v(id, pwd, hash)
        WHERE p.id = v.id
      `)
    }

    // Registra nell'Audit Log di sicurezza
    await recordAuditLog({
      attoreId: auth.session.id,
      attoreEmail: auth.session.email,
      ruolo: auth.session.ruolo,
      azione: 'GENERA_PASSWORD_MANCANTI_PAZIENTI',
      entita: 'pazienti',
      entitaId: pazienteId || studioId || 'tutti',
      dettagli: {
        totaleGenerati: credenziali.length,
        studioId: studioId || auth.session.studioId || null,
        medicoId: medicoId || null,
      },
      ip,
    })

    return NextResponse.json({
      success: true,
      totaleGenerati: credenziali.length,
      credenziali,
    })
  } catch (err: any) {
    console.error('Errore generazione password mancanti:', err)
    return NextResponse.json(
      { error: err?.message || 'Errore durante la generazione delle password mancanti' },
      { status: 500 }
    )
  }
}
