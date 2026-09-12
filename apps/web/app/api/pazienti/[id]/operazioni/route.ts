import { NextResponse } from 'next/server'
import { db, eq, and } from '@medico/db'
import { pazienti, prenotazioni, slotAgenda, richiesteSpeciali } from '@medico/db/schema'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pazienteId } = await params
    const body = await request.json()
    const { azione } = body

    const [paziente] = await db
      .select()
      .from(pazienti)
      .where(eq(pazienti.id, pazienteId))
      .limit(1)

    if (!paziente) {
      return NextResponse.json({ error: 'Paziente non trovato' }, { status: 404 })
    }

    if (azione === 'aggiorna_contatti') {
      const { email, telefono } = body
      const [aggiornato] = await db
        .update(pazienti)
        .set({
          email: email?.trim() || paziente.email,
          telefono: telefono?.trim() || paziente.telefono,
          updatedAt: new Date(),
        })
        .where(eq(pazienti.id, pazienteId))
        .returning()

      return NextResponse.json({
        success: true,
        messaggio: 'Recapiti aggiornati con successo',
        paziente: aggiornato,
      })
    }

    if (azione === 'richiesta') {
      const { tipo, dettaglio, farmaco, modalitaRitiro = 'studio' } = body
      const [nuovaRichiesta] = await db
        .insert(richiesteSpeciali)
        .values({
          studioId: paziente.studioId,
          medicoId: paziente.medicoId,
          pazienteId: paziente.id,
          tipo: tipo || 'medicinale',
          sottotipo: 'ricetta_dematerializzata',
          payload: {
            dettaglio: dettaglio || `Richiesta farmaco: ${farmaco || 'Prescrizione continuativa'}`,
            farmaco: farmaco || '',
          },
          modalitaRitiro,
          stato: 'in_attesa',
        })
        .returning()

      return NextResponse.json({
        success: true,
        messaggio: 'Richiesta registrata con successo',
        richiesta: nuovaRichiesta,
      })
    }

    if (azione === 'prenota_slot') {
      const { slotId, motivo = 'Visita ambulatoriale programmata' } = body
      if (!slotId) {
        return NextResponse.json({ error: 'Specificare lo slotId' }, { status: 400 })
      }

      const [prenotazione] = await db
        .insert(prenotazioni)
        .values({
          studioId: paziente.studioId,
          medicoId: paziente.medicoId,
          pazienteId: paziente.id,
          slotId,
          tipologiaVisita: 'standard',
          motivoCategoria: 'visita_controllo',
          motivoNote: motivo,
          stato: 'confermata',
        })
        .returning()

      await db
        .update(slotAgenda)
        .set({ stato: 'prenotato' })
        .where(eq(slotAgenda.id, slotId))

      return NextResponse.json({
        success: true,
        messaggio: 'Visita prenotata con successo',
        prenotazione,
      })
    }

    return NextResponse.json({
      success: true,
      messaggio: `Operazione ${azione} completata per il paziente ${paziente.nome} ${paziente.cognome}`,
    })
  } catch (err: any) {
    console.error('Errore operazione paziente:', err)
    return NextResponse.json({ error: err?.message || 'Errore durante l\'operazione' }, { status: 500 })
  }
}
