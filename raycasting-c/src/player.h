#ifndef PLAYER_H
#define PLAYER_H

#include "defs.h"
#include "graphics.h"
#include "map.h"

typedef struct {
    float x;
    float y;
    float width;
    float height;
    int turnDirection;
    int walkDirection;
    float rotationAngle;
    float walkSpeed;
    float turnSpeed;
} player_t;

extern player_t player; 

void movePlayer(float deltaTime);
void renderMapPlayer(void);

#endif