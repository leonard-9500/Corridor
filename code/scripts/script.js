/* Program: script.js
 * Programmer: Leonard Michel
 * Start Date: 11.08.2021
 * Last Change:
 * End Date: /
 * License: /
 * Version: 0.0.0.0
*/

/**** INITIALIZATION ****/

const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;
const debugMode = true;

let canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

ctx.save();
// Flip the canvas' y-axis.
//ctx.scale(1, -1);
// Move the canvas down by SCREEN_HEIGHT as it is currently above the viewport.
//ctx.transform(1, 0, 0, 1, 0, -SCREEN_HEIGHT);

let radians = Math.PI / 180;

/* Key Presses */
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

let wPressed = false,
    aPressed = false,
    sPressed = false,
    dPressed = false,
    jPressed = false,
    kPressed = false,
    lPressed = false;

let wPressedBefore = false,
    aPressedBefore = false,
    sPressedBefore = false,
    dPressedBefore = false,
    jPressedBefore = false,
    kPressedBefore = false,
    lPressedBefore = false;

let mouseX = 0.0,
	mouseY = 0.0,
	mouseLastX = 0.0,
	mouseLastY = 0.0;

function keyDownHandler(e)
{
    if (e.code == "KeyW") { wPressed = true; }
    if (e.code == "KeyA") { aPressed = true; }
    if (e.code == "KeyS") { sPressed = true; }
    if (e.code == "KeyD") { dPressed = true; }

    if (e.code == "KeyJ") { jPressed = true; }
    if (e.code == "KeyK") { kPressed = true; }
    if (e.code == "KeyL") { lPressed = true; }
}

function keyUpHandler(e)
{
    if (e.code == "KeyW") { wPressed = false; }
    if (e.code == "KeyA") { aPressed = false; }
    if (e.code == "KeyS") { sPressed = false; }
    if (e.code == "KeyD") { dPressed = false; }

    if (e.code == "KeyJ") { jPressed = false; }
    if (e.code == "KeyK") { kPressed = false; }
    if (e.code == "KeyL") { lPressed = false; }
}

function mouseMoveHandler(e)
{
	mouseX = e.clientX;
	mouseY = e.clientY;
}

/* Class Definitions */
class Block
{
	constructor()
	{
		this.color = "#ffffff";
		this.isVisible = true;
		this.hasCollision = true;
	}
}

class Player
{
	constructor()
	{
		this.x = 8;
		this.y = 8;
		this.viewHeight = 32;
		this.distToProjPlane = 10;
		this.velX = 0;
		this.velY = 0;
		this.collisionAccuracy = 0.1;
		this.mouseSensitivity = 0.5;
		this.maxVel = 2;
		this.rotZ = 0;
		this.fov = 90;
	}

	update()
	{
		this.velX = 0;
		this.velY = 0;
		this.handleInput();
		this.x += this.velX * elapsedTime / 1000;
		this.y += this.velY * elapsedTime / 1000;
		this.collisionDetection();
		this.draw();
	}

	handleInput()
	{
		// Forward
		if (wPressed)
		{
			this.velX += Math.sin(this.rotZ * radians);
			this.velY -= Math.cos(this.rotZ * radians);
		}
		// Left
		if (aPressed)
		{
			this.velX += Math.sin((this.rotZ-90) * radians);
			this.velY -= Math.cos((this.rotZ-90) * radians);
		}
		// Backwards
		if (sPressed)
		{
			this.velX += Math.sin((this.rotZ-180) * radians);
			this.velY -= Math.cos((this.rotZ-180) * radians);
		}
		// Right
		if (dPressed)
		{
			this.velX += Math.sin((this.rotZ+90) * radians);
			this.velY -= Math.cos((this.rotZ+90) * radians);
		}

		this.rotZ += (mouseX-mouseLastX) * this.mouseSensitivity;
		mouseLastX = mouseX;
	}

	collisionDetection()
	{
		// Out of bounds collision detection
		if (this.x < 0) { this.x = 0; };
		if (this.x > MAP_WIDTH) { this.x = MAP_WIDTH; };
		if (this.y < 0) { this.y = 0; };
		if (this.y > MAP_HEIGHT) { this.y = MAP_HEIGHT; };

		let mapIndex = map[Math.round(this.x) + Math.round(this.y) * MAP_WIDTH];
		if (mapBlock[mapIndex].hasCollision)
		{
			this.x -= this.velX * elapsedTime/1000;
			this.y -= this.velY * elapsedTime/1000;
		}
	}

