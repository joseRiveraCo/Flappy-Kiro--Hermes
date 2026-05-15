/**
 * Flappy Kiro - Asset Loader
 * Preloads all images and audio before game start.
 * Audio failures are non-fatal: the game continues without sound.
 */

export class AssetLoader {
  /**
   * @param {Object} manifest - Asset manifest with images and audio paths
   * @param {Object} manifest.images - Map of key → image path
   * @param {Object} manifest.audio - Map of key → audio path
   */
  constructor(manifest) {
    this.manifest = manifest;
    this.images = new Map();
    this.audio = new Map();
  }

  /**
   * Load all assets defined in the manifest.
   * Image failures are fatal (rejects the promise).
   * Audio failures are non-fatal (logged as warnings, game continues without sound).
   * @returns {Promise<void>} Resolves when all images are loaded (audio best-effort)
   */
  loadAll() {
    const imagePromises = Object.entries(this.manifest.images || {}).map(
      ([key, path]) => this._loadImage(key, path)
    );

    const audioPromises = Object.entries(this.manifest.audio || {}).map(
      ([key, path]) => this._loadAudio(key, path)
    );

    return Promise.all([
      Promise.all(imagePromises),
      Promise.allSettled(audioPromises)
    ]).then(([, audioResults]) => {
      // Log any audio failures as warnings (non-fatal)
      audioResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          const key = Object.keys(this.manifest.audio || {})[index];
          console.warn(`Audio asset "${key}" failed to load: ${result.reason}. Game will continue without this sound.`);
        }
      });
    });
  }

  /**
   * Retrieve a loaded image by key.
   * @param {string} key - The image key from the manifest
   * @returns {HTMLImageElement|undefined} The loaded image or undefined if not found
   */
  getImage(key) {
    return this.images.get(key);
  }

  /**
   * Retrieve a loaded audio by key.
   * @param {string} key - The audio key from the manifest
   * @returns {HTMLAudioElement|undefined} The loaded audio or undefined if not found
   */
  getAudio(key) {
    return this.audio.get(key);
  }

  /**
   * Load a single image asset.
   * @param {string} key - The image key
   * @param {string} path - The image file path
   * @returns {Promise<void>} Rejects with descriptive error if loading fails
   * @private
   */
  _loadImage(key, path) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(key, img);
        resolve();
      };
      img.onerror = () => {
        reject(new Error(`Failed to load image asset "${key}" from path: ${path}`));
      };
      img.src = path;
    });
  }

  /**
   * Load a single audio asset.
   * @param {string} key - The audio key
   * @param {string} path - The audio file path
   * @returns {Promise<void>} Rejects if loading fails (handled as non-fatal by loadAll)
   * @private
   */
  _loadAudio(key, path) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(path);
      audio.addEventListener('canplaythrough', () => {
        this.audio.set(key, audio);
        resolve();
      }, { once: true });
      audio.addEventListener('error', () => {
        reject(new Error(`Failed to load audio asset "${key}" from path: ${path}`));
      }, { once: true });
      audio.load();
    });
  }
}
