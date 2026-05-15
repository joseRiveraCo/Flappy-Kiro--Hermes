/**
 * Flappy Kiro - Score Manager
 * Tracks coins, distance, and persists high score via localStorage.
 */

import { CONFIG } from './config.js';

export class ScoreManager {
  constructor() {
    this.coins = 0;
    this.distance = 0;
    this.highScore = this.loadHighScore();
  }

  addCoin() {
    this.coins++;
  }

  updateDistance(dt, speed) {
    this.distance += speed * dt * CONFIG.DISTANCE_SCALE;
  }

  getScore() {
    return { coins: this.coins, distance: this.distance, highScore: this.highScore };
  }

  checkHighScore() {
    const current = this.distance;
    if (current > this.highScore) {
      this.highScore = current;
      this.saveHighScore();
      return true;
    }
    return false;
  }

  loadHighScore() {
    try {
      const val = localStorage.getItem(CONFIG.STORAGE_KEY);
      const parsed = Number(val);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    } catch {
      return 0;
    }
  }

  saveHighScore() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, String(this.highScore));
    } catch {
      // localStorage unavailable — silently ignore
    }
  }

  reset() {
    this.coins = 0;
    this.distance = 0;
  }
}
