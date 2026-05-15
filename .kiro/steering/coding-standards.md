# Coding Standards

## General Rules

- All game code is vanilla JavaScript — no frameworks, no TypeScript, no build tools
- Use ES6 module syntax (`export`/`import`) for all files
- Use `class` syntax for all game subsystems
- Keep each class in its own file under `flappy-kiro/js/`
- All constants go in `config.js` — never hardcode magic numbers in other files

## Naming Conventions

- **Files:** PascalCase for classes (`GameEngine.js`), camelCase for utilities (`config.js`, `main.js`)
- **Classes:** PascalCase (`PipeGenerator`, `CoinSystem`)
- **Methods:** camelCase (`getActivePipes`, `checkAABB`)
- **Constants:** UPPER_SNAKE_CASE (`PIPE_GAP`, `FLAP_VELOCITY`)
- **Private methods:** prefix with underscore (`_spawnPipe`, `_triggerFlap`)

## Code Style

- Use JSDoc comments for all public methods with `@param` and `@returns`
- Keep methods focused — one responsibility per method
- Prefer `for...of` loops over `.forEach()` in hot paths (game loop)
- Use `const` by default, `let` only when reassignment is needed
- No `var` anywhere

## Architecture Patterns

- **Object pooling:** Pre-allocate arrays of fixed size, reuse objects via `active` flag
- **Static utility classes:** CollisionDetector has only static methods (no state)
- **Event callbacks:** InputHandler uses `onFlap(callback)` pattern, not EventEmitter
- **Graceful degradation:** Audio failures are non-fatal, localStorage failures use in-memory fallback

## Physics & Game Loop

- All physics use seconds as time unit (dt in seconds)
- DeltaTime is clamped to max 1/30s to prevent physics explosions
- Position updates: `velocity += acceleration * dt`, then `position += velocity * dt`
- Scroll speed is constant — pipes and coins move left, player stays at fixed X

## Rendering Order (z-index)

1. Clear canvas (light blue background)
2. Parallax clouds (back to front)
3. Pipes (batch all active)
4. Coins (batch all active)
5. Player sprite
6. HUD (score, distance)
7. Game Over overlay (when applicable)
