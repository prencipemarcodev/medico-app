import { NextResponse } from 'next/server'
import { db, desc, sql, or, ilike } from '@medico/db'
import { auditLogs } from '@medico/db/schema'
import { checkAuth } from '@/lib/server-auth'

export async function GET(request: Request) {
  const auth = await checkAuth(['admin'])
  if ('response' in auth) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''
    const limit = Math.min(Number(searchParams.get('limit')) || 100, 200)

    let query = db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)

    if (q) {
      const pattern = `%${q}%`
      const logs = await query.where(
        or(
          ilike(auditLogs.attoreEmail, pattern),
          ilike(auditLogs.azione, pattern),
          ilike(auditLogs.entita, pattern)
        )
      )
      return NextResponse.json({ success: true, logs })
    }

    const logs = await query
    return NextResponse.json({ success: true, logs })
  } catch (err: any) {
    console.error('Errore get audit logs:', err)
    return NextResponse.json(
      { error: err?.message || 'Errore recupero registri audit' },
      { status: 500 }
    )
  }
}
