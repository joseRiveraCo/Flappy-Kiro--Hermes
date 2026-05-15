/**
 * Flappy Kiro - Input Handler
 * Captures keyboard and touch events, exposes a clean flap interface.
 * Listens for: spacebar keydown, canvas touchstart, canvas click.
 */

export class InputHandler {
  /**
   * @param {HTMLCanvasElement} canvas - The game canvas element for touch/click events
   * @param {EventTarget} [keyTarget] - The event target for keyboard events (defaults to document)
   */
  constructor(canvas, keyTarget) {
    this._canvas = canvas;
    this._keyTarget = keyTarget || (typeof document !== 'undefined' ? document : null);
    this._enabled = false;
    this._listeners = [];

    // Bind handlers so we can add/remove them
    this._handleKeydown = this._handleKeydown.bind(this);
    this._handleTouchstart = this._handleTouchstart.bind(this);
    this._handleClick = this._handleClick.bind(this);
  }

  /**
   * Register a flap listener callback.
   * @param {Function} callback - Called when a flap input is detected
   */
  onFlap(callback) {
    this._listeners.push(callback);
  }

  /**
   * Start listening for input events.
   */
  enable() {
    if (this._enabled) return;
    this._enabled = true;

    if (this._keyTarget) {
      this._keyTarget.addEventListener('keydown', this._handleKeydown);
    }
    this._canvas.addEventListener('touchstart', this._handleTouchstart);
    this._canvas.addEventListener('click', this._handleClick);
  }

  /**
   * Stop listening for input events (e.g., on game over).
   */
  disable() {
    if (!this._enabled) return;
    this._enabled = false;

    if (this._keyTarget) {
      this._keyTarget.removeEventListener('keydown', this._handleKeydown);
    }
    this._canvas.removeEventListener('touchstart', this._handleTouchstart);
    this._canvas.removeEventListener('click', this._handleClick);
  }

  /**
   * Notify all registered flap listeners.
   * Each flap resets velocity to FLAP_VELOCITY regardless of current velocity (no stacking).
   * @private
   */
  _triggerFlap() {
    for (const listener of this._listeners) {
      listener();
    }
  }

  /**
   * Handle keydown events - only respond to spacebar.
   * @param {KeyboardEvent} event
   * @private
   */
  _handleKeydown(event) {
    if (event.code === 'Space' || event.key === ' ') {
      event.preventDefault();
      this._triggerFlap();
    }
  }

  /**
   * Handle touchstart events on the canvas.
   * @param {TouchEvent} event
   * @private
   */
  _handleTouchstart(event) {
    event.preventDefault();
    this._triggerFlap();
  }

  /**
   * Handle click events on the canvas.
   * @param {MouseEvent} event
   * @private
   */
  _handleClick(event) {
    event.preventDefault();
    this._triggerFlap();
  }
}
