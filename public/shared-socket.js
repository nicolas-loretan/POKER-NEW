// shared-socket.js

if (!window.socket) {  // On vérifie si la connexion socket n'existe pas déjà
    window.socket = io();  // Crée la connexion globale si elle n'existe pas
}

// Écouter les événements ici pour chaque page
socket.on('message', (data) => {
    console.log('Message reçu :', data);
});
