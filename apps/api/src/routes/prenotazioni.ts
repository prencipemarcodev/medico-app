/**
 * @file        prenotazioni.ts
 * @module      @medico/api/routes
 * @description Routes per la gestione delle prenotazioni con lock token (ADR-002)
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/dominio/requisiti-funzionali#Modulo-Prenotazioni]]
 */

import type { FastifyInstance } from 'fastify'
import {
  creaPrenotazione,
  getPrenotazioniPaziente,
  cancellaPrenotazione,
} from '../services/prenotazioneService.js'

export async function prenotazioniRoutes(app: FastifyInstance) {
  /**
   * @function    GET /api/prenotazioni
   * @description Restituisce lo storico prenotazioni di un paziente
   */
  app.get<{
    Querystring: { pazienteId: string }
  }>('/', {
    schema: {
      tags: ['prenotazioni'],
      summary: 'Lista prenotazioni paziente',
      querystring: {
        type: 'object',
        required: ['pazienteId'],
        properties: { pazienteId: { type: 'string', format: 'uuid' } },
      },
    },
  }, async (req, reply) => {
    const { pazienteId } = req.query
    const lista = await getPrenotazioniPaziente(pazienteId)
    return reply.send({ pazienteId, prenotazioni: lista })
  })

  /**
   * @function    POST /api/prenotazioni
   * @description Crea e conferma una prenotazione consumando il lockToken valido
   */
  app.post<{
    Body: {
      slotId: string
      lockToken: string
      pazienteId: string
      tipologiaVisita: 'breve' | 'standard' | 'lunga'
      motivoCategoria: string
      motivoNote?: string
    }
  }>('/', {
    schema: {
      tags: ['prenotazioni'],
      summary: 'Crea e conferma prenotazione con lock token',
      body: {
        type: 'object',
        required: ['slotId', 'lockToken', 'pazienteId', 'tipologiaVisita', 'motivoCategoria'],
        properties: {
          slotId:          { type: 'string', format: 'uuid' },
          lockToken:       { type: 'string', format: 'uuid' },
          pazienteId:      { type: 'string', format: 'uuid' },
          tipologiaVisita: { type: 'string', enum: ['breve', 'standard', 'lunga'] },
          motivoCategoria: { type: 'string' },
          motivoNote:      { type: 'string', maxLength: 300 },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            prenotazione: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                slotId: { type: 'string' },
                pazienteId: { type: 'string' },
                medicoId: { type: 'string' },
                stato: { type: 'string' },
                createdAt: { type: 'string' },
              },
            },
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
          properties: { error: { type: 'string' }, code: { type: 'string' } },
        },
      },
    },
  }, async (req, reply) => {
    const result = await creaPrenotazione(req.body)

    if (!result.success) {
      if (result.code === 'NOT_FOUND' || result.code === 'PAZIENTE_NOT_FOUND') {
        return reply.status(404).send({ error: result.error })
      }
      if (result.code === 'LOCK_INVALID_OR_EXPIRED' || result.code === 'MAX_PRENOTAZIONI_REACHED') {
        return reply.status(409).send({ error: result.error, code: result.code })
      }
      return reply.status(400).send({ error: result.error })
    }

    return reply.status(201).send({
      success: true,
      prenotazione: {
        id: result.prenotazione.id,
        slotId: result.prenotazione.slotId,
        pazienteId: result.prenotazione.pazienteId,
        medicoId: result.prenotazione.medicoId,
        stato: result.prenotazione.stato,
        createdAt: result.prenotazione.createdAt.toISOString(),
      },
    })
  })

  /**
   * @function    DELETE /api/prenotazioni/:id
   * @description Annulla una prenotazione e libera lo slot
   */
  app.delete<{
    Params: { id: string }
    Querystring: { pazienteId?: string }
  }>('/:id', {
    schema: {
      tags: ['prenotazioni'],
      summary: 'Cancella prenotazione e libera slot',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
      querystring: {
        type: 'object',
        properties: { pazienteId: { type: 'string', format: 'uuid' } },
      },
    },
  }, async (req, reply) => {
    const { id } = req.params
    const { pazienteId } = req.query

    const result = await cancellaPrenotazione(id, pazienteId)

    if (!result.success) {
      if (result.code === 'NOT_FOUND') return reply.status(404).send({ error: result.error })
      if (result.code === 'UNAUTHORIZED') return reply.status(403).send({ error: result.error })
      return reply.status(400).send({ error: result.error })
    }

    return reply.send({ success: true, message: 'Prenotazione annullata con successo e slot liberato.' })
  })
}
