#include "texture.h"
#include <stdio.h>

static const char *texturesFileNames[NUM_TEXTURES] = {
    "./src/images/redbrick.png",
    "./src/images/purplestone.png",
    "./src/images/mossystone.png",
    "./src/images/graystone.png",
    "./src/images/colorstone.png", // 5
    "./src/images/bluestone.png",
    "./src/images/wood.png",
    "./src/images/pikuma.png",
    "./src/images/eagle.png",
    "./src/images/armor.png", // 10
    "./src/images/barrel.png",
    "./src/images/guard.png",
    "./src/images/light.png",
    "./src/images/table.png"};

void loadTextures(void)
{
    for (int i = 0; i < NUM_TEXTURES; i++)
    {
        upng_t *upng = upng_new_from_file(texturesFileNames[i]);
        if (upng != NULL)
        {
            upng_decode(upng);
            if (upng_get_error(upng) == UPNG_EOK)
            {
                textures[i] = upng;
            }
            else
            {
                printf("Error decoding texture file: %s \n", texturesFileNames[i]);
            }
        }
        else
        {
            printf("Error loading texture: %s \n", texturesFileNames[i]);
        }
    }
}

void freeTextures()
{
    for (int i = 0; i < NUM_TEXTURES; i++)
    {
        upng_free(textures[i]);
    }
}