/**
 * @file        supabase.ts
 * @module      @medico/web/lib
 * @description Inizializzazione del client Supabase per WebSockets e Realtime
 * @author      Agent-1 | Session: 2026-09-13
 * @version     1.0.0
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://jylrhbqxfzdhmhohlngv.supabase.co'

const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  ''

let clientInstance: SupabaseClient | null = null

/**
 * Restituisce il client Supabase se la chiave pubblica è configurata,
 * altrimenti restituisce null consentendo al frontend di attivare il fallback (polling).
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (clientInstance) return clientInstance

  if (!SUPABASE_KEY) {
    if (typeof window !== 'undefined') {
      console.warn(
        '[Supabase Realtime] NEXT_PUBLIC_SUPABASE_ANON_KEY non ancora configurata. In attesa della chiave, la disponibilità viene gestita con auto-refresh attivo.'
      )
    }
    return null
  }

  clientInstance = createClient(SUPABASE_URL, SUPABASE_KEY, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })

  return clientInstance
}
