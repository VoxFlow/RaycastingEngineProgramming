#ifndef TEXTURE_H
#define TEXTURE_H

#include <stdint.h>
#include "defs.h"
#include "upng.h"

#define NUM_TEXTURES 14

typedef struct
{
    int width;
    int height;
    color_t *texture_buffer;
    upng_t *upngTexture;
} texture_t;

extern upng_t *textures[NUM_TEXTURES];

void loadTextures(void);
void freeTextures(void);

#endif