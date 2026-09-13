import { NextResponse } from 'next/server'
import { db, eq, and, desc, sql, recordAuditLog } from '@medico/db'
import { documentiClinici, pazienti, studi } from '@medico/db/schema'
import { checkAuth } from '@/lib/server-auth'

export async function GET(request: Request) {
  const auth = await checkAuth(['paziente', 'medico', 'segreteria', 'admin'])
  if ('response' in auth) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    let targetPazienteId = searchParams.get('pazienteId')

    if (auth.session.ruolo === 'paziente') {
      targetPazienteId = auth.session.id
    } else {
      if (!targetPazienteId) {
        return NextResponse.json({ error: 'pazienteId obbligatorio' }, { status: 400 })
      }

      // Verifica isolamento multi-tenant GDPR: il paziente deve appartenere allo studio dell'operatore
      const [paziente] = await db
        .select({ id: pazienti.id, studioId: pazienti.studioId })
        .from(pazienti)
        .where(eq(pazienti.id, targetPazienteId))
        .limit(1)

      if (!paziente) {
        return NextResponse.json({ error: 'Paziente non trovato' }, { status: 404 })
      }

      if (auth.session.ruolo !== 'admin' && auth.session.studioId && paziente.studioId !== auth.session.studioId) {
        return NextResponse.json(
          { error: 'Accesso negato: la cartella clinica è riservata allo studio associato' },
          { status: 403 }
        )
      }
    }

    const docs = await db
      .select()
      .from(documentiClinici)
      .where(eq(documentiClinici.pazienteId, targetPazienteId))
      .orderBy(desc(documentiClinici.createdAt))

    return NextResponse.json({
      success: true,
      documenti: docs,
    })
  } catch (error: any) {
    console.error('Errore recupero documenti clinici:', error)
    return NextResponse.json(
      { error: error?.message || 'Errore durante il recupero dei documenti' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const auth = await checkAuth(['paziente', 'medico', 'segreteria', 'admin'])
  if ('response' in auth) return auth.response

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'

  try {
    const body = await request.json()
    const {
      pazienteId: customPazienteId,
      titolo,
      categoria = 'appunto',
      note,
      fileUrl,
      fileName,
      fileType,
      fileSize,
    } = body

    if (!titolo?.trim()) {
      return NextResponse.json({ error: 'Il titolo del documento o appunto è obbligatorio' }, { status: 400 })
    }

    let targetPazienteId = customPazienteId
    let targetStudioId = auth.session.studioId || null

    if (auth.session.ruolo === 'paziente') {
      targetPazienteId = auth.session.id

      // Recupera studioId del paziente se assente nella sessione
      if (!targetStudioId) {
        const [p] = await db.select({ studioId: pazienti.studioId }).from(pazienti).where(eq(pazienti.id, auth.session.id)).limit(1)
        targetStudioId = p?.studioId || null
      }
    } else {
      if (!targetPazienteId) {
        return NextResponse.json({ error: 'pazienteId obbligatorio' }, { status: 400 })
      }

      // Verifica che il paziente appartenga allo studio dell'operatore
      const [p] = await db.select({ id: pazienti.id, studioId: pazienti.studioId }).from(pazienti).where(eq(pazienti.id, targetPazienteId)).limit(1)
      if (!p) {
        return NextResponse.json({ error: 'Paziente non trovato' }, { status: 404 })
      }

      if (auth.session.ruolo !== 'admin' && auth.session.studioId && p.studioId !== auth.session.studioId) {
        return NextResponse.json({ error: 'Accesso negato: paziente non associato al tuo studio' }, { status: 403 })
      }
      targetStudioId = p.studioId || targetStudioId
    }

    const [nuovoDoc] = await db
      .insert(documentiClinici)
      .values({
        pazienteId: targetPazienteId,
        studioId: targetStudioId,
        titolo: titolo.trim(),
        categoria,
        note: note?.trim() || null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileType: fileType || null,
        fileSize: fileSize || null,
        autoreRuolo: auth.session.ruolo,
        autoreId: auth.session.id,
      })
      .returning()

    if (!nuovoDoc) {
      return NextResponse.json({ error: 'Errore salvataggio documento' }, { status: 500 })
    }

    await recordAuditLog({
      attoreId: auth.session.id,
      attoreEmail: auth.session.email,
      ruolo: auth.session.ruolo,
      azione: 'DOCUMENTO_CLINICO_AGGIUNTO',
      entita: 'documenti_clinici',
      entitaId: nuovoDoc.id,
      dettagli: {
        pazienteId: targetPazienteId,
        studioId: targetStudioId,
        titolo: nuovoDoc.titolo,
        categoria: nuovoDoc.categoria,
      },
      ip,
    })

    return NextResponse.json({
      success: true,
      documento: nuovoDoc,
    })
  } catch (error: any) {
    console.error('Errore inserimento documento clinico:', error)
    return NextResponse.json(
      { error: error?.message || 'Errore durante il salvataggio del documento' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const auth = await checkAuth(['paziente', 'medico', 'segreteria', 'admin'])
  if ('response' in auth) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID documento obbligatorio' }, { status: 400 })
    }

    const [doc] = await db.select().from(documentiClinici).where(eq(documentiClinici.id, id)).limit(1)
    if (!doc) {
      return NextResponse.json({ error: 'Documento non trovato' }, { status: 404 })
    }

    // Autorizzazione: il paziente può eliminare solo i propri; lo staff solo quelli dello studio
    if (auth.session.ruolo === 'paziente' && doc.pazienteId !== auth.session.id) {
      return NextResponse.json({ error: 'Non autorizzato ad eliminare questo documento' }, { status: 403 })
    }

    if (
      auth.session.ruolo !== 'admin' &&
      auth.session.ruolo !== 'paziente' &&
      auth.session.studioId &&
      doc.studioId !== auth.session.studioId
    ) {
      return NextResponse.json({ error: 'Non autorizzato ad eliminare documenti di altri studi' }, { status: 403 })
    }

    await db.delete(documentiClinici).where(eq(documentiClinici.id, id))

    return NextResponse.json({ success: true, id })
  } catch (error: any) {
    console.error('Errore eliminazione documento clinico:', error)
    return NextResponse.json(
      { error: error?.message || 'Errore durante l\'eliminazione del documento' },
      { status: 500 }
    )
  }
}
