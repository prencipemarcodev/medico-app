import { NextResponse } from 'next/server'
import { db, hashPassword, eq, desc } from '@medico/db'
import { staff, staffMedici, medici, studi } from '@medico/db/schema'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studioId = searchParams.get('studioId')

    let query = db
      .select({
        id: staff.id,
        studioId: staff.studioId,
        nomeStudio: studi.nome,
        nome: staff.nome,
        cognome: staff.cognome,
        email: staff.email,
        attivo: staff.attivo,
        createdAt: staff.createdAt,
      })
      .from(staff)
      .leftJoin(studi, eq(staff.studioId, studi.id))
      .orderBy(desc(staff.createdAt))

    const staffList = studioId
      ? await query.where(eq(staff.studioId, studioId))
      : await query

    // Recupera le associazioni dei medici per ogni membro dello staff
    const staffMediciList = await db
      .select({
        staffId: staffMedici.staffId,
        medicoId: staffMedici.medicoId,
        nomeMedico: medici.nome,
        cognomeMedico: medici.cognome,
      })
      .from(staffMedici)
      .innerJoin(medici, eq(staffMedici.medicoId, medici.id))

    const mapStaffMedici = new Map<
      string,
      Array<{ id: string; nome: string; cognome: string }>
    >()

    for (const sm of staffMediciList) {
      const arr = mapStaffMedici.get(sm.staffId) || []
      arr.push({ id: sm.medicoId, nome: sm.nomeMedico, cognome: sm.cognomeMedico })
      mapStaffMedici.set(sm.staffId, arr)
    }

    const result = staffList.map((st) => ({
      ...st,
      mediciAssegnati: mapStaffMedici.get(st.id) || [],
    }))

    return NextResponse.json({ success: true, staff: result })
  } catch (err: any) {
    console.error('Errore get staff:', err)
    return NextResponse.json({ error: err?.message || 'Errore recupero staff' }, { status: 500 })
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
      password = 'segreteriaPassword2026',
      mediciIds = [],
    } = body

    if (!studioId || !nome || !cognome || !email) {
      return NextResponse.json(
        { error: 'Studio, nome, cognome ed email sono obbligatori' },
        { status: 400 }
      )
    }

    // Inserisci in tabella staff
    const [nuovoStaff] = await db
      .insert(staff)
      .values({
        studioId,
        medicoId: mediciIds[0] || null, // Primo medico per retrocompatibilità
        nome: nome.trim(),
        cognome: cognome.trim(),
        email: email.trim().toLowerCase(),
        passwordHash: hashPassword(password),
        attivo: true,
      })
      .returning()

    if (!nuovoStaff) {
      return NextResponse.json({ error: 'Errore inserimento staff' }, { status: 500 })
    }

    // Inserisci associazioni con tutti i medici selezionati
    if (Array.isArray(mediciIds) && mediciIds.length > 0) {
      const relazioni = mediciIds.map((mId: string) => ({
        staffId: nuovoStaff.id,
        medicoId: mId,
      }))
      await db.insert(staffMedici).values(relazioni)
    }

    return NextResponse.json({ success: true, staff: nuovoStaff })
  } catch (err: any) {
    console.error('Errore creazione staff:', err)
    return NextResponse.json({ error: err?.message || 'Errore creazione staff' }, { status: 500 })
  }
}
