const game = {
	on: false,
	active: false,
	// interval speed 
	ms: 30,
	sounds: {
		notecounter: 1,
		soundlooper() {
			if (!this.theme.muted) {
				this[player.state][this.notecounter].play();
			}
			game.sounds.notecounter < 7 ? this.notecounter++ : this.notecounter = 0;
		}
	},
	buttons: {
		reset: document.getElementById("reset"),
		sound: document.getElementById("sound"),
		countrols: document.getElementById("show-controls"),
		soundImageToggle() {
			if (game.sounds.theme.muted) {
				game.sounds.theme.muted = false;
				if (game.active) game.sounds.theme.play();
				this.sound.style.backgroundImage = "url('mute.png')";
			} else {
				game.sounds.theme.muted = true;
				this.sound.style.backgroundImage = "url('unmute.png')";
			}
			if (!game.on) game.pauseUnpause();
		}
	},
	showControls() {
		if (this.on) {
			if (this.active || sprinkles.canvas.style.opacity === "1") {
				if (this.active) this.pauseUnpause();
				sprinkles.canvas.style.opacity = 0;
				player.score.style.opacity = 0;
				canvas.levels.canvas.style.opacity = 0;
				document.getElementById('menu').style.opacity = 1;
			} else {
				sprinkles.canvas.style.opacity = 1;
				player.score.style.opacity = 1;
				canvas.levels.canvas.style.opacity = 1;
				document.getElementById('menu').style.opacity = 0;
			}
		} else {
			this.pauseUnpause();
		}
	},
	pauseUnpause() {
		if (document.getElementById('menu').style.opacity == "1") {
			sprinkles.canvas.style.opacity = 1;
			player.score.style.opacity = 1;
			canvas.levels.canvas.style.opacity = 1;
			document.getElementById('menu').style.opacity = 0;
		}
		if (!this.on) {
			this.on = true;
			document.getElementById('welcome').style.display = 'none';
		}
		this.active = !this.active;
		if (this.active) {
			this.loop = setInterval(mainLoop, this.ms);
			this.sounds.theme.play();
		} else {
			clearInterval(this.loop);
			this.sounds.theme.pause();
		}
	},
	reset() {
		if (!this.on) {
			this.on = true;
			document.getElementById('welcome').style.display = 'none';
		}
		if (!this.active) {
			this.loop = setInterval(mainLoop,this.ms);
			this.sounds.theme.play();
			if (sprinkles.canvas.style.opacity === "0") {
				sprinkles.canvas.style.opacity = 1;
				player.score.style.opacity = 1;
				canvas.levels.canvas.style.opacity = 1;
				document.getElementById('menu').style.opacity = 0;
			}
		}
		this.active = true;
		this.sounds.theme.currentTime = 0;
		sprinkles.drops = [];
		sprinkles.speedRange = 1;
		sprinkles.dripFrequency = 0.07;
		canvas.levels.health.level = canvas.levels.health.height = 100;
		canvas.levels.slow.level = canvas.levels.power.level = canvas.levels.passive.level = canvas.levels.passive.height = 0;
		player.alive = true;
		player.points = 0;
		player.positionMovement.x = (sprinkles.canvas.width / 2) - 5;
		player.positionMovement.y = sprinkles.canvas.height * 0.92;
		player.positionMovement.horizontal = 0;
		player.positionMovement.vertical = 1;
		player.positionMovement.speed = 3;
	},
	setSpeed(ms) {
		clearInterval(this.loop);
		this.loop = setInterval(mainLoop, ms);
	}
}

