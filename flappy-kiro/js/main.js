/**
 * Flappy Kiro - Bootstrap
 */

import { GameEngine } from './GameEngine.js';

const game = new GameEngine('gameCanvas');

game.init().then(() => {
  game.start();
}).catch((err) => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ff0000';
  ctx.font = '16px monospace';
  ctx.fillText('Failed to load game.', 120, 300);
  console.error(err);
});
