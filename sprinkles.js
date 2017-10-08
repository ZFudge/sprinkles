document.addEventListener("keydown",pushedKey);
document.addEventListener("keyup",releasedKey);

const game = {
	canvas: document.getElementById('canv'),
	speed: 20
}
game.context = game.canvas.getContext('2d');

//const canvas = document.getElementById('canv');
//const context = canvas.getContext('2d');
game.context.fillStyle = "black";

let backgroundColor = 40;
let rise = true;

let sprinklesInterval = setInterval(sprinkling,game.speed);

function sprinkling() {
	game.context.fillRect(0,0, game.canvas.width, game.canvas.height);

	game.context.fillStyle = "white";
	game.context.fillRect(0,sprinkles.cloudThickness, game.canvas.width, sprinkles.clearing);

	let fillIt = '#0000'+ backgroundColor.toString();
	game.context.fillStyle = fillIt;
	game.context.fillRect(0,sprinkles.clearing, game.canvas.width, game.canvas.height);
	backgroundcolorFlex();

	if (player.alive) {
		let odds = Math.random() * 10;
		if (odds < sprinkles.dripFrequency) {
			sprinkles.drip();
		}
	}

	sprinkles.adjust();

	player.move();
	player.safeCheck();
}

function backgroundcolorFlex() {
	if (rise) {
		backgroundColor += 1;
	} else {
		backgroundColor -= 1;
	}

	if (backgroundColor == 88 || backgroundColor == 40) {
		rise = !rise;
	}
}


