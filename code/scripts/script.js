/* Program: script.js
 * Programmer: Leonard Michel
 * Start Date: 11.08.2021
 * Last Change:
 * End Date: /
 * License: /
 * Version: 0.0.0.0
*/

/**** INITIALIZATION ****/

const SCREEN_WIDTH = 360;
const SCREEN_HEIGHT = 240;
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

/* Class Definitions */
class Player
{
	constructor()
	{
		this.x = 4;
		this.y = 4;
		this.rotZ = 0;
		this.fov = 90;
	}

	update()
	{
		this.handleInput();
		this.collisionDetection();
		this.draw();
	}

	handleInput()
	{
	}

	collisionDetection()
	{
	}

	draw()
	{
		let rayX = this.x;
		let rayY = this.y;
		let rayRotZ = this.rotZ-this.fov/2;
		let rayHitWall = false;
		let rayStartX = 0.0,
			rayStartY = 0.0,
			rayEndX = 0.0,
			rayEndY = 0.0;
		let rayMaxDist = 8;//Math.sqrt((MAP_WIDTH*MAP_WIDTH)+(MAP_HEIGHT*MAP_HEIGHT));

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

			while (!rayHitWall)
			{
				// Out of bounds collision detection

				if (rayEndX < 0 || rayEndX > MAP_WIDTH || rayEndY < 0 || rayEndY > MAP_HEIGHT)
				{
					rayHitWall = true;
					//console.log("Ray out of bounds.\n");
				}
				else
				{
					console.log("Ray not out of bounds.\n");
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
						// Ray has hit wall block
						if (map[Math.round(rayEndX) + Math.round(rayEndY) * MAP_WIDTH] == "#")
						{
							rayHitWall = true;
							let lineHeight = SCREEN_HEIGHT / rayDist;
							ctx.fillStyle = "#888888";

							ctx.beginPath();
							ctx.moveTo(i, SCREEN_HEIGHT/2 - lineHeight/2);
							ctx.lineTo(i, SCREEN_HEIGHT/2 + lineHeight/2);
							ctx.stroke();

							//console.log("Wall line drawn.\n");
						}
						// Ray has hit nothing, so extend it.
						else
						{
							rayEndX += Math.sin(rayRotZ * Math.PI / 180) / 5;
							rayEndY -= Math.cos(rayRotZ * Math.PI / 180) / 5;
							//console.log("Ray extended.\n");
						}
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

let map = "";
map += "########";
map += "#      #";
map += "#      #";
map += "#      #";
map += "#      #";
map += "#      #";
map += "#      #";
map += "########";
let MAP_WIDTH = 8;
let MAP_HEIGHT = 8;


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