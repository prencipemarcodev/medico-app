---
tags: [#area/sicurezza, #stato/approvato, #priorità/alta]
created: 2026-09-09
updated: 2026-09-09
---

# Accesso di Emergenza — Studio Medico App

> Procedure e meccanismi per garantire la continuità operativa in caso di perdita di accesso.
> Collegato a: [[areas/sicurezza/privacy-gdpr]] | [[areas/ruoli/ruoli-permessi]]

---

## Scenari di Lock-Out

| Scenario | Probabilità | Impatto |
|---------|------------|---------|
| Medico dimentica la password | Alta | Alto (agenda bloccata) |
| Medico perde il telefono | Media | Alto |
| Account bloccato per troppi tentativi | Bassa | Alto |
| Server / app irraggiungibile | Bassa | Alto |

---

## Livelli di Recovery (in ordine)

### Livello 1 — Self-Recovery (< 5 minuti)
Il medico può sempre effettuare il reset autonomo:
- Reset password via **email registrata** + OTP su **numero di telefono secondario**
- Il numero secondario viene registrato all'onboarding e può essere modificato solo in presenza (con verifica)
- Il link di reset ha una validità di 30 minuti

### Livello 2 — Recovery tramite Segretario (immediato)
Il segretario ha sempre accesso all'agenda in visualizzazione, anche se il medico è offline:
- Questo permesso **non è revocabile** dal medico (è un permesso fisso di sistema)
- Il segretario può gestire prenotazioni e rispondere ai pazienti
- Il segretario **non può** accedere ai dati clinici né alle richieste speciali durante il lock-out del medico

### Livello 3 — Emergency Code (ultimo resort)
Un codice di recovery one-time fisico:
- Generato al momento della creazione dell'account medico
- Stampato e conservato in cassaforte fisica in studio
- Utilizzabile una sola volta per sbloccare l'account
- **Dopo l'utilizzo**: il sistema forza la creazione di nuove credenziali e genera un nuovo emergency code
- **Log obbligatorio**: il sistema registra data, ora e IP da cui è stato usato il codice di emergenza
- Il medico riceve una notifica immediata sull'email secondaria quando il codice viene usato

---

## Flusso Emergency Code

```
Admin/Medico usa il codice di emergenza
        │
        ▼
[Verifica codice — confronto hash nel DB]
        │
   Codice valido?
     │         │
    SÌ         NO
     │          └─→ "Codice non valido" (max 3 tentativi, poi blocco temporaneo 1h)
     ▼
[Accesso una tantum all'account]
[Codice invalidato immediatamente]
[Log dell'evento: timestamp + IP + user-agent]
[Notifica email al medico e all'admin]
        │
        ▼
[Medico deve impostare nuova password e nuovo 2FA]
[Nuovo emergency code generato e mostrato una sola volta]
```

---

## Continuità dell'App (Infrastruttura)

> [!NOTE]
> Per la fase di test locale questo punto non è applicabile. Va affrontato prima del go-live.

In produzione, prevedere:
- **Health check endpoint** monitorato ogni 5 minuti
- **Backup automatico** del DB ogni 24 ore (retention 30 giorni)
- **Procedura cartacea di emergenza**: il medico ha stampato l'agenda del giorno corrente (oppure il segretario la esporta in PDF ogni mattina come SOP)

---

## Implementazione Tecnica

### Tabella `emergency_codes`
```sql
CREATE TABLE emergency_codes (
  id          UUID PRIMARY KEY,
  doctor_id   UUID NOT NULL REFERENCES medici(id),
  code_hash   TEXT NOT NULL,        -- bcrypt hash del codice
  used        BOOLEAN DEFAULT FALSE,
  used_at     TIMESTAMPTZ,
  used_ip     INET,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### Generazione del Codice
- Il codice in chiaro viene mostrato **una sola volta** al momento della creazione
- Formato: `XXXX-XXXX-XXXX-XXXX` (16 caratteri alfanumerici maiuscoli, senza ambiguità 0/O 1/I)
- Salvato come hash bcrypt nel DB (mai in chiaro)

---

*Vedere anche:*
- [[areas/sicurezza/privacy-gdpr]]
- [[areas/ruoli/ruoli-permessi]]
- [[areas/architettura/decisioni-architetturali#ADR-006]]
