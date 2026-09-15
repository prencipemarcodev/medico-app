import { NextResponse } from 'next/server'
import { db, eq, and } from '@medico/db'
import { studi, medici, slotAgenda } from '@medico/db/schema'
import { getSession } from '@/lib/server-auth'

const GIORNI_MAP = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'] as const

interface OrarioFascia {
  attiva?: boolean
  inizio?: string
  fine?: string
}

interface OrarioGiorno {
  aperto: boolean
  mattina?: OrarioFascia
  pomeriggio?: OrarioFascia
}

type OrariSettimanali = Record<string, OrarioGiorno>

/**
 * Helper per generare slot orari continui tra due orari 'HH:MM' con passo 'stepMin'
 */
function generaSlotFascia(
  inizio: string,
  fine: string,
  stepMin: number
): Array<{ oraInizio: string; oraFine: string }> {
  const res: Array<{ oraInizio: string; oraFine: string }> = []
  const startParts = inizio.split(':')
  const endParts = fine.split(':')
  const startH = Number(startParts[0])
  const startM = Number(startParts[1])
  const endH = Number(endParts[0])
  const endM = Number(endParts[1])

  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return res

  let current = startH * 60 + startM
  const limit = endH * 60 + endM

  while (current + stepMin <= limit) {
    const sH = String(Math.floor(current / 60)).padStart(2, '0')
    const sM = String(current % 60).padStart(2, '0')
    const eH = String(Math.floor((current + stepMin) / 60)).padStart(2, '0')
    const eM = String((current + stepMin) % 60).padStart(2, '0')
    res.push({
      oraInizio: `${sH}:${sM}`,
      oraFine: `${eH}:${eM}`,
    })
    current += stepMin
  }

  return res
}

/**
 * GET /api/onboarding
 * Recupera i dati correnti dello studio e del medico per il pre-popolamento dell'onboarding
 */
export async function GET() {
  try {
    const session = await getSession()
    if (!session || (session.ruolo !== 'medico' && session.ruolo !== 'admin')) {
      return NextResponse.json({ error: 'Accesso non autorizzato' }, { status: 401 })
    }

    let medicoId = session.ruolo === 'medico' ? session.id : null
    let studioId = (session as any).studioId || null

    let medico: any = null
    if (medicoId) {
      const [m] = await db.select().from(medici).where(eq(medici.id, medicoId)).limit(1)
      medico = m
      if (m?.studioId) studioId = m.studioId
    }

    if (!studioId) {
      const [firstStudio] = await db.select().from(studi).limit(1)
      if (firstStudio) studioId = firstStudio.id
    }

    let studio: any = null
    if (studioId) {
      const [s] = await db.select().from(studi).where(eq(studi.id, studioId)).limit(1)
      studio = s
    }

    return NextResponse.json({
      success: true,
      studio: studio
        ? {
            id: studio.id,
            nome: studio.nome,
            codiceStudio: studio.codiceStudio,
            indirizzo: studio.indirizzo,
            telefono: studio.telefono,
            email: studio.email,
            config: studio.config || {},
            onboardingCompleted: (studio.config as any)?.onboardingCompleted ?? false,
          }
        : null,
      medico: medico
        ? {
            id: medico.id,
            nome: medico.nome,
            cognome: medico.cognome,
            email: medico.email,
            telefono: medico.telefonoPrimario,
          }
        : null,
    })
  } catch (error: any) {
    console.error('Errore GET onboarding:', error)
    return NextResponse.json({ error: error?.message || 'Errore interno' }, { status: 500 })
  }
}

