/**
 * Flappy Kiro - Game Engine
 * Orchestrates all subsystems: game loop, state transitions, rendering.
 */

import { CONFIG, ASSET_MANIFEST, GameState } from './config.js';
import { AssetLoader } from './AssetLoader.js';
import { InputHandler } from './InputHandler.js';
import { Player } from './Player.js';
import { PipeGenerator } from './PipeGenerator.js';
import { CoinSystem } from './CoinSystem.js';
import { CollisionDetector } from './CollisionDetector.js';
import { ScoreManager } from './ScoreManager.js';
import { ParallaxLayer } from './ParallaxLayer.js';
import { GameOverScreen } from './GameOverScreen.js';

export class GameEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.state = GameState.LOADING;
    this.lastTimestamp = 0;
    this.animFrameId = null;

    this.assetLoader = new AssetLoader(ASSET_MANIFEST);
    this.inputHandler = new InputHandler(this.canvas);
    this.player = null;
    this.pipeGenerator = new PipeGenerator(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT, CONFIG.PIPE_GAP);
    this.coinSystem = new CoinSystem(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    this.scoreManager = new ScoreManager();
    this.parallax = new ParallaxLayer();
    this.gameOverScreen = new GameOverScreen();
  }

  async init() {
    try {
      await this.assetLoader.loadAll();
    } catch (e) {
      console.error('Asset loading failed:', e);
    }

    const sprites = {
      idle: this.assetLoader.getImage('hermes_idle'),
      jump: this.assetLoader.getImage('hermes_jump'),
      fall: this.assetLoader.getImage('hermes_fall')
    };
    const startX = 80;
    const startY = CONFIG.CANVAS_HEIGHT / 2 - CONFIG.PLAYER_HEIGHT / 2;
    this.player = new Player(startX, startY, sprites);

    this.inputHandler.onFlap(() => this.handleFlap());
    this.inputHandler.enable();
    this.state = GameState.READY;
  }

  handleFlap() {
    if (this.state === GameState.READY) {
      this.state = GameState.PLAYING;
      this.player.flap();
      this.playSound('jump');
    } else if (this.state === GameState.PLAYING) {
      this.player.flap();
      this.playSound('jump');
    } else if (this.state === GameState.GAME_OVER) {
      this.reset();
      this.state = GameState.PLAYING;
      this.player.flap();
      this.playSound('jump');
    }
  }

  playSound(key) {
    const audio = this.assetLoader.getAudio(key);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }

  start() {
    this.lastTimestamp = performance.now();
    this.loop(this.lastTimestamp);
  }

  loop(timestamp) {
    let dt = (timestamp - this.lastTimestamp) / 1000;
    dt = Math.min(dt, 1 / 30); // Clamp to max ~33ms
    this.lastTimestamp = timestamp;

    this.update(dt);
    this.render();

    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    this.parallax.update(dt);

    if (this.state !== GameState.PLAYING) return;

    this.player.update(dt);
    this.pipeGenerator.update(dt, CONFIG.SCROLL_SPEED);
    this.coinSystem.update(dt, CONFIG.SCROLL_SPEED, this.pipeGenerator.getActivePipes());
    this.scoreManager.updateDistance(dt, CONFIG.SCROLL_SPEED);

    // Collision detection
    const pipes = this.pipeGenerator.getActivePipes();
    const coins = this.coinSystem.getActiveCoins();

    if (CollisionDetector.checkPlayerPipes(this.player, pipes) ||
        CollisionDetector.checkFloor(this.player, CONFIG.FLOOR_Y)) {
      this.gameOver();
      return;
    }

    const collected = CollisionDetector.checkPlayerCoins(this.player, coins);
    for (const coin of collected) {
      this.coinSystem.collect(coin);
      this.scoreManager.addCoin();
    }
  }

  gameOver() {
    this.state = GameState.GAME_OVER;
    this.scoreManager.checkHighScore();
    this.gameOverScreen.show(this.scoreManager.getScore());
    this.playSound('gameOver');
  }

  render() {
    const ctx = this.ctx;
    // Clear with sky background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Parallax background
    this.parallax.render(ctx);

    // Floor
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, CONFIG.FLOOR_Y, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT - CONFIG.FLOOR_Y);

    if (this.state === GameState.READY) {
      this.renderReadyScreen(ctx);
      return;
    }

    // Gameplay elements
    this.pipeGenerator.render(ctx);
    this.coinSystem.render(ctx);
    this.player.render(ctx);

    // HUD
    this.renderHUD(ctx);

    // Game over overlay
    this.gameOverScreen.render(ctx);
  }

  renderReadyScreen(ctx) {
    const cx = CONFIG.CANVAS_WIDTH / 2;

    // Draw Hermes sprites showcase
    const size = 128;
    const sprites = this.assetLoader;
    const idle = sprites.getImage('hermes_idle');
    const jump = sprites.getImage('hermes_jump');
    const fall = sprites.getImage('hermes_fall');
    const y = 280;
    const gap = 120;
    if (idle) ctx.drawImage(idle, cx - gap - size / 2, y, size, size);
    if (jump) ctx.drawImage(jump, cx - size / 2, y - 20, size, size);
    if (fall) ctx.drawImage(fall, cx + gap - size / 2, y, size, size);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FLAPPY KIRO', cx, 180);

    // Subtitle
    ctx.font = '14px monospace';
    ctx.fillStyle = '#cccccc';
    ctx.fillText('idle          jump          fall', cx, y + size + 25);

    // Start prompt
    ctx.font = '16px monospace';
    ctx.fillStyle = '#ffcc00';
    ctx.fillText('Press SPACE or TAP to start', cx, 480);
    ctx.textAlign = 'left';
  }

  renderHUD(ctx) {
    const score = this.scoreManager.getScore();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`Coins: ${score.coins}`, 10, 30);
    ctx.fillText(`${score.distance.toFixed(1)}m`, 10, 55);
  }

  reset() {
    this.player.reset();
    this.pipeGenerator.reset();
    this.coinSystem.reset();
    this.scoreManager.reset();
    this.parallax.reset();
    this.gameOverScreen.hide();
  }

  stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}
