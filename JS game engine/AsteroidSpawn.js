class AsteroidSpawn extends GameEntity {
  static imageUrl = 'asteroid-medium.png';
  static size = new Vector2D(27, 26);
  static health = 1;

  // Behavior constants
  static DESPAWN_DISTANCE_MULTIPLIER = 3; // Distance from player before despawning
  static ROTATION_SPEED = 0.02; // Radians per frame (faster than parent asteroid)
  static NUM_SPAWNS = 3; // Number of fragments created from destroyed asteroid
  static SPAWN_OFFSET_DISTANCE = 20; // Pixels to offset spawns from parent position
  static SPEED_MIN_FACTOR = 0.3; // Minimum speed as fraction of parent (30%)
  static SPEED_MAX_FACTOR = 0.8; // Maximum speed as fraction of parent (80%)

  constructor(position, velocity, canvasWidth, canvasHeight) {
    super(position, 0, velocity, AsteroidSpawn.size, AsteroidSpawn.imageUrl);
    this.health = AsteroidSpawn.health;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  shouldDespawn(playerPosition, screenSize) {
    const distance = this.sprite.position.dist(playerPosition);
    const despawnDistance = Math.max(screenSize.x, screenSize.y) * AsteroidSpawn.DESPAWN_DISTANCE_MULTIPLIER;
    return distance > despawnDistance;
  }

  update(deltaTime) {
    super.update(deltaTime);
    // Add rotation for visual effect (faster than parent asteroid)
    this.sprite.rotation += AsteroidSpawn.ROTATION_SPEED;
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
    const speedRange = AsteroidSpawn.SPEED_MAX_FACTOR - AsteroidSpawn.SPEED_MIN_FACTOR;
    const speed1 = (Math.random() * speedRange + AsteroidSpawn.SPEED_MIN_FACTOR) * speed;
    const speed2 = (Math.random() * speedRange + AsteroidSpawn.SPEED_MIN_FACTOR) * speed;

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
    spawns.push(new AsteroidSpawn(
      new Vector2D(position.x + Math.cos(angle1) * AsteroidSpawn.SPAWN_OFFSET_DISTANCE, position.y + Math.sin(angle1) * AsteroidSpawn.SPAWN_OFFSET_DISTANCE),
      v1,
      canvasWidth,
      canvasHeight
    ));
    spawns.push(new AsteroidSpawn(
      new Vector2D(position.x + Math.cos(angle2) * AsteroidSpawn.SPAWN_OFFSET_DISTANCE, position.y + Math.sin(angle2) * AsteroidSpawn.SPAWN_OFFSET_DISTANCE),
      v2,
      canvasWidth,
      canvasHeight
    ));
    spawns.push(new AsteroidSpawn(
      new Vector2D(position.x + Math.cos(angle1 + Math.PI) * AsteroidSpawn.SPAWN_OFFSET_DISTANCE, position.y + Math.sin(angle1 + Math.PI) * AsteroidSpawn.SPAWN_OFFSET_DISTANCE),
      v3,
      canvasWidth,
      canvasHeight
    ));

    return spawns;
  }
}
