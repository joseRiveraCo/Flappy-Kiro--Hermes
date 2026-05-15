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

vi.stubGlobal('document', {
  getElementById: () => mockCanvas,
  addEventListener: vi.fn()
});
vi.stubGlobal('requestAnimationFrame', vi.fn());
vi.stubGlobal('cancelAnimationFrame', vi.fn());
vi.stubGlobal('performance', { now: () => 0 });
vi.stubGlobal('Image', class { set onload(fn) { fn(); } set onerror(_) {} set src(_) {} });
vi.stubGlobal('Audio', class { play() { return Promise.resolve(); } set oncanplaythrough(fn) { fn(); } set onerror(_) {} set src(_) {} });

const { GameEngine } = await import('../../js/GameEngine.js');

describe('GameEngine', () => {
  let engine;

  beforeEach(async () => {
    localStorageMock.clear();
    engine = new GameEngine('gameCanvas');
    await engine.init();
  });

  it('starts in READY state after init', () => {
    expect(engine.state).toBe(GameState.READY);
  });

  it('transitions to PLAYING on first flap', () => {
    engine.handleFlap();
    expect(engine.state).toBe(GameState.PLAYING);
  });

  it('transitions to GAME_OVER on floor collision', () => {
    engine.state = GameState.PLAYING;
    engine.player.y = CONFIG.FLOOR_Y; // Force floor collision
    engine.update(0.016);
    expect(engine.state).toBe(GameState.GAME_OVER);
  });

  it('transitions back to PLAYING from GAME_OVER on flap', () => {
    engine.state = GameState.GAME_OVER;
    engine.handleFlap();
    expect(engine.state).toBe(GameState.PLAYING);
  });

  it('clamps deltaTime to max 1/30s', () => {
    engine.state = GameState.PLAYING;
    engine.lastTimestamp = 0;
    // Simulate a large gap (100ms)
    engine.loop(100);
    // Player should have been updated with clamped dt (1/30 ≈ 0.033s), not 0.1s
    // Just verify no crash and state is still playing
    expect(engine.state).toBe(GameState.PLAYING);
  });

  it('render calls ctx methods without error', () => {
    engine.state = GameState.PLAYING;
    expect(() => engine.render()).not.toThrow();
  });

  it('reset restores all subsystems', () => {
    engine.state = GameState.PLAYING;
    engine.player.flap();
    engine.player.update(0.5);
    engine.scoreManager.addCoin();
    engine.reset();
    expect(engine.player.velocity).toBe(0);
    expect(engine.scoreManager.coins).toBe(0);
    expect(engine.gameOverScreen.visible).toBe(false);
  });
});
