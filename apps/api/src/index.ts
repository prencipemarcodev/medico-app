/**
 * @file        index.ts
 * @module      @medico/api
 * @description Entry point del server Fastify
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 */

import { buildApp } from './app.js'

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
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
