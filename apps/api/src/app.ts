/**
 * @file        app.ts
 * @module      @medico/api
 * @description Setup Fastify: registrazione plugin, routes e configurazione globale
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/architettura/overview]]
 * @see         [[docs/areas/architettura/decisioni-architetturali#ADR-003]]
 */

import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

import { healthRoute } from './routes/health.js'
import { slotRoutes } from './routes/slot.js'
import { prenotazioniRoutes } from './routes/prenotazioni.js'
import { richiesteRoutes } from './routes/richieste.js'
import { broadcastRoutes } from './routes/broadcast.js'

/**
 * @function    buildApp
 * @description Costruisce e configura l'istanza Fastify con tutti i plugin e le routes
 * @returns     {Promise<FastifyInstance>} Istanza Fastify configurata
 */
export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env['NODE_ENV'] === 'production' ? 'warn' : 'info',
    },
  })

  // ── Plugin: CORS ──────────────────────────────────────────────────────────
  await app.register(cors, {
    origin: true,
    credentials: true,
  })

  // ── Plugin: JWT ───────────────────────────────────────────────────────────
  await app.register(jwt, {
    secret: process.env['BETTER_AUTH_SECRET'] ?? 'dev-secret-cambia-in-produzione',
  })

  // ── Plugin: Swagger (solo in sviluppo) ───────────────────────────────────
  if (process.env['NODE_ENV'] !== 'production') {
    await app.register(swagger, {
      openapi: {
        info: {
          title: 'Studio Medico API',
          description: 'API per la gestione prenotazioni dello studio medico',
          version: '0.1.0',
        },
        tags: [
          { name: 'health', description: 'Health check' },
          { name: 'auth', description: 'Autenticazione' },
          { name: 'slot', description: 'Slot agenda' },
          { name: 'prenotazioni', description: 'Prenotazioni' },
          { name: 'richieste', description: 'Richieste speciali' },
          { name: 'broadcast', description: 'Messaggi broadcast' },
        ],
      },
    })
    await app.register(swaggerUi, {
      routePrefix: '/docs',
    })
  }

  // ── Routes ────────────────────────────────────────────────────────────────
  await app.register(healthRoute)
  await app.register(slotRoutes, { prefix: '/api/slot' })
  await app.register(prenotazioniRoutes, { prefix: '/api/prenotazioni' })
  await app.register(richiesteRoutes, { prefix: '/api/richieste' })
  await app.register(broadcastRoutes, { prefix: '/api/broadcast' })

  return app
}
