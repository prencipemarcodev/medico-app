# Regole UI/UX per il refactor di una dashboard gestionale
### Documento guida per un agente AI

Questo documento definisce vincoli e principi da rispettare durante il refactor totale di un'applicazione web gestionale. È pensato per essere incollato come contesto/regole fisse per un agente AI (es. in un file `CLAUDE.md`, `RULES.md` o come system prompt di progetto), così che ogni sessione di lavoro parta dagli stessi vincoli invece di reinventare lo stile ogni volta.

È volutamente agnostico rispetto allo stack tecnico. Dove servono valori concreti (font, palette, griglia spaziature) sono proposti come default ragionevoli: vanno adattati se l'app ha già un'identità visiva consolidata da preservare, non reinventata da zero.

---

## 0. Principi non negoziabili

1. **Leggibilità dei dati prima di tutto.** È un gestionale, non un sito marketing: ogni scelta estetica è subordinata alla velocità con cui l'utente trova/legge/modifica un dato.
2. **Coerenza sistemica.** Stesso componente = stesso aspetto ovunque nell'app. Nessuna variazione "artistica" tra una pagina e l'altra.
3. **Ogni elemento visivo ha una funzione informativa**, non decorativa. Se un bordo, un'ombra o un colore non comunicano nulla, si tolgono.
4. **Refactor incrementale**, mai big-bang: una macroarea o un'area alla volta, con verifica funzionale prima di passare oltre.
5. **La logica di business non si tocca** durante un refactor "solo visivo" (fetch, validazioni, permessi, calcoli) salvo richiesta esplicita — vedi sezione 10.

---

## 1. Architettura dell'informazione: macroaree e aree

