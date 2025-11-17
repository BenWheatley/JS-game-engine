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

  turnTowards(targetAngle, deltaTime) {
    // Calculate normalized angle difference using Vector2D utility
    const angleDiff = Vector2D.normalizeAngleDiff(targetAngle, this.sprite.rotation);

    // Turn in the direction of smallest angle difference
    if (Math.abs(angleDiff) > GameConfig.NPC.TURN_PRECISION) {
      if (angleDiff > 0) {
        this.sprite.rotation += Math.min(GameConfig.MISSILE_CRUISER.ROTATIONAL_SPEED * deltaTime, angleDiff);
      } else {
        this.sprite.rotation -= Math.min(GameConfig.MISSILE_CRUISER.ROTATIONAL_SPEED * deltaTime, -angleDiff);
      }
    }
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

  draw() {
    // Draw sprite first
    super.draw();

    // Draw health bar above the ship
    const context = Sprite._context;
    if (!context) return;

    const maxHealth = GameConfig.MISSILE_CRUISER.HEALTH;
    const healthPercentage = Math.max(0, Math.min(1, this.health / maxHealth));

    const barWidth = 60;
    const barHeight = 6;
    const barX = this.sprite.position.x - barWidth / 2;
    const barY = this.sprite.position.y - this.sprite.size.y / 2 - 12; // 12 pixels above sprite

    // Draw background (red - shows damage)
    context.fillStyle = GameConfig.HUD.HEALTH_BAR_BG_COLOR;
    context.fillRect(barX, barY, barWidth, barHeight);

    // Draw foreground (green - shows current health)
    const currentHealthWidth = barWidth * healthPercentage;
    context.fillStyle = GameConfig.HUD.HEALTH_BAR_FG_COLOR;
    context.fillRect(barX, barY, currentHealthWidth, barHeight);

    // Draw border (white)
    context.strokeStyle = GameConfig.HUD.HEALTH_BAR_BORDER_COLOR;
    context.lineWidth = 1;
    context.strokeRect(barX, barY, barWidth, barHeight);
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
