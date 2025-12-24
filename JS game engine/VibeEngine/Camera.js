import { Vector2D } from './Vector2D.js';

/**
 * Camera - Viewport management for 2D games
 *
 * Responsibilities:
 * - Follow a target entity (player, cursor, etc.)
 * - Apply camera transform to canvas context
 * - Convert between world space and screen space coordinates
 *
 * Usage:
 * ```javascript
 * const camera = new Camera(canvas.width, canvas.height);
 * camera.follow(player.sprite.position);
 *
 * // In render loop:
 * camera.apply(context);
 * // ... draw all world-space entities ...
 * camera.restore(context);
 * ```
 */
class Camera {
  /**
   * Create a new camera
   * @param {number} viewportWidth - Canvas width in pixels
   * @param {number} viewportHeight - Canvas height in pixels
   */
  constructor(viewportWidth, viewportHeight) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.target = new Vector2D(0, 0); // What the camera is following
  }

  /**
   * Set the position the camera should center on
   * @param {Vector2D} targetPosition - World position to center camera on
   */
  follow(targetPosition) {
    this.target = targetPosition;
  }

  /**
   * Apply camera transform to canvas context
   * Call this before drawing world-space entities
   * @param {CanvasRenderingContext2D} context - Canvas rendering context
   */
  apply(context) {
    context.save();
    // Translate so that target position appears at center of viewport
    context.translate(
      this.viewportWidth / 2 - this.target.x,
      this.viewportHeight / 2 - this.target.y
    );
  }

  /**
   * Restore canvas context to original state
   * Call this after drawing world-space entities
   * @param {CanvasRenderingContext2D} context - Canvas rendering context
   */
  restore(context) {
    context.restore();
  }

  /**
   * Convert screen coordinates to world coordinates
   * Useful for mouse input, UI positioning, etc.
   * @param {Vector2D} screenPosition - Position in screen space (pixels from top-left)
   * @returns {Vector2D} Position in world space
   */
  screenToWorld(screenPosition) {
    return new Vector2D(
      screenPosition.x - this.viewportWidth / 2 + this.target.x,
      screenPosition.y - this.viewportHeight / 2 + this.target.y
    );
  }

  /**
   * Convert world coordinates to screen coordinates
   * Useful for UI elements, minimap markers, etc.
   * @param {Vector2D} worldPosition - Position in world space
   * @returns {Vector2D} Position in screen space (pixels from top-left)
   */
  worldToScreen(worldPosition) {
    return new Vector2D(
      worldPosition.x - this.target.x + this.viewportWidth / 2,
      worldPosition.y - this.target.y + this.viewportHeight / 2
    );
  }

  /**
   * Get the world-space bounds of what's currently visible
   * Useful for culling off-screen entities
   * @returns {Object} {left, right, top, bottom} in world coordinates
   */
  getVisibleBounds() {
    return {
      left: this.target.x - this.viewportWidth / 2,
      right: this.target.x + this.viewportWidth / 2,
      top: this.target.y - this.viewportHeight / 2,
      bottom: this.target.y + this.viewportHeight / 2
    };
  }
}

export { Camera };
