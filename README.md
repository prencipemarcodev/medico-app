# Studio Medico App 🩺

Applicazione per la gestione di studi medici e prenotazioni visite, articolata su tre superfici (Mobile, Web Dashboard e Backend API).

## 📁 Struttura della Documentazione

Il progetto adotta una documentazione modulare basata su aree tematiche e tracciamento delle sessioni in formato compatibile con Obsidian:

- **Regole Agenti**: [`.agent-rules/AGENT_RULES.md`](.agent-rules/AGENT_RULES.md) (flusso di sviluppo, standard e convenzioni)
- **Indice della Documentazione**: [`docs/sessions/project-index.md`](docs/sessions/project-index.md)
- **Stato Sessione Corrente**: [`docs/sessions/session-current.md`](docs/sessions/session-current.md)
- **Aree Progettuali**:
  - `docs/areas/dominio/`: Requisiti funzionali e regole di business
  - `docs/areas/architettura/`: Panoramica architetturale e log ADR
  - `docs/areas/archiviazione/`: Schema del database PostgreSQL
  - `docs/areas/infrastruttura/`: Stack tecnologico e raccomandazioni
  - `docs/areas/interfaccia/`: UX flows per mobile e web
  - `docs/areas/notifiche/`: Canali, template e architettura notifiche
  - `docs/areas/ruoli/`: Matrice permessi RBAC
  - `docs/areas/sicurezza/`: Privacy, GDPR e procedure di emergenza

## 🚀 Prossimi Passi (Fase 1)

- Definizione stack definitivo (Mobile & ORM)
- Inizializzazione monorepo (Turborepo + pnpm workspaces)
- Setup database e migrazioni iniziali
