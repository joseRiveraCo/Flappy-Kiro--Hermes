/**
 * Flappy Kiro - Collision Detector
 * Pure logic module with static AABB collision detection methods.
 */

import { CONFIG } from './config.js';

export class CollisionDetector {
  /**
   * Check if two axis-aligned bounding boxes overlap (share non-zero area).
   * @param {{x: number, y: number, w: number, h: number}} a - First hitbox
   * @param {{x: number, y: number, w: number, h: number}} b - Second hitbox
   * @returns {boolean} True if the two hitboxes overlap
   */
  static checkAABB(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  /**
   * Check if the player collides with any pipe.
   * @param {object} player - Player instance with getHitbox() method
   * @param {Array} pipes - Array of active pipe pairs with getTopHitbox() and getBottomHitbox()
   * @returns {boolean} True if the player hits any pipe
   */
  static checkPlayerPipes(player, pipes) {
    const playerHitbox = player.getHitbox();

    for (const pipe of pipes) {
      if (CollisionDetector.checkAABB(playerHitbox, pipe.getTopHitbox())) {
        return true;
      }
      if (CollisionDetector.checkAABB(playerHitbox, pipe.getBottomHitbox())) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check which coins the player is currently overlapping with.
   * @param {object} player - Player instance with getHitbox() method
   * @param {Array} coins - Array of active coins with getHitbox() method
   * @returns {Array} Array of coins that overlap with the player
   */
  static checkPlayerCoins(player, coins) {
    const playerHitbox = player.getHitbox();
    const collected = [];

    for (const coin of coins) {
      if (CollisionDetector.checkAABB(playerHitbox, coin.getHitbox())) {
        collected.push(coin);
      }
    }

    return collected;
  }

  /**
   * Check if the player has hit the floor.
   * @param {object} player - Player instance with getHitbox() method
   * @param {number} floorY - Y position of the floor
   * @returns {boolean} True if the player's hitbox touches or passes the floor
   */
  static checkFloor(player, floorY) {
    const hitbox = player.getHitbox();
    return hitbox.y + hitbox.h >= floorY;
  }

  /**
   * Check if the player has breached the ceiling (y < 0).
   * @param {object} player - Player instance with y property
   * @returns {boolean} True if the player is above the canvas top
   */
  static checkCeiling(player) {
    return player.y < 0;
  }
}
