---
tags: [#area/dominio, #stato/approvato, #priorità/alta]
created: 2026-09-09
updated: 2026-09-09
---

# Requisiti Funzionali — Studio Medico App

> Documento di riferimento per tutti i requisiti funzionali del sistema.
> Derivato dal caso di studio del 2026-09-09.

## Indice
- [[#Tipologia Studio]]
- [[#Ruoli del Sistema]]
- [[#Modulo Prenotazioni]]
- [[#Modulo Richieste Speciali]]
- [[#Modulo Notifiche]]
- [[#Vincoli di Business]]

---

## Tipologia Studio

| Attributo | Valore |
|-----------|--------|
| Tipo attuale | Monoprofessionale (un medico di medicina generale) |
| Scalabilità prevista | Multiprofessionale (più MMG, stesso studio) |
| Architettura target | Multi-tenant ready sin dall'inizio |

> [!IMPORTANT]
> L'architettura DEVE supportare più medici fin dal primo rilascio, anche se il primo deploy sarà con un singolo medico. Questo impatta il modello dati: ogni entità (prenotazione, paziente, richiesta) deve avere un riferimento al medico curante.

---

## Ruoli del Sistema

### PAZIENTE
- Si registra scegliendo il proprio medico curante
- Accede alla propria dashboard personale
- Prenota appuntamenti con il proprio medico
- Invia richieste speciali (malattia, certificati, medicinali)
- Riceve notifiche SMS e/o push
- NON può prenotare per conto di altri

### MEDICO
- Visualizza la propria agenda giornaliera/settimanale
- Vede tutte le richieste speciali in coda (ordine di arrivo)
- Marca richieste come completate o rifiutate
- Può modificare la durata degli slot nel proprio calendario
- Ha accesso di emergenza tramite account di recovery

### SEGRETARIO/ASSISTENTE
- Gestisce le prenotazioni per conto del medico
- Può rifiutare, spostare, approvare prenotazioni
- Può rifiutare richieste speciali
- Invia broadcast ai pazienti prenotati in un dato giorno
- NON ha accesso ai dati clinici del paziente
- Ha permessi configurabili dal medico

### ADMIN (interno, non visibile al paziente)
- Account di recovery e gestione studio
- Configurazione dello studio (orari, durate, medici)
- Esportazione/archiviazione dati

---

## Modulo Prenotazioni

### Tipologie di Slot

| Tipo Visita | Durata | Note |
|-------------|--------|------|
| Visita breve | 10 min | Per follow-up, rinnovi rapidi |
| Visita standard | 20 min | Default |
| Visita lunga | 30 min | Per nuovi problemi complessi |

La durata è configurabile dal medico per tipologia di visita. La tipologia viene selezionata dal paziente al momento della prenotazione.

### Motivi di Visita (Menu a Tendina)

Da definire con il medico. Categorie iniziali proposte:
- Visita di controllo
- Primo accesso / nuova problematica
- Follow-up esami/referti
- Rinnovo prescrizione (richiede visita)
- Certificato medico sportivo
- Altro (con descrizione obbligatoria)

### Flusso di Prenotazione (Carrello con Lock Temporaneo)

```
1. Paziente seleziona il giorno dal calendario
2. Sistema mostra slot disponibili per quel giorno
3. Paziente seleziona uno slot → slot viene BLOCCATO per 10 minuti
4. Paziente compila il form:
   - Tipologia visita (dropdown)
   - Motivo dettagliato (textarea, max 300 caratteri)
5. Paziente conferma → prenotazione CONFERMATA
6. Se il paziente abbandona dopo 10 min → slot torna DISPONIBILE
```

> [!CAUTION]
> Il lock temporaneo dello slot (step 3) è critico per evitare la doppia prenotazione. Deve essere implementato con un meccanismo transazionale lato server, non solo lato client.

### Regole di Business per le Prenotazioni

- Max 2 prenotazioni attive per paziente in un giorno
- Max 1 prenotazione per stesso slot (ovvio ma da garantire a livello DB)
- Il paziente può cancellare fino a X ore prima (da definire con il medico)
- Il segretario può spostare/rifiutare/approvare qualsiasi prenotazione
- Il medico può chiudere l'agenda con almeno 30 giorni di preavviso
- In caso di chiusura improvvisa (emergenza), il segretario invia broadcast ai pazienti del giorno

### Gestione Ferie / Chiusure

- Il medico configura i giorni di chiusura nel pannello admin
- Con 30+ giorni di preavviso: sistema invia notifica automatica ai pazienti già prenotati
- Con meno di 30 giorni: obbligatorio contatto diretto (broadcast + telefono)
- I pazienti prenotati in giorni chiusi vengono automaticamente notificati e la prenotazione sospesa

---

## Modulo Richieste Speciali

### 1. Richiesta Malattia

**Form di compilazione:**
- Sintomatologia (checkbox multiple + campo libero)
- Data inizio sintomi
- Data prevista fine malattia
- Note aggiuntive
- Conferma dati anagrafici (pre-compilati dal profilo)

**Flusso:**
- Paziente invia → richiesta in coda al segretario/medico
- Il medico/segretario può: approvare, rifiutare (con motivazione), o richiedere visita
- Alla completazione: notifica al paziente + istruzioni per ritiro (se cartaceo)

### 2. Richiesta Certificati Medici

**Tipologie:**
- Certificato di buona salute
- Certificato per attività sportiva
- Certificato per uso scolastico/lavorativo
- Altro (campo libero)

**Flusso:**
- Identico a richiesta malattia
- ⚠️ Se il certificato richiede esame fisico: il medico rifiuta la richiesta e invita il paziente a prenotare una visita

### 3. Richiesta Medicinali / Prescrizioni

**Form di compilazione:**
- Medicinale richiesto (campo testo + eventuale autocomplete)
- Quantità/dosaggio (campo libero)
- Motivazione (è per terapia cronica? Sì/No)
- Note

**Tipologie di output:**
| Tipo Ricetta | Ritiro | Modalità |
|-------------|--------|---------|
| Ricetta dematerializzata (SSN) | Diretta in farmacia | Inviata come PDF all'app |
| Ricetta bianca | Ritiro obbligatorio in studio | Notifica per ritiro |
| Ricetta rossa | Ritiro obbligatorio in studio | Notifica per ritiro |

> [!CAUTION]
> **Farmaci stupefacenti e sostanze controllate**: il sistema NON gestisce richieste per farmaci di classe A/stupefacenti. Se il medico identifica una richiesta di questo tipo, la rifiuta con nota obbligatoria e invita alla visita. Valutare aggiunta di flag visibile nel form.

---

## Modulo Notifiche

### Canali Disponibili
- **SMS**: per promemoria appuntamenti, notifiche completamento richieste
- **Push Notification** (app mobile): per tutte le comunicazioni
- La scelta del canale è configurabile dal paziente nelle preferenze

### Trigger di Notifica

| Evento | Destinatario | Canale |
|--------|-------------|--------|
| Prenotazione confermata | Paziente | Push + SMS opzionale |
| Promemoria appuntamento | Paziente | SMS/Push (intervallo scelto dall'utente) |
| Prenotazione spostata/rifiutata | Paziente | Push + SMS |
| Richiesta speciale completata | Paziente | Push + SMS |
| Richiesta speciale rifiutata | Paziente | Push + SMS |
| Broadcast di chiusura | Tutti i pazienti del giorno | SMS + Push |
| Slot liberato (cancellazione) | N/A (no waiting list per ora) | — |
| Reminder a medico/segretario | Staff | Push (pannello web) |

### Configurazione Promemoria

Il paziente sceglie quando ricevere il promemoria:
- 24 ore prima
- 2 ore prima
- 30 minuti prima
- Combinazione multipla

---

## Vincoli di Business

1. **Singolo medico curante**: il paziente è associato a un solo medico. Non può prenotare con altri medici dello stesso studio (futuro: da valutare con il cliente).
2. **No prenotazioni per terzi**: tecnicamente impossibile prenotare per un altro paziente dall'app.
3. **Archiviazione**: tutti i dati (prenotazioni, richieste, broadcast) devono essere esportabili in PDF.
4. **Accesso di emergenza medico**: esiste un account di recovery con credenziali fisiche in studio (vedi [[areas/sicurezza/accesso-emergenza]]).
5. **No farmaci controllati via app**: esplicito nel form e nel flusso di rifiuto.

---

*Vedere anche:*
- [[areas/architettura/overview]]
- [[areas/ruoli/ruoli-permessi]]
- [[areas/notifiche/sistema-notifiche]]
- [[areas/sicurezza/privacy-gdpr]]
