const TILE_SIZE = 64;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_Angle = 60 * (Math.PI / 180);

const WALL_STRIP_WIDTH = 10;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

const MINIMAP_SCALE_FACTOR = 0.2;

class Map {
    constructor() {
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ];
    }
    hasWallAt(x, y) {
        if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT) {
            return true;
        }

        var mapGridIndexX = Math.floor(x / TILE_SIZE);
        var mapGridIndexY = Math.floor(y / TILE_SIZE);
        return this.grid[mapGridIndexY][mapGridIndexX] != 0;
    }

    render() {
        for (var i = 0; i < MAP_NUM_ROWS; i++) {
            for (var j = 0; j < MAP_NUM_COLS; j++) {
                var tileX = j * TILE_SIZE;
                var tileY = i * TILE_SIZE;
                var tileColor = this.grid[i][j] == 1 ? "#222" : "#fff";
                stroke("#222");
                fill(tileColor);
                rect(
                    MINIMAP_SCALE_FACTOR * tileX,
                    MINIMAP_SCALE_FACTOR * tileY,
                    MINIMAP_SCALE_FACTOR * TILE_SIZE,
                    MINIMAP_SCALE_FACTOR * TILE_SIZE,
                );
            }
        }
    }
}

class Player {
    constructor() {
        this.x = WINDOW_WIDTH / 2;
        this.y = WINDOW_HEIGHT / 2;
        this.radius = 3;
        this.turnDirection = 0; // -1 = left, +1 = right
        this.walkDirection = 0; // -1 = back, +1 = front
        this.rotationAngle = Math.PI / 2;
        this.moveSpeed = 2.0;
        this.rotationSpeed = 2 * (Math.PI / 180);
    }
    update() {
        this.rotationAngle += this.turnDirection * this.rotationSpeed;

        var moveStep = this.walkDirection * this.moveSpeed;

        var newPlayerX = this.x + Math.cos(this.rotationAngle) * moveStep;
        var newPlayerY = this.y + Math.sin(this.rotationAngle) * moveStep;

        if (!grid.hasWallAt(newPlayerX, newPlayerY)) {
            this.x = newPlayerX;
            this.y = newPlayerY;
        }
    }
    render() {
        noStroke();
        fill("blue");
        circle(
            MINIMAP_SCALE_FACTOR * this.x,
            MINIMAP_SCALE_FACTOR * this.y,
            MINIMAP_SCALE_FACTOR * this.radius,
        );
        stroke("blue");
        line(
            MINIMAP_SCALE_FACTOR * this.x,
            MINIMAP_SCALE_FACTOR * this.y,
            MINIMAP_SCALE_FACTOR * this.x + Math.cos(this.rotationAngle) * 30,
            MINIMAP_SCALE_FACTOR * this.y + Math.sin(this.rotationAngle) * 30,
        );
    }
}

