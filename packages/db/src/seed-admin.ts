/**
 * @file        seed-admin.ts
 * @module      @medico/db
 * @description Inizializza l'account Super Admin di default nel database
 * @author      Agent-1 | Session: 2026-09-12
 */

import { db } from './index.js'
import { amministratori } from './schema/index.js'
import { hashPassword } from './auth.js'
import { eq } from 'drizzle-orm'

async function seedAdmin() {
  const adminEmail = process.env['ADMIN_EMAIL'] || 'admin@studiomedico.it'
  const adminPassword = process.env['ADMIN_PASSWORD'] || 'Admin2026!'

  console.log(`🔑 Inizializzazione Super Admin (${adminEmail})...`)

  const existing = await db
    .select()
    .from(amministratori)
    .where(eq(amministratori.email, adminEmail))
    .limit(1)

  if (existing.length > 0) {
    console.log(`ℹ️ L'account Super Admin (${adminEmail}) esiste già.`)
    process.exit(0)
  }

  const [admin] = await db
    .insert(amministratori)
    .values({
      nome: 'Super',
      cognome: 'Admin',
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      ruolo: 'admin',
      attivo: true,
    })
    .returning()

  console.log(`✓ Super Admin creato con successo!`)
  console.log(`  ID:       ${admin.id}`)
  console.log(`  Email:    ${admin.email}`)
  console.log(`  Password: ${adminPassword}`)
  process.exit(0)
}

seedAdmin().catch((err) => {
  console.error('❌ Errore durante la creazione del Super Admin:', err)
  process.exit(1)
})