const player = {
	pointcounter: document.getElementById('points'),
	healthcounter: document.getElementById('health'),
	x: (game.canvas.width/2)-5,
	y: game.canvas.height*0.9625,
	slowbar: {
		x:0,
		y:game.canvas.height
	},
	slowmo: 0,
	alive: true,
	points: 0,
	health: 0,
	width: 10, //40
	height: 10,
	color: "#ccc",
	horizontal: 0,
	vertical: 1,
	fastvertical: 2,
	speed: 3,
	safeCheck: function() {
		if (player.y + player.height < sprinkles.cloudThickness) {
			player.levelup();
		}
	},
	levelup: function() {
		//player.width += 1;
		player.health += 100;
		player.points += 10;
		player.y = game.canvas.height*0.9625;

		if (player.points % 30 === 0 ) {
			sprinkles.obstacles.amount++;
			sprinkles.obstacles.createObstacles();
		}

		player.pointcounter.innerHTML = player.points;
		player.healthcounter.innerHTML = player.health;

		if (sprinkles.speedrange <= 4.9) {
			sprinkles.speedrange += 0.1;
		}
		if (sprinkles.dripFrequency < 2.5) {
			sprinkles.dripFrequency += 0.05;
		}
	},
	flip: function() {
		let w = player.width;
		let h = player.height;
		player.width = h;
		player.height = w;	
	},
	move: function() {
		if (player.alive) {
			if (player.horizontal < 0 && player.x < 1 || player.horizontal > 0 && player.x > game.canvas.width - player.width) {
				player.horizontal = 0;
			}
			player.x += player.horizontal;
			player.y -= player.vertical;
			/*
			player.step++;
			if (player.step % player.risingSpeed === 0) {
				player.y -= player.vertical;
			}*/
			if (sprinkles.obstacles.amount > 0) {
				game.context.fillStyle = 'black';
				sprinkles.obstacles.drawObstacles();
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
			let dropUp = drop.y;
			let dropDwn = drop.y + drop.height;
			let dropLft = drop.x;
			let dropRgt = drop.x + drop.width;
			let playUp = player.y;
			let playDwn = player.y + player.height;
			let playLft = player.x
			let playRgt = player.x + player.width;
			if ( ((playDwn >= dropUp && playDwn <= dropDwn && playLft >= dropLft && playLft <= dropRgt) || (playDwn >= dropUp && playDwn <= dropDwn && playRgt >= dropLft && playRgt <= dropRgt) || (playUp >= dropUp && playUp <= dropDwn && playLft >= dropLft && playLft <= dropRgt) 
					|| (dropDwn >= playUp && dropDwn <= playDwn && dropLft >= playLft && dropLft <= playRgt) || (dropDwn >= playUp && dropDwn <= playDwn && dropRgt >= playLft && dropRgt <= playRgt) || (dropUp >= playUp && dropUp <= playDwn && dropLft >= playLft && dropLft <= playRgt)) && dropDwn < sprinkles.clearing && dropDwn > sprinkles.cloudThickness) {
				//console.log('TRUE');
				player.health -= 50;
				sounds.soundlooper();
				if (player.health < 0) {
					player.healthcounter.innerHTML = 0;
					player.alive = false;
					player.vertical = -3;
					return false;
				} else {
					player.healthcounter.innerHTML = player.health;
				}
				player.y += 20;
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
	cloudThickness: game.canvas.height*0.20,
	clearing: game.canvas.height*0.8, //320,
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
		}
	},
	drip: function() {
		let wth = 5 + Math.floor(Math.random() * 5);
		let hgt = 10 + Math.floor(Math.random() * 10);
		let spd = 1 + Math.floor(Math.random() * sprinkles.speedrange);
		sprinkles.drops.push({
			color:sprinkles.colors[Math.floor(Math.random() * sprinkles.colors.length)],
			width: wth,
			height: hgt,
			x:Math.floor(Math.random() * game.canvas.width-wth), 
			y:0-hgt,
			speed: spd,
			trueSpeed: spd
		});
	},
	adjust: function() {
		console.log('adjust');
		let removals = [];
		for (let drop in sprinkles.drops) {
			sprinkles.drops[drop].y += sprinkles.drops[drop].speed;
			if (sprinkles.drops[drop].y >= game.canvas.height || player.collision(sprinkles.drops[drop])) {
				let index = sprinkles.drops.indexOf(sprinkles.drops[drop]);
				//console.log('push '+index + '   x: ' + sprinkles.drops[drop].x + ', y:' + sprinkles.drops[drop].y);
				removals.push(index);
				//sounds.soundlooper();
			}
			if (sprinkles.drops[drop].y + sprinkles.drops[drop].height < sprinkles.cloudThickness) {
				game.context.fillStyle = 'white';
				if (!player.alive) {
					sprinkles.drops[drop].speed += sprinkles.drops[drop].trueSpeed * 0.25;
					//sprinkles.drops[drop].speed += 0.5;
				} else if (sprinkles.drops[drop].y + sprinkles.drops[drop].height - sprinkles.drops[drop].speed <= 0) {
					sprinkles.drops[drop].speed = sprinkles.drops[drop].trueSpeed * 1.5;
				}
			} else if (sprinkles.drops[drop].y + sprinkles.drops[drop].height < sprinkles.clearing) {
				game.context.fillStyle = sprinkles.drops[drop].color;
				if (!player.alive && sprinkles.drops[drop].y > sprinkles.cloudThickness) {
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
	if (btn.keyCode === 82) {
		refresh();
	}
	if (player.alive) {
		if (btn.keyCode === 37 && player.horizontal > -2) player.horizontal = -2;
		if (btn.keyCode === 39 && player.horizontal < 2) player.horizontal = 2;
		if (btn.keyCode === 38) player.vertical = player.fastvertical;
		if (btn.keyCode === 40) player.vertical = 0;
		if (btn.keyCode === 17) {
			clearInterval(sprinklesInterval);
			sprinklesInterval = setInterval(sprinkling,game.speed*2);
		}	
	}
	if (btn.keyCode === 84) {
		test();
	}
	if (btn.keyCode === 32) {
		stopAndGo();
	}
	if (btn.keyCode === 70 && sprinkles.active) {
		clearInterval(sprinklesInterval);
		sprinklesInterval = setInterval(sprinkling,game.speed*2);
	}
}

function releasedKey(btn) {
	if (player.alive) {
		if (btn.keyCode === 38 || btn.keyCode === 40) {
			player.vertical = 1;
		}
		if (btn.keyCode === 37 && player.horizontal < 0) {
			player.horizontal += 2;
		}
		if (btn.keyCode === 39 && player.horizontal > 0) {
			player.horizontal -= 2;
		}
		if (btn.keyCode === 70 && sprinkles.active) {
				clearInterval(sprinklesInterval);
				sprinklesInterval = setInterval(sprinkling,game.speed);
		}
	}
}

function refresh() {
	sprinkles.drops = [];
	sprinkles.active = true;
	sprinkles.speedrange = 1;
	sprinkles.dripFrequency = 0.7;
	sprinkles.obstacles.amount = 0;
	sprinkles.obstacles.storage = [];

	player.pointcounter.innerHTML = 0;
	player.healthcounter.innerHTML = 0;
	player.alive = true;
	player.points = 0;
	player.health = 0;
	player.x = (game.canvas.width/2)-5;
	player.y = game.canvas.height*0.9625;
	player.horizontal = 0;
	player.vertical = 1;
	player.speed = 3;
}

function stopAndGo() {
	if (sprinkles.active) {
		clearInterval(sprinklesInterval);
	} else {
		sprinklesInterval = setInterval(sprinkling,game.speed);
	}
	sprinkles.active = !sprinkles.active;
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

function test() {
	console.log('test');
}

document.onload = function() {
	sounds.themeplay();
}
