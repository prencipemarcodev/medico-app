import { NextResponse } from 'next/server'
import { getSession } from '@/lib/server-auth'
import { db, eq, and } from '@medico/db'
import { studi, medici, pazienti } from '@medico/db/schema'

export async function GET() {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 })
  }

  let studioInfo = null
  let mediciStudio: Array<{ id: string; nome: string; cognome: string; email: string }> = []

  let studioId = session.studioId
  let medicoId = session.medicoId

  // Se paziente e studioId non presente nel token, controlla se è stato associato nel DB
  if (session.ruolo === 'paziente' && !studioId) {
    const [p] = await db
      .select({ studioId: pazienti.studioId, medicoId: pazienti.medicoId })
      .from(pazienti)
      .where(eq(pazienti.id, session.id))
      .limit(1)

    if (p?.studioId) {
      studioId = p.studioId
      medicoId = p.medicoId || null
    }
  }

  if (studioId) {
    const [studio] = await db
      .select({
        id: studi.id,
        nome: studi.nome,
        codiceStudio: studi.codiceStudio,
        indirizzo: studi.indirizzo,
        telefono: studi.telefono,
      })
      .from(studi)
      .where(eq(studi.id, studioId))
      .limit(1)

    if (studio) {
      studioInfo = studio

      mediciStudio = await db
        .select({
          id: medici.id,
          nome: medici.nome,
          cognome: medici.cognome,
          email: medici.email,
        })
        .from(medici)
        .where(and(eq(medici.studioId, studio.id), eq(medici.attivo, true)))
        .orderBy(medici.cognome)
    }
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      ...session,
      studioId: studioId || null,
      medicoId: medicoId || null,
      codiceStudio: studioInfo?.codiceStudio || null,
      nomeStudio: studioInfo?.nome || null,
    },
    studio: studioInfo,
    medici: mediciStudio,
  })
}
