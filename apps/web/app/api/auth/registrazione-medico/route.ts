import { NextResponse } from 'next/server'
import { db, hashPassword, eq, recordAuditLog } from '@medico/db'
import { studi, medici, staff, staffMedici, amministratori, slotAgenda } from '@medico/db/schema'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'

  try {
    const body = await request.json()
    const {
      codiceStudio,
      ruolo = 'medico', // 'medico' | 'collaboratore'
      nome,
      cognome,
      email,
      telefono,
      password,
    } = body

    if (!codiceStudio || !nome || !cognome || !email || !password) {
      return NextResponse.json(
        { error: 'Tutti i campi contrassegnati sono obbligatori' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La password deve contenere almeno 6 caratteri' },
        { status: 400 }
      )
    }

    // 1. Verifica esistenza e stato dello studio tramite codice
    const [studio] = await db
      .select()
      .from(studi)
      .where(eq(studi.codiceStudio, codiceStudio.trim().toUpperCase()))
      .limit(1)

    if (!studio || !studio.attivo) {
      return NextResponse.json(
        { error: 'Codice Studio non valido o studio medico non attivo' },
        { status: 404 }
      )
    }

    const emailNorm = email.trim().toLowerCase()

    // 2. Controllo duplicati email
    const [medicoEsistente] = await db
      .select({ id: medici.id })
      .from(medici)
      .where(eq(medici.email, emailNorm))
      .limit(1)

    const [staffEsistente] = await db
      .select({ id: staff.id })
      .from(staff)
      .where(eq(staff.email, emailNorm))
      .limit(1)

    const [adminEsistente] = await db
      .select({ id: amministratori.id })
      .from(amministratori)
      .where(eq(amministratori.email, emailNorm))
      .limit(1)

    if (medicoEsistente || staffEsistente || adminEsistente) {
      return NextResponse.json(
        { error: 'Un utente con questo indirizzo email è già registrato sulla piattaforma' },
        { status: 400 }
      )
    }

    const passwordHash = hashPassword(password)

    if (ruolo === 'medico') {
      // Inserisci Medico
      const [nuovoMedico] = await db
        .insert(medici)
        .values({
          studioId: studio.id,
          nome: nome.trim(),
          cognome: cognome.trim(),
          email: emailNorm,
          telefonoPrimario: telefono?.trim() || '+39 000 0000000',
          passwordHash,
          attivo: true,
        })
        .returning()

      if (!nuovoMedico) {
        return NextResponse.json({ error: 'Errore durante la creazione del profilo medico' }, { status: 500 })
      }

      // Inizializza 30 giorni di agenda per le visite
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
        if (d.getDay() === 0) continue

        const dataStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        for (const o of orariMattina) {
          slotValues.push({
            studioId: studio.id,
            medicoId: nuovoMedico.id,
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

      await recordAuditLog({
        attoreId: nuovoMedico.id,
        attoreEmail: nuovoMedico.email,
        ruolo: 'medico',
        azione: 'MEDICO_REGISTRATO_AUTONOMO',
        entita: 'medico',
        entitaId: nuovoMedico.id,
        dettagli: {
          studioId: studio.id,
          nomeStudio: studio.nome,
          codiceStudioUsato: codiceStudio,
          slotsGenerati: slotValues.length,
        },
        ip,
      })

      return NextResponse.json({
        success: true,
        message: `Benvenuto Dott. ${nuovoMedico.cognome}! Registrazione completata con successo allo studio "${studio.nome}".`,
      })
    } else {
      // Inserisci Collaboratore di Segreteria
      const [nuovoStaff] = await db
        .insert(staff)
        .values({
          studioId: studio.id,
          nome: nome.trim(),
          cognome: cognome.trim(),
          email: emailNorm,
          passwordHash,
          attivo: true,
        })
        .returning()

      if (!nuovoStaff) {
        return NextResponse.json({ error: 'Errore durante la creazione del collaboratore' }, { status: 500 })
      }

      // Assegna automaticamente a tutti i medici dello studio
      const mediciDelloStudio = await db
        .select({ id: medici.id })
        .from(medici)
        .where(eq(medici.studioId, studio.id))

      if (mediciDelloStudio.length > 0) {
        const relazioni = mediciDelloStudio.map((m) => ({
          staffId: nuovoStaff.id,
          medicoId: m.id,
        }))
        await db.insert(staffMedici).values(relazioni)
      }

      await recordAuditLog({
        attoreId: nuovoStaff.id,
        attoreEmail: nuovoStaff.email,
        ruolo: 'segreteria',
        azione: 'STAFF_REGISTRATO_AUTONOMO',
        entita: 'staff',
        entitaId: nuovoStaff.id,
        dettagli: {
          studioId: studio.id,
          nomeStudio: studio.nome,
          codiceStudioUsato: codiceStudio,
          mediciCollegati: mediciDelloStudio.length,
        },
        ip,
      })

      return NextResponse.json({
        success: true,
        message: `Profilo di segreteria creato con successo per lo studio "${studio.nome}". Ora puoi accedere.`,
      })
    }
  } catch (err: any) {
    console.error('Errore registrazione autonoma:', err)
    return NextResponse.json(
      { error: err?.message || 'Errore interno durante la registrazione' },
      { status: 500 }
    )
  }
}
