class Missile extends Projectile {
  static imageUrl = 'missile.png';
  static size = new Vector2D(40, 40);
  static speed = 3;
  static damage = 50;

  constructor(position, velocity) {
    super(position, velocity, Missile.imageUrl, Missile.size, Missile.damage);
    // Set rotation to face direction of travel (+PI/2 because sprite faces up at 0 rotation)
    this.sprite.rotation = Math.atan2(velocity.y, velocity.x) + Math.PI / 2;
  }
}
