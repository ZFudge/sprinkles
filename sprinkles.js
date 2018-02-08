const game = {
	active: true,
	ms: 30, // milliseconds in each interval
	waterShade: 40, // sets shade of blue
	waterRise: true,
	waterAdjust() { //
		(game.waterRise) ? game.waterShade++ : game.waterShade--;
		if (game.waterShade >= 88 || game.waterShade <= 40) game.waterRise = !game.waterRise;
	},
	reset() {
		sprinkles.drops = [];
		game.active = true;
		sprinkles.speedrange = 1;
		sprinkles.dripFrequency = 0.07;
		player.levels.health.level = player.levels.slow.level = player.levels.power.level = player.levels.passive.level = 0;
		player.alive = true;
		player.points = 0;
		player.x = (sprinkles.canvas.width/2)-5;
		player.y = sprinkles.canvas.height*0.92;
		player.horizontal = 0;
		player.vertical = 1;
		player.speed = 3;
	},
	pauseUnpause() {
		(game.active) ? clearInterval(game.loop) : game.loop = setInterval(mainFunction,game.ms);
		game.active = !game.active;
	},
	sounds: {
		notecounter: 1,
		normal: [ new Audio('audio/normal/D.mp3'), new Audio('audio/normal/G.mp3'), new Audio('audio/normal/D_.mp3'), new Audio('audio/normal/C.mp3'), new Audio('audio/normal/D_2.mp3'), new Audio('audio/normal/G2.mp3'), new Audio('audio/normal/D2.mp3'), new Audio('audio/normal/A_.mp3') ],
		power: [ new Audio('audio/power/D.mp3'), new Audio('audio/power/G.mp3'), new Audio('audio/power/DS.mp3'), new Audio('audio/power/C.mp3'), new Audio('audio/power/DS2.mp3'), new Audio('audio/power/G2.mp3'), new Audio('audio/power/D2.mp3'), new Audio('audio/power/AS.mp3') ],
		theme: new Audio('audio/normal/sprinkles_2.mp3'),
		slowTheme: new Audio('audio/normal/slow_theme.mp3'),
		toggleTheme() {
			if (player.state === "slow") {
				game.sounds.theme.pause();
				game.sounds.slowTheme.play();
			} else {
				game.sounds.theme.play();
				game.sounds.slowTheme.pause();
			}
		},
		soundlooper() {
			(player.state === "power") ? this.power[this.notecounter].play() : this.normal[this.notecounter].play();
			(game.sounds.notecounter < 7) ? this.notecounter++ : this.notecounter = 0;
		}
	},
	buttons: {
		reset: document.getElementById("reset")
	},
	drawSky() {
		(player.state === "passive") ? sprinkles.context.fillStyle = player.colors.passivesky : (player.state === "power") ? sprinkles.context.fillStyle = player.colors.powersky : (player.state === "slow") ? sprinkles.context.fillStyle = player.colors.slowsky : sprinkles.context.fillStyle = player.colors.gloom;
		sprinkles.context.fillRect(0, game.cloudThickness, sprinkles.canvas.width, game.waterLine);
	},
	drawWater() {
		let fillIt = '#0000'+ game.waterShade.toString();
		sprinkles.context.fillStyle = fillIt;
		sprinkles.context.fillRect(0, game.waterLine, sprinkles.canvas.width, sprinkles.canvas.height);
		game.waterAdjust();
	},
	t: false
}

function mainFunction() {
	sprinkles.context.clearRect(0,0,sprinkles.canvas.width,sprinkles.canvas.height);
	game.drawSky();
	game.drawWater();
	sprinkles.adjust();
	if (player.alive) {
		sprinkles.dripCheck();
		player.safeCheck();
		player.barDraw();
		player.updateStats();
	}
	player.adjust();
}

