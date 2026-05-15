/**
 * Property-Based Tests for Player Physics
 * Properties 1, 2, 11, 12
 */

import fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { Player } from '../../js/Player.js';
import { CONFIG } from '../../js/config.js';

describe('Player Property Tests', () => {
  /**
   * Property 1: Gravity applies consistent acceleration
   * For any positive dt and initial velocity, update(dt) without flap
   * increases downward velocity by GRAVITY * dt.
   *
   * **Validates: Requirements 2.2**
   */
  describe('Property 1: Gravity applies consistent acceleration', () => {
    it('update(dt) increases velocity by GRAVITY * dt for any dt and initial velocity', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0.001), max: Math.fround(0.1), noNaN: true }),
          fc.float({ min: Math.fround(-1000), max: Math.fround(1000), noNaN: true }),
          (dt, initialVelocity) => {
            // Place player at y=300 to avoid ceiling clamping
            const player = new Player(100, 300, {});
            player.velocity = initialVelocity;

            const velocityBefore = player.velocity;
            player.update(dt);

            // If ceiling clamping didn't trigger, velocity should increase by GRAVITY * dt
            if (player.y > 0) {
              const expectedVelocity = velocityBefore + CONFIG.GRAVITY * dt;
              expect(player.velocity).toBeCloseTo(expectedVelocity, 2);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 2: Sprite state reflects velocity
   * getSpriteState() returns correct state for any velocity value.
   *
   * **Validates: Requirements 2.3, 2.4, 2.5**
   */
  describe('Property 2: Sprite state reflects velocity', () => {
    it('getSpriteState() returns correct state based on velocity thresholds', () => {
      fc.assert(
        fc.property(
          fc.float({ min: -2000, max: 2000, noNaN: true }),
          (velocity) => {
            const player = new Player(100, 300, {});
            player.velocity = velocity;

            const state = player.getSpriteState();

            if (velocity < -CONFIG.IDLE_THRESHOLD) {
              expect(state).toBe('jump');
            } else if (velocity > CONFIG.IDLE_THRESHOLD) {
              expect(state).toBe('fall');
            } else {
              expect(state).toBe('idle');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 11: Ceiling position clamping
   * Player y < 0 after update is clamped to 0 with velocity zeroed.
   *
   * **Validates: Requirements 5.3**
   */
  describe('Property 11: Ceiling position clamping', () => {
    it('player y is clamped to 0 and velocity zeroed when y would go negative', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0.001), max: Math.fround(0.1), noNaN: true }),
          fc.float({ min: Math.fround(-2000), max: Math.fround(-100), noNaN: true }),
          (dt, strongUpwardVelocity) => {
            // Place player near ceiling with strong upward velocity
            // so that after update, y goes negative
            const player = new Player(100, 5, {});
            player.velocity = strongUpwardVelocity;

            player.update(dt);

            // After update, if y would have gone negative, it should be clamped to 0
            // The velocity after gravity is: strongUpwardVelocity + GRAVITY * dt
            // The new y would be: 5 + (strongUpwardVelocity + GRAVITY * dt) * dt ... but simplified:
            // We just check the result: if clamping triggered, y=0 and velocity=0
            if (player.y === 0) {
              expect(player.velocity).toBe(0);
            }
            // y should never be negative
            expect(player.y).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 12: Hitbox reduction for fair collisions
   * getHitbox() returns dimensions reduced by HITBOX_SHRINK, centered on sprite.
   *
   * **Validates: Requirements 5.4**
   */
  describe('Property 12: Hitbox reduction for fair collisions', () => {
    it('getHitbox() returns correctly reduced and centered hitbox for any position', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 400, noNaN: true }),
          fc.float({ min: 0, max: 600, noNaN: true }),
          (x, y) => {
            const player = new Player(x, y, {});

            const hitbox = player.getHitbox();

            const expectedW = CONFIG.PLAYER_WIDTH * (1 - CONFIG.HITBOX_SHRINK);
            const expectedH = CONFIG.PLAYER_HEIGHT * (1 - CONFIG.HITBOX_SHRINK);
            const expectedX = x + (CONFIG.PLAYER_WIDTH - expectedW) / 2;
            const expectedY = y + (CONFIG.PLAYER_HEIGHT - expectedH) / 2;

            expect(hitbox.w).toBeCloseTo(expectedW, 5);
            expect(hitbox.h).toBeCloseTo(expectedH, 5);
            expect(hitbox.x).toBeCloseTo(expectedX, 5);
            expect(hitbox.y).toBeCloseTo(expectedY, 5);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
