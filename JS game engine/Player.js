class Player extends GameEntity {
  static imageUrl = 'player-ship.png';
  static size = new Vector2D(42, 43);

  constructor() {
    super(new Vector2D(0, 0), 0, new Vector2D(), Player.size, Player.imageUrl);
    this.maxHealth = GameConfig.PLAYER.INITIAL_HEALTH; // Current maximum (can change with power-ups)
    this.health = this.maxHealth; // Current health

    // Upgrade levels (start at 0, increase when player chooses upgrades)
    this.weaponLevel = 0;
    this.engineLevel = 0;
    this.shieldLevel = 0;

    // Shield regeneration tracking
    this.timeSinceLastDamage = 0;
    this.regenAccumulator = 0; // Tracks partial HP for regen

    // Death state
    this.isDead = false;
  }

  /**
   * Get weapon stats for current upgrade level (with upper bounds check)
   * @returns {Object} { fireRate, spreadAngle }
   */
  getWeaponStats() {
    const level = Math.min(this.weaponLevel, GameConfig.UPGRADES.WEAPON.length - 1);
    return GameConfig.UPGRADES.WEAPON[level];
  }

  /**
   * Get engine multipliers for current upgrade level (with upper bounds check)
   * @returns {Object} { maxSpeedMultiplier, accelerationMultiplier, rotationMultiplier }
   */
  getEngineStats() {
    const level = Math.min(this.engineLevel, GameConfig.UPGRADES.ENGINE.length - 1);
    return GameConfig.UPGRADES.ENGINE[level];
  }

  /**
   * Get shield stats for current upgrade level (with upper bounds check)
   * @returns {Object} { maxHealth, regenRate, regenDelay }
   */
  getShieldStats() {
    const level = Math.min(this.shieldLevel, GameConfig.UPGRADES.SHIELD.length - 1);
    return GameConfig.UPGRADES.SHIELD[level];
  }

  /**
   * Apply shield upgrade - updates max health and heals to full
   */
  applyShieldUpgrade() {
    const shieldStats = this.getShieldStats();
    this.maxHealth = shieldStats.maxHealth;
    this.health = this.maxHealth; // Heal to full on upgrade
  }

  /**
   * Called when player takes damage - resets regen timer
   */
  onDamage() {
    this.timeSinceLastDamage = 0;
  }

  /**
   * Update shield regeneration
   * @param {number} deltaTime - Time in milliseconds
   */
  updateShieldRegen(deltaTime) {
    const shieldStats = this.getShieldStats();

    // No regen if rate is 0
    if (shieldStats.regenRate <= 0) return;

    // Track time since last damage
    this.timeSinceLastDamage += deltaTime;

    // Only regenerate if delay has passed and not at max health
    const regenDelayMs = shieldStats.regenDelay * 1000;
    if (this.timeSinceLastDamage >= regenDelayMs && this.health < this.maxHealth) {
      // Accumulate fractional HP (regenRate is HP per second)
      this.regenAccumulator += (shieldStats.regenRate * deltaTime) / 1000;

      // Apply whole HP points
      const hpToRegen = Math.floor(this.regenAccumulator);
      if (hpToRegen > 0) {
        this.health = Math.min(this.health + hpToRegen, this.maxHealth);
        this.regenAccumulator -= hpToRegen;
      }
    }
  }

  accelerate(deltaTime) {
    const engineStats = this.getEngineStats();
    const accel = GameConfig.PLAYER.FORWARD_ACCELERATION * engineStats.accelerationMultiplier;
    const accelerationVector = Vector2D.fromRadial(this.sprite.rotation, 1).mul(accel);
    const velocityChange = accelerationVector.mul(deltaTime);
    this.velocity = this.velocity.add(velocityChange);
    this.clampSpeed();
  }

  reverseThrust(deltaTime) {
    const engineStats = this.getEngineStats();
    const accel = GameConfig.PLAYER.BACKWARD_ACCELERATION * engineStats.accelerationMultiplier;
    const decelerationVector = Vector2D.fromRadial(this.sprite.rotation, 1).mul(-accel);
    const velocityChange = decelerationVector.mul(deltaTime);
    this.velocity = this.velocity.add(velocityChange);
    this.clampSpeed();
  }

  turnLeft(deltaTime) {
    const engineStats = this.getEngineStats();
    const rotationSpeed = GameConfig.PLAYER.ROTATIONAL_SPEED * engineStats.rotationMultiplier;
    this.sprite.rotation -= rotationSpeed * deltaTime;
  }

  turnRight(deltaTime) {
    const engineStats = this.getEngineStats();
    const rotationSpeed = GameConfig.PLAYER.ROTATIONAL_SPEED * engineStats.rotationMultiplier;
    this.sprite.rotation += rotationSpeed * deltaTime;
  }

  clampSpeed() {
    const engineStats = this.getEngineStats();
    const maxSpeed = GameConfig.PLAYER.MAX_SPEED * engineStats.maxSpeedMultiplier;
    const speed = this.velocity.mag();
    if (speed > maxSpeed) {
      this.velocity = this.velocity.norm().mul(maxSpeed);
    }
  }
}
