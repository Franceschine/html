let politici = [];
let dichiarazioni = [];
let partitoAffiliazioni = {};
let partitoCoalizioni = {};
let imagesByParty = {};
let imagesByPolitician = {};
const url = "https://raw.githubusercontent.com/ItaliaConsapevole/html/main/data/";

function normalizeString(value) {
    return value.toString().toLowerCase().trim().replace(/\s+/g, ' ');
}

function getAffiliationForParty(name) {
    const normalized = normalizeString(name);
    if (partitoAffiliazioni[normalized]) return partitoAffiliazioni[normalized];
    const match = Object.keys(partitoAffiliazioni).find(key => normalized.includes(key) || key.includes(normalized));
    return match ? partitoAffiliazioni[match] : '';
}

function getCoalitionForParty(name) {
    const normalized = normalizeString(name);
    if (partitoCoalizioni[normalized]) return partitoCoalizioni[normalized];
    const match = Object.keys(partitoCoalizioni).find(key => normalized.includes(key) || key.includes(normalized));
    return match ? partitoCoalizioni[match] : 'Indipendente';
}

Promise.all([
    fetch(url + "politici.json").then(response => response.json()),
    fetch(url + "index.json").then(response => response.json()),
    fetch(url + "partiti.json").then(response => response.json()),
    fetch("data/images.json").then(response => response.json()).catch(() => ({}))
])
    .then(([politiciData, dichiarazioniData, partitiData, imagesData]) => {
        politici = politiciData;
        dichiarazioni = dichiarazioniData;
        const partitiEntries = Array.isArray(partitiData) ? partitiData.slice(1) : [];
        partitoAffiliazioni = {};
        partitoCoalizioni = {};
        partitiEntries.forEach(item => {
            const normalized = normalizeString(item.partito || '');
            partitoAffiliazioni[normalized] = item.affiliazione || '';
            partitoCoalizioni[normalized] = item.coalizione || 'Indipendente';
        });

        imagesByParty = (imagesData && imagesData.parties) || {};
        imagesByPolitician = (imagesData && imagesData.politicians) || {};

        renderPolitici();
        const filterInput = document.getElementById('politici-filter');
        if (filterInput) {
            filterInput.addEventListener('input', () => renderPolitici(filterInput.value));
        }
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

function updatePoliticiSummary(count, parties, declarations) {
    const summary = document.getElementById('politici-summary');
    if (!summary) return;
    summary.innerHTML = `
        <span>${count} politici</span>
        <span>${parties} partiti</span>
        <span>${declarations} dichiarazioni</span>
    `;
}

function renderPolitici(filterValue = '') {
    if (!Array.isArray(politici) || politici.length <= 1) {
        document.getElementById('content').innerHTML = '';
        updatePoliticiSummary(0, 0, 0);
        return;
    }

    const entries = politici.slice(1);
    const declarations = Array.isArray(dichiarazioni) ? dichiarazioni.slice(1) : [];
    const declarationsByPolitician = declarations.reduce((acc, item) => {
        const name = item.nome || '';
        if (!acc[name]) acc[name] = [];
        acc[name].push(item);
        return acc;
    }, {});

    const normalizedFilter = normalizeString(filterValue || '');
    const filteredEntries = entries.filter(politico => {
        if (!normalizedFilter) return true;
        const partito = politico.partito || '';
        const affiliation = getAffiliationForParty(partito);
        const coalition = getCoalitionForParty(partito);
        const searchText = normalizeString(`${politico.nome} ${partito} ${politico.ruolo} ${politico.funzione} ${affiliation} ${coalition}`);
        return searchText.includes(normalizedFilter);
    });

    const totalDeclarations = filteredEntries.reduce((sum, politico) => sum + ((declarationsByPolitician[politico.nome] || []).length), 0);
    const uniqueParties = new Set(filteredEntries.map(politico => politico.partito || 'Partito sconosciuto')).size;
    updatePoliticiSummary(filteredEntries.length, uniqueParties, totalDeclarations);

    if (filteredEntries.length === 0) {
        document.getElementById('content').innerHTML = '<article class="source-card"><p class="empty-state">Nessun politico trovato per la ricerca.</p></article>';
        return;
    }

    const grouped = filteredEntries.reduce((acc, politico) => {
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
            const declarationsForPolitico = declarationsByPolitician[politico.nome] || [];
            const declarationItems = declarationsForPolitico.length
                ? declarationsForPolitico.map(entry => `<li><strong>${entry.data}</strong>: ${entry.messaggio}</li>`).join('')
                : '<li>Nessuna dichiarazione disponibile.</li>';
            const affiliation = getAffiliationForParty(politico.partito || '');
            const coalition = getCoalitionForParty(politico.partito || '');
                const partyImage = imagesByParty[normalizeString(politico.partito || '')];
                const personImage = imagesByPolitician[normalizeString(politico.nome || '')];
                const photoSrc = (personImage && personImage.photo) || (partyImage && partyImage.logo) || 'img/default-person.png';

                HTML += `
                    <article class="source-card" id="${slug(politico.nome)}">
                        <div class="person-row">
                            <img class="politician-photo" src="${photoSrc}" alt="${politico.nome}">
                            <div>
                                <span class="nome">${politico.nome}</span>
                                <div class="metadata">
                                    <span class="badge badge-coalition">${coalition}</span>
                                    <span class="badge badge-affiliation">${affiliation || 'Affiliazione non specificata'}</span>
                                </div>
                            </div>
                        </div>
                        <span class="role">${politico.ruolo}</span>
                        <span class="function">${politico.funzione}</span>
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