import { describe, it, expect } from 'vitest';
import { CollisionDetector } from '../../js/CollisionDetector.js';
import { CONFIG } from '../../js/config.js';

describe('CollisionDetector', () => {
  describe('checkAABB', () => {
    it('returns true for overlapping boxes', () => {
      const a = { x: 0, y: 0, w: 50, h: 50 };
      const b = { x: 25, y: 25, w: 50, h: 50 };
      expect(CollisionDetector.checkAABB(a, b)).toBe(true);
    });

    it('returns false for non-overlapping boxes', () => {
      const a = { x: 0, y: 0, w: 50, h: 50 };
      const b = { x: 100, y: 100, w: 50, h: 50 };
      expect(CollisionDetector.checkAABB(a, b)).toBe(false);
    });

    it('returns false for touching edges (no shared area)', () => {
      const a = { x: 0, y: 0, w: 50, h: 50 };
      const b = { x: 50, y: 0, w: 50, h: 50 };
      expect(CollisionDetector.checkAABB(a, b)).toBe(false);
    });

    it('returns true when one box contains the other', () => {
      const a = { x: 0, y: 0, w: 100, h: 100 };
      const b = { x: 25, y: 25, w: 10, h: 10 };
      expect(CollisionDetector.checkAABB(a, b)).toBe(true);
    });
  });

  describe('checkPlayerPipes', () => {
    it('returns true when player overlaps top pipe', () => {
      const player = { getHitbox: () => ({ x: 100, y: 50, w: 30, h: 30 }) };
      const pipes = [{
        getTopHitbox: () => ({ x: 90, y: 0, w: 60, h: 70 }),
        getBottomHitbox: () => ({ x: 90, y: 300, w: 60, h: 340 })
      }];
      expect(CollisionDetector.checkPlayerPipes(player, pipes)).toBe(true);
    });

    it('returns true when player overlaps bottom pipe', () => {
      const player = { getHitbox: () => ({ x: 100, y: 310, w: 30, h: 30 }) };
      const pipes = [{
        getTopHitbox: () => ({ x: 90, y: 0, w: 60, h: 70 }),
        getBottomHitbox: () => ({ x: 90, y: 300, w: 60, h: 340 })
      }];
      expect(CollisionDetector.checkPlayerPipes(player, pipes)).toBe(true);
    });

    it('returns false when player is in the gap', () => {
      const player = { getHitbox: () => ({ x: 100, y: 150, w: 30, h: 30 }) };
      const pipes = [{
        getTopHitbox: () => ({ x: 90, y: 0, w: 60, h: 100 }),
        getBottomHitbox: () => ({ x: 90, y: 250, w: 60, h: 390 })
      }];
      expect(CollisionDetector.checkPlayerPipes(player, pipes)).toBe(false);
    });

    it('returns false with empty pipes array', () => {
      const player = { getHitbox: () => ({ x: 100, y: 150, w: 30, h: 30 }) };
      expect(CollisionDetector.checkPlayerPipes(player, [])).toBe(false);
    });
  });

  describe('checkPlayerCoins', () => {
    it('returns collected coins that overlap with player', () => {
      const player = { getHitbox: () => ({ x: 100, y: 100, w: 30, h: 30 }) };
      const coin1 = { getHitbox: () => ({ x: 110, y: 110, w: 20, h: 20 }) };
      const coin2 = { getHitbox: () => ({ x: 400, y: 400, w: 20, h: 20 }) };
      const result = CollisionDetector.checkPlayerCoins(player, [coin1, coin2]);
      expect(result).toEqual([coin1]);
    });

    it('returns empty array when no coins overlap', () => {
      const player = { getHitbox: () => ({ x: 100, y: 100, w: 30, h: 30 }) };
      const coin = { getHitbox: () => ({ x: 400, y: 400, w: 20, h: 20 }) };
      expect(CollisionDetector.checkPlayerCoins(player, [coin])).toEqual([]);
    });
  });

  describe('checkFloor', () => {
    it('returns true when player hitbox reaches floor', () => {
      const player = { getHitbox: () => ({ x: 100, y: 570, w: 30, h: 30 }) };
      expect(CollisionDetector.checkFloor(player, CONFIG.FLOOR_Y)).toBe(true);
    });

    it('returns false when player is above floor', () => {
      const player = { getHitbox: () => ({ x: 100, y: 200, w: 30, h: 30 }) };
      expect(CollisionDetector.checkFloor(player, CONFIG.FLOOR_Y)).toBe(false);
    });

    it('returns true when hitbox exactly touches floor', () => {
      const floorY = 600;
      const player = { getHitbox: () => ({ x: 100, y: 570, w: 30, h: 30 }) };
      expect(CollisionDetector.checkFloor(player, floorY)).toBe(true);
    });
  });

  describe('checkCeiling', () => {
    it('returns true when player y is negative', () => {
      expect(CollisionDetector.checkCeiling({ y: -1 })).toBe(true);
    });

    it('returns false when player y is zero', () => {
      expect(CollisionDetector.checkCeiling({ y: 0 })).toBe(false);
    });

    it('returns false when player y is positive', () => {
      expect(CollisionDetector.checkCeiling({ y: 100 })).toBe(false);
    });
  });
});
