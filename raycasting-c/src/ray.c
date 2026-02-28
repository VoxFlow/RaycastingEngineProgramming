#include "ray.h"

ray_t rays[NUM_RAYS];

void normalizeAngle(float *angle)
{
    *angle = remainder(*angle, TWO_PI);
    if (*angle < 0)
    {
        *angle = TWO_PI + *angle;
    }
}

float distanceBetweenPoints(float x1, float y1, float x2, float y2)
{
    return sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

bool isRayFacingDown(float angle)
{
    return angle > 0 && angle < PI;
}

bool isRayFacingUp(float angle)
{
    return !isRayFacingDown(angle);
}  

bool isRayFacingRight(float angle)
{
    return angle < 0.5 * PI || angle > 1.5 * PI;
}

bool isRayFacingLeft(float angle)
{
    return !isRayFacingRight(angle);
}

void castRay(float rayAngle, int stripId)
{
    normalizeAngle(&rayAngle);

    float xintercept, yintercept;
    float xstep, ystep;

    //   Horizontal
    bool foundHorzWallHit = false;
    float horzWallHitX = 0;
    float horzWallHitY = 0;
    int horzWallContent = 0;

    // find y-coord of closest horizontal grid intersection
    yintercept = floor(player.y / TILE_SIZE) * TILE_SIZE;
    yintercept += isRayFacingDown(rayAngle) ? TILE_SIZE : 0;
    // find x-coord of closest horizontal grid intersection
    xintercept =
        player.x + (yintercept - player.y) / tan(rayAngle);

    // calculate the increment xstep and ystep
    ystep = TILE_SIZE;
    ystep *= isRayFacingUp(rayAngle) ? -1 : 1;

    xstep = TILE_SIZE / tan(rayAngle);
    xstep *= isRayFacingLeft(rayAngle) && xstep > 0 ? -1 : 1;
    xstep *= isRayFacingRight(rayAngle) && xstep < 0 ? -1 : 1;

    float nextHorzTouchX = xintercept;
    float nextHorzTouchY = yintercept;

    while (isInsideMap(nextHorzTouchX, nextHorzTouchY))
    {
        float xToCheck = nextHorzTouchX;
        float yToCheck = nextHorzTouchY + (isRayFacingUp(rayAngle) ? -1 : 0);

        if (mapHasWallAt(xToCheck, yToCheck))
        {
            horzWallHitX = nextHorzTouchX;
            horzWallHitY = nextHorzTouchY;
            horzWallContent = getMapAt((int)floor(yToCheck / TILE_SIZE), (int)floor(xToCheck / TILE_SIZE));
            foundHorzWallHit = true;
            break;
        }
        else
        {
            nextHorzTouchX += xstep;
            nextHorzTouchY += ystep;
        }
    }

    // Vertical
    bool foundVertWallHit = false;
    float vertWallHitX = 0;
    float vertWallHitY = 0;
    int vertWallContent = 0;

    // find x-coord of closest vertical grid intersection
    xintercept = floor(player.x / TILE_SIZE) * TILE_SIZE;
    xintercept += isRayFacingRight(rayAngle) ? TILE_SIZE : 0;
    // find y-coord of closest vertical grid intersection
    yintercept =
        player.y + (xintercept - player.x) * tan(rayAngle);

    // calculate the increment xstep and ystep
    xstep = TILE_SIZE;
    xstep *= isRayFacingLeft(rayAngle) ? -1 : 1;

    ystep = TILE_SIZE * tan(rayAngle);
    ystep *= isRayFacingUp(rayAngle) && ystep > 0 ? -1 : 1;
    ystep *= isRayFacingDown(rayAngle) && ystep < 0 ? -1 : 1;

    float nextVertTouchX = xintercept;
    float nextVertTouchY = yintercept;

    while (isInsideMap(nextVertTouchX, nextVertTouchY))
    {
        float xToCheck = nextVertTouchX + (isRayFacingLeft(rayAngle) ? -1 : 0);
        float yToCheck = nextVertTouchY;

        if (mapHasWallAt(xToCheck, yToCheck))
        {
            vertWallHitX = nextVertTouchX;
            vertWallHitY = nextVertTouchY;
            vertWallContent = getMapAt((int)floor(yToCheck / TILE_SIZE), (int)floor(xToCheck / TILE_SIZE));
            foundVertWallHit = true;
            break;
        }
        else
        {
            nextVertTouchX += xstep;
            nextVertTouchY += ystep;
        }
    }

    // Calculate both Horz and Vert distances and chooses the smallest value
    float horzHitDistance = foundHorzWallHit
                                ? distanceBetweenPoints(player.x, player.y, horzWallHitX, horzWallHitY)
                                : FLT_MAX;
    float vertHitDistance = foundVertWallHit
                                ? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY)
                                : FLT_MAX;

    if (vertHitDistance < horzHitDistance)
    {
        rays[stripId].distance = vertHitDistance;
        rays[stripId].wallHitX = vertWallHitX;
        rays[stripId].wallHitY = vertWallHitY;
        rays[stripId].wallHitContent = vertWallContent;
        rays[stripId].wasHitVertical = true;
        rays[stripId].rayAngle = rayAngle;
    }
    else
    {
        rays[stripId].distance = horzHitDistance;
        rays[stripId].wallHitX = horzWallHitX;
        rays[stripId].wallHitY = horzWallHitY;
        rays[stripId].wallHitContent = horzWallContent;
        rays[stripId].wasHitVertical = false;
        rays[stripId].rayAngle = rayAngle;
    }
}

void castAllRays()
{
    for (int col = 0; col < NUM_RAYS; col++)
    {
        float rayAngle = player.rotationAngle + atan((col - NUM_RAYS / 2) / DIST_PROJ_PLANE);
        castRay(rayAngle, col);
    }
}

void renderMapRays()
{
    for (int i = 0; i < NUM_RAYS; i += 50)
    {
        drawLine(
            MINIMAP_SCALE_FACTOR * player.x,
            MINIMAP_SCALE_FACTOR * player.y,
            MINIMAP_SCALE_FACTOR * rays[i].wallHitX,
            MINIMAP_SCALE_FACTOR * rays[i].wallHitY,
            0xFF0000FF);
    }
}