const sprinkles = {
	canvas: document.getElementById('sprinkle-canvas'),
	drops: [], // each sprinkle that is generated with .drip() function is stored here
	speedrange: 1, // range of vertical speed possible when creating sprinkles
	dripFrequency: 0.07, //maxes at 2.5
	hexCodes: { pink: '#F205B7', magenta: '#A705F2', darkBlue: '#2405F2', lightBlue: '#0DC7DB', green: '#0DDB25', yellow: '#F5FC19', orange: '#FC8B19', red: '#EB0909' },
	colors: ['pink','magenta','darkBlue','lightBlue','green','yellow','orange','red'],
	impactForce: () => Math.ceil(Math.random() * 25),
	dripCheck: function() {
		if (Math.random() < this.dripFrequency) this.drip();
	},
	drip: function() {
		const width = 5 + Math.floor(Math.random() * 5);
		const height = 10 + Math.floor(Math.random() * 10);
		const speed = 1 + Math.floor(Math.random() * sprinkles.speedrange);
		sprinkles.drops.push({
			color: sprinkles.colors[Math.floor(Math.random() * sprinkles.colors.length)],
			width: width,
			height: height,
			x: Math.floor(Math.random() * sprinkles.canvas.width - width), 
			y: 0 - height,
			speed: speed,
			trueSpeed: speed
		});
	},
	passiveCheck: function(drop) {
		const passiveGap = 50;
		if (drop.y < player.y + player.size && drop.x < player.x+player.size+passiveGap && drop.x+drop.width > player.x-passiveGap && drop.y > player.y-100) return true;
	},
	adjust: function() {
		const removalIndexes = [];
		for (let drop in sprinkles.drops) {
			sprinkles.drops[drop].y += sprinkles.drops[drop].speed;
			if (player.state === "passive")
				if (sprinkles.passiveCheck(sprinkles.drops[drop]))
					(sprinkles.drops[drop].x > player.x + player.size/2) ? sprinkles.drops[drop].x+=2 : sprinkles.drops[drop].x-=2;
			if (sprinkles.drops[drop].y >= sprinkles.canvas.height || player.collision(sprinkles.drops[drop])) {
				let index = sprinkles.drops.indexOf(sprinkles.drops[drop]);
				removalIndexes.push(index);
			}
			if (sprinkles.drops[drop].y + sprinkles.drops[drop].height < game.cloudThickness) {
				sprinkles.context.fillStyle = 'white';
				(!player.alive) ? sprinkles.drops[drop].speed += sprinkles.drops[drop].trueSpeed * 0.25 : 
					(sprinkles.drops[drop].y + sprinkles.drops[drop].height - sprinkles.drops[drop].speed <= 0) ? 
						sprinkles.drops[drop].speed = sprinkles.drops[drop].trueSpeed * 1.5 : null;
			} else if (sprinkles.drops[drop].y + sprinkles.drops[drop].height < game.waterLine) {
				sprinkles.context.fillStyle =  sprinkles.hexCodes[sprinkles.drops[drop].color];
				(!player.alive && sprinkles.drops[drop].y > game.cloudThickness) ?
					sprinkles.drops[drop].speed -= sprinkles.drops[drop].trueSpeed * 0.25 :
					(sprinkles.drops[drop].speed > sprinkles.drops[drop].trueSpeed) ?
						sprinkles.drops[drop].speed -= sprinkles.drops[drop].speed * 0.1 : null;
			} else {
				sprinkles.context.fillStyle = 'black';
				(!player.alive) ? sprinkles.drops[drop].speed -= sprinkles.drops[drop].trueSpeed * 0.1 :
					(sprinkles.drops[drop].speed > 0.5) ?
						sprinkles.drops[drop].speed -= sprinkles.drops[drop].speed * 0.025 : null;
			}
			sprinkles.context.fillRect(sprinkles.drops[drop].x, sprinkles.drops[drop].y, sprinkles.drops[drop].width, sprinkles.drops[drop].height);
		}
		if (removalIndexes.length > 1) {
	      	for (let i = 0; i < removalIndexes.length; i++) sprinkles.drops.splice(removalIndexes[0], 1);
	    } else if (removalIndexes.length == 1) {
	      	sprinkles.drops.splice(removalIndexes[0],1);
	    }
	}
}
sprinkles.context = sprinkles.canvas.getContext('2d');
game.cloudThickness = sprinkles.canvas.height*0.20;
game.waterLine = sprinkles.canvas.height*0.8; //320,
game.loop = setInterval(mainFunction,game.ms);

