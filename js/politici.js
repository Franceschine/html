let index=[];
let politici=[];
let partiti=[];
const url = "https://raw.githubusercontent.com/ItaliaConsapevole/html/main/data/";
fetch(url+"index.json")
  .then(response => response.json())
  .then(data => {
    index = data;
  })
  .catch(err => console.error("Errore:", err));
fetch(url+"politici.json")
    .then(response => response.json())
    .then(data => {
        politici = data;
        renderPolitici();
    });
fetch(url+"partiti.json")
    .then(response => response.json())
    .then(data => {
        partiti = data;
    });
//render politici in ordine alfabeticoico
function renderPolitici() {
    if (!Array.isArray(politici) || politici.length <= 1) {
        document.getElementById('content').innerHTML = '';
        return;
    }
    sorted=politici.slice(1).sort((a, b) => a.nome.localeCompare(b.nome));
    let HTML = "";
    for (let i = 1; i < politici.length; i++) {
        HTML += "<button type='button' class='source-card'><span class='nome'>" + sorted[i-1].nome + "</span><span class='partito'>" + sorted[i-1].partito + "</span><span class='ruolo'>" + sorted[i-1].ruolo + "</span></button>";
    }
    document.getElementById('content').innerHTML = HTML;
}