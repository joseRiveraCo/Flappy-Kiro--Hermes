/**
 * Flappy Kiro - Pipe Generator
 * Spawns, scrolls, and recycles pipe pairs using an object pool.
 */

import { CONFIG } from './config.js';

/**
 * Represents a single pair of pipes (top and bottom) with a gap.
 */
export class PipePair {
  constructor() {
    this.active = false;
    this.x = 0;
    this.gapY = 0;
    this.gapSize = CONFIG.PIPE_GAP;
    this.width = CONFIG.PIPE_WIDTH;
  }

  /**
   * Returns the hitbox for the top pipe.
   * @returns {{x: number, y: number, w: number, h: number}}
   */
  getTopHitbox() {
    return {
      x: this.x,
      y: 0,
      w: this.width,
      h: this.gapY - this.gapSize / 2
    };
  }

  /**
   * Returns the hitbox for the bottom pipe.
   * @returns {{x: number, y: number, w: number, h: number}}
   */
  getBottomHitbox() {
    const topOfBottom = this.gapY + this.gapSize / 2;
    return {
      x: this.x,
      y: topOfBottom,
      w: this.width,
      h: CONFIG.FLOOR_Y - topOfBottom
    };
  }

  /**
   * Render both pipes with retro green style.
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    const topHeight = this.gapY - this.gapSize / 2;
    const bottomY = this.gapY + this.gapSize / 2;
    const bottomHeight = CONFIG.FLOOR_Y - bottomY;
    const capHeight = 24;
    const capOverhang = 8;
    const r = 6;

    const roundRect = (x, y, w, h, radius) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    const bodyGrad = ctx.createLinearGradient(this.x, 0, this.x + this.width, 0);
    bodyGrad.addColorStop(0, '#2ecc40');
    bodyGrad.addColorStop(0.4, '#5dde6e');
    bodyGrad.addColorStop(1, '#1a9c30');

    const capGrad = ctx.createLinearGradient(this.x - capOverhang, 0, this.x + this.width + capOverhang, 0);
    capGrad.addColorStop(0, '#27ae36');
    capGrad.addColorStop(0.4, '#4dd65e');
    capGrad.addColorStop(1, '#1a7a25');

    ctx.fillStyle = bodyGrad;
    ctx.fillRect(this.x, 0, this.width, topHeight);

    ctx.fillStyle = capGrad;
    roundRect(this.x - capOverhang, topHeight - capHeight, this.width + capOverhang * 2, capHeight, r);
    ctx.fill();
    ctx.strokeStyle = '#145a1a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = bodyGrad;
    ctx.fillRect(this.x, bottomY, this.width, bottomHeight);

    ctx.fillStyle = capGrad;
    roundRect(this.x - capOverhang, bottomY, this.width + capOverhang * 2, capHeight, r);
    ctx.fill();
    ctx.strokeStyle = '#145a1a';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /**
   * Reactivate this pipe pair with a new position.
   * @param {number} x - Horizontal position
   * @param {number} gapY - Center Y of the gap
   */
  reset(x, gapY) {
    this.active = true;
    this.x = x;
    this.gapY = gapY;
  }
}

/**
 * Manages pipe spawning, scrolling, and recycling using an object pool.
 */
export class PipeGenerator {
  /**
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   * @param {number} gapSize - Vertical gap between top and bottom pipes
   */
  constructor(canvasWidth, canvasHeight, gapSize) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.gapSize = gapSize;
    this.spawnInterval = CONFIG.PIPE_SPAWN_INTERVAL;
    this.distanceSinceLastSpawn = 0;

    // Playable bounds for gap Y position (50px margin from top and bottom)
    const margin = 50;
    this.minGapY = gapSize / 2 + margin;
    this.maxGapY = CONFIG.FLOOR_Y - gapSize / 2 - margin;

    // Pre-allocate object pool
    this.pool = [];
    for (let i = 0; i < CONFIG.PIPE_POOL_SIZE; i++) {
      this.pool.push(new PipePair());
    }
  }

  /**
   * Update pipe positions, spawn new pipes, and recycle off-screen pipes.
   * @param {number} dt - Delta time in seconds
   * @param {number} scrollSpeed - Horizontal scroll speed in px/sec
   */
  update(dt, scrollSpeed) {
    const scrollDistance = scrollSpeed * dt;

    // Scroll all active pipes
    for (const pipe of this.pool) {
      if (pipe.active) {
        pipe.x -= scrollDistance;
      }
    }

    // Recycle off-screen pipes
    for (const pipe of this.pool) {
      if (pipe.active && pipe.x + pipe.width < 0) {
        pipe.active = false;
      }
    }

    // Track cumulative distance for spawning
    this.distanceSinceLastSpawn += scrollDistance;

    // Spawn new pipes when crossing spawn interval boundary
    while (this.distanceSinceLastSpawn >= this.spawnInterval) {
      this.distanceSinceLastSpawn -= this.spawnInterval;
      this._spawnPipe();
    }
  }

  /**
   * Spawn a new pipe pair from the pool.
   * @private
   */
  _spawnPipe() {
    // Find an inactive pipe in the pool
    const pipe = this.pool.find(p => !p.active);

    if (!pipe) {
      console.warn('PipeGenerator: Pool exhausted, skipping spawn');
      return;
    }

    // Randomize gap Y within playable bounds
    const gapY = this.minGapY + Math.random() * (this.maxGapY - this.minGapY);

    pipe.reset(this.canvasWidth, gapY);
  }

  /**
   * Returns all currently active pipe pairs.
   * @returns {PipePair[]}
   */
  getActivePipes() {
    return this.pool.filter(p => p.active);
  }

  /**
   * Batch render all active pipes.
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    for (const pipe of this.pool) {
      if (pipe.active) {
        pipe.render(ctx);
      }
    }
  }

  /**
   * Reset all pipes to inactive (return to pool).
   */
  reset() {
    for (const pipe of this.pool) {
      pipe.active = false;
    }
    this.distanceSinceLastSpawn = 0;
  }
}
