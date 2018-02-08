const game = {
	active: true,
	canvas: document.getElementById('sprinkle-canvas'),
	ms: 30, // milliseconds in each interval
	waterShade: 40, // sets shade of blue
	waterRise: true,
	waterAdjust() { //
		(game.waterRise) ? game.waterShade++ : game.waterShade--;
		if (game.waterShade >= 88 || game.waterShade <= 40) game.waterRise = !game.waterRise;
	},
	refresh() {
		sprinkles.drops = [];
		game.active = true;
		sprinkles.speedrange = 1;
		sprinkles.dripFrequency = 0.07;
	
		player.health.width = player.slow.width = player.power.width = player.passive.width = 0;
		player.alive = true;
		player.points = 0;
		player.health.level = 0;
		player.slow.level = 0;
		player.points.level = 0;
		player.x = (game.canvas.width/2)-5;
		player.y = game.canvas.height*0.92;
		player.horizontal = 0;
		player.vertical = 1;
		player.speed = 3;
	},
	pauseUnpause() {
		(game.active) ? clearInterval(game.interval) : game.interval = setInterval(sprinkling,game.ms);
		game.active = !game.active;
	},
	sounds: {
		notecounter: 1,
		normal: [ new Audio('audio/normal/D.mp3'), new Audio('audio/normal/G.mp3'), new Audio('audio/normal/D_.mp3'), new Audio('audio/normal/C.mp3'), new Audio('audio/normal/D_2.mp3'), new Audio('audio/normal/G2.mp3'), new Audio('audio/normal/D2.mp3'), new Audio('audio/normal/A_.mp3') ],
		power: [ new Audio('audio/power/D.mp3'), new Audio('audio/power/G.mp3'), new Audio('audio/power/DS.mp3'), new Audio('audio/power/C.mp3'), new Audio('audio/power/DS2.mp3'), new Audio('audio/power/G2.mp3'), new Audio('audio/power/D2.mp3'), new Audio('audio/power/AS.mp3') ],
		theme: new Audio('audio/normal/sprinkles_2.mp3'),
		slowTheme: new Audio('audio/normal/slow_theme.mp3'),
		toggleTheme() {
			if (player.slow.on) {
				game.sounds.theme.pause();
				game.sounds.slowTheme.play();
			} else {
				game.sounds.theme.play();
				game.sounds.slowTheme.pause();
			}
		},
		soundlooper() {
			(player.power.on) ? this.power[this.notecounter].play() : this.normal[this.notecounter].play();
			(game.sounds.notecounter < 7) ? this.notecounter++ : this.notecounter = 0;
		}
	},
	buttons: {
		reset: document.getElementById("reset")
	},
	t: false
}
game.context = game.canvas.getContext('2d');
game.cloudThickness = game.canvas.height*0.20;
game.waterLine = game.canvas.height*0.8; //320,
game.interval = setInterval(sprinkling,game.ms);

function sprinkling() {
	game.context.fillStyle = "black";
	game.context.fillRect(0, 0, game.canvas.width, game.canvas.height);

	(player.passive.on) ? game.context.fillStyle = player.colors.passivesky : (player.power.on) ? game.context.fillStyle = player.colors.powersky : (player.slow.on) ? game.context.fillStyle = player.colors.slowsky : game.context.fillStyle = player.colors.gloom;
	game.context.fillRect(0, game.cloudThickness, game.canvas.width, game.waterLine);

	let fillIt = '#0000'+ game.waterShade.toString();
	game.context.fillStyle = fillIt;
	game.context.fillRect(0, game.waterLine, game.canvas.width, game.canvas.height);
	game.waterAdjust();

	sprinkles.adjust();

	if (player.alive) {
		if (Math.random() < sprinkles.dripFrequency) sprinkles.drip();
		player.safeCheck();
		player.barDraw();
	}
	player.adjust();
	player.stats();
}

