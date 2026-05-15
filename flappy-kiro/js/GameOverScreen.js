/**
 * Flappy Kiro - Game Over Screen
 * Displays final score overlay on frozen game state.
 */

import { CONFIG } from './config.js';

export class GameOverScreen {
  constructor() {
    this.visible = false;
    this.scoreData = null;
  }

  show(scoreData) {
    this.visible = true;
    this.scoreData = scoreData;
  }

  hide() {
    this.visible = false;
    this.scoreData = null;
  }

  render(ctx) {
    if (!this.visible || !this.scoreData) return;

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    const cx = CONFIG.CANVAS_WIDTH / 2;

    // Title
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', cx, 200);

    // Scores
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px monospace';
    ctx.fillText(`Coins: ${this.scoreData.coins}`, cx, 280);
    ctx.fillText(`Distance: ${this.scoreData.distance.toFixed(1)}m`, cx, 320);
    ctx.fillText(`High Score: ${this.scoreData.highScore.toFixed(1)}m`, cx, 360);

    // Restart prompt
    ctx.fillStyle = '#ffcc00';
    ctx.font = '16px monospace';
    ctx.fillText('Press SPACE or TAP to restart', cx, 440);

    ctx.textAlign = 'left';
  }
}
