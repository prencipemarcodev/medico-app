import { NextResponse } from 'next/server'
import { db, eq, and, sql, recordAuditLog, createSessionToken } from '@medico/db'
import { studi, medici, pazienti } from '@medico/db/schema'
import { checkAuth } from '@/lib/server-auth'

export async function POST(request: Request) {
  const auth = await checkAuth(['paziente', 'medico', 'segreteria', 'admin'])
  if ('response' in auth) return auth.response

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'

  try {
    const body = await request.json()

    // CASO 1: L'utente che chiama è il PAZIENTE stesso (dalla sua dashboard)
    if (auth.session.ruolo === 'paziente') {
      const { codiceStudio, medicoId } = body

      if (!codiceStudio?.trim() || !medicoId?.trim()) {
        return NextResponse.json(
          { error: 'Inserisci il Codice Studio e seleziona il Medico Curante' },
          { status: 400 }
        )
      }

      const cleanCodice = codiceStudio.trim().toUpperCase()

      // Verifica studio
      const [studio] = await db
        .select({ id: studi.id, nome: studi.nome, attivo: studi.attivo })
        .from(studi)
        .where(eq(studi.codiceStudio, cleanCodice))
        .limit(1)

      if (!studio || !studio.attivo) {
        return NextResponse.json(
          { error: 'Codice Studio non valido o studio medico non attivo' },
          { status: 404 }
        )
      }

      // Verifica medico
      const [medico] = await db
        .select({ id: medici.id, nome: medici.nome, cognome: medici.cognome, attivo: medici.attivo })
        .from(medici)
        .where(and(eq(medici.id, medicoId), eq(medici.studioId, studio.id), eq(medici.attivo, true)))
        .limit(1)

      if (!medico) {
        return NextResponse.json(
          { error: 'Medico curante selezionato non trovato o non attivo in questo studio' },
          { status: 404 }
        )
      }

      // Aggiorna il paziente
      const [aggiornato] = await db
        .update(pazienti)
        .set({
          studioId: studio.id,
          medicoId: medico.id,
          updatedAt: new Date(),
        })
        .where(eq(pazienti.id, auth.session.id))
        .returning()

      if (!aggiornato) {
        return NextResponse.json({ error: 'Paziente non trovato' }, { status: 404 })
      }

      // Rinnova il token di sessione con il nuovo studioId e medicoId
      const nuovoUserPayload = {
        id: aggiornato.id,
        nome: aggiornato.nome,
        cognome: aggiornato.cognome,
        codiceFiscale: aggiornato.codiceFiscale,
        email: aggiornato.email,
        studioId: studio.id,
        medicoId: medico.id,
        primoAccesso: aggiornato.primoAccesso,
        ruolo: 'paziente' as const,
      }

      const token = createSessionToken(nuovoUserPayload)

      await recordAuditLog({
        attoreId: auth.session.id,
        attoreEmail: auth.session.email,
        ruolo: 'paziente',
        azione: 'ASSOCIAZIONE_STUDIO_PAZIENTE',
        entita: 'pazienti',
        entitaId: auth.session.id,
        dettagli: { studioId: studio.id, medicoId: medico.id, nomeStudio: studio.nome },
        ip,
      })

      const response = NextResponse.json({
        success: true,
        message: `Profilo associato con successo a ${studio.nome}`,
        studio: { id: studio.id, nome: studio.nome },
        medico: { id: medico.id, nome: medico.nome, cognome: medico.cognome },
        paziente: nuovoUserPayload,
      })

      response.cookies.set('auth_session', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      })

      return response
    }

    // CASO 2: L'operatore (MEDICO, SEGRETERIA, ADMIN) associa un paziente dal gestionale
    const { codiceFiscale, pazienteId, customStudioId, customMedicoId } = body

    if (!codiceFiscale?.trim() && !pazienteId) {
      return NextResponse.json(
        { error: 'Inserisci il Codice Fiscale del paziente da associare' },
        { status: 400 }
      )
    }

    let targetStudioId = auth.session.studioId || customStudioId
    let targetMedicoId = auth.session.ruolo === 'medico' ? auth.session.id : customMedicoId

    if (auth.session.ruolo === 'medico') {
      if (!targetStudioId) {
        const [m] = await db.select({ studioId: medici.studioId }).from(medici).where(eq(medici.id, auth.session.id)).limit(1)
        targetStudioId = m?.studioId
      }
    }

    if (!targetStudioId) {
      return NextResponse.json({ error: 'Studio medico non determinato' }, { status: 400 })
    }

    if (!targetMedicoId) {
      return NextResponse.json({ error: 'Seleziona il medico curante da assegnare' }, { status: 400 })
    }

    // Cerca il paziente
    const condizioneRicerca = pazienteId
      ? eq(pazienti.id, pazienteId)
      : eq(sql`upper(${pazienti.codiceFiscale})`, codiceFiscale.trim().toUpperCase())

    const [pazienteTrovato] = await db
      .select()
      .from(pazienti)
      .where(condizioneRicerca)
      .limit(1)

    if (!pazienteTrovato) {
      return NextResponse.json(
        { error: 'Nessun paziente registrato trovato con questo Codice Fiscale' },
        { status: 404 }
      )
    }

    // Aggiorna associazione
    const [aggiornato] = await db
      .update(pazienti)
      .set({
        studioId: targetStudioId,
        medicoId: targetMedicoId,
        updatedAt: new Date(),
      })
      .where(eq(pazienti.id, pazienteTrovato.id))
      .returning()

    if (!aggiornato) {
      return NextResponse.json({ error: 'Errore durante l\'aggiornamento del paziente' }, { status: 500 })
    }

    await recordAuditLog({
      attoreId: auth.session.id,
      attoreEmail: auth.session.email,
      ruolo: auth.session.ruolo,
      azione: 'ASSOCIAZIONE_PAZIENTE_OPERATORE',
      entita: 'pazienti',
      entitaId: pazienteTrovato.id,
      dettagli: {
        studioId: targetStudioId,
        medicoId: targetMedicoId,
        codiceFiscale: pazienteTrovato.codiceFiscale,
      },
      ip,
    })

    return NextResponse.json({
      success: true,
      message: `Paziente ${aggiornato.nome} ${aggiornato.cognome} associato allo studio`,
      paziente: {
        id: aggiornato.id,
        nome: aggiornato.nome,
        cognome: aggiornato.cognome,
        codiceFiscale: aggiornato.codiceFiscale,
        studioId: aggiornato.studioId,
        medicoId: aggiornato.medicoId,
      },
    })
  } catch (error: any) {
    console.error('Errore associazione studio paziente:', error)
    return NextResponse.json(
      { error: error?.message || 'Errore durante l\'associazione del paziente' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const codice = searchParams.get('codiceStudio')?.trim()
    const studioId = searchParams.get('studioId')?.trim()

    if (!codice && !studioId) {
      return NextResponse.json({ error: 'Specifica codiceStudio o studioId' }, { status: 400 })
    }

    const condition = codice
      ? eq(sql`upper(${studi.codiceStudio})`, codice.toUpperCase())
      : eq(studi.id, studioId!)

    const [studio] = await db
      .select({
        id: studi.id,
        nome: studi.nome,
        indirizzo: studi.indirizzo,
        telefono: studi.telefono,
        attivo: studi.attivo,
      })
      .from(studi)
      .where(condition)
      .limit(1)
    if (!studio || !studio.attivo) {
      return NextResponse.json({ error: 'Codice Studio non valido o studio medico inattivo' }, { status: 404 })
    }

    const mediciList = await db
      .select({
        id: medici.id,
        nome: medici.nome,
        cognome: medici.cognome,
        email: medici.email,
      })
      .from(medici)
      .where(and(eq(medici.studioId, studio.id), eq(medici.attivo, true)))

    return NextResponse.json({
      success: true,
      studio,
      medici: mediciList,
    })
  } catch (error: any) {
    console.error('Errore ricerca studio:', error)
    return NextResponse.json({ error: 'Errore durante la ricerca dello studio' }, { status: 500 })
  }
}

