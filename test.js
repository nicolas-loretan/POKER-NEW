// ----- Classe Player
class Player {
    constructor(name, stack = 100) {
        this.name = name;
		this.hand = [];
        this.stack = stack;
        this.best = null;
        this.paragraph = null;
		this.state = "waiting";
		this.raise = 0;
		
    }
	
	receiveCard(card) {
        this.hand.push(card);
    }

    resetHand() {
        this.hand = [];
        this.best = null;
    }
	
    display(container) {
        this.paragraph = document.createElement("p");
        container.appendChild(this.paragraph);
        this.updateDisplay();
    }

    updateDisplay() {
        this.paragraph.textContent = `Nom: ${this.name}, Score: ${this.stack - this.raise}, Mise Totale : ${this.raise}, State : ${this.state}, Cartes: ${this.hand.map(formatCard).join(" | ")}`;
    }
	
	play() {
	    return new Promise(resolve => {
	        this._resolveTour = resolve; // on stocke le resolve pour plus tard
			
			if (this.raise == this.stack) {
				this.state = "all-in"
			}
			
	        if (this.state == "waiting") {
	            this.state = "playing";
	
	            const playForm = document.getElementById('playForm');
	            playForm.innerHTML = ''; // vider avant de recréer les boutons
	
	            const btns = [];
	
	            if (callAmount == this.raise) {
	                const btn1 = document.createElement('button');
	                btn1.textContent = 'Check';
	                btn1.onclick = () => this.check();
	                btns.push(btn1);
	            } else {
	                const btn2 = document.createElement('button');
	                btn2.textContent = `Suivre ${callAmount - this.raise}`;
	                btn2.onclick = () => this.call();
					
	                const btn3 = document.createElement('button');
	                btn3.textContent = 'Se coucher';
	                btn3.onclick = () => this.fall();
					
	                btns.push(btn2, btn3);
	            }
				
				if (callAmount < this.stack) {
		            const curseurContainer = document.createElement('div');
		            const curseur = document.createElement('input');
		            curseur.type = 'range';
		            curseur.min = callAmount - this.raise;
		            curseur.max = this.stack-this.raise;
		            curseur.value = 0;
		
		            const valeur = document.createElement('span');
		            valeur.textContent = curseur.value;
		
		            curseur.addEventListener('input', () => {
		                valeur.textContent = curseur.value;
		            });
		
		            const btnConfirmer = document.createElement('button');
		            btnConfirmer.textContent = 'Confirmer';
		            btnConfirmer.onclick = () => {
		                this.toRaise(Number(curseur.value));
		            };
		
		            curseurContainer.appendChild(curseur);
		            curseurContainer.appendChild(valeur);
		            curseurContainer.appendChild(btnConfirmer);
					playForm.appendChild(curseurContainer);
				}
	
	            btns.forEach(b => playForm.appendChild(b));
				this.updateDisplay();
	        } else {
				this.played()
			}
	    });
	}	

	played() {
		console.log(this.name + " a joué")
		mainPot()
	    if (this.state != "fold" && this.state != "all-in"){
	    	this.state = "waiting";
			}
		this.updateDisplay();
	    document.getElementById('playForm').innerHTML = '';
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

const name_face = ["Jack", "Queen", "King", "Ace"];
const name_color = ["Heart", "Diamond", "Club", "Spade"];

const RANK_NAME = {
    1: "High Card", 2: "Pair", 3: "Two Pair", 4: "Three of a Kind", 5: "Straight",
    6: "Flush", 7: "Full House", 8: "Four of a Kind", 9: "Straight Flush", 10: "Royal Flush"
};

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
const _ensembleJoueurs = document.getElementById("ensembleJoueurs");
const _river = document.getElementById("river");
const _riverAffiche = document.createElement("p");
_river.appendChild(_riverAffiche);

// Joueurs
let players = [
    new Player("Jean"),
    new Player("Thom", 300),
    new Player("Nico", 300),
    new Player("Flo",)
];

function mainPot() {
	let pot = 0
	players.forEach(p => {
		pot += p.raise
	})
    document.getElementById("MAIN_POT").textContent = `${pot}`;
}

let tourPlaying = true
async function tour() {
	tourPlaying = true
	for (let p of players) {
		if (!(p.state == "all-in" || p.state == "fold")){
        	await p.play();	// attend que le joueur termine son action
		}
	}
	while (tourPlaying){
		tourPlaying = false
		for (let p of players) {
			if (!(p.state == "all-in" || p.state == "fold")){
				if (!(callAmount == p.raise)){
					tourPlaying = true
					await p.play()
			}}
		}
	}
    }

let callAmount = 0
mainPot()

async function nouvellePartie() {
	players = players.filter(p => p.stack !== 0) // supprime les joueurs qui sont à 0
	callAmount = 0
	let deck = [...deckInit];
    let community = [];
	let outsiderList = []
	let winnerlist = []
	mainPot()
	
    _ensembleJoueurs.innerHTML = '';
	_riverAffiche.textContent = "River : ";
    players.forEach(p => {
		p.state = "waiting";
		p.resetHand();
        p.display(_ensembleJoueurs);
		for (let i = 0; i < 2; i++) {
            let idx = Math.floor(Math.random() * deck.length);
            let card = deck.splice(idx, 1)[0];
            p.receiveCard(card);
		}
		p.updateDisplay();
    });	
	
	for (let i = 0; i < 5; i++) {
        let idx = Math.floor(Math.random() * deck.length);
        community.push(deck.splice(idx, 1)[0]);
    }
	
	await tour();
	_riverAffiche.textContent = "Flop: " + community.slice(0, 3).map(formatCard).join(" | ");
	await tour();
	_riverAffiche.textContent += " | Turn: " + formatCard(community[3]);
	await tour();
	_riverAffiche.textContent += " | River: " + formatCard(community[4]);
	await tour();
	
	players.forEach(p => {
		p.best = bestHand([...p.hand, ...community]);
		if (p.state == "waiting" || p.state == "all-in"){
			outsiderList.push(p)
		}
	})
	let indexwinner = null
	while (!(players.every(p => p.raise === 0))) {
		let winner = outsiderList[0];
	    outsiderList.slice(1).forEach(p => {
	        if (compareHands(p.best, winner.best) > 0) {
	            winner = p;
	        }
	    });
		winnerlist.push(winner)
		let winnerpot = 0
		if (winner.state != "all-in") {
			players.forEach(p => {
				if (!winnerlist.includes(p)){
					winnerpot += p.raise
					p.stack += -p.raise
					p.raise = 0
				}
			})
		} else {
			players.forEach(p => {
				if (!winnerlist.includes(p)){
					if (p.raise > winner.raise){
						winnerpot += winner.raise
						p.stack += - winner.raise
						p.raise += - winner.raise
					} else {
						winnerpot += p.raise
						p.stack += -p.raise
						p.raise = 0
					}
				}
			})
		}
		winner.raise = 0
		indexwinner = outsiderList.indexOf(winner);
		outsiderList.splice(indexwinner, 1);
		winner.stack += winnerpot;

	console.log("Mise à jour du texte avec : " + "Winners : " + winnerlist.map(w => w.name).join(", ") + " | Pot : " + winnerpot);
	document.getElementById("infos").textContent =
	  "Winners : " + winnerlist.map(w => w.name).join(", ") + " | Pot : " + winnerpot;
}

	// faire tourner les joueurs
	let premier = players.shift();
    players.push(premier);
}


// Bouton
const bouton = document.createElement("button");
bouton.textContent = "Nouvelle partie";
bouton.addEventListener("click", nouvellePartie);
document.body.appendChild(bouton);

