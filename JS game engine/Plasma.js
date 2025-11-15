class Plasma extends Projectile {
	static imageUrl = 'plasma.png';
	static size = new Vector2D(18, 31);
	static speed = 5; // Speed magnitude (pixels per frame)
	static damage = 10;

	constructor(position, velocity) {
		super(position, velocity, Plasma.imageUrl, Plasma.size, Plasma.damage);
	}
}
