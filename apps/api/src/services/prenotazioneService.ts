/**
 * @file        prenotazioneService.ts
 * @module      @medico/api/services
 * @description Servizio per la creazione e gestione transazionale delle prenotazioni
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/dominio/requisiti-funzionali#Modulo-Prenotazioni]]
 * @see         [[docs/areas/architettura/decisioni-architetturali#ADR-002]]
 */

import { db, slotAgenda, prenotazioni, pazienti, eq, and, desc } from '@medico/db'

export interface CreaPrenotazioneParams {
  slotId: string
  lockToken: string
  pazienteId: string
  tipologiaVisita: 'breve' | 'standard' | 'lunga'
  motivoCategoria: string
  motivoNote?: string
}

export interface CreaPrenotazioneResultSuccess {
  success: true
  prenotazione: typeof prenotazioni.$inferSelect
}

export interface CreaPrenotazioneResultFailure {
  success: false
  code: 'NOT_FOUND' | 'LOCK_INVALID_OR_EXPIRED' | 'PAZIENTE_NOT_FOUND' | 'MAX_PRENOTAZIONI_REACHED'
  error: string
}

export type CreaPrenotazioneResult =
  | CreaPrenotazioneResultSuccess
  | CreaPrenotazioneResultFailure

/**
 * @function    creaPrenotazione
 * @description Convalida il lockToken e finalizza la prenotazione in modo transazionale
 */
export async function creaPrenotazione(
  params: CreaPrenotazioneParams
): Promise<CreaPrenotazioneResult> {
  return await db.transaction(async (tx) => {
    const now = new Date()

    // 1. SELECT FOR UPDATE sullo slot
    const [slot] = await tx
      .select()
      .from(slotAgenda)
      .where(eq(slotAgenda.id, params.slotId))
      .for('update')

    if (!slot) {
      return { success: false, code: 'NOT_FOUND', error: 'Slot non trovato' }
    }

    // 2. Verifica che lo slot sia effettivamente bloccato con il lockToken corretto e non scaduto
    if (
      slot.stato !== 'bloccato' ||
      slot.lockToken !== params.lockToken ||
      !slot.lockedUntil ||
      slot.lockedUntil < now
    ) {
      return {
        success: false,
        code: 'LOCK_INVALID_OR_EXPIRED',
        error: 'Il tempo di 10 minuti per completare la prenotazione è scaduto. Seleziona nuovamente lo slot.',
      }
    }

    // 3. Verifica esistenza paziente
    const [paziente] = await tx
      .select()
      .from(pazienti)
      .where(eq(pazienti.id, params.pazienteId))

    if (!paziente) {
      return { success: false, code: 'PAZIENTE_NOT_FOUND', error: 'Paziente non trovato' }
    }

    // 4. Regola di business: max 2 prenotazioni attive per paziente nello stesso giorno
    const prenotazioniGiorno = await tx
      .select()
      .from(prenotazioni)
      .innerJoin(slotAgenda, eq(prenotazioni.slotId, slotAgenda.id))
      .where(
        and(
          eq(prenotazioni.pazienteId, params.pazienteId),
          eq(slotAgenda.data, slot.data),
          eq(prenotazioni.stato, 'confermata')
        )
      )

    if (prenotazioniGiorno.length >= 2) {
      return {
        success: false,
        code: 'MAX_PRENOTAZIONI_REACHED',
        error: 'Hai già 2 prenotazioni attive per questa giornata.',
      }
    }

    // 5. Inserimento prenotazione
    const [nuovaPrenotazione] = await tx
      .insert(prenotazioni)
      .values({
        studioId: slot.studioId,
        medicoId: slot.medicoId,
        pazienteId: params.pazienteId,
        slotId: slot.id,
        tipologiaVisita: params.tipologiaVisita,
        motivoCategoria: params.motivoCategoria,
        motivoNote: params.motivoNote?.slice(0, 300),
        stato: 'confermata',
      })
      .returning()

    if (!nuovaPrenotazione) {
      throw new Error('Errore durante la creazione della prenotazione')
    }

    // 6. Aggiorna stato slot da 'bloccato' a 'prenotato' e rimuove il lock token
    await tx
      .update(slotAgenda)
      .set({
        stato: 'prenotato',
        lockToken: null,
        lockedUntil: null,
        lockedBy: params.pazienteId,
        updatedAt: now,
      })
      .where(eq(slotAgenda.id, slot.id))

    return { success: true, prenotazione: nuovaPrenotazione }
  })
}

/**
 * @function    getPrenotazioniPaziente
 * @description Restituisce le prenotazioni di un paziente con i dettagli dello slot associato
 */
export async function getPrenotazioniPaziente(pazienteId: string) {
  const result = await db
    .select({
      id: prenotazioni.id,
      studioId: prenotazioni.studioId,
      medicoId: prenotazioni.medicoId,
      pazienteId: prenotazioni.pazienteId,
      slotId: prenotazioni.slotId,
      tipologiaVisita: prenotazioni.tipologiaVisita,
      motivoCategoria: prenotazioni.motivoCategoria,
      motivoNote: prenotazioni.motivoNote,
      stato: prenotazioni.stato,
      noteStaff: prenotazioni.noteStaff,
      createdAt: prenotazioni.createdAt,
      data: slotAgenda.data,
      oraInizio: slotAgenda.oraInizio,
      oraFine: slotAgenda.oraFine,
      durataMin: slotAgenda.durataMin,
    })
    .from(prenotazioni)
    .innerJoin(slotAgenda, eq(prenotazioni.slotId, slotAgenda.id))
    .where(eq(prenotazioni.pazienteId, pazienteId))
    .orderBy(desc(prenotazioni.createdAt))

  return result
}

/**
 * @function    cancellaPrenotazione
 * @description Annulla una prenotazione e libera lo slot associato (ADR-002)
 */
export async function cancellaPrenotazione(prenotazioneId: string, pazienteId?: string) {
  return await db.transaction(async (tx) => {
    const now = new Date()
    const [prenotazione] = await tx
      .select()
      .from(prenotazioni)
      .where(eq(prenotazioni.id, prenotazioneId))
      .for('update')

    if (!prenotazione) {
      return { success: false, code: 'NOT_FOUND', error: 'Prenotazione non trovata' }
    }

    if (pazienteId && prenotazione.pazienteId !== pazienteId) {
      return { success: false, code: 'UNAUTHORIZED', error: 'Non autorizzato ad annullare questa prenotazione' }
    }

    if (prenotazione.stato === 'rifiutata' || prenotazione.stato === 'no_show') {
      return { success: false, code: 'ALREADY_CANCELLED', error: 'La prenotazione è già stata annullata' }
    }

    // 1. Aggiorna stato prenotazione ad annullata
    await tx
      .update(prenotazioni)
      .set({
        stato: 'rifiutata',
        noteStaff: 'Annullata dal paziente',
        updatedAt: now,
      })
      .where(eq(prenotazioni.id, prenotazioneId))

    // 2. Libera nuovamente lo slot per altri pazienti
    await tx
      .update(slotAgenda)
      .set({
        stato: 'libero',
        lockedBy: null,
        lockToken: null,
        lockedUntil: null,
        updatedAt: now,
      })
      .where(eq(slotAgenda.id, prenotazione.slotId))

    return { success: true, prenotazioneId }
  })
}
