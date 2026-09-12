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

---

## Session 2026-09-09 18:52 — Risoluzione pnpm, Installazione Dipendenze e Typecheck

### Azioni Eseguite
- Abilitato `corepack` e attivato `pnpm@9.9.0` nell'ambiente di sistema
- Eseguito con successo `pnpm install` su tutti i 6 progetti del workspace
- Creato file di configurazione locale `.env` da `.env.example`
- Eseguito `pnpm db:generate` con Drizzle Kit: generata migrazione iniziale `0000_purple_sheva_callister.sql` (12 tabelle)
- Configurato `nativewind-env.d.ts` e corrette impostazioni `tsconfig.json` in `apps/web` e `apps/mobile`
- Eseguito `pnpm lint` globale con Turborepo: **0 errori** su `@medico/api`, `@medico/web` e `@medico/mobile`

---

## Session 2026-09-09 20:04 — Setup PostgreSQL 16 & Esecuzione Migrazioni Drizzle

### Azioni Eseguite
- Installato `postgresql@16` tramite Homebrew ed eseguito `brew services start postgresql@16`
- Creato database locale `medico_app`
- Configurato `.env` con `DATABASE_URL="postgresql://marcoprencipe@localhost:5432/medico_app"`
- Eseguito `pnpm db:migrate`: tutte le 12 tabelle applicate con successo
- Verificate le 12 tabelle nel database con `psql \dt`

---

## Session 2026-09-09 20:13 — Implementazione Transazionale Slot Lock & Prenotazioni (ADR-002)

### File Modificati
- `packages/db/src/schema/slot.ts` — [MODIFICATO] — aggiunta colonna `lock_token` e fix check constraints
- `packages/db/src/index.ts` — [MODIFICATO] — re-export operatori `drizzle-orm` e fix estensioni `.js` ESM
- `packages/db/src/schema/*.ts` — [MODIFICATO] — conformità estensioni `.js` NodeNext ESM
- `packages/db/src/seed.ts` — [MODIFICATO] — seeding idempotente con studio, medico, paziente e slot
- `apps/api/src/services/slotService.ts` — [CREATO] — logica `getAvailableSlots`, `lockSlot` (ADR-002 con `SELECT FOR UPDATE` e TTL 10 min), `cleanupExpiredLocks`
- `apps/api/src/services/prenotazioneService.ts` — [CREATO] — `creaPrenotazione` (validazione `lockToken`, max 2 visite/die, stato slot 'prenotato'), `getPrenotazioniPaziente`, `cancellaPrenotazione`
- `apps/api/src/routes/slot.ts` — [MODIFICATO] — integrazione con `slotService` (`GET /:medicoId`, `POST /:slotId/lock`)
- `apps/api/src/routes/prenotazioni.ts` — [MODIFICATO] — integrazione con `prenotazioneService` (`GET /`, `POST /`, `DELETE /:id`)
- `apps/api/src/index.ts` — [MODIFICATO] — avviato job schedulato ogni 60s per pulizia automatica lock scaduti

### Verifiche Eseguite
- Eseguito test transazionale end-to-end con esito positivo:
  1. Recupero slot liberi
  2. Lock 10 minuti con restituzione `lockToken`
  3. Prevenzione collisione: secondo lock concorrente bloccato con `409 Conflict` (`CURRENTLY_LOCKED`)
  4. Creazione e conferma prenotazione con `lockToken`
  5. Verifica storico prenotazioni
  6. Annullamento prenotazione e rilascio immediato dello slot a `'libero'`
- `pnpm lint` verificato con successo su tutto il monorepo

---

## Session 2026-09-12 07:43 — Implementazione 4 Dashboard, Login Unificato, Onboarding & Impostazioni Personalizzabili

### File Modificati / Creati
- `packages/types/src/models/studio.ts` — [MODIFICATO] — aggiunte interfacce `StudioConfig`, `OrarioGiorno`, `BroadcastTemplateConfig`, `PermessiSegreteriaConfig`
- `packages/db/src/schema/studi.ts` — [MODIFICATO] — aggiunta colonna `config: jsonb('config')`
- `packages/db/src/seed.ts` — [MODIFICATO] — seed con configurazione studio completa e fix ordine cancellazione foreign keys
- `apps/web/app/(auth)/login/page.tsx` — [MODIFICATO] — login unificato con redirect RBAC e selettore rapido 4 profili demo
- `apps/web/app/dashboard/layout.tsx` — [MODIFICATO] — aggiunta voce Impostazioni Studio nella sidebar
- `apps/web/app/dashboard/onboarding/page.tsx` — [CREATO] — wizard 3 step per prima configurazione studio medico
- `apps/web/app/dashboard/impostazioni/page.tsx` — [CREATO] — pannello 5 tab con configurazione orari, lockup, template broadcast e deleghe
- `apps/web/app/segreteria/layout.tsx` & `page.tsx` — [CREATO] — dashboard segreteria con sala d'attesa live, accettazione rapida e sportello ritiro ricette
- `apps/web/app/admin/layout.tsx` & `page.tsx` — [CREATO] — dashboard admin di sistema con audit log GDPR e generatore Emergency Code (ADR-006)
- `apps/web/app/paziente/layout.tsx`, `page.tsx`, `prenota/page.tsx` — [CREATO] — portale paziente web con prenotazione guidata e countdown lock 10m

### Verifiche Eseguite
- Eseguito `pnpm db:generate && pnpm db:migrate` (migrazione `0002_steep_dexter_bennett.sql` applicata con successo)
- Eseguito `pnpm lint`: **0 errori** su tutti i pacchetti
- Eseguito `pnpm --filter=@medico/web build`: **15 route statiche/dinamiche compilate con successo**
