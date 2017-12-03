const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let gameOver = false;
let pauseGame = false;
const SKELETON_WIDTH = 50;
const SKELETON_HEIGHT = 70;
let skeletonDamage = 1;
const START_MAX_SPEED = 3;
const START_MIN_SPEED = 1.5;
let maxSpeed = START_MAX_SPEED;
let minSpeed = START_MIN_SPEED;
let speedIncrement = 0.5;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 70;
const PLAYER_SPEED = 5;
const HEALTH_SIZE = 50;
const healthBar = document.querySelector("progress");
let healthOnGround = false;
let healthValue = 30;
const STAR_SIZE = 50;
let starOnGround = false;
let starPower = 3;
let scoreMiliseconds = 0;
let score = 0;
let highScore = 0;
let scoreText = document.getElementById("score");
let highScoreText = document.getElementById("highscore");
let numSpawn = 1;

//SOURCE: https://www.youtube.com/watch?v=vJaAy3jmEx8
let gameOverSound = new Audio('https://raw.githubusercontent.com/mlouis2/chaser/master/sounds/GameOver.mp3');
//SOURCE: https://freesound.org/people/timgormly/sounds/170155/
let starSound = new Audio('https://raw.githubusercontent.com/mlouis2/chaser/master/sounds/Star.mp3');
//SOURCE: https://www.youtube.com/watch?v=J-21BggTCbA
let healthSound = new Audio('https://raw.githubusercontent.com/mlouis2/chaser/master/sounds/Powerup.mp3');
//SOURCE: https://www.youtube.com/watch?v=MzZJQtUekwI
let backgroundSounds = new Audio('https://raw.githubusercontent.com/mlouis2/chaser/master/sounds/Background.mp3');
//SOURCE: https://www.youtube.com/watch?v=lpqDphtOskU
let skeletonSounds = new Audio('https://raw.githubusercontent.com/mlouis2/chaser/master/sounds/skeleton.mp3');

var backgroundImage = new Image();
backgroundImage.src = "https://image.ibb.co/gF02nm/game_background2.jpg";

class Game {
 	updateScene() {
		if (healthOnGround) {
			health.checkHealth();
		}
		if (starOnGround) {
			star.checkStar();
		}
		player.checkBounds();
		player.moveToward(mouse, player.speed);
		enemies.forEach(enemy => enemy.moveToward(player, enemy.speed));
		enemies[0].checkEnemyCollision();
		player.checkHit();
		scoreboard.updateScore();
		if (pauseGame) {
			this.loadPauseScreen();
		} else if (healthBar.value > 0) {
			requestAnimationFrame(this.drawScene.bind(this));
		} else {
			this.endGame();
		}
	}

	drawScene() {
		this.clearBackground();
		player.draw();
		enemies.forEach(enemy => enemy.draw());
		this.updateScene();
	}

	endGame() {
		this.pauseSounds();
		gameOverSound.currentTime = 1;
		gameOverSound.play();
		gameOver = true;
		ctx.font = "120px VT323";
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
		ctx.font = "50px VT323";
		ctx.fillText("CLICK to play again", canvas.width / 2, canvas.height / 2 + 50);
		ctx.textAlign = "left";
	}

	resetGame() {
		backgroundSounds.currentTime = 0;
		backgroundSounds.play();
		healthBar.value = 100;
		healthOnGround = false;
		starOnGround = false;
		scoreboard.resetScore();
		this.resetEnemies();
		gameOver = false;
		requestAnimationFrame(this.drawScene.bind(this));
	}

	spawnEnemy(x, y) {
		enemies.push(new Enemy(x, y, SKELETON_WIDTH, SKELETON_HEIGHT, game.randomSpeed()));
	}

	resetEnemies() {
		numSpawn = 1;
		maxSpeed = START_MAX_SPEED;
		minSpeed = START_MIN_SPEED;
		skeletonDamage = 1;
		enemies = [];
		this.spawnEnemy(-100, -100);
		this.spawnEnemy(canvas.width + 100, -100);
		this.spawnEnemy(-100, canvas.height + 100);
		this.spawnEnemy(canvas.width + 100, canvas.width + 50);
	}

	loadPauseScreen() {
		this.pauseSounds();
		ctx.font = "120px VT323";
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
		ctx.font = "30px VT323";
		ctx.fillText("HEALTH appears every five seconds.", canvas.width / 2, canvas.height / 2 + 50);
		ctx.fillText("A STAR appears every ten seconds.", canvas.width / 2, canvas.height / 2 + 80);
		ctx.fillText("A STAR kills three skeletons.", canvas.width / 2, canvas.height / 2 + 110);
		ctx.textAlign = "left";
	}

	clearBackground() {
		ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
		this.writeInstructions();
	}

	writeInstructions() {
		ctx.font = "20px VT323";
		ctx.fillStyle = "white";
		ctx.fillText("MOVE mouse to move.", 10, 20);
		ctx.fillText("CLICK to pause.", 10, 40);
	}

