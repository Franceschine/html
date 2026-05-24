const PROJECT_JSON_URL = 'https://raw.githubusercontent.com/ItaliaConsapevole/html/main/data/project.json';
const DEFAULT_PROJECT_DATA = {
  description: 'ItaliaConsapevole è un progetto web pensato per rendere più accessibili le dichiarazioni, i partiti e i politici italiani.',
  github: 'https://github.com/ItaliaConsapevole/html',
  wikipedia: 'https://it.wikipedia.org/wiki/Politica_italiana'
};// Array globali che conterranno i dati grezzi (incluso il numero iniziale)
window.partiti = [];
window.politici = [];
window.datiPronti = false;

// La tua funzione originale (perfetta per scaricare i file)
function remoteJSON(filename) {
    return fetch(`https://raw.githubusercontent.com/ItaliaConsapevole/html/main/data/${filename}`)
        .then(response => response.ok ? response.json() : [])
        .catch(() => ([])); // Ritorna un array vuoto in caso di errore
}

// Carichiamo contemporaneamente entrambi i file usando la tua logica
Promise.all([
    remoteJSON("partiti.json"),
    remoteJSON("politici.json")
])
.then(([partitiData, politiciData]) => {
    window.partiti = partitiData || [];
    window.politici = politiciData || [];
    window.datiPronti = true;
    console.log("Dati caricati correttamente con remoteJSON!", { 
        elementiPartiti: window.partiti.length, 
        elementiPolitici: window.politici.length 
    });
})
.catch(err => console.error("Errore nel caricamento degli archivi:", err));

function loadProjectDescription() {
  const descriptionElement = document.getElementById('project-description');
  if (!descriptionElement) return;
  fetch(PROJECT_JSON_URL)
    .then(response => {
      if (!response.ok) throw new Error('Impossibile caricare la descrizione.');
      return response.json();
    })
    .then(data => {
      descriptionElement.textContent = data.description || DEFAULT_PROJECT_DATA.description;
      renderProjectLinks(data);
    })
    .catch(() => {
      descriptionElement.textContent = DEFAULT_PROJECT_DATA.description;
      renderProjectLinks(DEFAULT_PROJECT_DATA);
    });
}
function mostraCasella() {
            document.getElementById('areaInserimento').style.display = 'block';
        }

        // Funzione per inviare il dato al server
        async function salvaContributo() {
            const inputTesto = document.getElementById('testoContributo');
            const valoreContributo = inputTesto.value.trim();

            // Validazione minima
            if (valoreContributo === "") {
                alert("Per favore, inserisci un testo valido.");
                return;
            }

            try {
                // Inviamo il contributo al server (cambia l'URL in base al tuo backend, es: 'salva.php')
                const response = await fetch('/api/salva-contributo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ contributo: valoreContributo })
                });

                if (response.ok) {
                    alert("Contributo salvato con successo!");
                    inputTesto.value = ""; // Svuota la casella
                    document.getElementById('areaInserimento').style.display = 'none'; // La nasconde di nuovo
                } else {
                    alert("Errore durante il salvataggio sul server.");
                }
            } catch (error) {
                console.error("Errore di connessione:", error);
                alert("Impossibile connettersi al server.");
            }
        }
function mostraScelta() {
    document.getElementById('tipoAggiunta').style.display = 'inline-block';
}

function gestisciForm() {
    const scelta = document.getElementById('tipoAggiunta').value;
    
    // Nasconde tutti i form
    document.getElementById('form-partito').style.display = 'none';
    document.getElementById('form-politico').style.display = 'none';
    document.getElementById('form-dichiarazione').style.display = 'none';

    if (scelta === 'partito') {
        document.getElementById('form-partito').style.display = 'block';
    } 
    else if (scelta === 'politico') {
        document.getElementById('form-politico').style.display = 'block';
        // Passiamo l'array dei partiti e gli diciamo di cercare la chiave "partito"
        popolaMenuA_Discesa(window.partiti, 'pol_partito', 'partito');
    } 
    else if (scelta === 'dichiarazione') {
        document.getElementById('form-dichiarazione').style.display = 'block';
        // Passiamo l'array dei politici e gli diciamo di cercare la chiave "nome"
        popolaMenuA_Discesa(window.politici, 'd_nome', 'nome');
    }
}

// Funzione che riempie il <select> escludendo i numeri e i duplicati
function popolaMenuA_Discesa(arrayGrezzo, selectId, campoChiave) {
    const selectElement = document.getElementById(selectId);
    
    if (!window.datiPronti || arrayGrezzo.length === 0) {
        selectElement.innerHTML = '<option value="">Dati in caricamento...</option>';
        return;
    }

    selectElement.innerHTML = '<option value="">-- Seleziona --</option>';
    
    // Usiamo un Set per evitare che lo stesso partito/politico compaia più volte
    let opzioniUniche = new Set();

    arrayGrezzo.forEach(item => {
        // SICUREZZA: Controlla che l'elemento sia un oggetto {} e non il numero della lunghezza iniziale
        if (item && typeof item === 'object' && item[campoChiave]) {
            opzioniUniche.add(item[campoChiave].trim());
        }
    });

    // Ordiniamo i nomi alfabeticamente per comodità dell'utente e li inseriamo nel menu
    Array.from(opzioniUniche).sort().forEach(valore => {
        const option = document.createElement('option');
        option.value = valore;
        option.textContent = valore;
        selectElement.appendChild(option);
    });
}

// Funzione di salvataggio sul server (Invariata)
async function salvaSulServer(tipo) {
    let payload = { tipo_elemento: tipo };

    if (tipo === 'partito') {
        payload.coalizione = document.getElementById('p_coalizione').value;
        payload.orientamento = document.getElementById('p_orientamento').value;
        payload.leader = document.getElementById('p_leader').value;
        payload.partito = document.getElementById('p_partito').value;
        payload.affiliazione = document.getElementById('p_affiliazione').value;
        payload.descrizione = document.getElementById('p_descrizione').value;
    } 
    else if (tipo === 'politico') {
        payload.nome = document.getElementById('pol_nome').value;
        payload.partito = document.getElementById('pol_partito').value;
        payload.ruolo = document.getElementById('pol_ruolo').value;
        payload.funzione = document.getElementById('pol_funzione').value;
        payload.orientamento = document.getElementById('pol_orientamento').value;
    } 
    else if (tipo === 'dichiarazione') {
        payload.data = document.getElementById('d_data').value;
        payload.nome = document.getElementById('d_nome').value;
        payload.messaggio = document.getElementById('d_messaggio').value;
    }

    try {
        const response = await fetch('/api/salva-add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert(`${tipo.toUpperCase()} salvato con successo!`);
            document.getElementById(`form-${tipo}`).reset();
        } else {
            alert("Errore nel salvataggio sul server.");
        }
    } catch (error) {
        console.error(error);
        alert("Errore di connessione col server.");
    }
}