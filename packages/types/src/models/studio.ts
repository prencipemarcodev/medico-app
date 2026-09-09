/**
 * @file        studio.ts
 * @module      @medico/types/models
 * @description Tipi per Studio e Medico
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/archiviazione/database-schema#studi]]
 */

export interface Studio {
  id: string
  nome: string
  indirizzo?: string
  telefono?: string
  email?: string
  attivo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Medico {
  id: string
  studioId: string
  nome: string
  cognome: string
  email: string
  telefonoPrimario: string
  telefonoSecondario?: string
  attivo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Staff {
  id: string
  studioId: string
  medicoId: string
  nome: string
  cognome: string
  email: string
  attivo: boolean
  createdAt: Date
}

export interface StaffPermission {
  id: string
  staffId: string
  permesso: string
  grantedBy?: string
  grantedAt: Date
}
