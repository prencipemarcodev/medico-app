---
tags: [#area/archiviazione, #stato/bozza, #priorità/alta]
created: 2026-09-09
updated: 2026-09-09
---

# Schema Database — Studio Medico App

> Documento di riferimento per il modello dati del sistema.
> Collegato a: [[areas/architettura/overview#Modello-Dati]] | [[areas/sicurezza/privacy-gdpr]]

---

## Principi del Modello Dati

- **Multi-tenant**: ogni tabella include `studio_id` come FK obbligatoria
- **Soft delete**: nessuna cancellazione fisica dei dati sanitari (campo `deleted_at`)
- **Audit trail**: tutte le tabelle critiche hanno `created_at`, `updated_at`, `created_by`
- **GDPR**: i campi sensibili sono marcati nel codice con commento `-- GDPR-SENSITIVE`

---

## Entità Principali

### `studi` — Tenant Root
```sql
CREATE TABLE studi (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT NOT NULL,
  indirizzo     TEXT,
  telefono      TEXT,
  email         TEXT,
  attivo        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `medici` — Professionisti dello Studio
```sql
CREATE TABLE medici (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id     UUID NOT NULL REFERENCES studi(id),
  nome          TEXT NOT NULL,
  cognome       TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  telefono_primario   TEXT NOT NULL,
  telefono_secondario TEXT,          -- per recovery OTP
  password_hash TEXT NOT NULL,
  attivo        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `staff` — Segretari e Assistenti
```sql
CREATE TABLE staff (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id     UUID NOT NULL REFERENCES studi(id),
  medico_id     UUID NOT NULL REFERENCES medici(id),
  nome          TEXT NOT NULL,
  cognome       TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  attivo        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Permessi configurabili per staff
CREATE TABLE staff_permissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id      UUID NOT NULL REFERENCES staff(id),
  permesso      TEXT NOT NULL,       -- es. 'view_requests_detail'
  granted_by    UUID REFERENCES medici(id),
  granted_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `pazienti` — Utenti Mobile
```sql
CREATE TABLE pazienti (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id       UUID NOT NULL REFERENCES studi(id),
  medico_id       UUID NOT NULL REFERENCES medici(id),  -- medico curante
  nome            TEXT NOT NULL,               -- GDPR-SENSITIVE
  cognome         TEXT NOT NULL,               -- GDPR-SENSITIVE
  data_nascita    DATE NOT NULL,               -- GDPR-SENSITIVE
  codice_fiscale  TEXT UNIQUE,                 -- GDPR-SENSITIVE
  email           TEXT NOT NULL UNIQUE,        -- GDPR-SENSITIVE
  telefono        TEXT,                        -- GDPR-SENSITIVE
  password_hash   TEXT NOT NULL,
  sms_consenso    BOOLEAN DEFAULT FALSE,
  push_consenso   BOOLEAN DEFAULT FALSE,
  reminder_config JSONB DEFAULT '[]',          -- es. ["24h","2h"]
  attivo          BOOLEAN DEFAULT TRUE,
  deleted_at      TIMESTAMPTZ,                 -- soft delete GDPR
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Log consensi GDPR
CREATE TABLE consent_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paziente_id   UUID NOT NULL REFERENCES pazienti(id),
  tipo          TEXT NOT NULL,       -- 'privacy_policy' | 'sms' | 'push'
  azione        TEXT NOT NULL,       -- 'grant' | 'revoke'
  ip            INET,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `slot_agenda` — Calendario del Medico
```sql
CREATE TABLE slot_agenda (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medico_id     UUID NOT NULL REFERENCES medici(id),
  studio_id     UUID NOT NULL REFERENCES studi(id),
  data          DATE NOT NULL,
  ora_inizio    TIME NOT NULL,
  ora_fine      TIME NOT NULL,
  durata_min    INT NOT NULL DEFAULT 20,   -- 10 | 20 | 30
  stato         TEXT NOT NULL DEFAULT 'libero',
                -- 'libero' | 'bloccato' | 'prenotato' | 'chiuso'
  locked_until  TIMESTAMPTZ,               -- per il lock da carrello
  locked_by     UUID REFERENCES pazienti(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT check_stato CHECK (stato IN ('libero','bloccato','prenotato','chiuso'))
);

CREATE INDEX idx_slot_medico_data ON slot_agenda(medico_id, data);
CREATE INDEX idx_slot_locked ON slot_agenda(stato, locked_until) WHERE stato = 'bloccato';
```

---

### `prenotazioni` — Appuntamenti Confermati
```sql
CREATE TABLE prenotazioni (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id       UUID NOT NULL REFERENCES studi(id),
  paziente_id     UUID NOT NULL REFERENCES pazienti(id),
  medico_id       UUID NOT NULL REFERENCES medici(id),
  slot_id         UUID NOT NULL UNIQUE REFERENCES slot_agenda(id),
  tipologia_visita TEXT NOT NULL,      -- 'breve' | 'standard' | 'lunga'
  motivo_categoria TEXT NOT NULL,      -- dal menu a tendina
  motivo_note     TEXT,               -- GDPR-SENSITIVE, max 300 chars
  stato           TEXT NOT NULL DEFAULT 'confermata',
                  -- 'confermata' | 'spostata' | 'rifiutata' | 'completata' | 'no_show'
  gestita_da      UUID,               -- staff_id o medico_id che ha gestito
  note_staff      TEXT,               -- nota interna del segretario
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prenotazioni_paziente ON prenotazioni(paziente_id, created_at DESC);
CREATE INDEX idx_prenotazioni_medico_data ON prenotazioni(medico_id, created_at DESC);
```

---

### `richieste_speciali` — Malattia / Certificati / Medicinali
```sql
CREATE TABLE richieste_speciali (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id       UUID NOT NULL REFERENCES studi(id),
  paziente_id     UUID NOT NULL REFERENCES pazienti(id),
  medico_id       UUID NOT NULL REFERENCES medici(id),
  tipo            TEXT NOT NULL,
                  -- 'malattia' | 'certificato' | 'medicinale'
  sottotipo       TEXT,               -- es. 'certificato_sportivo', 'ricetta_bianca'
  payload         JSONB NOT NULL,     -- GDPR-SENSITIVE: form compilato dal paziente
  stato           TEXT NOT NULL DEFAULT 'in_attesa',
                  -- 'in_attesa' | 'in_lavorazione' | 'completata' | 'rifiutata'
  modalita_ritiro TEXT,               -- 'digitale' | 'studio'
  note_rifiuto    TEXT,               -- obbligatoria se stato = 'rifiutata'
  gestita_da      UUID,               -- staff_id o medico_id
  gestita_at      TIMESTAMPTZ,
  completata_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_richieste_medico_stato ON richieste_speciali(medico_id, stato, created_at ASC);
```

---

### `broadcast` — Messaggi di Massa
```sql
CREATE TABLE broadcast (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id       UUID NOT NULL REFERENCES studi(id),
  inviato_da      UUID NOT NULL,      -- staff_id o medico_id
  giorno_target   DATE NOT NULL,
  testo           TEXT NOT NULL,      -- max 160 chars
  canali          TEXT[] NOT NULL,    -- ['sms', 'push']
  n_destinatari   INT,
  n_inviati       INT,
  n_falliti       INT,
  stato           TEXT DEFAULT 'inviato',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `emergency_codes` — Codici di Recovery Medico
```sql
CREATE TABLE emergency_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medico_id   UUID NOT NULL REFERENCES medici(id),
  code_hash   TEXT NOT NULL,          -- bcrypt hash
  usato       BOOLEAN DEFAULT FALSE,
  usato_at    TIMESTAMPTZ,
  usato_ip    INET,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Indici Critici per le Performance

```sql
-- Slot liberi per un medico in una data (query più frequente dell'app)
CREATE INDEX idx_slot_liberi ON slot_agenda(medico_id, data, stato)
  WHERE stato = 'libero';

-- Coda richieste speciali FIFO per il medico
CREATE INDEX idx_richieste_coda ON richieste_speciali(medico_id, stato, created_at ASC)
  WHERE stato = 'in_attesa';

-- Pazienti prenotati in un giorno (per broadcast)
CREATE INDEX idx_prenotazioni_giorno ON prenotazioni(medico_id, slot_id)
  INCLUDE (paziente_id);
```

---

*Vedere anche:*
- [[areas/architettura/overview]]
- [[areas/sicurezza/privacy-gdpr]]
- [[areas/infrastruttura/stack-tecnico]]
