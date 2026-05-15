import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AssetLoader } from '../../js/AssetLoader.js';

/**
 * Unit tests for AssetLoader
 * Validates: Requirements 9.2
 */

// Mock Image class for Node.js environment
class MockImage {
  constructor() {
    this._src = '';
  }

  get src() {
    return this._src;
  }

  set src(value) {
    this._src = value;
    // Simulate async load - trigger onload on next tick
    if (this._shouldFail) {
      setTimeout(() => this.onerror && this.onerror(), 0);
    } else {
      setTimeout(() => this.onload && this.onload(), 0);
    }
  }
}

// Mock Audio class for Node.js environment
class MockAudio {
  constructor(path) {
    this.path = path;
    this._listeners = {};
    this._shouldFail = false;
  }

  addEventListener(event, handler, options) {
    this._listeners[event] = handler;
  }

  load() {
    if (this._shouldFail) {
      setTimeout(() => this._listeners['error'] && this._listeners['error'](), 0);
    } else {
      setTimeout(() => this._listeners['canplaythrough'] && this._listeners['canplaythrough'](), 0);
    }
  }
}

describe('AssetLoader', () => {
  let originalImage;
  let originalAudio;
  let imageInstances;
  let audioInstances;

  beforeEach(() => {
    imageInstances = [];
    audioInstances = [];

    // Store originals
    originalImage = globalThis.Image;
    originalAudio = globalThis.Audio;

    // Mock Image constructor
    globalThis.Image = class extends MockImage {
      constructor() {
        super();
        imageInstances.push(this);
      }
    };

    // Mock Audio constructor
    globalThis.Audio = class extends MockAudio {
      constructor(path) {
        super(path);
        audioInstances.push(this);
      }
    };
  });

  afterEach(() => {
    globalThis.Image = originalImage;
    globalThis.Audio = originalAudio;
  });

  describe('loadAll()', () => {
    it('resolves when all images load successfully', async () => {
      const manifest = {
        images: {
          hermes_idle: 'assets/hermes_idle.png',
          hermes_jump: 'assets/hermes_jump.png',
          hermes_fall: 'assets/hermes_fall.png'
        },
        audio: {}
      };

      const loader = new AssetLoader(manifest);
      await expect(loader.loadAll()).resolves.toBeUndefined();
    });

    it('rejects with descriptive error when an image fails to load', async () => {
      // Override Image to fail
      globalThis.Image = class extends MockImage {
        constructor() {
          super();
          this._shouldFail = true;
          imageInstances.push(this);
        }
      };

      const manifest = {
        images: {
          broken_sprite: 'assets/nonexistent.png'
        },
        audio: {}
      };

      const loader = new AssetLoader(manifest);
      await expect(loader.loadAll()).rejects.toThrow(
        'Failed to load image asset "broken_sprite" from path: assets/nonexistent.png'
      );
    });

    it('resolves even when audio fails to load (audio failures are non-fatal)', async () => {
      // Override Audio to fail
      globalThis.Audio = class extends MockAudio {
        constructor(path) {
          super(path);
          this._shouldFail = true;
          audioInstances.push(this);
        }
      };

      const manifest = {
        images: {
          hermes_idle: 'assets/hermes_idle.png'
        },
        audio: {
          jump: 'assets/jump.wav',
          gameOver: 'assets/game_over.wav'
        }
      };

      const loader = new AssetLoader(manifest);
      // Should resolve despite audio failures
      await expect(loader.loadAll()).resolves.toBeUndefined();
    });

    it('logs warnings for failed audio assets', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      globalThis.Audio = class extends MockAudio {
        constructor(path) {
          super(path);
          this._shouldFail = true;
          audioInstances.push(this);
        }
      };

      const manifest = {
        images: {},
        audio: {
          jump: 'assets/jump.wav'
        }
      };

      const loader = new AssetLoader(manifest);
      await loader.loadAll();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Audio asset "jump" failed to load')
      );

      warnSpy.mockRestore();
    });
  });

  describe('getImage()', () => {
    it('returns the loaded image after successful load', async () => {
      const manifest = {
        images: {
          hermes_idle: 'assets/hermes_idle.png'
        },
        audio: {}
      };

      const loader = new AssetLoader(manifest);
      await loader.loadAll();

      const img = loader.getImage('hermes_idle');
      expect(img).toBeDefined();
      expect(img).toBeInstanceOf(MockImage);
      expect(img.src).toBe('assets/hermes_idle.png');
    });

    it('returns undefined for unknown keys', () => {
      const manifest = { images: {}, audio: {} };
      const loader = new AssetLoader(manifest);

      expect(loader.getImage('nonexistent')).toBeUndefined();
    });
  });

  describe('getAudio()', () => {
    it('returns the loaded audio after successful load', async () => {
      const manifest = {
        images: {},
        audio: {
          jump: 'assets/jump.wav'
        }
      };

      const loader = new AssetLoader(manifest);
      await loader.loadAll();

      const audio = loader.getAudio('jump');
      expect(audio).toBeDefined();
      expect(audio).toBeInstanceOf(MockAudio);
      expect(audio.path).toBe('assets/jump.wav');
    });

    it('returns undefined for unknown keys', () => {
      const manifest = { images: {}, audio: {} };
      const loader = new AssetLoader(manifest);

      expect(loader.getAudio('nonexistent')).toBeUndefined();
    });
  });
});
