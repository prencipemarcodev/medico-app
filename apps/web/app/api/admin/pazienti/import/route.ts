import { NextResponse } from 'next/server'
import { db, hashPassword, generateTemporaryPassword, eq, sql, recordAuditLog } from '@medico/db'
import { pazienti } from '@medico/db/schema'
import { checkAuth } from '@/lib/server-auth'

interface PazienteCSVRow {
  nome: string
  cognome: string
  codiceFiscale: string
  dataNascita: string
  email?: string
  telefono?: string
}

export async function POST(request: Request) {
  const auth = await checkAuth(['admin'])
  if ('response' in auth) return auth.response

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'

  try {
    const body = await request.json()
    const { studioId, medicoId, pazienti: righe } = body

    if (!studioId || !medicoId) {
      return NextResponse.json(
        { error: 'Specificare lo studio medico e il medico curante di destinazione' },
        { status: 400 }
      )
    }

    if (!Array.isArray(righe) || righe.length === 0) {
      return NextResponse.json(
        { error: 'Nessun paziente fornito nel dataset' },
        { status: 400 }
      )
    }

    const credenzialiGenerate: Array<{
      id: string
      nome: string
      cognome: string
      codiceFiscale: string
      passwordTemporanea: string
      dataNascita: string
      email: string
      telefono: string
    }> = []

    const errori: Array<{ riga: number; cf: string; errore: string }> = []

    for (let i = 0; i < righe.length; i++) {
      const riga: PazienteCSVRow = righe[i]
      const nome = riga.nome?.trim()
      const cognome = riga.cognome?.trim()
      const cf = riga.codiceFiscale?.trim().toUpperCase()
      const dataNascita = riga.dataNascita?.trim()
      const email = riga.email?.trim() || null
      const telefono = riga.telefono?.trim() || null

      if (!nome || !cognome || !cf) {
        errori.push({
          riga: i + 1,
          cf: cf || 'MANCANTE',
          errore: 'Nome, cognome e codice fiscale sono obbligatori',
        })
        continue
      }

      // Validazione base formato CF italiano (16 caratteri alfanumerici)
      if (cf.length !== 16) {
        errori.push({
          riga: i + 1,
          cf,
          errore: 'Il Codice Fiscale deve contenere esattamente 16 caratteri',
        })
        continue
      }

      // Verifica se il paziente esiste già
      const [esistente] = await db
        .select({ id: pazienti.id })
        .from(pazienti)
        .where(eq(sql`upper(${pazienti.codiceFiscale})`, cf))
        .limit(1)

      if (esistente) {
        errori.push({
          riga: i + 1,
          cf,
          errore: 'Paziente con questo Codice Fiscale già registrato',
        })
        continue
      }

      // Genera password a 6 caratteri e calcola hash
      const passwordTemporanea = generateTemporaryPassword(6)
      const passwordHash = hashPassword(passwordTemporanea)

      // Format data di nascita fallback valida YYYY-MM-DD
      let dataNascitaFormatted = dataNascita || '1980-01-01'
      if (dataNascita && dataNascita.includes('/')) {
        // Formato DD/MM/YYYY -> YYYY-MM-DD
        const parts = dataNascita.split('/')
        if (parts.length === 3 && parts[2]?.length === 4) {
          dataNascitaFormatted = `${parts[2]}-${parts[1]?.padStart(2, '0')}-${parts[0]?.padStart(2, '0')}`
        }
      }

      const [inserito] = await db
        .insert(pazienti)
        .values({
          studioId,
          medicoId,
          nome,
          cognome,
          codiceFiscale: cf,
          dataNascita: dataNascitaFormatted,
          email,
          telefono,
          passwordHash,
          primoAccesso: true,
          attivo: true,
        })
        .returning()

      if (inserito) {
        credenzialiGenerate.push({
          id: inserito.id,
          nome: inserito.nome,
          cognome: inserito.cognome,
          codiceFiscale: inserito.codiceFiscale,
          passwordTemporanea,
          dataNascita: inserito.dataNascita,
          email: inserito.email || '—',
          telefono: inserito.telefono || '—',
        })
      }
    }

    if (credenzialiGenerate.length > 0) {
      await recordAuditLog({
        attoreId: auth.session.id,
        attoreEmail: auth.session.email,
        ruolo: 'admin',
        azione: 'IMPORT_CSV_PAZIENTI',
        entita: 'pazienti',
        entitaId: studioId,
        dettagli: {
          studioId,
          medicoId,
          totaleImportati: credenzialiGenerate.length,
          totaleErrori: errori.length,
        },
        ip,
      })
    }

    return NextResponse.json({
      success: true,
      totaleElaborati: righe.length,
      totaleImportati: credenzialiGenerate.length,
      credenziali: credenzialiGenerate,
      errori,
    })
  } catch (err: any) {
    console.error('Errore importazione dataset pazienti:', err)
    return NextResponse.json(
      { error: err?.message || 'Errore interno durante l\'importazione dei pazienti' },
      { status: 500 }
    )
  }
}
