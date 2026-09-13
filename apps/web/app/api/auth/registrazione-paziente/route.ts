import { NextResponse } from 'next/server'
import { db, hashPassword, createSessionToken, eq, and, sql, recordAuditLog } from '@medico/db'
import { studi, medici, pazienti } from '@medico/db/schema'

function extractBirthDateFromCF(cf: string): string | null {
  if (cf.length !== 16) return null
  const yearPart = parseInt(cf.slice(6, 8), 10)
  const monthChar = cf[8]?.toUpperCase()
  let dayPart = parseInt(cf.slice(9, 11), 10)
  if (isNaN(yearPart) || isNaN(dayPart)) return null
  if (dayPart > 40) dayPart -= 40
  const months: Record<string, string> = {
    A: '01', B: '02', C: '03', D: '04', E: '05', H: '06',
    L: '07', M: '08', P: '09', R: '10', S: '11', T: '12',
  }
  const month = months[monthChar!]
  if (!month) return null
  const currentYearShort = new Date().getFullYear() % 100
  const century = yearPart <= currentYearShort ? '20' : '19'
  return `${century}${yearPart.toString().padStart(2, '0')}-${month}-${dayPart.toString().padStart(2, '0')}`
}

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

    // 1. Validazione campi obbligatori per la registrazione autonoma
    if (!nome?.trim() || !cognome?.trim() || !codiceFiscale?.trim() || !telefono?.trim() || !password) {
      return NextResponse.json(
        { error: 'Compila tutti i campi obbligatori: Nome, Cognome, Codice Fiscale, Telefono e Password' },
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

    // 4. Se forniti, verifica Studio Medico e Medico Curante
    let verifiedStudioId: string | null = null
    let verifiedMedicoId: string | null = null
    let nomeStudio: string | null = null
    let nomeMedico: string | null = null

    if (codiceStudio?.trim()) {
      const cleanCodiceStudio = codiceStudio.trim().toUpperCase()
      const [studio] = await db
        .select({ id: studi.id, nome: studi.nome, attivo: studi.attivo })
        .from(studi)
        .where(eq(studi.codiceStudio, cleanCodiceStudio))
        .limit(1)

      if (studio && studio.attivo) {
        verifiedStudioId = studio.id
        nomeStudio = studio.nome

        if (medicoId) {
          const [medico] = await db
            .select({ id: medici.id, nome: medici.nome, cognome: medici.cognome, attivo: medici.attivo })
            .from(medici)
            .where(and(eq(medici.id, medicoId), eq(medici.studioId, studio.id), eq(medici.attivo, true)))
            .limit(1)

          if (medico) {
            verifiedMedicoId = medico.id
            nomeMedico = `${medico.nome} ${medico.cognome}`
          }
        }
      }
    }

    // 5. Verifica univocità Codice Fiscale
    const [esistenteCf] = await db
      .select({ id: pazienti.id })
      .from(pazienti)
      .where(eq(sql`upper(${pazienti.codiceFiscale})`, cleanCf))
      .limit(1)

    if (esistenteCf) {
      return NextResponse.json(
        { error: 'Un paziente con questo Codice Fiscale è già registrato. Accedi direttamente con le tue credenziali.' },
        { status: 409 }
      )
    }

    // 6. Normalizzazione email e verifica univocità se fornita
    const cleanEmail = email?.trim().toLowerCase() || null
    if (cleanEmail) {
      const [esistenteEmail] = await db
        .select({ id: pazienti.id })
        .from(pazienti)
        .where(eq(sql`lower(${pazienti.email})`, cleanEmail))
        .limit(1)

      if (esistenteEmail) {
        return NextResponse.json(
          { error: 'Questa email è già associata a un altro account registrato' },
          { status: 409 }
        )
      }
    }

    // 7. Determinazione data di nascita
    let dataNascitaFormatted: string | null = null
    if (dataNascita?.trim()) {
      let raw = dataNascita.trim()
      if (raw.includes('/')) {
        const parts = raw.split('/')
        if (parts.length === 3 && parts[2]?.length === 4) {
          dataNascitaFormatted = `${parts[2]}-${parts[1]?.padStart(2, '0')}-${parts[0]?.padStart(2, '0')}`
        }
      } else {
        dataNascitaFormatted = raw
      }
    } else {
      dataNascitaFormatted = extractBirthDateFromCF(cleanCf)
    }

    // 8. Creazione record Paziente
    const passwordHash = hashPassword(password)
    const cleanTelefono = telefono.trim()

    const [nuovoPaziente] = await db
      .insert(pazienti)
      .values({
        studioId: verifiedStudioId,
        medicoId: verifiedMedicoId,
        nome: nome.trim(),
        cognome: cognome.trim(),
        codiceFiscale: cleanCf,
        dataNascita: dataNascitaFormatted,
        email: cleanEmail,
        telefono: cleanTelefono,
        passwordHash,
        primoAccesso: false,
        pushConsenso: true,
        attivo: true,
      })
      .returning()

    if (!nuovoPaziente) {
      throw new Error('Impossibile completare la registrazione del paziente')
    }

    // 9. Creazione sessione crittografata
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

    // 10. Tracciamento Audit Log GDPR
    await recordAuditLog({
      attoreId: nuovoPaziente.id,
      attoreEmail: nuovoPaziente.codiceFiscale,
      ruolo: 'paziente',
      azione: 'REGISTRAZIONE_AUTONOMA_PAZIENTE',
      entita: 'pazienti',
      entitaId: nuovoPaziente.id,
      dettagli: {
        studioId: verifiedStudioId,
        medicoId: verifiedMedicoId,
        nomeStudio,
        nomeMedico,
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
