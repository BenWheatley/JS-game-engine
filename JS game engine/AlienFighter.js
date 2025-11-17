class AlienFighter extends NPC {
  constructor(position, playerPosition, canvasWidth, canvasHeight) {
    const config = GameConfig.ALIEN_FIGHTER;
    const size = new Vector2D(config.WIDTH, config.HEIGHT);

    super(position);
    // Override sprite with correct image
    this.sprite = new Sprite(config.IMAGE_URL, position, size);
    this.sprite.rotation = 0;
    this.velocity = new Vector2D(0, 0); // Start with zero velocity
    this.health = config.HEALTH;
    this.scoreValue = config.SCORE_VALUE;

    // AI state machine
    this.targetPosition = null;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // Shooting state (uses game time, not wall-clock time)
    this.lastShotTime = 0;
    this.shots = []; // Track shots fired by this fighter

    // Pick initial target
    this.pickNewTarget(playerPosition);
  }

  hasReachedTarget() {
    return NPCAIUtils.hasReachedTarget(this.sprite.position, this.targetPosition);
  }

  accelerate(deltaTime) {
    const accelerationVector = Vector2D.fromRadial(this.sprite.rotation, 1).mul(GameConfig.ALIEN_FIGHTER.FORWARD_ACCELERATION);
    const velocityChange = accelerationVector.mul(deltaTime);
    this.velocity = this.velocity.add(velocityChange);
    this.clampSpeed();
  }

  turnTowards(targetAngle, deltaTime) {
    // Calculate normalized angle difference using Vector2D utility
    const angleDiff = Vector2D.normalizeAngleDiff(targetAngle, this.sprite.rotation);

    // Turn in the direction of smallest angle difference
    if (Math.abs(angleDiff) > GameConfig.NPC.TURN_PRECISION) {
      if (angleDiff > 0) {
        this.sprite.rotation += Math.min(GameConfig.ALIEN_FIGHTER.ROTATIONAL_SPEED * deltaTime, angleDiff);
      } else {
        this.sprite.rotation -= Math.min(GameConfig.ALIEN_FIGHTER.ROTATIONAL_SPEED * deltaTime, -angleDiff);
      }
    }
  }

  clampSpeed() {
    const speed = this.velocity.mag();
    if (speed > GameConfig.ALIEN_FIGHTER.MAX_SPEED) {
      this.velocity = this.velocity.norm().mul(GameConfig.ALIEN_FIGHTER.MAX_SPEED);
    }
  }

  onHit(damage) {
    // Single-hit enemy
    return {
      destroyed: true,
      sound: GameConfig.ALIEN_FIGHTER.DESTROYED_SOUND,
      volume: GameConfig.ALIEN_FIGHTER.DESTROYED_VOLUME,
      spawns: null,
      particleColor: GameConfig.ALIEN_FIGHTER.PARTICLE_COLOR
    };
  }

  onCollideWithPlayer() {
    return {
      damage: this.health,
      sound: GameConfig.ALIEN_FIGHTER.COLLISION_SOUND,
      volume: GameConfig.ALIEN_FIGHTER.COLLISION_VOLUME,
      particleColor: GameConfig.ALIEN_FIGHTER.PARTICLE_COLOR
    };
  }

  tryShoot(gameTime) {
    if (gameTime - this.lastShotTime > GameConfig.ALIEN_FIGHTER.SHOT_COOLDOWN) {
      this.lastShotTime = gameTime;

      // Fire shot directly forward
      const shotVelocity = Vector2D.fromRadial(this.sprite.rotation, Plasma.speed);
      const newShot = new Plasma(
        new Vector2D(
          this.sprite.position.x,
          this.sprite.position.y
        ),
        shotVelocity
      );

      return {
        sound: GameConfig.ALIEN_FIGHTER.SHOOT_SOUND,
        volume: GameConfig.ALIEN_FIGHTER.SHOOT_VOLUME,
        shots: [newShot]
      };
    }
    return null;
  }

  update(deltaTime, playerPosition) {
    // Check if we need a new target
    if (this.hasReachedTarget()) {
      this.pickNewTarget(playerPosition);
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
