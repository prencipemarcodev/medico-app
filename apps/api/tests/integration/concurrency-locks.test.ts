/**
 * @file        concurrency-locks.test.ts
 * @module      @medico/api/tests/integration
 * @description Test reali sul database PostgreSQL 16: concorrenza atomica ADR-002,
 *              lockup TTL, sblocco immediato al cambio data e finalizzazione prenotazione.
 * @author      Agent-1 | Session: 2026-09-12
 * @version     1.0.0
 */

import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import {
  db,
  studi,
  medici,
  pazienti,
  slotAgenda,
  prenotazioni,
  eq,
} from '@medico/db'
import {
  lockSlot,
  unlockSlot,
  cleanupExpiredLocks,
  getAvailableSlots,
} from '../../src/services/slotService.js'
import {
  creaPrenotazione,
  getPrenotazioniPaziente,
} from '../../src/services/prenotazioneService.js'
import { buildApp } from '../../src/app.js'
import type { FastifyInstance } from 'fastify'

describe('🔬 Test Reali Database: Concorrenza ADR-002, Lock & Prenotazioni', () => {
  let app: FastifyInstance
  let studioId: string
  let medicoId: string
  let paziente1Id: string
  let paziente2Id: string
  let testDate: string
  const createdSlotIds: string[] = []

  before(async () => {
    app = await buildApp()
    testDate = new Date().toISOString().split('T')[0]!

    // Recupera o crea i record di riferimento nel database reale
    const [existingStudio] = await db.select().from(studi).limit(1)
    if (existingStudio) {
      studioId = existingStudio.id
    } else {
      const [s] = await db.insert(studi).values({
        nome: 'Studio Test Reale',
        indirizzo: 'Via Test 1, Milano',
        telefono: '+39 02 0000000',
        email: 'test@studio.it',
      }).returning()
      studioId = s!.id
    }

    const [existingMedico] = await db.select().from(medici).limit(1)
    if (existingMedico) {
      medicoId = existingMedico.id
    } else {
      const [m] = await db.insert(medici).values({
        studioId,
        nome: 'Mario',
        cognome: 'Verdi',
        email: 'dott.verdi@test.it',
        telefonoPrimario: '+39 340 0000001',
        passwordHash: 'hash_test',
      }).returning()
      medicoId = m!.id
    }

    // Paziente 1
    const [p1] = await db.insert(pazienti).values({
      studioId,
      medicoId,
      nome: 'Paziente',
      cognome: 'Uno',
      dataNascita: '1990-01-01',
      codiceFiscale: `TESTP1${Date.now()}`,
      email: `p1-${Date.now()}@test.it`,
      telefono: '+39 333 1111111',
      passwordHash: 'hash_test',
    }).returning()
    paziente1Id = p1!.id

    // Paziente 2
    const [p2] = await db.insert(pazienti).values({
      studioId,
      medicoId,
      nome: 'Paziente',
      cognome: 'Due',
      dataNascita: '1992-02-02',
      codiceFiscale: `TESTP2${Date.now()}`,
      email: `p2-${Date.now()}@test.it`,
      telefono: '+39 333 2222222',
      passwordHash: 'hash_test',
    }).returning()
    paziente2Id = p2!.id
  })

  after(async () => {
    // Pulizia rigorosa di tutti i dati di test creati
    for (const sId of createdSlotIds) {
      await db.delete(prenotazioni).where(eq(prenotazioni.slotId, sId))
      await db.delete(slotAgenda).where(eq(slotAgenda.id, sId))
    }
    if (paziente1Id) {
      await db.delete(prenotazioni).where(eq(prenotazioni.pazienteId, paziente1Id))
      await db.delete(pazienti).where(eq(pazienti.id, paziente1Id))
    }
    if (paziente2Id) {
      await db.delete(prenotazioni).where(eq(prenotazioni.pazienteId, paziente2Id))
      await db.delete(pazienti).where(eq(pazienti.id, paziente2Id))
    }
    await app.close()
  })

  it('1. [CONCORRENZA PURA] Due pazienti provano a bloccare simultaneamente lo stesso slot: esattamente 1 vince, l\'altro riceve 409', async () => {
    // Crea uno slot fresco libero per il test
    const [testSlot] = await db.insert(slotAgenda).values({
      studioId,
      medicoId,
      data: testDate,
      oraInizio: '12:00',
      oraFine: '12:20',
      durataMin: 20,
      stato: 'libero',
    }).returning()
    assert.ok(testSlot, 'Slot creato con successo nel DB')
    createdSlotIds.push(testSlot!.id)

    // Esegui due lock in parallelo perfetto sullo stesso slotId (SELECT ... FOR UPDATE)
    const [res1, res2] = await Promise.all([
      lockSlot(testSlot.id, paziente1Id),
      lockSlot(testSlot.id, paziente2Id),
    ])

    const vittorie = [res1, res2].filter((r) => r.success === true)
    const conflitti = [res1, res2].filter((r) => r.success === false)

    assert.equal(vittorie.length, 1, 'Esattamente una richiesta di lock deve vincere')
    assert.equal(conflitti.length, 1, 'Esattamente una richiesta deve andare in conflitto 409')

    const vincitore = vittorie[0]!
    const perdente = conflitti[0]!

    assert.ok(vincitore.lockToken, 'Il vincitore riceve un UUID lockToken valido')
    assert.equal(vincitore.durataMinuti, 10, 'La durata del lockup deve essere di 10 minuti (ADR-002)')
    assert.equal(perdente.code, 'CURRENTLY_LOCKED', 'Il perdente riceve errore CURRENTLY_LOCKED')
    assert.ok(perdente.lockedUntil, 'Il perdente riceve la data di scadenza del lock')

    // Verifica stato effettivo della riga su PostgreSQL
    const [row] = await db.select().from(slotAgenda).where(eq(slotAgenda.id, testSlot.id))
    assert.equal(row?.stato, 'bloccato')
    assert.equal(row?.lockToken, vincitore.lockToken)
  })

  it('2. [SBLOCCO AL CAMBIO DATA] Il paziente che detiene il lock cambia data: lo slot si libera all\'istante e il 2° paziente può bloccarlo subito', async () => {
    // 1. Crea slot
    const [testSlot] = await db.insert(slotAgenda).values({
      studioId,
      medicoId,
      data: testDate,
      oraInizio: '12:20',
      oraFine: '12:40',
      durataMin: 20,
      stato: 'libero',
    }).returning()
    createdSlotIds.push(testSlot!.id)

    // 2. Paziente 1 blocca lo slot
    const lock1 = await lockSlot(testSlot!.id, paziente1Id)
    assert.equal(lock1.success, true)

    // 3. Paziente 2 prova a bloccarlo: fallisce
    const lock2Fail = await lockSlot(testSlot!.id, paziente2Id)
    assert.equal(lock2Fail.success, false)
    assert.equal(lock2Fail.code, 'CURRENTLY_LOCKED')

    // 4. Paziente 1 cambia data: chiama unlockSlot
    const unlockRes = await unlockSlot(testSlot!.id, lock1.lockToken)
    assert.equal(unlockRes.success, true, 'Lo sblocco deve avere successo')

    // Verifica su PostgreSQL: slot tornato libero
    const [rowAfterUnlock] = await db.select().from(slotAgenda).where(eq(slotAgenda.id, testSlot!.id))
    assert.equal(rowAfterUnlock?.stato, 'libero')
    assert.equal(rowAfterUnlock?.lockToken, null)
    assert.equal(rowAfterUnlock?.lockedUntil, null)

    // 5. Paziente 2 ora può bloccarlo immediatamente!
    const lock2Success = await lockSlot(testSlot!.id, paziente2Id)
    assert.equal(lock2Success.success, true, 'Paziente 2 acquisisce lo slot liberato')
    assert.ok(lock2Success.lockToken)
  })

  it('3. [SCADENZA TTL 10 MIN] Uno slot con lock scaduto nel passato viene ripristinato automaticamente come libero da cleanupExpiredLocks', async () => {
    // Slot con lock scaduto 2 minuti fa
    const dueMinutiFa = new Date(Date.now() - 2 * 60 * 1000)
    const [testSlot] = await db.insert(slotAgenda).values({
      studioId,
      medicoId,
      data: testDate,
      oraInizio: '12:40',
      oraFine: '13:00',
      durataMin: 20,
      stato: 'bloccato',
      lockedUntil: dueMinutiFa,
      lockToken: crypto.randomUUID(),
      lockedBy: paziente1Id,
    }).returning()
    createdSlotIds.push(testSlot!.id)

    // Esecuzione job di cleanup
    const sbloccati = await cleanupExpiredLocks()
    assert.ok(sbloccati >= 1, 'cleanupExpiredLocks ha trovato e sbloccato lo slot scaduto')

    // Verifica nel database
    const [row] = await db.select().from(slotAgenda).where(eq(slotAgenda.id, testSlot!.id))
    assert.equal(row?.stato, 'libero', 'Lo slot è tornato libero')
    assert.equal(row?.lockToken, null)
  })

  it('4. [FINALIZZAZIONE PRENOTAZIONE] La prenotazione si conferma solo con lockToken valido; token errato riceve errore; secondo tentativo fallisce', async () => {
    const [testSlot] = await db.insert(slotAgenda).values({
      studioId,
      medicoId,
      data: testDate,
      oraInizio: '15:00',
      oraFine: '15:20',
      durataMin: 20,
      stato: 'libero',
    }).returning()
    createdSlotIds.push(testSlot!.id)

    // 1. Lock slot
    const lockRes = await lockSlot(testSlot!.id, paziente1Id)
    assert.equal(lockRes.success, true)

    // 2. Tentativo con token falso
    const fakeToken = crypto.randomUUID()
    const fakeRes = await creaPrenotazione({
      slotId: testSlot!.id,
      lockToken: fakeToken,
      pazienteId: paziente1Id,
      tipologiaVisita: 'standard',
      motivoCategoria: 'controllo_routine',
      motivoNote: 'Test note',
    })
    assert.equal(fakeRes.success, false)
    assert.equal(fakeRes.code, 'LOCK_INVALID_OR_EXPIRED')

    // 3. Conferma reale con il lockToken corretto
    const okRes = await creaPrenotazione({
      slotId: testSlot!.id,
      lockToken: lockRes.lockToken,
      pazienteId: paziente1Id,
      tipologiaVisita: 'standard',
      motivoCategoria: 'controllo_routine',
      motivoNote: 'Controllo pressione arteriosa',
    })
    assert.equal(okRes.success, true)
    assert.ok(okRes.prenotazione?.id)

    // Verifica riga prenotazione su PostgreSQL
    const [prenotazioneRow] = await db
      .select()
      .from(prenotazioni)
      .where(eq(prenotazioni.id, okRes.prenotazione!.id))
    assert.equal(prenotazioneRow?.stato, 'confermata')
    assert.equal(prenotazioneRow?.pazienteId, paziente1Id)

    // Verifica stato dello slot su PostgreSQL: deve essere 'prenotato'
    const [slotRow] = await db.select().from(slotAgenda).where(eq(slotAgenda.id, testSlot!.id))
    assert.equal(slotRow?.stato, 'prenotato')

    // 4. Tentativo di ri-prenotare lo stesso slot già confermato: deve fallire
    const secondTry = await creaPrenotazione({
      slotId: testSlot!.id,
      lockToken: lockRes.lockToken,
      pazienteId: paziente2Id,
      tipologiaVisita: 'breve',
      motivoCategoria: 'esami_sangue',
    })
    assert.equal(secondTry.success, false)
    assert.equal(secondTry.code, 'ALREADY_BOOKED')
  })

  it('5. [FASTIFY HTTP API END-TO-END] Test inject HTTP su /api/slot/:id/lock, /api/slot/:id/unlock e /api/prenotazioni', async () => {
    // 1. Health check
    const healthRes = await app.inject({
      method: 'GET',
      url: '/health',
    })
    assert.equal(healthRes.statusCode, 200)
    assert.equal(JSON.parse(healthRes.payload).status, 'ok')

    // 2. Crea slot di test
    const [slotHttp] = await db.insert(slotAgenda).values({
      studioId,
      medicoId,
      data: testDate,
      oraInizio: '15:20',
      oraFine: '15:40',
      durataMin: 20,
      stato: 'libero',
    }).returning()
    createdSlotIds.push(slotHttp!.id)

    // 3. HTTP POST lock
    const lockHttpRes = await app.inject({
      method: 'POST',
      url: `/api/slot/${slotHttp!.id}/lock`,
      payload: { pazienteId: paziente1Id },
    })
    assert.equal(lockHttpRes.statusCode, 200)
    const lockBody = JSON.parse(lockHttpRes.payload)
    assert.equal(lockBody.success, true)
    assert.ok(lockBody.lockToken)

    // 4. Conflitto HTTP 409
    const conflictRes = await app.inject({
      method: 'POST',
      url: `/api/slot/${slotHttp!.id}/lock`,
      payload: { pazienteId: paziente2Id },
    })
    assert.equal(conflictRes.statusCode, 409)
    const conflictBody = JSON.parse(conflictRes.payload)
    assert.equal(conflictBody.code, 'CURRENTLY_LOCKED')

    // 5. HTTP POST unlock (cambio data)
    const unlockHttpRes = await app.inject({
      method: 'POST',
      url: `/api/slot/${slotHttp!.id}/unlock`,
      payload: { lockToken: lockBody.lockToken },
    })
    assert.equal(unlockHttpRes.statusCode, 200)
    assert.deepEqual(JSON.parse(unlockHttpRes.payload), {
      success: true,
      message: 'Slot sbloccato con successo',
    })

    // 6. Rilock e conferma via HTTP POST /api/prenotazioni
    const relockRes = await app.inject({
      method: 'POST',
      url: `/api/slot/${slotHttp!.id}/lock`,
      payload: { pazienteId: paziente1Id },
    })
    const relockBody = JSON.parse(relockRes.payload)

    const bookHttpRes = await app.inject({
      method: 'POST',
      url: '/api/prenotazioni',
      payload: {
        slotId: slotHttp!.id,
        lockToken: relockBody.lockToken,
        pazienteId: paziente1Id,
        tipologiaVisita: 'standard',
        motivoCategoria: 'esami_sangue',
        motivoNote: 'Controllo colesterolo post dieta',
      },
    })
    assert.equal(bookHttpRes.statusCode, 201)
    const bookBody = JSON.parse(bookHttpRes.payload)
    assert.equal(bookBody.success, true)
    assert.equal(bookBody.prenotazione.stato, 'confermata')
  })
})
