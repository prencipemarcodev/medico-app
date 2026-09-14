import { NextResponse } from 'next/server'
import { db, hashPassword, generateTemporaryPassword, eq, inArray, sql, recordAuditLog } from '@medico/db'
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

    // Pre-caricamento in blocco dei codici fiscali già esistenti
    const cfs = righe
      .map((r: any) => r.codiceFiscale?.trim().toUpperCase())
      .filter((c: string | undefined): c is string => Boolean(c && c.length === 16))

    const existingRows = cfs.length > 0
      ? await db
          .select({ cf: sql<string>`upper(${pazienti.codiceFiscale})` })
          .from(pazienti)
          .where(inArray(sql`upper(${pazienti.codiceFiscale})`, cfs))
      : []

    const existingSet = new Set(existingRows.map((r) => r.cf))

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

      // Verifica se il paziente esiste già (o duplicato nel medesimo dataset)
      if (existingSet.has(cf)) {
        errori.push({
          riga: i + 1,
          cf,
          errore: 'Paziente con questo Codice Fiscale già registrato o duplicato',
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
        existingSet.add(cf)
        credenzialiGenerate.push({
          id: inserito.id,
          nome: inserito.nome,
          cognome: inserito.cognome,
          codiceFiscale: inserito.codiceFiscale,
          passwordTemporanea,
          dataNascita: inserito.dataNascita || '—',
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
