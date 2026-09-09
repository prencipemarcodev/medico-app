---
tags: [#area/sicurezza, #stato/bozza, #priorità/alta]
created: 2026-09-09
updated: 2026-09-09
---

# Privacy e GDPR — Studio Medico App

> Documento sulle decisioni relative alla privacy e alla conformità GDPR.
> I dati trattati sono dati sanitari (categorie particolari ex Art. 9 GDPR).
> Collegato a: [[areas/sicurezza/accesso-emergenza]] | [[areas/ruoli/ruoli-permessi]]

---

## Classificazione dei Dati Trattati

| Categoria | Esempi | Classificazione GDPR |
|-----------|--------|---------------------|
| Dati anagrafici | Nome, cognome, data nascita, CF, indirizzo | Dati personali (Art. 4) |
| Dati di contatto | Email, numero di telefono | Dati personali (Art. 4) |
| Dati sanitari | Sintomi, diagnosi, prescrizioni, motivo visita | Categorie particolari (Art. 9) |
| Dati di accesso | Log di login, IP, device | Dati personali (Art. 4) |
| Comunicazioni | SMS inviati, push notification | Dati personali (Art. 4) |

> [!CAUTION]
> I dati sanitari sono **categorie particolari** ai sensi dell'Art. 9 GDPR e richiedono misure di protezione rafforzate. Il trattamento è lecito in quanto necessario a fini di medicina preventiva/curativa (Art. 9 §2 lett. h).

---

## Base Giuridica del Trattamento

| Trattamento | Base Giuridica |
|------------|---------------|
| Gestione prenotazioni | Esecuzione di un contratto (Art. 6 §1 lett. b) |
| Gestione richieste mediche | Finalità di medicina preventiva/curativa (Art. 9 §2 lett. h) |
| Invio SMS/notifiche | Consenso esplicito (Art. 6 §1 lett. a) |
| Log di sistema | Interesse legittimo (Art. 6 §1 lett. f) |
| Archiviazione storica | Obbligo legale / Interesse pubblico (Art. 6 §1 lett. c/e) |

---

## Principi di Privacy by Design

### 1. Minimizzazione dei Dati
- Raccogliere solo i dati strettamente necessari per ogni funzionalità
- I form di richiesta speciale chiedono solo sintomi/note rilevanti, non la storia clinica completa
- I segretari vedono solo i dati anagrafici base (non i dati clinici) per default

### 2. Separazione degli Accessi
- Dati clinici visibili solo al medico (e al paziente per i propri dati)
- Segretario: accesso ai dati di organizzazione, non ai dati di salute
- Ogni accesso è tracciato nei log (chi ha visto cosa e quando)

### 3. Cifratura
- Dati in transito: HTTPS/TLS 1.3 obbligatorio su tutte le connessioni
- Dati a riposo: cifratura dei campi sanitari sensibili nel DB (da valutare: field-level encryption)
- Token JWT firmati con chiave privata RS256

### 4. Pseudonimizzazione (Futura)
- Per i log di analisi: sostituire dati identificativi con pseudonimi
- Non richiesto per la v1 locale, da implementare in produzione

---

## Diritti degli Interessati (Pazienti)

| Diritto | Come si esercita | Dove è implementato |
|---------|-----------------|-------------------|
| Accesso (Art. 15) | Il paziente vede tutti i propri dati nella app | Dashboard paziente |
| Rettifica (Art. 16) | Il paziente può modificare il proprio profilo | Impostazioni profilo |
| Cancellazione (Art. 17) | Richiesta via app → workflow di anonimizzazione | Da implementare |
| Portabilità (Art. 20) | Export dei propri dati in formato leggibile | Export PDF/JSON |
| Opposizione (Art. 21) | Disattivazione notifiche SMS | Preferenze notifiche |

> [!IMPORTANT]
> La cancellazione dei dati sanitari potrebbe essere limitata da obblighi di conservazione previsti dalla normativa italiana (es. 10 anni per la documentazione medica). Il workflow di "cancellazione" deve anonimizzare i dati identificativi mantenendo i dati sanitari anonimi per gli obblighi di legge.

---

## Consenso

### Al momento della registrazione il paziente deve:
1. Accettare i **Termini di Servizio** (obbligatorio per usare l'app)
2. Accettare l'**Informativa Privacy** (obbligatorio — consenso al trattamento dati sanitari)
3. Scegliere se ricevere **notifiche SMS** (opzionale — consenso separato)
4. Scegliere se ricevere **comunicazioni di servizio** via email (opzionale)

### Il consenso è:
- Esplicito (checkbox separati, non pre-spuntati)
- Granulare (ogni tipo di comunicazione ha il suo consenso)
- Revocabile in qualsiasi momento dalle impostazioni
- Tracciato con timestamp nel DB (`consent_log`)

---

## Conservazione dei Dati

| Tipo di Dato | Durata Conservazione | Motivazione |
|-------------|---------------------|-------------|
| Prenotazioni | 10 anni | Obblighi documentazione medica (normativa italiana) |
| Richieste speciali | 10 anni | Idem |
| Log di accesso | 12 mesi | Sicurezza informatica |
| SMS inviati | 12 mesi | Debugging notifiche |
| Account inattivi | 2 anni, poi anonimizzazione | GDPR minimizzazione |

---

## Breach di Dati — Procedura

1. Rilevamento della violazione (monitoraggio log)
2. Notifica al Garante entro **72 ore** (Art. 33 GDPR)
3. Notifica agli interessati se il breach comporta rischio elevato (Art. 34)
4. Documentazione dell'incidente nel registro dei trattamenti

> [!NOTE]
> Per la fase di test locale con account buddy, le procedure GDPR formali non si applicano. Vanno invece implementate prima del go-live in produzione.

---

## Note Aperte — Da Completare Prima del Go-Live

- [ ] Nomina DPO (Data Protection Officer) se obbligatoria
- [ ] Registro dei trattamenti (Art. 30 GDPR)
- [ ] Valutazione d'impatto (DPIA) per i dati sanitari (Art. 35)
- [ ] Contratti con i fornitori (SMS gateway, cloud provider) come Responsabili del Trattamento (Art. 28)
- [ ] Informativa privacy completa redatta da legale
- [ ] Cookie policy se viene usato il web

---

*Vedere anche:*
- [[areas/sicurezza/accesso-emergenza]]
- [[areas/ruoli/ruoli-permessi]]
- [[areas/archiviazione/database-schema]]
