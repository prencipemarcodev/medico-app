---
tags: [#area/infrastruttura, #stato/bozza, #priorità/alta]
created: 2026-09-09
updated: 2026-09-09
---

# Stack Tecnico — Studio Medico App

> Documento di riferimento per le scelte tecnologiche del progetto.
> Lo stack definitivo è ancora da decidere — questo documento presenta le opzioni valutate.
> Collegato a: [[areas/architettura/overview]] | [[areas/architettura/decisioni-architetturali]]

---

## Superfici Applicative da Coprire

| Superficie | Tipo | Utenti |
|-----------|------|--------|
| App Mobile | iOS + Android (mobile-first) | Pazienti |
| Web Dashboard | Desktop Browser | Medico + Segretario |
| Backend API | Server-side | — |
| Database | Relazionale | — |
| Notifiche | SMS Gateway + Push | — |

---

## Opzioni Stack Mobile

### Opzione A — React Native
- **Pro**: unico codebase per iOS e Android, ecosistema JavaScript ampio, ottima community
- **Contro**: bridge nativo può creare overhead, debugging più complesso
- **Adatto se**: il team ha esperienza React/JS

### Opzione B — Flutter
- **Pro**: performance nativa, ottimo per UI complesse, hot reload eccellente
- **Contro**: linguaggio Dart meno diffuso, ecosistema più piccolo di React Native
- **Adatto se**: si vuole massima qualità grafica e performance

### Opzione C — Expo (React Native managed)
- **Pro**: setup rapidissimo, OTA updates, ideale per MVP
- **Contro**: limitazioni per feature native avanzate, dependency da Expo
- **Adatto se**: si vuole iterare velocemente per il primo prototipo

> [!NOTE]
> Raccomandazione: **Expo (React Native)** per il prototipo/MVP, migrazione a bare React Native o Flutter se necessario. Da decidere in base all'esperienza del team.

---

## Opzioni Stack Web Dashboard

### Opzione A — Next.js (React)
- **Pro**: SSR + SSG, routing file-based, ottimo ecosistema, deploy semplice
- **Contro**: configurazione iniziale
- **Ideale per**: dashboard desktop con dati real-time via SSE/WebSocket

### Opzione B — Vite + React (SPA)
- **Pro**: setup minimalista, build velocissima, ottimo per SPA pura
- **Contro**: no SSR (non necessario per dashboard interna)
- **Ideale per**: dashboard admin senza requisiti SEO

> [!NOTE]
> Raccomandazione: **Next.js** per la web dashboard — gestisce bene l'autenticazione server-side e i canali real-time per l'agenda live.

---

## Opzioni Stack Backend

### Opzione A — Node.js + Fastify + TypeScript
- **Pro**: stesso linguaggio del frontend, veloce, TypeScript end-to-end
- **Contro**: single-threaded (gestibile con worker threads per task pesanti)

### Opzione B — Node.js + NestJS + TypeScript
- **Pro**: struttura opinionata (moduli, DI, decoratori), adatto a team grandi
- **Contro**: curva di apprendimento, overhead per progetti piccoli

### Opzione C — Python + FastAPI
- **Pro**: molto leggibile, ottimo per future integrazioni AI/ML
- **Contro**: ecosistema mobile-backend meno uniforme del TS full-stack

> [!NOTE]
> Raccomandazione: **Fastify + TypeScript** per velocità e semplicità. NestJS se il team cresce e servono più strutture.

---

## Database

### Scelta: PostgreSQL
- Relazionale, robusto, ACID-compliant — fondamentale per le prenotazioni
- Supporto nativo UUID, JSONB (per i payload delle richieste speciali), array
- Ottimo per le query di coda FIFO e gli indici per gli slot
- **ORM consigliato**: Drizzle ORM (leggero, type-safe, SQL-first) o Prisma (più opinionato)

### Per i Lock degli Slot
- Nella v1: gestito direttamente su PostgreSQL con `SELECT FOR UPDATE` + TTL
- In futuro (se scale): Redis per i lock distribuiti

---

## Notifiche

### Push Notifications
- **iOS**: Apple Push Notification service (APNs)
- **Android**: Firebase Cloud Messaging (FCM)
- **Astrazione**: usare un provider unificato come **Expo Notifications** (se Expo) o **OneSignal**

### SMS Gateway (opzioni in valutazione)
| Provider | Note |
|---------|------|
| Twilio | Standard de facto, API eccellente, server EU disponibili |
| Vonage | Buona copertura EU |
| sms.it | Provider italiano, GDPR nativo, prezzi competitivi per l'Italia |

> [!NOTE]
> L'integrazione SMS è astratta dietro un'interfaccia `SmsProvider` nel backend — il provider può essere cambiato senza modificare la business logic.

---

## Ambiente di Sviluppo / Test

### Setup Locale (Fase Attuale)
```
Docker Compose:
  - PostgreSQL 16
  - Backend API (Node.js)
  - Web Dashboard (Next.js)

App Mobile:
  - Expo Go su dispositivo fisico o simulatore
  - API punta a localhost via ngrok o IP locale
```

### Strumenti di Sviluppo
- **Monorepo**: Turborepo o pnpm workspaces (per condividere tipi TypeScript tra app/backend)
- **Linting**: ESLint + Prettier
- **Testing**: Vitest (unit) + Playwright (E2E dashboard) + Detox (E2E mobile, futuro)
- **API Docs**: automatica con Fastify Swagger

---

## Struttura Monorepo (Proposta)

```
medico-app/
├── apps/
│   ├── mobile/          # Expo React Native (paziente)
│   ├── web/             # Next.js (medico/segretario)
│   └── api/             # Fastify backend
├── packages/
│   ├── types/           # Tipi TypeScript condivisi
│   ├── ui/              # Componenti UI condivisi (se necessario)
│   └── utils/           # Utilities condivise
├── docs/                # Documentazione Obsidian
├── .agent-rules/        # Regole agenti AI
└── docker-compose.yml
```

---

## Decisioni Aperte

| Decisione | Opzioni | Da decidere |
|-----------|---------|-------------|
| Framework mobile | Expo / Flutter | Prima sessione di sviluppo |
| ORM | Drizzle / Prisma | Prima sessione di sviluppo |
| SMS provider | Twilio / sms.it | Prima sessione con SMS reali |
| Monorepo tool | Turborepo / pnpm ws | Setup iniziale |

---

*Vedere anche:*
- [[areas/architettura/overview]]
- [[areas/architettura/decisioni-architetturali]]
- [[areas/archiviazione/database-schema]]
