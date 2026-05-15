---
inclusion: fileMatch
fileMatchPattern: "flappy-kiro/js/**"
---

# Game Mechanics Reference

## Physics Constants (from config.js)

| Constant | Value | Unit | Description |
|----------|-------|------|-------------|
| GRAVITY | 980 | px/sec² | Downward acceleration applied every frame |
| FLAP_VELOCITY | -320 | px/sec | Instant upward velocity on flap (negative = up) |
| SCROLL_SPEED | 150 | px/sec | Horizontal speed of pipes/coins moving left |
| IDLE_THRESHOLD | 50 | px/sec | Velocity range for "idle" sprite state |
| FLOOR_Y | 900 | px | Y position of the ground (death boundary) |
| HITBOX_SHRINK | 0.2 | ratio | 20% reduction on player hitbox for forgiving collisions |

## Player Movement Algorithm

```
Each frame (dt in seconds):
  1. velocity += GRAVITY * dt          // Apply gravity
  2. y += velocity * dt                // Update position
  3. if (y < 0): y = 0, velocity = 0  // Ceiling clamp
```

On flap input:
```
  velocity = FLAP_VELOCITY  // Reset velocity (no stacking)
```

Key behaviors:
- Flap always sets velocity to exactly FLAP_VELOCITY regardless of current velocity
- Ceiling clamp prevents going above canvas and zeroes upward velocity
- Player X position is fixed — only Y changes during gameplay

## Sprite State Selection

```
if velocity < -IDLE_THRESHOLD:  → 'jump'   (moving up fast)
if velocity > +IDLE_THRESHOLD:  → 'fall'   (moving down fast)
otherwise:                      → 'idle'   (near apex/slow movement)
```

## Collision Detection Patterns

### AABB (Axis-Aligned Bounding Box)

Two boxes overlap if and only if all four conditions are true:
```
A.x < B.x + B.w   AND
A.x + A.w > B.x   AND
A.y < B.y + B.h   AND
A.y + A.h > B.y
```

### Player Hitbox (forgiving)

The player's collision box is smaller than the sprite to feel fair:
```
shrunkWidth  = PLAYER_WIDTH  * (1 - HITBOX_SHRINK)  // 96 * 0.8 = 76.8
shrunkHeight = PLAYER_HEIGHT * (1 - HITBOX_SHRINK)  // 96 * 0.8 = 76.8
hitbox.x = player.x + (PLAYER_WIDTH - shrunkWidth) / 2    // centered
hitbox.y = player.y + (PLAYER_HEIGHT - shrunkHeight) / 2   // centered
hitbox.w = shrunkWidth
hitbox.h = shrunkHeight
```

### Pipe Hitboxes

Each PipePair has two hitboxes:
```
Top pipe:    { x: pipe.x, y: 0,         w: PIPE_WIDTH, h: gapY - PIPE_GAP/2 }
Bottom pipe: { x: pipe.x, y: gapY + PIPE_GAP/2, w: PIPE_WIDTH, h: FLOOR_Y - (gapY + PIPE_GAP/2) }
```

### Coin Hitbox

Coins use center-based positioning:
```
{ x: coin.x - COIN_RADIUS, y: coin.y - COIN_RADIUS, w: COIN_RADIUS*2, h: COIN_RADIUS*2 }
```

### Collision Outcomes

| Check | Result | Action |
|-------|--------|--------|
| Player vs Pipe | true | Game Over |
| Player vs Floor (hitbox.y + hitbox.h >= FLOOR_Y) | true | Game Over |
| Player vs Ceiling (y < 0) | true | Clamp position (not game over) |
| Player vs Coin | true | Collect coin, increment score |

## Pipe Spawning Algorithm

```
Each frame:
  1. distanceSinceLastSpawn += scrollSpeed * dt
  2. while (distanceSinceLastSpawn >= PIPE_SPAWN_INTERVAL):
       distanceSinceLastSpawn -= PIPE_SPAWN_INTERVAL
       spawn new pipe at x = CANVAS_WIDTH
  3. Recycle pipes where x + PIPE_WIDTH < 0
```

Gap Y randomization bounds:
```
margin = 50px
minGapY = PIPE_GAP/2 + margin     // 125 + 50 = 175
maxGapY = FLOOR_Y - PIPE_GAP/2 - margin  // 900 - 125 - 50 = 725
gapY = random in [minGapY, maxGapY]
```

## Coin Spawning Algorithm

- Coins spawn at same interval as pipes (PIPE_SPAWN_INTERVAL = 350px)
- Positioned at x = CANVAS_WIDTH, y = rightmost pipe's gapY (center of gap)
- If no pipes exist, random Y within safe middle area
- Coins are guaranteed to not overlap pipe hitboxes (placed in gap center)

## Distance & Scoring

```
distance += scrollSpeed * dt * DISTANCE_SCALE   // 150 * dt * 0.01 = 1.5 meters/sec
coins += 1 per collected coin
highScore = max(current_coins + distance, stored_highScore)
```

## DeltaTime Safety

- dt is clamped to max 1/30 second (≈0.033s) to prevent physics explosions
- If tab is backgrounded and dt spikes, the clamp prevents tunneling through pipes
- Game uses `requestAnimationFrame` targeting 60 FPS
