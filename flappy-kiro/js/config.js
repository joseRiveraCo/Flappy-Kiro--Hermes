/**
 * Flappy Kiro - Game Configuration
 * All game constants, asset paths, and state definitions.
 */

export const CONFIG = {
  CANVAS_WIDTH: 720,
  CANVAS_HEIGHT: 960,
  GRAVITY: 980,                // px/sec²
  FLAP_VELOCITY: -320,        // px/sec (upward)
  SCROLL_SPEED: 150,          // px/sec
  PIPE_WIDTH: 60,             // px
  PIPE_GAP: 250,              // px vertical gap
  PIPE_SPAWN_INTERVAL: 350,   // px horizontal distance between pipes
  PIPE_POOL_SIZE: 8,          // Pre-allocated pipe pairs
  COIN_POOL_SIZE: 12,         // Pre-allocated coins
  COIN_RADIUS: 12,            // px
  HITBOX_SHRINK: 0.2,         // 20% reduction for forgiving collisions
  PLAYER_WIDTH: 96,           // px
  PLAYER_HEIGHT: 96,          // px
  FLOOR_Y: 900,               // px from top
  DISTANCE_SCALE: 0.01,       // Convert px to meters
  IDLE_THRESHOLD: 50,         // Velocity threshold for idle sprite state
  STORAGE_KEY: 'flappy-kiro-highscore'
};

export const ASSET_MANIFEST = {
  images: {
    hermes_idle: './assets/hermes_idle.png',
    hermes_jump: './assets/hermes_jump.png',
    hermes_fall: './assets/hermes_fall.png'
  },
  audio: {
    jump: './assets/jump.wav',
    gameOver: './assets/game_over.wav'
  }
};

export const GameState = {
  LOADING: 'loading',
  READY: 'ready',
  PLAYING: 'playing',
  GAME_OVER: 'gameover'
};
