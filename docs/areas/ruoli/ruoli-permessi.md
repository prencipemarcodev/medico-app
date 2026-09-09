---
tags: [#area/ruoli, #stato/approvato, #priorità/alta]
created: 2026-09-09
updated: 2026-09-09
---

# Ruoli e Permessi — Studio Medico App

> Documento di riferimento per il sistema RBAC del progetto.
> Collegato a: [[areas/architettura/decisioni-architetturali#ADR-003]] | [[areas/sicurezza/privacy-gdpr]]

---

## Ruoli Definiti

### 🧑‍⚕️ PAZIENTE (`role: patient`)

**Chi è**: l'utente finale dell'app mobile. Si registra autonomamente scegliendo il proprio medico curante.

**Cosa può fare**:
- Visualizzare e modificare il proprio profilo anagrafico
- Prenotare appuntamenti con il proprio medico curante
- Cancellare proprie prenotazioni (entro il limite di ore consentito)
- Visualizzare la propria agenda prenotazioni (passate e future)
- Inviare richieste speciali (malattia, certificati, medicinali)
- Visualizzare lo stato delle proprie richieste speciali
- Configurare le preferenze di notifica (SMS, push, orari reminder)

**Cosa NON può fare**:
- Prenotare per conto di altri pazienti
- Vedere prenotazioni o dati di altri pazienti
- Accedere all'agenda completa del medico
- Modificare una prenotazione già confermata (solo cancellare e riprenotare)
- Richiedere farmaci stupefacenti o di classe soggetta a vincoli speciali

---

### 🖥️ SEGRETARIO / ASSISTENTE (`role: staff`)

**Chi è**: il personale di segreteria dello studio. Ha un account separato creato dal medico o dall'admin.

**Cosa può fare** (permessi base, configurabili dal medico):
- Visualizzare l'agenda completa del medico (sempre, inclusa emergenza)
- Approvare, rifiutare o spostare qualsiasi prenotazione
- Visualizzare la coda delle richieste speciali
- Approvare o rifiutare richieste speciali (con motivazione obbligatoria per rifiuto)
- Inviare broadcast ai pazienti prenotati in un dato giorno
- Esportare PDF dell'agenda giornaliera/settimanale
- Visualizzare dati anagrafici base del paziente (nome, cognome, telefono)

**Permessi opzionali (configurati dal medico)**:
- Accesso ai motivi delle visite nelle prenotazioni
- Accesso ai form delle richieste speciali (testo dei sintomi, note)
- Invio di messaggi individuali ai pazienti

**Cosa NON può fare**:
- Accedere ai dati clinici del paziente
- Modificare la configurazione dell'agenda (orari, durate slot, ferie)
- Creare o eliminare account paziente
- Accedere al pannello di configurazione dello studio
- Vedere dati di altri studi

---

### 👨‍⚕️ MEDICO (`role: doctor`)

**Chi è**: il professionista medico titolare dell'agenda.

**Cosa può fare**:
- Tutto quello che può fare il segretario
- Visualizzare i form completi delle richieste speciali (inclusi dati clinici)
- Completare richieste speciali (marcarle come evase)
- Configurare la propria agenda (orari apertura, durate slot per tipologia, ferie)
- Configurare i permessi del segretario
- Creare e disattivare account segretario
- Inviare notifiche individuali ai pazienti
- Accedere al pannello di configurazione dello studio
- Usare il codice di emergenza in caso di lock-out

---

### 🔧 ADMIN (`role: admin`)

**Chi è**: ruolo interno di sistema. Non visibile ai pazienti. Usato per la gestione tecnica dello studio.

**Cosa può fare**:
- Tutto
- Creare account medico
- Configurare il tenant dello studio (nome, indirizzo, contatti)
- Accedere ai log di sistema
- Eseguire backup e restore
- Gestire il codice di emergenza

---

## Matrice Permessi Completa

| Risorsa / Azione | Paziente | Staff | Medico | Admin |
|-----------------|---------|-------|--------|-------|
| Proprie prenotazioni — Crea | ✅ | ✅ | ✅ | ✅ |
| Proprie prenotazioni — Leggi | ✅ | ✅ | ✅ | ✅ |
| Tutte le prenotazioni — Leggi | ❌ | ✅ | ✅ | ✅ |
| Prenotazioni — Sposta/Rifiuta | ❌ | ✅ | ✅ | ✅ |
| Richieste speciali — Invia | ✅ | ❌ | ❌ | ❌ |
| Richieste speciali — Visualizza (proprie) | ✅ | ✅ | ✅ | ✅ |
| Richieste speciali — Gestisci (tutte) | ❌ | ✅ | ✅ | ✅ |
| Richieste speciali — Dati clinici | ❌ | ⚙️ | ✅ | ✅ |
| Profilo paziente — Leggi (proprio) | ✅ | ✅ | ✅ | ✅ |
| Profilo paziente — Leggi (altrui) | ❌ | ✅ (base) | ✅ | ✅ |
| Agenda — Configura | ❌ | ❌ | ✅ | ✅ |
| Agenda — Visualizza | ❌ | ✅ | ✅ | ✅ |
| Broadcast — Invia | ❌ | ✅ | ✅ | ✅ |
| Permessi Staff — Configura | ❌ | ❌ | ✅ | ✅ |
| Account Staff — Crea/Disattiva | ❌ | ❌ | ✅ | ✅ |
| Export PDF | ❌ | ✅ | ✅ | ✅ |
| Log di sistema | ❌ | ❌ | ❌ | ✅ |
| Configurazione Studio | ❌ | ❌ | ❌ | ✅ |

> ⚙️ = configurabile dal medico (permesso opzionale per il ruolo Staff)

---

## Implementazione Tecnica

### JWT Claims
```json
{
  "sub": "user-uuid",
  "role": "staff",
  "studio_id": "studio-uuid",
  "doctor_id": "doctor-uuid",
  "staff_permissions": ["view_requests_detail", "send_individual_messages"],
  "exp": 1234567890
}
```

### Middleware di Autorizzazione
- Ogni endpoint API ha un decorator/guard con il ruolo minimo richiesto
- I permessi staff opzionali vengono verificati a livello di business logic
- Il `studio_id` è sempre verificato per prevenire accessi cross-tenant

---

*Vedere anche:*
- [[areas/architettura/decisioni-architetturali#ADR-003]]
- [[areas/sicurezza/privacy-gdpr]]
- [[areas/sicurezza/accesso-emergenza]]
