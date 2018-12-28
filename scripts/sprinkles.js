const game = {
	ms: 30,
	on: false,
	paused: true,
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
				if (!game.paused) game.sounds.theme.play();
				this.sound.style.backgroundImage = "url('images/mute.png')";
			} else {
				game.sounds.theme.muted = true;
				this.sound.style.backgroundImage = "url('images/unmute.png')";
			}
			if (!game.on) game.pauseUnpause();
		}
	},
	instructions: document.getElementById('menu'),
	toggleInstructions() {
		if (this.on) {
			if (!this.paused) this.pauseUnpause();
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
		this.paused = !this.paused;
		if (!this.paused) {
			this.loop = setInterval(mainLoop, this.ms);
			this.sounds.theme.play();
		} else {
			clearInterval(this.loop);
			this.sounds.theme.pause();
		}
	},
	reset() {
		this.checkIfOn();
		if (this.paused) {
			this.loop = setInterval(mainLoop,this.ms);
			this.sounds.theme.play();
			if (sprinkles.canvas.style.opacity === "0") {
				sprinkles.canvas.style.opacity = 1;
				player.score.style.opacity = 1;
				canvas.levels.canvas.style.opacity = 1;
				this.instructions.style.opacity = 0;
			}
		}
		this.paused = false;
		this.sounds.theme.currentTime = 0;
		sprinkles.drops = [];
		sprinkles.targetSprinkle();
		sprinkles.speedRange = 1;
		sprinkles.dripFrequency = 0.07;
		canvas.levels.health.level = -(canvas.levels.health.level - 100);
		canvas.levels.health.height = -(canvas.levels.health.height - 100);
		canvas.levels.slow.level = -canvas.levels.slow.level;
		canvas.levels.power.level = -canvas.levels.power.level;
		canvas.levels.passive.level = 0;
		player.alive = true;
		player.points = -player.points;
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
			sprinkles.context.fillStyle = canvas.colors[player.state];
			sprinkles.context.fillRect(0, this.line, sprinkles.canvas.width, canvas.water.line);
		}
	},
	levels: {
		adjust() {
			if (Math.abs(this.health.height - this.health.level) >= this.health.heightIncrement) {
				this.health.height = (this.health.height > this.health.level) ? -this.health.heightIncrement : this.health.heightIncrement;
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
			x = 2 + x * this.canvas.width;
			const y = this.canvas.height;
			const width = this.width;
			height = -Math.round(height);
			this.context.fillStyle = color;
			this.context.fillRect(x, y, width, height);
		},
		clear(x, height, c='') {
			x = 2 + x * this.canvas.width;
			const y = 0;
			const width = this.width;
			height = this.canvas.height - height
			this.context.clearRect(x, y, width, height);
		},
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
				const color = canvas.colors["green"];
				canvas.levels[increment > 0 ? "draw" : "clear"](0.25, this._level * 2, color);
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
				const color = canvas.colors["blue"];
				canvas.levels[increment > 0 ? "draw" : "clear"](0.5, this._level * 2, color);
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
				const color = canvas.colors["magenta"];
				canvas.levels[increment > 0 ? "draw" : "clear"](0.75, this._height, color);
			}
		},
		health:  {
			heightIncrement: 25,
			increment: 100,
			_level: 100,
			get level() {
				return this._level;
			},
			set level(increment) {
				this._level += increment;
				player.score.children[1].innerHTML = `H : ${this.level.toFixed(0)}`;
			},
			_height: 0,
			get height() {
				return this._height;
			},
			set height(increment) {
				this._height += increment;
				this.layers(this._height, increment > 0 ? 'positive' : 'negative');
			},
			layers(height, increment, n = 0, max = 1700) {
				if (increment === 'negative' && n === 0 && height <= max) {
					canvas.levels.clear(0, height / 4);
				} else {
					const y = (height < max) ? height / -4 : max / -4; // negative fill
					const color = canvas.colors.red[n];
					canvas.levels.draw(0, -y, color)
					if (max >= 75 && height >= max) {
						this.layers(height - max, increment, n + 1, max - 75);
					}
				}
			}
		}
	}
}
canvas.colors = colors.canvas;
canvas.levels.canvas = document.getElementById("levels-canvas");
canvas.levels.context = canvas.levels.canvas.getContext("2d");
canvas.levels.max = canvas.levels.canvas.height / 2;

