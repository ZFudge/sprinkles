
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
				&& game.active && player.state !== "passive"
				&& canvas.levels.slow.ready) { // S key Slow
			canvas.levels.slow.ready = false;
			player.state = (player.state === "slow" ? "normal" : "slow");
			game.setSpeed(player.state === "slow" ? game.ms * 2 : game.ms);
		}	
		if (btn.keyCode === 68 
				&& canvas.levels.power.level > 5 
				&& player.positionMovement.y < canvas.waterLine 
				&& game.active && player.state !== "passive"
				&& canvas.levels.power.ready) { // D key Power
			canvas.levels.power.ready = false;
			if (player.state === "slow") game.setSpeed(game.ms);
			player.state = (player.state === "power" ? "normal" : "power");
		}
		if (btn.keyCode === 70 && player.state != "passive" 
				&& player.positionMovement.y < canvas.waterLine
				&& canvas.levels.passive.level >= 50) { // F Key Passive
			if (player.state === "slow") game.setSpeed(game.ms)
			player.state = "passive";
			canvas.levels.passive.level -= 50;
			setTimeout(() => player.state = "normal", 4000);
		}
	}
	if (!game.on) game.pauseUnpause();
}

function releasedKey(btn) {
	if (player.alive) {
		if (btn.keyCode === 83) canvas.levels.slow.ready = true;
		if (btn.keyCode === 68) canvas.levels.power.ready = true;// D key Power
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
sprinkles.canvas.addEventListener('mousedown', pushCoor);
sprinkles.canvas.addEventListener('mouseup', releaseCoor);

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
	player.score.style.opacity = 1;
	canvas.levels.canvas.style.opacity = 1;
	game.instructions.style.opacity = 0;
});

