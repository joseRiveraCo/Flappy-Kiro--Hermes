import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InputHandler } from '../../js/InputHandler.js';

/**
 * Unit tests for InputHandler
 * Validates: Requirements 2.1, 2.6
 */

// Simple EventTarget mock for Node.js environment
class MockEventTarget {
  constructor() {
    this._listeners = {};
  }

  addEventListener(event, handler) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(handler);
  }

  removeEventListener(event, handler) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(h => h !== handler);
  }

  dispatch(event, eventObj) {
    if (this._listeners[event]) {
      for (const handler of this._listeners[event]) {
        handler(eventObj);
      }
    }
  }

  getListenerCount(event) {
    return (this._listeners[event] || []).length;
  }
}

function createKeyboardEvent(code, key) {
  return {
    code: code || 'Space',
    key: key || ' ',
    preventDefault: vi.fn()
  };
}

function createTouchEvent() {
  return { preventDefault: vi.fn() };
}

function createClickEvent() {
  return { preventDefault: vi.fn() };
}

describe('InputHandler', () => {
  let canvas;
  let keyTarget;
  let inputHandler;

  beforeEach(() => {
    canvas = new MockEventTarget();
    keyTarget = new MockEventTarget();
    inputHandler = new InputHandler(canvas, keyTarget);
  });

  describe('onFlap()', () => {
    it('registers a flap listener callback', () => {
      const callback = vi.fn();
      inputHandler.onFlap(callback);
      inputHandler.enable();

      keyTarget.dispatch('keydown', createKeyboardEvent('Space', ' '));

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('supports multiple flap listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      inputHandler.onFlap(callback1);
      inputHandler.onFlap(callback2);
      inputHandler.enable();

      keyTarget.dispatch('keydown', createKeyboardEvent('Space', ' '));

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });

  describe('enable()', () => {
    it('starts listening for keyboard events on keyTarget', () => {
      inputHandler.enable();

      expect(keyTarget.getListenerCount('keydown')).toBe(1);
    });

    it('starts listening for touchstart events on canvas', () => {
      inputHandler.enable();

      expect(canvas.getListenerCount('touchstart')).toBe(1);
    });

    it('starts listening for click events on canvas', () => {
      inputHandler.enable();

      expect(canvas.getListenerCount('click')).toBe(1);
    });

    it('does not add duplicate listeners if called multiple times', () => {
      inputHandler.enable();
      inputHandler.enable();

      expect(keyTarget.getListenerCount('keydown')).toBe(1);
      expect(canvas.getListenerCount('touchstart')).toBe(1);
      expect(canvas.getListenerCount('click')).toBe(1);
    });
  });

  describe('disable()', () => {
    it('stops listening for keyboard events', () => {
      inputHandler.enable();
      inputHandler.disable();

      expect(keyTarget.getListenerCount('keydown')).toBe(0);
    });

    it('stops listening for touchstart events on canvas', () => {
      inputHandler.enable();
      inputHandler.disable();

      expect(canvas.getListenerCount('touchstart')).toBe(0);
    });

    it('stops listening for click events on canvas', () => {
      inputHandler.enable();
      inputHandler.disable();

      expect(canvas.getListenerCount('click')).toBe(0);
    });

    it('prevents input processing after disable', () => {
      const callback = vi.fn();
      inputHandler.onFlap(callback);
      inputHandler.enable();
      inputHandler.disable();

      // Simulate a keydown after disable - should not trigger
      keyTarget.dispatch('keydown', createKeyboardEvent('Space', ' '));

      expect(callback).not.toHaveBeenCalled();
    });

    it('does nothing if not currently enabled', () => {
      // Should not throw
      inputHandler.disable();
      expect(keyTarget.getListenerCount('keydown')).toBe(0);
    });
  });

  describe('spacebar input', () => {
    it('triggers flap callback on spacebar keydown', () => {
      const callback = vi.fn();
      inputHandler.onFlap(callback);
      inputHandler.enable();

      keyTarget.dispatch('keydown', createKeyboardEvent('Space', ' '));

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('triggers flap callback using key property fallback', () => {
      const callback = vi.fn();
      inputHandler.onFlap(callback);
      inputHandler.enable();

      // Some browsers may not have event.code, use key=' ' fallback
      keyTarget.dispatch('keydown', { code: undefined, key: ' ', preventDefault: vi.fn() });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('prevents default on spacebar to avoid page scroll', () => {
      inputHandler.onFlap(vi.fn());
      inputHandler.enable();

      const event = createKeyboardEvent('Space', ' ');
      keyTarget.dispatch('keydown', event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('ignores non-spacebar keys', () => {
      const callback = vi.fn();
      inputHandler.onFlap(callback);
      inputHandler.enable();

      keyTarget.dispatch('keydown', createKeyboardEvent('KeyA', 'a'));

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('touch input', () => {
    it('triggers flap callback on canvas touchstart', () => {
      const callback = vi.fn();
      inputHandler.onFlap(callback);
      inputHandler.enable();

      canvas.dispatch('touchstart', createTouchEvent());

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('prevents default on touchstart', () => {
      inputHandler.onFlap(vi.fn());
      inputHandler.enable();

      const event = createTouchEvent();
      canvas.dispatch('touchstart', event);

      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('click input', () => {
    it('triggers flap callback on canvas click', () => {
      const callback = vi.fn();
      inputHandler.onFlap(callback);
      inputHandler.enable();

      canvas.dispatch('click', createClickEvent());

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('prevents default on click', () => {
      inputHandler.onFlap(vi.fn());
      inputHandler.enable();

      const event = createClickEvent();
      canvas.dispatch('click', event);

      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('multiple rapid inputs', () => {
    it('each flap triggers the callback independently (velocity reset handled by Player)', () => {
      const callback = vi.fn();
      inputHandler.onFlap(callback);
      inputHandler.enable();

      // Rapid spacebar presses
      keyTarget.dispatch('keydown', createKeyboardEvent('Space', ' '));
      keyTarget.dispatch('keydown', createKeyboardEvent('Space', ' '));
      keyTarget.dispatch('keydown', createKeyboardEvent('Space', ' '));

      // Each input triggers the callback - the Player.flap() resets velocity each time
      expect(callback).toHaveBeenCalledTimes(3);
    });

    it('rapid mixed inputs all trigger flap', () => {
      const callback = vi.fn();
      inputHandler.onFlap(callback);
      inputHandler.enable();

      keyTarget.dispatch('keydown', createKeyboardEvent('Space', ' '));
      canvas.dispatch('touchstart', createTouchEvent());
      canvas.dispatch('click', createClickEvent());

      expect(callback).toHaveBeenCalledTimes(3);
    });
  });
});
