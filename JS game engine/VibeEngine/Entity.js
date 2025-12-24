import { Sprite } from './Sprite.js';

/**
 * Entity - Base class for all game objects with sprites and physics
 *
 * Core responsibilities:
 * - Sprite management (visual representation)
 * - Velocity-based movement
 * - Basic update/render loop
 *
 * Usage:
 * Extend this class for game-specific entities and add custom behavior
 * (health, damage, AI, collision responses, etc.)
 */
class Entity {
  /**
   * Create a new entity
   * @param {Vector2D} position - Initial position in world space
   * @param {number} rotation - Initial rotation in radians
   * @param {Vector2D} velocity - Movement velocity (units per millisecond)
   * @param {Vector2D} size - Sprite dimensions
   * @param {string} imageUrl - Path to sprite image
   */
  constructor(position, rotation, velocity, size, imageUrl) {
    this.sprite = new Sprite(imageUrl, position, size);
    this.sprite.rotation = rotation;
    this.velocity = velocity;
  }

  /**
   * Render the entity's sprite
   * Override this method to add custom rendering (health bars, effects, etc.)
   */
  draw() {
    this.sprite.draw();
  }

  /**
   * Update entity position based on velocity
   * Override this method to add custom update logic (AI, animations, etc.)
   * @param {number} deltaTime - Time elapsed since last update (milliseconds)
   */
  update(deltaTime) {
    // Update position based on velocity and time
    const displacement = this.velocity.mul(deltaTime);
    this.sprite.position = this.sprite.position.add(displacement);
  }
}

export { Entity };
