import { describe, it, expect, beforeEach } from 'vitest';
import { Player } from '../../js/Player.js';
import { CONFIG } from '../../js/config.js';

/**
 * Unit tests for Player
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */

describe('Player', () => {
  let player;
  const startX = 100;
  const startY = 300;
  const sprites = { idle: null, jump: null, fall: null };

  beforeEach(() => {
    player = new Player(startX, startY, sprites);
  });

  describe('flap()', () => {
    it('sets velocity to FLAP_VELOCITY (-320)', () => {
      player.flap();

      expect(player.velocity).toBe(CONFIG.FLAP_VELOCITY);
      expect(player.velocity).toBe(-320);
    });

    it('resets velocity regardless of current velocity (no stacking)', () => {
      // Simulate falling with high downward velocity
      player.velocity = 500;
      player.flap();

      expect(player.velocity).toBe(CONFIG.FLAP_VELOCITY);

      // Flap again while already moving up
      player.velocity = -200;
      player.flap();

      expect(player.velocity).toBe(CONFIG.FLAP_VELOCITY);
    });
  });

  describe('update(dt)', () => {
    it('applies gravity and updates position', () => {
      const dt = 0.016; // ~1 frame at 60fps
      const initialY = player.y;
      const initialVelocity = player.velocity;

      player.update(dt);

      const expectedVelocity = initialVelocity + CONFIG.GRAVITY * dt;
      const expectedY = initialY + expectedVelocity * dt;

      expect(player.velocity).toBeCloseTo(expectedVelocity, 5);
      expect(player.y).toBeCloseTo(expectedY, 5);
    });
  });

  describe('getSpriteState()', () => {
    it('returns "jump" at velocity = -51 (just below -IDLE_THRESHOLD)', () => {
      player.velocity = -51;

      expect(player.getSpriteState()).toBe('jump');
    });

    it('returns "idle" at velocity = -50 (boundary)', () => {
      player.velocity = -50;

      expect(player.getSpriteState()).toBe('idle');
    });

    it('returns "idle" at velocity = 0', () => {
      player.velocity = 0;

      expect(player.getSpriteState()).toBe('idle');
    });

    it('returns "idle" at velocity = 50 (boundary)', () => {
      player.velocity = 50;

      expect(player.getSpriteState()).toBe('idle');
    });

    it('returns "fall" at velocity = 51 (just above IDLE_THRESHOLD)', () => {
      player.velocity = 51;

      expect(player.getSpriteState()).toBe('fall');
    });
  });

  describe('reset()', () => {
    it('restores initial x, y, and velocity to 0', () => {
      // Modify player state
      player.x = 999;
      player.y = 999;
      player.velocity = -500;

      player.reset();

      expect(player.x).toBe(startX);
      expect(player.y).toBe(startY);
      expect(player.velocity).toBe(0);
    });
  });

  describe('ceiling clamping', () => {
    it('y does not go below 0', () => {
      // Place player near top with strong upward velocity
      player.y = 5;
      player.velocity = -1000;

      player.update(0.016);

      expect(player.y).toBe(0);
      expect(player.velocity).toBe(0);
    });
  });
});
