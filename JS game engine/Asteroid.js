class Asteroid extends GameEntity {
  static imageUrl = 'asteroid-big.png';
  static size = new Vector2D(52, 52);
  static health = 3;
  static speed = 0.04; // pixels per millisecond (similar to player max speed)

  constructor(playerPosition, canvasWidth, canvasHeight) {
    // Calculate spawn position (2x bounding box offscreen)
    const margin = Asteroid.size.x * GameConfig.SHARED.SPAWN_MARGIN_MULTIPLIER;
    const position = Asteroid.getRandomSpawnPosition(
      canvasWidth,
      canvasHeight,
      margin,
      playerPosition
    );

    // Calculate direction within 90-degree cone toward player
    const direction = Asteroid.getDirectionTowardPlayer(position, playerPosition);
    const velocity = direction.mul(Asteroid.speed);

    super(position, 0, velocity, Asteroid.size, Asteroid.imageUrl);
    this.health = Asteroid.health;
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

  update(deltaTime) {
    super.update(deltaTime);
    // Add slow rotation for visual effect
    this.sprite.rotation += GameConfig.ASTEROID.ROTATION_SPEED_LARGE;
  }
}
