import { NextResponse } from 'next/server'
import { db } from '@medico/db'
import { studi, medici, slotAgenda } from '@medico/db/schema'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      nomeStudio,
      citta,
      indirizzo,
      telefono,
      emailStudio,
      nomeDottore,
      cognomeDottore,
      emailDottore,
      durataVisita = 20,
      lockupMinutes = 10,
      anticipoMax = 30,
      anticipoDisdetta = 2,
      riservaUrgenze = true,
      delegaRicette = true,
      delegaAccettazione = true,
    } = body

    if (!nomeStudio || !nomeDottore || !cognomeDottore) {
      return NextResponse.json(
        { error: 'Nome studio, nome dottore e cognome dottore sono obbligatori' },
        { status: 400 }
      )
    }

    const emailMedico = emailDottore?.trim() || `${nomeDottore.toLowerCase()}.${cognomeDottore.toLowerCase()}@${nomeStudio.toLowerCase().replace(/[^a-z0-9]/g, '') || 'studio'}.it`
    const emailStd = emailStudio?.trim() || `info@${nomeStudio.toLowerCase().replace(/[^a-z0-9]/g, '') || 'studio'}.it`

    // 1. Inserimento Studio
    const [studio] = await db
      .insert(studi)
      .values({
        nome: nomeStudio,
        indirizzo: indirizzo || null,
        telefono: telefono || null,
        email: emailStd,
        config: {
          citta: citta || '',
          indirizzoCompleto: indirizzo || '',
          durataVisitaStandardMinuti: durataVisita,
          lockupMinutes,
          anticipoMaxPrenotazioneGiorni: anticipoMax,
          anticipoMinDisdettaOre: anticipoDisdetta,
          fasciaRiservataUrgenze: riservaUrgenze,
          permessiSegreteria: {
            evasioneRicetteContinuative: delegaRicette,
            accettazioneAppuntamenti: delegaAccettazione,
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
      })
      .returning()

    if (!studio) {
      return NextResponse.json({ error: 'Errore durante la creazione dello studio' }, { status: 500 })
    }

    // 2. Inserimento Medico
    const [medico] = await db
      .insert(medici)
      .values({
        studioId: studio.id,
        nome: nomeDottore,
        cognome: cognomeDottore,
        email: emailMedico,
        telefonoPrimario: telefono || '+39 000 0000000',
        passwordHash: 'dev_hash_not_for_prod',
      })
      .returning()

    if (!medico) {
      return NextResponse.json({ error: 'Errore durante la creazione del medico' }, { status: 500 })
    }

    // 3. Generazione slot puliti per i prossimi 30 giorni
    const durata = (durataVisita === 10 || durataVisita === 30 ? durataVisita : 20) as 10 | 20 | 30
    const oggi = new Date()
    const slotValues: Array<{
      studioId: string
      medicoId: string
      data: string
      oraInizio: string
      oraFine: string
      durataMin: number
      stato: 'libero'
    }> = []

    const generaOrari = (startHour: number, endHour: number, stepMin: number) => {
      const res: Array<{ start: string; end: string }> = []
      let current = startHour * 60
      const end = endHour * 60
      while (current + stepMin <= end) {
        const sH = String(Math.floor(current / 60)).padStart(2, '0')
        const sM = String(current % 60).padStart(2, '0')
        const eH = String(Math.floor((current + stepMin) / 60)).padStart(2, '0')
        const eM = String((current + stepMin) % 60).padStart(2, '0')
        res.push({ start: `${sH}:${sM}`, end: `${eH}:${eM}` })
        current += stepMin
      }
      return res
    }

    const orariMattina = generaOrari(9, 12, durata)
    const orariPomeriggio = generaOrari(15, 18, durata)

    for (let i = 0; i < 30; i++) {
      const d = new Date(oggi)
      d.setDate(oggi.getDate() + i)
      const dayOfWeek = d.getDay()
      if (dayOfWeek === 0) continue // Salta domeniche

      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const dataStr = `${yyyy}-${mm}-${dd}`

      for (const o of orariMattina) {
        slotValues.push({
          studioId: studio.id,
          medicoId: medico.id,
          data: dataStr,
          oraInizio: o.start,
          oraFine: o.end,
          durataMin: durata,
          stato: 'libero',
        })
      }

      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        for (const o of orariPomeriggio) {
          slotValues.push({
            studioId: studio.id,
            medicoId: medico.id,
            data: dataStr,
            oraInizio: o.start,
            oraFine: o.end,
            durataMin: durata,
            stato: 'libero',
          })
        }
      }
    }

    if (slotValues.length > 0) {
      await db.insert(slotAgenda).values(slotValues)
    }

    return NextResponse.json({
      success: true,
      studio: { id: studio.id, nome: studio.nome },
      medico: { id: medico.id, nome: medico.nome, cognome: medico.cognome, email: medico.email },
      slotsGenerati: slotValues.length,
    })
  } catch (error: any) {
    console.error('Errore API onboarding:', error)
    return NextResponse.json(
      { error: error?.message || 'Errore interno del server' },
      { status: 500 }
    )
  }
}
