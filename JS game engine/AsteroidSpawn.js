class AsteroidSpawn extends GameEntity {
  static imageUrl = 'asteroid-medium.png';
  static size = new Vector2D(27, 26);
  static health = 1;

  constructor(position, velocity, canvasWidth, canvasHeight) {
    super(position, 0, velocity, AsteroidSpawn.size, AsteroidSpawn.imageUrl);
    this.health = AsteroidSpawn.health;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  shouldDespawn(playerPosition, screenSize) {
    const distance = this.sprite.position.dist(playerPosition);
    const despawnDistance = Math.max(screenSize.x, screenSize.y) * GameConfig.SHARED.DESPAWN_DISTANCE_MULTIPLIER;
    return distance > despawnDistance;
  }

  update(deltaTime) {
    super.update(deltaTime);
    // Add rotation for visual effect (faster than parent asteroid)
    this.sprite.rotation += GameConfig.ASTEROID.ROTATION_SPEED_SMALL;
  }

  // Static method to create spawns from a destroyed asteroid
  static createSpawnsFromAsteroid(asteroid, canvasWidth, canvasHeight) {
    const spawns = [];
    const originalVelocity = asteroid.velocity;
    const position = asteroid.sprite.position;

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

    // Create spawns at slightly offset positions
    const offset = GameConfig.ASTEROID.SPAWN_OFFSET_DISTANCE;
    spawns.push(new AsteroidSpawn(
      new Vector2D(position.x + Math.cos(angle1) * offset, position.y + Math.sin(angle1) * offset),
      v1,
      canvasWidth,
      canvasHeight
    ));
    spawns.push(new AsteroidSpawn(
      new Vector2D(position.x + Math.cos(angle2) * offset, position.y + Math.sin(angle2) * offset),
      v2,
      canvasWidth,
      canvasHeight
    ));
    spawns.push(new AsteroidSpawn(
      new Vector2D(position.x + Math.cos(angle1 + Math.PI) * offset, position.y + Math.sin(angle1 + Math.PI) * offset),
      v3,
      canvasWidth,
      canvasHeight
    ));

    return spawns;
  }
}
