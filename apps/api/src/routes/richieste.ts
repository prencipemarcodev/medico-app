/**
 * @file        richieste.ts
 * @module      @medico/api/routes
 * @description Routes per le richieste speciali (malattia, certificati, medicinali)
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/dominio/requisiti-funzionali#Modulo-Richieste-Speciali]]
 */

import type { FastifyInstance } from 'fastify'

export async function richiesteRoutes(app: FastifyInstance) {
  /** GET /api/richieste — coda FIFO per medico/staff */
  app.get('/', {
    schema: { tags: ['richieste'], summary: 'Coda richieste speciali (FIFO)' },
  }, async (_req, reply) => {
    return reply.send({ richieste: [], message: 'TODO: implementare' })
  })

  /** POST /api/richieste — invia nuova richiesta speciale */
  app.post('/', {
    schema: {
      tags: ['richieste'],
      summary: 'Invia richiesta speciale',
      body: {
        type: 'object',
        required: ['tipo', 'payload'],
        properties: {
          tipo:      { type: 'string', enum: ['malattia', 'certificato', 'medicinale'] },
          sottotipo: { type: 'string' },
          payload:   { type: 'object' },
        },
      },
    },
  }, async (_req, reply) => {
    return reply.send({ message: 'TODO: implementare' })
  })

  /** PATCH /api/richieste/:id — aggiorna stato richiesta (staff/medico) */
  app.patch('/:id', {
    schema: {
      tags: ['richieste'],
      summary: 'Aggiorna stato richiesta (completa/rifiuta)',
      body: {
        type: 'object',
        required: ['stato'],
        properties: {
          stato:          { type: 'string', enum: ['in_lavorazione', 'completata', 'rifiutata'] },
          noteRifiuto:    { type: 'string' },
          modalitaRitiro: { type: 'string', enum: ['digitale', 'studio'] },
        },
      },
    },
  }, async (_req, reply) => {
    return reply.send({ message: 'TODO: implementare' })
  })
}
