class Missile extends Projectile {
  static imageUrl = 'missile.png';
  static size = new Vector2D(16, 34);
  static speed = 3;

  constructor(position, velocity, isPlayerWeapon = false) {
    const config = isPlayerWeapon ? GameConfig.PLAYER_MISSILE : GameConfig.MISSILE;
    super(position, velocity, Missile.imageUrl, Missile.size, config.DAMAGE);

    if (isPlayerWeapon) {
      this.hitSound = config.HIT_SOUND;
      this.hitVolume = config.HIT_VOLUME;
      this.particleColor = config.PARTICLE_COLOR;
    }
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
