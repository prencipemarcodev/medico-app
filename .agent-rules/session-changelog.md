# Session Changelog

> File di handoff tra Agente 1 (Coding) e Agente 2 (Doc).
> Agente 1 appende qui ogni volta che termina una sessione di scrittura codice.
> Agente 2 legge questo file per sapere cosa documentare.

---

## Session 2026-09-09 17:46 — Inizializzazione Progetto

### File Modificati
- `docs/` — [CREATO] — struttura documentale iniziale del progetto

### Decisioni Prese
- Struttura Obsidian con `areas/` e `sessions/` come da specifiche utente
- Adottato ciclo a tre agenti per mantenere sincronizzazione codice-documentazione

### File da Aggiornare (per Agente 2)
- [x] `docs/sessions/project-index.md` — creato con struttura iniziale
- [x] `docs/sessions/session-current.md` — inizializzato
- [x] `docs/areas/dominio/requisiti-funzionali.md` — creato con analisi completa

### Dipendenze Introdotte
- Nessuna (fase documentale)

---

## Session 2026-09-09 18:16 — Setup Monorepo Completo

### File Modificati

**Root**
- `package.json` — [CREATO] — root monorepo con Turborepo + pnpm
- `pnpm-workspace.yaml` — [CREATO] — workspace apps/* packages/*
- `turbo.json` — [CREATO] — pipeline dev/build/lint/db
- `tsconfig.base.json` — [CREATO] — TypeScript base condiviso
- `.env.example` — [CREATO] — variabili d'ambiente documentate
- `docker-compose.yml` — [CREATO] — PostgreSQL 16 locale
- `.gitignore` — [CREATO]

**packages/types**
- `src/enums.ts` — [CREATO] — tutti gli enum del dominio
- `src/models/studio.ts` — [CREATO] — Studio, Medico, Staff
- `src/models/utenti.ts` — [CREATO] — Paziente, ConsentLog, input registrazione
- `src/models/prenotazioni.ts` — [CREATO] — Slot, LockSlotResponse, Prenotazione
- `src/models/richieste.ts` — [CREATO] — RichiestaSpeciale, payload union types, Broadcast
- `src/models/notifiche.ts` — [CREATO] — LogNotifica, PushNotificationPayload
- `src/index.ts` — [CREATO] — barrel export

**packages/db**
- `package.json` — [CREATO] — drizzle-orm, postgres, drizzle-kit
- `drizzle.config.ts` — [CREATO] — config generazione migrazioni
- `src/schema/studi.ts` — [CREATO] — tabelle studi, medici, emergency_codes
- `src/schema/staff.ts` — [CREATO] — tabelle staff, staff_permissions
- `src/schema/pazienti.ts` — [CREATO] — tabelle pazienti, consent_log
- `src/schema/slot.ts` — [CREATO] — tabella slot_agenda con check constraints
- `src/schema/prenotazioni.ts` — [CREATO] — tabella prenotazioni
- `src/schema/richieste.ts` — [CREATO] — tabelle richieste_speciali, broadcast
- `src/schema/notifiche.ts` — [CREATO] — tabella log_notifiche
- `src/schema/index.ts` — [CREATO] — barrel export schema
- `src/index.ts` — [CREATO] — client Drizzle con pool postgres

**apps/api**
- `package.json` — [CREATO] — Fastify + Better Auth + swagger
- `tsconfig.json` — [CREATO]
- `src/app.ts` — [CREATO] — buildApp: CORS, JWT, Swagger, routes
- `src/index.ts` — [CREATO] — entry point server
- `src/routes/health.ts` — [CREATO] — GET /health
- `src/routes/slot.ts` — [CREATO] — GET /:medicoId, POST /:slotId/lock (TODO business logic)
- `src/routes/prenotazioni.ts` — [CREATO] — CRUD prenotazioni (TODO business logic)
- `src/routes/richieste.ts` — [CREATO] — CRUD richieste speciali (TODO business logic)
- `src/routes/broadcast.ts` — [CREATO] — POST broadcast (TODO business logic)

**apps/web**
- `package.json` — [CREATO] — Next.js 15 + shadcn + TanStack Query
- `tsconfig.json` — [CREATO]
- `next.config.ts` — [CREATO]
- `tailwind.config.ts` — [CREATO]
- `app/layout.tsx` — [CREATO] — root layout
- `app/globals.css` — [CREATO]
- `app/(auth)/login/page.tsx` — [CREATO] — pagina login staff
- `app/dashboard/layout.tsx` — [CREATO] — sidebar + header
- `app/dashboard/page.tsx` — [CREATO] — panoramica con KPI
- `app/dashboard/agenda/page.tsx` — [CREATO] — vista agenda giornaliera
- `app/dashboard/richieste/page.tsx` — [CREATO] — coda FIFO richieste
- `app/dashboard/broadcast/page.tsx` — [CREATO] — form invio broadcast

**apps/mobile**
- `package.json` — [CREATO] — Expo + NativeWind + Expo Router
- `tsconfig.json` — [CREATO]
- `app.json` — [CREATO] — config Expo (iOS + Android)
- `tailwind.config.js` — [CREATO]
- `app/_layout.tsx` — [CREATO] — root layout con auth guard
- `app/(auth)/_layout.tsx` — [CREATO]
- `app/(auth)/index.tsx` — [CREATO] — schermata login paziente
- `app/(auth)/register.tsx` — [CREATO] — registrazione + consensi GDPR
- `app/(tabs)/_layout.tsx` — [CREATO] — tab navigator
- `app/(tabs)/index.tsx` — [CREATO] — dashboard paziente
- `app/(tabs)/prenota.tsx` — [CREATO] — prenotazione con calendario + slot
- `app/(tabs)/richieste.tsx` — [CREATO] — richieste speciali
- `app/(tabs)/profilo.tsx` — [CREATO] — profilo + impostazioni

### Decisioni Prese
- SMS rimosso dall'MVP (zero budget) → solo Expo Push Notifications
- Drizzle ORM scelto su Prisma (SQL-first, leggero)
- Expo scelto su Flutter (TypeScript end-to-end, Expo Notifications gratuito)
- Fastify scelto su NestJS (team piccolo, meno boilerplate)
- Better Auth per autenticazione self-hosted (zero costi, GDPR-friendly)

### File da Aggiornare (per Agente 2)
- [x] `docs/areas/infrastruttura/stack-tecnico.md` — aggiornare con stack definitivo
- [x] `docs/sessions/session-current.md` — aggiornare con Fase 1 completata
- [x] `docs/sessions/session-manager.md` — aggiungere Sessione 002

### Dipendenze Introdotte
- `turbo@^2.1.2` — monorepo pipeline
- `drizzle-orm@^0.33.0` — ORM PostgreSQL
- `drizzle-kit@^0.24.0` — generazione migrazioni
- `postgres@^3.4.4` — client PostgreSQL
- `fastify@^4.28.1` — backend framework
- `better-auth@^1.0.0` — autenticazione self-hosted
- `next@15.0.0` — web dashboard
- `expo@~51.0.28` — mobile app
- `expo-router@~3.5.23` — routing file-based mobile
- `expo-notifications@~0.28.18` — push notifications
- `nativewind@^4.0.1` — Tailwind per React Native
