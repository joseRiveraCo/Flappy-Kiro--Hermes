/**
 * Property-Based Tests for Coin System
 * Properties 7, 8, 19
 */

import fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { Coin, CoinSystem } from '../../js/CoinSystem.js';
import { PipeGenerator } from '../../js/PipeGenerator.js';
import { CONFIG } from '../../js/config.js';

/**
 * Helper: Check if two AABB hitboxes overlap (share non-zero area).
 */
function hitboxesOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

describe('Coin System Property Tests', () => {
  /**
   * Property 7: Coins are positioned in safe areas
   * Spawned coin position does not overlap any active pipe hitbox.
   * The coin is positioned at the pipe's gapY (center of the gap), so its
   * vertical extent should not overlap with either the top or bottom pipe.
   *
   * We verify this by spawning pipes, then spawning coins with those pipes,
   * and checking that for any pipe whose horizontal range overlaps the coin,
   * the coin's vertical hitbox does not overlap the pipe's top or bottom hitbox.
   *
   * **Validates: Requirements 4.1**
   */
  describe('Property 7: Coins are positioned in safe areas', () => {
    it('spawned coin position does not overlap any active pipe hitbox', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 4 }),
          fc.float({ min: Math.fround(150), max: Math.fround(400), noNaN: true }),
          (pipeCount, gapY) => {
            // Clamp gapY to valid pipe gap bounds
            const margin = 50;
            const minGapY = CONFIG.PIPE_GAP / 2 + margin;
            const maxGapY = CONFIG.FLOOR_Y - CONFIG.PIPE_GAP / 2 - margin;
            const clampedGapY = Math.max(minGapY, Math.min(maxGapY, gapY));

            // Create a CoinSystem
            const coinSystem = new CoinSystem(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

            // Manually create active pipes at known positions to the left of spawn point
            // This simulates pipes that have scrolled into view
            const activePipes = [];
            for (let i = 0; i < pipeCount; i++) {
              activePipes.push({
                active: true,
                x: 200 + i * 80,
                gapY: clampedGapY,
                gapSize: CONFIG.PIPE_GAP,
                width: CONFIG.PIPE_WIDTH,
                getTopHitbox() {
                  return {
                    x: this.x,
                    y: 0,
                    w: this.width,
                    h: this.gapY - this.gapSize / 2
                  };
                },
                getBottomHitbox() {
                  const topOfBottom = this.gapY + this.gapSize / 2;
                  return {
                    x: this.x,
                    y: topOfBottom,
                    w: this.width,
                    h: CONFIG.FLOOR_Y - topOfBottom
                  };
                }
              });
            }

            // Force a coin spawn by accumulating enough distance
            const coinDt = CONFIG.PIPE_SPAWN_INTERVAL / CONFIG.SCROLL_SPEED;
            coinSystem.update(coinDt, CONFIG.SCROLL_SPEED, activePipes);

            const activeCoins = coinSystem.getActiveCoins();

            // Verify each spawned coin does not overlap any pipe hitbox
            // The coin spawns at x=canvasWidth and pipes are to the left,
            // so we check the vertical safety: coin Y is in the gap
            for (const coin of activeCoins) {
              const coinHitbox = coin.getHitbox();

              for (const pipe of activePipes) {
                const topHitbox = pipe.getTopHitbox();
                const bottomHitbox = pipe.getBottomHitbox();

                // If the coin and pipe overlap horizontally, verify vertical safety
                const horizontalOverlap =
                  coinHitbox.x < topHitbox.x + topHitbox.w &&
                  coinHitbox.x + coinHitbox.w > topHitbox.x;

                if (horizontalOverlap) {
                  // Coin should not overlap top or bottom pipe vertically
                  expect(hitboxesOverlap(coinHitbox, topHitbox)).toBe(false);
                  expect(hitboxesOverlap(coinHitbox, bottomHitbox)).toBe(false);
                }
              }

              // Additionally verify: coin Y is within the gap of the rightmost pipe
              // The coin is placed at gapY of the rightmost pipe
              const rightmostPipe = activePipes.reduce((best, pipe) =>
                pipe.x > best.x ? pipe : best, activePipes[0]);

              // Coin center should be at gapY
              expect(coin.y).toBe(rightmostPipe.gapY);

              // Coin hitbox should be fully within the gap
              const gapTop = rightmostPipe.gapY - CONFIG.PIPE_GAP / 2;
              const gapBottom = rightmostPipe.gapY + CONFIG.PIPE_GAP / 2;
              expect(coinHitbox.y).toBeGreaterThanOrEqual(gapTop);
              expect(coinHitbox.y + coinHitbox.h).toBeLessThanOrEqual(gapBottom);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 8: Coins scroll at constant speed
   * For any active coin and any positive dt, after update(dt, scrollSpeed),
   * the coin's x decreases by scrollSpeed * dt.
   *
   * **Validates: Requirements 4.5**
   */
  describe('Property 8: Coins scroll at constant speed', () => {
    it('after update(dt, scrollSpeed), coin x decreases by scrollSpeed * dt', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0.001), max: Math.fround(0.1), noNaN: true }),
          fc.float({ min: Math.fround(50), max: Math.fround(300), noNaN: true }),
          fc.float({ min: Math.fround(100), max: Math.fround(400), noNaN: true }),
          (dt, scrollSpeed, startX) => {
            const coinSystem = new CoinSystem(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

            // Manually activate a coin at a known position
            const coin = coinSystem.pool[0];
            coin.reset(startX, 300);

            const xBefore = coin.x;

            // Reset distance tracker to avoid triggering new spawns
            coinSystem.distanceSinceLastSpawn = 0;
            coinSystem.update(dt, scrollSpeed);

            const expectedX = xBefore - scrollSpeed * dt;
            expect(coin.x).toBeCloseTo(expectedX, 2);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 19: Coin pool size invariant
   * For any sequence of updates, pool.length never exceeds COIN_POOL_SIZE.
   *
   * **Validates: Requirements 9.7**
   */
  describe('Property 19: Coin pool size invariant', () => {
    it('total allocated Coin objects never exceed COIN_POOL_SIZE', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.float({ min: Math.fround(0.01), max: Math.fround(0.5), noNaN: true }),
            { minLength: 5, maxLength: 30 }
          ),
          (dtValues) => {
            const coinSystem = new CoinSystem(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

            // Create a PipeGenerator to provide active pipes for coin positioning
            const generator = new PipeGenerator(
              CONFIG.CANVAS_WIDTH,
              CONFIG.CANVAS_HEIGHT,
              CONFIG.PIPE_GAP
            );

            for (const dt of dtValues) {
              // Update pipes first so coins have pipes to reference
              generator.update(dt, CONFIG.SCROLL_SPEED);
              const activePipes = generator.getActivePipes();

              // Update coin system
              coinSystem.update(dt, CONFIG.SCROLL_SPEED, activePipes);

              // Pool size should never exceed COIN_POOL_SIZE
              expect(coinSystem.pool.length).toBeLessThanOrEqual(CONFIG.COIN_POOL_SIZE);

              // Active coins should never exceed pool size
              expect(coinSystem.getActiveCoins().length).toBeLessThanOrEqual(CONFIG.COIN_POOL_SIZE);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
