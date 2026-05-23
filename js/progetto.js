const PROJECT_JSON_URL = 'https://raw.githubusercontent.com/ItaliaConsapevole/html/main/data/project.json';
const DEFAULT_PROJECT_DATA = {
  description: 'ItaliaConsapevole è un progetto web pensato per rendere più accessibili le dichiarazioni, i partiti e i politici italiani.',
  github: 'https://github.com/ItaliaConsapevole/html',
  wikipedia: 'https://it.wikipedia.org/wiki/Politica_italiana'
};

function renderProjectLinks(data) {
  const linksContainer = document.getElementById('project-links');
  if (!linksContainer) return;
  const github = data.github || DEFAULT_PROJECT_DATA.github;
  const wikipedia = data.wikipedia || DEFAULT_PROJECT_DATA.wikipedia;
  linksContainer.innerHTML = `
    <ul>
      <li><a href="${github}" target="_blank" rel="noopener">Repository GitHub</a></li>
      <li><a href="${wikipedia}" target="_blank" rel="noopener">Pagina Wikipedia di riferimento</a></li>
    </ul>
  `;
}

function loadProjectDescription() {
  const descriptionElement = document.getElementById('project-description');
  if (!descriptionElement) return;
  fetch(PROJECT_JSON_URL)
    .then(response => {
      if (!response.ok) throw new Error('Impossibile caricare la descrizione.');
      return response.json();
    })
    .then(data => {
      descriptionElement.textContent = data.description || DEFAULT_PROJECT_DATA.description;
      renderProjectLinks(data);
    })
    .catch(() => {
      descriptionElement.textContent = DEFAULT_PROJECT_DATA.description;
      renderProjectLinks(DEFAULT_PROJECT_DATA);
    });
}

window.addEventListener('DOMContentLoaded', loadProjectDescription);

// --- Anonymous contribution form ---
function createElement(tag, attrs = {}, text) {
  const el = document.createElement(tag);
  Object.keys(attrs).forEach(k => el.setAttribute(k, attrs[k]));
  if (text) el.textContent = text;
  return el;
}

function saveAnonContribution(item) {
  try {
    const key = 'anon-contributions';
    // store locally as a backup
    const store = JSON.parse(localStorage.getItem(key) || '[]');
    const record = { ts: Date.now(), item };
    store.push(record);
    localStorage.setItem(key, JSON.stringify(store));

    // attempt to send to contrib server (default localhost)
    const endpoint = (window.CONTRIB_ENDPOINT || 'http://localhost:3000') + '/contrib';
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    }).then(r => {
      if (!r.ok) console.warn('Contrib server responded with', r.status);
    }).catch(err => {
      // network/server not available — keep local copy
      console.warn('Unable to send contribution to server:', err.message);
    });

    return true;
  } catch (e) { console.error(e); return false; }
}

function clearAnonArea() { const area = document.getElementById('anon-area'); if(area) area.innerHTML = ''; }

function exportContributions() {
  try {
    const key = 'anon-contributions';
    const store = JSON.parse(localStorage.getItem(key) || '[]');
    if (store.length === 0) {
      alert('Nessun contributo da esportare.');
      return;
    }
    const json = JSON.stringify(store, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contributi-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    alert('Errore nell\'esportazione: ' + e.message);
  }
}

function importContributions(file) {
  try {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error('Il file deve contenere un array di contributi.');
      const key = 'anon-contributions';
      const store = JSON.parse(localStorage.getItem(key) || '[]');
      store.push(...data);
      localStorage.setItem(key, JSON.stringify(store));
      alert(`${data.length} contributi importati correttamente. Totale: ${store.length}`);
    };
    reader.readAsText(file);
  } catch (e) {
    alert('Errore nell\'importazione: ' + e.message);
  }
}

function showContributionsManager() {
  clearAnonArea();
  const area = document.getElementById('anon-area');
  const key = 'anon-contributions';
  const store = JSON.parse(localStorage.getItem(key) || '[]');
  
  const container = createElement('div');
  container.innerHTML = `<p><strong>Contributi salvati: ${store.length}</strong></p>`;
  
  const exportBtn = createElement('button', {}, 'Scarica contributi (JSON)');
  exportBtn.addEventListener('click', exportContributions);
  container.appendChild(exportBtn);
  container.appendChild(createElement('br'));
  
  const importLabel = createElement('label', {});
  const importInput = createElement('input', { type: 'file', accept: '.json' });
  importInput.addEventListener('change', (e) => {
    if (e.target.files[0]) importContributions(e.target.files[0]);
  });
  importLabel.appendChild(document.createTextNode('Importa contributi: '));
  importLabel.appendChild(importInput);
  container.appendChild(importLabel);
  container.appendChild(createElement('br'));
  
  if (store.length > 0) {
    const clearBtn = createElement('button', {});
    clearBtn.textContent = 'Cancella tutti i contributi';
    clearBtn.style.color = 'red';
    clearBtn.addEventListener('click', () => {
      if (confirm('Sei sicuro? Questa azione non può essere annullata.')) {
        localStorage.removeItem(key);
        alert('Contributi cancellati.');
        showContributionsManager();
      }
    });
    container.appendChild(clearBtn);
    
    const details = createElement('details');
    const summary = createElement('summary');
    summary.textContent = 'Visualizza dettagli contributi';
    details.appendChild(summary);
    const list = createElement('pre');
    list.textContent = JSON.stringify(store, null, 2);
    list.style.maxHeight = '300px';
    list.style.overflow = 'auto';
    list.style.backgroundColor = '#f5f5f5';
    list.style.padding = '10px';
    list.style.borderRadius = '4px';
    details.appendChild(list);
    container.appendChild(createElement('br'));
    container.appendChild(details);
  }
  
  area.appendChild(container);
}

