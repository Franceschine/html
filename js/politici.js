let politici = [];
let dichiarazioni = [];
let partitoAffiliazioni = {};
const url = "https://raw.githubusercontent.com/ItaliaConsapevole/html/main/data/";

function normalizeString(value) {
    return value.toString().toLowerCase().trim().replace(/\s+/g, ' ');
}

function getAffiliationForParty(name) {
    const normalized = normalizeString(name);
    if (partitoAffiliazioni[normalized]) return partitoAffiliazioni[normalized];
    return Object.keys(partitoAffiliazioni).find(key => normalized.includes(key) || key.includes(normalized)) ? partitoAffiliazioni[Object.keys(partitoAffiliazioni).find(key => normalized.includes(key) || key.includes(normalized))] : '';
}

Promise.all([
    fetch(url + "politici.json").then(response => response.json()),
    fetch(url + "index.json").then(response => response.json()),
    fetch(url + "partiti.json").then(response => response.json())
])
    .then(([politiciData, dichiarazioniData, partitiData]) => {
        politici = politiciData;
        dichiarazioni = dichiarazioniData;
        const partitiEntries = Array.isArray(partitiData) ? partitiData.slice(1) : [];
        partitoAffiliazioni = partitiEntries.reduce((acc, item) => {
            acc[normalizeString(item.partito)] = item.affiliazione || '';
            return acc;
        }, {});
        renderPolitici();
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

function renderPolitici() {
    if (!Array.isArray(politici) || politici.length <= 1) {
        document.getElementById('content').innerHTML = '';
        return;
    }

    const entries = politici.slice(1);
    const declarationsByPolitician = (Array.isArray(dichiarazioni) ? dichiarazioni.slice(1) : []).reduce((acc, item) => {
        const name = item.nome || '';
        if (!acc[name]) acc[name] = [];
        acc[name].push(item);
        return acc;
    }, {});

    const grouped = entries.reduce((acc, politico) => {
        const partito = politico.partito || 'Partito sconosciuto';
        if (!acc[partito]) acc[partito] = [];
        acc[partito].push(politico);
        return acc;
    }, {});

    const sortedPartiti = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
    let HTML = '';

    sortedPartiti.forEach(partito => {
        const members = grouped[partito].sort((a, b) => a.nome.localeCompare(b.nome));
        HTML += `<section class="party-group"><details class="party-box" open>
                    <summary class="party-summary"><a class="party-link" href="partiti.html#${slug(partito)}">${partito}</a></summary>
                    <div class="party-members">`;

        members.forEach(politico => {
            const declarations = declarationsByPolitician[politico.nome] || [];
            const declarationItems = declarations.length
                ? declarations.map(entry => `<li><strong>${entry.data}</strong>: ${entry.messaggio}</li>`).join('')
                : '<li>Nessuna dichiarazione disponibile.</li>';
            const partitoLink = `partiti.html#${slug(politico.partito || 'partito')}`;
            HTML += `
                <article class="source-card" id="${slug(politico.nome)}">
                    <span class="nome">${politico.nome}</span>
                    <span class="role">${politico.ruolo}</span>
                    <span class="function">${politico.funzione} di <a class="party-link" href="${partitoLink}">${politico.partito}</a></span>
                    <details class="politico-details">
                        <summary>Dichiarazioni</summary>
                        <ul>${declarationItems}</ul>
                    </details>
                </article>`;
        });

        HTML += `
                    </div>
                 </details></section>`;
    });

    document.getElementById('content').innerHTML = HTML;
    if (typeof window.highlightHashTarget === 'function') {
        window.highlightHashTarget();
    }
}