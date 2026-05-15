/**
 * Property-Based Tests for Game Reset
 * Property 15
 */

import fc from 'fast-check';
import { describe, it, expect, vi } from 'vitest';
import { Player } from '../../js/Player.js';
import { PipeGenerator } from '../../js/PipeGenerator.js';
import { CoinSystem } from '../../js/CoinSystem.js';
import { ScoreManager } from '../../js/ScoreManager.js';
import { ParallaxLayer } from '../../js/ParallaxLayer.js';
import { CONFIG } from '../../js/config.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, val) => { store[key] = val; }),
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('Game Reset Property Tests', () => {
  /**
   * Property 15: Game reset restores initial state
   * After reset(), all subsystems return to initial defaults.
   */
  describe('Property 15: Game reset restores initial state', () => {
    it('after arbitrary updates, reset restores subsystems to defaults', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          (numUpdates) => {
            const startY = CONFIG.CANVAS_HEIGHT / 2 - CONFIG.PLAYER_HEIGHT / 2;
            const player = new Player(80, startY, {});
            const pipes = new PipeGenerator();
            const coins = new CoinSystem();
            const score = new ScoreManager();

            // Simulate gameplay
            for (let i = 0; i < numUpdates; i++) {
              player.flap();
              player.update(0.016);
              pipes.update(0.016, CONFIG.SCROLL_SPEED);
              coins.update(0.016, CONFIG.SCROLL_SPEED, pipes.getActivePipes());
              score.updateDistance(0.016, CONFIG.SCROLL_SPEED);
              score.addCoin();
            }

            // Reset all
            player.reset();
            pipes.reset();
            coins.reset();
            score.reset();

            // Verify initial state
            expect(player.y).toBe(startY);
            expect(player.velocity).toBe(0);
            expect(pipes.getActivePipes().length).toBe(0);
            expect(coins.getActiveCoins().length).toBe(0);
            expect(score.coins).toBe(0);
            expect(score.distance).toBe(0);
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});
