document.addEventListener("keydown",pushedKey);
document.addEventListener("keyup",releasedKey);

const game = {
	active: true,
	canvas: document.getElementById('canv'),
	speed: 20, // milliseconds in each interval
	waterShade: 40, // sets shade of blue
	waterRise: true,
	waterAdjust: function() { //
		(game.waterRise) ? game.waterShade++ : game.waterShade--;
		if (game.waterShade >= 88 || game.waterShade <= 40) game.waterRise = !game.waterRise;
	},
	refresh: function() {
		sprinkles.drops = [];
		game.active = true;
		sprinkles.speedrange = 1;
		sprinkles.dripFrequency = 0.07;
		sprinkles.obstacles.amount = 0;
		sprinkles.obstacles.storage = [];
	
		player.pointcounter.innerHTML = 0;
		player.health.counter.innerHTML = 0;
		player.health.width = player.slow.width = player.power.width = player.passive.width = 0;
		player.alive = true;
		player.points = 0;
		player.health.level = 0;
		player.x = (game.canvas.width/2)-5;
		player.y = game.canvas.height*0.92;
		player.horizontal = 0;
		player.vertical = 1;
		player.speed = 3;
	},
	stopAndGo: function() {
		(game.active) ? clearInterval(game.interval) : game.interval = setInterval(sprinkling,game.speed);
		game.active = !game.active;
	}
}
game.context = game.canvas.getContext('2d');
game.interval = setInterval(sprinkling,game.speed);
game.cloudThickness = game.canvas.height*0.20;
game.waterLine = game.canvas.height*0.8; //320,

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
		let odds = Math.random();
		if (odds < sprinkles.dripFrequency) sprinkles.drip();

		player.safeCheck();
		player.barDraw();
	}
	player.adjust();
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
	pointcounter: document.getElementById('points'),
	points: 0,
	color: "#ccc",
	colors: {
		magenta: '#AE00FF',
		blue: '#0BF',
		green: '#0F2',
		red: ['#F11','#C00','#900','#600','#100','#600','#900','#C00','#F11','#F44','#F99','#FFF','#F99','#F44','#F11','#C00','#900','#600','#100','#600','#900','#C00','#F11','#F44','#F99'],
		gloom: '#3D007A',
		passivesky: '#5C00BF',
		powersky: '#228',
		slowsky: '#242'
	},
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
		counter: document.getElementById('health'),
		drawLayers: function(width, n, max) {
			game.context.fillStyle = player.colors.red[n];
			if (width <= max) {
				game.context.fillRect(player.health.x, player.health.y, width, player.health.height);
			} else {
				game.context.fillRect(player.health.x, player.health.y, max, player.health.height);
				player.health.drawLayers(width-max, n+1, max-10);
			}
		}
	},
	adjustBars: function() {
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
				player.slow.on = false;
			} else {
				if (player.slow.level > 0) {
					player.slow.level -= 0.5;
					player.slow.width = player.slow.level.toFixed(0);
				} else {
					player.slow.on = false;
					player.slow.level = 0;
					clearInterval(game.interval);
					game.interval = setInterval(sprinkling,game.speed);
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
	barDraw: function() {
		player.adjustBars();
		game.context.fillStyle = player.colors.magenta;
		game.context.fillRect(player.passive.x, player.passive.y, player.passive.width, player.power.height);
		game.context.fillStyle = player.colors.blue;
		game.context.fillRect(player.power.x, player.power.y, player.power.width, player.power.height);
		game.context.fillStyle = player.colors.green;
		game.context.fillRect(player.slow.x, player.slow.y, player.slow.width, player.slow.height);
		player.health.drawLayers(player.health.width, 0, 240);
	},
	safeCheck: function() {
		if (player.y + player.size < game.cloudThickness) {
			player.levelup();
		}
	},
	levelup: function() {
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
			clearInterval(game.interval);
			game.interval = setInterval(sprinkling,game.speed);
		}

		if (player.points % 30 === 0 ) {
			sprinkles.obstacles.amount++;
			sprinkles.obstacles.createObstacles();
		}

		player.pointcounter.innerHTML = player.points;
		player.health.counter.innerHTML = Math.round(player.health.level);

		if (sprinkles.speedrange <= 4.9) sprinkles.speedrange += 0.1;
		if (sprinkles.dripFrequency < .25) sprinkles.dripFrequency += 0.005;
	},
	adjust: function() {
		if (player.alive) {
			if (player.horizontal < 0 && player.x < 1 || player.horizontal > 0 && player.x > game.canvas.width - player.size) player.horizontal = 0;
			player.x += player.horizontal;
			player.y -= player.vertical;
			
			if (player.power.on) {
				player.health.level += 0.25;
				player.health.counter.innerHTML = Math.round(player.health.level);
			}
			
			game.context.fillStyle = player.color,
			game.context.fillRect(player.x,player.y,player.size,player.size);
			game.context.fillStyle = 'black',
			game.context.strokeRect(player.x+1,player.y+1,player.size-1,player.size-1);	
		} else {
			player.y -= player.vertical

			game.context.fillStyle = player.color,
			game.context.fillRect(player.x,player.y,player.size,player.size);
			game.context.fillStyle = 'black',
			game.context.strokeRect(player.x+1,player.y+1,player.size-1,player.size-1);	
		}
	},
	collision: function(drop) {
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
				sounds.soundlooper();
				if (player.power.on) {
					player.health.level += 2;
					player.y -= 10;
					player.health.level += 10;
					player.health.counter.innerHTML = Math.round(player.health.level);
					player.points += 20;
					player.pointcounter.innerHTML = player.points;
				} else {
					(player.health.level > 0) ? player.health.level -= 50 : player.health.level--;
					if (player.health.level < 0) {
						player.health.counter.innerHTML = 0;
						player.alive = false;
						player.vertical = -3;
						return false;
					} else {
						player.health.counter.innerHTML = Math.round(player.health.level);
						player.y += 20;
					}
				}
				return true;
			}
			return false;	
		} else {
			return false;
		}
	}
}

