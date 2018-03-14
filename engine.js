// Influence from http://nielsgrootobbink.com/wokflok/jte/jte_article_1.php

// VARIABLES

// engine
var engine = {};

// Background canvas
engine.canvas = document.getElementById('canvas');
engine.canvas.handle = engine.canvas.getContext('2d');


// Arena/map canvas
engine.arena = document.getElementById('arena');


// Player canvas
engine.playerCanvas = document.getElementById('player');


// Screen
engine.screen = {};
engine.screen.width = engine.canvas.width;
engine.screen.height = engine.canvas.height;

engine.screen.tilesX = engine.canvas.width / 32;
engine.screen.tilesY = engine.canvas.height / 32;

// Viewport
engine.viewport = {};
engine.viewport.x = 0;
engine.viewport.y = 32;		// Offset by 32 px to hide top row


// Preload textures
textures = {};
textures.btile = new Image();
textures.empty = new Image();
textures.grass = new Image();
textures.dirt = new Image();
textures.coal = new Image();
textures.stone = new Image();
textures.iron = new Image();
textures.diamond = new Image();
textures.player = new Image();
textures.sky = new Image();
textures.gem = new Image();
	
textures.btile.src = 'textures/btile.png';
textures.empty.src = 'textures/empty.png';
textures.grass.src = 'textures/grass.png';
textures.dirt.src = 'textures/dirt.png';
textures.coal.src = 'textures/coal.png';
textures.stone.src = 'textures/stone.png';
textures.iron.src = 'textures/iron.png';
textures.diamond.src = 'textures/diamond.png';
textures.player.src = 'textures/player.png';
textures.sky.src = 'textures/sky.png';
textures.gem.src = 'textures/gem.png';

// Map
map = new Array();

// Player
player = new Player();

// sky
sky = new Sky();

score = 0;

// OBJECTS //

function Sky() {
	this.texture = textures.sky;
	this.x = 0;
	this.y = -engine.canvas.height - (engine.canvas.height / 2);
	this.height = engine.canvas.height;
	this.width = engine.canvas.width;
	this.speed = -1;
	
}

// Player object
function Player() {
	this.skin = textures.player;
	this.x = engine.canvas.width / 2;
	this.y = engine.screen.tilesY * 16;
	this.height = 32;
	this.width = 32;
	this.speed = 5;
	this.velX = 0;
	this.velY = 0;
	this.jumping = false;
	this.on_surface = false;
	this.gridX = null;
	this.gridY = null;
}


// Tile object
function Tile(type, texture, hp) {
	this.id = map.length;
	this.type = type;
	this.texture = texture;
	this.hp = hp;
	this.height = 32;
	this.width = 32;
	this.gridX = null;
	this.gridY = null;
	this.x = null;
	this.y = null;
	this.is_surface = true;
};


// Object for tracking collision tiles
function Collision_Tiles(Tile) {
	this.left = null;
	this.right = null;
	this.above = null;
	this.below = null;
};

// FUNCTIONS

// Create tile based on input
function createTile(type){
	var tile;
	
	if (type === 0){
		tile = new Tile('btile', textures.btile, 0);
	} else if (type === 1){
		tile = new Tile('empty', textures.empty, 0);
		tile.is_surface = false;
	} else if (type === 2){
		tile = new Tile('grass', textures.grass, 1);
	} else if (type === 3) {
		tile = new Tile('dirt', textures.dirt, 3);
	} else if (type === 4) {
		tile = new Tile('coal', textures.coal, 6);
	} else if (type === 5) {
		tile = new Tile('stone', textures.stone, 8);
	} else if (type === 6) {
		tile = new Tile('iron', textures.iron, 12);
	} else if (type === 7) {
		tile = new Tile('diamond', textures.diamond, 16);
	} else if (type === 8) {
		tile = new Tile('gem', textures.gem, 0)
	}
	
	return tile;
	
};


// Retrieve tile - Gets tile by ID
function retrieveTile(id) {
	for (r=0; r < map.length; r++) {
		for (c = 0; c < map[r].length; c++){
			if (map[r][c].id === id) {
				return map[r][c];
			};
		}
	}
};



// Draw the map
function drawMap(){	
	// redraw map if there are any changes
	var tile;
	
	// Iterate rows and columns. Draw tile based on ID
	for (r=0; r < map.length; r++) {
		for (c=0; c < map[r].length; c++) {
				tile = map[r][c];
				drawTile(c, r, tile);
		}
	}		

	// Draw player
	drawPlayer();
	
	// Draw Sky
	drawSky();
	
	// Draw scoreboard
	drawScore();
	
};



// Draw a tile
function drawTile(x, y, tile){
	//tile = retrieveTile(tileID);
	tile.gridX = x;
	tile.gridY = y;
	tile.x = x * 32;
	tile.y = y * 32;
	
	engine.canvas.handle.clearRect(tile.x, tile.y, tile.width, tile.height);
	engine.canvas.handle.drawImage(tile.texture, tile.x, tile.y);
}


