/**
 * Property-Based Tests for Collision Detector
 * Properties 9, 10
 */

import fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { CollisionDetector } from '../../js/CollisionDetector.js';
import { CONFIG } from '../../js/config.js';

describe('Collision Detector Property Tests', () => {
  /**
   * Property 9: AABB collision detection correctness
   * For any two axis-aligned bounding boxes A and B, checkAABB(A, B) returns true
   * if and only if the boxes share a non-zero area.
   *
   * **Validates: Requirements 5.1**
   */
  describe('Property 9: AABB collision detection correctness', () => {
    it('checkAABB returns true iff boxes share non-zero area', () => {
      fc.assert(
        fc.property(
          fc.record({
            x: fc.float({ min: -100, max: 500, noNaN: true, noDefaultInfinity: true }),
            y: fc.float({ min: -100, max: 700, noNaN: true, noDefaultInfinity: true }),
            w: fc.float({ min: 1, max: 200, noNaN: true, noDefaultInfinity: true }),
            h: fc.float({ min: 1, max: 200, noNaN: true, noDefaultInfinity: true })
          }),
          fc.record({
            x: fc.float({ min: -100, max: 500, noNaN: true, noDefaultInfinity: true }),
            y: fc.float({ min: -100, max: 700, noNaN: true, noDefaultInfinity: true }),
            w: fc.float({ min: 1, max: 200, noNaN: true, noDefaultInfinity: true }),
            h: fc.float({ min: 1, max: 200, noNaN: true, noDefaultInfinity: true })
          }),
          (a, b) => {
            const result = CollisionDetector.checkAABB(a, b);

            // The expected result based on the AABB overlap formula
            const expected =
              a.x < b.x + b.w &&
              a.x + a.w > b.x &&
              a.y < b.y + b.h &&
              a.y + a.h > b.y;

            expect(result).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 10: Floor collision detection
   * For any player position, checkFloor returns true iff hitbox.y + hitbox.h >= FLOOR_Y.
   *
   * **Validates: Requirements 5.2**
   */
  describe('Property 10: Floor collision detection', () => {
    it('checkFloor returns true iff player hitbox y + height >= FLOOR_Y', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 700, noNaN: true, noDefaultInfinity: true }),
          (playerY) => {
            // Calculate the shrunk hitbox dimensions (matching Player.getHitbox() logic)
            const shrunkW = CONFIG.PLAYER_WIDTH * (1 - CONFIG.HITBOX_SHRINK);
            const shrunkH = CONFIG.PLAYER_HEIGHT * (1 - CONFIG.HITBOX_SHRINK);
            const offsetX = (CONFIG.PLAYER_WIDTH - shrunkW) / 2;
            const offsetY = (CONFIG.PLAYER_HEIGHT - shrunkH) / 2;

            // Create a mock player with getHitbox() that mimics real Player behavior
            const mockPlayer = {
              getHitbox() {
                return {
                  x: 100 + offsetX,
                  y: playerY + offsetY,
                  w: shrunkW,
                  h: shrunkH
                };
              }
            };

            const result = CollisionDetector.checkFloor(mockPlayer, CONFIG.FLOOR_Y);

            // Expected: hitbox bottom edge >= FLOOR_Y
            const hitbox = mockPlayer.getHitbox();
            const expected = hitbox.y + hitbox.h >= CONFIG.FLOOR_Y;

            expect(result).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
