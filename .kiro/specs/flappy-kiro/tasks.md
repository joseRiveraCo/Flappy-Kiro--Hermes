# Implementation Plan: Flappy Kiro

## Overview

Implement a retro-styled Flappy Bird clone using vanilla HTML5 Canvas and JavaScript. The game features a Hermes character navigating through pipes, collecting coins, with parallax backgrounds, object pooling, and local high score persistence. The implementation follows a modular ES6 class architecture with each subsystem in its own file.

## Tasks

- [x] 1. Set up project structure and configuration
  - [x] 1.1 Create index.html with canvas element, minimal CSS, and script tags
    - Create the HTML entry point with a 480x640 canvas element
    - Include inline CSS for centering and retro styling
    - Add module script tags loading all JS files in correct order
    - _Requirements: 9.1, 1.1_

  - [x] 1.2 Create js/config.js with all game constants
    - Define CONFIG object with all constants (canvas dimensions, physics, pool sizes, etc.)
    - Define ASSET_MANIFEST with image and audio paths
    - Define GameState enum (LOADING, READY, PLAYING, GAME_OVER)
    - _Requirements: 9.1, 9.2_

- [x] 2. Implement Asset Loader
  - [x] 2.1 Create js/AssetLoader.js
    - Implement AssetLoader class with manifest-based loading
    - Implement loadAll() returning a Promise that resolves when all images and audio are loaded
    - Implement getImage(key) and getAudio(key) retrieval methods
    - Handle loading failures with descriptive error messages
    - Handle audio failures as non-fatal (game continues without sound)
    - _Requirements: 9.2, 1.1_

  - [x] 2.2 Write unit tests for AssetLoader
    - Test manifest processing and asset retrieval
    - Test error handling for failed loads
    - _Requirements: 9.2_

- [x] 3. Implement Input Handler
  - [x] 3.1 Create js/InputHandler.js
    - Implement InputHandler class that listens for spacebar keydown, canvas touchstart, and canvas click
    - Implement onFlap(callback) to register flap listeners
    - Implement enable() and disable() to control input processing
    - Prevent multiple rapid inputs from stacking (each flap resets velocity)
    - _Requirements: 2.1, 2.6_

  - [x] 3.2 Write unit tests for InputHandler
    - Test that spacebar/touch/click triggers flap callback
    - Test that disable() prevents input processing
    - _Requirements: 2.1_

