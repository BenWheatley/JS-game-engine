class MissileCruiser extends NPC {
  constructor(playerPosition, canvasWidth, canvasHeight) {
    const config = GameConfig.MISSILE_CRUISER;
    const size = new Vector2D(config.WIDTH, config.HEIGHT);

    // Calculate spawn position (2x bounding box offscreen)
    const margin = size.x * GameConfig.SHARED.SPAWN_MARGIN_MULTIPLIER;
    const position = MissileCruiser.getRandomSpawnPosition(
      canvasWidth,
      canvasHeight,
      margin,
      playerPosition
    );

    super(position);
    // Override sprite with correct image
    this.sprite = new Sprite(config.IMAGE_URL, position, size);
    this.sprite.rotation = 0;
    this.velocity = new Vector2D(0, 0); // Start with zero velocity
    this.health = config.HEALTH;
    this.scoreValue = config.SCORE_VALUE;

    // AI state machine
    this.targetPosition = null;
    this.offScreenTime = 0;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // Shooting state (uses game time, not wall-clock time)
    this.lastShotTime = 0;
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

  hasReachedTarget() {
    return NPCAIUtils.hasReachedTarget(this.sprite.position, this.targetPosition);
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

  onHit(damage) {
    // Multi-hit enemy
    this.health -= damage;
    if (this.health <= 0) {
      return {
        destroyed: true,
        sound: GameConfig.MISSILE_CRUISER.DESTROYED_SOUND,
        volume: GameConfig.MISSILE_CRUISER.DESTROYED_VOLUME,
        spawns: null,
        particleColor: GameConfig.MISSILE_CRUISER.PARTICLE_COLOR
      };
    } else {
      return {
        destroyed: false,
        sound: GameConfig.MISSILE_CRUISER.HIT_SOUND,
        volume: GameConfig.MISSILE_CRUISER.HIT_VOLUME,
        spawns: null,
        particleColor: null
      };
    }
  }

  onCollideWithPlayer() {
    return {
      damage: this.health,
      sound: GameConfig.MISSILE_CRUISER.COLLISION_SOUND,
      volume: GameConfig.MISSILE_CRUISER.COLLISION_VOLUME,
      particleColor: GameConfig.MISSILE_CRUISER.PARTICLE_COLOR
    };
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
