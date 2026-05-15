/**
 * Unit tests for PipeGenerator and PipePair classes.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PipePair, PipeGenerator } from '../../js/PipeGenerator.js';
import { CONFIG } from '../../js/config.js';

describe('PipePair', () => {
  let pipe;

  beforeEach(() => {
    pipe = new PipePair();
  });

  it('should initialize as inactive', () => {
    expect(pipe.active).toBe(false);
    expect(pipe.x).toBe(0);
    expect(pipe.gapY).toBe(0);
    expect(pipe.gapSize).toBe(CONFIG.PIPE_GAP);
    expect(pipe.width).toBe(CONFIG.PIPE_WIDTH);
  });

  it('should activate and set position on reset', () => {
    pipe.reset(480, 300);
    expect(pipe.active).toBe(true);
    expect(pipe.x).toBe(480);
    expect(pipe.gapY).toBe(300);
  });

  it('should return correct top hitbox', () => {
    pipe.reset(100, 300);
    const hitbox = pipe.getTopHitbox();
    expect(hitbox.x).toBe(100);
    expect(hitbox.y).toBe(0);
    expect(hitbox.w).toBe(CONFIG.PIPE_WIDTH);
    expect(hitbox.h).toBe(300 - CONFIG.PIPE_GAP / 2);
  });

  it('should return correct bottom hitbox', () => {
    pipe.reset(100, 300);
    const hitbox = pipe.getBottomHitbox();
    const expectedTopOfBottom = 300 + CONFIG.PIPE_GAP / 2;
    expect(hitbox.x).toBe(100);
    expect(hitbox.y).toBe(expectedTopOfBottom);
    expect(hitbox.w).toBe(CONFIG.PIPE_WIDTH);
    expect(hitbox.h).toBe(CONFIG.FLOOR_Y - expectedTopOfBottom);
  });

  it('should maintain PIPE_GAP between top and bottom pipes', () => {
    pipe.reset(100, 350);
    const top = pipe.getTopHitbox();
    const bottom = pipe.getBottomHitbox();
    const gap = bottom.y - (top.y + top.h);
    expect(gap).toBe(CONFIG.PIPE_GAP);
  });
});

describe('PipeGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new PipeGenerator(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT, CONFIG.PIPE_GAP);
  });

  it('should pre-allocate PIPE_POOL_SIZE pipe pairs', () => {
    expect(generator.pool.length).toBe(CONFIG.PIPE_POOL_SIZE);
  });

  it('should start with no active pipes', () => {
    expect(generator.getActivePipes().length).toBe(0);
  });

  it('should spawn a pipe after scrolling one spawn interval', () => {
    // Scroll exactly one spawn interval distance
    const dt = CONFIG.PIPE_SPAWN_INTERVAL / CONFIG.SCROLL_SPEED;
    generator.update(dt, CONFIG.SCROLL_SPEED);
    expect(generator.getActivePipes().length).toBe(1);
  });

  it('should spawn pipes at correct intervals', () => {
    // Scroll two spawn intervals
    const dt = (CONFIG.PIPE_SPAWN_INTERVAL * 2) / CONFIG.SCROLL_SPEED;
    generator.update(dt, CONFIG.SCROLL_SPEED);
    expect(generator.getActivePipes().length).toBe(2);
  });

  it('should scroll active pipes left', () => {
    // Spawn a pipe first
    const spawnDt = CONFIG.PIPE_SPAWN_INTERVAL / CONFIG.SCROLL_SPEED;
    generator.update(spawnDt, CONFIG.SCROLL_SPEED);

    const pipe = generator.getActivePipes()[0];
    const initialX = pipe.x;

    // Scroll for 1 second
    generator.update(1, CONFIG.SCROLL_SPEED);
    expect(pipe.x).toBeCloseTo(initialX - CONFIG.SCROLL_SPEED, 5);
  });

  it('should recycle off-screen pipes', () => {
    // Spawn a pipe
    const spawnDt = CONFIG.PIPE_SPAWN_INTERVAL / CONFIG.SCROLL_SPEED;
    generator.update(spawnDt, CONFIG.SCROLL_SPEED);
    expect(generator.getActivePipes().length).toBe(1);

    // Scroll it completely off-screen
    // Pipe starts at CANVAS_WIDTH (480), needs to move 480 + PIPE_WIDTH (60) = 540px
    const offScreenDt = (CONFIG.CANVAS_WIDTH + CONFIG.PIPE_WIDTH + 1) / CONFIG.SCROLL_SPEED;
    generator.update(offScreenDt, CONFIG.SCROLL_SPEED);

    // The pipe should be recycled (though new ones may have spawned)
    const activePipes = generator.getActivePipes();
    const offScreenPipes = activePipes.filter(p => p.x + p.width < 0);
    expect(offScreenPipes.length).toBe(0);
  });

  it('should not exceed pool size', () => {
    // Even with many updates, should never have more than PIPE_POOL_SIZE active
    for (let i = 0; i < 100; i++) {
      generator.update(0.1, CONFIG.SCROLL_SPEED);
    }
    expect(generator.getActivePipes().length).toBeLessThanOrEqual(CONFIG.PIPE_POOL_SIZE);
  });

  it('should randomize gap Y within playable bounds', () => {
    // Spawn several pipes and check bounds
    const margin = 50;
    const minGapY = CONFIG.PIPE_GAP / 2 + margin;
    const maxGapY = CONFIG.FLOOR_Y - CONFIG.PIPE_GAP / 2 - margin;

    for (let i = 0; i < CONFIG.PIPE_POOL_SIZE; i++) {
      const spawnDt = CONFIG.PIPE_SPAWN_INTERVAL / CONFIG.SCROLL_SPEED;
      generator.update(spawnDt, CONFIG.SCROLL_SPEED);
    }

    const activePipes = generator.getActivePipes();
    for (const pipe of activePipes) {
      expect(pipe.gapY).toBeGreaterThanOrEqual(minGapY);
      expect(pipe.gapY).toBeLessThanOrEqual(maxGapY);
    }
  });

  it('should reset all pipes to inactive', () => {
    // Spawn some pipes
    const spawnDt = CONFIG.PIPE_SPAWN_INTERVAL / CONFIG.SCROLL_SPEED;
    generator.update(spawnDt, CONFIG.SCROLL_SPEED);
    generator.update(spawnDt, CONFIG.SCROLL_SPEED);
    expect(generator.getActivePipes().length).toBeGreaterThan(0);

    generator.reset();
    expect(generator.getActivePipes().length).toBe(0);
    expect(generator.distanceSinceLastSpawn).toBe(0);
  });

  it('should handle pool exhaustion gracefully', () => {
    // Activate all pipes manually
    for (const pipe of generator.pool) {
      pipe.active = true;
      pipe.x = 200; // Keep them on-screen so they don't get recycled
    }

    // Try to spawn more - should not throw
    const spawnDt = CONFIG.PIPE_SPAWN_INTERVAL / CONFIG.SCROLL_SPEED;
    expect(() => generator.update(spawnDt, CONFIG.SCROLL_SPEED)).not.toThrow();

    // Pool size should remain the same
    expect(generator.pool.length).toBe(CONFIG.PIPE_POOL_SIZE);
  });
});
