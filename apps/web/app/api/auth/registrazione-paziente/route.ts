import { NextResponse } from 'next/server'
import { db, hashPassword, createSessionToken, eq, and, sql, recordAuditLog } from '@medico/db'
import { studi, medici, pazienti } from '@medico/db/schema'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'

  try {
    const body = await request.json()
    const {
      codiceStudio,
      medicoId,
      nome,
      cognome,
      codiceFiscale,
      dataNascita,
      email,
      telefono,
      password,
    } = body

    // 1. Validazione campi obbligatori
    if (!codiceStudio || !medicoId || !nome || !cognome || !codiceFiscale || !dataNascita || !password) {
      return NextResponse.json(
        { error: 'Compila tutti i campi obbligatori: Studio, Medico, Nome, Cognome, Codice Fiscale, Data di Nascita e Password' },
        { status: 400 }
      )
    }

    // 2. Validazione Codice Fiscale (16 caratteri alfanumerici)
    const cleanCf = codiceFiscale.trim().toUpperCase()
    if (!/^[A-Z0-9]{16}$/.test(cleanCf)) {
      return NextResponse.json(
        { error: 'Il Codice Fiscale deve contenere esattamente 16 caratteri alfanumerici (es. RSSMRA85M01H501Z)' },
        { status: 400 }
      )
    }

    // 3. Validazione Password (min 8 caratteri)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La password deve contenere almeno 8 caratteri' },
        { status: 400 }
      )
    }

    // 4. Verifica Studio Medico attivo
    const cleanCodiceStudio = codiceStudio.trim().toUpperCase()
    const [studio] = await db
      .select({ id: studi.id, nome: studi.nome, attivo: studi.attivo })
      .from(studi)
      .where(eq(studi.codiceStudio, cleanCodiceStudio))
      .limit(1)

    if (!studio || !studio.attivo) {
      return NextResponse.json(
        { error: 'Codice Studio non valido o studio medico non attivo' },
        { status: 404 }
      )
    }

    // 5. Verifica Medico Curante attivo e appartenente allo Studio
    const [medico] = await db
      .select({ id: medici.id, nome: medici.nome, cognome: medici.cognome, attivo: medici.attivo })
      .from(medici)
      .where(and(eq(medici.id, medicoId), eq(medici.studioId, studio.id), eq(medici.attivo, true)))
      .limit(1)

    if (!medico) {
      return NextResponse.json(
        { error: 'Medico curante selezionato non trovato o non attivo in questo studio' },
        { status: 404 }
      )
    }

    // 6. Verifica univocità Codice Fiscale
    const [esistenteCf] = await db
      .select({ id: pazienti.id })
      .from(pazienti)
      .where(eq(sql`upper(${pazienti.codiceFiscale})`, cleanCf))
      .limit(1)

    if (esistenteCf) {
      return NextResponse.json(
        { error: 'Un paziente con questo Codice Fiscale è già registrato. Accedi con il tuo Codice Fiscale.' },
        { status: 409 }
      )
    }

    // 7. Normalizzazione email e verifica univocità se fornita
    const cleanEmail = email?.trim().toLowerCase() || null
    if (cleanEmail) {
      const [esistenteEmail] = await db
        .select({ id: pazienti.id })
        .from(pazienti)
        .where(eq(sql`lower(${pazienti.email})`, cleanEmail))
        .limit(1)

      if (esistenteEmail) {
        return NextResponse.json(
          { error: 'Questa email è già associata a un altro assistito registrato' },
          { status: 409 }
        )
      }
    }

    // 8. Normalizzazione data di nascita (supporto YYYY-MM-DD e DD/MM/YYYY)
    let dataNascitaFormatted = dataNascita.trim()
    if (dataNascitaFormatted.includes('/')) {
      const parts = dataNascitaFormatted.split('/')
      if (parts.length === 3 && parts[2]?.length === 4) {
        dataNascitaFormatted = `${parts[2]}-${parts[1]?.padStart(2, '0')}-${parts[0]?.padStart(2, '0')}`
      }
    }

    // 9. Creazione record Paziente con password hashata
    const passwordHash = hashPassword(password)
    const cleanTelefono = telefono?.trim() || null

    const [nuovoPaziente] = await db
      .insert(pazienti)
      .values({
        studioId: studio.id,
        medicoId: medico.id,
        nome: nome.trim(),
        cognome: cognome.trim(),
        codiceFiscale: cleanCf,
        dataNascita: dataNascitaFormatted,
        email: cleanEmail,
        telefono: cleanTelefono,
        passwordHash,
        primoAccesso: false, // Ha impostato autonomamente la password
        pushConsenso: true,
        attivo: true,
      })
      .returning()

    if (!nuovoPaziente) {
      throw new Error('Impossibile completare la registrazione del paziente')
    }

    // 10. Creazione sessione crittografata con cookie HTTP-only
    const userPayload = {
      id: nuovoPaziente.id,
      nome: nuovoPaziente.nome,
      cognome: nuovoPaziente.cognome,
      codiceFiscale: nuovoPaziente.codiceFiscale,
      email: nuovoPaziente.email,
      studioId: nuovoPaziente.studioId,
      medicoId: nuovoPaziente.medicoId,
      primoAccesso: false,
      ruolo: 'paziente' as const,
    }

    const token = createSessionToken(userPayload)

    // 11. Tracciamento Audit Log GDPR
    await recordAuditLog({
      attoreId: nuovoPaziente.id,
      attoreEmail: nuovoPaziente.codiceFiscale,
      ruolo: 'paziente',
      azione: 'REGISTRAZIONE_AUTONOMA_PAZIENTE',
      entita: 'pazienti',
      entitaId: nuovoPaziente.id,
      dettagli: {
        studioId: studio.id,
        medicoId: medico.id,
        nomeStudio: studio.nome,
        nomeMedico: `${medico.nome} ${medico.cognome}`,
      },
      ip,
    })

    const response = NextResponse.json({
      success: true,
      redirectUrl: '/paziente',
      paziente: userPayload,
    })

    response.cookies.set('auth_session', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (err: any) {
    console.error('Errore registrazione autonoma paziente:', err)
    return NextResponse.json(
      { error: err?.message || 'Errore durante la registrazione del paziente' },
      { status: 500 }
    )
  }
}