	draw()
	{
		/* Raycast image */
		let rayX = this.x;
		let rayY = this.y;
		let rayRotZ = this.rotZ-this.fov/2;
		let rayHitWall = false;
		let rayStartX = 0.0,
			rayStartY = 0.0,
			rayEndX = 0.0,
			rayEndY = 0.0;
		let rayMaxDist = Math.sqrt((MAP_WIDTH*MAP_WIDTH)+(MAP_HEIGHT*MAP_HEIGHT));
		let rayMaxSearches = 500;
		// How exact the ray is.
		let rayLengthMultiplier = rayMaxDist / rayMaxSearches;

		// The start angle of the first (left-most) ray.
		let firstRayAngle = this.rotZ-this.fov/2;
		// How much is the angle of the ray changed for each line drawn on the screen.
		let rayAngleIncrement = this.fov/SCREEN_WIDTH;

		for (let i = 0; i < SCREEN_WIDTH; i++)
		{
			// Put ray at player position
			rayStartX = this.x;
			rayStartY = this.y;
			rayEndX = this.x;
			rayEndY = this.y;

			// As i increases, the ray turns from left to right.
			rayRotZ = firstRayAngle + i*rayAngleIncrement;

			rayHitWall = false;

			// How many times can the algorithm increase the ray's distance as long as the ray hasn't hit anything
			for (let n = 0; n < rayMaxSearches, !rayHitWall; n++)
			{
				// Out of bounds collision detection

				if (rayEndX < 0 || rayEndX > MAP_WIDTH || rayEndY < 0 || rayEndY > MAP_HEIGHT)
				{
					rayHitWall = true;
					//console.log("Ray out of bounds.\n");
				}
				else
				{
					//console.log("Ray not out of bounds.\n");
					let rayWidth = rayEndX-rayStartX;
					let rayHeight = rayEndY-rayStartY;

					if (rayWidth < 0) { rayWidth *= -1; };
					if (rayHeight < 0) { rayHeight *= -1; };

					let rayDist = Math.sqrt((rayWidth*rayWidth)+(rayHeight*rayHeight));
					// Ray has reached clipping distance.
					if (rayDist > rayMaxDist)
					{
						//console.log("Max ray distance exceeded.\n");
						rayHitWall = true;
					}
					else
					{
						let mapIndex = parseInt(map[Math.round(rayEndX) + Math.round(rayEndY) * MAP_WIDTH], 10);
						// Ray has hit wall block
						if (mapBlock[mapIndex].isVisible)
						{
							rayHitWall = true;

							// This fixes the fisheye effect
							let rayToCamAngle = rayRotZ-this.rotZ;
							rayDist *= Math.cos(rayToCamAngle * radians);

							let lineHeight = SCREEN_HEIGHT / rayDist;
							// The light falloff value (multiplier)
							let lFV = 1 / (rayDist * rayDist);

							let c = mapBlock[mapIndex].color;
							//c = hexToRGBColor(c);

							//let cR = parseInt(c[2]);
							//console.log(c);
							ctx.strokeStyle = `rgb(${Math.floor(MAP_BASELIGHT * lFV)}, ${Math.floor(MAP_BASELIGHT * lFV)}, ${Math.floor(MAP_BASELIGHT * lFV)})`;

							// Draw wall line
							ctx.beginPath();
							ctx.moveTo(i, SCREEN_HEIGHT/2 - lineHeight/2);
							ctx.lineTo(i, SCREEN_HEIGHT/2 + lineHeight/2);
							ctx.stroke();

							// Experimental
							// Draw texture for wall line/slice

							// How many pixels is one texture pixel high.
							/*
							let texelSizeY = lineHeight / 64;
							let ctxStartY = SCREEN_HEIGHT/2 - lineHeight/2;
							ctx.beginPath();
							ctx.moveTo(i, ctxStartY);
							for (let n = 0; n <= 64; n++)
							{
								ctx.strokeStyle = `rgb(${Math.floor(MAP_BASELIGHT * lFV - n)}, ${Math.floor(MAP_BASELIGHT * lFV)}, ${Math.floor(MAP_BASELIGHT * lFV)})`;
								ctx.lineTo(i, ctxStartY + texelSizeY*(n+1));
							}
							ctx.stroke();
							*/

							//console.log("Wall line drawn.\n");
						}
						// Ray has hit nothing, so extend it.
						else
						{
							rayEndX += Math.sin(rayRotZ * Math.PI / 180) * rayLengthMultiplier;
							rayEndY -= Math.cos(rayRotZ * Math.PI / 180) * rayLengthMultiplier;
							//console.log("Ray extended.\n");
						}
					}
				}
			}
		}

		/* Minimap */
		let minimapScale = 5;
		let rW = 1 * minimapScale;
		let rH = 1 * minimapScale;

		for (let y = 0; y < MAP_HEIGHT; y++)
		{
			for (let x = 0; x < MAP_WIDTH; x++)
			{
				let mapIndex = parseInt(map[Math.floor(x) + Math.floor(y) * MAP_WIDTH], 10);
				//console.log(mapIndex);
				if (mapBlock[mapIndex] != " ")
				{
					if (mapBlock[mapIndex].isVisible)
					{
						ctx.fillStyle = mapBlock[mapIndex].color;
						ctx.fillRect(x*minimapScale, y*minimapScale, rW, rH);
					}
				}
			}
		}
	}
}

/* Function definitions */
function getRandomIntInclusive(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);
    // The maximum and minimum are inclusive
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function hexToRGBColor(color)
{
	let hexColorValues = [];
}

let map = "";
map += "1111111111111111";
map += "1000000000000001";
map += "1000000000000001";
map += "1001110000111001";
map += "1001110000111001";
map += "1000000000000001";
map += "1000000000000001";
map += "1001110000111001";
map += "1001110000111001";
map += "1000000000000001";
map += "1000000000000001";
map += "1001110000111001";
map += "1001110000111001";
map += "1000000000000001";
map += "1000000000000001";
map += "1111111111111111";
let MAP_WIDTH = 16;
let MAP_HEIGHT = 16;
let MAP_BASELIGHT = 64;
// The width, length and height of each of the map cubes.
let MAP_WALLSIZE = 64;

let mapBlock = [];
for (let i = 0; i < 10; i++)
{
	mapBlock[i] = new Block;
}
mapBlock[0].isVisible = false;
mapBlock[0].hasCollision = false;

mapBlock[1].color = "#ff8800";
let mapBlockWidth = 4;


let player = new Player;

// Time variables
let tp1 = Date.now();
let tp2 = Date.now();
let elapsedTime = 0;

// The game loop
window.main = function ()
{
    window.requestAnimationFrame(main);
    // Get elapsed time for last tick.
    tp2 = Date.now();
    elapsedTime = tp2 - tp1;
    //console.log("elapsedTime:" + elapsedTime + "\n");
    tp1 = tp2;

    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

	player.update();
}

// Start the game loop
main();