import { NextResponse } from 'next/server'
import { db, hashPassword, generateTemporaryPassword, eq, recordAuditLog } from '@medico/db'
import { pazienti } from '@medico/db/schema'
import { checkAuth } from '@/lib/server-auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAuth(['admin', 'medico', 'segreteria'])
  if ('response' in auth) return auth.response

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'

  try {
    const { id } = await params

    const [paziente] = await db
      .select({
        id: pazienti.id,
        nome: pazienti.nome,
        cognome: pazienti.cognome,
        codiceFiscale: pazienti.codiceFiscale,
        studioId: pazienti.studioId,
      })
      .from(pazienti)
      .where(eq(pazienti.id, id))
      .limit(1)

    if (!paziente) {
      return NextResponse.json({ error: 'Paziente non trovato' }, { status: 404 })
    }

    // Genera nuova password temporanea di 6 caratteri
    const nuovaPasswordTemporanea = generateTemporaryPassword(6)
    const passwordHash = hashPassword(nuovaPasswordTemporanea)

    await db
      .update(pazienti)
      .set({
        passwordHash,
        passwordIniziale: nuovaPasswordTemporanea,
        primoAccesso: true,
        updatedAt: new Date(),
      })
      .where(eq(pazienti.id, id))

    // Audit log
    await recordAuditLog({
      attoreId: auth.session.id,
      attoreEmail: auth.session.email,
      ruolo: auth.session.ruolo,
      azione: 'RESET_PASSWORD_TEMPORANEA_PAZIENTE',
      entita: 'pazienti',
      entitaId: paziente.id,
      dettagli: {
        codiceFiscale: paziente.codiceFiscale,
        studioId: paziente.studioId,
      },
      ip,
    })

    return NextResponse.json({
      success: true,
      passwordTemporanea: nuovaPasswordTemporanea,
      message: `Nuova password temporanea generata per ${paziente.cognome} ${paziente.nome}: ${nuovaPasswordTemporanea}`,
    })
  } catch (err: any) {
    console.error('Errore reset password temporanea:', err)
    return NextResponse.json(
      { error: err?.message || 'Errore generazione nuova password temporanea' },
      { status: 500 }
    )
  }
}