function Sprinkle(width, height, x, color, speed) {
	this.width = width + Math.floor(Math.random() * width);
	this.height = height + Math.floor(Math.random() * height);
	this.x = x;;
	this.y = -this.height;
	this.color = color;
	this.speed = speed + Math.floor(Math.random() * sprinkles.speedRange);
	this.trueSpeed = speed;
}

Sprinkle.prototype.proximityCheck = function() {
	const size = player.size;
	const passiveGap = 50;
	const position = player.positionMovement;
	return (this.y < position.y + size
		&& this.x < position.x + size + passiveGap
		&& this.x + this.width > position.x - passiveGap
		&& this.y > position.y - 100);
}

Sprinkle.prototype.passiveMovement = function() {
	if (player.state === "passive") {
		if (this.proximityCheck()) {
			const sprinkleX = this.x + this.width / 2;
			const playerX = player.positionMovement.x + player.size / 2;
			this.x += (sprinkleX > playerX) ? 2 : -2;
		}
	}
}

Sprinkle.prototype.checkRemoval = function() {
	if (this.y >= sprinkles.canvas.height || this.collisionCheck()) {
		const index = sprinkles.drops.indexOf(this);
		sprinkles.drops.splice(index, 1); // sprinkles.drops.splice(index) to remove all sprinkles behind 
		return true;
	}
	return false;
}

Sprinkle.prototype.colorAndSpeed = function() {
	const topOfSprinkle = this.y + this.height;
	let color;
	if (topOfSprinkle < canvas.sky.line) {
		color = 'white';
		if (!player.alive) {
			this.speed += this.trueSpeed * 0.25;
		} else if (topOfSprinkle - this.speed <= 0) {
			this.speed = this.trueSpeed * 1.5;
		}
	} else if (topOfSprinkle < canvas.water.line) {
		color =  this.color;
		if (!player.alive && this.y > canvas.sky.line) {
			this.speed -= this.trueSpeed * 0.25;
		} else if (this.speed > this.trueSpeed) {
			this.speed -= this.speed * 0.1;
		}
	} else {
		color = 'black';
		if (!player.alive) {
			this.speed -= this.trueSpeed * 0.1;
		} else if (this.speed > 0.5) {
			this.speed -= this.speed * 0.025;
		}
	}
	sprinkles.context.fillStyle = color;
}

Sprinkle.prototype.collided = function(top, bottom, left, right, playTop, playBottom, playLeft, playRight) {
	return ((playBottom >= top && playBottom <= bottom
		&& playLeft >= left && playLeft <= right)
	|| (playBottom >= top && playBottom <= bottom
		&& playRight >= left && playRight <= right)
	|| (playTop >= top && playTop <= bottom
		&& playLeft >= left && playLeft <= right)
	|| (bottom >= playTop && bottom <= playBottom
		&& left >= playLeft && left <= playRight)
	|| (bottom >= playTop && bottom <= playBottom
		&& right >= playLeft && right <= playRight)
	|| (top >= playTop && top <= playBottom
		&& left >= playLeft && left <= playRight))
	&& bottom < canvas.water.line && bottom > canvas.sky.line;
}

