/**
 * Unit tests for Coin and CoinSystem classes.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Coin, CoinSystem } from '../../js/CoinSystem.js';
import { CONFIG } from '../../js/config.js';

describe('Coin', () => {
  let coin;

  beforeEach(() => {
    coin = new Coin();
  });

  it('should initialize as inactive', () => {
    expect(coin.active).toBe(false);
    expect(coin.x).toBe(0);
    expect(coin.y).toBe(0);
    expect(coin.collected).toBe(false);
    expect(coin.animationTimer).toBe(0);
  });

  it('should activate and set position on reset(x, y)', () => {
    coin.reset(200, 300);
    expect(coin.active).toBe(true);
    expect(coin.x).toBe(200);
    expect(coin.y).toBe(300);
    expect(coin.collected).toBe(false);
    expect(coin.animationTimer).toBe(0);
  });

  it('should return correct AABB hitbox based on center and radius', () => {
    coin.reset(100, 150);
    const hitbox = coin.getHitbox();
    expect(hitbox.x).toBe(100 - CONFIG.COIN_RADIUS);
    expect(hitbox.y).toBe(150 - CONFIG.COIN_RADIUS);
    expect(hitbox.w).toBe(CONFIG.COIN_RADIUS * 2);
    expect(hitbox.h).toBe(CONFIG.COIN_RADIUS * 2);
  });
});

describe('CoinSystem', () => {
  let system;

  beforeEach(() => {
    system = new CoinSystem(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
  });

  it('should pre-allocate COIN_POOL_SIZE coins', () => {
    expect(system.pool.length).toBe(CONFIG.COIN_POOL_SIZE);
  });

  it('should start with no active coins', () => {
    expect(system.getActiveCoins().length).toBe(0);
  });

  it('should spawn a coin after scrolling one spawn interval', () => {
    const dt = CONFIG.PIPE_SPAWN_INTERVAL / CONFIG.SCROLL_SPEED;
    system.update(dt, CONFIG.SCROLL_SPEED);
    expect(system.getActiveCoins().length).toBe(1);
  });

  it('should spawn coin at pipe gap Y when active pipes are provided', () => {
    const activePipes = [{ x: 400, gapY: 320 }];
    const dt = CONFIG.PIPE_SPAWN_INTERVAL / CONFIG.SCROLL_SPEED;
    system.update(dt, CONFIG.SCROLL_SPEED, activePipes);

    const activeCoins = system.getActiveCoins();
    expect(activeCoins.length).toBe(1);
    expect(activeCoins[0].y).toBe(320);
  });

  it('should mark coin as collected and start animation timer on collect()', () => {
    // Spawn a coin first
    const dt = CONFIG.PIPE_SPAWN_INTERVAL / CONFIG.SCROLL_SPEED;
    system.update(dt, CONFIG.SCROLL_SPEED);

    const coin = system.getActiveCoins()[0];
    system.collect(coin);

    expect(coin.collected).toBe(true);
    expect(coin.animationTimer).toBeCloseTo(0.3, 5);
  });

  it('should remove collected coin from getActiveCoins()', () => {
    // Spawn a coin
    const dt = CONFIG.PIPE_SPAWN_INTERVAL / CONFIG.SCROLL_SPEED;
    system.update(dt, CONFIG.SCROLL_SPEED);
    expect(system.getActiveCoins().length).toBe(1);

    const coin = system.getActiveCoins()[0];
    system.collect(coin);

    // Collected coins should not appear in getActiveCoins()
    expect(system.getActiveCoins().length).toBe(0);
  });

  it('should deactivate collected coin after animation timer expires', () => {
    // Spawn a coin
    const spawnDt = CONFIG.PIPE_SPAWN_INTERVAL / CONFIG.SCROLL_SPEED;
    system.update(spawnDt, CONFIG.SCROLL_SPEED);

    const coin = system.getActiveCoins()[0];
    system.collect(coin);

    expect(coin.active).toBe(true);
    expect(coin.collected).toBe(true);

    // Advance time past the animation duration (0.3s)
    system.update(0.35, CONFIG.SCROLL_SPEED);

    expect(coin.active).toBe(false);
    expect(coin.collected).toBe(false);
  });

  it('should skip spawn when all coins are active (pool exhaustion)', () => {
    // Activate all coins manually
    for (const coin of system.pool) {
      coin.active = true;
      coin.x = 200; // Keep on-screen
    }

    // Try to spawn more - should not throw and pool size stays the same
    const dt = CONFIG.PIPE_SPAWN_INTERVAL / CONFIG.SCROLL_SPEED;
    expect(() => system.update(dt, CONFIG.SCROLL_SPEED)).not.toThrow();
    expect(system.pool.length).toBe(CONFIG.COIN_POOL_SIZE);
  });

  it('should deactivate all coins on reset()', () => {
    // Spawn some coins
    const dt = CONFIG.PIPE_SPAWN_INTERVAL / CONFIG.SCROLL_SPEED;
    system.update(dt, CONFIG.SCROLL_SPEED);
    system.update(dt, CONFIG.SCROLL_SPEED);
    expect(system.getActiveCoins().length).toBeGreaterThan(0);

    system.reset();

    expect(system.getActiveCoins().length).toBe(0);
    expect(system.distanceSinceLastSpawn).toBe(0);
    // Verify all coins are inactive
    for (const coin of system.pool) {
      expect(coin.active).toBe(false);
      expect(coin.collected).toBe(false);
    }
  });
});