// Draw a dug tile
function drawDugout(tile){	
	engine.canvas.handle.clearRect(tile.x, tile.y, tile.width, tile.height);
	engine.canvas.handle.drawImage(tile.texture, tile.x, tile.y);
}


// Draw player
function drawPlayer(){
	engine.canvas.handle.clearRect(player.x, player.y, player.width, player.height);
	movePlayer();
	engine.canvas.handle.drawImage(player.skin, player.x, player.y);
}


function drawSky(){
	engine.canvas.handle.clearRect(sky.x, sky.y, sky.width, sky.height);
	sky.y -= sky.speed;
	engine.canvas.handle.drawImage(sky.texture, sky.x, sky.y);
	
}

function drawScore(){
	engine.canvas.handle.fillStyle = '#000000';
	engine.canvas.handle.fillRect(0, 0, 110, 50);
	
	engine.canvas.handle.font = "24px Arial bold";
    engine.canvas.handle.fillStyle = "#ffffff";
	engine.canvas.handle.fillText('Gems: ' + score, 10, 32);
}

// Scroll the map
function scrollMap(){
	
	// Generate new row - randomize tiles
	nextRow = new Array();
	for (c = 0; c < engine.screen.tilesY; c++){
		tileType = getType(randInt(0,100));
		tile = createTile(tileType);
		nextRow[c] = tile;
	}
	
	// Add row to end of map array
	map[map.length] = nextRow;

	// remove top row of map
	map.splice(0,1);

	// Adjust tile id's to new map locations
	count = 0
	for (r = 0; r < map.length; r++) {
		for (c = 0; c < map[r].length; c++){
			map[r][c].id = count;
			
			// Move tile up one row (subtract height)
			map[r][c].y -= map[r][c].height;
			
			// Adjust grid Y by 1 for each tile
			map[r][c].gridY -= 1;
		}
	}

	// scroll player with map
	player.y -= player.height;
	
	// scroll sky with map
	sky.y -= player.height;
	
	drawMap();
}



// Start
// Draw canvas
function startEngine() {

	console.log('starting...');
	
	engine.viewport.x = 0;
	engine.viewport.y = 0;
	drawMap();

	console.log('done');	

};



	
// Physics variables		
var friction = .9;
var gravity = 0.2;
var scrollRate = .5;


// Animation functions
function movePlayer(){

	player.gridX = Math.floor(player.x / 32);
	player.gridY = Math.floor(player.y / 32);

	
	// Player movement
	if (!(player.jumping)){
		player.velX *= friction;
	}
	
	player.x += player.velX;

	if (player.velY <= 10){
		player.velY += gravity;
	}

	// cancel Y drop if player on a surface
	if (!(player.on_surface)) {
		player.y += player.velY;
	}
	
	// Check for collisions
	collision_check();
	
	// Prevent leaving the screen
	// Horizontal check
	if (player.x >= engine.screen.width - player.width) {
		player.x = engine.screen.width - player.width - 1;
		player.velX = 0;
		
	} 
	
	if (player.x <= 0) {
		player.x = 0;
		player.velX = 0;
	}

	// Vertical check bottom
	if(player.y >= engine.screen.height - player.height){
		player.y = engine.screen.height - player.height;
		player.jumping = false;
		player.on_surface = true;			
	} else if (player.y <= -player.height/2) { // Vertical check top
		player.velY += gravity;
	}
	
	
	if (player.gridY >= engine.screen.tilesY - 4) {
		scrollMap();
	}
		
}



