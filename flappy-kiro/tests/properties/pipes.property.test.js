/**
 * Property-Based Tests for Pipe Generator
 * Properties 3, 4, 5, 6, 18
 */

import fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { PipePair, PipeGenerator } from '../../js/PipeGenerator.js';
import { CONFIG } from '../../js/config.js';

describe('Pipe Generator Property Tests', () => {
  /**
   * Property 3: Pipes spawn at regular intervals
   * For any number of spawn intervals crossed (1-5), after scrolling that many
   * intervals worth of distance, exactly that many pipes should be spawned.
   *
   * **Validates: Requirements 3.1**
   */
  describe('Property 3: Pipes spawn at regular intervals', () => {
    it('crossing N spawn boundaries produces exactly N new pipe pairs', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (intervals) => {
            const generator = new PipeGenerator(
              CONFIG.CANVAS_WIDTH,
              CONFIG.CANVAS_HEIGHT,
              CONFIG.PIPE_GAP
            );

            // Use a fixed scroll speed and compute dt to scroll exactly N intervals
            // Use integer-friendly values to avoid floating point issues
            const scrollSpeed = CONFIG.PIPE_SPAWN_INTERVAL; // 250 px/sec
            // dt = 1 second per interval, so N intervals = N seconds
            const dt = intervals;

            generator.update(dt, scrollSpeed);

            expect(generator.getActivePipes().length).toBe(intervals);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4: Pipe pairs have valid gap position and size
   * For any spawned pipe, gapY is within playable bounds and the gap between
   * top and bottom hitboxes equals PIPE_GAP.
   *
   * **Validates: Requirements 3.2, 3.3**
   */
  describe('Property 4: Pipe pairs have valid gap position and size', () => {
    it('spawned pipes have gapY within bounds and gap equals PIPE_GAP', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: CONFIG.PIPE_POOL_SIZE }),
          (pipeCount) => {
            const generator = new PipeGenerator(
              CONFIG.CANVAS_WIDTH,
              CONFIG.CANVAS_HEIGHT,
              CONFIG.PIPE_GAP
            );

            const margin = 50;
            const minGapY = CONFIG.PIPE_GAP / 2 + margin;
            const maxGapY = CONFIG.FLOOR_Y - CONFIG.PIPE_GAP / 2 - margin;

            // Spawn the requested number of pipes
            const dt = (CONFIG.PIPE_SPAWN_INTERVAL * pipeCount) / CONFIG.SCROLL_SPEED;
            generator.update(dt, CONFIG.SCROLL_SPEED);

            const activePipes = generator.getActivePipes();

            for (const pipe of activePipes) {
              // Gap Y within playable bounds
              expect(pipe.gapY).toBeGreaterThanOrEqual(minGapY);
              expect(pipe.gapY).toBeLessThanOrEqual(maxGapY);

              // Gap between top and bottom hitboxes equals PIPE_GAP
              const top = pipe.getTopHitbox();
              const bottom = pipe.getBottomHitbox();
              const actualGap = bottom.y - (top.y + top.h);
              expect(actualGap).toBeCloseTo(CONFIG.PIPE_GAP, 5);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 5: Pipes scroll at constant speed
   * For any active pipe and any positive dt, after update(dt, scrollSpeed),
   * the pipe's x decreases by scrollSpeed * dt.
   *
   * **Validates: Requirements 3.4**
   */
  describe('Property 5: Pipes scroll at constant speed', () => {
    it('after update(dt, scrollSpeed), pipe x decreases by scrollSpeed * dt', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0.001), max: Math.fround(0.1), noNaN: true }),
          fc.float({ min: Math.fround(50), max: Math.fround(300), noNaN: true }),
          fc.float({ min: Math.fround(100), max: Math.fround(400), noNaN: true }),
          (dt, scrollSpeed, startX) => {
            const pipe = new PipePair();
            pipe.reset(startX, 300);

            const generator = new PipeGenerator(
              CONFIG.CANVAS_WIDTH,
              CONFIG.CANVAS_HEIGHT,
              CONFIG.PIPE_GAP
            );

            // Manually place our pipe in the pool as active
            generator.pool[0] = pipe;

            const xBefore = pipe.x;
            generator.update(dt, scrollSpeed);

            const expectedX = xBefore - scrollSpeed * dt;
            expect(pipe.x).toBeCloseTo(expectedX, 2);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 6: Off-screen pipes are recycled
   * For any pipe positioned such that x + width < 0 after update,
   * it should be deactivated.
   *
   * **Validates: Requirements 3.5**
   */
  describe('Property 6: Off-screen pipes are recycled', () => {
    it('pipe with x + width < 0 after update is deactivated', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0.01), max: Math.fround(0.5), noNaN: true }),
          fc.float({ min: Math.fround(100), max: Math.fround(500), noNaN: true }),
          (dt, scrollSpeed) => {
            const generator = new PipeGenerator(
              CONFIG.CANVAS_WIDTH,
              CONFIG.CANVAS_HEIGHT,
              CONFIG.PIPE_GAP
            );

            // Position a pipe so that after scrolling it will be off-screen
            const pipe = generator.pool[0];
            // Set x so that after scrolling by scrollSpeed * dt, x + width < 0
            const scrollDistance = scrollSpeed * dt;
            const startX = -CONFIG.PIPE_WIDTH + scrollDistance - 1;
            // After update: x = startX - scrollDistance = -PIPE_WIDTH - 1 < -PIPE_WIDTH
            // So x + width = -1 < 0
            pipe.reset(startX, 300);

            generator.update(dt, scrollSpeed);

            // Pipe should be deactivated
            expect(pipe.active).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 18: Pipe pool size invariant
   * For any sequence of updates, pool.length never exceeds PIPE_POOL_SIZE.
   *
   * **Validates: Requirements 9.6**
   */
  describe('Property 18: Pipe pool size invariant', () => {
    it('total allocated PipePair objects never exceed PIPE_POOL_SIZE', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.float({ min: Math.fround(0.01), max: Math.fround(0.5), noNaN: true }),
            { minLength: 5, maxLength: 30 }
          ),
          (dtValues) => {
            const generator = new PipeGenerator(
              CONFIG.CANVAS_WIDTH,
              CONFIG.CANVAS_HEIGHT,
              CONFIG.PIPE_GAP
            );

            for (const dt of dtValues) {
              generator.update(dt, CONFIG.SCROLL_SPEED);

              // Pool size should never exceed PIPE_POOL_SIZE
              expect(generator.pool.length).toBeLessThanOrEqual(CONFIG.PIPE_POOL_SIZE);

              // Active pipes should never exceed pool size
              expect(generator.getActivePipes().length).toBeLessThanOrEqual(CONFIG.PIPE_POOL_SIZE);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
