let index=[];
let politici=[];
let partiti=[];
const url = "https://raw.githubusercontent.com/ItaliaConsapevole/html/main/data/";
fetch(url+"index.json")
  .then(response => response.json())
  .then(data => {
    index = data;
  })
  .catch(err => console.error("Errore:", err));
fetch(url+"politici.json")
    .then(response => response.json())
    .then(data => {
        politici = data;
        renderPolitici();
    });
fetch(url+"partiti.json")
    .then(response => response.json())
    .then(data => {
        partiti = data;
    });
