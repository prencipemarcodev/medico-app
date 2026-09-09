/**
 * @file        index.ts
 * @module      @medico/db
 * @description Connessione al database e client Drizzle
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/archiviazione/database-schema]]
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index'

const connectionString = process.env['DATABASE_URL']
if (!connectionString) {
  throw new Error('DATABASE_URL non configurata')
}

// Client postgres con pool
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/**
 * @function    createDb
 * @description Crea e restituisce il client Drizzle con tutti gli schema
 * @returns     {ReturnType<typeof drizzle>} Client Drizzle configurato
 */
export const db = drizzle(client, { schema })

export type DB = typeof db

export * from './schema/index'
