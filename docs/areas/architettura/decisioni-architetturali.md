---
tags: [#area/architettura, #stato/bozza, #priorità/alta]
created: 2026-09-09
updated: 2026-09-09
---

# Decisioni Architetturali — ADR Log

> Architecture Decision Records (ADR): ogni decisione significativa viene documentata qui con il suo contesto, le alternative valutate e la motivazione della scelta.
> Collegato a: [[areas/architettura/overview]] | [[areas/infrastruttura/stack-tecnico]]

---

## ADR-001 — Architettura Multi-Tenant dall'Inizio

**Data**: 2026-09-09
**Stato**: ✅ Approvato

### Contesto
Lo studio è attualmente monoprofessionale ma potrebbe crescere a più medici di medicina generale.

### Decisione
Implementare multi-tenancy a livello di `studio_id` su tutte le entità sin dal primo commit. Ogni query include sempre il filtro per studio.

### Alternative Valutate
- **Single-tenant** (un'unica istanza per studio): più semplice inizialmente, ma richiederebbe refactoring completo per la crescita.
- **Multi-schema** (un schema DB per studio): eccessivo per ora, possibile in futuro per compliance.

### Conseguenze
- Ogni tabella ha una FK verso `studi`
- Middleware di autenticazione inietta `studio_id` in ogni request autenticata
- Modello dati leggermente più complesso ma nessun lock-in

---

## ADR-002 — Lock Temporaneo Slot con TTL su DB

**Data**: 2026-09-09
**Stato**: ✅ Approvato

### Contesto
Dobbiamo prevenire la doppia prenotazione sullo stesso slot. Il flusso prevede che il paziente "blocchi" lo slot per 10 minuti mentre compila il form.

### Decisione
Il lock viene gestito server-side: record nel DB con campo `locked_until` (timestamp). Un job schedulato (cron ogni 60s) libera i lock scaduti. Il client riceve un token di lock e deve includerlo nella conferma della prenotazione.

### Alternative Valutate
- **Lock solo client-side**: inaffidabile (network drop, multi-tab, exploit).
- **Redis TTL**: valido, ma aggiunge infrastruttura. Rimandato a quando lo scale lo richiede.
- **Optimistic Locking**: non adatto perché vogliamo feedback immediato all'utente "slot occupato".

### Conseguenze
- Tabella `slot_locks` o campo `locked_until` + `locked_by` su `slots`
- Job schedulato obbligatorio
- Client deve gestire il countdown di 10 minuti e avvisare l'utente

---

## ADR-003 — Separazione Netta dei Ruoli (RBAC)

**Data**: 2026-09-09
**Stato**: ✅ Approvato

### Contesto
Esistono tre ruoli distinti con permessi molto diversi: paziente, staff (segretario), medico. In futuro possibile ruolo admin di studio.

### Decisione
Implementare Role-Based Access Control (RBAC) con ruoli definiti e permessi granulari per endpoint. I permessi del segretario sono configurabili dal medico (es. può/non può accedere a certi dati del paziente).

### Matrice Permessi Iniziale

| Risorsa | Paziente | Segretario | Medico |
|---------|---------|-----------|--------|
| Proprie prenotazioni | CRUD | R (tutte) | R (tutte) |
| Prenotazioni altrui | — | CRU | CRU |
| Cancellazione prenotazioni | D (proprie) | D | D |
| Richieste speciali | CR (proprie) | RU (tutte) | CRUD |
| Dati anagrafici paziente | R (propri) | R (base) | R (completi) |
| Dati clinici paziente | — | — | R |
| Configurazione agenda | — | R | CRUD |
| Broadcast | — | CRU | CRUD |
| Export PDF | — | C | C |

### Conseguenze
- JWT con claim `role` e `studio_id`
- Middleware di autorizzazione su ogni endpoint
- I permessi del segretario sono configurabili → tabella `staff_permissions`

---

## ADR-004 — Coda Richieste Speciali FIFO

**Data**: 2026-09-09
**Stato**: ✅ Approvato

### Contesto
Il medico/segretario deve gestire richieste di malattia, certificati e medicinali in ordine di arrivo, senza priorità manuale (per equità).

### Decisione
Le richieste speciali vengono ordinate per `created_at` ASC (FIFO). L'interfaccia mostra la coda in questo ordine. Non esiste prioritizzazione manuale nella v1.

### Alternative Valutate
- **Priorità per tipo**: urgente / normale — aggiunge complessità e rischio di abuso
- **Appuntamento urgente**: se la richiesta è urgente il paziente deve prenotare una visita

### Conseguenze
- Nessuna complessità aggiuntiva nel modello dati
- UX semplice: coda lineare per il medico

---

## ADR-005 — Notifiche SMS via Gateway Esterno

**Data**: 2026-09-09
**Stato**: 🔄 In valutazione (provider da scegliere)

### Contesto
Il sistema deve inviare SMS per promemoria appuntamenti e notifiche completamento richieste. Gli SMS sono opzionali (il paziente sceglie).

### Decisione
Utilizzare un gateway SMS esterno (Twilio, Vonage, o provider italiano tipo sms.it). L'integrazione è astratta dietro un'interfaccia `NotificationService` per facilitare il cambio di provider.

### Provider in valutazione
| Provider | Pro | Contro |
|---------|-----|--------|
| Twilio | Affidabile, API ottima | Costo, server USA |
| Vonage | Buona copertura EU | Meno documentazione |
| sms.it | Provider italiano, GDPR nativo | Meno feature |

### Conseguenze
- Astrazione `NotificationProvider` interface nel backend
- Credenziali provider in environment variables (mai hardcoded)
- Log di tutti gli SMS inviati per debugging

---

## ADR-006 — Accesso di Emergenza per il Medico

**Data**: 2026-09-09
**Stato**: ✅ Approvato

### Contesto
Se il medico perde l'accesso all'app (dispositivo perso, password dimenticata, account bloccato) durante l'orario di studio, ci sono pazienti in sala d'attesa.

### Decisione
Tre livelli di recovery:
1. **Self-recovery**: reset password via email + OTP su numero di telefono secondario
2. **Recovery tramite segretario**: il segretario ha accesso all'agenda in visualizzazione anche se il medico è fuori
3. **Emergency code**: un codice di recovery one-time stampato e conservato in cassaforte in studio, usabile una sola volta per sbloccare l'account

### Conseguenze
- Il segretario può sempre vedere l'agenda del giorno (permesso non revocabile)
- Meccanismo di emergency code implementato nel sistema di auth
- Il medico viene avvisato quando il codice di emergenza viene usato

---

## Decisioni Aperte (Da Risolvere)

| ID | Decisione | Priorità | Note |
|----|-----------|---------|------|
| ADR-007 | Stack tecnologico definitivo (mobile + backend) | Alta | Da scegliere |
| ADR-008 | Provider cloud / hosting per test locale | Media | Buddy account locale per ora |
| ADR-009 | Limite cancellazione prenotazione (ore prima) | Media | Da definire con il medico |
| ADR-010 | Waiting list per slot cancellati | Bassa | V2 |
| ADR-011 | Separazione GDPR / DPO | Bassa | Fase successiva |

---

*Vedere anche:*
- [[areas/architettura/overview]]
- [[areas/sicurezza/privacy-gdpr]]
- [[areas/sicurezza/accesso-emergenza]]
- [[areas/ruoli/ruoli-permessi]]
