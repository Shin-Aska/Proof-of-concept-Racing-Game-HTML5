var width = 400;
var height = 200;

// Global variables

var c = document.getElementById("game-window");
var ctx = c.getContext("2d");

var fpsHolder = document.getElementById("fps");
var distanceHolder = document.getElementById("distance");
var totalDistanceHolder = document.getElementById("total_distance");

// We create an image buffer
var background_img = ctx.createImageData(c.width, c.height);
var pixels = new Uint32Array(background_img.data.buffer);

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

// This function is a bit slow but well the idea is
// we will manipulate the buffer first initialized in line 13
// because apparently fastRect is REALLY SLOW
function fastRect (canvas, pixels, minx, miny, maxx, maxy, color) {
    
    var width = canvas.width;
    var height = canvas.height;
	
	var r = color[0];
	var g = color[1];
	var b = color[2];
    
    if (minx < 0) minx = 0;
    else if (minx > width) minx = width;
    else minx = minx|0;
    
    if (miny < 0) miny = 0;
    else if (miny > height) miny = height;
    else miny = miny|0;
    
    if (maxx < 0) maxx = 0;
    else if (maxx > width) maxx = width;
    else maxx = maxx|0;
    
    if (maxy < 0) maxy = 0;
    else if (maxy > height) maxy = height;
    else maxy = maxy|0;
    
    var colour =  255 << 24 | (0.5 + b * 255) << 16 | (0.5 + g * 255) << 8 | (0.5 + r * 255);
    
    for (var y = miny; y < maxy; ++y) {
        
        var i = y * width;
        
        for (var x = minx; x < maxx; ++x) {
            
            pixels[i + x] = colour;
            
        }
    }
    
};

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
		// Pre compute half of the height to make it a little bit faster
		var half_height = height / 2;
		for (var y = 0; y < half_height; y++) {
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
				
				var row = half_height + y;
				
				// Uncomment this one if you are going to use the fillRect instead of our custom fastRect function
				// var grassColor = Math.sin(20.0 * Math.pow(1.0 - perspective, 3) + Player.distance * 0.1) > 0.0 ? "green" : "darkgreen";
				var grassColor = Math.sin(20.0 * Math.pow(1.0 - perspective, 3) + Player.distance * 0.1) > 0.0 ? [0.2, 0.8, 0.1] : [0.3, 0.7, 0.1];
				
				//var clipColor = Math.sin(80.0 * Math.pow(1.0 - perspective, 3) + Player.distance * 0.5) > 0.0 ? "red" : "white";
				var clipColor = Math.sin(80.0 * Math.pow(1.0 - perspective, 3) + Player.distance * 0.5) > 0.0 ? [0.8, 0.2, 0.1] : [1, 1, 1];
				var chosenColor;
				
				if (x >= 0 && x < leftGrass) {
					chosenColor = grassColor;
				}
				if (x >= leftGrass && x < leftClip) {
					chosenColor = clipColor;
				}
				if (x >= leftClip && x < rightClip) {
					//ctx.fillStyle = "grey";
					chosenColor = [0.2, 0.2, 0.2];
				}
				if (x >= rightClip && x < rightGrass) {
					chosenColor = clipColor;
				}
				if (x >= rightGrass && x < width) {
					chosenColor = grassColor;
				}
				//ctx.fillRect(x, row, 1, 1);
				fastRect(c, pixels, x, row, x+1, row+1, chosenColor);
			}
		}
		// Our buffer will be drawn in a single call instead
		ctx.putImageData(background_img, 0, 0);
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
