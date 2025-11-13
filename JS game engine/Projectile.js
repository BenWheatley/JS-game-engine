class Projectile {
  constructor(position, velocity, imageUrl, size, damage) {
    this.sprite = new Sprite(imageUrl, position, size);
    this.velocity = velocity;
    this.damage = damage;
  }

  update() {
    this.sprite.position = this.sprite.position.add(this.velocity);
  }

  draw() {
    this.sprite.draw();
  }
}