const canvas = {
	waterShade: 40, // sets shade of blue
	waterRise: true,
	waterAdjust() { //
		this.waterShade += (this.waterRise) ? 1 : -1;
		if (this.waterShade >= 88 || this.waterShade <= 40) this.waterRise = !this.waterRise;
	},
	drawSky() {
		sprinkles.context.fillStyle = player.colors[player.state];
		sprinkles.context.fillRect(0, 
			this.cloudThickness,
			sprinkles.canvas.width,
			this.waterLine);
	},
	drawWater() {
		const fillIt = '#0000'+ this.waterShade.toString();
		sprinkles.context.fillStyle = fillIt;
		sprinkles.context.fillRect(0, this.waterLine, sprinkles.canvas.width, sprinkles.canvas.height);
		this.waterAdjust();
	},
	levels: {
		max: 212.25,
		increment: 0.16,
		slow: {
			level: 0,
		},
		power:  {
			level: 0,
		},
		passive:  {
			level: 0,
			height: 0	// moves towards level, used for drawing height on canvas
		},
		health:  {
			level: 100,	// max None
			height: 100,	
			drawLayers(height, n, max) {
				canvas.levels.context.fillStyle = player.colors.red[n];
				if (height <= max) {
					canvas.levels.context.fillRect(
						2, 
						canvas.levels.canvas.height - height / 4,
						25,
						canvas.levels.canvas.height - (Math.abs(canvas.levels.canvas.height - height / 4))
					);
				} else {
					canvas.levels.context.fillRect(
						2, 
						canvas.levels.canvas.height - max / 4, 
						25, 
						canvas.levels.canvas.height - (Math.abs(canvas.levels.canvas.height - max / 4))
					);
					if (max >= 75) canvas.levels.health.drawLayers(height - max, n + 1, max - 75);
				}
			}
		},
	},
	adjustBars() {
		const levels = this.levels;
		if (Math.abs(levels.health.height - levels.health.level) > 10) {
			levels.health.height += (levels.health.height > levels.health.level) ? -10 : 10;
		}
		if (Math.abs(levels.passive.height - levels.passive.level) > 1) {
			levels.passive.height += (levels.passive.height > levels.passive.level) ? -2 : 2; 
			// because passive level only drops in high amounts
		}
		if (player.state === "normal") {
			if (player.positionMovement.vertical > 0 && player.positionMovement.y < canvas.waterLine) {
				if (levels.slow.level < levels.max) {
					levels.slow.level += levels.increment;
				} else if (levels.power.level < levels.max) {
					levels.power.level += levels.increment / 2;
				} else if (levels.passive.level < levels.max * 2) {
					levels.passive.level += levels.increment / 4;
				} else if (sprinkles.dripFrequency > 0.07) {
					sprinkles.dripFrequency -= levels.increment / 8000;
				}
			}
		} else {
			if (player.state === "passive") {
					
			} else if (player.state === "power") {
				if (levels.power.level < 0) {
					player.setState = "normal";
					levels.power.level = 0;
				} else {
					levels.power.level -= levels.increment * 1.25;
				}
			} else if (player.state === "slow") {
				if (levels.slow.level < 0) {
					player.setState = "normal";
					levels.slow.level = 0;
					game.setSpeed(game.ms);
				} else {
					levels.slow.level -= levels.increment / 2;
				}
			} else {
				alert("Error: player state is " + player.state);
			}
		}
	},
	barDraw() {
		this.adjustBars();
		const width = 25;
		this.levels.context.clearRect(0, 0, this.levels.canvas.width, this.levels.canvas.height);
		this.levels.health.drawLayers(this.levels.health.height, 0, 1700);
		this.levels.context.fillStyle = player.colors['green'];
		this.levels.context.fillRect(
			2 + 0.25 * this.levels.canvas.width,
			this.levels.canvas.height - (this.levels.slow.level * 2),
			width,
			(Math.abs(this.levels.canvas.height - this.levels.slow.level) * 2)
		);
		this.levels.context.fillStyle = player.colors['blue'];
		this.levels.context.fillRect(
			2 + 0.5 * this.levels.canvas.width,
			this.levels.canvas.height - (this.levels.power.level * 2),
			width,
			Math.abs(this.levels.canvas.height - this.levels.power.level * 2)
		);
		this.levels.context.fillStyle = player.colors['magenta'];
		this.levels.context.fillRect(
			2 + 0.75 * this.levels.canvas.width,
			this.levels.canvas.height - this.levels.passive.height,
			width,
			this.levels.canvas.height - (Math.abs(this.levels.canvas.height - this.levels.passive.height))
		);
	}
}

function mainLoop() {
	sprinkles.context.clearRect(0, 0, sprinkles.canvas.width, sprinkles.canvas.height);
	canvas.drawSky();
	canvas.drawWater();
	sprinkles.adjust_sprinkles();
	if (player.alive) {
		sprinkles.dripCheck();
		player.safeCheck();
		canvas.barDraw();
		player.updateStats();
	}
	player.adjust();
}

function Sprinkle(width, height, color, speed) {
	this.width = width + Math.floor(Math.random() * width);
	this.height = height + Math.floor(Math.random() * height);
	this.x = Math.floor(Math.random() * sprinkles.canvas.width - this.width);;
	this.y = -this.height;
	this.color = color;
	this.speed = speed + Math.floor(Math.random() * sprinkles.speedRange);
	this.trueSpeed = speed;
}

