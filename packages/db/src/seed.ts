/**
 * @file        seed.ts
 * @module      @medico/db
 * @description Script per popolare dati iniziali di prova (Studio, Medico, Slot)
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 */

import { db } from './index.js'
import { studi, medici, pazienti, slotAgenda } from './schema/index.js'

async function seed() {
  console.log('🌱 Inizio seeding database di sviluppo...')

  // Pulizia dati precedenti per idempotenza
  await db.delete(slotAgenda)
  await db.delete(pazienti)
  await db.delete(medici)
  await db.delete(studi)

  // 1. Studio medico di prova
  const [studio] = await db.insert(studi).values({
    nome: 'Studio Medico San Marco',
    indirizzo: 'Via Roma 123, Milano',
    telefono: '+39 02 1234567',
    email: 'info@studiomedicosanmarco.it',
  }).returning()

  if (!studio) throw new Error('Errore creazione studio')
  console.log('✓ Studio creato:', studio.nome, `(${studio.id})`)

  // 2. Medico curante
  const [medico] = await db.insert(medici).values({
    studioId: studio.id,
    nome: 'Mario',
    cognome: 'Verdi',
    email: 'mario.verdi@studiomedicosanmarco.it',
    telefonoPrimario: '+39 340 1122334',
    passwordHash: 'dev_hash_not_for_prod',
  }).returning()

  if (!medico) throw new Error('Errore creazione medico')
  console.log('✓ Medico creato: Dott.', medico.nome, medico.cognome, `(${medico.id})`)

  // 3. Paziente di test
  const [paziente] = await db.insert(pazienti).values({
    studioId: studio.id,
    medicoId: medico.id,
    nome: 'Marco',
    cognome: 'Prencipe',
    dataNascita: '1995-05-15',
    email: 'marco@test.it',
    telefono: '+39 333 9988776',
    passwordHash: 'dev_hash_not_for_prod',
    pushConsenso: true,
  }).returning()

  if (paziente) console.log('✓ Paziente creato:', paziente.nome, paziente.cognome, `(${paziente.id})`)

  // 4. Generazione slot per oggi e domani
  const oggi = new Date()
  const dateList = [
    oggi.toISOString().split('T')[0]!,
    new Date(oggi.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]!,
  ]

  const orari = [
    { start: '09:00', end: '09:20', durata: 20 },
    { start: '09:20', end: '09:40', durata: 20 },
    { start: '09:40', end: '10:00', durata: 20 },
    { start: '10:00', end: '10:20', durata: 20 },
    { start: '10:20', end: '10:40', durata: 20 },
    { start: '10:40', end: '11:00', durata: 20 },
    { start: '11:00', end: '11:30', durata: 30 },
  ]

  const slotValues = []
  for (const d of dateList) {
    for (const o of orari) {
      slotValues.push({
        studioId: studio.id,
        medicoId: medico.id,
        data: d,
        oraInizio: o.start,
        oraFine: o.end,
        durataMin: o.durata,
        stato: 'libero' as const,
      })
    }
  }

  await db.insert(slotAgenda).values(slotValues)
  console.log(`✓ Inseriti ${slotValues.length} slot disponibili per ${dateList.join(', ')}`)

  console.log('🌱 Seeding completato con successo!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Errore durante il seed:', err)
  process.exit(1)
})