const player = {
	size: 10,
	x: (game.canvas.width/2)-5,
	y: game.canvas.height*0.92,
	horizontal: 0,
	vertical: 1,
	fastvertical: 2,
	speed: 3,
	alive: true,
	//pointcounter: document.getElementById('points'),
	points: 0,
	color: "#ccc",
	colors: { magenta: '#AE00FF', blue: '#0BF', green: '#0F2', red: ['#F11','#C00','#900','#600','#100','#600','#900','#C00','#F11','#F44','#F99','#FFF','#F99','#F44','#F11','#C00','#900','#600','#100','#600','#900','#C00','#F11','#F44','#F99'], gloom: '#0093C4', passivesky: '#5C00BF', powersky: '#228', slowsky: '#242' },
	passive: {
		on: false,
		level: 0,
		x: 5,
		y: game.canvas.height - 45,
		height: 10,
		width: 0
	},
	power: {
		on: false,
		level: 0,
		x: game.canvas.width/2,
		y: game.canvas.height - 30,
		height: 10,
		width: 0
	},
	slow: {
		on: false,
		level: 0,
		x: 5,
		y: game.canvas.height - 30,
		height: 10,
		width: 0
	},
	health: {
		level: 0,
		x: 5,
		y: game.canvas.height - 15,
		height: 10,
		width: 0,
		//counter: document.getElementById('health'),
		drawLayers(width, n, max) {
			game.context.fillStyle = player.colors.red[n];
			if (width <= max) {
				game.context.fillRect(player.health.x, player.health.y, width, player.health.height);
			} else {
				game.context.fillRect(player.health.x, player.health.y, max, player.health.height);
				player.health.drawLayers(width-max, n+1, max-10);
			}
		}
	},
	adjustBars() {
		if (player.passive.on) {
			if (player.power.on) player.power.on = false;
			if (player.slow.on) player.slow.on = false;
			
			if (player.power.width > player.power.level) {
				player.power.width -= 0.01;
				player.power.width = player.power.width.toFixed(0);
			}
		} else if (player.power.on) {
			if (player.slow.on) player.slow.on = false;
			if (player.power.level > 0) {
				player.power.level -= 0.2;
				player.power.width = player.power.level.toFixed(0);
			} else {
				player.power.on = false;
				player.power.level = 0;
				player.power.width = player.power.level.toFixed(0);
				player.vertical /= 2;
				player.fastvertical /= 2;
			}
		} else if (player.slow.on) {
			if (player.power.on) {
				player.power.on = false;
			} else {
				if (player.slow.level > 0) {
					player.slow.level -= 0.5;
					player.slow.width = player.slow.level.toFixed(0);
				} else {
					player.slow.on = false;
					game.sounds.toggleTheme();
					player.slow.level = 0;
					clearInterval(game.interval);
					game.interval = setInterval(sprinkling,game.ms);
				}
			}
		} else if (player.vertical > 0 && player.y < game.waterLine) {
			if (player.slow.level < 120) {
				player.slow.level += 0.1;
				player.slow.width = player.slow.level.toFixed(0);
			} else if (player.power.level < 120) {
				player.power.level += 0.05;
				player.power.width = player.power.level.toFixed(0);
			} else if (player.passive.level < 240) {
				player.passive.level += 0.025;
				player.passive.width = player.passive.level.toFixed(0);
			} else {
				sprinkles.dripFrequency -= 0.00002;
			}
		}

		if (Math.abs(player.passive.level - player.passive.width) > 0.99) {
			(player.passive.width < player.passive.level / 10) ? player.passive.width++ : player.passive.width--;
		}
		if (Math.abs(player.health.level / 10 - player.health.width) > 0.99) {
			(player.health.width < player.health.level / 10) ? player.health.width++ : player.health.width--;
		}
	},
	barDraw() {
		player.adjustBars();
		game.context.fillStyle = player.colors.magenta;
		game.context.fillRect(player.passive.x, player.passive.y, player.passive.width, player.power.height);
		game.context.fillStyle = player.colors.blue;
		game.context.fillRect(player.power.x, player.power.y, player.power.width, player.power.height);
		game.context.fillStyle = player.colors.green;
		game.context.fillRect(player.slow.x, player.slow.y, player.slow.width, player.slow.height);
		player.health.drawLayers(player.health.width, 0, 240);
	},
	safeCheck() {
		if (player.y + player.size < game.cloudThickness) player.levelup();
	},
	levelup() {
		player.health.level += 100;
		player.points += 100;
		player.y = game.canvas.height*0.92;
		if (player.power.on) {
			player.power.on = false;
			player.fastvertical /= 2;
			player.vertical /= 2;
		}
		if (player.slow.on) {
			player.slow.on = false;
			game.sounds.toggleTheme();
			clearInterval(game.interval);
			game.interval = setInterval(sprinkling,game.ms);
		}

		if (sprinkles.speedrange <= 4.9) sprinkles.speedrange += 0.1;
		if (sprinkles.dripFrequency < .25) sprinkles.dripFrequency += 0.005;
	},
	adjust() {
		if (player.alive) {
			if (player.horizontal < 0 && player.x < 1 || player.horizontal > 0 && player.x > game.canvas.width - player.size) {
				player.horizontal = 0;
			}
			player.x += player.horizontal;
			player.y -= player.vertical;
			
			if (player.power.on) {
				player.health.level += 0.25;
			}
			player.draw();	
		} else {
			player.y -= player.vertical
			player.draw();
		}
	},
	collision(drop) {
		if (player.alive) {
			const dropUp = drop.y;
			const dropDwn = drop.y + drop.height;
			const dropLft = drop.x;
			const dropRgt = drop.x + drop.width;
			const playUp = player.y;
			const playDwn = player.y + player.size;
			const playLft = player.x
			const playRgt = player.x + player.size;
			if ( ((playDwn >= dropUp && playDwn <= dropDwn && playLft >= dropLft && playLft <= dropRgt) || (playDwn >= dropUp && playDwn <= dropDwn && playRgt >= dropLft && playRgt <= dropRgt) || (playUp >= dropUp && playUp <= dropDwn && playLft >= dropLft && playLft <= dropRgt) 
					|| (dropDwn >= playUp && dropDwn <= playDwn && dropLft >= playLft && dropLft <= playRgt) || (dropDwn >= playUp && dropDwn <= playDwn && dropRgt >= playLft && dropRgt <= playRgt) || (dropUp >= playUp && dropUp <= playDwn && dropLft >= playLft && dropLft <= playRgt)) && dropDwn < game.waterLine && dropDwn > game.cloudThickness) {
				game.sounds.soundlooper();
				if (player.power.on) {
					player.health.level += 2;
					player.y -= 10;
					player.health.level += 10;
					player.points += 20;
				} else {
					(player.health.level > 0) ? player.health.level -= 50 : player.health.level--;
					if (player.health.level < 0) {
						player.alive = false;
						if (player.slow.on) {
							player.slow.on = false;
							game.sounds.toggleTheme();
						}
						if (player.passive.on) player.passive.on = false;
						player.vertical = -3;
						return false;
					} else {
						player.y += 20;
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
	}
}
player.img.image.src = 'images/player.png';
player.draw = function() {
	game.context.drawImage(player.img.image, player.img.x, 0, player.size, player.size*2, player.x, player.y, player.size, player.size*2);
	player.img.adjust();
}

player.stats = function() {
	game.context.font = "15px Sans-serif";
	game.context.textAlign = "center";
	game.context.fillStyle = 'white';
	game.context.fillText(`Pts: ${player.points}, HP: ${player.health.level}`, game.canvas.width/2, 18);
}

const sprinkles = {
	hexCodes: { pink: '#F205B7', magenta: '#A705F2', darkBlue: '#2405F2', lightBlue: '#0DC7DB', green: '#0DDB25', yellow: '#F5FC19', orange: '#FC8B19', red: '#EB0909' },
	colors: ['pink','magenta','darkBlue','lightBlue','green','yellow','orange','red'],
	drops: [], // each sprinkle that is generated with .drip() function is stored here
	speedrange: 1, // range of vertical speed possible when creating sprinkles
	dripFrequency: 0.07, //maxes at 2.5
	drip: function() {
		const width = 5 + Math.floor(Math.random() * 5);
		const height = 10 + Math.floor(Math.random() * 10);
		const speed = 1 + Math.floor(Math.random() * sprinkles.speedrange);
		sprinkles.drops.push({
			color: sprinkles.colors[Math.floor(Math.random() * sprinkles.colors.length)],
			width: width,
			height: height,
			x: Math.floor(Math.random() * game.canvas.width - width), 
			y: 0-height,
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
			if (player.passive.on)
				if (sprinkles.passiveCheck(sprinkles.drops[drop]))
					(sprinkles.drops[drop].x > player.x + player.size/2) ? sprinkles.drops[drop].x+=2 : sprinkles.drops[drop].x-=2;
			if (sprinkles.drops[drop].y >= game.canvas.height || player.collision(sprinkles.drops[drop])) {
				let index = sprinkles.drops.indexOf(sprinkles.drops[drop]);
				removalIndexes.push(index);
			}
			if (sprinkles.drops[drop].y + sprinkles.drops[drop].height < game.cloudThickness) {
				game.context.fillStyle = 'white';
				(!player.alive) ? sprinkles.drops[drop].speed += sprinkles.drops[drop].trueSpeed * 0.25 : 
					(sprinkles.drops[drop].y + sprinkles.drops[drop].height - sprinkles.drops[drop].speed <= 0) ? 
						sprinkles.drops[drop].speed = sprinkles.drops[drop].trueSpeed * 1.5 : null;
			} else if (sprinkles.drops[drop].y + sprinkles.drops[drop].height < game.waterLine) {
				game.context.fillStyle =  sprinkles.hexCodes[sprinkles.drops[drop].color];
				(!player.alive && sprinkles.drops[drop].y > game.cloudThickness) ?
					sprinkles.drops[drop].speed -= sprinkles.drops[drop].trueSpeed * 0.25 :
					(sprinkles.drops[drop].speed > sprinkles.drops[drop].trueSpeed) ?
						sprinkles.drops[drop].speed -= sprinkles.drops[drop].speed * 0.1 : null;
			} else {
				game.context.fillStyle = 'black';
				(!player.alive) ? sprinkles.drops[drop].speed -= sprinkles.drops[drop].trueSpeed * 0.1 :
					(sprinkles.drops[drop].speed > 0.5) ?
						sprinkles.drops[drop].speed -= sprinkles.drops[drop].speed * 0.025 : null;
			}
			game.context.fillRect(sprinkles.drops[drop].x, sprinkles.drops[drop].y, sprinkles.drops[drop].width, sprinkles.drops[drop].height);
		}
		if (removalIndexes.length > 1) {
	      	for (let i = 0; i < removalIndexes.length; i++) sprinkles.drops.splice(removalIndexes[0], 1);
	    } else if (removalIndexes.length == 1) {
	      	sprinkles.drops.splice(removalIndexes[0],1);
	    }
	}
}


document.addEventListener("keydown",pushedKey);
document.addEventListener("keyup",releasedKey);

function pushedKey(btn) {
	if (btn.keyCode === 32) game.pauseUnpause(); // space
	if (btn.keyCode === 82) game.refresh();  // R
	if (player.alive) {
		if (btn.keyCode === 37 && player.horizontal > -2) player.horizontal = -2;
		if (btn.keyCode === 39 && player.horizontal < 2) player.horizontal = 2;
		if (btn.keyCode === 38) player.vertical = player.fastvertical;
		if (btn.keyCode === 40) player.vertical = 0;
		if (btn.keyCode === 65 && player.passive.level >= 50 && !player.passive.on) {
			player.passive.on = true;
			player.passive.level -= 50;
			setTimeout(() => player.passive.on = false, 4000);
		}
		if (btn.keyCode === 67 && player.power.level > 0 && player.y < game.waterLine && game.active) { // C key
			player.power.on = !player.power.on;
			(player.power.on) ? (
				player.vertical *= 2,
				player.fastvertical *= 2
			) : (
				player.vertical /= 2,
				player.fastvertical /= 2
			);
		}
		if (btn.keyCode === 83 && player.slow.level > 0 && player.y < game.waterLine && game.active) { // S key
			player.slow.on = !player.slow.on;
			game.sounds.toggleTheme();
			player.slow.on ? (
				clearInterval(game.interval),
				game.interval = setInterval(sprinkling,game.ms*2)
			) : ( 
				clearInterval(game.interval),
				game.interval = setInterval(sprinkling,game.ms)
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

const pushCoor = (push) => (push.clientX - window.innerWidth/2 + game.canvas.width/2 > player.x) ? player.horizontal = 2 : player.horizontal = -2;
const releaseCoor = (push) => player.horizontal = 0;
game.canvas.addEventListener('mousedown',pushCoor);
game.canvas.addEventListener('mouseup',releaseCoor);

window.addEventListener("loaded",function() {
	game.sounds.theme.loop = true;
	game.sounds.theme.play();
})