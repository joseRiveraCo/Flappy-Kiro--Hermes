/**
 * Property-Based Tests for Parallax Layer
 * Properties 16, 17
 */

import fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { ParallaxLayer } from '../../js/ParallaxLayer.js';
import { CONFIG } from '../../js/config.js';

describe('Parallax Layer Property Tests', () => {
  /**
   * Property 16: Parallax layers ordered by speed
   * Layer with greater depth has lower scroll speed.
   */
  describe('Property 16: Parallax layers ordered by speed', () => {
    it('layers with greater depth have lower scroll speed', () => {
      const parallax = new ParallaxLayer();
      const layers = parallax.getLayers();

      for (let i = 0; i < layers.length - 1; i++) {
        if (layers[i].depth > layers[i + 1].depth) {
          expect(layers[i].speed).toBeLessThan(layers[i + 1].speed);
        }
      }
    });
  });

  /**
   * Property 17: Parallax continuous coverage
   * Each layer always has at least one cloud visible within canvas bounds after any update.
   */
  describe('Property 17: Parallax continuous coverage', () => {
    it('each layer always has at least one cloud visible within canvas bounds', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.float({ min: Math.fround(0.016), max: Math.fround(0.1), noNaN: true, noDefaultInfinity: true }),
            { minLength: 1, maxLength: 60 }
          ),
          (dtValues) => {
            const parallax = new ParallaxLayer();

            for (const dt of dtValues) {
              parallax.update(dt);
            }

            const layers = parallax.getLayers();
            for (const layer of layers) {
              const hasVisible = layer.clouds.some(
                (c) => c.x + c.width > 0 && c.x < CONFIG.CANVAS_WIDTH
              );
              expect(hasVisible).toBe(true);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
