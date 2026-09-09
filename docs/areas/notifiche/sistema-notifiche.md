---
tags: [#area/notifiche, #stato/bozza, #priorità/media]
created: 2026-09-09
updated: 2026-09-09
---

# Sistema Notifiche — Studio Medico App

> Documento di specifica per il sistema di notifiche multi-canale.
> Collegato a: [[areas/architettura/decisioni-architetturali#ADR-005]] | [[areas/dominio/requisiti-funzionali#Modulo-Notifiche]]

---

## Canali di Notifica

| Canale | Destinatari | Obbligatorio | Configurabile |
|--------|------------|-------------|--------------|
| Push Notification | Pazienti (mobile) | No | Sì |
| SMS | Pazienti | No | Sì |
| Email | Staff (medico, segretario) | Sì (per recovery) | No |
| In-App | Pazienti + Staff | Sì | No |

Il paziente sceglie **almeno un canale** tra push e SMS durante la configurazione iniziale.

---

## Trigger e Template

### Per il Paziente

| Evento | Canali | Template |
|--------|--------|---------|
| Prenotazione confermata | Push + SMS | "La tua visita del {data} alle {ora} è confermata." |
| Prenotazione spostata | Push + SMS | "La tua visita è stata spostata al {nuova_data} alle {nuova_ora}. Motivo: {motivo}" |
| Prenotazione rifiutata | Push + SMS | "La tua visita del {data} è stata annullata. {motivo}" |
| Promemoria appuntamento | Push + SMS | "Promemoria: hai una visita domani/oggi alle {ora}" |
| Richiesta speciale completata | Push + SMS | "La tua richiesta di {tipo} è pronta. {istruzioni_ritiro}" |
| Richiesta speciale rifiutata | Push + SMS | "La tua richiesta di {tipo} non può essere evasa. Motivo: {motivo}" |
| Broadcast studio chiusura | Push + SMS | "Comunicazione studio: {testo_broadcast}" |

### Per lo Staff

| Evento | Canale | Note |
|--------|--------|------|
| Nuova prenotazione ricevuta | In-App (badge) | Solo contatore, no SMS |
| Nuova richiesta speciale | In-App (badge) | Solo contatore |
| Richiesta speciale non evasa da 24h | In-App (banner) | Reminder di sistema |
| Emergency code usato | Email immediata | Alta priorità |

---

## Configurazione Promemoria (Paziente)

Il paziente può scegliere **quando** ricevere il promemoria, con selezione multipla:

- [ ] 24 ore prima
- [ ] 2 ore prima  
- [ ] 30 minuti prima

Ogni intervallo selezionato genera una notifica separata. La configurazione è modificabile in qualsiasi momento dalle impostazioni dell'app.

---

## Broadcast di Chiusura / Emergenza

Il segretario o il medico può inviare un messaggio a tutti i pazienti prenotati in un dato giorno:

```
Input:
  - Giorno target (default: oggi)
  - Testo del messaggio (max 160 caratteri per compatibilità SMS)
  - Canale: SMS / Push / Entrambi

Output:
  - Invio a tutti i pazienti con prenotazione attiva in quel giorno
  - Log del broadcast (chi ha inviato, quanti destinatari, timestamp)
  - Riepilogo: X messaggi inviati, Y falliti
```

> [!IMPORTANT]
> I broadcast sono operazioni irreversibili. Il sistema richiede una conferma esplicita ("Sei sicuro? Verranno notificati X pazienti") prima dell'invio.

---

## Architettura del Sistema di Notifiche

```
Business Event (es. prenotazione confermata)
        │
        ▼
[Notification Service — crea record in coda notifiche]
        │
        ├──▶ Push Provider (FCM per Android, APNs per iOS)
        │
        ├──▶ SMS Gateway (provider esterno, vedi ADR-005)
        │
        └──▶ DB: log_notifiche (timestamp, stato, canale, destinatario)
```

### Gestione dei Fallimenti

- SMS fallito → retry automatico dopo 5 min, poi 30 min (max 3 tentativi)
- Push fallita → retry 1 volta dopo 2 min
- Se tutti i tentativi falliscono → log con stato `FAILED` e notifica in-app di fallback
- Monitoraggio: alert allo staff se il tasso di fallimento SMS supera il 10%

---

## Privacy e Consenso nelle Notifiche

- SMS inviati solo ai pazienti che hanno dato consenso esplicito
- Il numero di telefono non viene condiviso con provider SMS in forma leggibile (masked in log)
- Ogni SMS contiene la possibilità di disiscriversi rispondendo `STOP`
- Risposta `STOP` → aggiornamento automatico preferenze paziente nel DB

---

## Log delle Notifiche

```sql
CREATE TABLE log_notifiche (
  id              UUID PRIMARY KEY,
  studio_id       UUID NOT NULL,
  paziente_id     UUID,
  evento          TEXT NOT NULL,        -- es. 'prenotazione_confermata'
  canale          TEXT NOT NULL,        -- 'sms' | 'push' | 'email'
  stato           TEXT NOT NULL,        -- 'inviato' | 'fallito' | 'in_coda'
  tentativi       INT DEFAULT 1,
  inviato_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

*Vedere anche:*
- [[areas/architettura/decisioni-architetturali#ADR-005]]
- [[areas/dominio/requisiti-funzionali#Modulo-Notifiche]]
- [[areas/infrastruttura/stack-tecnico]]
