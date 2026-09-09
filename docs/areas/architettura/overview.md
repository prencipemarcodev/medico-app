---
tags: [#area/architettura, #stato/bozza, #priorità/alta]
created: 2026-09-09
updated: 2026-09-09
---

# Panoramica Architetturale — Studio Medico App

> Documento master dell'architettura del sistema.
> Collegato a: [[areas/architettura/decisioni-architetturali]] | [[areas/infrastruttura/stack-tecnico]]

---

## Visione d'Insieme

Il sistema è composto da **tre superfici applicative** distinte che condividono lo stesso backend:

```
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND API                          │
│                  (REST + WebSocket/SSE)                     │
│                  Auth · Business Logic · DB                 │
└──────────┬─────────────────────┬───────────────────────────┘
           │                     │
   ┌───────▼────────┐   ┌────────▼────────────┐
   │   MOBILE APP   │   │   WEB DASHBOARD     │
   │  (Paziente)    │   │  (Medico/Segretario)│
   │  iOS + Android │   │  Desktop Web        │
   └────────────────┘   └─────────────────────┘
```

---

## Superfici Applicative

### 1. App Mobile — Paziente
- **Piattaforma**: iOS e Android (mobile-first)
- **Utenti**: pazienti registrati
- **Funzionalità core**:
  - Registrazione e scelta del medico curante
  - Dashboard personale (prossimi appuntamenti, richieste in corso)
  - Prenotazione appuntamenti con lock temporaneo dello slot
  - Invio richieste speciali (malattia, certificati, medicinali)
  - Gestione preferenze notifiche
  - Storico prenotazioni e richieste

### 2. Web Dashboard — Staff (Medico + Segretario)
- **Piattaforma**: Web desktop (browser)
- **Utenti**: medico, segretari/assistenti
- **Funzionalità core**:
  - Vista agenda giornaliera/settimanale con slot
  - Coda richieste speciali (FIFO per arrivo)
  - Gestione prenotazioni (rifiuta, sposta, approva)
  - Invio broadcast ai pazienti
  - Configurazione orari/ferie/durate slot
  - Esportazione/archiviazione PDF
  - Pannello di amministrazione dello studio

### 3. Backend API
- **Tipo**: REST API + canale real-time (WebSocket o SSE) per aggiornamenti live agenda
- **Responsabilità**:
  - Autenticazione e autorizzazione per ruolo
  - Gestione transazionale degli slot (lock temporaneo, prevenzione doppia prenotazione)
  - Orchestrazione notifiche (SMS gateway + push)
  - Logica di business (regole prenotazione, coda richieste, broadcast)
  - Accesso al database

---

## Modello Dati — Entità Principali

```
Studio
  └── Medico (1 o più per studio)
        ├── Agenda (slot configurati per giorno)
        ├── Pazienti (N pazienti per medico)
        │     ├── Prenotazioni
        │     └── Richieste Speciali
        └── Segretari (ruolo Staff)
```

### Entità Chiave

| Entità | Descrizione |
|--------|-------------|
| `Studio` | Tenant root. Ogni istanza dello studio ha il suo namespace |
| `Medico` | Professionista con la propria agenda e lista pazienti |
| `Paziente` | Utente mobile. Appartiene a un solo medico curante |
| `Staff` | Segretario/Assistente. Appartiene a uno studio con permessi configurabili |
| `Slot` | Unità di tempo dell'agenda. Può essere: libero, bloccato (lock 10min), prenotato, chiuso |
| `Prenotazione` | Associazione Paziente-Slot con motivo e tipologia |
| `RichiestaSpeciale` | Malattia / Certificato / Medicinale — con stato e storico |
| `Broadcast` | Messaggio di massa a tutti i pazienti di un giorno specifico |
| `Notifica` | Log di tutte le comunicazioni inviate (SMS, push) |

---

## Flusso Critico — Lock dello Slot (Anti Doppia Prenotazione)

```
Paziente A seleziona slot 10:00
      │
      ▼
[LOCK slot 10:00 per 10 minuti — transazione atomica DB]
      │
      ├── Paziente B tenta di selezionare slot 10:00
      │     → Riceve: "Slot temporaneamente non disponibile"
      │
      ├── Paziente A completa il form e conferma
      │     → Slot diventa PRENOTATO (lock rimosso, stato aggiornato)
      │
      └── Paziente A abbandona / scade timeout 10min
            → Slot torna LIBERO automaticamente (job schedulato)
```

> [!CAUTION]
> Il lock DEVE essere gestito server-side con un record nel DB con timestamp di scadenza. NON fidarsi del client per la gestione del timeout. Un job schedulato ogni minuto pulisce i lock scaduti.

---

## Multi-Tenant Design

Anche se il primo deploy è per un singolo studio, l'architettura è **multi-tenant** dall'inizio:

- Ogni `Studio` è un tenant con il proprio ID
- Tutte le query includono sempre `studio_id` come filtro
- I dati di pazienti di studi diversi non si mescolano mai a livello applicativo
- In futuro: possibile isolamento a livello di schema DB per studi grandi

---

## Scalabilità Futura

| Feature | Impatto Architetturale |
|---------|----------------------|
| Più medici nello stesso studio | Già supportato dal modello dati |
| Lista d'attesa per slot | Aggiungere entità `WaitingList` con notifica automatica |
| Telemedicina / Videoconsulto | Integrazione link esterno nella prenotazione |
| Integrazione con cartella clinica elettronica | API esterna, scope futuro |

---

*Vedere anche:*
- [[areas/architettura/decisioni-architetturali]]
- [[areas/infrastruttura/stack-tecnico]]
- [[areas/archiviazione/database-schema]]
- [[areas/dominio/requisiti-funzionali]]
