class Player extends GameEntity {
  static imageUrl = 'player-ship.png';
  static size = new Vector2D(42, 43);

  constructor() {
    super(new Vector2D(0, 0), 0, new Vector2D(), Player.size, Player.imageUrl);
    this.maxHealth = GameConfig.PLAYER.INITIAL_HEALTH; // Current maximum (can change with power-ups)
    this.health = this.maxHealth; // Current health
  }

  accelerate(deltaTime) {
    const accelerationVector = Vector2D.fromRadial(this.sprite.rotation, 1).mul(GameConfig.PLAYER.FORWARD_ACCELERATION);
    const velocityChange = accelerationVector.mul(deltaTime);
    this.velocity = this.velocity.add(velocityChange);
    this.clampSpeed();
  }

  reverseThrust(deltaTime) {
    const decelerationVector = Vector2D.fromRadial(this.sprite.rotation, 1).mul(-GameConfig.PLAYER.BACKWARD_ACCELERATION);
    const velocityChange = decelerationVector.mul(deltaTime);
    this.velocity = this.velocity.add(velocityChange);
    this.clampSpeed();
  }

  turnLeft(deltaTime) {
    this.sprite.rotation -= GameConfig.PLAYER.ROTATIONAL_SPEED * deltaTime;
  }

  turnRight(deltaTime) {
    this.sprite.rotation += GameConfig.PLAYER.ROTATIONAL_SPEED * deltaTime;
  }

  clampSpeed() {
    const speed = this.velocity.mag();
    if (speed > GameConfig.PLAYER.MAX_SPEED) {
      this.velocity = this.velocity.norm().mul(GameConfig.PLAYER.MAX_SPEED);
    }
  }
}
