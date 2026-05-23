# ItaliaConsapevole

Sito statico italiano per raccogliere dichiarazioni, partiti e politici con una navigazione moderna, supporto tema scuro/chiaro e un pannello mobile a fondo schermo.

## Pagine principali

- `index.html` - Homepage con le ultime dichiarazioni dei politici.
- `partiti.html` - Elenco dei partiti divisi per coalizione.
- `politici.html` - Elenco dei politici con ruoli e dichiarazioni.
- `il-progetto.html` - Pagina dedicata al progetto con descrizione editabile localmente, link al repository GitHub e collegamento a Wikipedia.

## Funzionalità aggiunte

- Slider del tema scuro/chiaro per cambiare l'aspetto dell'intero sito.
- Tema automatico che segue le preferenze del browser / del sistema operativo.
- Barra di navigazione mobile fissa in fondo, ispirata allo stile del Google Play Store.
- Pagina `il-progetto.html` con contenuto e link a GitHub/Wikipedia gestiti dal file `data/project.json` nella repository.
- Sitemap aggiornata per includere la nuova pagina.

## Struttura dei file

- `style.css` - Stili condivisi per il sito, inclusa la gestione del tema e del menu mobile.
- `js/theme.js` - Script per la modalità chiaro/scuro e l'aggiornamento del colore della barra del browser.
- `js/progetto.js` - Script per gestire l'editor della descrizione del progetto nella pagina `il-progetto.html`.
