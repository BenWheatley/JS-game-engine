class NPC extends GameEntity {
  static imageUrl = 'player-ship.png'; // placeholder image; if you see this in the game, should be clear it's not the player
  static size = new Vector2D(42, 43);
  static health = 100;

  constructor(position) {
    super(position, 0, new Vector2D(0, 0), NPC.size, NPC.imageUrl);
    this.health = NPC.health;
  }

  pickNewTarget(playerPosition) {
    this.targetPosition = NPCAIUtils.pickTargetNearPlayer(
      playerPosition,
      this.canvasWidth,
      this.canvasHeight
    );
  }
}
