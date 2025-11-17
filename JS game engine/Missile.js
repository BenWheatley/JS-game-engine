class Missile extends Projectile {
  static imageUrl = 'missile.png';
  static size = new Vector2D(16, 34);
  static speed = 3;

  constructor(position, velocity) {
    super(position, velocity, Missile.imageUrl, Missile.size, GameConfig.MISSILE.DAMAGE);
  }

  onHitPlayer() {
    return {
      damage: GameConfig.MISSILE.DAMAGE,
      sound: GameConfig.MISSILE.HIT_SOUND,
      volume: GameConfig.MISSILE.HIT_VOLUME,
      particleColor: GameConfig.MISSILE.PARTICLE_COLOR
    };
  }
}
