import { NextResponse } from 'next/server'
import { db, eq, recordAuditLog } from '@medico/db'
import {
  medici,
  pazienti,
  slotAgenda,
  prenotazioni,
  richiesteSpeciali,
  staffMedici,
  consentLog,
} from '@medico/db/schema'
import { checkAuth } from '@/lib/server-auth'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAuth(['admin'])
  if ('response' in auth) return auth.response

  const { id: medicoId } = await params
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'

  try {
    const [medicoEsistente] = await db
      .select()
      .from(medici)
      .where(eq(medici.id, medicoId))
      .limit(1)

    if (!medicoEsistente) {
      return NextResponse.json({ error: 'Medico non trovato' }, { status: 404 })
    }

    // 1. Elimina prenotazioni associate
    await db.delete(prenotazioni).where(eq(prenotazioni.medicoId, medicoId))

    // 2. Elimina slot agenda
    await db.delete(slotAgenda).where(eq(slotAgenda.medicoId, medicoId))

    // 3. Elimina richieste speciali
    await db.delete(richiesteSpeciali).where(eq(richiesteSpeciali.medicoId, medicoId))

    // 4. Elimina associazioni con la segreteria (staff_medici)
    await db.delete(staffMedici).where(eq(staffMedici.medicoId, medicoId))

    // 5. Elimina pazienti del medico (con i loro consent logs)
    const pazientiDelMedico = await db
      .select({ id: pazienti.id })
      .from(pazienti)
      .where(eq(pazienti.medicoId, medicoId))

    for (const p of pazientiDelMedico) {
      await db.delete(consentLog).where(eq(consentLog.pazienteId, p.id))
      await db.delete(prenotazioni).where(eq(prenotazioni.pazienteId, p.id))
      await db.delete(richiesteSpeciali).where(eq(richiesteSpeciali.pazienteId, p.id))
    }

    await db.delete(pazienti).where(eq(pazienti.medicoId, medicoId))

    // 6. Elimina il record medico
    await db.delete(medici).where(eq(medici.id, medicoId))

    await recordAuditLog({
      attoreId: auth.session.id,
      attoreEmail: auth.session.email,
      ruolo: 'admin',
      azione: 'MEDICO_ELIMINATO',
      entita: 'medico',
      entitaId: medicoId,
      dettagli: {
        nome: `${medicoEsistente.nome} ${medicoEsistente.cognome}`,
        email: medicoEsistente.email,
        pazientiRimossi: pazientiDelMedico.length,
      },
      ip,
    })

    return NextResponse.json({
      success: true,
      message: `Dott. ${medicoEsistente.cognome} eliminato con successo`,
    })
  } catch (err: any) {
    console.error('Errore eliminazione medico:', err)
    return NextResponse.json(
      { error: err?.message || 'Errore durante l\'eliminazione del medico' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAuth(['admin'])
  if ('response' in auth) return auth.response

  const { id: medicoId } = await params
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'

  try {
    const [medicoEsistente] = await db
      .select()
      .from(medici)
      .where(eq(medici.id, medicoId))
      .limit(1)

    if (!medicoEsistente) {
      return NextResponse.json({ error: 'Medico non trovato' }, { status: 404 })
    }

    const body = await request.json()
    const { nome, cognome, email, telefono, studioId } = body

    const [aggiornato] = await db
      .update(medici)
      .set({
        nome: nome ? nome.trim() : medicoEsistente.nome,
        cognome: cognome ? cognome.trim() : medicoEsistente.cognome,
        email: email ? email.trim().toLowerCase() : medicoEsistente.email,
        telefonoPrimario: telefono !== undefined ? (telefono ? telefono.trim() : medicoEsistente.telefonoPrimario) : medicoEsistente.telefonoPrimario,
        studioId: studioId || medicoEsistente.studioId,
        updatedAt: new Date(),
      })
      .where(eq(medici.id, medicoId))
      .returning()

    if (!aggiornato) {
      return NextResponse.json({ error: 'Errore aggiornamento medico' }, { status: 500 })
    }

    await recordAuditLog({
      attoreId: auth.session.id,
      attoreEmail: auth.session.email,
      ruolo: 'admin',
      azione: 'MEDICO_MODIFICATO',
      entita: 'medico',
      entitaId: medicoId,
      dettagli: { nome: `${aggiornato.nome} ${aggiornato.cognome}`, email: aggiornato.email },
      ip,
    })

    return NextResponse.json({
      success: true,
      medico: aggiornato,
      message: 'Medico modificato con successo',
    })
  } catch (err: any) {
    console.error('Errore aggiornamento medico:', err)
    return NextResponse.json(
      { error: err?.message || 'Errore durante la modifica del medico' },
      { status: 500 }
    )
  }
}

