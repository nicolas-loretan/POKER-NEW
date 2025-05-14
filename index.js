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

// Fonction pour extraire l'ID de l'URL
function extractGameId(url) {
  // Vérification de la forme /game/:id
  const regex = /^\/game\/(\d+)$/;
  const match = url.match(regex);

  if (match) {
    // Retourne l'ID extrait (match[1] contient l'ID)
    return match[1];
  } else {
    return null; // Si l'URL ne correspond pas à la forme attendue
  }
}

app.get('/game/:id', (req, res) => {
  const id = req.params.id;
  console.log(id)
  if (id in playerById){
	res.sendFile(path.join(__dirname, 'public', 'game.html'));
  	console.log(`Client ${playerById[id].name} se connecte à la page game`);
  } else {res.status(404).send('Erreur 404 : Page non trouvée');
  console.log(`Utilisateur à tenté d'acceder a une page game avec une id non reeconnu : ${id}`);
  console.log(`bib playerById : `)
// Boucle pour afficher chaque clé et son objet associé
for (let key in playerById) {
    if (playerById.hasOwnProperty(key)) {
        console.log(`${key}: `, playerById[key]);
    		}}}});

// Servir les fichiers statiques ( apres les requetes avec url dynamique prcq tu connais)
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get('/accueil', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'accueil.html'));
  console.log("Client connecté à la page accueil");
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
  console.log("Client connecté à la page login");
});

app.get('/', (req, res) => {
  res.redirect('/accueil');
});

app.use((req, res) => {
  res.status(404).send('Erreur 404 : Page non trouvée');
  console.log(`Requête non reconnue : ${req.originalUrl}`);
});

