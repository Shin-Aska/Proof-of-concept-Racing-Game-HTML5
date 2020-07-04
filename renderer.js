var width = 400;
var height = 200;

// Global variables

var c = document.getElementById("game-window");
var ctx = c.getContext("2d");

var fpsHolder = document.getElementById("fps");
var distanceHolder = document.getElementById("distance");
var totalDistanceHolder = document.getElementById("total_distance");

// Objects 
var Assets = {
	car: null,
	backgrounds: {
		city1: null
	}
}

var Player = {
	distance: 0.0,
	track: 0,
	offsetDistance: 0.0
}

var Car = {
	position: 0.0,
	speed: 0.0,
	inertia: 0.0,
	perspective: {
		curviture: 0.0
	}
}

var tracks = {
	list: [
		{"curviture": 0.0, "distance": 100},
		{"curviture": 1.0, "distance": 500},
		{"curviture": 0.0, "distance": 500},
		{"curviture": -0.1, "distance": 500},
		{"curviture": 0.0, "distance": 1000}
	]
}

var total_distance = 0;
tracks.list.forEach((track) => {
	total_distance += track.distance;
});

async function loadImage(src) {
	return new Promise((resolve, reject) => {
		var carimg = new Image();
		carimg.src = src;
		carimg.onload = function() {
			resolve(carimg);
		}
	});
}

// Performance metrics for our game loop
var dt;
var lastUpdateFrame = performance.now();

async function main() {
	totalDistanceHolder.innerHTML = total_distance;
	// Asset loading procedures
	Assets.car = await loadImage("car.png");
	Assets.backgrounds.city1 = await loadImage("bg.png");
	
	
	// The actual game loop, lol
	window.gameloop = function() {
		var now = performance.now();
		dt = now - lastUpdateFrame;
		dt_c = 1000 / dt;
		dt_t = dt / 1000;
		
		fpsHolder.innerHTML = Math.round(dt_c);
		distance.innerHTML = Math.round(Player.distance);
		
		if (total_distance <= Player.distance) {
			alert("Game Over");
			return;
		}
		
		while(Player.track < tracks.list.length && Player.offsetDistance <= Player.distance) {
			Player.offsetDistance += tracks.list[Player.track].distance;
			Player.track++;
		}
		
		var curviture = tracks.list[Player.track - 1].curviture;
		var curviture_diff = (curviture - Car.perspective.curviture) * dt_t * Car.speed;
		Car.perspective.curviture += curviture_diff;
		// Game drawing procedure
		
		// Clear screen
		ctx.fillStyle = "skyblue";
		ctx.fillRect(0, 0, width, height);
		var carDirection = 0;
		
		if (keys[K_UP]) {
			Car.speed += 2.0 * dt_t;
		}
		else {
			Car.speed -= 1.0 * dt_t;
		}
		
		if (keys[K_LEFT]) {
			Car.inertia -= 0.7 * dt_t;
			carDirection -= 1;
		}
		
		if (keys[K_RIGHT]) {
			Car.inertia += 0.7 * dt_t;
			carDirection += 1;
		}
		
		if (Car.speed < 0.0) Car.speed = 0;
		if (Car.speed > 1.0) Car.speed = 1;
		
		Player.distance += (200 * Car.speed) * dt_t;
		
		for (var y = 0; y < height / 2; y++) {
			for (var x = 0; x < width; x++) {
			
				var perspective = y / (height / 2.0);
				var middlePoint = 0.5 + Car.perspective.curviture * Math.pow((1.0 - perspective), 3);
				var roadWidth = 0.1 + perspective * 0.8;
				var clipWidth = roadWidth * 0.15;
				
				roadWidth *= 0.5;
				var leftGrass = (middlePoint - roadWidth - clipWidth) * width;
				var leftClip = (middlePoint - roadWidth) * width;
				
				var rightGrass = (middlePoint + roadWidth + clipWidth) * width;
				var rightClip = (middlePoint + roadWidth) * width;
				
				var row = height / 2 + y;
				
				// Colors depending on distance of the pixel
				var grassColor = Math.sin(20.0 * Math.pow(1.0 - perspective, 3) + Player.distance * 0.1) > 0.0 ? "green" : "darkgreen";
				
				var clipColor = Math.sin(80.0 * Math.pow(1.0 - perspective, 3) + Player.distance * 0.5) > 0.0 ? "red" : "white";
				
				if (x >= 0 && x < leftGrass) {
					ctx.fillStyle = grassColor;
				}
				if (x >= leftGrass && x < leftClip) {
					ctx.fillStyle = clipColor;
				}
				if (x >= leftClip && x < rightClip) {
					ctx.fillStyle = "grey";
				}
				if (x >= rightClip && x < rightGrass) {
					ctx.fillStyle = clipColor;
				}
				if (x >= rightGrass && x < width) {
					ctx.fillStyle = grassColor;
				}
				ctx.fillRect(x, row, 2, 2);
			}
		}
		Car.position = Car.inertia - Car.perspective.curviture;
		var rendered_CarPosition = width / 2 + ((width * Car.position) / 2.0) - 25;
		if (carDirection == 0) {
			ctx.drawImage(Assets.car, 5, 30, 60, 35, rendered_CarPosition, 160, 50, 30);
		}
		else if (carDirection == -1) {
			ctx.drawImage(Assets.car, 315, 158, 60, 35, rendered_CarPosition, 160, 50, 30);
		}
		else {
			ctx.drawImage(Assets.car, 195, 30, 60, 35, rendered_CarPosition, 160, 50, 30);
		}
		
		ctx.drawImage(Assets.backgrounds.city1, 400, 70 + (70 * Player.distance / total_distance), width, height / 2, 0, 0, width, height / 2);
		lastUpdateFrame = now;
		window.requestAnimationFrame(window.gameloop);
	}
	window.requestAnimationFrame(window.gameloop);
}

main();
