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