	randomLocation(max, size) {
		return Math.random() * (max - size);
	}

	randomSpeed() {
		return Math.random() * (maxSpeed - minSpeed) + minSpeed;
	}

	pauseSounds() {
		skeletonSounds.pause();
		backgroundSounds.pause();
	}
}

class Scoreboard {
	storeScore() {
	  if (typeof(Storage) !== "undefined") {
	    localStorage.setItem("highScore", highScore);
	  }
	}

	retrieveScore() {
	  if (typeof(Storage) !== "undefined") {
	    if (localStorage.getItem("highScore") === undefined || localStorage.getItem("highScore") === null) {
	      highScoreText.innerHTML = 0;
	    }
	    highScoreText.innerHTML = localStorage.getItem("highScore");
	    highScore = localStorage.getItem("highScore");
	  }
	}

	resetScore() {
		scoreMiliseconds = 0;
		scoreboard.retrieveScore();
		if (score > highScore) {
			highScore = score;
			highScoreText.innerHTML = highScore;
	    		scoreboard.storeScore();
		}
		score = 0;
		scoreText.innerHTML = 0;
	}

	updateScore() {
		scoreMiliseconds++;
		if (scoreMiliseconds % 100 === 0) {
			score++;
			if (score % 5 === 0) {
				if (maxSpeed < player.speed - speedIncrement) {
					minSpeed += speedIncrement;
					maxSpeed += speedIncrement;
				}
				for (let x = 0; x < numSpawn; x++) {
					game.spawnEnemy(canvas.width / 2, canvas.height + 50);
				}
			}
			health.checkPowerups();
			scoreText.innerHTML = score;
		}
	}
}

class soundHandler {

}

let scoreboard = new Scoreboard();
let game = new Game();

backgroundSounds.play();
scoreboard.retrieveScore();
requestAnimationFrame(game.drawScene.bind(game));

class Sprite {
	draw() {
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
	}
	//Credit to Ryan Taus for helping me with the math for this function :)
	moveToward(leader, speed) {
		let dx = leader.x - this.x;
		let dy = leader.y - this.y;
		let hypot = this.distanceTo(leader);
		let speedx = speed * (dx / hypot);
		let speedy = speed * (dy / hypot);
		if (hypot > speed) {
			this.x += speedx;
			this.y += speedy;
		}
	}
	jumpBack(sprite2, amount) {
		let spriteJumpingMidX = this.x + this.width / 2;
		let spriteJumpingMidY = this.y + this.height / 2;
		let sprite2MidX = sprite2.x + sprite2.width / 2;
		let sprite2MidY = sprite2.y + sprite2.height / 2;
		if (spriteJumpingMidX > sprite2MidX) {
			this.x = this.x + amount;
		} else {
			this.x = this.x - amount;
		}
		if (spriteJumpingMidY > sprite2MidY) {
			this.y = this.y + amount;
		} else {
			this.y = this.y - amount;
		}
	}
	checkBounds() {
		if (this.x < 0) {
			this.x = 0;
		} else if (this.x + this.width > canvas.width) {
			this.x = canvas.width - this.width;
		}
		if (this.y < 0) {
			this.y = 0;
		} else if (this.y + this.height > canvas.height) {
			this.y = canvas.height - this.height;
		}
	}

	hasCollidedWith(sprite2) {
		return (this.x < sprite2.x + sprite2.width && this.x + this.width > sprite2.x && this.y < sprite2.y + sprite2.height && this.height + this.y > sprite2.y);
	}

	distanceTo(sprite2) {
		return Math.hypot(this.x - sprite2.x, this.y - sprite2.y);
	}
}

//SOURCE: https://openclipart.org/detail/227980/pixel-character
var playerImage = new Image();
playerImage.src = "https://image.ibb.co/fPcP2w/8_Bit_Character_1_copy.png";
class Player extends Sprite {
	constructor(x, y, width, height, speed) {
		super();
		this.image = playerImage;
		Object.assign(this, {
			x,
			y,
			width,
			height,
			speed
		});
	}
	checkHit() {
		enemies.forEach(enemy => {
			if (enemy.hasCollidedWith(player)) {
				enemy.jumpBack(player, 10);
				healthBar.value -= skeletonDamage;
				skeletonSounds.play();
			}
		});
	}
}
let player = new Player(canvas.width / 2, canvas.height / 2, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED);

//SOURCE: http://keywordsuggest.org/gallery/748456.html
var skeletonImage = new Image();
skeletonImage.src = "https://image.ibb.co/chMfaG/trimmedskeleton.png";
class Enemy extends Sprite {
	constructor(x, y, width, height, speed) {
		super();
		this.image = skeletonImage;
		Object.assign(this, {
			x,
			y,
			width,
			height,
			speed
		});
	}
	checkEnemyCollision() {
		for (let x = 0; x < enemies.length; x++) {
			for (let y = enemies.length - 1; y > x; y--) {
				if (enemies[x].hasCollidedWith(enemies[y])) {
					enemies[x].jumpBack(enemies[y], 1);
				}
			}
		}
	}
}