const player = {
	state: "normal",
	size: 10,
	x: (sprinkles.canvas.width/2)-5,
	y: sprinkles.canvas.height * 0.92,
	horizontal: 0,
	vertical: 1,
	fastvertical: 2,
	speed: 3,
	alive: true,
	points: 0,
	color: "#ccc",
	colors: { magenta: '#AE00FF', blue: '#0BF', green: '#0F2', red: ['#F11','#C00','#900','#600','#100','#600','#900','#C00','#F11','#F44','#F99','#FFF','#F99','#F44','#F11','#C00','#900','#600','#100','#600','#900','#C00','#F11','#F44','#F99'], gloom: '#0093C4', passivesky: '#5C00BF', powersky: '#228', slowsky: '#242' },
	levels: {
		canvas: document.getElementById("levels-canvas"),
		slow: {
			level: 0,	// max 120
			height: 0
		},
		power:  {
			level: 0,	// max 120
			height: 0
		},
		passive:  {
			level: 0,	// max 240
			height: 0
		},
		health:  {
			level: 5,	// max 30,000
			height: 0,
			drawHealthLayers(width, n, max) {
				sprinkles.context.fillStyle = player.colors.red[n];
				if (width <= max) {
					sprinkles.context.fillRect(player.health.x, player.health.y, width, player.health.height);
				} else {
					sprinkles.context.fillRect(player.health.x, player.health.y, max, player.health.height);
					player.health.drawLayers(width-max, n+1, max-10);
				}
			}
		},
	},
	adjustBars() {
		if (this.state === "normal") {
			if (this.vertical > 0 && this.y < game.waterLine) {
				if (this.levels.slow.level < 120) {
					this.levels.slow.level += 0.2;
				} else if (this.levels.power.level < 120) {
					this.levels.power.level += 0.1;
				} else if (this.levels.passive.level < 240) {
					this.levels.passive.level += 0.05;
				} else {
					sprinkles.dripFrequency -= 0.0002;
				}
			}
		} else {
			if (this.state === "passive") {
				if (this.levels.power.height > this.levels.power.level) {
					this.levels.power.height -= 0.01;
					this.levels.power.height = this.levels.power.height.toFixed(0);
				}
			} else if (this.state === "power") {
				if (this.levels.power.level > 0) {
					this.levels.power.level -= 0.2;
					this.levels.power.height = this.levels.power.level.toFixed(0);
				} else {
					this.levels.power.level = 0;
					this.levels.power.height = this.levels.power.level.toFixed(0);
					this.vertical /= 2;
					this.fastvertical /= 2;
				}
			} else if (this.state === "slow") {
				if (this.levels.slow.level > 0) {
					this.levels.slow.level -= 0.5;
				} else {
					this.state = "normal";
					this.slow.level = 0;
					game.sounds.toggleTheme();
					clearInterval(game.loop);
					game.loop = setInterval(mainFunction,game.ms);
				}
			} else {
				alert("Error: player state is " + this.state);
			}
		}
	},
	barDraw() {
		player.adjustBars();
		// 425 height 115 widths
		// 425 29
		this.levels.context.clearRect(0,0,this.levels.canvas.width,this.levels.canvas.height);
		this.levels.context.fillStyle = "#F00";
		this.levels.context.fillRect(0, 								this.levels.canvas.height - this.levels.health.level, 	25, 	Math.abs(this.levels.canvas.height - this.levels.health.level));
		this.levels.context.fillStyle = player.colors.green;
		this.levels.context.fillRect(0.25 * this.levels.canvas.width, 	this.levels.canvas.height - this.levels.slow.level, 	25, 	Math.abs(this.levels.canvas.height - this.levels.slow.level));
		this.levels.context.fillStyle = player.colors.blue;
		this.levels.context.fillRect(0.5 * this.levels.canvas.width, 	this.levels.canvas.height - this.levels.power.level, 	25, 	Math.abs(this.levels.canvas.height - this.levels.power.level));
		this.levels.context.fillStyle = player.colors.magenta;
		this.levels.context.fillRect(0.75 * this.levels.canvas.width, 	this.levels.canvas.height - this.levels.passive.level, 	25, 	Math.abs(this.levels.canvas.height - this.levels.passive.level));
		
		//player.health.drawLayers(player.health.width, 0, 240);
	},
	safeCheck() {
		if (player.y + player.size < game.cloudThickness) player.levelup();
	},
	levelup() {
		this.levels.health.level += 100;
		this.points += 100;
		this.y = sprinkles.canvas.height * 0.92;
		if (this.state != "normal") {
			this.state = "normal";
			if (this.state === "power") {
				this.fastvertical /= 2;
				this.vertical /= 2;
			}
			if (this.state === "slow") {
				game.sounds.toggleTheme();
				clearInterval(game.loop);
				game.loop = setInterval(mainFunction,game.ms);
			}
		}
		if (sprinkles.speedrange <= 4.9) sprinkles.speedrange += 0.1;
		if (sprinkles.dripFrequency < .25) sprinkles.dripFrequency += 0.005;
	},
	adjust() {
		if (this.alive) {
			if (this.state === "power") this.levels.health.level += 0.25;
			if (this.horizontal < 0 && this.x < 1 || this.horizontal > 0 && this.x > sprinkles.canvas.width - this.size) this.horizontal = 0;
			this.x += this.horizontal;
			this.y -= this.vertical;
			this.draw();	
		} else {
			this.y -= this.vertical
			this.draw();
		}
	},
	collision(drop) {
		if (this.alive) {
			const dropUp = drop.y;
			const dropDwn = drop.y + drop.height;
			const dropLft = drop.x;
			const dropRgt = drop.x + drop.width;
			const playUp = this.y;
			const playDwn = this.y + this.size;
			const playLft = this.x
			const playRgt = this.x + this.size;
			if ( ((playDwn >= dropUp && playDwn <= dropDwn && playLft >= dropLft && playLft <= dropRgt) || (playDwn >= dropUp && playDwn <= dropDwn && playRgt >= dropLft && playRgt <= dropRgt) || (playUp >= dropUp && playUp <= dropDwn && playLft >= dropLft && playLft <= dropRgt) 
					|| (dropDwn >= playUp && dropDwn <= playDwn && dropLft >= playLft && dropLft <= playRgt) || (dropDwn >= playUp && dropDwn <= playDwn && dropRgt >= playLft && dropRgt <= playRgt) || (dropUp >= playUp && dropUp <= playDwn && dropLft >= playLft && dropLft <= playRgt)) && dropDwn < game.waterLine && dropDwn > game.cloudThickness) {
				game.sounds.soundlooper();
				if (this.state === "power") {
					this.levels.health.level += 2;
					this.points += 20;
					this.y -= 10;
				} else {
					(this.levels.health.level > 0) ? this.levels.health.level -= 50 : this.levels.health.level--;
					if (this.levels.health.level <= 0) {
						this.levels.health.level = 0;
						this.alive = false;
						if (this.state === "slow") {
							this.state = "normal;"
							game.sounds.toggleTheme();
						}
						if (this.state === "passive") this.state = "normal";
						this.vertical = -3;
						return false;
					} else {
						this.y += sprinkles.impactForce();
					}
				}
				return true;
			}
			return false;	
		} else {
			return false;
		}
	},
	img: {
		x: 0,
		steps: 0,
		image: new Image(),
		adjust: function() {
			player.img.steps++;
			if (player.img.steps == 10) {
				player.img.x += player.img.steps;
				if (player.img.x == 80) player.img.x = 0;
				player.img.steps = 0;
			}
		}
	},
	score: document.getElementById("score-box"),
	updateStats() {
		this.score.children[0].innerHTML = `PTS : ${this.points}`;
		this.score.children[1].innerHTML = `HP : ${this.levels.health.level}`;
	}
}

