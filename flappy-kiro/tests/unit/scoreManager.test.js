import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScoreManager } from '../../js/ScoreManager.js';
import { CONFIG } from '../../js/config.js';

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

describe('ScoreManager', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  it('starts with zero coins and distance', () => {
    const mgr = new ScoreManager();
    expect(mgr.getScore()).toEqual({ coins: 0, distance: 0, highScore: 0 });
  });

  it('addCoin increments coin count', () => {
    const mgr = new ScoreManager();
    mgr.addCoin();
    mgr.addCoin();
    expect(mgr.getScore().coins).toBe(2);
  });

  it('updateDistance accumulates correctly', () => {
    const mgr = new ScoreManager();
    mgr.updateDistance(1, 150);
    expect(mgr.distance).toBeCloseTo(150 * CONFIG.DISTANCE_SCALE, 5);
  });

  it('checkHighScore updates when current exceeds stored', () => {
    const mgr = new ScoreManager();
    mgr.distance = 100;
    expect(mgr.checkHighScore()).toBe(true);
    expect(mgr.highScore).toBe(100);
  });

  it('checkHighScore does not update when current is lower', () => {
    localStorageMock.setItem(CONFIG.STORAGE_KEY, '200');
    const mgr = new ScoreManager();
    mgr.distance = 50;
    expect(mgr.checkHighScore()).toBe(false);
    expect(mgr.highScore).toBe(200);
  });

  it('reset clears coins and distance but keeps highScore', () => {
    const mgr = new ScoreManager();
    mgr.addCoin();
    mgr.distance = 500;
    mgr.highScore = 500;
    mgr.reset();
    expect(mgr.coins).toBe(0);
    expect(mgr.distance).toBe(0);
    expect(mgr.highScore).toBe(500);
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorageMock.setItem(CONFIG.STORAGE_KEY, 'not-a-number');
    const mgr = new ScoreManager();
    expect(mgr.highScore).toBe(0);
  });

  it('handles localStorage error gracefully', () => {
    localStorageMock.getItem.mockImplementationOnce(() => { throw new Error('denied'); });
    const mgr = new ScoreManager();
    expect(mgr.highScore).toBe(0);
  });
});