- [x] 4. Implement Player Character
  - [x] 4.1 Create js/Player.js with physics and sprite state
    - Implement Player class with gravity, flap velocity, and position tracking
    - Implement flap() that applies FLAP_VELOCITY upward
    - Implement update(dt) that applies gravity acceleration and updates position
    - Implement getSpriteState() returning 'idle', 'jump', or 'fall' based on velocity thresholds
    - Implement getHitbox() returning a reduced bounding box (20% shrink, centered)
    - Implement render(ctx) drawing the correct sprite based on state
    - Implement ceiling clamping (y < 0 → clamp to 0, zero upward velocity)
    - Implement reset() to restore initial position and velocity
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 5.3, 5.4_

  - [x] 4.2 Write property tests for Player physics (Properties 1, 2, 11, 12)
    - **Property 1: Gravity applies consistent acceleration** — For any positive dt and initial velocity, update(dt) without flap increases downward velocity by GRAVITY * dt
    - **Validates: Requirements 2.2**
    - **Property 2: Sprite state reflects velocity** — getSpriteState() returns correct state for any velocity value
    - **Validates: Requirements 2.3, 2.4, 2.5**
    - **Property 11: Ceiling position clamping** — Player y < 0 after update is clamped to 0 with velocity zeroed
    - **Validates: Requirements 5.3**
    - **Property 12: Hitbox reduction for fair collisions** — getHitbox() returns dimensions reduced by HITBOX_SHRINK, centered on sprite
    - **Validates: Requirements 5.4**

  - [x] 4.3 Write unit tests for Player
    - Test flap applies correct upward velocity
    - Test sprite state transitions at boundary values
    - Test reset restores initial state
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 5. Implement Pipe Generator with object pooling
  - [x] 5.1 Create js/PipeGenerator.js with PipePair class and object pool
    - Implement PipePair class with active flag, position, gap properties, hitbox methods, and render
    - Implement PipeGenerator class with pre-allocated pool of PIPE_POOL_SIZE pairs
    - Implement update(dt, scrollSpeed) that scrolls active pipes, spawns new pairs at intervals, and recycles off-screen pipes
    - Implement getActivePipes() returning currently visible pipe pairs
    - Implement render(ctx) batch-rendering all active pipes with retro green style
    - Implement reset() returning all pipes to pool
    - Randomize gap Y position within playable bounds on each spawn
    - Maintain consistent PIPE_GAP between top and bottom pipes
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 9.5, 9.6_

  - [x] 5.2 Write property tests for Pipe Generator (Properties 3, 4, 5, 6, 18)
    - **Property 3: Pipes spawn at regular intervals** — Cumulative scroll crossing spawn boundary produces exactly one new pipe pair per boundary
    - **Validates: Requirements 3.1**
    - **Property 4: Pipe pairs have valid gap position and size** — Gap center Y within bounds, gap size equals PIPE_GAP
    - **Validates: Requirements 3.2, 3.3**
    - **Property 5: Pipes scroll at constant speed** — After update(dt, scrollSpeed), pipe x decreases by scrollSpeed * dt
    - **Validates: Requirements 3.4**
    - **Property 6: Off-screen pipes are recycled** — Pipe with x + width < 0 is deactivated and returned to pool
    - **Validates: Requirements 3.5**
    - **Property 18: Pipe pool size invariant** — Total allocated PipePair objects never exceed PIPE_POOL_SIZE
    - **Validates: Requirements 9.6**

  - [x] 5.3 Write unit tests for PipeGenerator
    - Test pipe spawning at correct intervals
    - Test off-screen pipe recycling
    - Test pool exhaustion behavior (spawn skipped)
    - _Requirements: 3.1, 3.5, 9.6_

- [x] 6. Implement Coin System with object pooling
  - [x] 6.1 Create js/CoinSystem.js with Coin class and object pool
    - Implement Coin class with active flag, position, collected state, animation timer, hitbox, and render
    - Implement CoinSystem class with pre-allocated pool of COIN_POOL_SIZE coins
    - Implement update(dt, scrollSpeed) that scrolls active coins, spawns new coins between pipes, and recycles off-screen coins
    - Implement getActiveCoins() returning currently visible coins
    - Implement collect(coin) marking coin as collected and triggering collection animation
    - Implement render(ctx) batch-rendering all active coins as golden circles
    - Implement reset() returning all coins to pool
    - Position coins in safe areas that don't overlap with pipe hitboxes
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 9.5, 9.7_

  - [x] 6.2 Write property tests for Coin System (Properties 7, 8, 19)
    - **Property 7: Coins are positioned in safe areas** — Spawned coin position does not overlap any active pipe hitbox
    - **Validates: Requirements 4.1**
    - **Property 8: Coins scroll at constant speed** — After update(dt, scrollSpeed), coin x decreases by scrollSpeed * dt
    - **Validates: Requirements 4.5**
    - **Property 19: Coin pool size invariant** — Total allocated Coin objects never exceed COIN_POOL_SIZE
    - **Validates: Requirements 9.7**

  - [x] 6.3 Write unit tests for CoinSystem
    - Test coin spawning between pipes
    - Test coin collection removes coin and triggers animation
    - Test pool exhaustion behavior
    - _Requirements: 4.1, 4.2, 4.3, 9.7_