// Collision detection
function collision_check() {

	// Get surrounding tiles
	Collision_Tiles.above = map[player.gridY - 1][player.gridX];
	Collision_Tiles.below = map[player.gridY + 1][player.gridX];
	Collision_Tiles.right = map[player.gridY][player.gridX + 1];

	try {
		Collision_Tiles.left = map[player.gridY][player.gridX - 1];
	} catch (TypeError) {
		Collision_Tiles.left = null;
	}
	
	// Tile exists above player's Y grid location. Player's Y value is less than bottom of tile above. 
	if (Collision_Tiles.above && Collision_Tiles.above.is_surface && player.y <= (Collision_Tiles.above.y + Collision_Tiles.above.height)) {		
		// Player hits tile. Stop upward movement if not a gem or empty. If gem, add score.
		if (Collision_Tiles.above.type === 'gem'){
			Collision_Tiles.above.texture = textures.empty;
			Collision_Tiles.above.is_surface = false;
			score += 1;
			drawDugout(Collision_Tiles.above);
		} else {
			player.y = Collision_Tiles.above.y + Collision_Tiles.above.height;
			player.velY = 0;
		}
	}

	// Tile exists below player's Y grid. Tile's Y value is less than bottom of player.
	if (Collision_Tiles.below && Collision_Tiles.below.is_surface && Collision_Tiles.below.y <= (player.y + player.height)){
		// Player is on top surface of tile.
		player.y = Collision_Tiles.below.y - player.height;
		player.VelY = 0;
		player.on_surface = true;

		// Player has landed. Jump is over.
		if (player.jumping){
			player.jumping = false;
		}
		
	} else if (Collision_Tiles.below && !Collision_Tiles.below.is_surface){
		player.on_surface = false;
		player.velY += gravity;
	}
	
	// Tile exists to the left of player. Player's X value is less than tile's X + width
	if (Collision_Tiles.left && Collision_Tiles.left.is_surface	&& player.x <= (Collision_Tiles.left.x + Collision_Tiles.left.width) && player.x >= (Collision_Tiles.left.x + Collision_Tiles.left.width - 8)){
		// Player hits tile right wall. Velocity stops.
		player.velX = 0;
		player.x = Collision_Tiles.left.x + Collision_Tiles.left.width;
	}
	
	// Tile exists to right of player. Player's X + width is greater than tile's X value
	if (Collision_Tiles.right && Collision_Tiles.right.is_surface && Collision_Tiles.right.x <= player.x + player.width){
		// Player hits tile left wall. Velocity stops.
		player.velX = 0;
		player.x = Collision_Tiles.right.x - player.width;
	}
	
}
	
	
document.body.addEventListener("keydown", function(e) {

	// Key commands
	if (e.keyCode == 37){
		// left arrow 
		if (Collision_Tiles.left && Collision_Tiles.left.is_surface && player.x == Collision_Tiles.left.x + Collision_Tiles.left.width){
			// Dig at tile. Remove one hit point per strike.
			Collision_Tiles.left.hp -= 1;

			// Dig out tile at hp 0
			if (Collision_Tiles.left.hp <= 0) {
				Collision_Tiles.left.texture = textures.empty;
				Collision_Tiles.left.is_surface = false;
				if (Collision_Tiles.left.type === 'gem'){
					score += 1;
				}
				drawDugout(Collision_Tiles.left);
			}
		}		

	   if (player.velX > -player.speed) {
		   player.velX--;
	   }
	}
	
	if (e.keyCode == 38 || e.keyCode == 32){
		// up arrow or space. jumping True if not already.
		if(!player.jumping){
			player.jumping = true;
			player.on_surface = false;
			player.velY = -player.speed * 2;
		}

		if (Collision_Tiles.below.type === 'gem'){
			score += 1;
		}
		drawDugout(Collision_Tiles.above);
		
	}
	
	if (e.keyCode == 39){
		// right arrow
		if (Collision_Tiles.right.is_surface){
			
			// Dig at tile. Remove one hit point per strike.
			Collision_Tiles.right.hp -= 1;

			// Dig out tile at hp 0
			if (Collision_Tiles.right.hp <= 0){
				Collision_Tiles.right.texture = textures.empty;
				Collision_Tiles.right.is_surface = false;
				if (Collision_Tiles.right.type === 'gem'){
					score += 1;
				}
				drawDugout(Collision_Tiles.right);

			}
		}
	   
		if (player.velX < player.speed) {                         
		   player.velX++;                  
		}          
	}
	
	if (e.keyCode == 40){
		// down arrow. Player down if possible.
		if (Collision_Tiles.below.is_surface){
			
			// Dig at tile.
			Collision_Tiles.below.hp -= 1;
			
			// Dig out tile at hp 0
			if (Collision_Tiles.below.hp <= 0) {
				Collision_Tiles.below.texture = textures.empty;
				Collision_Tiles.below.is_surface = false;
				if (Collision_Tiles.below.type === 'gem'){
					score += 1;
				}
				drawDugout(Collision_Tiles.below);
			}
		}
		
		if (player.velX > -player.speed) {
		   player.Y++;
		}	
	}
	
});	
	


// Animation function
var start = null;
function animate(timestamp){

	if (!start) start = timestamp;
	var progress = timestamp - start;
	drawMap();
	
	if (!(sky.y + sky.height === player.y + player.height)) {
		window.requestAnimationFrame(animate);
	} else {
		alert("Game over!!!\nYour score: " + score + ' gems');
	}
}


// Random number generator
function randInt(min, max) {
	var range = max - min + 1;
	return Math.floor(Math.random() * range + min);
}

function getType(number) {
	
	if (number >= 0 && number < 5){
		type = 8								// Gem - 5%
	} else if (number >= 5 && number < 20) {
		type = 1 								// Empty tile - 15%
	} else if (number >= 20 && number < 50) {
		type = 3 								// Dirt - 30%
	} else if (number >= 50 && number < 70) {
		type = 4 								// coal - 20%
	} else if (number >= 70 && number < 85) {
		type = 5 								// stone - 15%
	} else if (number >= 85 && number < 95) {
		type = 6 								// iron - 10%
	} else if (number >= 95 && number <= 100) {
		type = 7 								// diamond - 5%
	}
	return type
	
}


