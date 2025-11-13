class AsteroidSpawn extends GameEntity {
  static imageUrl = 'asteroid-2.png';
  static size = new Vector2D(30, 30); // Half the size of original asteroid
  static health = 1;

  constructor(position, velocity, canvasWidth, canvasHeight) {
    super(position, 0, velocity, AsteroidSpawn.size, AsteroidSpawn.imageUrl);
    this.health = AsteroidSpawn.health;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  shouldDespawn(playerPosition, screenSize) {
    const distance = this.sprite.position.dist(playerPosition);
    const despawnDistance = Math.max(screenSize.x, screenSize.y) * 3;
    return distance > despawnDistance;
  }

  update(deltaTime) {
    super.update(deltaTime);
    // Add rotation for visual effect (faster than parent asteroid)
    this.sprite.rotation += 0.02;
  }

  // Static method to create 3 spawns from a destroyed asteroid
  static createSpawnsFromAsteroid(asteroid, canvasWidth, canvasHeight) {
    const spawns = [];
    const originalVelocity = asteroid.velocity;
    const position = asteroid.sprite.position;

    // Generate 3 random velocities that sum to the original velocity
    // Method: Pick 2 random velocities, the 3rd is determined to maintain sum

    // Generate random unit directions
    const angle1 = Math.random() * Math.PI * 2;
    const angle2 = Math.random() * Math.PI * 2;

    // Random magnitudes (as fractions of original speed)
    const speed = originalVelocity.mag();
    const speed1 = (Math.random() * 0.5 + 0.3) * speed; // 30-80% of original
    const speed2 = (Math.random() * 0.5 + 0.3) * speed; // 30-80% of original

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

    // Create 3 spawns at slightly offset positions
    const offsetDistance = 20;
    spawns.push(new AsteroidSpawn(
      new Vector2D(position.x + Math.cos(angle1) * offsetDistance, position.y + Math.sin(angle1) * offsetDistance),
      v1,
      canvasWidth,
      canvasHeight
    ));
    spawns.push(new AsteroidSpawn(
      new Vector2D(position.x + Math.cos(angle2) * offsetDistance, position.y + Math.sin(angle2) * offsetDistance),
      v2,
      canvasWidth,
      canvasHeight
    ));
    spawns.push(new AsteroidSpawn(
      new Vector2D(position.x + Math.cos(angle1 + Math.PI) * offsetDistance, position.y + Math.sin(angle1 + Math.PI) * offsetDistance),
      v3,
      canvasWidth,
      canvasHeight
    ));

    return spawns;
  }
}
