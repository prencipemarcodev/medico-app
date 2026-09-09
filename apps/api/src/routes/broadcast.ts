/**
 * @file        broadcast.ts
 * @module      @medico/api/routes
 * @description Routes per l'invio di broadcast ai pazienti
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/notifiche/sistema-notifiche#Broadcast]]
 */

import type { FastifyInstance } from 'fastify'

export async function broadcastRoutes(app: FastifyInstance) {
  /** POST /api/broadcast — invia broadcast a tutti i pazienti di un giorno */
  app.post('/', {
    schema: {
      tags: ['broadcast'],
      summary: 'Invia broadcast ai pazienti prenotati in un giorno',
      body: {
        type: 'object',
        required: ['giornoTarget', 'testo', 'canali'],
        properties: {
          giornoTarget: { type: 'string', description: 'Data ISO YYYY-MM-DD' },
          testo:        { type: 'string', maxLength: 160 },
          canali:       { type: 'array', items: { type: 'string', enum: ['push', 'in_app'] } },
        },
      },
    },
  }, async (_req, reply) => {
    // TODO: query pazienti con prenotazioni attive nel giorno target
    // TODO: inviare Expo Push Notification a tutti
    // TODO: loggare in tabella broadcast
    return reply.send({ message: 'TODO: implementare' })
  })

  /** GET /api/broadcast — storico broadcast dello studio */
  app.get('/', {
    schema: { tags: ['broadcast'], summary: 'Storico broadcast' },
  }, async (_req, reply) => {
    return reply.send({ broadcasts: [], message: 'TODO: implementare' })
  })
}
