import { Sprite } from './VibeEngine/VibeEngine.js';

class GameEntity {
  constructor(position, rotation, velocity, size, imageUrl) {
    this.sprite = new Sprite(imageUrl, position, size);
    this.sprite.rotation = rotation;
    this.velocity = velocity;
  }

  draw() {
    this.sprite.draw();
  }

  update(deltaTime) {
    // Update the entity's position based on the velocity and time
    const displacement = this.velocity.mul(deltaTime);
    this.sprite.position = this.sprite.position.add(displacement);
  }

  /**
   * Handle being hit by damage
   * Override in subclasses for custom behavior
   * @param {number} damage - Amount of damage taken
   * @returns {Object} Hit result with {destroyed, sound, volume, spawns, particleColor}
   */
  onHit(damage) {
    // Default behavior: single-hit entity
    return {
      destroyed: true,
      sound: null,
      volume: 0,
      spawns: null,
      particleColor: null
    };
  }

  /**
   * Handle collision with player
   * Override in subclasses for custom behavior
   * @returns {Object} Collision result with {damage, sound, volume, particleColor}
   */
  onCollideWithPlayer() {
    // Default behavior: use health as damage if available, otherwise 0
    return {
      damage: this.health || 0,
      sound: 'hit',
      volume: 0.6,
      particleColor: null
    };
  }

  /**
   * Get minimap display information for rendering
   * Override in subclasses for custom minimap appearance
   * @returns {Object} { color: string|null, radius: number } - null color means don't render
   */
  getMinimapInfo() {
    return {
      color: null,
      radius: 0
    };
  }
}

export { GameEntity };
