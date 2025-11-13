class AlienFighter extends NPC {
  static imageUrl = 'alien-fighter.png';
  static size = new Vector2D(50, 50);
  static health = 100;
  static forwardAcceleration = 0.0016; // 2x AlienScout
  static maxSpeed = 0.10; // 2x AlienScout
  static rotationalSpeed = Math.PI / 600; // 2x AlienScout
  static shotCooldown = 2000; // 2 seconds between shots

  constructor(playerPosition, canvasWidth, canvasHeight) {
    // Calculate spawn position (2x bounding box offscreen)
    const margin = AlienFighter.size.x * 2;
    const position = AlienFighter.getRandomSpawnPosition(
      canvasWidth,
      canvasHeight,
      margin,
      playerPosition
    );

    super(position);
    // Override sprite with correct image
    this.sprite = new Sprite(AlienFighter.imageUrl, position, AlienFighter.size);
    this.sprite.rotation = 0;
    this.velocity = new Vector2D(0, 0); // Start with zero velocity
    this.health = AlienFighter.health;

    // AI state machine
    this.targetPosition = null;
    this.offScreenTime = 0;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // Shooting state
    this.lastShotTime = Date.now();
    this.shots = []; // Track shots fired by this fighter

    // Pick initial target
    this.pickNewTarget(playerPosition);
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

  pickNewTarget(playerPosition) {
    // Pick a random location near the player (within screen bounds if player doesn't move)
    const screenRadius = Math.min(this.canvasWidth, this.canvasHeight) / 2;
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * screenRadius * 0.8; // Stay mostly on-screen

    this.targetPosition = new Vector2D(
      playerPosition.x + Math.cos(angle) * distance,
      playerPosition.y + Math.sin(angle) * distance
    );
  }

  hasReachedTarget() {
    if (!this.targetPosition) return false;
    const distance = this.sprite.position.dist(this.targetPosition);
    return distance < 50; // Within 50 pixels
  }

  isOffScreen(playerPosition) {
    const screenHalfWidth = this.canvasWidth / 2;
    const screenHalfHeight = this.canvasHeight / 2;

    const relativeX = this.sprite.position.x - playerPosition.x;
    const relativeY = this.sprite.position.y - playerPosition.y;

    return (
      Math.abs(relativeX) > screenHalfWidth ||
      Math.abs(relativeY) > screenHalfHeight
    );
  }

  accelerate(deltaTime) {
    const accelerationVector = Vector2D.fromRadial(this.sprite.rotation, 1).mul(AlienFighter.forwardAcceleration);
    const velocityChange = accelerationVector.mul(deltaTime);
    this.velocity = this.velocity.add(velocityChange);
    this.clampSpeed();
  }

  turnTowards(targetAngle, deltaTime) {
    // Normalize angles to -PI to PI range
    let angleDiff = targetAngle - this.sprite.rotation;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    // Turn in the direction of smallest angle difference
    if (Math.abs(angleDiff) > 0.01) {
      if (angleDiff > 0) {
        this.sprite.rotation += Math.min(AlienFighter.rotationalSpeed * deltaTime, angleDiff);
      } else {
        this.sprite.rotation -= Math.min(AlienFighter.rotationalSpeed * deltaTime, -angleDiff);
      }
    }
  }

  clampSpeed() {
    const speed = this.velocity.mag();
    if (speed > AlienFighter.maxSpeed) {
      this.velocity = this.velocity.norm().mul(AlienFighter.maxSpeed);
    }
  }

  tryShoot() {
    const now = Date.now();
    if (now - this.lastShotTime > AlienFighter.shotCooldown) {
      this.lastShotTime = now;

      // Fire shot directly forward
      const shotVelocity = Vector2D.fromRadial(this.sprite.rotation, Shot.speed);
      const newShot = new Shot(
        new Vector2D(
          this.sprite.position.x,
          this.sprite.position.y
        ),
        shotVelocity
      );

      return newShot;
    }
    return null;
  }

  update(deltaTime, playerPosition) {
    // Check if we need a new target
    if (this.hasReachedTarget()) {
      this.pickNewTarget(playerPosition);
    }

    // Track off-screen time
    if (this.isOffScreen(playerPosition)) {
      this.offScreenTime += deltaTime;
      if (this.offScreenTime > 2000) { // 2 seconds
        this.pickNewTarget(playerPosition);
        this.offScreenTime = 0;
      }
    } else {
      this.offScreenTime = 0;
    }

    // AI: Turn towards target and accelerate
    if (this.targetPosition) {
      const toTarget = this.targetPosition.sub(this.sprite.position);
      const targetAngle = Math.atan2(toTarget.y, toTarget.x) + Math.PI / 2; // +90 degrees because sprite faces up at 0

      this.turnTowards(targetAngle, deltaTime);
      this.accelerate(deltaTime);
    }

    // Update position
    super.update(deltaTime);
  }
}
