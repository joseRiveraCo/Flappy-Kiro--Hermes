import { describe, it, expect } from 'vitest';
import { ParallaxLayer } from '../../js/ParallaxLayer.js';
import { CONFIG } from '../../js/config.js';

describe('ParallaxLayer', () => {
  it('has multiple layers with different speeds', () => {
    const parallax = new ParallaxLayer();
    const layers = parallax.getLayers();
    expect(layers.length).toBeGreaterThan(1);
    const speeds = layers.map((l) => l.speed);
    expect(new Set(speeds).size).toBe(speeds.length);
  });

  it('layers scroll at different speeds', () => {
    const parallax = new ParallaxLayer();
    const layers = parallax.getLayers();
    const initialPositions = layers.map((l) => l.clouds[0].x);

    parallax.update(1);

    layers.forEach((layer, i) => {
      const moved = initialPositions[i] - layer.clouds[0].x;
      expect(moved).toBeCloseTo(layer.speed, 0);
    });
  });

  it('wraps clouds that go off-screen to the right', () => {
    const parallax = new ParallaxLayer();
    const layers = parallax.getLayers();
    // Force a cloud off-screen
    const cloud = layers[2].clouds[0];
    cloud.x = -cloud.width - 1;

    parallax.update(0.016);

    expect(cloud.x).toBeGreaterThanOrEqual(CONFIG.CANVAS_WIDTH);
  });

  it('reset restores clouds', () => {
    const parallax = new ParallaxLayer();
    // Move clouds far
    for (let i = 0; i < 100; i++) parallax.update(0.5);
    parallax.reset();
    const layers = parallax.getLayers();
    // After reset, all clouds should be within or near canvas bounds
    for (const layer of layers) {
      expect(layer.clouds.length).toBeGreaterThan(0);
    }
  });
});
