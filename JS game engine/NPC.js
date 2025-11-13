class NPC extends GameEntity {
  static imageUrl = 'alien-ship.png';
  static size = new Vector2D(50, 50);
  static health = 100;

  constructor(position) {
    super(position, 0, new Vector2D(0, 0), NPC.size, NPC.imageUrl);
    this.health = NPC.health;
  }
}
