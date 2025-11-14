class Player extends GameEntity {
  static imageUrl = 'player-ship.png';
  static size = new Vector2D(42, 43);
  static health = 100;
  static forwardAcceleration = 0.002;
  static backwardAcceleration = 0.0002;
  static maxSpeed = 0.08;
  static rotationalSpeed = Math.PI / 1000 * 1.1; // Radians per second

  constructor() {
    super(new Vector2D(0, 0), 0, new Vector2D(), Player.size, Player.imageUrl);
    this.health = Player.health;
  }

  accelerate(deltaTime) {
    const accelerationVector = Vector2D.fromRadial(this.sprite.rotation, 1).mul(Player.forwardAcceleration);
    const velocityChange = accelerationVector.mul(deltaTime);
    this.velocity = this.velocity.add(velocityChange);
    this.clampSpeed();
  }

  reverseThrust(deltaTime) {
    const decelerationVector = Vector2D.fromRadial(this.sprite.rotation, 1).mul(-Player.backwardAcceleration);
    const velocityChange = decelerationVector.mul(deltaTime);
    this.velocity = this.velocity.add(velocityChange);
    this.clampSpeed();
  }

  turnLeft(deltaTime) {
    this.sprite.rotation -= Player.rotationalSpeed * deltaTime;
  }

  turnRight(deltaTime) {
    this.sprite.rotation += Player.rotationalSpeed * deltaTime;
  }

  clampSpeed() {
    const speed = this.velocity.mag();
    if (speed > Player.maxSpeed) {
      this.velocity = this.velocity.norm().mul(Player.maxSpeed);
    }
  }
}
