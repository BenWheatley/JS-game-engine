import { Sprite } from './Sprite.js';

class Projectile {
  constructor(position, velocity, imageUrl, size, damage) {
    this.sprite = new Sprite(imageUrl, position, size);
    this.velocity = velocity;
    this.damage = damage; // Damage dealt on hit (needed for different projectile types)
    // Set rotation to face direction of travel (+PI/2 because sprite faces up at 0 rotation)
    this.sprite.rotation = Math.atan2(velocity.y, velocity.x) + Math.PI / 2;
  }

  update() {
    this.sprite.position = this.sprite.position.add(this.velocity);
  }

  draw() {
    this.sprite.draw();
  }

  /**
   * Called when this projectile hits the player
   * @returns {Object} { damage, sound, volume, particleColor }
   */
  onHitPlayer() {
    return {
      damage: 0,
      sound: null,
      volume: 0,
      particleColor: null
    };
  }
}

export { Projectile };
