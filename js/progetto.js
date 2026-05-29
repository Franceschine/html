//deve recuperare le informazioni da un file JSON esterno e visualizzarle nella pagina, con un fallback in caso di errore
const PROJECT_JSON_URL = 'https://raw.githubusercontent.com/ItaliaConsapevole/html/main/data/project.json';
fetch(PROJECT_JSON_URL)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    document.getElementById('project-description').textContent = data.description || DEFAULT_PROJECT_DATA.description;
    const linksContainer = document.getElementById('project-links');
    linksContainer.innerHTML = '';
    if (data.github) {
      const githubLink = document.createElement('a');
      githubLink.href = data.github;
      githubLink.textContent = 'GitHub';
      githubLink.target = '_blank';
      linksContainer.appendChild(githubLink);
    }
    if (data.wikipedia) {//spazio tra i link
        linksContainer.appendChild(document.createTextNode(' | '));
      const wikipediaLink = document.createElement('a');
      wikipediaLink.href = data.wikipedia;
      wikipediaLink.textContent = 'Wikipedia';
      wikipediaLink.target = '_blank';
      linksContainer.appendChild(wikipediaLink);
    }
  })