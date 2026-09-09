/**
 * @file        prenotazioni.ts
 * @module      @medico/api/routes
 * @description Routes per la gestione delle prenotazioni
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/dominio/requisiti-funzionali#Modulo-Prenotazioni]]
 */

import type { FastifyInstance } from 'fastify'

export async function prenotazioniRoutes(app: FastifyInstance) {
  /** GET /api/prenotazioni — prenotazioni del paziente autenticato */
  app.get('/', {
    schema: { tags: ['prenotazioni'], summary: 'Lista prenotazioni paziente' },
  }, async (_req, reply) => {
    return reply.send({ prenotazioni: [], message: 'TODO: implementare' })
  })

  /** POST /api/prenotazioni — crea prenotazione (richiede lockToken valido) */
  app.post('/', {
    schema: {
      tags: ['prenotazioni'],
      summary: 'Crea prenotazione con lock token',
      body: {
        type: 'object',
        required: ['slotId', 'lockToken', 'tipologiaVisita', 'motivoCategoria'],
        properties: {
          slotId:          { type: 'string' },
          lockToken:       { type: 'string' },
          tipologiaVisita: { type: 'string' },
          motivoCategoria: { type: 'string' },
          motivoNote:      { type: 'string', maxLength: 300 },
        },
      },
    },
  }, async (_req, reply) => {
    return reply.send({ message: 'TODO: implementare' })
  })

  /** DELETE /api/prenotazioni/:id — cancella prenotazione */
  app.delete('/:id', {
    schema: { tags: ['prenotazioni'], summary: 'Cancella prenotazione' },
  }, async (_req, reply) => {
    return reply.send({ message: 'TODO: implementare' })
  })

  /** PATCH /api/prenotazioni/:id — aggiorna stato (staff/medico) */
  app.patch('/:id', {
    schema: { tags: ['prenotazioni'], summary: 'Aggiorna stato prenotazione (staff)' },
  }, async (_req, reply) => {
    return reply.send({ message: 'TODO: implementare' })
  })
}