Sprinkle.prototype.adjust = function() {
	this.y += this.speed;
	if (player.state === "passive")
		if (sprinkles.passiveCheck(this))
			(this.x > player.positionMovement.x + player.size/2) ? this.x+=2 : this.x-=2;
	if (this.y >= sprinkles.canvas.height || player.collision(this)) {
		const index = sprinkles.drops.indexOf(this);
		sprinkles.removalIndexes.push(index);
	}
	if (this.y + this.height < canvas.cloudThickness) {
		sprinkles.context.fillStyle = 'white';
		(!player.alive) ? this.speed += this.trueSpeed * 0.25 : 
			(this.y + this.height - this.speed <= 0) ? 
				this.speed = this.trueSpeed * 1.5 : null;
	} else if (this.y + this.height < canvas.waterLine) {
		sprinkles.context.fillStyle =  this.color;
		this.speed -= (!player.alive && this.y > canvas.cloudThickness) ?	this.trueSpeed * 0.25 :
			(this.speed > this.trueSpeed) ? this.speed * 0.1 : 0;
	} else {
		sprinkles.context.fillStyle = 'black';
		this.speed -= (!player.alive) ? this.trueSpeed * 0.1 : 
			(this.speed > 0.5) ? this.speed * 0.025 : 0;
	}
	sprinkles.context.fillRect(this.x, this.y, this.width, this.height);
}

const sprinkles = {
	drops: [],
	speedRange: 1, // range of  possible speed 
	dripFrequency: 0.07, //max of 2.5
	playerImpact: () => Math.ceil(Math.random() * 20 + 5),
	dripCheck: function() {
		if (Math.random() < this.dripFrequency) this.drip();
	},
	drip: function() {
		const widthRange = 5;
		const heightRange = 10;
		const speedRange = 1;
		const color = sprinkles.colors[Math.floor(Math.random() * sprinkles.colors.length)];
		sprinkles.drops.push(new Sprinkle(widthRange, heightRange, color, speedRange));
	},
	passiveCheck: function(drop) {
		const passiveGap = 50;
		return (drop.y < player.positionMovement.y + player.size 
			&& drop.x < player.positionMovement.x + player.size + passiveGap 
			&& drop.x + drop.width > player.positionMovement.x - passiveGap 
			&& drop.y > player.positionMovement.y - 100);
	},
	removalIndexes: [],
	adjust_sprinkles: function() {
		this.removalIndexes = [];
		for (let drop in sprinkles.drops) {
			sprinkles.drops[drop].adjust()
		}
		if (this.removalIndexes.length > 1) {
	      	for (let i = 0; i < this.removalIndexes.length; i++) sprinkles.drops.splice(this.removalIndexes[0], 1);
	    } else if (this.removalIndexes.length == 1) {
	      	sprinkles.drops.splice(this.removalIndexes[0], 1);
	    }
	}
}
sprinkles.canvas = document.getElementById('sprinkle-canvas');
sprinkles.context = sprinkles.canvas.getContext('2d');
sprinkles.colors = colors.sprinkles;
canvas.cloudThickness = 100;
canvas.waterLine = sprinkles.canvas.height - 100;

