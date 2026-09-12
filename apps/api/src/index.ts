/**
 * @file        index.ts
 * @module      @medico/api
 * @description Entry point del server Fastify
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 */

import { buildApp } from './app.js'
import { cleanupExpiredLocks } from './services/slotService.js'

const PORT = parseInt(process.env['API_PORT'] ?? '3001', 10)
const HOST = process.env['API_HOST'] ?? '0.0.0.0'

async function start() {
  const app = await buildApp()
  try {
    await app.listen({ port: PORT, host: HOST })
    console.log(`🚀 API avviata su http://${HOST}:${PORT}`)
    if (process.env['NODE_ENV'] !== 'production') {
      console.log(`📖 Swagger UI: http://localhost:${PORT}/docs`)
    }

    // ADR-002: Cleanup periodico dei lock scaduti ogni 60 secondi
    const CLEANUP_INTERVAL_MS = 60 * 1000
    setInterval(async () => {
      try {
        const sbloccati = await cleanupExpiredLocks()
        if (sbloccati > 0) {
          app.log.info(`[Lock Cleanup] Sbloccati ${sbloccati} slot scaduti`)
        }
      } catch (e) {
        app.log.error(e, '[Lock Cleanup] Errore durante pulizia lock')
      }
    }, CLEANUP_INTERVAL_MS)

  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
