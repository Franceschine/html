let index = [];
const url = "https://raw.githubusercontent.com/ItaliaConsapevole/html/main/data/";

fetch(url + "index.json")
  .then(response => response.json())
  .then(data => {
    index = data;
    renderIndex();
  })
  .catch(err => console.error("Errore:", err));

function slug(value) {
    return value.toString().toLowerCase().trim()
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function renderIndex() {
    if (!Array.isArray(index) || index.length <= 1) {
        document.getElementById('content').innerHTML = '';
        return;
    }
    const sorted = index.slice(1).sort((a, b) => new Date(b.data) - new Date(a.data));
    const mesi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
    let HTML = '<div class="cards-grid">';
    sorted.forEach(item => {
        const data = new Date(item.data);
        const giorno = data.getDate();
        const mese = mesi[data.getMonth()];
        const anno = data.getFullYear();

        const politicianLink = `politici.html#${slug(item.nome)}`;
        HTML += `
            <article class="source-card">
                <p class="messaggio">${item.messaggio}</p>
                <div class="declaration-meta">
                    <span class="nome"><a class="politician-link" href="${politicianLink}">${item.nome}</a></span>
                    <span class="data">${giorno} ${mese} ${anno}</span>
                </div>
            </article>`;
    });

    HTML += '</div>';
    document.getElementById('content').innerHTML = HTML;
}