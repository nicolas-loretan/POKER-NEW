const socket = io(); // Si les fichiers sont sur le même domaine

// Émettre un message
socket.emit("message", "Bonjour serveur !");

// Écouter un message
socket.on("message", (data) => {
  console.log("Message du serveur :", data);
});

