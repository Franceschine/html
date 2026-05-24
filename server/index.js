const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public')); // Cartella dove tieni il file HTML precedente

const dirPath = path.join(__dirname, 'contrib');
const filePath = path.join(dirPath, 'mod.json');

// Endpoint che riceve la richiesta POST dal JavaScript del browser
app.post('/api/salva-contributo', (req, res) => {
    const nuovoContributo = req.body.contributo;

    // 1. Assicurati che la cartella 'contrib' esista
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    let arrayContributi = [];

    // 2. Se il file esiste già, leggi i vecchi dati
    if (fs.existsSync(filePath)) {
        try {
            const fileData = fs.readFileSync(filePath, 'utf8');
            arrayContributi = JSON.parse(fileData);
            if (!Array.isArray(arrayContributi)) {
                arrayContributi = []; // Sicurezza nel caso il JSON non sia un array
            }
        } catch (e) {
            arrayContributi = []; // Se il file è vuoto o corrotto, resetta a un array vuoto
        }
    }

    // 3. Aggiungi il nuovo contributo all'array
    arrayContributi.push(nuovoContributo);

    // 4. Salva l'array aggiornato nel file JSON (formattato con 2 spazi per leggibilità)
    fs.writeFile(filePath, JSON.stringify(arrayContributi, null, 2), (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Errore di scrittura del file");
        }
        res.status(200).send("Salvato");
    });
});
app.post('/api/salva-add', (req, res) => {
    const nuovoDato = req.body;
    
    const dirPath = path.join(__dirname, 'contrib');
    const filePath = path.join(dirPath, 'add.json');

    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

    let arrayDati = [];
    if (fs.existsSync(filePath)) {
        try {
            const fileData = fs.readFileSync(filePath, 'utf8');
            arrayDati = JSON.parse(fileData);
            if (!Array.isArray(arrayDati)) arrayDati = [];
        } catch (e) { arrayDati = []; }
    }

    arrayDati.push(nuovoDato);

    fs.writeFile(filePath, JSON.stringify(arrayDati, null, 4), (err) => {
        if (err) return res.status(500).send("Errore di scrittura file");
        res.status(200).send("Salvato");
    });
});
app.listen(3000, () => console.log('Server avviato su http://localhost:3000'));
