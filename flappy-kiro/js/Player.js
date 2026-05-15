/**
 * Flappy Kiro - Player Character
 * Manages player physics (gravity, flap velocity) and sprite state.
 */

import { CONFIG } from './config.js';

export class Player {
  /**
   * @param {number} x - Initial x position
   * @param {number} y - Initial y position
   * @param {object} sprites - Object with idle, jump, fall Image references
   */
  constructor(x, y, sprites) {
    this.initialX = x;
    this.initialY = y;
    this.sprites = sprites;

    this.x = x;
    this.y = y;
    this.velocity = 0;
  }

  /**
   * Apply upward velocity (flap/jump).
   * Each flap resets velocity to FLAP_VELOCITY regardless of current velocity.
   */
  flap() {
    this.velocity = CONFIG.FLAP_VELOCITY;
  }

  /**
   * Apply gravity acceleration and update position.
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    this.velocity += CONFIG.GRAVITY * dt;
    this.y += this.velocity * dt;

    // Ceiling clamping: if y < 0, clamp to 0 and zero upward velocity
    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }
  }

  /**
   * Returns the current sprite state based on velocity thresholds.
   * @returns {'idle' | 'jump' | 'fall'}
   */
  getSpriteState() {
    if (this.velocity < -CONFIG.IDLE_THRESHOLD) {
      return 'jump';
    }
    if (this.velocity > CONFIG.IDLE_THRESHOLD) {
      return 'fall';
    }
    return 'idle';
  }

  /**
   * Returns a reduced bounding box (20% shrink, centered on sprite).
   * @returns {{x: number, y: number, w: number, h: number}}
   */
  getHitbox() {
    const shrunkWidth = CONFIG.PLAYER_WIDTH * (1 - CONFIG.HITBOX_SHRINK);
    const shrunkHeight = CONFIG.PLAYER_HEIGHT * (1 - CONFIG.HITBOX_SHRINK);
    return {
      x: this.x + (CONFIG.PLAYER_WIDTH - shrunkWidth) / 2,
      y: this.y + (CONFIG.PLAYER_HEIGHT - shrunkHeight) / 2,
      w: shrunkWidth,
      h: shrunkHeight
    };
  }

  /**
   * Draw the correct sprite based on current state.
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    const state = this.getSpriteState();
    const sprite = this.sprites[state];

    if (sprite) {
      ctx.drawImage(sprite, this.x, this.y, CONFIG.PLAYER_WIDTH, CONFIG.PLAYER_HEIGHT);
    } else {
      // Fallback: draw a placeholder rectangle if sprite is missing
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(this.x, this.y, CONFIG.PLAYER_WIDTH, CONFIG.PLAYER_HEIGHT);
    }
  }

  /**
   * Reset to initial position and velocity.
   */
  reset() {
    this.x = this.initialX;
    this.y = this.initialY;
    this.velocity = 0;
  }
}
