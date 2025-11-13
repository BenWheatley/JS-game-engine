class AlienScout extends NPC {
  static imageUrl = 'alien-ship.png';
  static size = new Vector2D(50, 50);
  static health = 100;
  static speed = 0.05; // pixels per millisecond

  constructor(playerPosition, canvasWidth, canvasHeight) {
    // Calculate spawn position (2x bounding box offscreen)
    const margin = AlienScout.size.x * 2;
    const position = AlienScout.getRandomSpawnPosition(
      canvasWidth,
      canvasHeight,
      margin,
      playerPosition
    );

    // Calculate direction within 90-degree cone toward player
    const direction = AlienScout.getDirectionTowardPlayer(position, playerPosition);
    const velocity = direction.mul(AlienScout.speed);

    super(position);
    this.velocity = velocity;
    this.health = AlienScout.health;
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
    const coneHalfAngle = Math.PI / 4; // 45 degrees
    const randomOffset = (Math.random() - 0.5) * 2 * coneHalfAngle;
    const finalAngle = angleToPlayer + randomOffset;

    // Convert back to vector
    return new Vector2D(Math.cos(finalAngle), Math.sin(finalAngle));
  }

  update(deltaTime) {
    super.update(deltaTime);
    // Rotate to face direction of travel
    this.sprite.rotation = Math.atan2(this.velocity.y, this.velocity.x) + Math.PI / 2;
  }
}
