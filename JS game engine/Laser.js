class Laser extends Projectile {
	static imageUrl = 'laser.png';
	static size = new Vector2D(10, 10);
	static speed = 5.5; // Speed magnitude (pixels per frame) - 10% faster than plasma/missiles

	constructor(position, velocity) {
		DebugLogger.log(`Creating Laser: GameConfig.LASER=${GameConfig.LASER}, GameConfig.LASER.DAMAGE=${GameConfig.LASER ? GameConfig.LASER.DAMAGE : 'LASER undefined'}`);
		super(position, velocity, Laser.imageUrl, Laser.size, GameConfig.LASER.DAMAGE);
	}
}
