let index = [];
let politici = [];
const url = "https://raw.githubusercontent.com/ItaliaConsapevole/html/main/data/";

Promise.all([
    fetch(url + "index.json").then(r => r.ok ? r.json() : []).catch(() => []),
    fetch(url + "politici.json").then(r => r.ok ? r.json() : []).catch(() => [])
])
    .then(([indexData, politiciData]) => {
        index = indexData;
        politici = politiciData;
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
        // find politician info from politici.json (skip first element if present)
        const poliEntries = Array.isArray(politici) ? politici.slice(1) : [];
        const poli = poliEntries.find(p => p.nome === item.nome) || {};
        const ruolo = poli.ruolo || '';
        const funzione = poli.funzione || '';
        const partito = poli.partito || '';
        let roleLine = '';
        if (ruolo || funzione || partito) {
            const partyLink = partito ? `<a class="party-link" href="partiti.html#${slug(partito)}">${partito}</a>` : '';
            roleLine = `<div class="role-function">${ruolo}${ruolo && funzione ? ' e ' : ''}${funzione}${(ruolo||funzione) && partyLink ? ' di ' : ''}${partyLink}</div>`;
        }

        HTML += `
            <article class="source-card">
                <p class="messaggio">${item.messaggio}</p>
                <div class="declaration-meta">
                    <span class="nome"><a class="politician-link" href="${politicianLink}">${item.nome}</a></span>
                    <span class="data">${giorno} ${mese} ${anno}</span>
                    ${roleLine}
                </div>
            </article>`;
    });

    HTML += '</div>';
    document.getElementById('content').innerHTML = HTML;
}