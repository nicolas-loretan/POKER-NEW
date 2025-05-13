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
socket.on("demanderUrl" => {
            const url = window.location.pathname;
            socket.emit("reponseUrl", url);
        });



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

