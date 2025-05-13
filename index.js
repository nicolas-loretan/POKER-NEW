const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

// Important : CORS configuration pour accepter les connexions front-end
const io = new Server(server, {
  cors: {
    origin: "*", // Remplace '*' par l’URL de ton front pour plus de sécurité
    methods: ["GET", "POST"]
  }
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("✅ Un client s'est connecté :", socket.id);

  socket.on("message", (data) => {
    console.log("📨 Message reçu :", data);
    socket.broadcast.emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ Déconnexion :", socket.id);
  });
});

// Port recommandé pour Render
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
