---
tags: [#area/interfaccia, #stato/bozza, #priorità/media]
created: 2026-09-09
updated: 2026-09-09
---

# UX Flows — Studio Medico App

> Descrizione dei flussi utente principali per l'app mobile (paziente) e la web dashboard (staff).
> Collegato a: [[areas/dominio/requisiti-funzionali]] | [[areas/architettura/overview]]

---

## App Mobile — Paziente

### Flow 1: Registrazione e Onboarding

```
START
  │
  ▼
[Schermata di Benvenuto]
  → "Accedi" / "Registrati"
  │
  ▼ (Registrati)
[Form Registrazione]
  - Nome, Cognome
  - Data di nascita
  - Codice Fiscale (opzionale ma consigliato)
  - Email
  - Telefono
  - Password
  │
  ▼
[Scelta Medico Curante]
  - Lista medici dello studio (dropdown / ricerca)
  - Conferma scelta
  │
  ▼
[Consensi Privacy]
  - ✅ Accetto Termini di Servizio (obbligatorio)
  - ✅ Accetto Informativa Privacy (obbligatorio)
  - ☐ Desidero ricevere promemoria via SMS (opzionale)
  - ☐ Desidero ricevere notifiche push (opzionale)
  │
  ▼
[Verifica Email]
  - OTP via email
  │
  ▼
[Dashboard Paziente] ← FINE ONBOARDING
```

---

### Flow 2: Prenotazione Appuntamento (con Lock Slot)

```
[Dashboard]
  → "Prenota Visita"
  │
  ▼
[Calendario — selezione giorno]
  - Giorni disponibili evidenziati
  - Giorni chiusi/festivi disabilitati
  │
  ▼
[Lista Slot Disponibili]
  - Es: 09:00 (20 min) | 09:20 (20 min) | 10:30 (10 min) ...
  - Badge "Quasi pieno" se restano pochi slot
  │
  ▼
  Paziente seleziona uno slot
  │
  ▼
[LOCK SLOT — Server Side]
  - Countdown visibile: "Hai 10:00 minuti per completare"
  │
  ▼
[Form Prenotazione]
  - Tipologia visita: [Breve 10min | Standard 20min | Lunga 30min]
  - Motivo (dropdown): [Visita di controllo | Nuovo problema | ...]
  - Note aggiuntive (textarea, max 300 caratteri)
  - Riepilogo: Data, Ora, Medico
  │
  ▼
[Conferma]
  → "Conferma Prenotazione"
  │
  ├── Timeout scaduto → Slot liberato → "Tempo scaduto, ricomincia"
  │
  ▼
[Prenotazione Confermata ✓]
  - Riepilogo con data e ora
  - Notifica push + SMS (se abilitato)
  - Ritorno alla Dashboard
```

---

### Flow 3: Richiesta Speciale — Malattia

```
[Dashboard] → "Richieste" → "Nuova Richiesta" → "Certificato Malattia"
  │
  ▼
[Form Malattia]
  - Dati paziente (pre-compilati, in sola lettura)
  - Sintomatologia (checkbox: febbre, tosse, mal di gola, dolori...)
  - Descrizione aggiuntiva (textarea)
  - Data inizio sintomi (datepicker)
  - Data prevista fine malattia (datepicker)
  - Note per il medico (textarea, opzionale)
  │
  ▼
[Conferma invio]
  → "Invia richiesta"
  │
  ▼
[Richiesta Inviata ✓]
  - "La tua richiesta è stata inviata. Riceverai una notifica appena pronta."
  - Stato visibile nella sezione Richieste: "In attesa"
```

---

### Flow 4: Richiesta Speciale — Medicinale/Prescrizione

```
[Dashboard] → "Richieste" → "Nuova Richiesta" → "Prescrizione Medicinale"
  │
  ▼
[Form Prescrizione]
  - Dati paziente (pre-compilati)
  - Nome medicinale (campo testo libero)
  - Dosaggio / quantità (campo testo)
  - È una terapia cronica? (Sì / No)
  - Note per il medico (textarea)
  │
  ▼
[Conferma invio]
  │
  ▼
[Richiesta Inviata ✓]
  - Stato: "In attesa"

Quando il medico/segretario completa la richiesta:
  ├── Ricetta dematerializzata → PDF disponibile nell'app
  └── Ricetta bianca/rossa → Notifica: "La tua ricetta è pronta, ritiro in studio"
```

---

### Flow 5: Dashboard Paziente

```
[HOME DASHBOARD]
  ├── Prossimo appuntamento (card prominente)
  │     - Data, Ora, Medico
  │     - Pulsante "Cancella" (se nei tempi consentiti)
  │
  ├── Richieste in corso
  │     - Lista con stato: In attesa / In lavorazione / Completata / Rifiutata
  │
  ├── Storico prenotazioni (scrollabile)
  │
  └── Azioni rapide
        - [+ Prenota Visita]
        - [+ Nuova Richiesta]
        - [⚙ Impostazioni / Notifiche]
```

---

## Web Dashboard — Staff (Medico + Segretario)

### Layout Principale

```
┌─────────────────────────────────────────────┐
│  HEADER: Nome studio | Utente | Logout       │
├──────────┬──────────────────────────────────┤
│  SIDEBAR │  CONTENUTO PRINCIPALE             │
│          │                                   │
│ • Agenda │                                   │
│ • Coda   │                                   │
│ • Pazienti│                                  │
│ • Broadcast│                                 │
│ • ⚙ Config│                                  │
└──────────┴──────────────────────────────────┘
```

---

### View 1: Agenda Giornaliera

```
[AGENDA — Mercoledì 9 Settembre 2026]

[◀ Ieri]  [Oggi]  [Domani ▶]  [Seleziona data 📅]

09:00 │ ████████ Mario Rossi — Visita di controllo      [✓ Completata]
09:20 │ ████████ Anna Bianchi — Follow-up esami          [● Confermata]
09:40 │ ░░░░░░░░ LIBERO                                  [+ Aggiungi]
10:00 │ 🔒🔒🔒🔒 IN LOCK (scade 10:08)                  [—]
10:20 │ ████████ Luca Verdi — Nuovo problema             [● Confermata]
...
```

- Slot in lock mostrati con countdown
- Click su prenotazione → dettaglio + azioni (sposta / rifiuta / segna completata)
- Pulsante "Broadcast" in alto a destra

---

### View 2: Coda Richieste Speciali (FIFO)

```
[RICHIESTE SPECIALI]                    Filtro: [Tutte ▼] [In attesa ▼]

#1  🤒 MALATTIA          Giovanni Ferri        ieri 14:32   [In attesa]
#2  💊 MEDICINALE         Sara Neri             oggi 08:15   [In attesa]
#3  📋 CERTIFICATO        Mario Rossi           oggi 09:45   [In attesa]
#4  💊 MEDICINALE         Lucia Blu             oggi 10:12   [In lavorazione]

[Apri #1 ▶]
```

Dettaglio richiesta:
```
┌────────────────────────────────────────────┐
│ RICHIESTA MALATTIA — Giovanni Ferri         │
│ Ricevuta: ieri 14:32                        │
├────────────────────────────────────────────┤
│ Sintomi: Febbre, Tosse, Mal di gola         │
│ Dal: 08/09/2026  Al: 12/09/2026             │
│ Note: "Ho iniziato ieri sera con 38.5"      │
├────────────────────────────────────────────┤
│ [✓ Completa richiesta]  [✗ Rifiuta]        │
└────────────────────────────────────────────┘
```

---

### View 3: Invio Broadcast

```
[BROADCAST PAZIENTI]

Giorno: [09/09/2026 📅]  →  Pazienti prenotati: 12

Messaggio (max 160 caratteri):
┌─────────────────────────────────────────────┐
│ Lo studio rimarrà chiuso oggi pomeriggio    │
│ dopo le 13:00 per un imprevisto. Ci scusia  │
│ mo per il disagio.                          │
└─────────────────────────────────────────────┘
Caratteri: 142/160

Canali: [✅ Push]  [✅ SMS]

[Anteprima] [Invia a 12 pazienti ▶]

⚠️ "Stai per inviare un messaggio a 12 pazienti. Confermi?"
   [Annulla]  [Conferma invio]
```

---

*Vedere anche:*
- [[areas/dominio/requisiti-funzionali]]
- [[areas/architettura/overview]]
- [[areas/notifiche/sistema-notifiche]]
