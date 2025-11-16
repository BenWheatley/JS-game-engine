# Code Review: Outstanding Issues

**Review Date:** 2025-11-16
**Codebase Version:** main branch (post-refactoring)

---

## Recent Improvements ✅

### 1. Array Unification Refactoring (COMPLETED)
**Status:** FIXED

Successfully consolidated separate entity arrays into unified collections:
- `alienScouts`, `alienFighters`, `missileCruisers`, `asteroids`, `asteroidSpawns` → **`npcs`** array
- `shots` → **`playerProjectiles`**
- `alienFighterShots`, `cruiserMissiles` → **`npcProjectiles`**

**Benefits:**
- Eliminated ~200 lines of duplicated code
- Simplified collision detection from 9 separate loops to 3 unified loops
- Easier to add new entity types (changes needed in ~5 places instead of 10+)
- Leverages polymorphism via instanceof checks for type-specific behavior
- countNPCs() now simply returns `npcs.length`

---

### 2. Code Duplication Elimination (COMPLETED)
**Status:** FIXED

**pickNewTarget() duplication:** Moved from AlienScout.js, AlienFighter.js, MissileCruiser.js → NPC.js base class

**getRandomSpawnPosition() improvement:** Unified spawn logic using area-weighted rectangular strips for truly uniform distribution

---

### 3. HighScoreManager Extraction (COMPLETED)
**Status:** FIXED

Extracted high score functionality from skeleton.html into dedicated HighScoreManager.js:
- Input sanitization with Unicode support (Chinese, Arabic, Cyrillic, etc.)
- localStorage persistence
- Smart display logic (top 10 or top 8 + ellipsis + most recent)
- XSS prevention via sanitizeInput()
- Clean separation of concerns

---

### 4. Game Timing Fixed (COMPLETED)
**Status:** FIXED

Replaced Date.now() with game-time accumulator:
- Shot cooldowns now use `gameTime` instead of wall-clock time
- Timers properly pause when game is paused
- Delta-time based updates throughout

---

### 5. Particle System Implementation (COMPLETED)
**Status:** ADDED

New ParticleSystem.js provides:
- Impact effects (collision sparks)
- Explosion effects (expanding particles)
- Color customization
- Object pooling for performance
- Lifecycle management (age, alpha fade)

---

### 6. Wormhole Level Progression (COMPLETED)
**Status:** ADDED

New Wormhole.js implements level transitions:
- Spawns when wave is cleared
- Player must enter to advance to next level
- On-screen message and directional arrow
- Minimap rendering (hollow white circle)
- Wraps at world boundaries like NPCs
- Smooth rotation animation (0.5 Hz)

---

### 7. Audio System Unification (COMPLETED)
**Status:** FIXED

Fixed dual AudioContext issue:
- SimpleMusic.js and SoundManager.js now share single AudioContext
- Resolved unreliable sound playback
- Proper AudioContext resume handling for browser autoplay policies

---

## High Priority Issues

### 1. Monolithic Main File
**File:** skeleton.html (~1100 lines)
**Status:** IN PROGRESS

Game loop, state management, collision detection, rendering, and configuration still mixed in one HTML file.

**Recommendation:** Continue extraction started with HighScoreManager:

**Next Priority Extractions:**
1. **SpawnSystem.js** - getOffscreenSpawnPosition, spawnWave, getWaveDefinition
2. **CollisionSystem.js** - All collision detection and damage handling
3. **Renderer.js** - Draw loops, camera transforms, HUD rendering
4. **GameState.js** - Encapsulate player, npcs, projectiles, score, level, etc.
5. **InputHandler.js** - Keyboard and gamepad input processing

---

### 2. Oversized Sprite Assets
**Files:** energy-blast.png, alien-ship.png
**Status:** NEEDS FIXING

| Asset | Current Size | Rendered Size | Waste |
|-------|-------------|---------------|-------|
| energy-blast.png | 512 x 512 | 10 x 10 | 51x downscale |
| alien-ship.png | 512 x 512 | 50 x 50 | 10x downscale |

**Recommendation:** Create properly-sized versions to reduce bandwidth.

---

### 3. localStorage Validation
**File:** HighScoreManager.js
**Status:** NEEDS REVIEW

High scores can be manipulated via browser DevTools.

**Recommendation:**
- Add score range validation (0-999999)
- Validate data types on load
- Consider integrity hash (optional)
- Document this as known limitation for offline games

---

## Medium Priority Issues

### 4. Magic Numbers in Collision Damage
**File:** skeleton.html (collision detection)
**Status:** NEEDS FIXING

