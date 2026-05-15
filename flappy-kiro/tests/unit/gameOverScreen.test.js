import { describe, it, expect, vi } from 'vitest';
import { GameOverScreen } from '../../js/GameOverScreen.js';

describe('GameOverScreen', () => {
  const mockCtx = {
    fillRect: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    fill: vi.fn(),
    fillStyle: '',
    font: '',
    textAlign: '',
    globalAlpha: 1
  };

  it('starts hidden', () => {
    const screen = new GameOverScreen();
    expect(screen.visible).toBe(false);
  });

  it('show makes it visible with score data', () => {
    const screen = new GameOverScreen();
    const data = { coins: 5, distance: 120.5, highScore: 200.3 };
    screen.show(data);
    expect(screen.visible).toBe(true);
    expect(screen.scoreData).toEqual(data);
  });

  it('hide makes it invisible', () => {
    const screen = new GameOverScreen();
    screen.show({ coins: 1, distance: 10, highScore: 10 });
    screen.hide();
    expect(screen.visible).toBe(false);
    expect(screen.scoreData).toBeNull();
  });

  it('render does nothing when hidden', () => {
    const screen = new GameOverScreen();
    mockCtx.fillRect.mockClear();
    screen.render(mockCtx);
    expect(mockCtx.fillRect).not.toHaveBeenCalled();
  });

  it('render draws overlay and score when visible', () => {
    const screen = new GameOverScreen();
    screen.show({ coins: 3, distance: 50.7, highScore: 100.2 });
    mockCtx.fillRect.mockClear();
    mockCtx.fillText.mockClear();
    screen.render(mockCtx);
    expect(mockCtx.fillRect).toHaveBeenCalled();
    expect(mockCtx.fillText).toHaveBeenCalledWith(expect.stringContaining('GAME OVER'), expect.any(Number), expect.any(Number));
  });
});
