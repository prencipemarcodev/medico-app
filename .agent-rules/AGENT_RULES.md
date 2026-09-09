# 🤖 Agent Rules — Studio Medico App

> Queste regole sono vincolanti per tutti gli agenti AI che lavorano su questo progetto.
> Ogni agente deve leggere questo file prima di iniziare qualsiasi sessione di lavoro.

---

## Regola 1 — Il Ciclo dei Tre Agenti (Codice → Changelog → Doc)

Ogni modifica al codice sorgente segue obbligatoriamente questo ciclo:

```
AGENTE 1 (Coding Agent)
  ↓ scrive/modifica codice
  ↓ produce: CHANGELOG della sessione in .agent-rules/session-changelog.md

AGENTE 2 (Doc Agent)
  ↓ legge session-changelog.md
  ↓ produce: aggiornamento dei file .md nell'area corretta di docs/areas/

AGENTE 3 (Index Agent)
  ↓ legge i file aggiornati da Agente 2
  ↓ aggiorna: docs/sessions/project-index.md e docs/sessions/session-current.md
```

**Nessun agente salta il suo step. Nessun agente presume cosa hanno fatto gli altri senza leggere il file di handoff.**

---

## Regola 2 — Documentazione del Codice (Standard di Scrittura)

### Ogni file sorgente DEVE avere:

```
/**
 * @file        nome-file.ts
 * @module      NomeModulo
 * @description Breve descrizione dello scopo del file
 * @author      Agent-{N} | Session: {YYYY-MM-DD}
 * @version     {semver}
 * @see         [[docs/areas/{area}/{documento-correlato}.md]]
 */
```

### Ogni funzione/metodo DEVE avere:

```
/**
 * @function    nomeDellaFunzione
 * @description Cosa fa, in una riga
 * @param       {Tipo} nomeParam - Descrizione
 * @returns     {Tipo} - Descrizione del valore di ritorno
 * @throws      {ErrorType} - Quando viene lanciato
 * @see         [[docs/areas/{area}/{doc}.md#sezione]]
 */
```

### Ogni classe/type/interface DEVE avere:

```
/**
 * @interface   NomeInterface
 * @description Cosa rappresenta nell'architettura
 * @domain      {dominio: es. prenotazioni, utenti, richieste}
 */
```

---

## Regola 3 — Obsidian Link Convention

Tutti i link interni nei file `.md` usano la sintassi Obsidian `[[...]]`:

- Link a file: `[[areas/architettura/overview]]`
- Link a sezione: `[[areas/architettura/overview#Sezione]]`
- Link con alias: `[[areas/architettura/overview|Panoramica Architettura]]`
- Tag: `#area/architettura`, `#stato/bozza`, `#stato/approvato`, `#priorità/alta`

---

## Regola 4 — Formato del session-changelog.md

Ogni Coding Agent (Agente 1) **DEVE** scrivere in `.agent-rules/session-changelog.md` prima di terminare:

```markdown
## Session {YYYY-MM-DD HH:MM}

### File Modificati
- `path/al/file.ts` — [CREATO|MODIFICATO|ELIMINATO] — descrizione breve

### Decisioni Prese
- Motivazione di scelte architetturali non ovvie

### File da Aggiornare (per Agente 2)
- [ ] `docs/areas/{area}/{file}.md` — aggiungere/aggiornare sezione X

### Dipendenze Introdotte
- `nome-pacchetto@versione` — motivo
```

---

## Regola 5 — Nessuna Modifica Silente

Se un agente modifica il comportamento di una feature esistente (non solo refactoring), **DEVE**:
1. Indicarlo esplicitamente nel changelog con il tag `⚠️ BREAKING` o `🔄 BEHAVIOUR CHANGE`
2. Notificare nel session-current.md che serve review umana prima del merge

---

## Regola 6 — Dati Sensibili

- **MAI** scrivere dati reali di pazienti, codici fiscali, o dati medici in file di test/mock
- Usare sempre dati fittizi con il prefisso `TEST_` nei seed/fixture
- I file contenenti logica di accesso ai dati sanitari devono avere il commento `// GDPR-SENSITIVE` in testa

---

## File di Handoff tra Agenti

| File | Scritto da | Letto da |
|------|-----------|---------|
| `.agent-rules/session-changelog.md` | Agente 1 (Coding) | Agente 2 (Doc) |
| `docs/areas/**/*.md` aggiornati | Agente 2 (Doc) | Agente 3 (Index) |
| `docs/sessions/session-current.md` | Agente 3 (Index) | Tutti + Utente |
| `docs/sessions/project-index.md` | Agente 3 (Index) | Tutti |

---

*Ultimo aggiornamento: 2026-09-09 | Versione regole: 1.0.0*
