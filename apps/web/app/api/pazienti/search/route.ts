import { NextResponse } from 'next/server'
import { db, eq, or, ilike, desc, and } from '@medico/db'
import { pazienti, medici, studi } from '@medico/db/schema'
import { checkAuth } from '@/lib/server-auth'

export async function GET(request: Request) {
  const auth = await checkAuth(['admin', 'medico', 'segreteria'])
  if ('response' in auth) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()
    let studioId = searchParams.get('studioId')
    let medicoId = searchParams.get('medicoId')

    // Isolamento dati per ruolo
    if (auth.session.ruolo === 'medico') {
      medicoId = auth.session.id
      if (auth.session.studioId) studioId = auth.session.studioId
    } else if (auth.session.ruolo === 'segreteria') {
      if (auth.session.studioId) studioId = auth.session.studioId
    }

    let conditions = [eq(pazienti.attivo, true)]

    if (studioId) {
      conditions.push(eq(pazienti.studioId, studioId))
    }

    if (medicoId) {
      conditions.push(eq(pazienti.medicoId, medicoId))
    }

    if (q && q.length > 0) {
      const pattern = `%${q}%`
      conditions.push(
        or(
          ilike(pazienti.nome, pattern),
          ilike(pazienti.cognome, pattern),
          ilike(pazienti.codiceFiscale, pattern),
          ilike(pazienti.email, pattern),
          ilike(pazienti.telefono, pattern)
        )!
      )
    }

    const list = await db
      .select({
        id: pazienti.id,
        nome: pazienti.nome,
        cognome: pazienti.cognome,
        codiceFiscale: pazienti.codiceFiscale,
        dataNascita: pazienti.dataNascita,
        email: pazienti.email,
        telefono: pazienti.telefono,
        primoAccesso: pazienti.primoAccesso,
        studioId: pazienti.studioId,
        nomeStudio: studi.nome,
        medicoId: pazienti.medicoId,
        nomeMedico: medici.nome,
        cognomeMedico: medici.cognome,
        createdAt: pazienti.createdAt,
      })
      .from(pazienti)
      .leftJoin(medici, eq(pazienti.medicoId, medici.id))
      .leftJoin(studi, eq(pazienti.studioId, studi.id))
      .where(and(...conditions))
      .orderBy(desc(pazienti.createdAt))
      .limit(50)

    return NextResponse.json({ success: true, pazienti: list })
  } catch (err: any) {
    console.error('Errore ricerca pazienti:', err)
    return NextResponse.json({ error: err?.message || 'Errore ricerca pazienti' }, { status: 500 })
  }
}
