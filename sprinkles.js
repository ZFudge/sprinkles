const game = {
	on: false,
	active: false,
	ms: 30,
	sounds: {
		notecounter: 0,
		soundlooper() {
			if (!this.theme.muted) this[player.state][this.notecounter].play();
			this.notecounter += this.notecounter < this[player.state].length-1 ? 1 : -this.notecounter;
		}
	},
	buttons: {
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
	instructions: document.getElementById('menu'),
	showInstructions() {
		if (this.on) {
			if (this.active) this.pauseUnpause();
			sprinkles.canvas.style.opacity = Number(!Number(sprinkles.canvas.style.opacity));
			player.score.style.opacity = Number(!Number(player.score.style.opacity));
			canvas.levels.canvas.style.opacity = Number(!Number(canvas.levels.canvas.style.opacity));
			this.instructions.style.opacity = Number(!Number(this.instructions.style.opacity));
		} else {
			this.pauseUnpause();
		}
	},
	welcome: document.getElementById('welcome'),
	checkIfOn() {
		if (!this.on) {
			this.on = true;
			this.welcome.style.display = 'none';
		}
	},
	pauseUnpause() {
		this.checkIfOn();
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
		this.checkIfOn();
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
		canvas.levels.health.level = 100;
		canvas.levels.health.height = -(canvas.levels.health.level - 100);
		canvas.levels.slow.level = -canvas.levels.slow.level;
		canvas.levels.power.level = -canvas.levels.power.level;
		canvas.levels.passive.level = 0;
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
game.buttons.reset = document.getElementById("reset");
game.buttons.sound = document.getElementById("sound");
game.buttons.countrols = document.getElementById("show-controls");

const canvas = {
	water: {
		shade: 40,
		rise: true,
		adjust() {
			this.shade += (this.rise) ? 1 : -1;
			if (this.shade >= 88 || this.shade <= 40) this.rise = !this.rise;
		},
		draw() {
			const fillIt = '#0000'+ this.shade.toString();
			sprinkles.context.fillStyle = fillIt;
			sprinkles.context.fillRect(0, this.line, sprinkles.canvas.width, sprinkles.canvas.height);
			this.adjust();
		}
	},
	sky: {
		line: 100,
		draw() {
			sprinkles.context.fillStyle = player.colors[player.state];
			sprinkles.context.fillRect(0,
				this.line,
				sprinkles.canvas.width,
				canvas.water.line);
		}
	},
	levels: {
		adjust() {
			if (Math.abs(this.health.height - this.health.level) >= this.health.barIncrement) {
				this.health.height = (this.health.height > this.health.level) ? -this.health.barIncrement : this.health.barIncrement;
			}
			if (Math.abs(this.passive.height - this.passive.level) >= 1) {
				this.passive.height = (this.passive.height > this.passive.level) ? -1 : 1;
			}
			if (player.state === "normal") {
				if (player.positionMovement.vertical > 0 && player.positionMovement.y < canvas.water.line) {
					if (this.slow.level < this.max) {
						this.slow.level = this.increment;
					} else if (this.power.level < this.max) {
						this.power.level = this.increment / 2;
					} else if (this.passive.level < this.max * 2) {
						this.passive.level += this.increment / 4;
					} else if (sprinkles.dripFrequency > 0.07) {
						sprinkles.dripFrequency -= this.increment / 8000;
					}
				}
			} else {
				if (player.state === "passive") {
						
				} else if (player.state === "power") {
					if (this.power.level < 0) {
						player.state = "normal";
						this.power.level = -this.power.level;
					} else {
						this.power.level = this.increment * -1.25;
					}
				} else if (player.state === "slow") {
					if (this.slow.level < 0) {
						player.state = "normal";
						this.slow.level = -this.slow.level;
						game.setSpeed(game.ms);
					} else {
						this.slow.level = this.increment * -2;
					}
				} else {
					alert("Error: player state is " + player.state);
				}
			}
		},
		draw(x, height, color) {
			this.context.fillStyle = player.colors[color];
			this.context.fillRect(
				2 + x * this.canvas.width,
				this.canvas.height, // - (this.levels.slow.level * 2),
				this.width,
				-Math.round(height)
			);
		},
		clear(x, height, c='') {
			this.context.clearRect(
				2 + x * this.canvas.width,
				0,
				this.width,
				this.canvas.height - height
			);
		},
		max: 212.25,
		increment: 0.16,
		width: 25,
		slow: {
			ready: true,
			_level: 0,
			get level() {
				return this._level;
			},
			set level(increment){
				this._level += increment;
				canvas.levels[increment > 0 ? "draw" : "clear"](0.25, this._level * 2, "green");
			}
		},
		power:  {
			ready: true,
			_level: 0,
			get level() {
				return this._level;
			},
			set level(increment){
				this._level += increment;
				canvas.levels[increment > 0 ? "draw" : "clear"](0.5, this._level * 2, "blue");
			}
		},
		passive:  {
			level: 0,
			_height: 0,
			get height() {
				return this._height;
			},
			set height(increment) {
				this._height += increment;
				canvas.levels[increment > 0 ? "draw" : "clear"](0.75, this._height, "magenta");
			}
		},
		health:  {
			level: 100,
			_height: 0,
			barIncrement: 25,
			increment: 100,
			get height() {
				return this._height;
			},
			set height(increment) {
				this._height += increment;
				this.drawLayers(this._height, increment > 0 ? 'positive' : 'negative');
			},
			drawLayers(height, increment, n = 0, max = 1700) {
				canvas.levels.context.fillStyle = player.colors.red[n];
				if (height <= max && increment === 'negative' && n === 0) {
					canvas.levels.clear(0, height / 4);
				} else if (height <= max) {
					canvas.levels.context.fillRect(
						2,
						canvas.levels.canvas.height - height / 4,
						canvas.levels.width,
						canvas.levels.canvas.height - (Math.abs(canvas.levels.canvas.height - height / 4))
					);
				} else {
					canvas.levels.context.fillRect(
						2,
						canvas.levels.canvas.height - max / 4,
						canvas.levels.width,
						canvas.levels.canvas.height - (Math.abs(canvas.levels.canvas.height - max / 4))
					);
					if (max >= 75) this.drawLayers(height - max, increment, n + 1, max - 75);
				}
			}
		}
	}
}

function mainLoop() {
	sprinkles.context.clearRect(0, 0, sprinkles.canvas.width, sprinkles.canvas.height);
	canvas.sky.draw();
	canvas.water.draw();
	sprinkles.adjust_sprinkles();
	if (player.alive) {
		sprinkles.dripCheck();
		player.safeCheck();
		canvas.levels.adjust();
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
			this.x += (this.x > player.positionMovement.x + player.size/2) ? 2 : -2;
	if (this.y >= sprinkles.canvas.height || player.collision(this)) {
		const index = sprinkles.drops.indexOf(this);
		sprinkles.removalIndexes.push(index);
	}
	if (this.y + this.height < canvas.sky.line) {
		sprinkles.context.fillStyle = 'white';
		(!player.alive) ? this.speed += this.trueSpeed * 0.25 :
			(this.y + this.height - this.speed <= 0) ?
				this.speed = this.trueSpeed * 1.5 : null;
	} else if (this.y + this.height < canvas.water.line) {
		sprinkles.context.fillStyle =  this.color;
		this.speed -= (!player.alive && this.y > canvas.sky.line) ?	this.trueSpeed * 0.25 :
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
canvas.water.line = sprinkles.canvas.height - 100;

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
	_state: "normal",
	get state() {
		return this._state;
	},
	set state(newState) {
		if (['normal', 'power', 'slow', 'passive'].includes(newState)) {
				game.sounds.theme.pause();
				game.sounds.theme.currentTime;
				if (this.state === "power") {
					this.positionMovement.vertical /= 2;
					this.positionMovement.fastVertical /= 2;
				} else if (newState === "power") {
					this.positionMovement.vertical *= 2;
					this.positionMovement.fastVertical *= 2;
				}
				this._state = newState;
				game.sounds.theme = game.sounds[`${newState}Theme`];
				const mute = game.sounds.theme.muted;
				if (!mute) game.sounds.theme.play();
			}
	},
	levelup() {
		canvas.levels.health.level += canvas.levels.health.increment;
		this.points += 1000;
		this.positionMovement.y = sprinkles.canvas.height * 0.92;
		if (this.state != "normal" && player.state != "passive") {
			if (this.state === "power") {
			}
			if (this.state === "slow") {
				game.setSpeed(game.ms);
			}
			this.state = "normal";
		}
		if (sprinkles.speedRange <= 4.9) sprinkles.speedRange += 0.1;
		if (sprinkles.dripFrequency < .25) sprinkles.dripFrequency += 0.005;
	},
	adjust() {
		if (this.alive) {
			if (this.state === "power") {
				canvas.levels.health.level += 1;
				this.points += 5;
			} else if (this.state === "passive") {
				canvas.levels.health.level += 5;
				this.points += 10;
			}
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
		if (this.positionMovement.y + this.size < canvas.sky.line) this.levelup();
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
					&& dropDwn < canvas.water.line && dropDwn > canvas.sky.line) {
				game.sounds.soundlooper();
				if (this.state === "power" || this.state === "passive") {
					if (this.state === "power") canvas.levels.power.level = -5;
					canvas.levels.health.level += (this.state === "power") ? 10 : 100;
					this.points += 200;
					this.positionMovement.y -= Math.ceil(Math.random() * 5 + 5);
				} else {
					canvas.levels.health.level -= canvas.levels.health.increment;
					if (canvas.levels.health.level < 0) {
						canvas.levels.health.level = 0;
						this.alive = false;
						this.score.children[1].innerHTML = "You Died";
						if (this.state === "slow" || this.state === "passive") this.state = "normal";
						return false;
					} else {
						this.positionMovement.y += sprinkles.playerImpact();
					}
				}
				return true;
			}
		}
		return false;
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
