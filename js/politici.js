let politici = [];
let dichiarazioni = [];
const url = "https://raw.githubusercontent.com/ItaliaConsapevole/html/main/data/";

Promise.all([
    fetch(url + "politici.json").then(response => response.json()),
    fetch(url + "index.json").then(response => response.json())
])
    .then(([politiciData, dichiarazioniData]) => {
        politici = politiciData;
        dichiarazioni = dichiarazioniData;
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
        HTML += `<section class="party-group">
                    <h2 class="section-title"><a class="party-link" href="partiti.html#${slug(partito)}">${partito}</a></h2>
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
                    <span class="role">Ruolo: ${politico.ruolo}</span>
                    <span class="function">Funzione: ${politico.funzione}</span>
                    <span class="party-label">Partito: <a class="party-link" href="${partitoLink}">${politico.partito}</a></span>
                    <details class="politico-details">
                        <summary>Dichiarazioni</summary>
                        <ul>${declarationItems}</ul>
                    </details>
                </article>`;
        });

        HTML += `
                    </div>
                 </section>`;
    });

    document.getElementById('content').innerHTML = HTML;
}