var inGame = true;

function coucou() {
    monDiv = document.getElementById('commandContainerToModifie');
    monDiv.innerHTML = "";
    if (inGame) {
        
const bouton1 = document.createElement("button");
bouton1.textContent = "Bouton 1";
monDiv.appendChild(bouton1);

const bouton2 = document.createElement("button");
bouton2.textContent = "Bouton 2";
monDiv.appendChild(bouton2);

const bouton3 = document.createElement("button");
bouton3.textContent = "Bouton 3";
monDiv.appendChild(bouton3);
        inGame = false;
    } else {
        // Créer un input
const input = document.createElement("input");

// (Optionnel) Configurer l’input, par exemple type et placeholder
input.type = "text";
input.placeholder = "Écris ici";

// Ajouter l’input dans le div
monDiv.appendChild(input);
        inGame = true;
    }
}
