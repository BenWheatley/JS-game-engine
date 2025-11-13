class Missile {
  static imageUrl = 'missile.png';
  static size = new Vector2D(20, 20);
  static speed = 0.08; // Speed magnitude (slower than regular shots)
  static damage = 50;

  constructor(position, velocity) {
    this.sprite = new Sprite(Missile.imageUrl, position, Missile.size);
    this.velocity = velocity;
    this.damage = Missile.damage;
  }

  update() {
    this.sprite.position = this.sprite.position.add(this.velocity);
  }

  draw() {
    this.sprite.draw();
  }
}
