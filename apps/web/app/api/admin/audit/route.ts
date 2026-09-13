import { NextResponse } from 'next/server'
import { db, desc, sql, or, ilike, and } from '@medico/db'
import { auditLogs } from '@medico/db/schema'
import { checkAuth } from '@/lib/server-auth'

export async function GET(request: Request) {
  const auth = await checkAuth(['admin'])
  if ('response' in auth) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''
    const ruolo = searchParams.get('ruolo')?.trim() || ''
    const limit = Math.min(Number(searchParams.get('limit')) || 250, 500)

    const conditions: any[] = []

    if (q) {
      const pattern = `%${q}%`
      conditions.push(
        or(
          ilike(auditLogs.attoreEmail, pattern),
          ilike(auditLogs.azione, pattern),
          ilike(auditLogs.entita, pattern),
          ilike(auditLogs.ip, pattern),
          sql`${auditLogs.dettagli}::text ILIKE ${pattern}`
        )
      )
    }

    if (ruolo && ruolo !== 'tutti') {
      conditions.push(sql`lower(${auditLogs.ruolo}) = lower(${ruolo})`)
    }

    let baseQuery = db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)

    const logs = conditions.length > 0
      ? await baseQuery.where(and(...conditions))
      : await baseQuery

    return NextResponse.json({ success: true, logs })
  } catch (err: any) {
    console.error('Errore get audit logs:', err)
    return NextResponse.json(
      { error: err?.message || 'Errore recupero registri audit' },
      { status: 500 }
    )
  }
}
