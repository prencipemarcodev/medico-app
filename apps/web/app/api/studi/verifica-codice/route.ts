import { NextResponse } from 'next/server'
import { db, eq, and } from '@medico/db'
import { studi, medici } from '@medico/db/schema'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const codice = searchParams.get('codice')?.trim().toUpperCase()

    if (!codice || codice.length < 4) {
      return NextResponse.json(
        { error: 'Inserisci un codice studio valido' },
        { status: 400 }
      )
    }

    const [studio] = await db
      .select({
        id: studi.id,
        nome: studi.nome,
        codiceStudio: studi.codiceStudio,
        indirizzo: studi.indirizzo,
        telefono: studi.telefono,
        email: studi.email,
        attivo: studi.attivo,
      })
      .from(studi)
      .where(eq(studi.codiceStudio, codice))
      .limit(1)

    if (!studio || !studio.attivo) {
      return NextResponse.json(
        { error: 'Nessuno studio medico trovato con questo codice o studio non attivo' },
        { status: 404 }
      )
    }

    // Recupera anche i medici attivi dello studio
    const mediciDelloStudio = await db
      .select({
        id: medici.id,
        nome: medici.nome,
        cognome: medici.cognome,
        email: medici.email,
        telefonoPrimario: medici.telefonoPrimario,
      })
      .from(medici)
      .where(and(eq(medici.studioId, studio.id), eq(medici.attivo, true)))
      .orderBy(medici.cognome)

    return NextResponse.json({
      success: true,
      studio: {
        id: studio.id,
        nome: studio.nome,
        codiceStudio: studio.codiceStudio,
        indirizzo: studio.indirizzo,
        telefono: studio.telefono,
      },
      medici: mediciDelloStudio,
    })
  } catch (err: any) {
    console.error('Errore verifica codice studio:', err)
    return NextResponse.json(
      { error: err?.message || 'Errore durante la verifica del codice studio' },
      { status: 500 }
    )
  }
}