- [x] 7. Implement Collision Detector
  - [x] 7.1 Create js/CollisionDetector.js with static AABB methods
    - Implement static checkAABB(a, b) for generic hitbox overlap detection
    - Implement static checkPlayerPipes(player, pipes) returning boolean for pipe collision
    - Implement static checkPlayerCoins(player, coins) returning array of collected coins
    - Implement static checkFloor(player, floorY) returning boolean for floor collision
    - Implement static checkCeiling(player) returning boolean for ceiling breach
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 7.2 Write property tests for Collision Detector (Properties 9, 10)
    - **Property 9: AABB collision detection correctness** — checkAABB returns true iff boxes share non-zero area
    - **Validates: Requirements 5.1**
    - **Property 10: Floor collision detection** — checkFloor returns true iff player y + height >= FLOOR_Y
    - **Validates: Requirements 5.2**

  - [x] 7.3 Write unit tests for CollisionDetector
    - Test overlapping hitboxes return true
    - Test non-overlapping hitboxes return false
    - Test edge cases (touching edges, zero-size boxes)
    - _Requirements: 5.1, 5.2_

- [x] 8. Implement Score Manager with localStorage persistence
  - [x] 8.1 Create js/ScoreManager.js
    - Implement ScoreManager class with coins, distance, and highScore tracking
    - Implement addCoin() incrementing coin count
    - Implement updateDistance(dt, speed) accumulating distance using DISTANCE_SCALE
    - Implement getScore() returning { coins, distance, highScore }
    - Implement checkHighScore() comparing current score and persisting if new high
    - Implement loadHighScore() and saveHighScore() with localStorage
    - Handle localStorage unavailability gracefully (in-memory fallback)
    - Handle corrupted localStorage values (fallback to 0)
    - Implement reset() clearing session scores but keeping high score
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 8.2 Write property tests for Score Manager (Properties 13, 14)
    - **Property 13: Distance accumulation** — updateDistance(dt, speed) increases distance by speed * dt * DISTANCE_SCALE
    - **Validates: Requirements 6.2**
    - **Property 14: High score persistence round-trip** — Save then load returns same value; checkHighScore only updates when current exceeds stored
    - **Validates: Requirements 6.4, 6.5**

  - [x] 8.3 Write unit tests for ScoreManager
    - Test coin increment
    - Test high score comparison logic
    - Test localStorage fallback on error
    - Test corrupted localStorage handling
    - _Requirements: 6.1, 6.4, 6.5_

- [x] 9. Checkpoint - Core subsystems complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement Parallax Layer
  - [x] 10.1 Create js/ParallaxLayer.js
    - Implement ParallaxLayer class with multiple cloud layers at different depths
    - Implement update(dt) scrolling each layer at its configured speed
    - Implement render(ctx) drawing all cloud layers back-to-front with semi-transparency
    - Ensure continuous looping so background never appears empty
    - Render behind all gameplay elements
    - Implement reset() restoring initial positions
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 10.2 Write property tests for Parallax Layer (Properties 16, 17)
    - **Property 16: Parallax layers ordered by speed** — Layer with greater depth has lower scroll speed
    - **Validates: Requirements 8.2**
    - **Property 17: Parallax continuous coverage** — Each layer always has at least one cloud visible within canvas bounds
    - **Validates: Requirements 8.3**

  - [x] 10.3 Write unit tests for ParallaxLayer
    - Test layers scroll at different speeds
    - Test cloud wrapping/looping behavior
    - _Requirements: 8.2, 8.3_

- [x] 11. Implement Game Over Screen
  - [x] 11.1 Create js/GameOverScreen.js
    - Implement GameOverScreen class with show(scoreData), hide(), and render(ctx)
    - Display semi-transparent overlay on frozen game state
    - Show final coin count, distance traveled, and high score
    - Show restart prompt (spacebar or tap)
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

  - [x] 11.2 Write unit tests for GameOverScreen
    - Test show/hide visibility toggling
    - Test score data display
    - _Requirements: 7.5_