let enemies = [
	new Enemy(-100, -100, SKELETON_WIDTH, SKELETON_HEIGHT, game.randomSpeed()),
	new Enemy(canvas.width + 100, -100, SKELETON_WIDTH, SKELETON_HEIGHT, game.randomSpeed()),
	new Enemy(-100, canvas.height + 100, SKELETON_WIDTH, SKELETON_HEIGHT, game.randomSpeed()),
	new Enemy(canvas.width + 100, canvas.width + 50, SKELETON_WIDTH, SKELETON_HEIGHT, game.randomSpeed())
];

class Powerup extends Sprite {
	checkPowerups() {
		if (score % 5 === 0) {
			health.drawPowerup();
			healthOnGround = true;
		}
		if (score % 10 === 0) {
			star.drawPowerup();
			starOnGround = true;
			skeletonDamage += 1;
		}
		if (score % 25 === 0) {
			numSpawn++;
		}
	}
	drawPowerup() {
		this.x = game.randomLocation(canvas.width, this.width);
		this.y = game.randomLocation(canvas.height, this.width);
		this.draw();
	}
}


//SOURCE: https://pixabay.com/en/pixel-heart-heart-pixel-symbol-red-2779422/
var healthImage = new Image();
healthImage.src = "https://image.ibb.co/eO8KYR/pixel_heart_2779422_960_720.png";
class Health extends Powerup {
	constructor(x, y, width, height) {
		super();
		this.image = healthImage;
		Object.assign(this, {
			x,
			y,
			width,
			height
		});
	}
	checkHealth() {
		this.draw();
		if (player.hasCollidedWith(health)) {
			healthSound.play();
			healthBar.value += healthValue;
			healthOnGround = false;
		}
	}
}

let health = new Health(game.randomLocation(canvas.width, HEALTH_SIZE), game.randomLocation(canvas.height, HEALTH_SIZE), HEALTH_SIZE, HEALTH_SIZE);

//SOURCE: https://www.stockunlimited.com/similar/2008684.html
var starImage = new Image();
starImage.src = "https://image.ibb.co/hSUbDR/pixel_gold_star_2021368.png";
class Star extends Powerup {
	constructor(x, y, width, height) {
		super();
		this.image = starImage;
		Object.assign(this, {
			x,
			y,
			width,
			height
		});
	}
	checkStar() {
		this.draw();
		if (player.hasCollidedWith(star)) {
			starSound.play();
			for (let x = 0; x < starPower; x++) {
				enemies.shift();
			}
			minSpeed = minSpeed - speedIncrement;
			maxSpeed = maxSpeed - speedIncrement;
			starOnGround = false;
		}
	}
}

let star = new Star(game.randomLocation(canvas.width, STAR_SIZE), game.randomLocation(canvas.height, STAR_SIZE), STAR_SIZE, STAR_SIZE);

let mouse = {
	x: 0,
	y: 0
};

function updateMouse(event) {
	const {
		left,
		top
	} = canvas.getBoundingClientRect();
	mouse.x = event.clientX - left;
	mouse.y = event.clientY - top;
}

document.body.addEventListener("mousemove", updateMouse);

function mouseClick(event) {
	if (gameOver) {
		game.resetGame();
	} else {
		if (pauseGame) {
			backgroundSounds.play();
			requestAnimationFrame(game.drawScene.bind(game));
		}
		pauseGame = !pauseGame;
	}
}

let konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
let enteredKeys = [];
let currentPos = 0;

document.addEventListener('keydown', function(e) {
	let key = e.keyCode;
	if (key === konamiCode[currentPos]) {
		currentPos++;
		enteredKeys.push(key);
	}
	else {
		currentPos = 0;
		enteredKeys = [];
	}
	if (enteredKeys.length === konamiCode.length) {
		activateKonamiCode();
	}
});

function activateKonamiCode() {
  //SOURCE: https://www.shutterstock.com/image-vector/seamless-pixelated-snow-texture-mapping-background-602230688?src=ofh7TSdxP506-TB16-Rnag-1-14
  backgroundImage.src = "https://image.ibb.co/bFDixw/grass_Konami.png";
  //Santa Hat SOURCE: http://moziru.com/explore/Santa%20Hat%20clipart%208%20bit/
  skeletonImage.src = "https://image.ibb.co/eznXqG/konami_Skeleton.png";
  playerImage.src = "https://image.ibb.co/hGFkAG/konami_Character.png";

  //SOURCE: https://www.youtube.com/watch?v=17731HiOiXg
  backgroundSounds.src = "https://raw.githubusercontent.com/mlouis2/chaser/master/sounds/KonamiMusic.mp3";
  backgroundSounds.currentTime = 0;
  backgroundSounds.play();
}
