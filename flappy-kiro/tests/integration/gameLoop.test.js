import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameState, CONFIG } from '../../js/config.js';

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

// Mock DOM
const mockCtx = {
  fillRect: vi.fn(), fillText: vi.fn(), beginPath: vi.fn(),
  fill: vi.fn(), ellipse: vi.fn(), arc: vi.fn(), drawImage: vi.fn(),
  fillStyle: '', font: '', textAlign: '', globalAlpha: 1
};
const mockCanvas = {
  getContext: () => mockCtx,
  addEventListener: vi.fn(),
  width: CONFIG.CANVAS_WIDTH,
  height: CONFIG.CANVAS_HEIGHT
};
vi.stubGlobal('document', { getElementById: () => mockCanvas, addEventListener: vi.fn() });
vi.stubGlobal('requestAnimationFrame', vi.fn());
vi.stubGlobal('cancelAnimationFrame', vi.fn());
vi.stubGlobal('performance', { now: () => 0 });
vi.stubGlobal('Image', class { set onload(fn) { fn(); } set onerror(_) {} set src(_) {} });
vi.stubGlobal('Audio', class { play() { return Promise.resolve(); } set oncanplaythrough(fn) { fn(); } set onerror(_) {} set src(_) {} });

const { GameEngine } = await import('../../js/GameEngine.js');

describe('Integration: Full Game Loop', () => {
  let engine;

  beforeEach(async () => {
    localStorageMock.clear();
    engine = new GameEngine('gameCanvas');
    await engine.init();
  });

  it('full lifecycle: init → start → play → game over → restart', () => {
    expect(engine.state).toBe(GameState.READY);

    // Start playing
    engine.handleFlap();
    expect(engine.state).toBe(GameState.PLAYING);

    // Simulate some frames
    for (let i = 0; i < 10; i++) {
      engine.update(0.016);
    }
    expect(engine.state).toBe(GameState.PLAYING);

    // Force game over via floor collision
    engine.player.y = CONFIG.FLOOR_Y;
    engine.update(0.016);
    expect(engine.state).toBe(GameState.GAME_OVER);
    expect(engine.gameOverScreen.visible).toBe(true);

    // Restart
    engine.handleFlap();
    expect(engine.state).toBe(GameState.PLAYING);
    expect(engine.gameOverScreen.visible).toBe(false);
    expect(engine.scoreManager.coins).toBe(0);
    expect(engine.scoreManager.distance).toBe(0);
  });

  it('high score persists across game over cycles', () => {
    engine.handleFlap();
    engine.scoreManager.distance = 100;
    engine.player.y = CONFIG.FLOOR_Y;
    engine.update(0.016);

    const savedHigh = engine.scoreManager.highScore;
    expect(savedHigh).toBeGreaterThanOrEqual(100);

    // Restart and get lower score
    engine.handleFlap();
    engine.scoreManager.distance = 50;
    engine.player.y = CONFIG.FLOOR_Y;
    engine.update(0.016);

    expect(engine.scoreManager.highScore).toBe(savedHigh); // Unchanged
  });

  it('coins collected increment score', () => {
    engine.handleFlap();

    // Manually simulate coin collection
    engine.scoreManager.addCoin();
    engine.scoreManager.addCoin();
    engine.scoreManager.addCoin();

    expect(engine.scoreManager.getScore().coins).toBe(3);
  });
});