/**
 * POST /api/onboarding
 * Salva la configurazione orari settimanali del medico, aggiorna lo studio e genera gli slot reali
 */
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.ruolo !== 'medico' && session.ruolo !== 'admin')) {
      return NextResponse.json({ error: 'Accesso non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const {
      nomeStudio,
      citta,
      indirizzo,
      telefono,
      emailStudio,
      orariSettimanali,
      durataVisita = 20,
      lockupMinutes = 10,
      anticipoMax = 30,
      anticipoDisdetta = 2,
      riservaUrgenze = true,
      delegaRicette = true,
      delegaAccettazione = true,
    } = body

    if (!nomeStudio?.trim()) {
      return NextResponse.json({ error: 'Il nome dello studio è obbligatorio' }, { status: 400 })
    }

    // Identifica studio e medico
    let medicoId = session.ruolo === 'medico' ? session.id : null
    let studioId = (session as any).studioId || null

    if (medicoId) {
      const [m] = await db.select().from(medici).where(eq(medici.id, medicoId)).limit(1)
      if (m?.studioId) studioId = m.studioId
    }

    if (!studioId) {
      const [firstStudio] = await db.select().from(studi).limit(1)
      if (firstStudio) studioId = firstStudio.id
    }

    if (!studioId) {
      return NextResponse.json({ error: 'Studio medico non trovato' }, { status: 404 })
    }

    const durata = (durataVisita === 10 || durataVisita === 30 ? durataVisita : 20) as 10 | 20 | 30

    // Orari settimanali di default se non forniti
    const orariEffettivi: OrariSettimanali = orariSettimanali || {
      lun: { aperto: true, mattina: { attiva: true, inizio: '09:00', fine: '12:30' }, pomeriggio: { attiva: true, inizio: '15:30', fine: '19:00' } },
      mar: { aperto: true, mattina: { attiva: true, inizio: '09:00', fine: '12:30' }, pomeriggio: { attiva: true, inizio: '15:30', fine: '19:00' } },
      mer: { aperto: true, mattina: { attiva: true, inizio: '09:00', fine: '12:30' }, pomeriggio: { attiva: true, inizio: '15:30', fine: '19:00' } },
      gio: { aperto: true, mattina: { attiva: true, inizio: '09:00', fine: '12:30' }, pomeriggio: { attiva: true, inizio: '15:30', fine: '19:00' } },
      ven: { aperto: true, mattina: { attiva: true, inizio: '09:00', fine: '12:30' }, pomeriggio: { attiva: true, inizio: '15:30', fine: '19:00' } },
      sab: { aperto: false },
      dom: { aperto: false },
    }

    // 1. Aggiornamento Studio
    const [studioAggiornato] = await db
      .update(studi)
      .set({
        nome: nomeStudio.trim(),
        indirizzo: indirizzo?.trim() || null,
        telefono: telefono?.trim() || null,
        email: emailStudio?.trim() || null,
        config: {
          citta: citta?.trim() || '',
          indirizzoCompleto: indirizzo?.trim() || '',
          orariSettimanali: orariEffettivi,
          durataVisitaStandardMinuti: durata,
          lockupMinutes: Number(lockupMinutes) || 10,
          anticipoMaxPrenotazioneGiorni: Number(anticipoMax) || 30,
          anticipoMinDisdettaOre: Number(anticipoDisdetta) || 2,
          fasciaRiservataUrgenze: Boolean(riservaUrgenze),
          permessiSegreteria: {
            evasioneRicetteContinuative: Boolean(delegaRicette),
            accettazioneAppuntamenti: Boolean(delegaAccettazione),
            invioBroadcastUrgenze: true,
            visualizzazioneCartellaClinica: false,
          },
          broadcastTemplates: [
            { id: 'bt-1', titolo: 'Ritardo 30 minuti', testo: 'Gentile paziente, a causa di un\'urgenza le visite odierne subiranno circa 30 minuti di ritardo. Ci scusiamo per il disagio.' },
            { id: 'bt-2', titolo: 'Chiusura Improvvisa Pomeriggio', testo: 'AVVISO STUDIO: Per improvvisa indisposizione del medico, lo studio oggi pomeriggio resterà chiuso.' },
            { id: 'bt-3', titolo: 'Promemoria Esami', testo: 'Promemoria: Si ricorda di portare gli ultimi esami del sangue e il tesserino sanitario.' },
          ],
          messaggioPazientiApp: 'In caso di emergenza grave o pericolo di vita contattare il 112 o recarsi al Pronto Soccorso.',
          onboardingCompleted: true,
        },
        updatedAt: new Date(),
      })
      .where(eq(studi.id, studioId))
      .returning()

    // 2. Se abbiamo un medico, rimuoviamo vecchi slot liberi e generiamo la nuova agenda
    let slotsGenerati = 0
    if (medicoId) {
      // Elimina vecchi slot liberi non ancora prenotati per rigenerare l'agenda precisa
      await db
        .delete(slotAgenda)
        .where(
          and(
            eq(slotAgenda.medicoId, medicoId),
            eq(slotAgenda.stato, 'libero')
          )
        )

      const oggi = new Date()
      const giorniOrizzonte = Number(anticipoMax) || 30
      const slotValues: Array<{
        studioId: string
        medicoId: string
        data: string
        oraInizio: string
        oraFine: string
        durataMin: number
        stato: 'libero'
      }> = []

      for (let i = 0; i < giorniOrizzonte; i++) {
        const d = new Date(oggi)
        d.setDate(oggi.getDate() + i)

        const dayOfWeekIndex = d.getDay()
        const dayKey = GIORNI_MAP[dayOfWeekIndex]
        if (!dayKey) continue
        const orarioGiorno = orariEffettivi[dayKey]

        // Se lo studio è chiuso in questo giorno, salta
        if (!orarioGiorno || !orarioGiorno.aperto) {
          continue
        }

        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        const dataStr = `${yyyy}-${mm}-${dd}`

        // Genera slot Mattina
        if (orarioGiorno.mattina?.attiva && orarioGiorno.mattina.inizio && orarioGiorno.mattina.fine) {
          const slotsMattina = generaSlotFascia(orarioGiorno.mattina.inizio, orarioGiorno.mattina.fine, durata)
          for (const s of slotsMattina) {
            slotValues.push({
              studioId,
              medicoId,
              data: dataStr,
              oraInizio: s.oraInizio,
              oraFine: s.oraFine,
              durataMin: durata,
              stato: 'libero',
            })
          }
        }

        // Genera slot Pomeriggio
        if (orarioGiorno.pomeriggio?.attiva && orarioGiorno.pomeriggio.inizio && orarioGiorno.pomeriggio.fine) {
          const slotsPomeriggio = generaSlotFascia(orarioGiorno.pomeriggio.inizio, orarioGiorno.pomeriggio.fine, durata)
          for (const s of slotsPomeriggio) {
            slotValues.push({
              studioId,
              medicoId,
              data: dataStr,
              oraInizio: s.oraInizio,
              oraFine: s.oraFine,
              durataMin: durata,
              stato: 'libero',
            })
          }
        }
      }

      if (slotValues.length > 0) {
        // Inserisci in batch di 500 per evitare limiti di parametri SQL
        const BATCH_SIZE = 500
        for (let i = 0; i < slotValues.length; i += BATCH_SIZE) {
          const batch = slotValues.slice(i, i + BATCH_SIZE)
          await db.insert(slotAgenda).values(batch)
        }
        slotsGenerati = slotValues.length
      }
    }

    return NextResponse.json({
      success: true,
      studio: studioAggiornato,
      slotsGenerati,
      redirectUrl: '/dashboard',
    })
  } catch (error: any) {
    console.error('Errore API onboarding:', error)
    return NextResponse.json(
      { error: error?.message || 'Errore interno del server' },
      { status: 500 }
    )
  }
}
