/**
 * @file        seed.ts
 * @module      @medico/db
 * @description Script per ripulire completamente il database da dati di test
 *              e ripopolare i dati demo ufficiali (Studio San Marco, Dott. Mario Verdi,
 *              Giulia Colombo Segreteria, Paziente Marco Prencipe, slot puliti a 30 giorni).
 * @author      Agent-1 | Session: 2026-09-12
 * @version     0.2.0
 */

import { db } from './index.js'
import {
  studi,
  medici,
  staff,
  staffPermissions,
  pazienti,
  slotAgenda,
  prenotazioni,
  consentLog,
  richiesteSpeciali,
  broadcast,
  logNotifiche,
} from './schema/index.js'

async function seed() {
  console.log('🧹 [PULIZIA DATABASE] Eliminazione completa di dati di test e prenotazioni...')

  // 1. Pulizia a cascata nel giusto ordine di foreign key
  await db.delete(prenotazioni)
  await db.delete(slotAgenda)
  await db.delete(richiesteSpeciali)
  await db.delete(broadcast)
  await db.delete(logNotifiche)
  await db.delete(consentLog)
  await db.delete(staffPermissions)
  await db.delete(staff)
  await db.delete(pazienti)
  await db.delete(medici)
  await db.delete(studi)

  console.log('✓ Tabelle ripulite con successo.')
  console.log('🌱 Popolamento dati iniziali puliti...')

  // 2. Studio Medico
  const [studio] = await db
    .insert(studi)
    .values({
      nome: 'Studio Medico San Marco',
      indirizzo: 'Via Roma 123, Milano',
      telefono: '+39 02 1234567',
      email: 'info@studiomedicosanmarco.it',
      config: {
        citta: 'Milano',
        indirizzoCompleto: 'Via Roma 123, 20121 Milano (MI)',
        recapitoUrgente: '+39 02 1234569',
        orariVisite: [
          { giorno: 'lunedi', attivo: true, oraInizioMattina: '09:00', oraFineMattina: '13:00', oraInizioPomeriggio: '15:00', oraFinePomeriggio: '18:00' },
          { giorno: 'martedi', attivo: true, oraInizioMattina: '09:00', oraFineMattina: '13:00', oraInizioPomeriggio: '15:00', oraFinePomeriggio: '18:00' },
          { giorno: 'mercoledi', attivo: true, oraInizioMattina: '09:00', oraFineMattina: '13:00', oraInizioPomeriggio: '15:00', oraFinePomeriggio: '18:00' },
          { giorno: 'giovedi', attivo: true, oraInizioMattina: '09:00', oraFineMattina: '13:00', oraInizioPomeriggio: '15:00', oraFinePomeriggio: '18:00' },
          { giorno: 'venerdi', attivo: true, oraInizioMattina: '09:00', oraFineMattina: '13:00' },
          { giorno: 'sabato', attivo: true, oraInizioMattina: '09:00', oraFineMattina: '12:00' },
        ],
        durataVisitaStandardMinuti: 20,
        lockupMinutes: 10,
        anticipoMaxPrenotazioneGiorni: 30,
        anticipoMinDisdettaOre: 2,
        fasciaRiservataUrgenze: true,
        broadcastTemplates: [
          { id: 'bt-1', titolo: 'Ritardo 30 minuti', testo: 'Gentile paziente, a causa di un\'urgenza le visite odierne subiranno circa 30 minuti di ritardo. Ci scusiamo per il disagio.' },
          { id: 'bt-2', titolo: 'Chiusura Improvvisa Pomeriggio', testo: 'AVVISO STUDIO: Per improvvisa indisposizione del medico, lo studio oggi pomeriggio resterà chiuso. Sarete ricontattati per riprogrammare.' },
          { id: 'bt-3', titolo: 'Promemoria Esami', testo: 'Promemoria: Per la visita di oggi si ricorda di portare il tesserino sanitario e gli ultimi esami del sangue.' },
        ],
        permessiSegreteria: {
          evasioneRicetteContinuative: true,
          accettazioneAppuntamenti: true,
          invioBroadcastUrgenze: true,
          visualizzazioneCartellaClinica: false,
        },
        messaggioPazientiApp: 'In caso di emergenza grave o pericolo di vita contattare il 112 o recarsi al Pronto Soccorso.',
        onboardingCompleted: true,
      },
    })
    .returning()

  if (!studio) throw new Error('Errore creazione studio')
  console.log('✓ Studio creato:', studio.nome, `(${studio.id})`)

  // 3. Medico Curante
  const [medico] = await db
    .insert(medici)
    .values({
      studioId: studio.id,
      nome: 'Mario',
      cognome: 'Verdi',
      email: 'mario.verdi@studiomedicosanmarco.it',
      telefonoPrimario: '+39 340 1122334',
      passwordHash: 'dev_hash_not_for_prod',
    })
    .returning()

  if (!medico) throw new Error('Errore creazione medico')
  console.log('✓ Medico creato: Dott.', medico.nome, medico.cognome, `(${medico.id})`)

  // 4. Staff Segreteria
  const [segretaria] = await db
    .insert(staff)
    .values({
      studioId: studio.id,
      medicoId: medico.id,
      nome: 'Giulia',
      cognome: 'Colombo',
      email: 'giulia.colombo@studiomedicosanmarco.it',
      passwordHash: 'dev_hash_not_for_prod',
      attivo: true,
    })
    .returning()

  if (segretaria) {
    console.log('✓ Segreteria creata:', segretaria.nome, segretaria.cognome, `(${segretaria.id})`)
  }

  // 5. Paziente di riferimento
  const [paziente] = await db
    .insert(pazienti)
    .values({
      studioId: studio.id,
      medicoId: medico.id,
      nome: 'Marco',
      cognome: 'Prencipe',
      dataNascita: '1995-05-15',
      codiceFiscale: 'PRNMCR95E15F205X',
      email: 'marco@test.it',
      telefono: '+39 333 9988776',
      passwordHash: 'dev_hash_not_for_prod',
      pushConsenso: true,
    })
    .returning()

  if (paziente) {
    console.log('✓ Paziente creato:', paziente.nome, paziente.cognome, `(${paziente.id})`)
  }

  // 6. Generazione slot disponibili puliti su finestra di 30 giorni
  const oggi = new Date()
  const orariMattina = [
    { start: '09:00', end: '09:20', durata: 20 },
    { start: '09:20', end: '09:40', durata: 20 },
    { start: '09:40', end: '10:00', durata: 20 },
    { start: '10:00', end: '10:20', durata: 20 },
    { start: '10:20', end: '10:40', durata: 20 },
    { start: '10:40', end: '11:00', durata: 20 },
    { start: '11:00', end: '11:30', durata: 30 },
  ]
  const orariPomeriggio = [
    { start: '15:00', end: '15:30', durata: 30 },
    { start: '15:30', end: '16:00', durata: 30 },
    { start: '16:00', end: '16:30', durata: 30 },
    { start: '16:30', end: '17:00', durata: 30 },
  ]

  const slotValues = []
  for (let i = 0; i < 30; i++) {
    const d = new Date(oggi)
    d.setDate(oggi.getDate() + i)
    const dayOfWeek = d.getDay()

    // Escludi domeniche (giorno di riposo studio)
    if (dayOfWeek === 0) continue

    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const dataStr = `${yyyy}-${mm}-${dd}`

    // Slot mattina per tutti i giorni feriali e sabato
    for (const o of orariMattina) {
      slotValues.push({
        studioId: studio.id,
        medicoId: medico.id,
        data: dataStr,
        oraInizio: o.start,
        oraFine: o.end,
        durataMin: o.durata,
        stato: 'libero' as const,
      })
    }

    // Slot pomeriggio (dal lunedì al venerdì)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      for (const o of orariPomeriggio) {
        slotValues.push({
          studioId: studio.id,
          medicoId: medico.id,
          data: dataStr,
          oraInizio: o.start,
          oraFine: o.end,
          durataMin: o.durata,
          stato: 'libero' as const,
        })
      }
    }
  }

  // Inserimento batch slot puliti
  await db.insert(slotAgenda).values(slotValues)
  console.log(`✓ Generati ${slotValues.length} slot puliti tutti in stato 'libero' per i prossimi 30 giorni feriali.`)

  console.log('✨ [DATABASE PULITO] Database ripristinato a stato demo pulito senza residui di test!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Errore durante la pulizia e seeding:', err)
  process.exit(1)
})
