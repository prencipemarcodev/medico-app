---
tags: [#sessione/index, #stato/attivo]
created: 2026-09-09
updated: 2026-09-09
---

# 📋 Project Index — Studio Medico App

> Mappa completa di tutti i documenti del progetto.
> Aggiornato dall'Agente 3 (Index Agent) ad ogni sessione di lavoro.
> Questo è il punto di ingresso principale della documentazione Obsidian.

---

## 🗂 Areas

### [[areas/dominio/requisiti-funzionali|📌 Requisiti Funzionali]]
Documento master dei requisiti. Ruoli, modulo prenotazioni, richieste speciali, notifiche, vincoli di business.
`#stato/approvato` `#priorità/alta`

---

### Architettura
- [[areas/architettura/overview|🏗 Panoramica Architetturale]] — Visione d'insieme, tre superfici, modello dati, flusso lock slot, multi-tenant. `#stato/bozza`
- [[areas/architettura/decisioni-architetturali|📐 Decisioni Architetturali (ADR)]] — Log di tutte le Architecture Decision Records. `#stato/bozza`

---

### Archiviazione
- [[areas/archiviazione/database-schema|🗄 Schema Database]] — Tutte le tabelle, indici, vincoli. PostgreSQL. `#stato/bozza`

---

### Infrastruttura
- [[areas/infrastruttura/stack-tecnico|⚙️ Stack Tecnico]] — Opzioni e raccomandazioni per mobile, web, backend, DB, notifiche. `#stato/bozza`

---

### Interfaccia
- [[areas/interfaccia/ux-flows|🖥 UX Flows]] — Flussi utente dettagliati per app mobile e web dashboard. `#stato/bozza`

---

### Notifiche
- [[areas/notifiche/sistema-notifiche|🔔 Sistema Notifiche]] — Canali, trigger, template, broadcast, architettura. `#stato/bozza`

---

### Ruoli
- [[areas/ruoli/ruoli-permessi|👥 Ruoli e Permessi]] — RBAC completo, matrice permessi, JWT claims. `#stato/approvato`

---

### Sicurezza
- [[areas/sicurezza/privacy-gdpr|🔒 Privacy e GDPR]] — Classificazione dati, base giuridica, consensi, diritti, conservazione. `#stato/bozza`
- [[areas/sicurezza/accesso-emergenza|🚨 Accesso di Emergenza]] — Recovery credenziali medico, emergency code, flusso tecnico. `#stato/approvato`

---

## 📁 Sessions

- [[sessions/session-current|▶ Sessione Corrente]] — Stato attuale del progetto, ultime modifiche, prossimi step
- [[sessions/session-manager|📅 Session Manager]] — Storico di tutte le sessioni di lavoro

---

## 🤖 Agent Rules

- [[../.agent-rules/AGENT_RULES|⚖️ Regole Agenti]] — Ciclo tre agenti, standard codice, Obsidian convention, dati sensibili
- [[../.agent-rules/session-changelog|📝 Session Changelog]] — File di handoff Agente 1 → Agente 2

---

## Legenda Stato Documenti

| Tag | Significato |
|-----|------------|
| `#stato/bozza` | In lavorazione, può cambiare |
| `#stato/in-review` | In attesa di approvazione utente |
| `#stato/approvato` | Approvato, cambiamenti richiedono review |
| `#stato/deprecato` | Non più valido, mantenuto per storico |

---

## Legenda Priorità

| Tag | Significato |
|-----|------------|
| `#priorità/alta` | Blocca lo sviluppo se non definito |
| `#priorità/media` | Importante ma non bloccante |
| `#priorità/bassa` | Nice-to-have, V2 |

---

*Ultimo aggiornamento: 2026-09-09 17:54 — Agente 3 (Index Agent)*
