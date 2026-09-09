/**
 * @file        slot.ts
 * @module      @medico/api/routes
 * @description Routes per la gestione degli slot agenda e lock temporaneo
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/architettura/decisioni-architetturali#ADR-002]]
 * @see         [[docs/areas/interfaccia/ux-flows#Flow-2]]
 */

import type { FastifyInstance } from 'fastify'

export async function slotRoutes(app: FastifyInstance) {
  /**
   * @function    GET /api/slot/:medicoId
   * @description Restituisce gli slot disponibili per un medico in una data
   * @param       medicoId - UUID del medico
   * @param       data - Data ISO (query param: ?data=YYYY-MM-DD)
   * @returns     Array di SlotDisponibile
   */
  app.get('/:medicoId', {
    schema: {
      tags: ['slot'],
      summary: 'Slot disponibili per medico e data',
      params: { type: 'object', properties: { medicoId: { type: 'string' } } },
      querystring: { type: 'object', properties: { data: { type: 'string' } }, required: ['data'] },
    },
  }, async (req, reply) => {
    // TODO: implementare query Drizzle
    // SELECT slot WHERE medico_id = :medicoId AND data = :data AND stato = 'libero'
    return reply.send({ slots: [], message: 'TODO: implementare' })
  })

  /**
   * @function    POST /api/slot/:slotId/lock
   * @description Blocca temporaneamente uno slot per 10 minuti (ADR-002)
   *              Restituisce un lockToken necessario per confermare la prenotazione
   * @param       slotId - UUID dello slot da bloccare
   * @returns     LockSlotResponse con lockToken e scadeAt
   * @throws      409 se lo slot è già bloccato o prenotato
   */
  app.post('/:slotId/lock', {
    schema: {
      tags: ['slot'],
      summary: 'Blocca slot temporaneamente (10 min)',
      params: { type: 'object', properties: { slotId: { type: 'string' } } },
    },
  }, async (req, reply) => {
    // TODO: implementare lock transazionale
    // UPDATE slot_agenda SET stato='bloccato', locked_until=NOW()+10min, locked_by=paziente_id
    // WHERE id=:slotId AND stato='libero' — FOR UPDATE
    return reply.send({ message: 'TODO: implementare lock slot' })
  })
}
