/**
 * @file        notifiche.ts
 * @module      @medico/types/models
 * @description Tipi per il sistema di notifiche push e in-app
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/notifiche/sistema-notifiche]]
 */

import type { CanalNotifica, StatoNotifica } from '../enums'

export interface LogNotifica {
  id: string
  studioId: string
  pazienteId?: string
  evento: string
  canale: CanalNotifica
  stato: StatoNotifica
  tentativi: number
  inviatoAt?: Date
  createdAt: Date
}

export interface PushNotificationPayload {
  to: string            // Expo push token
  title: string
  body: string
  data?: Record<string, unknown>
  sound?: 'default' | null
  badge?: number
}
