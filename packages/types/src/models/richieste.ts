/**
 * @file        richieste.ts
 * @module      @medico/types/models
 * @description Tipi per Richieste Speciali (malattia, certificati, medicinali) — GDPR-SENSITIVE
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/dominio/requisiti-funzionali#Modulo-Richieste-Speciali]]
 */

// GDPR-SENSITIVE: i payload contengono dati sanitari del paziente

import type { TipoRichiesta, SottotipoRichiesta, StatoRichiesta, ModalitaRitiro } from '../enums'

export interface RichiestaSpeciale {
  id: string
  studioId: string
  pazienteId: string
  medicoId: string
  tipo: TipoRichiesta
  sottotipo?: SottotipoRichiesta
  payload: RichiestaPayload   // GDPR-SENSITIVE
  stato: StatoRichiesta
  modalitaRitiro?: ModalitaRitiro
  noteRifiuto?: string
  gestitaDa?: string
  gestitaAt?: Date
  completataAt?: Date
  createdAt: Date
  updatedAt: Date
}

/** Union type per i payload dei diversi form */
export type RichiestaPayload =
  | PayloadMalattia
  | PayloadCertificato
  | PayloadMedicinale

export interface PayloadMalattia {
  tipo: 'malattia'
  sintomi: string[]          // GDPR-SENSITIVE
  sintomiNote?: string       // GDPR-SENSITIVE
  dataInizioSintomi: string  // ISO date
  dataPrevistaFine: string   // ISO date
  notePerMedico?: string     // GDPR-SENSITIVE
}

export interface PayloadCertificato {
  tipo: 'certificato'
  sottotipo: SottotipoRichiesta
  sottotipoAltro?: string
  notePerMedico?: string     // GDPR-SENSITIVE
}

export interface PayloadMedicinale {
  tipo: 'medicinale'
  nomeMedicinale: string     // GDPR-SENSITIVE
  dosaggio?: string
  terapiaCronica: boolean
  notePerMedico?: string     // GDPR-SENSITIVE
}

export interface Broadcast {
  id: string
  studioId: string
  inviatoDa: string
  giornoTarget: string       // ISO date
  testo: string              // max 160 chars
  canali: string[]
  nDestinatari?: number
  nInviati?: number
  nFalliti?: number
  stato: string
  createdAt: Date
}

export interface CreaBroadcastInput {
  giornoTarget: string
  testo: string
  canali: ('push' | 'in_app')[]
}
