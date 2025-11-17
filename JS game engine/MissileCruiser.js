class MissileCruiser extends NPC {
  constructor(position, playerPosition, canvasWidth, canvasHeight) {
    super(position, playerPosition, canvasWidth, canvasHeight, GameConfig.MISSILE_CRUISER);

    // Shooting state (uses game time, not wall-clock time)
    this.lastShotTime = 0;
  }

  accelerate(deltaTime) {
    const accelerationVector = Vector2D.fromRadial(this.sprite.rotation, 1).mul(GameConfig.MISSILE_CRUISER.FORWARD_ACCELERATION);
    const velocityChange = accelerationVector.mul(deltaTime);
    this.velocity = this.velocity.add(velocityChange);
    this.clampSpeed();
  }

  clampSpeed() {
    const speed = this.velocity.mag();
    if (speed > GameConfig.MISSILE_CRUISER.MAX_SPEED) {
      this.velocity = this.velocity.norm().mul(GameConfig.MISSILE_CRUISER.MAX_SPEED);
    }
  }

  tryShoot(gameTime) {
    if (gameTime - this.lastShotTime > GameConfig.MISSILE_CRUISER.SHOT_COOLDOWN) {
      this.lastShotTime = gameTime;

      try {
        // Fire missile directly forward
        const missileVelocity = Vector2D.fromRadial(this.sprite.rotation, Missile.speed);
        const newMissile = new Missile(
          new Vector2D(
            this.sprite.position.x,
            this.sprite.position.y
          ),
          missileVelocity
        );

        return {
          sound: GameConfig.MISSILE_CRUISER.SHOOT_SOUND,
          volume: GameConfig.MISSILE_CRUISER.SHOOT_VOLUME,
          shots: [newMissile]
        };
      } catch (error) {
        DebugLogger.error('MissileCruiser tryShoot error:', error);
        return null;
      }
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
