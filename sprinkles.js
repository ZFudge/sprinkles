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
		this.active = true;
		this.sounds.theme.currentTime = 0;
		sprinkles.drops = [];
		sprinkles.speedRange = 1;
		sprinkles.dripFrequency = 0.07;
		player.levels.health.level = player.levels.health.height = 100;
		player.levels.slow.level = player.levels.power.level = player.levels.passive.level = player.levels.passive.height = 0;
		player.alive = true;
		player.points = 0;
		player.movement.x = (sprinkles.canvas.width/2)-5;
		player.movement.y = sprinkles.canvas.height*0.92;
		player.movement.horizontal = 0;
		player.movement.vertical = 1;
		player.movement.speed = 3;
	},
	pauseUnpause() {
		if (game.active) {
			clearInterval(game.loop);
			this.sounds.theme.pause();
		} else {
			game.loop = setInterval(mainFunction,game.ms);
			this.sounds.theme.play();
		}
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
	controls: false,
	showControls() {
		this.controls = !this.controls;
		if (this.controls) {
			document.getElementById('sprinkle-canvas').style.opacity = 0;
			document.getElementById('menu').style.opacity = 1;
		} else {
			document.getElementById('sprinkle-canvas').style.opacity = 1;
			document.getElementById('menu').style.opacity = 0;
		}
	},
	soundToggle() {
		(this.sounds.theme.muted) ? this.sounds.theme.muted = false : this.sounds.theme.muted = true;
	}
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
	speedRange: 1, // range of vertical speed possible when creating sprinkles
	dripFrequency: 0.07, //maxes at 2.5
	hexCodes: { pink: '#F205B7', magenta: '#A705F2', darkBlue: '#2405F2', lightBlue: '#0DC7DB', green: '#0DDB25', yellow: '#F5FC19', orange: '#FC8B19', red: '#EB0909' },
	colors: ['pink','magenta','darkBlue','lightBlue','green','yellow','orange','red'],
	impactForce: () => Math.ceil(Math.random() * 20 + 5),
	dripCheck: function() {
		if (Math.random() < this.dripFrequency) this.drip();
	},
	drip: function() {
		const width = 5 + Math.floor(Math.random() * 5);
		const height = 10 + Math.floor(Math.random() * 10);
		const speed = 1 + Math.floor(Math.random() * sprinkles.speedRange);
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
		if (drop.y < player.movement.y + player.size && drop.x < player.movement.x+player.size+passiveGap && drop.x+drop.width > player.movement.x-passiveGap && drop.y > player.movement.y-100) return true;
	},
	adjust: function() {
		const removalIndexes = [];
		for (let drop in sprinkles.drops) {
			sprinkles.drops[drop].y += sprinkles.drops[drop].speed;
			if (player.state === "passive")
				if (sprinkles.passiveCheck(sprinkles.drops[drop]))
					(sprinkles.drops[drop].x > player.movement.x + player.size/2) ? sprinkles.drops[drop].x+=2 : sprinkles.drops[drop].x-=2;
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
game.cloudThickness = 100;
game.waterLine = sprinkles.canvas.height - 100;
game.loop = setInterval(mainFunction,game.ms);

const player = {
	state: "normal",
	alive: true,
	size: 10,
	points: 0,
	movement: {
		x: (sprinkles.canvas.width/2)-5,
		y: sprinkles.canvas.height * 0.92,
		horizontal: 0,
		vertical: 1,
		fastVertical: 2,
		speed: 3,
	},
	colors: { magenta: '#AE00FF', blue: '#0BF', green: '#0F2', red: ['#F11','#C00','#900','#600','#100','#600','#900','#C00','#F11','#F44','#F99','#FFF','#F99','#F44','#F11','#C00','#900','#600','#100','#600','#900','#C00','#F11','#F44','#F99'], gloom: '#0093C4', passivesky: '#5C00BF', powersky: '#228', slowsky: '#242' },
	levels: {
		canvas: document.getElementById("levels-canvas"),
		max: 212.25,
		slow: {
			level: 0,	// max 212.25
		},
		power:  {
			level: 0,	// max 212.25
		},
		passive:  {
			level: 0,	// max 425
			height: 0	// moves towards level, used for drawing height on canvas
		},
		health:  {
			level: 100,	// max None
			height: 100,	
			drawLayers(height, n, max) {
				player.levels.context.fillStyle = player.colors.red[n];
				if (height <= max) {
					player.levels.context.fillRect(2, player.levels.canvas.height - height / 4, 25, player.levels.canvas.height - (Math.abs(player.levels.canvas.height - height / 4)) );
				} else {
					player.levels.context.fillRect(2, player.levels.canvas.height - max / 4, 25, player.levels.canvas.height - (Math.abs(player.levels.canvas.height - max / 4)));
					if (max >= 75) player.levels.health.drawLayers(height-max, n+1, max - 75);
				}
			}
		},
	},
	adjustBars() {
		if (Math.abs(this.levels.health.height - this.levels.health.level) > 3) (this.levels.health.height > this.levels.health.level) ? this.levels.health.height -= 3 : this.levels.health.height += 3;
		if (Math.abs(this.levels.passive.height - this.levels.passive.level) > 0.5) (this.levels.passive.height > this.levels.passive.level) ? this.levels.passive.height -= 2 : this.levels.passive.height += 2; // because passive level only drops in high amounts
		if (this.state === "normal") {
			if (this.movement.vertical > 0 && this.movement.y < game.waterLine) {
				if (this.levels.slow.level < this.levels.max) {
					this.levels.slow.level += 0.16;
				} else if (this.levels.power.level < this.levels.max) {
					this.levels.power.level += 0.08;
				} else if (this.levels.passive.level < this.levels.max * 2) {
					this.levels.passive.level += 0.04;
				} else if (sprinkles.dripFrequency > 0.07) {
					sprinkles.dripFrequency -= 0.00002;
				}
			}
		} else {
			if (this.state === "passive") {
					
			} else if (this.state === "power") {
				if (this.levels.power.level > 0) {
					this.levels.power.level -= 0.2;
				} else {
					this.state = "normal";
					this.levels.power.level = 0;
					this.movement.vertical /= 2;
					this.movement.fastVertical /= 2;
				}
			} else if (this.state === "slow") {
				if (this.levels.slow.level > 0) {
					this.levels.slow.level -= 0.75;
				} else {
					this.state = "normal";
					this.levels.slow.level = 0;
					clearInterval(game.loop);
					game.loop = setInterval(mainFunction,game.ms);
					game.sounds.toggleTheme();
				}
			} else {
				alert("Error: player state is " + this.state);
			}
		}
	},
	barDraw() {
		player.adjustBars();
		this.levels.context.clearRect(0,0,this.levels.canvas.width,this.levels.canvas.height);
		
		this.levels.health.drawLayers(this.levels.health.height, 0, 1700);
		this.levels.context.fillStyle = player.colors.green;
		this.levels.context.fillRect(2+0.25 * this.levels.canvas.width, 	this.levels.canvas.height - (this.levels.slow.level * 2), 	25, 	(Math.abs(this.levels.canvas.height - this.levels.slow.level) * 2));
		this.levels.context.fillStyle = player.colors.blue;
		this.levels.context.fillRect(2+0.5 * this.levels.canvas.width, 		this.levels.canvas.height - (this.levels.power.level * 2), 	25, 	(Math.abs(this.levels.canvas.height - this.levels.power.level) * 2));
		this.levels.context.fillStyle = player.colors.magenta;
		this.levels.context.fillRect(2+0.75 * this.levels.canvas.width, 	this.levels.canvas.height - this.levels.passive.height, 	25, 	this.levels.canvas.height - (Math.abs(this.levels.canvas.height - this.levels.passive.height)));
	},
	safeCheck() {
		if (player.movement.y + player.size < game.cloudThickness) player.levelup();
	},
	levelup() {
		this.levels.health.level += 100;
		this.points += 1000;
		this.movement.y = sprinkles.canvas.height * 0.92;
		if (this.state != "normal" && this.state != "passive") {
			if (this.state === "power") {
				this.movement.fastVertical /= 2;
				this.movement.vertical /= 2;
			}
			if (this.state === "slow") {
				game.sounds.toggleTheme();
				clearInterval(game.loop);
				game.loop = setInterval(mainFunction,game.ms);
			}
			this.state = "normal";
		}
		if (sprinkles.speedRange <= 4.9) sprinkles.speedRange += 0.1;
		if (sprinkles.dripFrequency < .25) sprinkles.dripFrequency += 0.005;
	},
	adjust() {
		if (this.alive) {
			if (this.state === "power") this.levels.health.level += 1, this.points += 5;
			if (this.state === "passive") this.levels.health.level += 5, this.points += 10;
			if (this.movement.horizontal < 0 && this.movement.x < 1 || this.movement.horizontal > 0 && this.movement.x > sprinkles.canvas.width - this.size) this.movement.horizontal = 0;
			this.movement.x += this.movement.horizontal;
			this.movement.y -= this.movement.vertical;
		} else {
			if (this.movement.y < sprinkles.canvas.height) this.movement.y += 3;
		}
		this.draw();
	},
	collision(drop) {
		if (this.alive) {
			const dropUp = drop.y;
			const dropDwn = drop.y + drop.height;
			const dropLft = drop.x;
			const dropRgt = drop.x + drop.width;
			const playUp = this.movement.y;
			const playDwn = this.movement.y + this.size;
			const playLft = this.movement.x
			const playRgt = this.movement.x + this.size;
			if ( ((playDwn >= dropUp && playDwn <= dropDwn && playLft >= dropLft && playLft <= dropRgt) || (playDwn >= dropUp && playDwn <= dropDwn && playRgt >= dropLft && playRgt <= dropRgt) || (playUp >= dropUp && playUp <= dropDwn && playLft >= dropLft && playLft <= dropRgt) 
					|| (dropDwn >= playUp && dropDwn <= playDwn && dropLft >= playLft && dropLft <= playRgt) || (dropDwn >= playUp && dropDwn <= playDwn && dropRgt >= playLft && dropRgt <= playRgt) || (dropUp >= playUp && dropUp <= playDwn && dropLft >= playLft && dropLft <= playRgt)) && dropDwn < game.waterLine && dropDwn > game.cloudThickness) {
				game.sounds.soundlooper();
				if (this.state === "power") {
					this.levels.health.level += 10; // 4 : 1 
					this.points += 200;
					this.movement.y -= Math.ceil(Math.random() * 5 + 5);
				} else {
					this.levels.health.level -= 100;
					if (this.levels.health.level < 0) {
						this.levels.health.level = 0;
						this.levels.health.height = 0;
						this.alive = false;
						this.barDraw();
						this.score.children[1].innerHTML = "You Died";
						if (this.state === "slow") {
							this.state = "normal;"
							game.sounds.toggleTheme();
						}
						if (this.state === "passive") this.state = "normal";
						return false;
					} else {
						this.movement.y += sprinkles.impactForce();
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
		this.score.children[1].innerHTML = `HP : ${this.levels.health.level.toFixed(0)}`;
	}
}

player.levels.context = player.levels.canvas.getContext("2d");
player.img.image.src = 'images/player.png';
player.draw = function() {
	sprinkles.context.drawImage(player.img.image, player.img.x, 0, player.size, player.size*2, player.movement.x, player.movement.y, player.size, player.size*2);
	player.img.adjust();
}

document.addEventListener("keydown",pushedKey);
document.addEventListener("keyup",releasedKey);

function pushedKey(btn) {// 90 z, 88 x, 67 c
	if (btn.keyCode === 32) game.pauseUnpause(); // space
	if (btn.keyCode === 82) game.reset();  // R
	if (player.alive) {
		if (btn.keyCode === 37 && player.movement.horizontal > -2) player.movement.horizontal = -2;
		if (btn.keyCode === 39 && player.movement.horizontal < 2) player.movement.horizontal = 2;
		if (btn.keyCode === 38) player.movement.vertical = player.movement.fastVertical;
		if (btn.keyCode === 40) player.movement.vertical = 0;
		if (btn.keyCode === 65 && player.state != "passive" && player.levels.passive.level >= 50) {
			if (player.state === "slow") {
				clearInterval(game.loop),
				game.loop = setInterval(mainFunction,game.ms)
			} else if (player.state === "power") {
				player.movement.vertical /= 2;
				player.movement.fastVertical /= 2;
			}
			player.state = "passive";
			player.levels.passive.level -= 50;
			setTimeout(() => player.state = "normal", 4000);
		}
		if (btn.keyCode === 67 && player.levels.power.level > 5 && player.movement.y < game.waterLine && game.active && player.state !== "passive") { // C key
			if (player.state === "slow") {
				clearInterval(game.loop),
				game.loop = setInterval(mainFunction,game.ms)
			}
			player.state = (player.state === "power") ? "normal" : "power";
			if (player.state === "power") {
				player.movement.vertical *= 2;
				player.movement.fastVertical *= 2;
			} else {
				player.movement.vertical /= 2;
				player.movement.fastVertical /= 2;
			}
		}
		if (btn.keyCode === 83 && player.levels.slow.level > 5 && player.movement.y < game.waterLine && game.active && player.state !== "passive") { // S key
			if (player.state === "power") {
				player.movement.vertical /= 2;
				player.movement.fastVertical /= 2;
			}
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
		if (btn.keyCode === 38) player.movement.vertical /= 2; // up
		if (btn.keyCode === 40) player.movement.vertical = 1; // down
		if (btn.keyCode === 37 && player.movement.horizontal < 0) player.movement.horizontal += 2;
		if (btn.keyCode === 39 && player.movement.horizontal > 0) player.movement.horizontal -= 2;
	}
}

const pushCoor = (push) => (push.clientX - window.innerWidth/2 + sprinkles.canvas.width/2 > player.movement.x) ? player.movement.horizontal = 2 : player.movement.horizontal = -2;
const releaseCoor = (push) => player.movement.horizontal = 0;
sprinkles.canvas.addEventListener('mousedown',pushCoor);
sprinkles.canvas.addEventListener('mouseup',releaseCoor);

window.addEventListener("load",function() {
	game.sounds.theme.volume = 0.7;
	game.sounds.theme.loop = true;
	game.sounds.toggleTheme();
});
