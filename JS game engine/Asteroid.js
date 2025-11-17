class Asteroid extends GameEntity {
  constructor(playerPosition, canvasWidth, canvasHeight) {
    const config = GameConfig.ASTEROID_BIG;
    const size = new Vector2D(config.WIDTH, config.HEIGHT);

    // Calculate spawn position (2x bounding box offscreen)
    const margin = size.x * GameConfig.SHARED.SPAWN_MARGIN_MULTIPLIER;
    const position = Asteroid.getRandomSpawnPosition(
      canvasWidth,
      canvasHeight,
      margin,
      playerPosition
    );

    // Calculate direction within 90-degree cone toward player
    const direction = Asteroid.getDirectionTowardPlayer(position, playerPosition);
    const velocity = direction.mul(config.SPEED);

    super(position, 0, velocity, size, config.IMAGE_URL);
    this.health = config.HEALTH;
    this.scoreValue = config.SCORE_VALUE;
  }

  static getRandomSpawnPosition(canvasWidth, canvasHeight, margin, playerPosition) {
    // Choose random edge (0=top, 1=right, 2=bottom, 3=left)
    const edge = Math.floor(Math.random() * 4);
    let x, y;

    switch(edge) {
      case 0: // Top
        x = playerPosition.x - canvasWidth/2 + Math.random() * canvasWidth;
        y = playerPosition.y - canvasHeight/2 - margin;
        break;
      case 1: // Right
        x = playerPosition.x + canvasWidth/2 + margin;
        y = playerPosition.y - canvasHeight/2 + Math.random() * canvasHeight;
        break;
      case 2: // Bottom
        x = playerPosition.x - canvasWidth/2 + Math.random() * canvasWidth;
        y = playerPosition.y + canvasHeight/2 + margin;
        break;
      case 3: // Left
        x = playerPosition.x - canvasWidth/2 - margin;
        y = playerPosition.y - canvasHeight/2 + Math.random() * canvasHeight;
        break;
    }

    return new Vector2D(x, y);
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
        spawns: AsteroidSpawn.createSpawnsFromAsteroid(this, this.canvasWidth, this.canvasHeight),
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
      type: 'asteroid',
      size: 'large'
    };
  }

  update(deltaTime, playerPosition) {
    // Asteroids ignore playerPosition parameter (accepts it for polymorphism)
    super.update(deltaTime);
    // Add slow rotation for visual effect
    this.sprite.rotation += GameConfig.ASTEROID.ROTATION_SPEED_LARGE;
  }
}
