import { GameEntity } from './GameEntity.js';
import { GameConfig } from './GameConfig.js';
import { Vector2D, DebugLogger } from './VibeEngine/VibeEngine.js';

class AsteroidSpawn extends GameEntity {
  constructor(position, velocity) {
    const config = GameConfig.ASTEROID_SPAWN;
    const size = new Vector2D(config.WIDTH, config.HEIGHT);

    super(position, 0, velocity, size, config.IMAGE_URL);
    this.health = config.HEALTH;
    this.scoreValue = config.SCORE_VALUE;
    DebugLogger.log(`AsteroidSpawn created with health: ${this.health}, config.HEALTH: ${config.HEALTH}`);
  }

  onHit(damage) {
    // Single-hit asteroid fragment
    return {
      destroyed: true,
      sound: GameConfig.ASTEROID_SPAWN.DESTROYED_SOUND,
      volume: GameConfig.ASTEROID_SPAWN.DESTROYED_VOLUME,
      spawns: null,
      particleColor: GameConfig.ASTEROID_SPAWN.PARTICLE_COLOR
    };
  }

  onCollideWithPlayer() {
    return {
      damage: this.health,
      sound: GameConfig.ASTEROID_SPAWN.COLLISION_SOUND,
      volume: GameConfig.ASTEROID_SPAWN.COLLISION_VOLUME,
      particleColor: GameConfig.ASTEROID_SPAWN.PARTICLE_COLOR
    };
  }

  getMinimapInfo() {
    return {
      color: GameConfig.MINIMAP.ASTEROID_COLOR,
      radius: GameConfig.MINIMAP.ENEMY_SIZE_SMALL / 2
    };
  }

  update(deltaTime, playerPosition) {
    // Asteroid spawns ignore playerPosition parameter (accepts it for polymorphism)
    super.update(deltaTime);
    // Add rotation for visual effect (faster than parent asteroid)
    this.sprite.rotation += GameConfig.ASTEROID.ROTATION_SPEED_SMALL;
  }

  // Static method to create spawns from a destroyed asteroid
  static createSpawnsFromAsteroid(asteroid, position) {
    const spawns = [];
    const originalVelocity = asteroid.velocity;

    // Generate random velocities that sum to the original velocity
    // Method: Pick 2 random velocities, the 3rd is determined to maintain sum

    // Generate random unit directions
    const angle1 = Math.random() * Math.PI * 2;
    const angle2 = Math.random() * Math.PI * 2;

    // Random magnitudes (as fractions of original speed)
    const speed = originalVelocity.mag();
    const speedRange = GameConfig.ASTEROID.SPEED_MAX_FACTOR - GameConfig.ASTEROID.SPEED_MIN_FACTOR;
    const speed1 = (Math.random() * speedRange + GameConfig.ASTEROID.SPEED_MIN_FACTOR) * speed;
    const speed2 = (Math.random() * speedRange + GameConfig.ASTEROID.SPEED_MIN_FACTOR) * speed;

    // Create first two velocity vectors
    const v1 = new Vector2D(
      Math.cos(angle1) * speed1,
      Math.sin(angle1) * speed1
    );
    const v2 = new Vector2D(
      Math.cos(angle2) * speed2,
      Math.sin(angle2) * speed2
    );

    // Third velocity ensures sum equals original
    const v3 = originalVelocity.sub(v1).sub(v2);

    // Create spawns at parent asteroid's position (slightly offset)
    const offset = GameConfig.ASTEROID.SPAWN_OFFSET_DISTANCE;
    spawns.push(new AsteroidSpawn(
      new Vector2D(position.x + Math.cos(angle1) * offset, position.y + Math.sin(angle1) * offset),
      v1
    ));
    spawns.push(new AsteroidSpawn(
      new Vector2D(position.x + Math.cos(angle2) * offset, position.y + Math.sin(angle2) * offset),
      v2
    ));
    spawns.push(new AsteroidSpawn(
      new Vector2D(position.x + Math.cos(angle1 + Math.PI) * offset, position.y + Math.sin(angle1 + Math.PI) * offset),
      v3
    ));

    return spawns;
  }
}

export { AsteroidSpawn };
