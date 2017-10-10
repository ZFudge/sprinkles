document.addEventListener("keydown",pushedKey);
document.addEventListener("keyup",releasedKey);

const game = {
	canvas: document.getElementById('canv'),
	speed: 20, // milliseconds in each interval
	waterIntensity: 40, // sets shade of blue
	waterRise: true,
	waterFlex: function() {
		(game.waterRise) ? game.waterIntensity++ : game.waterIntensity--;
		if (game.waterIntensity >= 88 || game.waterIntensity <= 40) game.waterRise = !game.waterRise;
	},
	refresh: function() {
		sprinkles.drops = [];
		sprinkles.active = true;
		sprinkles.speedrange = 1;
		sprinkles.dripFrequency = 0.7;
		sprinkles.obstacles.amount = 0;
		sprinkles.obstacles.storage = [];
	
		player.pointcounter.innerHTML = 0;
		player.healthcounter.innerHTML = 0;
		player.healthbar.width = player.slowbar.width = player.powerbar.width = player.passivebar.width = 0;
		player.alive = true;
		player.points = 0;
		player.health = 0;
		player.x = (game.canvas.width/2)-5;
		player.y = game.canvas.height*0.92;
		player.horizontal = 0;
		player.vertical = 1;
		player.speed = 3;
	},
	stopAndGo: function() {
		(sprinkles.active) ? clearInterval(game.interval) : game.interval = setInterval(sprinkling,game.speed);
		sprinkles.active = !sprinkles.active;
	}
}
game.context = game.canvas.getContext('2d');
game.interval = setInterval(sprinkling,game.speed);
game.cloudThickness = game.canvas.height*0.20;
game.waterLine = game.canvas.height*0.8; //320,

function sprinkling() {
	game.context.fillStyle = "black";
	game.context.fillRect(0, 0, game.canvas.width, game.canvas.height);

	(player.passivemode) ? game.context.fillStyle = player.colors.passivesky : (player.powermode) ? game.context.fillStyle = player.colors.powersky : (player.slowmotion) ? game.context.fillStyle = player.colors.slowsky : game.context.fillStyle = player.colors.gloom;
	game.context.fillRect(0, game.cloudThickness, game.canvas.width, game.waterLine);

	let fillIt = '#0000'+ game.waterIntensity.toString();
	game.context.fillStyle = fillIt;
	game.context.fillRect(0, game.waterLine, game.canvas.width, game.canvas.height);
	game.waterFlex();

	sprinkles.adjust();

	if (player.alive) {
		let odds = Math.random() * 10;
		if (odds < sprinkles.dripFrequency) {
			sprinkles.drip();
		}
		player.safeCheck();
		player.barDraw();
	}
	player.adjust();
}


