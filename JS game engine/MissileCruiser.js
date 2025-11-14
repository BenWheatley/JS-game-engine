class MissileCruiser extends NPC {
  static imageUrl = 'missile_ship.png';
  static size = new Vector2D(72, 92); // 2x sprite asset size (36x46)
  static health = 200;
  static forwardAcceleration = 0.0004; // Slower than AlienScout
  static maxSpeed = 0.04; // Slower than AlienScout
  static rotationalSpeed = Math.PI / 1500; // Slower rotation than AlienScout
  static shotCooldown = 4000; // 4 seconds between missile launches

  constructor(playerPosition, canvasWidth, canvasHeight) {
    // Calculate spawn position (2x bounding box offscreen)
    const margin = MissileCruiser.size.x * GameConfig.SHARED.SPAWN_MARGIN_MULTIPLIER;
    const position = MissileCruiser.getRandomSpawnPosition(
      canvasWidth,
      canvasHeight,
      margin,
      playerPosition
    );

    super(position);
    // Override sprite with correct image
    this.sprite = new Sprite(MissileCruiser.imageUrl, position, MissileCruiser.size);
    this.sprite.rotation = 0;
    this.velocity = new Vector2D(0, 0); // Start with zero velocity
    this.health = MissileCruiser.health;

    // AI state machine
    this.targetPosition = null;
    this.offScreenTime = 0;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // Shooting state
    this.lastShotTime = Date.now();
    this.missiles = []; // Track missiles fired by this cruiser

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
    const distance = Math.random() * screenRadius * GameConfig.NPC.TARGET_AREA_FACTOR;

    this.targetPosition = new Vector2D(
      playerPosition.x + Math.cos(angle) * distance,
      playerPosition.y + Math.sin(angle) * distance
    );
  }

  hasReachedTarget() {
    if (!this.targetPosition) return false;
    const distance = this.sprite.position.dist(this.targetPosition);
    return distance < GameConfig.NPC.ARRIVAL_THRESHOLD;
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
    const accelerationVector = Vector2D.fromRadial(this.sprite.rotation, 1).mul(MissileCruiser.forwardAcceleration);
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
    if (Math.abs(angleDiff) > GameConfig.NPC.TURN_PRECISION) {
      if (angleDiff > 0) {
        this.sprite.rotation += Math.min(MissileCruiser.rotationalSpeed * deltaTime, angleDiff);
      } else {
        this.sprite.rotation -= Math.min(MissileCruiser.rotationalSpeed * deltaTime, -angleDiff);
      }
    }
  }

  clampSpeed() {
    const speed = this.velocity.mag();
    if (speed > MissileCruiser.maxSpeed) {
      this.velocity = this.velocity.norm().mul(MissileCruiser.maxSpeed);
    }
  }

  tryShoot() {
    const now = Date.now();
    if (now - this.lastShotTime > MissileCruiser.shotCooldown) {
      this.lastShotTime = now;

      // Fire missile directly forward
      const missileVelocity = Vector2D.fromRadial(this.sprite.rotation, Missile.speed);
      const newMissile = new Missile(
        new Vector2D(
          this.sprite.position.x,
          this.sprite.position.y
        ),
        missileVelocity
      );

      return newMissile;
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
      if (this.offScreenTime > GameConfig.NPC.OFFSCREEN_TIMEOUT) {
        this.pickNewTarget(playerPosition);
        this.offScreenTime = 0;
      }
    } else {
      this.offScreenTime = 0;
    }

    // AI: Turn towards target and accelerate
    if (this.targetPosition) {
      const toTarget = this.targetPosition.sub(this.sprite.position);
      const targetAngle = Math.atan2(toTarget.y, toTarget.x) + GameConfig.SHARED.SPRITE_UP_ANGLE_OFFSET;

      this.turnTowards(targetAngle, deltaTime);
      this.accelerate(deltaTime);
    }

    // Update position
    super.update(deltaTime);
  }
}