Sprinkle.prototype.collisionCheck = function() {
	if (player.alive) {
		const top = this.y;
		const bottom = this.y + this.height;
		const left = this.x;
		const right = this.x + this.width;
		const playerTop = player.positionMovement.y;
		const playerBottom = player.positionMovement.y + player.size;
		const playerLeft = player.positionMovement.x
		const playerRight = player.positionMovement.x + player.size;
		if (this.collided(top, bottom, left, right, playerTop, playerBottom, playerLeft, playerRight)) {
			game.sounds.soundlooper();
			if (player.state === "power" || player.state === "passive") {
				if (player.state === "power") canvas.levels.power.level = -5;
				canvas.levels.health.level = (player.state === "power") ? 10 : 100;
				player.points = 200;
				player.positionMovement.y -= Math.ceil(Math.random() * 5 + 5);
			} else {
				canvas.levels.health.level = -canvas.levels.health.increment;
				if (canvas.levels.health.level < 0) {
					canvas.levels.health.level = -canvas.levels.health.level;
					player.alive = false;
					player.score.children[1].innerHTML = "You Died";
					if (player.state === "slow" || player.state === "passive") player.state = "normal";
					return false;
				} else {
					player.positionMovement.y += sprinkles.playerImpact();
				}
			}
			return true;
		}
	}
	return false;
}

Sprinkle.prototype.adjust = function() {
	this.y += this.speed;
	this.passiveMovement();
	const removed = this.checkRemoval();
	if (!removed) {
		this.colorAndSpeed();
		sprinkles.context.fillRect(this.x, this.y, this.width, this.height);
	}
}

const sprinkles = {
	drops: [],
	speedRange: 1, // range of  possible speed
	dripFrequency: 0.07, //max of 2.5
	playerImpact: () => Math.ceil(Math.random() * 15 + 10),
	dripCheck() {
		if (Math.random() < this.dripFrequency) this.drip();
	},
	drip() {
		const widthRange = 5;
		const heightRange = 10;
		const x = Math.floor(Math.random() * sprinkles.canvas.width - widthRange);
		const speed = Math.ceil(Math.random() * (this.speedRange * 2)) / 2;
		const color = sprinkles.colors[Math.floor(Math.random() * sprinkles.colors.length)];
		sprinkles.drops.push(new Sprinkle(widthRange, heightRange, x, color, speed));
	},
	adjustSprinkles() {
		// backwards iteration to allow index removal 
		for (let i = sprinkles.drops.length - 1; i >= 0; i--) {
			sprinkles.drops[i].adjust();
		}
	},
	targetSprinkle() {
		const widthRange = 5;
		const heightRange = 10;
		const x = sprinkles.canvas.width / 2 - widthRange;
		const speed = Math.ceil(Math.random() * (this.speedRange * 2)) / 2;
		const color = sprinkles.colors[Math.floor(Math.random() * sprinkles.colors.length)];
		sprinkles.drops.push(new Sprinkle(widthRange, heightRange, x, color, speed));
	}
}
sprinkles.canvas = document.getElementById('sprinkle-canvas');
sprinkles.context = sprinkles.canvas.getContext('2d');
sprinkles.colors = colors.sprinkles;
canvas.water.line = sprinkles.canvas.height - 100;

const player = {
	alive: true,
	size: 10,
	_points: 0,
	get points() {
		return this._points;
	},
	set points(increment) {
		this._points += increment;
		this.score.children[0].innerHTML = `P : ${this.points}`;
	},
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
	levelUp() {
		canvas.levels.health.level = canvas.levels.health.increment;
		this.points = 1000;
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
				canvas.levels.health.level = 1;
				this.points = 5;
			} else if (this.state === "passive") {
				canvas.levels.health.level = 5;
				this.points = 10;
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
		if (this.positionMovement.y + this.size < canvas.sky.line) this.levelUp();
	},
	img: {
		x: 0,
		steps: 0,
		image: new Image(),
		adjustSprite: function() {
			this.steps++;
			if (this.steps == 10) {
				this.x += this.steps;
				if (this.x == 80) {
					this.x = 0;
				}
				this.steps = 0;
			}
		}
	}
}

player.score = document.getElementById("score-box");
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
	player.img.adjustSprite();
}

function mainLoop() {
	sprinkles.context.clearRect(0, 0, sprinkles.canvas.width, sprinkles.canvas.height);
	canvas.sky.draw();
	canvas.water.draw();
	sprinkles.adjustSprinkles();
	if (player.alive) {
		sprinkles.dripCheck();
		player.safeCheck();
		canvas.levels.adjust();
	}
	player.adjust();
}
