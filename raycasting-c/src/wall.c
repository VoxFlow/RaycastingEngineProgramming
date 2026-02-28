#include "wall.h"

void changeColorIntensity(color_t* color, float factor)
{
    color_t a = (*color & 0xFF000000);
    color_t r = (*color & 0x00FF0000) * factor;
    color_t g = (*color & 0x0000FF00) * factor;
    color_t b = (*color & 0xFF0000FF) * factor;

    *color = a | (r & 0x00FF0000) | (g & 0x0000FF00) | (b & 0x000000FF);
}

void renderWallProjection(void)
{
    for (int x = 0; x < NUM_RAYS; x++)
    {
        float perpDistance = rays[x].distance * cos(rays[x].rayAngle - player.rotationAngle);
        float wallHeight = (TILE_SIZE / perpDistance) * DIST_PROJ_PLANE;

        int wallTopY = (WINDOW_HEIGHT / 2) - (wallHeight / 2);
        wallTopY = wallTopY < 0 ? 0 : wallTopY;

        int wallBottomY = (WINDOW_HEIGHT / 2) + (wallHeight / 2);
        wallBottomY = wallBottomY > WINDOW_HEIGHT ? WINDOW_HEIGHT : wallBottomY;

        // Ceiling
        for (int y = 0; y < wallTopY; y++)
        {
            drawPixel(x, y, 0xFF444444);
        }

        int textureOffsetX;
        if (rays[x].wasHitVertical)
        {
            textureOffsetX = (int)rays[x].wallHitY % TILE_SIZE;
        }
        else
        {
            textureOffsetX = (int)rays[x].wallHitX % TILE_SIZE;
        }

        // Wall
        int texNum = rays[x].texture - 1;

        int textureWidth = upng_get_width(textures[texNum]);
        int textureHeight = upng_get_height(textures[texNum]);

        for (int y = wallTopY; y < wallBottomY; y++)
        {
            int distanceFromTop = y + (wallHeight / 2) - (WINDOW_HEIGHT / 2);
            int textureOffsetY = distanceFromTop * ((float)textureHeight / wallHeight);

            color_t* wallTextureBuffer = (color_t*)upng_get_buffer(textures[texNum]);
            color_t texelColor = wallTextureBuffer[(textureWidth * textureOffsetY) + textureOffsetX];

            if (rays[x].wasHitVertical)
            {
                changeColorIntensity(&texelColor, 0.7);
            }
            
            drawPixel(x, y, texelColor);
        }

        // Floor
        for (int y = wallBottomY; y < WINDOW_HEIGHT; y++)
        {
            drawPixel(x, y, 0xFF888888);
        }
    }
}