- **Macroarea** = raggruppamento di primo livello nella navigazione principale (es. "Anagrafica", "Contabilità", "Magazzino", "Report").
- **Area** = sotto-sezione dentro una macroarea (es. dentro "Anagrafica" → "Pazienti", "Medici", "Fornitori").
- Regole:
  - Massimo **5–7 macroaree** nella nav primaria (oltre, l'utente perde overview — se servono di più, raggruppare in un secondo livello).
  - Naming delle macroaree/aree con **i termini che l'utente finale già usa nel suo dominio**, non termini tecnici di sistema (es. "Pazienti", non "Anagrafica Utenti").
  - La navigazione mostra sempre **dove ti trovi**: macroarea attiva evidenziata + breadcrumb per il livello area/dettaglio.
  - Profondità massima: **macroarea → area → dettaglio record** (3 livelli). Se serve un 4° livello, è probabile che l'IA vada ridisegnata, non solo la UI.
  - Sidebar collassabile in icon-only per chi lavora su schermi piccoli o vuole più spazio orizzontale per le tabelle.

---

## 2. Sistema tipografico (caratteri)

- **Massimo 2 famiglie**: una per testo/UI, eventualmente una seconda solo se chiaramente distinta per ruolo (es. una monospace/tabulare per codici o ID, non per estetica).
- **Cifre tabellari**: attivare `font-variant-numeric: tabular-nums` (o font già tabulare) ovunque compaiano numeri in colonna, per allineamento verticale corretto.
- **Scala tipografica** esplicita, non valori a caso sparsi nel codice. Esempio di scala a 8 step (rapporto ~1.2–1.25):

  | Ruolo | Dimensione | Peso | Line-height |
  |---|---|---|---|
  | Micro (badge, caption) | 12px | 500 | 1.3 |
  | Small (label, meta) | 13px | 500 | 1.4 |
  | Body (default) | 14px | 400 | 1.5 |
  | Body large | 16px | 400 | 1.5 |
  | Subtitle | 18px | 500 | 1.4 |
  | Titolo sezione | 20–24px | 600 | 1.3 |
  | Titolo pagina | 28–30px | 600 | 1.2 |

- **Massimo 3 pesi** per famiglia (es. 400 / 500 / 600). Evitare 700 come default: nel 90% dei casi 600 basta per l'enfasi.
- **Da evitare esplicitamente:**
  - Maiuscolo per le label ricorrenti (riduce leggibilità e velocità di lettura).
  - Corsivo per enfasi nella UI (va bene solo per contenuti editoriali, non per un gestionale).
  - Font-size sotto i 12px per qualunque testo funzionale (accessibilità).

---

## 3. Sistema colori

- **~85% della UI resta neutra** (grigi): sfondo, bordi, testo secondario. Il colore si usa per guidare l'attenzione, non per riempire.
- **1 colore primario** per azioni/brand.
- **Colori semantici indipendenti dal primario**, sempre gli stessi ruoli in tutta l'app:
  - Successo → verde
  - Attenzione → giallo/ambra
  - Errore/distruttivo → rosso
  - Informativo → blu
- Il colore **non è mai l'unico segnale**: ogni stato semantico ha anche un'icona o un'etichetta testuale (accessibilità e daltonismo).
- **Contrasto minimo WCAG AA**: 4.5:1 per testo normale, 3:1 per testo grande (≥18px) e icone informative.
- Evitare il nero puro `#000000`: preferire un quasi-nero (es. `#18181B`) meno affaticante su schermo.
- Se l'app ha già un'identità cromatica consolidata (palette esistente, brand aziendale/medico), **va preservata ed estesa**, non sostituita con una palette generica di default.

---

## 4. Griglia, spaziatura, layout

- **Scala di spaziatura** su base 4px: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`. Nessun valore libero fuori scala nel CSS/componenti.
- I gestionali **possono e devono sfruttare la larghezza dello schermo** per le viste tabellari: niente container centrato stretto (tipo 960px) come su un sito marketing. Full-width con padding laterale coerente.
- **Densità configurabile** quando possibile: modalità "comoda" vs "compatta" per power user che lavorano tutto il giorno sulla stessa vista.
- Allineamento coerente: testo a sinistra, valori numerici/valute a destra, colonna azioni a destra.

---

## 5. Tabelle — il componente critico di un gestionale

Le tabelle sono dove si gioca la qualità percepita di un gestionale. Regole puntuali:

- **Header sticky** durante lo scroll verticale della tabella.
- **Allineamento per tipo di dato**: testo → sinistra, numeri/valute → destra, date/stati → coerente in tutta la colonna (mai misto).
- **Zebra striping leggero** (differenza di luminosità 2–3%) solo se la tabella ha tipicamente >8 righe visibili; sotto quella soglia basta un hairline divider tra righe.
- **Hover riga** con evidenziazione leggera, per orientarsi su tabelle dense.
- **Ordinamento**: click sull'header, indicatore di direzione sempre visibile (non solo on-hover).
- **Colonna azioni**: sempre ultima colonna, icone coerenti, **massimo 3 azioni dirette** — oltre, raggruppare in un menu "···".
- **Selezione multipla**: se esistono azioni bulk, checkbox riga + header, con contatore selezione e barra azioni contestuale che appare solo quando serve.
- **Contenuto lungo**: troncamento con ellipsis + tooltip/title, mai wrap che rompe l'altezza riga e l'allineamento verticale.
- **Numeri decimali**: stessa precisione decimale per tutta la colonna, allineati a destra.
- **Stato vuoto**: mai una tabella bianca senza spiegazione. Messaggio chiaro + azione (es. "Nessun risultato con questi filtri" con CTA per resettarli, oppure CTA per creare il primo record se la tabella è vuota in assoluto).
- **Stato di caricamento**: skeleton rows al posto delle righe reali, non uno spinner centrale che fa collassare il layout.
- **Righe > 50–100**: paginazione o virtualizzazione. Mai renderizzare migliaia di righe nel DOM.
- **Filtri e ricerca** sempre visibili sopra la tabella, non nascosti dietro un altro click.
- **Responsive**: sotto una certa larghezza, o si passa a una vista a card, o si mantiene la tabella con scroll orizzontale e prima colonna "pinned" (es. nome/ID paziente sempre visibile).

---

## 6. Componenti standard

- **Bottoni**: gerarchia chiara — primary (uno solo per vista/sezione), secondary, ghost/tertiary, destructive (rosso, sempre con conferma esplicita per azioni irreversibili).
- **Form**: label sempre visibile sopra il campo (mai solo placeholder-come-label). Validazione inline al blur del campo, non solo al submit dell'intero form.
- **Badge/stati**: forma coerente in tutta l'app (pill oppure rounded-rect, non mescolare), colore sempre coerente con la mappa semantica della sezione 3.
- **Modali**: solo per conferme o input brevi. Editing esteso (form lunghi, record complessi) va in pagina o pannello laterale dedicato, non in una modale.
- **Card**: scegliere bordo *o* ombra come segnale di elevazione, non entrambi ovunque con lo stesso raggio di arrotondamento su ogni elemento indipendentemente dalla gerarchia (è il tell tipico del "kit SaaS generico").

---

## 7. Stati e feedback

- Ogni azione asincrona gestisce esplicitamente **3 stati**: loading, successo, errore.
- I messaggi di conferma usano **lo stesso verbo del bottone** cliccato (bottone "Salva" → notifica "Salvato", non "Operazione completata").
- Gli errori sono **specifici e con un'azione di recupero possibile**, mai un generico "Errore" o "Qualcosa è andato storto".

---

## 8. Accessibilità (pavimento minimo, non negoziabile)

- Focus da tastiera sempre visibile (mai `outline: none` senza un sostituto visibile).
- Contrasto AA minimo rispettato ovunque (vedi sezione 3).
- `aria-label` su ogni bottone icona-only senza testo.
- Tab order logico su tutti i componenti interattivi (tabelle, form, menu).
- Rispetto di `prefers-reduced-motion` per animazioni non essenziali.

---

## 9. Responsive e breakpoint

- Breakpoint espliciti e condivisi in tutta l'app, ad es. `640px · 1024px · 1440px`.
- Sidebar che collassa (icon-only o hamburger) sotto 1024px.
- Il mobile non è l'uso primario di un gestionale interno, ma l'app **deve restare utilizzabile**, non rompersi.

---

## 10. Regole operative per l'agente durante il refactor

1. **Un'area/macroarea alla volta.** Non toccare più sezioni contemporaneamente in una stessa sessione di refactor.
2. Prima di modificare una schermata, **mappare la logica esistente** (fetch, validazioni, permessi/ruoli, stati particolari come "bozza" o "disabilitato") e mantenerla intatta: il refactor cambia la presentazione, non il comportamento, salvo istruzione esplicita contraria.
3. **Centralizzare i design token** (colori, spaziature, tipografia, raggi di bordo) in un unico punto (variabili CSS, file di tema, ecc.). Vietati valori hardcoded sparsi nei singoli componenti.
4. **Estrarre i componenti condivisi** (tabella, bottone, badge, modale, form field) come componenti riusabili unici: mai duplicare lo stesso componente con piccole varianti copia-incollate in più pagine.
5. **Verificare dopo ogni area** che stati/permessi/ruoli esistenti restino visivamente distinguibili come prima del refactor (es. un record disabilitato deve continuare a "sembrare" disabilitato).
6. **Documentare le decisioni** non ovvie (es. perché una tabella ha paginazione e un'altra virtualizzazione) in un `DESIGN.md` o `CHANGELOG.md` di progetto, così le scelte restano coerenti anche in sessioni future.
7. Mai rimuovere una funzionalità esistente durante un refactor dichiarato "solo visivo" senza segnalarlo esplicitamente prima di procedere.

---

## 11. Anti-pattern da evitare esplicitamente

Questi sono i "tell" tipici di una UI generata senza direzione precisa — da evitare a meno che non siano già parte dell'identità visiva consolidata dell'app:

- Sfondo panna/crema con accento terracotta "da generatore AI di default".
- Etichette tutto-maiuscolo sopra ogni titolo di sezione ("eyebrow label").
- Stesso raggio di arrotondamento su ogni elemento, indipendentemente dalla sua gerarchia.
- Ombra grigia identica sotto ogni card, usata come decorazione fissa.
- Freccia "→" aggiunta automaticamente a ogni bottone o link.
- Punti medi ("·") per separare metadati in stringhe tipo "A · B · C".
- Icone prese da set/stili diversi mescolati nella stessa interfaccia (stroke-width incoerente).
