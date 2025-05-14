// ( ! ) GERER LE FAIT QUE QUAND ON ENVOIE PAR EXEMPLE LA CREATION D UN <p> POUR CHAQUE CLIENT,
//       CERTAINS CLIENTS POURRAIENT SE CONNECTER PAR APRES IL FAUDRA AUSSI LES CONFIGURER

const _allPlayer = document.getElementById("allPlayer")
const _thisPlayer = document.getElementById("thisPlayer")
const _mainpot = document.getElementById("mainPot")
const _infos = document.getElementById("infos")
const _river = document.getElementById("river")
const _playForm = document.getElementById("playForm")

const name_face = ["Jack", "Queen", "King", "Ace"];
const name_color = ["Heart", "Diamond", "Club", "Spade"];

const RANK_NAME = {
    1: "High Card", 2: "Pair", 3: "Two Pair", 4: "Three of a Kind", 5: "Straight",
    6: "Flush", 7: "Full House", 8: "Four of a Kind", 9: "Straight Flush", 10: "Royal Flush"
};

function getIdFromURL() {
  const path = window.location.pathname;
  return path.split("/").pop();
}

// Lorsque le serveur envoie une demande d'url
socket.on("demanderUrl", () => {
    const url = window.location.pathname;
    socket.emit("reponseUrl", url);
});

let paragraphByIdP = {}
let thisParagraph = null

socket.on("otherPlayerBuildPara", (data) => {
    paragraphByIdP[idP] = document.createElement("p");
    _allPlayer.appendChild(paragraphByIdP[idP]);
}

socket.on("thisPlayerBuildPara", () => {
    thisParagraph = document.createElement("p");
    _thisPlayer.appendChild(thisParagraph);
}

socket.on("playerDisplayOf", (data) => {
    paragraphByIdP[idP].textContent = text
})
          
socket.on("thisPlayerDisplay", (data) => {
    thisParagraph.textContent = text
})


// Émettre un message
socket.emit("message", "Bonjour serveur !");

// Écouter un message
socket.on("message", (data) => {
  console.log("Message du serveur :", data);
});

socket.on("h1Modif", (text) => {
  const h1 = document.querySelector('h1');  // Sélectionne le premier <h1> trouvé
  h1.textContent = text;
});