class Ray {
    constructor(rayAngle) {
        this.rayAngle = normalizeAngle(rayAngle);
        this.wallHitX = 0;
        this.wallHitY = 0;
        this.distance = 0;
        this.wasHitVertical = false;

        this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isRayFacingUp = !this.isRayFacingDown;

        this.isRayFacingRight =
            this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
        this.isRayFacingLeft = !this.isRayFacingRight;
    }
    cast() {
        var xintercept, yintercept;
        var xstep, ystep;

        var foundHorzWallHit = false;
        var horzWallHitX = 0;
        var horzWallHitY = 0;

        //   Horizontal
        // find y-coord of closest horizontal grid intersection
        yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
        yintercept += this.isRayFacingDown ? TILE_SIZE : 0;
        // find x-coord of closest horizontal grid intersection
        xintercept =
            player.x + (yintercept - player.y) / Math.tan(rayAngle);

        // calculate the increment xstep and ystep
        ystep = TILE_SIZE;
        ystep *= this.isRayFacingUp ? -1 : 1;

        xstep = TILE_SIZE / Math.tan(this.rayAngle);
        xstep *= this.isRayFacingLeft && xstep > 0 ? -1 : 1;
        xstep *= this.isRayFacingRight && xstep < 0 ? -1 : 1;

        var nextHorzTouchX = xintercept;
        var nextHorzTouchY = yintercept;

        while (
            nextHorzTouchX >= 0 &&
            nextHorzTouchX <= WINDOW_WIDTH &&
            nextHorzTouchY >= 0 &&
            nextHorzTouchY <= WINDOW_HEIGHT
        ) {
            if (
                grid.hasWallAt(
                    nextHorzTouchX,
                    nextHorzTouchY - (this.isRayFacingUp ? 1 : 0),
                )
            ) {
                foundHorzWallHit = true;
                horzWallHitX = nextHorzTouchX;
                horzWallHitY = nextHorzTouchY;

                break;
            } else {
                nextHorzTouchX += xstep;
                nextHorzTouchY += ystep;
            }
        }

        var foundVertWallHit = false;
        var vertWallHitX = 0;
        var vertWallHitY = 0;

        //   Vertical
        // find x-coord of closest vertical grid intersection
        xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
        xintercept += this.isRayFacingRight ? TILE_SIZE : 0;
        // find y-coord of closest vertical grid intersection
        yintercept =
            player.y + (xintercept - player.x) * Math.tan(this.rayAngle);

        // calculate the increment xstep and ystep
        xstep = TILE_SIZE;
        xstep *= this.isRayFacingLeft ? -1 : 1;

        ystep = TILE_SIZE * Math.tan(this.rayAngle);
        ystep *= this.isRayFacingUp && ystep > 0 ? -1 : 1;
        ystep *= this.isRayFacingDown && ystep < 0 ? -1 : 1;

        var nextVertTouchX = xintercept;
        var nextVertTouchY = yintercept;

        while (
            nextVertTouchX >= 0 &&
            nextVertTouchX <= WINDOW_WIDTH &&
            nextVertTouchY >= 0 &&
            nextVertTouchY <= WINDOW_HEIGHT
        ) {
            if (
                grid.hasWallAt(
                    nextVertTouchX - (this.isRayFacingLeft ? 1 : 0),
                    nextVertTouchY,
                )
            ) {
                foundVertWallHit = true;
                vertWallHitX = nextVertTouchX;
                vertWallHitY = nextVertTouchY;
                break;
            } else {
                nextVertTouchX += xstep;
                nextVertTouchY += ystep;
            }
        }

        // Calculate both Horz and Vert distances and chooses the smallest value
        var horzHitDistance = foundHorzWallHit
            ? distanceBetweenPoints(
                  player.x,
                  player.y,
                  horzWallHitX,
                  horzWallHitY,
              )
            : Number.MAX_VALUE;
        var vertHitDistance = foundVertWallHit
            ? distanceBetweenPoints(
                  player.x,
                  player.y,
                  vertWallHitX,
                  vertWallHitY,
              )
            : Number.MAX_VALUE;

        // only store the smallest of the distances
        if (vertHitDistance < horzHitDistance) {
            this.wallHitX = vertWallHitX;
            this.wallHitY = vertWallHitY;
            this.distance = vertHitDistance;
            this.wasHitVertical = true;
        }
        else {
            this.wallHitX = horzWallHitX;
            this.wallHitY = horzWallHitY;
            this.distance = horzHitDistance;
            this.wasHitVertical = false;
        }
    }
    render() {
        stroke("rgba(255, 0, 0, 0.3)");
        line(
            MINIMAP_SCALE_FACTOR * player.x,
            MINIMAP_SCALE_FACTOR * player.y,
            MINIMAP_SCALE_FACTOR * this.wallHitX,
            MINIMAP_SCALE_FACTOR * this.wallHitY,
        );
    }
}

var grid = new Map();
var player = new Player();
var rays = [];

function keyPressed() {
    if (keyCode == UP_ARROW) {
        player.walkDirection = +1;
    } else if (keyCode == DOWN_ARROW) {
        player.walkDirection = -1;
    } else if (keyCode == RIGHT_ARROW) {
        player.turnDirection = +1;
    } else if (keyCode == LEFT_ARROW) {
        player.turnDirection = -1;
    }
}

function keyReleased() {
    if (keyCode == UP_ARROW) {
        player.walkDirection = 0;
    } else if (keyCode == DOWN_ARROW) {
        player.walkDirection = 0;
    } else if (keyCode == RIGHT_ARROW) {
        player.turnDirection = 0;
    } else if (keyCode == LEFT_ARROW) {
        player.turnDirection = 0;
    }
}

function castAllRays() {
    var rayAngle = player.rotationAngle - FOV_Angle / 2;

    rays = [];

    for (var col = 0; col < NUM_RAYS; col++) {
        // for (var i = 0; i < 1; i++) {
        var ray = new Ray(rayAngle);
        ray.cast();
        rays.push(ray);

        rayAngle += FOV_Angle / NUM_RAYS;
    }
}

function render3DProjectedWalls() {
    for (var i = 0; i < NUM_RAYS; i++) {
        var ray = rays[i];

        var correctWallDistance = ray.distance * Math.cos(ray.rayAngle - player.rotationAngle);

        var distanceProjectionPlane = (WINDOW_WIDTH / 2) / Math.tan(FOV_Angle / 2);

        // Projected wall height
        var wallStripHeight = (TILE_SIZE / correctWallDistance) * distanceProjectionPlane;

        var alpha = 1.0; 

        var color = ray.wasHitVertical ? 255 : 180;

        fill("rgba(" + color + "," + color + "," + color + "," + alpha + ")");
        noStroke();
        rect(
            i * WALL_STRIP_WIDTH,
            (WINDOW_HEIGHT / 2) - (wallStripHeight / 2),
            WALL_STRIP_WIDTH,
            wallStripHeight, 
        ); 
    }
}

function normalizeAngle(angle) {
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
        angle = 2 * Math.PI + angle;
    }
    return angle;
}

function distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function setup() {
    // Initialize all objectss
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
    // Update all game objects before we render the next frame
    player.update();
    castAllRays();
}

function draw() {
    clear("#212121");

    // Render Objects frame by frame
    update();

    render3DProjectedWalls();

    grid.render();
    for (ray of rays) {
        ray.render();
    }
    player.render();
}