const sprinkles = {
	colors: ['#F205B7','#A705F2','#2405F2','#0DC7DB','#0DDB25','#F5FC19','#FC8B19','#EB0909'],
	drops: [], // each sprinkle that is generated with .drip() function is stored here
	speedrange: 1, // increments upwards, allowing faster sprinkles to be created
	dripFrequency: 0.07, //maxes at 2.5
	obstacles: { // creates black blocks on screen
		amount: 0,
		storage: [],
		createObstacles: function() {
			for (let i=sprinkles.obstacles.amount;i>0;i--) {
				const wth = 10 + Math.floor(Math.random() * 5);
				const hght = 5 + Math.floor(Math.random() * 5);
				sprinkles.obstacles.storage.push(
					{
						x: Math.floor(Math.random() * (game.canvas.width - wth)),
						y: Math.floor(game.canvas.height*0.20 + Math.random() * (game.canvas.height*0.8 - hght)),
						width: wth,
						height: hght
					}
				);
			}
		},
		drawObstacles: function() {
			for (let obst in sprinkles.obstacles.storage) {
				game.context.fillRect(sprinkles.obstacles.storage[obst].x,sprinkles.obstacles.storage[obst].y,sprinkles.obstacles.storage[obst].width,sprinkles.obstacles.storage[obst].height);
			}
		},
		checkObjectDraw: function() {
			if (sprinkles.obstacles.amount > 0) {
				game.context.fillStyle = 'black';
				sprinkles.obstacles.drawObstacles();
			}
		}
	},
	drip: function() {
		const wth = 5 + Math.floor(Math.random() * 5);
		const hgt = 10 + Math.floor(Math.random() * 10);
		const spd = 1 + Math.floor(Math.random() * sprinkles.speedrange);
		sprinkles.drops.push({
			color: sprinkles.colors[Math.floor(Math.random() * sprinkles.colors.length)],
			width: wth,
			height: hgt,
			x: Math.floor(Math.random() * game.canvas.width-wth), 
			y: 0-hgt,
			speed: spd,
			trueSpeed: spd
		});
	},
	passiveCheck: function(drop) {
		if (drop.y < player.y + player.size && drop.x < player.x+player.size+20 && drop.x+drop.width > player.x-20 && drop.y > player.y-100) return true;
	},
	adjust: function() {
		console.log('adjust');
		sprinkles.obstacles.checkObjectDraw();
		const removals = [];
		for (let drop in sprinkles.drops) {
			sprinkles.drops[drop].y += sprinkles.drops[drop].speed;
			if (player.passive.on) {
				if (sprinkles.passiveCheck(sprinkles.drops[drop])) {
					(sprinkles.drops[drop].x > player.x + player.size/2) ? sprinkles.drops[drop].x++ : sprinkles.drops[drop].x--;
				}
			}
			if (sprinkles.drops[drop].y >= game.canvas.height || player.collision(sprinkles.drops[drop])) {
				let index = sprinkles.drops.indexOf(sprinkles.drops[drop]);
				//console.log('push '+index + '   x: ' + sprinkles.drops[drop].x + ', y:' + sprinkles.drops[drop].y);
				removals.push(index);
			}
			if (sprinkles.drops[drop].y + sprinkles.drops[drop].height < game.cloudThickness) {
				game.context.fillStyle = 'white';
				if (!player.alive) {
					sprinkles.drops[drop].speed += sprinkles.drops[drop].trueSpeed * 0.25;
				} else if (sprinkles.drops[drop].y + sprinkles.drops[drop].height - sprinkles.drops[drop].speed <= 0) {
					sprinkles.drops[drop].speed = sprinkles.drops[drop].trueSpeed * 1.5;
				}
			} else if (sprinkles.drops[drop].y + sprinkles.drops[drop].height < game.waterLine) {
				game.context.fillStyle = sprinkles.drops[drop].color;
				if (!player.alive && sprinkles.drops[drop].y > game.cloudThickness) {
					sprinkles.drops[drop].speed -= sprinkles.drops[drop].trueSpeed * 0.25;
				} else if (sprinkles.drops[drop].speed > sprinkles.drops[drop].trueSpeed) {
					sprinkles.drops[drop].speed -= sprinkles.drops[drop].speed * 0.1;
				}
			} else {
				game.context.fillStyle = 'black';
				if (!player.alive) {
					sprinkles.drops[drop].speed -= sprinkles.drops[drop].trueSpeed * 0.1;
				} else if (sprinkles.drops[drop].speed > 0.5) {
					sprinkles.drops[drop].speed -= sprinkles.drops[drop].speed * 0.025;						
				}
			}
			game.context.fillRect(sprinkles.drops[drop].x, sprinkles.drops[drop].y, sprinkles.drops[drop].width, sprinkles.drops[drop].height);
		}
		if (removals.length > 0) {
			if (removals.length > 1) {
				for (let index in removals) {
					let x = sprinkles.drops[removals[index]].x; let y = sprinkles.drops[removals[index]].y; //console.log('remove '+removals[index] + ': x:' + x + ', y:' + y);
					sprinkles.drops.splice(removals[index],1);
					for (let index2 in removals) {
						removals[index2] -= 1;
					}
				}
			} else {
				sprinkles.drops.splice(removals[0],1);
			}
		}
	}
}

