---
tags: [#sessione/corrente, #stato/attivo]
created: 2026-09-09
updated: 2026-09-09
---

# ▶ Sessione Corrente

> Questo file viene aggiornato dall'Agente 3 (Index Agent) al termine di ogni sessione.
> Rappresenta lo stato live del progetto — cosa è fatto, cosa è in corso, cosa viene dopo.

---

## 📍 Stato Progetto: FASE DOCUMENTALE

**Data sessione**: 2026-09-09
**Fase**: 0 — Studio del caso e documentazione iniziale
**Prossima fase**: 1 — Setup monorepo e struttura progetto

---

## ✅ Completato in Questa Sessione

- [x] Analisi del dominio tramite intervista con il cliente (medico/utente)
- [x] Definizione dei requisiti funzionali completi
- [x] Definizione architettura a tre superfici (mobile, web, backend)
- [x] Modello multi-tenant progettato
- [x] Flusso anti-doppia prenotazione (lock slot 10 min) definito
- [x] RBAC con 4 ruoli (paziente, staff, medico, admin) definito
- [x] Schema database PostgreSQL iniziale
- [x] Sistema notifiche (SMS + push) specificato
- [x] UX flows per app mobile e web dashboard
- [x] Privacy e GDPR: classificazione dati, basi giuridiche, diritti
- [x] Accesso di emergenza medico: 3 livelli di recovery
- [x] Regole agenti AI: ciclo tre agenti, standard codice, Obsidian convention
- [x] Struttura documentale Obsidian creata e popolata

---

## 🔄 Decisioni Aperte (Da Risolvere Prima di Iniziare il Codice)

| # | Decisione | Priorità | Note |
|---|-----------|---------|------|
| 1 | Framework mobile: **Expo** vs **Flutter** | 🔴 Alta | Da decidere con il team |
| 2 | ORM: **Drizzle** vs **Prisma** | 🔴 Alta | Da decidere al setup |
| 3 | Ore minime cancellazione prenotazione | 🟡 Media | Da definire con il medico |
| 4 | SMS provider: **Twilio** vs **sms.it** | 🟡 Media | Prima dell'integrazione notifiche |
| 5 | Numero max prenotazioni annullabili prima di ban | 🟡 Media | Da definire con il medico |

---

## 📌 Chiarimenti Ricevuti in Sessione

| Punto | Chiarimento |
|-------|------------|
| Medicinali controllati | Non c'è blocco automatico — il medico/segretario valuta ogni richiesta e la processa se appropriato. Il paziente riceve notifica per ritiro. |
| Accesso emergenza medico | Recovery a 3 livelli: self-recovery email+OTP → segretario vede agenda → emergency code fisico |
| Prescrizioni digitali | Ricetta dematerializzata → PDF nell'app. Ricetta bianca/rossa → ritiro obbligatorio in studio |
| Ruolo segretario | Permessi configurabili dal medico tranne l'accesso all'agenda (sempre garantito, non revocabile) |

---

## ⏭ Prossimi Step (Fase 1)

1. **Decidere lo stack** (mobile framework + ORM) → aprire ADR-007
2. **Setup monorepo** con Turborepo + pnpm workspaces
3. **Struttura cartelle** progetto (apps/mobile, apps/web, apps/api, packages/types)
4. **Database**: script di migrazione iniziale con tutte le tabelle definite
5. **Auth**: implementare JWT con ruoli, middleware di autorizzazione
6. **Slot lock**: implementare meccanismo anti-doppia prenotazione

---

## 🔗 Link Rapidi

- [[sessions/project-index|📋 Project Index]] — Mappa completa documentazione
- [[areas/dominio/requisiti-funzionali|📌 Requisiti Funzionali]]
- [[areas/architettura/decisioni-architetturali|📐 ADR Log]]
- [[areas/archiviazione/database-schema|🗄 Schema DB]]
- [[../.agent-rules/AGENT_RULES|⚖️ Regole Agenti]]

---

*Ultimo aggiornamento: 2026-09-09 17:57 — Agente 3 (Index Agent)*
