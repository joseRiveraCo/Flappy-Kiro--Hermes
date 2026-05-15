/**
 * Property-Based Tests for Score Manager
 * Properties 13, 14
 */

import fc from 'fast-check';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScoreManager } from '../../js/ScoreManager.js';
import { CONFIG } from '../../js/config.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, val) => { store[key] = val; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('Score Manager Property Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  /**
   * Property 13: Distance accumulation
   * updateDistance(dt, speed) increases distance by speed * dt * DISTANCE_SCALE
   */
  describe('Property 13: Distance accumulation', () => {
    it('distance increases by speed * dt * DISTANCE_SCALE for any positive dt and speed', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0.001), max: 1, noNaN: true, noDefaultInfinity: true }),
          fc.float({ min: Math.fround(50), max: 500, noNaN: true, noDefaultInfinity: true }),
          (dt, speed) => {
            const mgr = new ScoreManager();
            const before = mgr.distance;
            mgr.updateDistance(dt, speed);
            const expected = before + speed * dt * CONFIG.DISTANCE_SCALE;
            expect(mgr.distance).toBeCloseTo(expected, 5);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 14: High score persistence round-trip
   * Save then load returns same value; checkHighScore only updates when current exceeds stored
   */
  describe('Property 14: High score persistence round-trip', () => {
    it('checkHighScore only updates when current distance exceeds stored high score', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 1, max: 1000, noNaN: true, noDefaultInfinity: true }),
          fc.float({ min: 1, max: 1000, noNaN: true, noDefaultInfinity: true }),
          (storedHigh, currentDist) => {
            localStorageMock.clear();
            localStorageMock.setItem(CONFIG.STORAGE_KEY, String(storedHigh));

            const mgr = new ScoreManager();
            mgr.distance = currentDist;

            const updated = mgr.checkHighScore();

            if (currentDist > storedHigh) {
              expect(updated).toBe(true);
              expect(mgr.highScore).toBeCloseTo(currentDist, 5);
            } else {
              expect(updated).toBe(false);
              expect(mgr.highScore).toBeCloseTo(storedHigh, 5);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