- [x] 12. Implement Game Engine and main loop
  - [x] 12.1 Create js/GameEngine.js
    - Implement GameEngine class orchestrating all subsystems
    - Implement init() loading assets and initializing all subsystems
    - Implement start() beginning the game loop
    - Implement loop(timestamp) with deltaTime calculation and dt clamping (max 1/30s)
    - Implement update(dt) delegating to all subsystems in correct order
    - Implement render(ctx) drawing in correct z-order (parallax → pipes → coins → player → HUD → game over)
    - Implement state transitions: LOADING → READY → PLAYING → GAME_OVER
    - Implement reset() restoring all subsystems to initial state for restart
    - Implement stop() halting the loop on game over
    - Wire collision detection: pipe/floor collision triggers game over, coin collision triggers score
    - Play jump.wav on flap and game_over.wav on collision
    - Display hit animation/visual effect before transitioning to game over
    - Implement sprite batching (group same-type sprites in render calls)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.6, 5.1, 5.2, 5.5, 7.1, 7.2, 7.4, 9.4, 9.5_

  - [x] 12.2 Create js/main.js bootstrap file
    - Instantiate GameEngine with canvas ID
    - Call init() and start() on page load
    - Display loading/error state on canvas if asset loading fails
    - _Requirements: 1.1, 9.1_

  - [x] 12.3 Write property test for game reset (Property 15)
    - **Property 15: Game reset restores initial state** — After reset(), all subsystems return to initial defaults
    - **Validates: Requirements 7.4**

  - [x] 12.4 Write unit tests for GameEngine
    - Test state transitions (LOADING → READY → PLAYING → GAME_OVER → PLAYING)
    - Test deltaTime clamping for large values
    - Test render order correctness
    - _Requirements: 1.2, 7.1, 7.4, 9.4_

- [x] 13. Checkpoint - Full game loop functional
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Integration, HUD, and final wiring
  - [x] 14.1 Implement HUD/Score Display in GameEngine render phase
    - Display current coin count during gameplay (top-left or top-center)
    - Display distance traveled in meters during gameplay
    - Use retro-styled text rendering on canvas
    - _Requirements: 6.1, 6.2_

  - [x] 14.2 Wire restart flow
    - On game over screen, listen for spacebar/tap to trigger reset and restart
    - Ensure all subsystems are properly reset on restart
    - _Requirements: 7.3, 7.4_

  - [x] 14.3 Write integration tests for full game loop
    - Test init → start → update → render → game over → restart cycle
    - Test asset loading with mock Image/Audio
    - Test localStorage read/write cycle
    - _Requirements: 1.1, 1.2, 7.4, 6.5_

- [x] 15. Final checkpoint - All tests pass and game is playable
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The game uses vanilla JavaScript with ES6 classes — no build tools or frameworks required
- All sprite assets are loaded from kiro-introduction-starter-kit/assets/ directory

- [x] 16. Post-release bugfixes and playability adjustments
  - [x] 16.1 Fix InputHandler not enabled on game start
    - InputHandler was never calling enable() before first input, causing deadlock
    - Moved enable() call to init() after registering onFlap callback
    - _Bug: Space/tap did not work to start the game_

  - [x] 16.2 Fix AssetLoader not receiving ASSET_MANIFEST
    - GameEngine instantiated AssetLoader without passing the manifest
    - Added ASSET_MANIFEST import and passed it to constructor
    - _Bug: Hermes sprites showed orange fallback rectangle_

  - [x] 16.3 Fix asset paths for Vite dev server
    - Assets in ../kiro-introduction-starter-kit/ were outside Vite's root
    - Copied assets to flappy-kiro/assets/ and updated ASSET_MANIFEST paths to ./assets/
    - _Bug: Images failed to load due to Vite security restrictions_

  - [x] 16.4 Fix PipeGenerator and CoinSystem missing constructor arguments
    - GameEngine instantiated both without required canvasWidth/canvasHeight/gapSize params
    - Passed CONFIG values to constructors
    - _Bug: Pipes and coins did not appear during gameplay_

  - [x] 16.5 Playability tuning — increase game scale and adjust difficulty
    - Increased canvas to 720x960 for better sprite visibility
    - Increased PLAYER_WIDTH/HEIGHT to 96px
    - Increased PIPE_GAP from 150 to 250px (more room to pass)
    - Increased PIPE_SPAWN_INTERVAL from 250 to 350px (more reaction time)
    - Increased FLOOR_Y to 900px
    - Added gradient shading and rounded caps to pipes for smoother visuals
    - Added Hermes sprite showcase (128px) on ready screen
    - _Without these adjustments the game was nearly unplayable_
