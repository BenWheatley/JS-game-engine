class Shot {
  static imageUrl = 'energy-blast.png';
  static size = new Vector2D(10, 10);
  static speed = 5; // Speed magnitude (pixels per frame)
  static damage = 10;

  constructor(position, velocity) {
    this.sprite = new Sprite(Shot.imageUrl, position, Shot.size);
    this.velocity = velocity;
    this.damage = Shot.damage;
  }

  update() {
    this.sprite.position = this.sprite.position.add(this.velocity);
  }

  draw() {
    this.sprite.draw();
  }
}
