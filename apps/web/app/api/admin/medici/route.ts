import { NextResponse } from 'next/server'
import { db, hashPassword, eq, sql, desc } from '@medico/db'
import { medici, studi, pazienti, slotAgenda } from '@medico/db/schema'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studioId = searchParams.get('studioId')

    let query = db
      .select({
        id: medici.id,
        studioId: medici.studioId,
        nomeStudio: studi.nome,
        nome: medici.nome,
        cognome: medici.cognome,
        email: medici.email,
        telefonoPrimario: medici.telefonoPrimario,
        attivo: medici.attivo,
        createdAt: medici.createdAt,
      })
      .from(medici)
      .leftJoin(studi, eq(medici.studioId, studi.id))
      .orderBy(desc(medici.createdAt))

    const list = studioId
      ? await query.where(eq(medici.studioId, studioId))
      : await query

    // Conteggio pazienti per ciascun medico
    const countList = await db
      .select({
        medicoId: pazienti.medicoId,
        count: sql<number>`count(*)`,
      })
      .from(pazienti)
      .groupBy(pazienti.medicoId)

    const countMap = new Map(countList.map((c) => [c.medicoId, Number(c.count)]))

    const result = list.map((m) => ({
      ...m,
      totalePazienti: countMap.get(m.id) || 0,
    }))

    return NextResponse.json({ success: true, medici: result })
  } catch (err: any) {
    console.error('Errore get medici:', err)
    return NextResponse.json({ error: err?.message || 'Errore recupero medici' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      studioId,
      nome,
      cognome,
      email,
      telefono,
      password = 'medicoPassword2026',
    } = body

    if (!studioId || !nome || !cognome || !email) {
      return NextResponse.json(
        { error: 'Studio, nome, cognome ed email sono obbligatori' },
        { status: 400 }
      )
    }

    const [medico] = await db
      .insert(medici)
      .values({
        studioId,
        nome: nome.trim(),
        cognome: cognome.trim(),
        email: email.trim().toLowerCase(),
        telefonoPrimario: telefono?.trim() || '+39 000 0000000',
        passwordHash: hashPassword(password),
        attivo: true,
      })
      .returning()

    if (!medico) {
      return NextResponse.json({ error: 'Errore inserimento medico' }, { status: 500 })
    }

    // Inizializza automaticamente slot agenda per i prossimi 30 giorni
    const oggi = new Date()
    const slotValues: Array<{
      studioId: string
      medicoId: string
      data: string
      oraInizio: string
      oraFine: string
      durataMin: number
      stato: 'libero'
    }> = []

    const orariMattina = [
      { start: '09:00', end: '09:20' },
      { start: '09:20', end: '09:40' },
      { start: '09:40', end: '10:00' },
      { start: '10:00', end: '10:20' },
      { start: '10:20', end: '10:40' },
      { start: '10:40', end: '11:00' },
      { start: '11:00', end: '11:20' },
      { start: '11:20', end: '11:40' },
      { start: '11:40', end: '12:00' },
    ]

    for (let i = 0; i < 30; i++) {
      const d = new Date(oggi)
      d.setDate(oggi.getDate() + i)
      if (d.getDay() === 0) continue // Salta domeniche

      const dataStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

      for (const o of orariMattina) {
        slotValues.push({
          studioId,
          medicoId: medico.id,
          data: dataStr,
          oraInizio: o.start,
          oraFine: o.end,
          durataMin: 20,
          stato: 'libero',
        })
      }
    }

    if (slotValues.length > 0) {
      await db.insert(slotAgenda).values(slotValues)
    }

    return NextResponse.json({
      success: true,
      medico,
      slotsGenerati: slotValues.length,
    })
  } catch (err: any) {
    console.error('Errore creazione medico:', err)
    return NextResponse.json({ error: err?.message || 'Errore creazione medico' }, { status: 500 })
  }
}