Hardcoded damage values:
```javascript
player.health -= 50; // Asteroids deal fixed damage
player.health -= 25; // Small asteroids deal less damage
```

**Recommendation:** Move to GameConfig:
```javascript
GameConfig.DAMAGE = {
  ASTEROID_LARGE: 50,
  ASTEROID_SMALL: 25,
  PLASMA_SHOT: 25,
  MISSILE: 50
};
```

---

### 5. Error Handling for localStorage
**File:** HighScoreManager.js
**Status:** NEEDS ADDING

No try-catch around localStorage operations.

**Recommendation:**
```javascript
saveHighScore(name, score) {
  try {
    // ... save logic
    localStorage.setItem(this.storageKey, JSON.stringify(topScores));
  } catch (e) {
    console.error('Failed to save high score:', e);
    // Show user-facing error message
  }
}
```

---

### 6. Sprite Loading Error Handling
**File:** Sprite.js:50-60
**Status:** NEEDS REVIEW

Failed sprite loads throw errors and crash the game. Consider fallback/error sprites.

---

### 7. No Build Process
**Status:** NEEDS CONSIDERATION

Current development workflow:
- No transpilation
- No minification
- No bundling
- No source maps

**Recommendation:** Consider Vite for:
- Fast HMR during development
- Automatic minification for production
- ES module optimization
- Source map generation

---

## Low Priority Issues

### 8. No Automated Testing
**Status:** NEEDS ADDING

Missing unit tests for:
- Collision detection (AABB)
- Spawn distribution uniformity
- Input sanitization edge cases
- Vector math operations

**Recommendation:** Add Vitest or Jest:
```javascript
describe('CollisionSystem', () => {
  test('detects AABB collision', () => {
    const entity1 = { sprite: { position: {x: 0, y: 0}, size: {x: 10, y: 10} }};
    const entity2 = { sprite: { position: {x: 5, y: 5}, size: {x: 10, y: 10} }};
    expect(checkCollision(entity1, entity2)).toBe(true);
  });
});
```

---

### 9. Console.log Statements
**Files:** Throughout codebase
**Status:** NEEDS CLEANUP

Production code contains console.log statements.

**Recommendation:** Add debug flag or remove for production:
```javascript
const DEBUG = false;
function debugLog(...args) {
  if (DEBUG) console.log(...args);
}
```

---

### 10. No ESLint Configuration
**Status:** NEEDS ADDING

Code style not enforced programmatically.

**Recommendation:** Add `.eslintrc.json`:
```json
{
  "extends": "eslint:recommended",
  "env": { "browser": true, "es6": true },
  "parserOptions": { "ecmaVersion": 2020, "sourceType": "module" }
}
```

---

### 11. Canvas Size Hardcoded
**File:** skeleton.html
**Status:** ACCEPTABLE (document limitation)

Canvas dimensions hardcoded to 800x600. Consider making responsive for different screen sizes.

---

### 12. Collision Detection Optimization
**File:** skeleton.html
**Status:** ACCEPTABLE (document limitation)

O(n²) brute-force collision detection. Acceptable for current entity counts (<50), but document the limitation for future scaling.

**Future Consideration:** Spatial partitioning (QuadTree) if entity count grows significantly.

---

## Code Quality Metrics

### Positive Indicators ✅
- Consistent naming conventions (camelCase)
- ES6+ features (classes, arrow functions, template literals)
- No use of `var`, only `let`/`const`
- Event-driven architecture for input
- Configuration externalized to GameConfig.js
- Recent refactoring significantly improved maintainability
- Good separation of concerns for new systems
- Comprehensive comments in most files

### Negative Indicators ⚠️
- No linting configuration
- No build process
- No automated tests
- Mixed concerns in skeleton.html (improving)
- Some console.log statements remain

---

## Summary

**Overall Assessment: Good (Improving)**

Recent refactoring has significantly improved code quality:
- Array unification eliminated massive duplication
- HighScoreManager extraction demonstrates good architectural direction
- Bug fixes improved game feel and reliability
- New features (wormhole, particles) added with clean separation

**Primary Recommendation:** Continue incremental extraction from skeleton.html. The next logical steps are SpawnSystem.js and CollisionSystem.js.

**Strengths:**
- Recent array unification was excellent refactoring
- Clean OOP design with proper inheritance
- Good game feel with particles, audio, visual feedback
- Security-conscious (input sanitization)

**Areas for Improvement:**
- Continue extracting systems from skeleton.html
- Add automated testing
- Implement error handling for localStorage
- Move magic numbers to GameConfig
- Add build process for production

The codebase is in good shape and trending in the right direction. Continue the incremental refactoring approach.
