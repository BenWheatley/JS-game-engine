class Plasma extends Projectile {
	static imageUrl = 'plasma.png';
	static size = new Vector2D(18, 31);
	static speed = 5; // Speed magnitude (pixels per frame)

	constructor(position, velocity, isPlayerWeapon = false) {
		const config = isPlayerWeapon ? GameConfig.PLAYER_PLASMA : GameConfig.PLASMA;
		super(position, velocity, Plasma.imageUrl, Plasma.size, config.DAMAGE);

		if (isPlayerWeapon) {
			this.hitSound = config.HIT_SOUND;
			this.hitVolume = config.HIT_VOLUME;
			this.particleColor = config.PARTICLE_COLOR;
		}
	}

	onHitPlayer() {
		return {
			damage: GameConfig.PLASMA.DAMAGE,
			sound: GameConfig.PLASMA.HIT_SOUND,
			volume: GameConfig.PLASMA.HIT_VOLUME,
			particleColor: GameConfig.PLASMA.PARTICLE_COLOR
		};
	}
}
