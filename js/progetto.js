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