const player = {
	pointcounter: document.getElementById('points'),
	healthcounter: document.getElementById('health'),
	x: (game.canvas.width/2)-5,
	y: game.canvas.height*0.92,
	alive: true,
	passivemode: false,
	passivelevel: 0,
	powermode: false,
	powerlevel: 0,
	slowmotion: false,
	slowlevel: 0,
	health: 0,
	points: 0,
	size: 10,
	width: 10,
	height: 10,
	color: "#ccc",
	horizontal: 0,
	vertical: 1,
	fastvertical: 2,
	speed: 3,
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
	passivebar: {
		x: 5,
		y: game.canvas.height - 45,
		height: 10,
		width: 0
	},
	powerbar: {
		x: game.canvas.width/2,
		y: game.canvas.height - 30,
		height: 10,
		width: 0
	},
	slowbar: {
		x: 5,
		y: game.canvas.height - 30,
		height: 10,
		width: 0
	},
	healthbar: {
		x: 5,
		y: game.canvas.height - 15,
		height: 10,
		width: 0
	},
	adjustBars: function() {
		if (player.passivemode) {
			if (player.powermode) player.powermode = false;
			if (player.slowmotion) player.slowmotion = false;
			
			if (player.powerbar.width > player.powerbar.level) {
				player.powerbar.width -= 0.01;
				player.powerbar.width = player.powerbar.width.toFixed(0);
			}
		} else if (player.powermode) {
			if (player.slowmotion) player.slowmotion = false;
			if (player.powerlevel > 0) {
				player.powerlevel -= 0.2;
				player.powerbar.width = player.powerlevel.toFixed(0);
			} else {
				player.powermode = false;
				player.powerlevel = 0;
				player.powerbar.width = player.powerlevel.toFixed(0);
				player.vertical /= 2;
				player.fastvertical /= 2;
			}
		} else if (player.slowmotion) {
			if (player.powermode) {
				player.slowmotion = false;
			} else {
				if (player.slowlevel > 0) {
					player.slowlevel -= 0.5;
					player.slowbar.width = player.slowlevel.toFixed(0);
				} else {
					player.slowmotion = false;
					player.slowlevel = 0;
					clearInterval(game.interval);
					game.interval = setInterval(sprinkling,game.speed);
				}
			}
		} else if (player.vertical > 0 && player.y < game.waterLine) {
			if (player.slowlevel < 120) {
				player.slowlevel += 0.1;
				player.slowbar.width = player.slowlevel.toFixed(0);
			} else if (player.powerlevel < 120) {
				player.powerlevel += 0.05;
				player.powerbar.width = player.powerlevel.toFixed(0);
			} else if (player.passivelevel < 240) {
				player.passivelevel += 0.025;
				player.passivebar.width = player.passivelevel.toFixed(0);
			} else {
				sprinkles.dripFrequency -= 0.0002;
			}
		}

		if (Math.abs(player.passivelevel - player.passivebar.width) > 0.99) {
			(player.passivebar.width < player.passivelevel / 10) ? player.passivebar.width++ : player.passivebar.width--;
		}
		if (Math.abs(player.health / 10 - player.healthbar.width) > 0.99) {
			(player.healthbar.width < player.health / 10) ? player.healthbar.width++ : player.healthbar.width--;
		}
	},
	healthLayers: function(width, n, max) {
		game.context.fillStyle = player.colors.red[n];
		if (width <= max) {
			game.context.fillRect(player.healthbar.x, player.healthbar.y, width, player.healthbar.height);
		} else {
			game.context.fillRect(player.healthbar.x, player.healthbar.y, max, player.healthbar.height);
			player.healthLayers(width-max, n+1, max-10);
		}
	},
	barDraw: function() {
		player.adjustBars();
		game.context.fillStyle = player.colors.magenta;
		game.context.fillRect(player.passivebar.x, player.passivebar.y, player.passivebar.width, player.powerbar.height);
		game.context.fillStyle = player.colors.blue;
		game.context.fillRect(player.powerbar.x, player.powerbar.y, player.powerbar.width, player.powerbar.height);
		game.context.fillStyle = player.colors.green;
		game.context.fillRect(player.slowbar.x, player.slowbar.y, player.slowbar.width, player.slowbar.height);
		player.healthLayers(player.healthbar.width, 0, 240);
	},
	safeCheck: function() {
		if (player.y + player.height < game.cloudThickness) {
			player.levelup();
		}
	},
	levelup: function() {
		player.health += 100;
		player.points += 100;
		player.y = game.canvas.height*0.92;
		if (player.powermode) {
			player.powermode = false;
			player.fastvertical /= 2;
			player.vertical /= 2;
		}
		if (player.slowmotion) {
			player.slowmotion = false;
			clearInterval(game.interval);
			game.interval = setInterval(sprinkling,game.speed);
		}

		if (player.points % 30 === 0 ) {
			sprinkles.obstacles.amount++;
			sprinkles.obstacles.createObstacles();
		}

		player.pointcounter.innerHTML = player.points;
		player.healthcounter.innerHTML = Math.round(player.health);

		if (sprinkles.speedrange <= 4.9) sprinkles.speedrange += 0.1;
		if (sprinkles.dripFrequency < 2.5) sprinkles.dripFrequency += 0.05;
	},
	adjust: function() {
		if (player.alive) {
			if (player.horizontal < 0 && player.x < 1 || player.horizontal > 0 && player.x > game.canvas.width - player.width) player.horizontal = 0;
			player.x += player.horizontal;
			player.y -= player.vertical;
			
			if (player.powermode) {
				player.health += 0.25;
				player.healthcounter.innerHTML = Math.round(player.health);
			}
			
			game.context.fillStyle = player.color,
			game.context.fillRect(player.x,player.y,player.width,player.height);
			game.context.fillStyle = 'black',
			game.context.strokeRect(player.x+1,player.y+1,player.width-1,player.height-1);	
		} else {
			player.y -= player.vertical

			game.context.fillStyle = player.color,
			game.context.fillRect(player.x,player.y,player.width,player.height);
			game.context.fillStyle = 'black',
			game.context.strokeRect(player.x+1,player.y+1,player.width-1,player.height-1);	
		}
	},
	collision: function(drop) {
		if (player.alive) {
			const dropUp = drop.y;
			const dropDwn = drop.y + drop.height;
			const dropLft = drop.x;
			const dropRgt = drop.x + drop.width;
			const playUp = player.y;
			const playDwn = player.y + player.height;
			const playLft = player.x
			const playRgt = player.x + player.width;
			if ( ((playDwn >= dropUp && playDwn <= dropDwn && playLft >= dropLft && playLft <= dropRgt) || (playDwn >= dropUp && playDwn <= dropDwn && playRgt >= dropLft && playRgt <= dropRgt) || (playUp >= dropUp && playUp <= dropDwn && playLft >= dropLft && playLft <= dropRgt) 
					|| (dropDwn >= playUp && dropDwn <= playDwn && dropLft >= playLft && dropLft <= playRgt) || (dropDwn >= playUp && dropDwn <= playDwn && dropRgt >= playLft && dropRgt <= playRgt) || (dropUp >= playUp && dropUp <= playDwn && dropLft >= playLft && dropLft <= playRgt)) && dropDwn < game.waterLine && dropDwn > game.cloudThickness) {
				sounds.soundlooper();
				if (player.powermode) {
					player.health += 2;
					player.y -= 10;
					player.health += 10;
					player.healthcounter.innerHTML = Math.round(player.health);
					player.points += 20;
					player.pointcounter.innerHTML = player.points;
				} else {
					(player.health > 0) ? player.health -= 50 : player.health--;
					if (player.health < 0) {
						player.healthcounter.innerHTML = 0;
						player.alive = false;
						player.vertical = -3;
						return false;
					} else {
						player.healthcounter.innerHTML = Math.round(player.health);
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
	drops: [], 
	active: true,
	speedrange: 1,
	dripFrequency: 0.7,
	obstacles: {
		amount: 0,
		storage: [],
		createObstacles: function() {
			for (let i=sprinkles.obstacles.amount;i>0;i--) {
				let wth = 10 + Math.floor(Math.random() * 5);
				let hght = 5 + Math.floor(Math.random() * 5);
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
	passCheck: function(drop) {
		if (drop.y < player.y + player.size && drop.x < player.x+player.size+20 && drop.x+drop.width > player.x-20 && drop.y > player.y-100) return true;
	},
	adjust: function() {
		console.log('adjust');
		sprinkles.obstacles.checkObjectDraw();
		let removals = [];
		for (let drop in sprinkles.drops) {
			sprinkles.drops[drop].y += sprinkles.drops[drop].speed;
			if (player.passivemode) {
				if (sprinkles.passCheck(sprinkles.drops[drop])) {
					console.log('in sight');
					(sprinkles.drops[drop].x > player.x + player.size/2) ? sprinkles.drops[drop].x++ : sprinkles.drops[drop].x--;
				}
			}
			if (sprinkles.drops[drop].y >= game.canvas.height || player.collision(sprinkles.drops[drop])) {
				let index = sprinkles.drops.indexOf(sprinkles.drops[drop]);
				//console.log('push '+index + '   x: ' + sprinkles.drops[drop].x + ', y:' + sprinkles.drops[drop].y);
				removals.push(index);
				//sounds.soundlooper();
			}
			if (sprinkles.drops[drop].y + sprinkles.drops[drop].height < game.cloudThickness) {
				game.context.fillStyle = 'white';
				if (!player.alive) {
					sprinkles.drops[drop].speed += sprinkles.drops[drop].trueSpeed * 0.25;
					//sprinkles.drops[drop].speed += 0.5;
				} else if (sprinkles.drops[drop].y + sprinkles.drops[drop].height - sprinkles.drops[drop].speed <= 0) {
					sprinkles.drops[drop].speed = sprinkles.drops[drop].trueSpeed * 1.5;
				}
			} else if (sprinkles.drops[drop].y + sprinkles.drops[drop].height < game.waterLine) {
				game.context.fillStyle = sprinkles.drops[drop].color;
				if (!player.alive && sprinkles.drops[drop].y > game.cloudThickness) {
					sprinkles.drops[drop].speed -= sprinkles.drops[drop].trueSpeed * 0.25;
					//sprinkles.drops[drop].speed -= 0.5;
				} else if (sprinkles.drops[drop].speed > sprinkles.drops[drop].trueSpeed) {
					sprinkles.drops[drop].speed -= sprinkles.drops[drop].speed * 0.1;
				}
			} else {
				game.context.fillStyle = 'black';
				if (!player.alive) {
					sprinkles.drops[drop].speed -= sprinkles.drops[drop].trueSpeed * 0.1;
					//sprinkles.drops[drop].speed -= 0.1;
				} else if (sprinkles.drops[drop].speed > 0.5) {
					sprinkles.drops[drop].speed -= sprinkles.drops[drop].speed * 0.025;						
				}
			}
			game.context.fillRect(sprinkles.drops[drop].x, sprinkles.drops[drop].y, sprinkles.drops[drop].width, sprinkles.drops[drop].height);
		}
		if (removals.length > 0) {
			//console.log(removals);
			if (removals.length > 1) {
				//console.log('removals: ' + removals, sprinkles.drops);
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
		if (btn.keyCode === 65 && player.passivelevel >= 50 && !player.passivemode) {
			player.passivemode = true;
			player.passivelevel -= 50;
			setTimeout(function() {
				player.passivemode = false;
			}, 4000);
		}
		if (btn.keyCode === 67 && player.powerlevel > 0 && player.y < game.waterLine) { // C key
			player.powermode = !player.powermode;
			(player.powermode) ? (
				player.vertical *= 2,
				player.fastvertical *= 2
			) : (
				player.vertical /= 2,
				player.fastvertical /= 2
			);
		}
		if (btn.keyCode === 83 && player.slowlevel > 0 && player.y < game.waterLine) { // S key
			player.slowmotion = !player.slowmotion;
			player.slowmotion ? (
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
