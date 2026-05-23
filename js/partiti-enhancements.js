(function(){
    const githubBase = 'https://raw.githubusercontent.com/ItaliaConsapevole/html/main/data/';
    const urlBase = 'data/';
    function normalizeString(value){
        return (value||'').toString().toLowerCase().trim().replace(/\s+/g,' ');
    }
    function slug(value){
        return (value||'').toString().toLowerCase().trim()
            .normalize('NFD').replace(/\p{Diacritic}/gu,'')
            .replace(/[^a-z0-9]+/gi,'-').replace(/^-+|-+$/g,'');
    }

    function partyLogoFilename(name) {
        if (!name) return '';
        const cleaned = name
            .replace(/\+/g, 'Piu')
            .normalize('NFD').replace(/\p{Diacritic}/gu, '')
            .replace(/[^\w\s]/g, '')
            .trim()
            .replace(/\s+/g, '_');
        return `img/partiti/${cleaned}.jpg`;
    }

    async function loadJSON(path){
        try{
            const remote = await fetch(githubBase + path);
            if(remote.ok) return await remote.json();
        }catch(e){ /* ignore remote fetch errors */ }
        try{
            const local = await fetch(urlBase + path);
            if(local.ok) return await local.json();
        }catch(e){ /* ignore local fetch errors */ }
        return [];
    }

    async function enhanceParties(attemptsLeft=10){
        const images = await loadJSON('images.json');
        const politicians = await loadJSON('politici.json');
        const partiesImages = (images && images.parties) || {};
        const poliEntries = Array.isArray(politicians) ? politicians.slice(1) : [];
        const byParty = poliEntries.reduce((acc,p)=>{
            const party = p.partito || 'Partito sconosciuto';
            acc[party] = acc[party] || {};
            const fn = p.funzione || 'Membro';
            acc[party][fn] = acc[party][fn] || [];
            acc[party][fn].push(p.nome);
            return acc;
        },{});

        const partyCards = document.querySelectorAll('.party-card');
        if(!partyCards.length){
            if(attemptsLeft>0){ setTimeout(()=>enhanceParties(attemptsLeft-1),300); }
            return;
        }

        partyCards.forEach(card => {
            try{
                // find party name from h2 .nome a or h2 text
                const nameAnchor = card.querySelector('h2.nome a') || card.querySelector('h2.nome');
                const partyName = nameAnchor ? nameAnchor.textContent.trim() : (card.getAttribute('data-party')||'');
                // find best image key
                const pnorm = normalizeString(partyName);
                const keys = Object.keys(partiesImages||{});
                const partyKey = keys.find(k => pnorm.includes(k) || k.includes(pnorm));
                const meta = (partyKey && partiesImages[partyKey]) || partiesImages[pnorm] || {};
                const logo = meta.logo || partyLogoFilename(partyName);
                const color = meta.color || '';
                const img = card.querySelector('img.party-logo');
                if(img){
                    img.src = logo;
                    img.alt = `Logo ${partyName}`;
                    if(color) img.style.border = `2px solid ${color}`;
                }

                // attach contratto dropdown if not present
                if(!card.querySelector('details.contratto-default')){
                    const funcs = byParty[partyName] || {};
                    const details = document.createElement('details');
                    details.className = 'contratto-default';
                    const summary = document.createElement('summary');
                    summary.textContent = 'Membri';
                    details.appendChild(summary);
                    const container = document.createElement('div');
                    container.className = 'contratto-functions';
                    Object.keys(funcs).sort().forEach(fn => {
                        const h = document.createElement('h4'); h.textContent = fn; container.appendChild(h);
                        const ul = document.createElement('ul');
                        funcs[fn].forEach(name => {
                            const li = document.createElement('li');
                            const link = document.createElement('a');
                            link.href = `politici.html#${slug(name)}`;
                            link.textContent = name;
                            link.className = 'member-link';
                            li.appendChild(link);
                            ul.appendChild(li);
                        });
                        container.appendChild(ul);
                    });
                    details.appendChild(container);
                    // append to bottom of card
                    card.appendChild(details);
                }
            }catch(e){ /* ignore per-card errors */ }
        });
    }

    document.addEventListener('DOMContentLoaded', ()=> enhanceParties(12));
})();
