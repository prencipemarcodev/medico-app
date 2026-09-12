/**
 * @file        security.ts
 * @module      @medico/db
 * @description Gestione sessioni crittografate con firma HMAC-SHA256 anti-manomissione (Anti-Tampering)
 * @author      Agent-1 | Session: 2026-09-12
 */

import crypto from 'node:crypto'

const SESSION_SECRET =
  process.env['SESSION_SECRET'] ||
  process.env['BETTER_AUTH_SECRET'] ||
  'medico-app-super-secure-production-hmac-key-256-bits-entropy'

export interface SessionPayload {
  id: string
  nome: string
  cognome: string
  email?: string | null
  codiceFiscale?: string | null
  studioId?: string | null
  medicoId?: string | null
  primoAccesso?: boolean
  ruolo: 'admin' | 'medico' | 'segreteria' | 'paziente'
  exp: number
  iat: number
}

/**
 * Crea un token di sessione firmato con HMAC-SHA256.
 * Impossibile da alterare o falsificare tramite string manipulation.
 */
export function createSessionToken(
  data: Omit<SessionPayload, 'exp' | 'iat'>,
  maxAgeSeconds = 60 * 60 * 24 * 7 // 7 giorni
): string {
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + maxAgeSeconds

  const payload: SessionPayload = {
    ...data,
    iat,
    exp,
  }

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadBase64)
    .digest('base64url')

  return `${payloadBase64}.${signature}`
}

/**
 * Verifica crittograficamente la firma del token e la data di scadenza.
 * Se il token è stato manipolato o la firma non coincide, restituisce null.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || typeof token !== 'string') return null

  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [payloadBase64, signature] = parts
  if (!payloadBase64 || !signature) return null

  try {
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadBase64)
      .digest('base64url')

    // Timing-safe comparison per prevenire attacchi di tipo timing
    const sigBuf = Buffer.from(signature)
    const expectedBuf = Buffer.from(expectedSignature)

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null
    }

    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf-8')
    const payload: SessionPayload = JSON.parse(payloadJson)

    // Verifica scadenza
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      return null
    }

    return payload
  } catch (err) {
    return null
  }
}
