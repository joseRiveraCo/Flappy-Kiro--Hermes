# Flappy Kiro - Project Overview

## What is this project?

Flappy Kiro is a retro-styled Flappy Bird clone built with vanilla HTML5 Canvas and JavaScript. The player controls a Hermes character navigating through pipes, collecting coins, with parallax backgrounds and local high score persistence.

## Tech Stack

- **Language:** Vanilla JavaScript (ES6 modules)
- **Rendering:** HTML5 Canvas API
- **Testing:** Vitest + fast-check (property-based testing)
- **Build tools:** None — no bundler, no transpiler, no framework
- **Package manager:** npm (only for dev dependencies: testing)

## Project Structure

```
flappy-kiro/
├── index.html                  # Entry point (480x640 canvas)
├── package.json                # Dev deps only (vitest, fast-check)
├── vitest.config.js            # Test configuration
├── js/
│   ├── config.js               # All constants, asset manifest, GameState enum
│   ├── main.js                 # Bootstrap (instantiates GameEngine)
│   ├── GameEngine.js           # Core loop, state management, orchestrator
│   ├── AssetLoader.js          # Preloads images/audio from manifest
│   ├── InputHandler.js         # Keyboard/touch/click → flap events
│   ├── Player.js               # Physics, sprite state, hitbox
│   ├── PipeGenerator.js        # Pipe spawning with object pool
│   ├── CoinSystem.js           # Coin spawning with object pool
│   ├── CollisionDetector.js    # Static AABB collision methods
│   ├── ScoreManager.js         # Coins, distance, localStorage persistence
│   ├── ParallaxLayer.js        # Multi-depth cloud scrolling
│   └── GameOverScreen.js       # Overlay with scores and restart prompt
└── tests/
    ├── unit/                   # Example-based tests per module
    ├── properties/             # Property-based tests (fast-check)
    └── integration/            # Full game loop tests
```

## Key Architecture Decisions

- **Object pooling** for pipes and coins (no GC pressure during gameplay)
- **Component-based** — each subsystem is a standalone ES6 class
- **Central orchestrator** — GameEngine delegates to all subsystems
- **Hitbox-based collision** with 20% shrink for forgiving feel
- **ES6 modules** loaded via `<script type="module">` in index.html
- **No build step** — open index.html directly in a browser to play

## Assets

Sprites and audio live in `kiro-introduction-starter-kit/assets/`:
- `hermes_idle.png`, `hermes_jump.png`, `hermes_fall.png`
- `jump.wav`, `game_over.wav`

Referenced from index.html via relative paths: `../kiro-introduction-starter-kit/assets/`