player.levels.context = player.levels.canvas.getContext("2d");
player.img.image.src = 'images/player.png';
player.draw = function() {
	sprinkles.context.drawImage(player.img.image, player.img.x, 0, player.size, player.size*2, player.x, player.y, player.size, player.size*2);
	player.img.adjust();
}

document.addEventListener("keydown",pushedKey);
document.addEventListener("keyup",releasedKey);

function pushedKey(btn) {
	if (btn.keyCode === 32) game.pauseUnpause(); // space
	if (btn.keyCode === 82) game.reset();  // R
	if (player.alive) {
		if (btn.keyCode === 37 && player.horizontal > -2) player.horizontal = -2;
		if (btn.keyCode === 39 && player.horizontal < 2) player.horizontal = 2;
		if (btn.keyCode === 38) player.vertical = player.fastvertical;
		if (btn.keyCode === 40) player.vertical = 0;
		if (btn.keyCode === 65 && player.levels.passive.level >= 50) {
			player.state = "passive";
			player.levels.passive.level -= 50;
			setTimeout(() => player.state = "normal", 4000);
		}
		if (btn.keyCode === 67 && player.levels.power.level > 50 && player.y < game.waterLine && game.active) { // C key
			player.state = (player.state === "power") ? "normal" : "power";
			(player.state === "power") ? (
				player.vertical *= 2,
				player.fastvertical *= 2
			) : (
				player.vertical /= 2,
				player.fastvertical /= 2
			);
		}
		if (btn.keyCode === 83 && player.levels.slow.level > 50 && player.y < game.waterLine && game.active) { // S key
			player.state = (player.state === "slow") ? "normal" : "slow";
			game.sounds.toggleTheme();
			(player.state === "slow") ? (
				clearInterval(game.loop),
				game.loop = setInterval(mainFunction,game.ms*2)
			) : ( 
				clearInterval(game.loop),
				game.loop = setInterval(mainFunction,game.ms)
			);
		}	
	}
}

function releasedKey(btn) {
	if (player.alive) {
		if (btn.keyCode === 38) player.vertical /= 2; // up
		if (btn.keyCode === 40) player.vertical = 1; // down
		if (btn.keyCode === 37 && player.horizontal < 0) player.horizontal += 2;
		if (btn.keyCode === 39 && player.horizontal > 0) player.horizontal -= 2;
	}
}

const pushCoor = (push) => (push.clientX - window.innerWidth/2 + sprinkles.canvas.width/2 > player.x) ? player.horizontal = 2 : player.horizontal = -2;
const releaseCoor = (push) => player.horizontal = 0;
sprinkles.canvas.addEventListener('mousedown',pushCoor);
sprinkles.canvas.addEventListener('mouseup',releaseCoor);

window.addEventListener("load",function() {
	game.sounds.theme.volume = 0.7;
	game.sounds.theme.loop = true;
	game.sounds.toggleTheme();
})