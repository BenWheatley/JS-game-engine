class Missile extends Projectile {
  static imageUrl = 'missile.png';
  static size = new Vector2D(20, 20);
  static speed = 0.08; // Speed magnitude (slower than regular shots)
  static damage = 50;

  constructor(position, velocity) {
    super(position, velocity, Missile.imageUrl, Missile.size, Missile.damage);
  }
}