const player = {
	alive: true,
	size: 10,
	points: 0,
	positionMovement: {
		x: (sprinkles.canvas.width / 2) - 5,
		y: sprinkles.canvas.height * 0.92,
		horizontal: 0,
		vertical: 1,
		fastVertical: 2,
		speed: 3,
	},
	status: "normal",
	get state() {
		return this.status;
	},
	set setState(newState) {
		if (['normal', 'power', 'slow', 'passive'].includes(newState)) {
				game.sounds.theme.pause();
				game.sounds.theme.currentTime;
				if (this.state === "power") {
					this.positionMovement.vertical /= 2;
					this.positionMovement.fastVertical /= 2;
				} else if (this.state === "power") {
					this.positionMovement.vertical *= 2;
					this.positionMovement.fastVertical *= 2;
				}
				this.status = newState;
				game.sounds.theme = game.sounds[`${newState}Theme`];
				const mute = game.sounds.theme.muted;
				if (!mute) game.sounds.theme.play();
			}
	},
	levelup() {
		canvas.levels.health.level += 100;
		this.points += 1000;
		this.positionMovement.y = sprinkles.canvas.height * 0.92;
		if (this.state != "normal" && player.state != "passive") {
			if (this.state === "power") {
			}
			if (this.state === "slow") {
				game.setSpeed(game.ms);
			}
			this.setState = "normal";
		}
		if (sprinkles.speedRange <= 4.9) sprinkles.speedRange += 0.1;
		if (sprinkles.dripFrequency < .25) sprinkles.dripFrequency += 0.005;
	},
	adjust() {
		if (this.alive) {
			if (this.state === "power") this.levels.health.level += 1, this.points += 5;
			if (this.state === "passive") this.levels.health.level += 5, this.points += 10;
			if (this.positionMovement.horizontal < 0 && player.positionMovement.x < 1 
					|| this.positionMovement.horizontal > 0 
					&& this.positionMovement.x > sprinkles.canvas.width - this.size) {
				this.positionMovement.horizontal = 0;
			}
			this.positionMovement.x += this.positionMovement.horizontal;
			this.positionMovement.y -= this.positionMovement.vertical;
		} else if (this.positionMovement.y < sprinkles.canvas.height) {
			this.positionMovement.y += 3;
		}
		this.draw();
	},
	safeCheck() {
		if (this.positionMovement.y + this.size < canvas.cloudThickness) this.levelup();
	},
	collision(drop) {
		if (this.alive) {
			const dropUp = drop.y;
			const dropDwn = drop.y + drop.height;
			const dropLft = drop.x;
			const dropRgt = drop.x + drop.width;
			const playUp = this.positionMovement.y;
			const playDwn = this.positionMovement.y + this.size;
			const playLft = this.positionMovement.x
			const playRgt = this.positionMovement.x + this.size;
			if (((playDwn >= dropUp && playDwn <= dropDwn 
						&& playLft >= dropLft && playLft <= dropRgt) 
					|| (playDwn >= dropUp && playDwn <= dropDwn 
						&& playRgt >= dropLft && playRgt <= dropRgt) 
					|| (playUp >= dropUp && playUp <= dropDwn 
						&& playLft >= dropLft && playLft <= dropRgt) 
					|| (dropDwn >= playUp && dropDwn <= playDwn
						&& dropLft >= playLft && dropLft <= playRgt)
					|| (dropDwn >= playUp && dropDwn <= playDwn
						&& dropRgt >= playLft && dropRgt <= playRgt) 
					|| (dropUp >= playUp && dropUp <= playDwn 
						&& dropLft >= playLft && dropLft <= playRgt)) 
					&& dropDwn < canvas.waterLine && dropDwn > canvas.cloudThickness) {
				game.sounds.soundlooper();
				if (this.state === "power" || this.state === "passive") {
					if (this.state === "power") canvas.levels.power.level -= 5;
					canvas.levels.health.level += (this.state === "power") ? 10 : 100;
					this.points += 200;
					this.positionMovement.y -= Math.ceil(Math.random() * 5 + 5);
				} else {
					canvas.levels.health.level -= 100;
					if (canvas.levels.health.level < 0) {
						canvas.levels.health.level = 0;
						canvas.levels.health.height = 0;
						this.alive = false;
						canvas.barDraw();
						this.score.children[1].innerHTML = "You Died";
						if (this.state === "slow" || this.state === "passive") this.setState = "normal";
						return false;
					} else {
						this.positionMovement.y += sprinkles.playerImpact();
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
				if (player.img.x == 80) {
					player.img.x = 0;
				}
				player.img.steps = 0;
			}
		}
	},
	updateStats() {
		this.score.children[0].innerHTML = `PTS : ${this.points}`;
		this.score.children[1].innerHTML = `HP : ${canvas.levels.health.level.toFixed(0)}`;
	}
}

player.colors = colors.player;
player.score = document.getElementById("score-box");
canvas.levels.canvas = document.getElementById("levels-canvas");
canvas.levels.context = canvas.levels.canvas.getContext("2d");
player.img.image.src = 'images/player.png';
player.draw = function() {
	sprinkles.context.drawImage(player.img.image,
		player.img.x,
		0,
		player.size,
		player.size * 2,
		player.positionMovement.x,
		player.positionMovement.y,
		player.size,
		player.size * 2
	);
	player.img.adjust();
}

document.addEventListener("keydown", pushedKey);
document.addEventListener("keyup", releasedKey);

function pushedKey(btn) {// 90 z, 88 x, 67 c
	if (btn.keyCode === 65) game.pauseUnpause(); // space
	if (btn.keyCode === 82) game.reset();  // R
	if (player.alive) {
		if (btn.keyCode === 37 && player.positionMovement.horizontal > -2) player.positionMovement.horizontal = -2;
		if (btn.keyCode === 39 && player.positionMovement.horizontal < 2) player.positionMovement.horizontal = 2;
		if (btn.keyCode === 38) player.positionMovement.vertical = player.positionMovement.fastVertical;
		if (btn.keyCode === 40) player.positionMovement.vertical = 0;
		if (btn.keyCode === 83 
			&& canvas.levels.slow.level > 5 
			&& player.positionMovement.y < canvas.waterLine 
			&& game.active && player.state !== "passive") { // S key Slow
			player.setState = (player.state === "slow" ? "normal" : "slow");
			game.setSpeed(player.state === "slow" ? game.ms * 2 : game.ms);
		}	
		if (btn.keyCode === 68 
			&& canvas.levels.power.level > 5 
			&& player.positionMovement.y < canvas.waterLine 
			&& game.active && player.state !== "passive") { // D key Power
			if (player.state === "slow") game.setSpeed(game.ms);
			player.setState = (player.state === "power" ? "normal" : "power");
		}
		if (btn.keyCode === 70 && player.state != "passive" 
		&& canvas.levels.passive.level >= 50) { // F Key Passive
			if (player.state === "slow") game.setSpeed(game.ms)
			player.setState = "passive";
			canvas.levels.passive.level -= 50;
			setTimeout(() => player.setState = "normal", 4000);
		}
	}
	if (!game.on) game.pauseUnpause();
}

function releasedKey(btn) {
	if (player.alive) {
		if (btn.keyCode === 38) player.positionMovement.vertical /= 2; // up
		if (btn.keyCode === 40) player.positionMovement.vertical = 1; // down
		if (btn.keyCode === 37 && player.positionMovement.horizontal < 0) player.positionMovement.horizontal += 2;
		if (btn.keyCode === 39 && player.positionMovement.horizontal > 0) player.positionMovement.horizontal -= 2;
	}
}

const pushCoor = function(push) {
	const mouse = push.clientX - window.innerWidth / 2 + sprinkles.canvas.width / 2 - player.positionMovement.x;
	if (Math.abs(mouse) >= 2) {
		player.positionMovement.horizontal = mouse >= 2 ? 2 : -2;
	}
}
const releaseCoor = (push) => player.positionMovement.horizontal = 0;
sprinkles.canvas.addEventListener('mousedown',pushCoor);
sprinkles.canvas.addEventListener('mouseup',releaseCoor);

const assignLoopability = (arr) => arr.forEach((sound) => sound.loop = true);

window.addEventListener("load", function() {
	game.sounds.normalTheme = new Audio("audio/normal/normal_theme.mp3");
	game.sounds.slowTheme = new Audio("audio/slow/slow_theme.mp3");
	game.sounds.powerTheme = new Audio("audio/power/power_theme.mp3");
	game.sounds.passiveTheme = new Audio("audio/passive_theme.mp3");
	game.sounds.theme = new Audio("audio/normal/normal_theme.mp3");
	game.sounds.theme.volume = 0.7;
	game.sounds.theme.loop = true;
	game.sounds.normal = [
		new Audio('audio/normal/D.mp3'),
		new Audio('audio/normal/G.mp3'),
		new Audio('audio/normal/D_.mp3'),
		new Audio('audio/normal/C.mp3'),
		new Audio('audio/normal/D_2.mp3'),
		new Audio('audio/normal/G2.mp3'),
		new Audio('audio/normal/D2.mp3'),
		new Audio('audio/normal/A_.mp3')
	];
	game.sounds.power = [
		new Audio('audio/power/D.mp3'),
		new Audio('audio/power/G.mp3'),
		new Audio('audio/power/DS.mp3'),
		new Audio('audio/power/C.mp3'),
		new Audio('audio/power/DS2.mp3'),
		new Audio('audio/power/G2.mp3'),
		new Audio('audio/power/D2.mp3'),
		new Audio('audio/power/AS.mp3')
	];
	game.sounds.passive = game.sounds.power;
	game.sounds.slow = [
		new Audio("audio/slow/D.mp3"),
		new Audio("audio/slow/G.mp3"),
		new Audio("audio/slow/D_2.mp3"),
		new Audio("audio/slow/C.mp3"),
		new Audio("audio/slow/D_2.mp3"),
		new Audio("audio/slow/G.mp3"),
		new Audio("audio/slow/D.mp3"),
		new Audio("audio/slow/A_.mp3")
	];
	assignLoopability(Object.keys(game.sounds)
		.filter(key => key.includes('Theme'))
		.map(key => game.sounds[key])
	);
	sprinkles.canvas.style.opacity = 1;
});

