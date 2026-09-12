import { NextResponse } from 'next/server'
import { db, hashPassword, generateTemporaryPassword, eq, and, sql, recordAuditLog } from '@medico/db'
import { pazienti, medici, studi } from '@medico/db/schema'
import { checkAuth } from '@/lib/server-auth'

export async function POST(request: Request) {
  const auth = await checkAuth(['admin', 'medico', 'segreteria'])
  if ('response' in auth) return auth.response

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'

  try {
    const body = await request.json()
    let {
      studioId,
      medicoId,
      nome,
      cognome,
      codiceFiscale,
      dataNascita,
      email,
      telefono,
      passwordPersonalizzata,
    } = body

    // Regole di isolamento e determinazione Studio/Medico per ruolo
    if (auth.session.ruolo === 'medico') {
      medicoId = auth.session.id
      studioId = auth.session.studioId || studioId

      if (!studioId) {
        // Recupera studioId dal record del medico se assente nella sessione
        const [m] = await db
          .select({ studioId: medici.studioId })
          .from(medici)
          .where(eq(medici.id, medicoId))
          .limit(1)
        studioId = m?.studioId
      }
    } else if (auth.session.ruolo === 'segreteria') {
      studioId = auth.session.studioId || studioId
      if (!medicoId) {
        return NextResponse.json(
          { error: 'Seleziona il Medico Curante a cui assegnare il paziente' },
          { status: 400 }
        )
      }

      // Verifica che il medico appartenga allo stesso studio della segreteria
      const [medicoVerificato] = await db
        .select({ id: medici.id })
        .from(medici)
        .where(and(eq(medici.id, medicoId), eq(medici.studioId, studioId), eq(medici.attivo, true)))
        .limit(1)

      if (!medicoVerificato) {
        return NextResponse.json(
          { error: 'Il medico selezionato non appartiene al tuo studio medico' },
          { status: 403 }
        )
      }
    }

    if (!studioId || !medicoId) {
      return NextResponse.json(
        { error: 'Studio medico e Medico curante sono obbligatori' },
        { status: 400 }
      )
    }

    // Validazione dati paziente
    const cleanNome = nome?.trim()
    const cleanCognome = cognome?.trim()
    const cleanCf = codiceFiscale?.trim().toUpperCase()

    if (!cleanNome || !cleanCognome || !cleanCf || !dataNascita) {
      return NextResponse.json(
        { error: 'Nome, Cognome, Codice Fiscale e Data di Nascita sono obbligatori' },
        { status: 400 }
      )
    }

    if (!/^[A-Z0-9]{16}$/.test(cleanCf)) {
      return NextResponse.json(
        { error: 'Il Codice Fiscale deve contenere esattamente 16 caratteri alfanumerici' },
        { status: 400 }
      )
    }

    // Verifica univocità Codice Fiscale
    const [esistenteCf] = await db
      .select({ id: pazienti.id })
      .from(pazienti)
      .where(eq(sql`upper(${pazienti.codiceFiscale})`, cleanCf))
      .limit(1)

    if (esistenteCf) {
      return NextResponse.json(
        { error: 'Un paziente con questo Codice Fiscale è già presente nel database' },
        { status: 409 }
      )
    }

    // Verifica email se specificata
    const cleanEmail = email?.trim().toLowerCase() || null
    if (cleanEmail) {
      const [esistenteEmail] = await db
        .select({ id: pazienti.id })
        .from(pazienti)
        .where(eq(sql`lower(${pazienti.email})`, cleanEmail))
        .limit(1)

      if (esistenteEmail) {
        return NextResponse.json(
          { error: 'Questa email è già associata a un altro paziente registrato' },
          { status: 409 }
        )
      }
    }

    // Normalizzazione data di nascita
    let dataNascitaFormatted = dataNascita.trim()
    if (dataNascitaFormatted.includes('/')) {
      const parts = dataNascitaFormatted.split('/')
      if (parts.length === 3 && parts[2]?.length === 4) {
        dataNascitaFormatted = `${parts[2]}-${parts[1]?.padStart(2, '0')}-${parts[0]?.padStart(2, '0')}`
      }
    }

    // Password: se fornita dall'operatore usa quella, altrimenti genera codice temporaneo di 6 caratteri
    const isCustomPassword = Boolean(passwordPersonalizzata && passwordPersonalizzata.trim().length >= 6)
    const passwordInChiaro = isCustomPassword
      ? passwordPersonalizzata.trim()
      : generateTemporaryPassword(6)
    const passwordHash = hashPassword(passwordInChiaro)

    const [nuovoPaziente] = await db
      .insert(pazienti)
      .values({
        studioId,
        medicoId,
        nome: cleanNome,
        cognome: cleanCognome,
        codiceFiscale: cleanCf,
        dataNascita: dataNascitaFormatted,
        email: cleanEmail,
        telefono: telefono?.trim() || null,
        passwordHash,
        primoAccesso: !isCustomPassword, // Se generata, richiede primo accesso
        pushConsenso: false,
        attivo: true,
      })
      .returning()

    if (!nuovoPaziente) {
      throw new Error('Errore nella creazione del record paziente')
    }

    // Audit log
    await recordAuditLog({
      attoreId: auth.session.id,
      attoreEmail: auth.session.email,
      ruolo: auth.session.ruolo,
      azione: 'CREA_SINGOLO_PAZIENTE',
      entita: 'pazienti',
      entitaId: nuovoPaziente.id,
      dettagli: {
        studioId,
        medicoId,
        pazienteCf: cleanCf,
      },
      ip,
    })

    return NextResponse.json({
      success: true,
      paziente: {
        id: nuovoPaziente.id,
        nome: nuovoPaziente.nome,
        cognome: nuovoPaziente.cognome,
        codiceFiscale: nuovoPaziente.codiceFiscale,
        dataNascita: nuovoPaziente.dataNascita,
        email: nuovoPaziente.email,
        telefono: nuovoPaziente.telefono,
        passwordTemporanea: passwordInChiaro,
        primoAccesso: nuovoPaziente.primoAccesso,
      },
    })
  } catch (err: any) {
    console.error('Errore creazione paziente:', err)
    return NextResponse.json(
      { error: err?.message || 'Errore interno durante la creazione del paziente' },
      { status: 500 }
    )
  }
}
