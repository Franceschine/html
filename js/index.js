let index=[];
let politici=[];
let partiti=[];
const url = "https://raw.githubusercontent.com/ItaliaConsapevole/html/main/data/";
fetch(url+"index.json")
  .then(response => response.json())
  .then(data => {
    index = data;
    renderIndex();
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

function renderIndex() {
    if (!Array.isArray(index) || index.length <= 1) {
        document.getElementById('content').innerHTML = '';
        return;
    }
    sorted=index.slice(1).sort((a, b) => new Date(b.data) - new Date(a.data));
    let HTML = "";
    //data in formato giorno mese anno
    let mesi=["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
    for (let i = 1; i < index.length; i++) {
        let data = new Date(sorted[i-1].data);
        let giorno = data.getDate();
        let mese = data.getMonth() + 1; //traduci in italiano
        mese = mesi[mese - 1]; //traduci in italiano
        let anno = data.getFullYear();
        HTML += "<button type='button' class='source-card'><span class='nome'>" + sorted[i-1].nome + "</span><span class='messaggio'>" + sorted[i-1].messaggio + "</span><span class='data'>" + giorno + " " + mese + " " + anno + "</span></button>";
    }
    document.getElementById('content').innerHTML = HTML;
}