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

// Routes
app.get('/accueil', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'accueil.html'));
  console.log("Client connecté à la page accueil");
});

app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'game.html'));
  console.log("Client connecté à la page game");
});

app.get('/', (req, res) => {
  res.redirect('/accueil');
});

app.use((req, res) => {
  res.status(404).send('Erreur 404 : Page non trouvée');
  console.log(`Requête non reconnue : ${req.originalUrl}`);
});

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

function generateRandomId() {
  const min = 1000000000;
  const max = 9999999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let playerById = {}
let playerByIdP = {} // id public

class Player {
    constructor(name, stack = 100) {
        this.name = name;
	      this.hand = [];
        this.stack = stack;
        this.best = null;
        this.paragraph = null;
	      this.state = "waiting";
	      this.raise = 0;
	    
	let id = null
	while (id == null){
		id = generateRandomId()
		if (!(id in playerById)){
			this.id = id
		} else {id = null}
	}
	playerById[this.id] = this; // ajoute le joueur au dictionnaire avec comme clef son id

	let idP = null
	while (idP == null){
		idP = generateRandomId()
		if (!(idP in playerByIdP)){
			this.idP = idP
		} else {idP = null}
	}
	playerByIdP[this.idP] = this;
    }
	
	receiveCard(card) {
        this.hand.push(card);
    }

    resetHand() {
        this.hand = [];
        this.best = null;
    }
	
    display(container) {
        this.paragraph = null
    }

    updateDisplay() {
        this.paragraph = `Nom: ${this.name}, Score: ${this.stack - this.raise}, Mise Totale : ${this.raise}, State : ${this.state}, Cartes: ${this.hand.map(formatCard).join(" | ")}`;
    }
	
	play() {
	    return new Promise(resolve => {
	        this._resolveTour = resolve; // on stocke le resolve pour plus tard
			
			if (this.raise == this.stack) {
				this.state = "all-in"
			}
			
	        if (this.state == "waiting") {
	            this.state = "playing";
	    
	            const btns = [];
	
	            if (callAmount == this.raise) {
	                btns.push("check");
	            } else {
	                btns.push("fall", "call");
	            }
				
				if (callAmount < this.stack) {
		            btns.push("curseur")
	        } else {
				this.played()
			}
		}
	    });
	}	

	played() {
		console.log(this.name + " a joué")
		mainPot()
	    if (this.state != "fold" && this.state != "all-in"){
	    	this.state = "waiting";
			}
	    if (this._resolveTour) {
	        this._resolveTour(); // débloque await player.play()
	        this._resolveTour = null;
	    }
	}
	
	fall() {
		this.state = "fold"
		this.played()
	}
	
	check() {
		this.played()
	}
	
	call() {
		if (this.stack <= callAmount){
			this.state = "all-in"
			this.raise = this.stack
		} else {
			this.raise = callAmount
		}
		this.played()
	}
	
	toRaise(nb) {
		if (this.raise + nb > this.stack){
			console.log("ERREUR : raise plus haut que ton max alors que c'est pas sensé etre possible")
		}
		this.raise += nb 
		callAmount = this.raise
		if (this.raise == this.stack){
			this.state = "all-in"
		}
		
		console.log("raise de " + nb)
		this.played()
	}
}
