/**
 * @file        slot.ts
 * @module      @medico/api/routes
 * @description Routes per la gestione degli slot agenda e lock temporaneo (ADR-002)
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/architettura/decisioni-architetturali#ADR-002]]
 * @see         [[docs/areas/interfaccia/ux-flows#Flow-2]]
 */

import type { FastifyInstance } from 'fastify'
import { getAvailableSlots, lockSlot, unlockSlot } from '../services/slotService.js'

export async function slotRoutes(app: FastifyInstance) {
  /**
   * @function    GET /api/slot/:medicoId
   * @description Restituisce gli slot disponibili per un medico in una data
   * @param       medicoId - UUID del medico
   * @param       data - Data ISO (query param: ?data=YYYY-MM-DD)
   */
  app.get<{
    Params: { medicoId: string }
    Querystring: { data: string }
  }>('/:medicoId', {
    schema: {
      tags: ['slot'],
      summary: 'Slot disponibili per medico e data',
      params: {
        type: 'object',
        required: ['medicoId'],
        properties: { medicoId: { type: 'string', format: 'uuid' } },
      },
      querystring: {
        type: 'object',
        required: ['data'],
        properties: { data: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' } },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            medicoId: { type: 'string' },
            data: { type: 'string' },
            slots: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  medicoId: { type: 'string' },
                  studioId: { type: 'string' },
                  data: { type: 'string' },
                  oraInizio: { type: 'string' },
                  oraFine: { type: 'string' },
                  durataMin: { type: 'number' },
                  stato: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  }, async (req, reply) => {
    const { medicoId } = req.params
    const { data } = req.query

    const slots = await getAvailableSlots(medicoId, data)
    return reply.send({ medicoId, data, slots })
  })

  /**
   * @function    POST /api/slot/:slotId/lock
   * @description Blocca temporaneamente uno slot per 10 minuti (ADR-002)
   *              Restituisce un lockToken necessario per confermare la prenotazione
   * @param       slotId - UUID dello slot da bloccare
   */
  app.post<{
    Params: { slotId: string }
    Body?: { pazienteId?: string }
  }>('/:slotId/lock', {
    schema: {
      tags: ['slot'],
      summary: 'Blocca slot temporaneamente (10 min)',
      params: {
        type: 'object',
        required: ['slotId'],
        properties: { slotId: { type: 'string', format: 'uuid' } },
      },
      body: {
        type: 'object',
        properties: { pazienteId: { type: 'string', format: 'uuid' } },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            slotId: { type: 'string' },
            lockToken: { type: 'string' },
            scadeAt: { type: 'string' },
            durataMinuti: { type: 'number' },
          },
        },
        400: {
          type: 'object',
          properties: { error: { type: 'string' } },
        },
        404: {
          type: 'object',
          properties: { error: { type: 'string' } },
        },
        409: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            code: { type: 'string' },
            lockedUntil: { type: 'string' },
          },
        },
      },
    },
  }, async (req, reply) => {
    const { slotId } = req.params
    const pazienteId = req.body?.pazienteId

    const result = await lockSlot(slotId, pazienteId)

    if (!result.success) {
      if (result.code === 'NOT_FOUND') {
        return reply.status(404).send({ error: result.error })
      }
      if (result.code === 'SLOT_CLOSED') {
        return reply.status(400).send({ error: result.error })
      }
      // ALREADY_BOOKED o CURRENTLY_LOCKED
      return reply.status(409).send({
        error: result.error,
        code: result.code,
        lockedUntil: result.lockedUntil?.toISOString(),
      })
    }

    return reply.status(200).send({
      success: true,
      slotId: result.slotId,
      lockToken: result.lockToken,
      scadeAt: result.scadeAt.toISOString(),
      durataMinuti: result.durataMinuti,
    })
  })

  /**
   * @function    POST /api/slot/:slotId/unlock
   * @description Sblocca uno slot precedentemente bloccato
   * @param       slotId - UUID dello slot da sbloccare
   */
  app.post<{
    Params: { slotId: string }
    Body?: { lockToken?: string }
  }>('/:slotId/unlock', {
    schema: {
      tags: ['slot'],
      summary: 'Sblocca slot immediatamente (cambio data o annullamento)',
      params: {
        type: 'object',
        required: ['slotId'],
        properties: { slotId: { type: 'string', format: 'uuid' } },
      },
      body: {
        type: 'object',
        properties: { lockToken: { type: 'string', format: 'uuid' } },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: { error: { type: 'string' } },
        },
      },
    },
  }, async (req, reply) => {
    const { slotId } = req.params
    const lockToken = req.body?.lockToken

    const result = await unlockSlot(slotId, lockToken)
    if (!result.success) {
      return reply.status(400).send({ error: result.error ?? 'Errore sblocco slot' })
    }

    return reply.status(200).send({ success: true, message: 'Slot sbloccato con successo' })
  })
}
