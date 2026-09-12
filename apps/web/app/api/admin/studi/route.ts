import { NextResponse } from 'next/server'
import { db, sql, desc, recordAuditLog } from '@medico/db'
import { studi, medici, pazienti } from '@medico/db/schema'
import { checkAuth } from '@/lib/server-auth'

export async function GET() {
  const auth = await checkAuth(['admin'])
  if ('response' in auth) return auth.response

  try {
    const list = await db
      .select({
        id: studi.id,
        nome: studi.nome,
        indirizzo: studi.indirizzo,
        telefono: studi.telefono,
        email: studi.email,
        config: studi.config,
        attivo: studi.attivo,
        createdAt: studi.createdAt,
      })
      .from(studi)
      .orderBy(desc(studi.createdAt))

    // Conta medici e pazienti per ciascuno studio
    const [mediciCounts, pazientiCounts] = await Promise.all([
      db
        .select({
          studioId: medici.studioId,
          count: sql<number>`count(*)`,
        })
        .from(medici)
        .groupBy(medici.studioId),
      db
        .select({
          studioId: pazienti.studioId,
          count: sql<number>`count(*)`,
        })
        .from(pazienti)
        .groupBy(pazienti.studioId),
    ])

    const medMap = new Map(mediciCounts.map((m) => [m.studioId, Number(m.count)]))
    const pazMap = new Map(pazientiCounts.map((p) => [p.studioId, Number(p.count)]))

    const result = list.map((s) => ({
      ...s,
      totaleMedici: medMap.get(s.id) || 0,
      totalePazienti: pazMap.get(s.id) || 0,
    }))

    return NextResponse.json({ success: true, studi: result })
  } catch (err: any) {
    console.error('Errore get studi:', err)
    return NextResponse.json({ error: err?.message || 'Errore recupero studi' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await checkAuth(['admin'])
  if ('response' in auth) return auth.response

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'

  try {
    const body = await request.json()
    const {
      nome,
      citta,
      indirizzo,
      telefono,
      email,
      durataVisita = 20,
      lockupMinutes = 10,
      anticipoMax = 30,
    } = body

    if (!nome || !citta) {
      return NextResponse.json(
        { error: 'Nome dello studio e città sono obbligatori' },
        { status: 400 }
      )
    }

    const emailStudio = email?.trim() || `info@${nome.toLowerCase().replace(/[^a-z0-9]/g, '') || 'studio'}.it`

    const [nuovo] = await db
      .insert(studi)
      .values({
        nome: nome.trim(),
        indirizzo: indirizzo ? `${indirizzo.trim()}, ${citta.trim()}` : citta.trim(),
        telefono: telefono?.trim() || null,
        email: emailStudio,
        config: {
          citta: citta.trim(),
          indirizzoCompleto: indirizzo?.trim() || '',
          durataVisitaStandardMinuti: Number(durataVisita),
          lockupMinutes: Number(lockupMinutes),
          anticipoMaxPrenotazioneGiorni: Number(anticipoMax),
          onboardingCompleted: true,
        },
        attivo: true,
      })
      .returning()

    if (!nuovo) {
      return NextResponse.json({ error: 'Errore inserimento studio' }, { status: 500 })
    }

    await recordAuditLog({
      attoreId: auth.session.id,
      attoreEmail: auth.session.email,
      ruolo: 'admin',
      azione: 'STUDIO_CREATO',
      entita: 'studio',
      entitaId: nuovo.id,
      dettagli: { nome: nuovo.nome, indirizzo: nuovo.indirizzo },
      ip,
    })

    return NextResponse.json({ success: true, studio: nuovo })
  } catch (err: any) {
    console.error('Errore creazione studio:', err)
    return NextResponse.json({ error: err?.message || 'Errore creazione studio' }, { status: 500 })
  }
}