function showModifyForm() {
  clearAnonArea();
  const area = document.getElementById('anon-area');
  const ta = createElement('textarea', { id: 'anon-text', rows: 6, cols: 60 });
  const submit = createElement('button', { id: 'anon-submit-mod' }, 'Invia modifica (anonima)');
  submit.addEventListener('click', () => {
    const val = ta.value.trim();
    if (!val) return alert('Inserisci un testo prima di inviare.');
    if (saveAnonContribution({ type: 'modifica', text: val })) {
      area.innerHTML = '<p class="success">Modifica inviata (anonima).</p>';
    } else area.innerHTML = '<p class="error">Errore nel salvataggio.</p>';
  });
  area.appendChild(ta);
  area.appendChild(createElement('br'));
  area.appendChild(submit);
}

async function showAddForm() {
  clearAnonArea();
  const area = document.getElementById('anon-area');
  const select = createElement('select', { id: 'anon-type' });
  ['partiti', 'politici', 'dichiarazioni'].forEach(opt => select.appendChild(createElement('option', { value: opt }, opt)));
  const fields = createElement('div', { id: 'anon-fields' });
  area.appendChild(select);
  area.appendChild(fields);

  async function renderFields(type) {
    fields.innerHTML = '';
    if (type === 'partiti') {
      fields.appendChild(createElement('input', { id: 'p-name', placeholder: 'Nome partito' }));
      fields.appendChild(createElement('br'));
      fields.appendChild(createElement('input', { id: 'p-coalizione', placeholder: 'Coalizione' }));
      fields.appendChild(createElement('br'));
      const ta = createElement('textarea', { id: 'p-desc', rows: 4, cols: 60 });
      fields.appendChild(ta);
    } else if (type === 'politici') {
      fields.appendChild(createElement('input', { id: 'pol-nome', placeholder: 'Nome politico' }));
      fields.appendChild(createElement('br'));
      const parties = await fetch('data/partiti.json').then(r=>r.ok?r.json():[]).catch(()=>[]);
      const sel = createElement('select', { id: 'pol-partito' });
      (Array.isArray(parties)?parties.slice(1):[]).forEach(p=> sel.appendChild(createElement('option', { value: p.partito }, p.partito)));
      fields.appendChild(sel);
      fields.appendChild(createElement('br'));
      fields.appendChild(createElement('input', { id: 'pol-ruolo', placeholder: 'Ruolo' }));
      fields.appendChild(createElement('br'));
      fields.appendChild(createElement('input', { id: 'pol-funzione', placeholder: 'Funzione' }));
    } else if (type === 'dichiarazioni') {
      const politici = await fetch('data/politici.json').then(r=>r.ok?r.json():[]).catch(()=>[]);
      const sel = createElement('select', { id: 'dec-nome' });
      (Array.isArray(politici)?politici.slice(1):[]).forEach(p=> sel.appendChild(createElement('option', { value: p.nome }, p.nome)));
      fields.appendChild(sel);
      fields.appendChild(createElement('br'));
      fields.appendChild(createElement('input', { id: 'dec-data', placeholder: 'Data (YYYY-MM-DD)' }));
      fields.appendChild(createElement('br'));
      fields.appendChild(createElement('textarea', { id: 'dec-msg', rows: 4, cols: 60 }));
    }
    const submit = createElement('button', { id: 'anon-submit-add' }, 'Invia (anonimo)');
    submit.addEventListener('click', () => {
      let payload = { type };
      if (type === 'partiti') payload.data = { partito: document.getElementById('p-name').value.trim(), coalizione: document.getElementById('p-coalizione').value.trim(), descrizione: document.getElementById('p-desc').value.trim() };
      if (type === 'politici') payload.data = { nome: document.getElementById('pol-nome').value.trim(), partito: document.getElementById('pol-partito').value, ruolo: document.getElementById('pol-ruolo').value.trim(), funzione: document.getElementById('pol-funzione').value.trim() };
      if (type === 'dichiarazioni') payload.data = { nome: document.getElementById('dec-nome').value, data: document.getElementById('dec-data').value.trim(), messaggio: document.getElementById('dec-msg').value.trim() };
      // basic validation
      if (!payload.data) return alert('Compila i campi richiesti.');
      if (saveAnonContribution(payload)) {
        fields.innerHTML = '<p class="success">Contributo aggiunto (anonimo).</p>';
      } else fields.innerHTML = '<p class="error">Errore nel salvataggio.</p>';
    });
    fields.appendChild(createElement('br'));
    fields.appendChild(submit);
  }

  select.addEventListener('change', e=> renderFields(e.target.value));
  renderFields(select.value);
}

document.addEventListener('DOMContentLoaded', ()=>{
  const btnMod = document.getElementById('anon-modifica');
  const btnAdd = document.getElementById('anon-aggiungi');
  const btnGestisci = document.getElementById('anon-gestisci');
  if (btnMod) btnMod.addEventListener('click', showModifyForm);
  if (btnAdd) btnAdd.addEventListener('click', showAddForm);
  if (btnGestisci) btnGestisci.addEventListener('click', showContributionsManager);
});
