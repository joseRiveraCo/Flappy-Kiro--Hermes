---
inclusion: fileMatch
fileMatchPattern: "flappy-kiro/js/**"
---

# Game Architecture Reference

## Game State Machine

```
LOADING → READY → PLAYING → GAME_OVER
                     ↑          │
                     └──────────┘ (restart)
```

- **LOADING:** Assets being loaded, no input accepted
- **READY:** Assets loaded, waiting for first input to start
- **PLAYING:** Game loop active, physics/collision/scoring running
- **GAME_OVER:** Movement frozen, overlay shown, waiting for restart input

## Subsystem Update Order (each frame)

1. `Player.update(dt)` — apply gravity, update position
2. `PipeGenerator.update(dt, scrollSpeed)` — scroll, spawn, recycle pipes
3. `CoinSystem.update(dt, scrollSpeed, activePipes)` — scroll, spawn, recycle coins
4. `CollisionDetector.checkPlayerPipes(player, pipes)` — check pipe collision
5. `CollisionDetector.checkFloor(player, FLOOR_Y)` — check floor collision
6. `CollisionDetector.checkPlayerCoins(player, coins)` — check coin collection
7. `ScoreManager.updateDistance(dt, scrollSpeed)` — accumulate distance
8. `ParallaxLayer.update(dt)` — scroll cloud layers

## Key Interfaces

### Player
- `flap()` → sets velocity to FLAP_VELOCITY
- `update(dt)` → gravity + position + ceiling clamp
- `getHitbox()` → `{x, y, w, h}` (20% shrunk)
- `getSpriteState()` → `'idle'|'jump'|'fall'`

### PipeGenerator
- `update(dt, scrollSpeed)` → scroll + spawn + recycle
- `getActivePipes()` → `PipePair[]`
- `reset()` → deactivate all

### CoinSystem
- `update(dt, scrollSpeed, activePipes?)` → scroll + spawn + recycle
- `getActiveCoins()` → `Coin[]` (non-collected only)
- `collect(coin)` → start collection animation

### CollisionDetector (all static)
- `checkAABB(a, b)` → boolean
- `checkPlayerPipes(player, pipes)` → boolean
- `checkPlayerCoins(player, coins)` → Coin[]
- `checkFloor(player, floorY)` → boolean

### ScoreManager
- `addCoin()` → increment coins
- `updateDistance(dt, speed)` → accumulate distance
- `getScore()` → `{coins, distance, highScore}`
- `checkHighScore()` → persist if new high

## Object Pool Pattern

Both PipeGenerator and CoinSystem use pre-allocated pools:
```javascript
// Pool initialization
this.pool = [];
for (let i = 0; i < POOL_SIZE; i++) {
  this.pool.push(new PooledObject());
}

// Acquire from pool
const obj = this.pool.find(o => !o.active);
if (!obj) { console.warn('Pool exhausted'); return; }
obj.reset(x, y);

// Return to pool
obj.active = false;
```

## Hitbox Format

All collision entities use: `{ x: number, y: number, w: number, h: number }`
- `x, y` = top-left corner
- `w, h` = dimensions
- Player hitbox is 20% smaller than sprite, centered
