---
tags: [#sessione/corrente, #stato/attivo]
created: 2026-09-09
updated: 2026-09-09
---

# ▶ Sessione Corrente

> Aggiornato dall'Agente 3 al termine della Sessione 002.

---

## 📍 Stato Progetto: SETUP COMPLETATO

**Data sessione**: 2026-09-09
**Fase**: 1 — Setup monorepo ✅
**Prossima fase**: 2 — Business logic (slot lock, prenotazioni, auth)

---

## ✅ Completato

### Sessione 001 — Studio del caso
- [x] Analisi dominio e requisiti funzionali
- [x] Architettura multi-tenant definita
- [x] RBAC 4 ruoli definito
- [x] Schema DB PostgreSQL progettato
- [x] UX flows documentati
- [x] Regole agenti AI create
- [x] Struttura Obsidian popolata

### Sessione 002 — Setup Monorepo
- [x] Root monorepo: Turborepo + pnpm workspaces
- [x] `docker-compose.yml` PostgreSQL 16 locale
- [x] `packages/types` — tutti i tipi TypeScript condivisi
- [x] `packages/db` — schema Drizzle completo (11 tabelle)
- [x] `apps/api` — Fastify con CORS, JWT, Swagger, 5 route modules
- [x] `apps/web` — Next.js 15, login, dashboard, agenda, richieste, broadcast
- [x] `apps/mobile` — Expo Router, auth flow, 4 tab screens

---

## 🔄 TODO — Prossima Sessione (Fase 2)

### Priority Alta
- [ ] `pnpm install` — installare dipendenze
- [ ] `docker compose up -d` — avviare PostgreSQL
- [ ] `pnpm db:generate && pnpm db:migrate` — applicare schema DB
- [ ] Implementare **lock slot** (ADR-002): logica transazionale in `routes/slot.ts`
- [ ] Implementare **creazione prenotazione** con validazione lockToken
- [ ] Implementare **autenticazione** con Better Auth (login, registrazione, JWT)

### Priority Media
- [ ] Coda richieste FIFO: query Drizzle in `routes/richieste.ts`
- [ ] Job schedulato: pulizia lock slot scaduti ogni 60s
- [ ] Expo Push Notifications: setup FCM/APNs, invio da API
- [ ] Agenda reale in `apps/web/app/dashboard/agenda`

### Priority Bassa
- [ ] shadcn/ui: inizializzare componenti (Button, Card, Table, Badge)
- [ ] Form di prenotazione completo su mobile (step 2 dopo lock)
- [ ] Form richieste speciali (malattia, certificato, medicinale)

---

## 📂 Struttura Progetto Attuale

```
medico-app/
├── apps/
│   ├── api/        ← Fastify (Fase 1 ✅, business logic TODO)
│   ├── web/        ← Next.js 15 (scaffold ✅, dati reali TODO)
│   └── mobile/     ← Expo (scaffold ✅, dati reali TODO)
├── packages/
│   ├── types/      ← ✅ Completo
│   └── db/         ← ✅ Schema completo, migrazioni TODO
├── docs/           ← ✅ Obsidian vault completo
└── .agent-rules/   ← ✅ Regole agenti definite
```

---

## ⚡ Come Avviare in Locale

```bash
# 1. Installa dipendenze
pnpm install

# 2. Crea il file .env dalla template
cp .env.example .env

# 3. Avvia PostgreSQL
docker compose up -d

# 4. Applica schema DB
pnpm db:generate
pnpm db:migrate

# 5. Avvia tutto in dev
pnpm dev
```

---

*Ultimo aggiornamento: 2026-09-09 18:40 — Agente 3 (Index Agent)*
