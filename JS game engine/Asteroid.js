class Asteroid extends GameEntity {
  constructor(position, playerPosition) {
    const config = GameConfig.ASTEROID_BIG;
    const size = new Vector2D(config.WIDTH, config.HEIGHT);

    // Calculate direction within 90-degree cone toward player
    const direction = Asteroid.getDirectionTowardPlayer(position, playerPosition);
    const velocity = direction.mul(config.SPEED);

    super(position, 0, velocity, size, config.IMAGE_URL);
    this.health = config.HEALTH;
    this.scoreValue = config.SCORE_VALUE;
  }

  static getDirectionTowardPlayer(spawnPosition, playerPosition) {
    // Get vector pointing from spawn to player
    const toPlayer = playerPosition.sub(spawnPosition).norm();

    // Calculate angle to player
    const angleToPlayer = Math.atan2(toPlayer.y, toPlayer.x);

    // Add random offset within 90-degree cone (-45 to +45 degrees)
    const randomOffset = (Math.random() - 0.5) * 2 * GameConfig.ASTEROID.DIRECTION_CONE_HALF_ANGLE;
    const finalAngle = angleToPlayer + randomOffset;

    // Convert back to vector
    return new Vector2D(Math.cos(finalAngle), Math.sin(finalAngle));
  }

  shouldDespawn(playerPosition, screenSize) {
    const distance = this.sprite.position.dist(playerPosition);
    const despawnDistance = Math.max(screenSize.x, screenSize.y) * GameConfig.SHARED.DESPAWN_DISTANCE_MULTIPLIER;
    return distance > despawnDistance;
  }

  onHit(damage) {
    // Multi-hit asteroid that spawns fragments
    this.health -= damage;
    if (this.health <= 0) {
      return {
        destroyed: true,
        sound: GameConfig.ASTEROID_BIG.DESTROYED_SOUND,
        volume: GameConfig.ASTEROID_BIG.DESTROYED_VOLUME,
        spawns: AsteroidSpawn.createSpawnsFromAsteroid(this, this.sprite.position),
        particleColor: GameConfig.ASTEROID_BIG.PARTICLE_COLOR
      };
    } else {
      return {
        destroyed: false,
        sound: GameConfig.ASTEROID_BIG.HIT_SOUND,
        volume: GameConfig.ASTEROID_BIG.HIT_VOLUME,
        spawns: null,
        particleColor: null
      };
    }
  }

  onCollideWithPlayer() {
    return {
      damage: this.health,
      sound: GameConfig.ASTEROID_BIG.COLLISION_SOUND,
      volume: GameConfig.ASTEROID_BIG.COLLISION_VOLUME,
      particleColor: GameConfig.ASTEROID_BIG.PARTICLE_COLOR
    };
  }

  getMinimapInfo() {
    return {
      color: GameConfig.MINIMAP.ASTEROID_COLOR,
      radius: GameConfig.MINIMAP.ENEMY_SIZE_LARGE / 2
    };
  }

  update(deltaTime, playerPosition) {
    // Asteroids ignore playerPosition parameter (accepts it for polymorphism)
    super.update(deltaTime);
    // Add slow rotation for visual effect
    this.sprite.rotation += GameConfig.ASTEROID.ROTATION_SPEED_LARGE;
  }
}
