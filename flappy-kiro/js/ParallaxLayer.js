/**
 * Flappy Kiro - Parallax Layer
 * Multiple cloud layers at different depths for background scrolling.
 */

import { CONFIG } from './config.js';

class Cloud {
  constructor(x, y, width, height, opacity) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.opacity = opacity;
  }
}

export class ParallaxLayer {
  constructor() {
    this.layers = [
      { depth: 3, speed: 15, clouds: [] },
      { depth: 2, speed: 35, clouds: [] },
      { depth: 1, speed: 60, clouds: [] }
    ];
    this.init();
  }

  init() {
    for (const layer of this.layers) {
      const count = 3 + layer.depth;
      const opacity = 0.2 + (3 - layer.depth) * 0.15;
      for (let i = 0; i < count; i++) {
        const w = 60 + layer.depth * 20 + Math.random() * 40;
        const h = 20 + layer.depth * 8 + Math.random() * 15;
        const x = (CONFIG.CANVAS_WIDTH / count) * i + Math.random() * 50;
        const y = 20 + Math.random() * (CONFIG.CANVAS_HEIGHT * 0.4);
        layer.clouds.push(new Cloud(x, y, w, h, opacity));
      }
    }
  }

  update(dt) {
    for (const layer of this.layers) {
      for (const cloud of layer.clouds) {
        cloud.x -= layer.speed * dt;
        if (cloud.x + cloud.width < 0) {
          cloud.x = CONFIG.CANVAS_WIDTH + Math.random() * 50;
          cloud.y = 20 + Math.random() * (CONFIG.CANVAS_HEIGHT * 0.4);
        }
      }
    }
  }

  render(ctx) {
    for (const layer of this.layers) {
      for (const cloud of layer.clouds) {
        ctx.globalAlpha = cloud.opacity;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(
          cloud.x + cloud.width / 2,
          cloud.y + cloud.height / 2,
          cloud.width / 2,
          cloud.height / 2,
          0, 0, Math.PI * 2
        );
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  reset() {
    for (const layer of this.layers) {
      layer.clouds.length = 0;
    }
    this.init();
  }

  getLayers() {
    return this.layers;
  }
}
