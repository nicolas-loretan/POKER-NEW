const socket = io();

  const form = document.getElementById('startForm');
  const input = document.getElementById('playerName');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = input.value.trim();
    console.log(`envoie du nom ${name} au serveur pour creer un joueur`)
    socket.emit("verifierNom", name);
  });

  socket.on("nomValide", (url) => {
    window.location.href = url; // redirection vers page personnalisée
  });

  socket.on("erreurNom", (message) => {
    alert(message); // affiche erreur si nom invalide
  });
