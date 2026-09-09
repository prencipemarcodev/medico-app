/**
 * @file        enums.ts
 * @module      @medico/types
 * @description Enumerazioni condivise tra tutte le app del monorepo
 * @author      Agent-1 | Session: 2026-09-09
 * @version     0.1.0
 * @see         [[docs/areas/dominio/requisiti-funzionali]]
 */

// GDPR-SENSITIVE: alcuni enum toccano dati sanitari

export enum Ruolo {
  PAZIENTE = 'patient',
  STAFF = 'staff',
  MEDICO = 'doctor',
  ADMIN = 'admin',
}

export enum StatoSlot {
  LIBERO = 'libero',
  BLOCCATO = 'bloccato',
  PRENOTATO = 'prenotato',
  CHIUSO = 'chiuso',
}

export enum TipologiaVisita {
  BREVE = 'breve',       // 10 min
  STANDARD = 'standard', // 20 min
  LUNGA = 'lunga',       // 30 min
}

export enum DurataVisita {
  BREVE = 10,
  STANDARD = 20,
  LUNGA = 30,
}

export enum MotivoVisita {
  VISITA_CONTROLLO = 'visita_controllo',
  NUOVO_PROBLEMA = 'nuovo_problema',
  FOLLOW_UP_ESAMI = 'follow_up_esami',
  RINNOVO_PRESCRIZIONE = 'rinnovo_prescrizione',
  CERTIFICATO_SPORTIVO = 'certificato_sportivo',
  ALTRO = 'altro',
}

export enum StatoPrenotazione {
  CONFERMATA = 'confermata',
  SPOSTATA = 'spostata',
  RIFIUTATA = 'rifiutata',
  COMPLETATA = 'completata',
  NO_SHOW = 'no_show',
}

export enum TipoRichiesta {
  MALATTIA = 'malattia',
  CERTIFICATO = 'certificato',
  MEDICINALE = 'medicinale',
}

export enum SottotipoRichiesta {
  // Certificati
  CERTIFICATO_BUONA_SALUTE = 'certificato_buona_salute',
  CERTIFICATO_SPORTIVO = 'certificato_sportivo',
  CERTIFICATO_SCOLASTICO = 'certificato_scolastico',
  CERTIFICATO_LAVORATIVO = 'certificato_lavorativo',
  CERTIFICATO_ALTRO = 'certificato_altro',
  // Ricette
  RICETTA_DEMATERIALIZZATA = 'ricetta_dematerializzata',
  RICETTA_BIANCA = 'ricetta_bianca',
  RICETTA_ROSSA = 'ricetta_rossa',
}

export enum StatoRichiesta {
  IN_ATTESA = 'in_attesa',
  IN_LAVORAZIONE = 'in_lavorazione',
  COMPLETATA = 'completata',
  RIFIUTATA = 'rifiutata',
}

export enum ModalitaRitiro {
  DIGITALE = 'digitale',
  STUDIO = 'studio',
}

export enum CanalNotifica {
  PUSH = 'push',
  IN_APP = 'in_app',
}

export enum StatoNotifica {
  IN_CODA = 'in_coda',
  INVIATA = 'inviata',
  FALLITA = 'fallita',
}

export enum TipoConsenso {
  PRIVACY_POLICY = 'privacy_policy',
  PUSH = 'push',
  COMUNICAZIONI = 'comunicazioni',
}

export enum AzioneConsenso {
  GRANT = 'grant',
  REVOKE = 'revoke',
}

export enum IntervallioReminder {
  H24 = '24h',
  H2 = '2h',
  M30 = '30m',
}
