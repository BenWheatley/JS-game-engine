# Code Review: Outstanding Issues

**Review Date:** 2025-12-19

---

## Medium Priority Issues

### 1. Error Handling for localStorage
**File:** HighScoreManager.js
**Status:** NEEDS ADDING

No try-catch around localStorage operations. While cheating is acceptable for a local game, the code should handle quota errors gracefully (e.g., when localStorage is full or disabled).

**Recommendation:**
```javascript
saveHighScore(name, score) {
  try {
    // ... save logic
    localStorage.setItem(this.storageKey, JSON.stringify(topScores));
  } catch (e) {
    console.error('Failed to save high score:', e);
    // Gracefully degrade - game continues without saving
  }
}
```

---

### 2. Sprite Loading Error Handling
**File:** Sprite.js
**Status:** NEEDS REVIEW

Failed sprite loads throw errors and crash the game. Consider fallback/error sprites or graceful degradation.

**Recommendation:** Add error handling with colored rectangles as fallback sprites for missing assets.

---

---

## Engine Development Opportunities

Since this game exists primarily to develop the VibeEngine, here are components that could be generalized and moved to the engine:

### High Priority for Engine

**1. GameEntity.js → Engine Base Entity Class**
- Currently: Base class for all game objects (sprites, velocity, update, draw)
- Potential: Generic `Entity` class that any game could extend
- Benefits: Standardized entity lifecycle, collision interface, rendering

**2. Camera/Viewport System**
- Currently: Camera transform logic scattered in Game.js (lines 127-131, 193)
- Potential: `Camera` class with follow, bounds, zoom, shake
- Benefits: Reusable camera system for any 2D game

**3. Entity Manager**
- Currently: Arrays managed manually in Game.js (npcs, playerProjectiles, npcProjectiles)
- Potential: `EntityManager` or `World` class to handle entity collections
- Benefits: Automatic update/render loops, spatial queries, cleanup

**4. Minimap.js → Generic Minimap Component**
- Currently: Game-specific but mostly generic (Minimap.js)
- Potential: Move to engine with configurable entity icons/colors
- Benefits: Drop-in minimap for any game with world bounds

**5. AI Utilities (NPCAIUtils.js)**
- Currently: Basic target selection, distance checks (NPCAIUtils.js)
- Potential: `AIUtils` or `Pathfinding` module in engine
- Benefits: Common AI patterns (seek, flee, wander, patrol)

### Medium Priority for Engine

**6. Spawn System**
- Currently: Off-screen spawn logic (SpawnSystem.js)
- Potential: Generic `SpawnManager` with off-screen/on-screen spawn zones
- Benefits: Reusable enemy/pickup spawning

**7. World Wrapping/Toroidal Space**
- Currently: World wrapping logic in Game.js (lines 387-395, 727-736)
- Potential: `WorldBounds` utility class
- Benefits: Common pattern for space games, snake-like games

**8. Beam Weapons (BeamWeapon.js)**
- Currently: Line-based weapon with hit detection
- Potential: Generalized `LineProjectile` or `RaycastWeapon`
- Benefits: Useful for lasers, grappling hooks, tractor beams

### Low Priority (Too Game-Specific)

These should stay in the game code:
- Specific entity classes (AlienScout, Player, Wormhole)
- Specific weapon types (Laser, Plasma, Missile)
- Game-specific UI (UpgradeBackground)
- GameConfig (though a generic config system might be useful)

### Recommended Action

**Start with:** GameEntity → Engine, Camera system, EntityManager
These provide the biggest reusability wins and would clean up Game.js significantly.

---

## Summary

**Total Outstanding Issues:** 2
- **Medium Priority:** 2 (localStorage error handling, Sprite error handling)

**Engine Development:** 8 components identified for potential engine inclusion

The codebase is in good shape for a local-only game. Architecture is modular, tests are comprehensive, and no build process or anti-cheat measures are needed.
