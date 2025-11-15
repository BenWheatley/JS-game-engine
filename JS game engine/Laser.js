class Laser extends Projectile {
	static imageUrl = 'laser.png';
	static size = new Vector2D(10, 10);
	static speed = 5; // Speed magnitude (pixels per frame)
	static damage = 10;

	constructor(position, velocity) {
		super(position, velocity, Laser.imageUrl, Laser.size, Laser.damage);
	}
}