io.on("connection", (socket) => {
  console.log("✅ Un client s'est connecté au socket :", socket.id);
  socket.emit("demanderUrl");

  // Attendre la réponse du client
  socket.once("reponseUrl", (url) => {
    console.log("Url reçu du client lors de la connection au socket:", url);
    const gameId = extractGameId(url);
    if (gameId) {
      // Vérifier si l'ID existe dans playerById
      if (gameId in playerById) {
        // Emit à ce client pour confirmer l'accès
        playerBySocketId[socket.id] = playerById[gameId];
	playerById[gameId].socketId = socket.id;     
      } else {
        console.log(`ID ${gameId} non trouvé, connection socket avec un joueur impossible`);
      }
    } else {
      console.log("URL invalide, format attendu /game/:id, connection socket avec un joueur impossible");
    }
console.log(`bib playerById : `)
	  // Boucle pour afficher chaque clé et son objet associé
for (let key in playerById) {
    if (playerById.hasOwnProperty(key)) {
        console.log(`${key}: `, playerById[key]);
    		}}
  });
	
  socket.on("message", (data) => {
    console.log("📨 Message reçu :", data);
    socket.broadcast.emit("message", data);
  });

  socket.on("verifierNom", (name) => {
    if (name == null) {
      socket.emit("erreurNom", "Nom invalide ou déjà utilisé.");
    } else {
      const newPlayer = new Player(name)
      const url = `/game/${newPlayer.id}`;
      socket.emit("nomValide", url);
    }
  });
	
  socket.on("disconnect", () => {
    console.log("❌ Déconnexion :", socket.id);
    if (socket.id in playerBySocketId) {
	let p = playerBySocketId[socket.id]
	playerBySocketId[socket.id].socketId = null
	delete playerBySocketId[socket.id]
	
    }
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
let playerBySocketId = {};

class Player {
    constructor(name, stack = 100) {
        this.name = name;
	this.hand = [];
        this.stack = stack;
        this.best = null;
        this.paragraphPublic = null;
	this.paragraph = null;
	this.state = "waiting";
	this.raise = 0;

	this.socketId = null;
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
	console.log(`nouveau joueur créé || nom : ${this.name}, stack : ${this.stack}, id : ${this.id}, idP (publique) : ${this.idP}`)
	console.log("bib joueur par id : ", playerById)
	console.log("bib joueur par idP : ", playerByIdP)
    }
	
    receiveCard(card) {
        this.hand.push(card);
    }

    resetHand() {
        this.hand = [];
        this.best = null;
    }

    display() {
        this.paragraphPublic = `Nom: ${this.name}, Score: ${this.stack - this.raise}, Mise Totale : ${this.raise}, State : ${this.state}, Cartes: ${this.hand.map(formatCard).join(" | ")}`;
    }
	
    displayPublic() {
        this.paragraph = `Nom: ${this.name}, Score: ${this.stack - this.raise}, Mise Totale : ${this.raise}, State : ${this.state}`;
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

function formatCard(card) {
    let val = card[0] > 10 ? name_face[card[0] - 11] : card[0];
    let suit = name_color[card[1] - 1];
    return `${val} of ${suit}`;
}

function combinations5(cards) {
    let combs = [];
    for (let i = 0; i < cards.length - 4; i++)
        for (let j = i + 1; j < cards.length - 3; j++)
            for (let k = j + 1; k < cards.length - 2; k++)
                for (let l = k + 1; l < cards.length - 1; l++)
                    for (let m = l + 1; m < cards.length; m++)
                        combs.push([cards[i], cards[j], cards[k], cards[l], cards[m]]);
    return combs;
}

function evaluate5(c5) {
    let vals = c5.map(c => c[0]);
    let suits = c5.map(c => c[1]);
    let count = vals.reduce((obj, v) => (obj[v] = (obj[v] || 0) + 1, obj), {});
    let isFlush = new Set(suits).size === 1;
    let uniq = [...new Set(vals)].sort((a, b) => a - b);
    if (uniq.includes(14)) uniq.unshift(1);

    let straightHigh = null;
    for (let i = 0; i + 4 < uniq.length; i++) {
        if (uniq[i + 4] - uniq[i] === 4) {
            straightHigh = uniq[i + 4];
        }
    }

    let groups = Object.entries(count).map(([v, c]) => [c, +v]);
    groups.sort((a, b) => b[0] - a[0] || b[1] - a[1]);

    let rank, tiebreakers;
    if (isFlush && straightHigh) {
        rank = (straightHigh === 14) ? 10 : 9;
        tiebreakers = [straightHigh];
    } else if (groups[0][0] === 4) {
        rank = 8;
        tiebreakers = [groups[0][1], groups[1][1]];
    } else if (groups[0][0] === 3 && groups[1][0] === 2) {
        rank = 7;
        tiebreakers = [groups[0][1], groups[1][1]];
    } else if (isFlush) {
        rank = 6;
        tiebreakers = vals.sort((a, b) => b - a);
    } else if (straightHigh) {
        rank = 5;
        tiebreakers = [straightHigh];
    } else if (groups[0][0] === 3) {
        rank = 4;
        tiebreakers = [groups[0][1], ...vals.filter(v => v !== groups[0][1]).sort((a, b) => b - a)];
    } else if (groups[0][0] === 2 && groups[1][0] === 2) {
        let pairs = [groups[0][1], groups[1][1]].sort((a, b) => b - a);
        let kicker = vals.filter(v => v !== pairs[0] && v !== pairs[1])[0];
        rank = 3;
        tiebreakers = [...pairs, kicker];
    } else if (groups[0][0] === 2) {
        let pair = groups[0][1];
        let kickers = vals.filter(v => v !== pair).sort((a, b) => b - a);
        rank = 2;
        tiebreakers = [pair, ...kickers];
    } else {
        rank = 1;
        tiebreakers = vals.sort((a, b) => b - a);
    }

    return { rank, tiebreakers, cards: c5 };
}

function bestHand(cards7) {
    let best = null;
    for (let combo of combinations5(cards7)) {
        let eval = evaluate5(combo);
        if (!best ||
            eval.rank > best.rank ||
            (eval.rank === best.rank && eval.tiebreakers.some((v, i) => v > best.tiebreakers[i]))
        ) {
            best = eval;
        }
    }
    return best;
}

function compareHands(a, b) {
    if (a.rank !== b.rank) return a.rank - b.rank;
    for (let i = 0; i < a.tiebreakers.length; i++) {
        if (a.tiebreakers[i] !== b.tiebreakers[i]) {
            return a.tiebreakers[i] - b.tiebreakers[i];
        }
    }
    return 0;
}

const deckInit = [];
for (let j = 1; j < 5; j++) {
    for (let i = 2; i < 15; i++) {
        deckInit.push([i, j]);
    }
}
