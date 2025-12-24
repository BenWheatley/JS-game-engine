import { Projectile, Vector2D, DebugLogger } from './VibeEngine/VibeEngine.js';
import { GameConfig } from './GameConfig.js';

class Laser extends Projectile {
	static imageUrl = 'laser.png';
	static size = new Vector2D(10, 10);

	constructor(position, velocity) {
		DebugLogger.log(`Creating Laser: GameConfig.LASER=${GameConfig.LASER}, GameConfig.LASER.DAMAGE=${GameConfig.LASER ? GameConfig.LASER.DAMAGE : 'LASER undefined'}`);
		super(position, velocity, Laser.imageUrl, Laser.size, GameConfig.LASER.DAMAGE);
		this.hitSound = GameConfig.LASER.HIT_SOUND;
		this.hitVolume = GameConfig.LASER.HIT_VOLUME;
		this.particleColor = GameConfig.LASER.PARTICLE_COLOR;
	}
}
export { Laser };