function pushedKey(btn) {
	if (btn.keyCode === 32) game.stopAndGo(); // space
	if (btn.keyCode === 82) game.refresh();  // R
	if (player.alive) {
		if (btn.keyCode === 37 && player.horizontal > -2) player.horizontal = -2;
		if (btn.keyCode === 39 && player.horizontal < 2) player.horizontal = 2;
		if (btn.keyCode === 38) player.vertical = player.fastvertical;
		if (btn.keyCode === 40) player.vertical = 0;
		if (btn.keyCode === 65 && player.passive.level >= 50 && !player.passive.on) {
			player.passive.on = true;
			player.passive.level -= 50;
			setTimeout(function() {
				player.passive.on = false;
			}, 4000);
		}
		if (btn.keyCode === 67 && player.power.level > 0 && player.y < game.waterLine) { // C key
			player.power.on = !player.power.on;
			(player.power.on) ? (
				player.vertical *= 2,
				player.fastvertical *= 2
			) : (
				player.vertical /= 2,
				player.fastvertical /= 2
			);
		}
		if (btn.keyCode === 83 && player.slow.level > 0 && player.y < game.waterLine) { // S key
			player.slow.on = !player.slow.on;
			player.slow.on ? (
				clearInterval(game.interval),
				game.interval = setInterval(sprinkling,game.speed*2)
			) : (
				clearInterval(game.interval),
				game.interval = setInterval(sprinkling,game.speed)
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

const sounds = {
	notecounter: 1,
	sound1: new Audio('audio/D.mp3'),
	sound2: new Audio('audio/G.mp3'),
	sound3: new Audio('audio/D_.mp3'),
	sound4: new Audio('audio/C.mp3'),
	sound5: new Audio('audio/D_2.mp3'),
	sound6: new Audio('audio/G2.mp3'),
	sound7: new Audio('audio/D2.mp3'),
	sound8: new Audio('audio/A_.mp3'),
	theme: new Audio('audio/sprinkles_2.mp3'),
	themeplay: function() {
		sounds.theme.play();
	},
	soundlooper: function() {
		switch(sounds.notecounter) {
			case 1:
				sounds.sound1.play();
				break;
			case 2:
				sounds.sound2.play();
				break;
			case 3:
				sounds.sound3.play();
				break;
			case 4:
				sounds.sound4.play();
				break;
			case 5:
				sounds.sound5.play();
				break;
			case 6:
				sounds.sound6.play();
				break;
			case 7:
				sounds.sound7.play();
				break;
			case 8:
				sounds.sound8.play();
				break;
		}
		if (sounds.notecounter < 8) {
			sounds.notecounter++;
		} else {
			sounds.notecounter = 1;
		}
	}
}

document.onload = function() {
	sounds.themeplay();
}
