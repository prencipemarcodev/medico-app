---
tags: [#sessione/storico, #stato/attivo]
created: 2026-09-09
updated: 2026-09-09
---

# 📅 Session Manager — Storico Sessioni

> Log completo di tutte le sessioni di lavoro sul progetto.
> Ogni sessione viene aggiunta qui dall'Agente 3 al termine della sessione stessa.
> Per lo stato corrente vedi: [[sessions/session-current]]

---

## Come Leggere questo File

Ogni sessione documenta:
- **Obiettivo**: cosa si voleva raggiungere
- **Fatto**: cosa è stato effettivamente completato
- **Agenti coinvolti**: quali agenti hanno lavorato e su cosa
- **Artefatti prodotti**: file creati/modificati
- **Decisioni prese**: scelte architetturali o di prodotto
- **Aperture**: cosa rimane da fare

---

## Sessione 001 — 2026-09-09

### Obiettivo
Studio del caso, intervista con il cliente, creazione documentazione fondante del progetto.

### Tipo Sessione
`DOCUMENTAZIONE` — nessun codice scritto

### Agenti Coinvolti
- Agente 3 (Index Agent): ha prodotto tutta la documentazione iniziale

### Artefatti Prodotti

| File | Area | Tipo |
|------|------|------|
| `docs/areas/dominio/requisiti-funzionali.md` | Dominio | CREATO |
| `docs/areas/architettura/overview.md` | Architettura | CREATO |
| `docs/areas/architettura/decisioni-architetturali.md` | Architettura | CREATO |
| `docs/areas/archiviazione/database-schema.md` | Archiviazione | CREATO |
| `docs/areas/infrastruttura/stack-tecnico.md` | Infrastruttura | CREATO |
| `docs/areas/interfaccia/ux-flows.md` | Interfaccia | CREATO |
| `docs/areas/notifiche/sistema-notifiche.md` | Notifiche | CREATO |
| `docs/areas/ruoli/ruoli-permessi.md` | Ruoli | CREATO |
| `docs/areas/sicurezza/privacy-gdpr.md` | Sicurezza | CREATO |
| `docs/areas/sicurezza/accesso-emergenza.md` | Sicurezza | CREATO |
| `docs/sessions/project-index.md` | Sessioni | CREATO |
| `docs/sessions/session-current.md` | Sessioni | CREATO |
| `docs/sessions/session-manager.md` | Sessioni | CREATO |
| `.agent-rules/AGENT_RULES.md` | Regole | CREATO |
| `.agent-rules/session-changelog.md` | Regole | CREATO |

### Decisioni Prese

| ID | Decisione | Stato |
|----|-----------|-------|
| ADR-001 | Architettura multi-tenant dall'inizio | ✅ Approvato |
| ADR-002 | Lock slot con TTL su DB (server-side) | ✅ Approvato |
| ADR-003 | RBAC con 4 ruoli e permessi staff configurabili | ✅ Approvato |
| ADR-004 | Coda richieste speciali FIFO | ✅ Approvato |
| ADR-005 | SMS via gateway esterno (provider da scegliere) | 🔄 In valutazione |
| ADR-006 | Recovery emergenza a 3 livelli | ✅ Approvato |

### Chiarimenti Cliente

- Medicinali controllati: nessun blocco automatico, il medico valuta e processa
- Prescrizioni: dematerializzata → PDF; bianca/rossa → ritiro in studio
- Ruolo segretario: accesso agenda sempre garantito (non revocabile)
- Stack tech: nessuna preferenza, da decidere in Fase 1

### Decisioni Aperte al Termine della Sessione

- Framework mobile (Expo vs Flutter)
- ORM (Drizzle vs Prisma)
- Ore minime per cancellazione prenotazione
- SMS provider
- Numero max cancellazioni prima di ban paziente

---

## Template Nuova Sessione

```markdown
## Sessione 00X — YYYY-MM-DD

### Obiettivo

### Tipo Sessione
`CODICE` | `DOCUMENTAZIONE` | `BUGFIX` | `REFACTOR` | `MISTO`

### Agenti Coinvolti
- Agente 1 (Coding Agent): ...
- Agente 2 (Doc Agent): ...
- Agente 3 (Index Agent): ...

### Artefatti Prodotti

| File | Area | Tipo |
|------|------|------|
| `path/file` | Area | CREATO/MODIFICATO/ELIMINATO |

### Decisioni Prese

| ID | Decisione | Stato |
|----|-----------|-------|

### Chiarimenti Cliente

### Decisioni Aperte al Termine della Sessione
```

---

*Ultimo aggiornamento: 2026-09-09 17:58 — Agente 3 (Index Agent)*

---

## Sessione 002 — 2026-09-09

### Obiettivo
Setup completo del monorepo: struttura cartelle, configurazioni, schema DB, scaffold delle tre app.

### Tipo Sessione
`CODICE` + `DOCUMENTAZIONE`

### Agenti Coinvolti
- Agente 1 (Coding Agent): ha scritto tutti i file di codice e configurazione
- Agente 3 (Index Agent): ha aggiornato changelog, session-current, session-manager

### Artefatti Prodotti

| File | Area | Tipo |
|------|------|------|
| `package.json` (root) | Infrastruttura | CREATO |
| `pnpm-workspace.yaml` | Infrastruttura | CREATO |
| `turbo.json` | Infrastruttura | CREATO |
| `tsconfig.base.json` | Infrastruttura | CREATO |
| `.env.example` | Infrastruttura | CREATO |
| `docker-compose.yml` | Infrastruttura | CREATO |
| `.gitignore` | Infrastruttura | CREATO |
| `packages/types/**` | Tipi condivisi | CREATO (7 file) |
| `packages/db/**` | Database Drizzle | CREATO (11 file) |
| `apps/api/**` | Backend Fastify | CREATO (7 file) |
| `apps/web/**` | Web Next.js | CREATO (10 file) |
| `apps/mobile/**` | Mobile Expo | CREATO (10 file) |

### Decisioni Prese

| ID | Decisione | Stato |
|----|-----------|-------|
| ADR-007 | Stack: Expo + Next.js + Fastify + Drizzle | ✅ Implementato |
| — | SMS rimosso MVP (zero budget) | ✅ Confermato |
| — | Better Auth per autenticazione | ✅ Scelto |
| — | NativeWind per Tailwind su mobile | ✅ Scelto |

### Decisioni Aperte al Termine della Sessione
- Implementazione business logic slot lock (ADR-002)
- Setup FCM/APNs per push notifications
- Primo test di avvio in locale
