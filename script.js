let sources=[];
let politici=[];
let partiti=[];
const url = "https://raw.githubusercontent.com/ItaliaConsapevole/html/main/data/";

fetch(url+"sources.json")
  .then(response => response.json())
  .then(data => {
    sources = data;
    renderSources();
  })
  .catch(err => console.error("Errore:", err));
fetch(url+"politici.json")
    .then(response => response.json())
    .then(data => {
        politici = data;
    });
fetch(url+"partiti.json")
    .then(response => response.json())
    .then(data => {
        partiti = data;
    });

function renderSources() {// Funzione per renderizzare le fonti in dalla data più recente alla più vecchia
    if (!Array.isArray(sources) || sources.length <= 1) {
        document.getElementById('content').innerHTML = '';
        return;
    }
    //riordino le fonti per data decrescente dall idice 1 in poi, il primo elemento è un template
    sorted=sources.slice(1).sort((a, b) => new Date(b.data) - new Date(a.data));
    let HTML = "";
    for (let i = 1; i < sources.length; i++) {
        HTML += "<button type='button' class='source-card'><span class='nome'>" + sources[i].nome + "</span><span class='messaggio'>" + sources[i].messaggio + "</span><span class='data'>" + sources[i].data + "</span></button>";
    }
    document.getElementById('content').innerHTML = HTML;
}