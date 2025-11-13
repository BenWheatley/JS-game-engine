class Missile extends Projectile {
  static imageUrl = 'missile.png';
  static size = new Vector2D(40, 40);
  static speed = 3;
  static damage = 50;

  constructor(position, velocity) {
    super(position, velocity, Missile.imageUrl, Missile.size, Missile.damage);
  }
}
