class Plasma extends Projectile {
	static imageUrl = 'plasma.png';
	static size = new Vector2D(18, 31);
	static speed = 5; // Speed magnitude (pixels per frame)

	constructor(position, velocity) {
		super(position, velocity, Plasma.imageUrl, Plasma.size, GameConfig.PLASMA.DAMAGE);
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
