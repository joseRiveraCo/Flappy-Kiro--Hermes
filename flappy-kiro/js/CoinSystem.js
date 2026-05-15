/**
 * Flappy Kiro - Coin System
 * Spawns, scrolls, and recycles coins using an object pool.
 */

import { CONFIG } from './config.js';

/**
 * Represents a single collectible coin.
 */
export class Coin {
  constructor() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.collected = false;
    this.animationTimer = 0;
    this.radius = CONFIG.COIN_RADIUS;
  }

  /**
   * Returns the hitbox for collision detection.
   * @returns {{x: number, y: number, w: number, h: number}}
   */
  getHitbox() {
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      w: this.radius * 2,
      h: this.radius * 2
    };
  }

  /**
   * Render the coin as a golden circle with a shine effect.
   * If collected, render an expanding/fading collection animation.
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    if (this.collected) {
      // Collection animation: expanding and fading circle
      const progress = 1 - (this.animationTimer / 0.3);
      const expandRadius = this.radius * (1 + progress);
      const alpha = 1 - progress;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, expandRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      ctx.restore();
      return;
    }

    // Golden circle body
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Shine effect (small white arc in upper-left)
    ctx.beginPath();
    ctx.arc(this.x - 3, this.y - 3, this.radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();
  }

  /**
   * Reactivate this coin with a new position.
   * @param {number} x - Horizontal center position
   * @param {number} y - Vertical center position
   */
  reset(x, y) {
    this.active = true;
    this.x = x;
    this.y = y;
    this.collected = false;
    this.animationTimer = 0;
  }
}

/**
 * Manages coin spawning, scrolling, and recycling using an object pool.
 */
export class CoinSystem {
  /**
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   */
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.spawnInterval = CONFIG.PIPE_SPAWN_INTERVAL;
    this.distanceSinceLastSpawn = 0;

    // Collection animation duration in seconds
    this.collectionAnimationDuration = 0.3;

    // Pre-allocate object pool
    this.pool = [];
    for (let i = 0; i < CONFIG.COIN_POOL_SIZE; i++) {
      this.pool.push(new Coin());
    }
  }

  /**
   * Update coin positions, spawn new coins, handle collection animations, and recycle off-screen coins.
   * @param {number} dt - Delta time in seconds
   * @param {number} scrollSpeed - Horizontal scroll speed in px/sec
   * @param {Array} [activePipes] - Optional array of active pipe pairs for safe positioning
   */
  update(dt, scrollSpeed, activePipes) {
    const scrollDistance = scrollSpeed * dt;

    // Scroll all active coins
    for (const coin of this.pool) {
      if (coin.active) {
        coin.x -= scrollDistance;

        // Update collection animation timer
        if (coin.collected) {
          coin.animationTimer -= dt;
          if (coin.animationTimer <= 0) {
            coin.active = false;
            coin.collected = false;
          }
        }
      }
    }

    // Recycle off-screen coins (only non-collected ones)
    for (const coin of this.pool) {
      if (coin.active && !coin.collected && coin.x + coin.radius < 0) {
        coin.active = false;
      }
    }

    // Track cumulative distance for spawning
    this.distanceSinceLastSpawn += scrollDistance;

    // Spawn new coins when crossing spawn interval boundary
    while (this.distanceSinceLastSpawn >= this.spawnInterval) {
      this.distanceSinceLastSpawn -= this.spawnInterval;
      this._spawnCoin(activePipes);
    }
  }

  /**
   * Spawn a new coin from the pool, positioned safely between pipes.
   * @param {Array} [activePipes] - Active pipe pairs to avoid overlap
   * @private
   */
  _spawnCoin(activePipes) {
    // Find an inactive coin in the pool
    const coin = this.pool.find(c => !c.active);

    if (!coin) {
      console.warn('CoinSystem: Pool exhausted, skipping spawn');
      return;
    }

    // Position coin at the right edge of the canvas
    const x = this.canvasWidth;

    // Determine safe Y position
    let y;

    if (activePipes && activePipes.length > 0) {
      // Find the most recently spawned pipe (rightmost active pipe)
      const rightmostPipe = activePipes.reduce((best, pipe) =>
        pipe.x > best.x ? pipe : best, activePipes[0]);

      // Position coin in the center of the pipe gap
      y = rightmostPipe.gapY;
    } else {
      // No pipes available - position in safe middle area
      const margin = CONFIG.PIPE_GAP / 2 + 50;
      const minY = margin;
      const maxY = CONFIG.FLOOR_Y - margin;
      y = minY + Math.random() * (maxY - minY);
    }

    coin.reset(x, y);
  }

  /**
   * Returns all currently active (visible) coins that are not collected.
   * @returns {Coin[]}
   */
  getActiveCoins() {
    return this.pool.filter(c => c.active && !c.collected);
  }

  /**
   * Mark a coin as collected and trigger the collection animation.
   * @param {Coin} coin
   */
  collect(coin) {
    coin.collected = true;
    coin.animationTimer = this.collectionAnimationDuration;
  }

  /**
   * Batch render all active coins.
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    for (const coin of this.pool) {
      if (coin.active) {
        coin.render(ctx);
      }
    }
  }

  /**
   * Reset all coins to inactive (return to pool).
   */
  reset() {
    for (const coin of this.pool) {
      coin.active = false;
      coin.collected = false;
      coin.animationTimer = 0;
    }
    this.distanceSinceLastSpawn = 0;
  }
}
