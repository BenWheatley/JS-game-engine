# Code Review: Outstanding Issues

**Review Date:** 2025-11-15
**Codebase Version:** main branch (commit 3bdf5cb)

---

## High Priority Issues

### 1. Oversized Sprite Assets

**Files:** energy-blast.png, alien-ship.png
**Status:** NEEDS FIXING

Two sprites are unnecessarily large, wasting bandwidth:

| Asset | Current Size | Rendered Size | Waste |
|-------|-------------|---------------|-------|
| energy-blast.png | 512 x 512 | 10 x 10 | 51x downscale |
| alien-ship.png | 512 x 512 | 50 x 50 | 10x downscale |

**Recommendation:** Create properly-sized versions:
- energy-blast.png → 16x16 or 20x20
- alien-ship.png → 100x100

---

### 2. Sprite Loading Race Condition

**File:** Sprite.js:17-20
**Status:** NEEDS REVIEW

If an image isn't loaded, `draw()` silently returns without drawing:

```javascript
if (this.imageBitmap == null) {
    this.imageBitmap = Sprite.getFromCache(this.imageUrl);
    return; // Entity invisible this frame!
}
```

Consider showing a placeholder or ensuring preloading completes before starting game.

---

### 3. localStorage Security Risk

**File:** skeleton.html (high scores)
**Status:** NEEDS REVIEW

High scores can be easily manipulated via browser DevTools. Consider adding basic validation:
- Limit score range (0-999999)
- Validate data types
- Add integrity hash (optional)
- Document that this is a known limitation for offline games

---

## Medium Priority Issues

### 4. Magic Numbers Throughout Codebase

**Files:** AlienScout.js, AlienFighter.js, MissileCruiser.js, Asteroid.js
**Status:** NEEDS FIXING

Examples:
```javascript
return distance < 50; // What is 50?
if (this.offScreenTime > 2000) // Why 2000?
const despawnDistance = Math.max(screenSize.x, screenSize.y) * 3; // Why 3x?
```

Add named constants at top of files.

---

### 5. Code Duplication: getRandomSpawnPosition()

**Files:** AlienScout.js, AlienFighter.js, MissileCruiser.js
**Status:** NEEDS REFACTORING

Identical ~20-line method duplicated across three classes. Move to NPC base class.

---

### 6. Code Duplication: pickNewTarget()

**Files:** AlienScout.js:63-73, AlienFighter.js:68-78, MissileCruiser.js:68-78
**Status:** NEEDS REFACTORING

Identical method across three classes. Move to NPC base class.

---

### 7. Date.now() for Game Timing

**Files:** AlienFighter.js:34, MissileCruiser.js:34
**Status:** NEEDS FIXING

Using wall-clock time for shot cooldowns means timers run even when game is paused. Use delta-time accumulators instead:

```javascript
// Instead of:
this.lastShotTime = Date.now();
if (now - this.lastShotTime > AlienFighter.shotCooldown) { ... }

// Use:
this.shotCooldownTimer = 0;
update(deltaTime) {
    this.shotCooldownTimer += deltaTime;
    if (this.shotCooldownTimer >= AlienFighter.shotCooldown) {
        this.shotCooldownTimer = 0;
        // Fire shot
    }
}
```

---

### 8. No Error Handling for Sprite Preloading Failure

**File:** Sprite.js:50-60
**Status:** NEEDS REVIEW

Failed sprite loads throw errors and crash the game. Consider fallback/error sprites.

---

### 9. No Collision Detection Optimization

**File:** skeleton.html (collision detection)
**Status:** ACCEPTABLE (document limitation)

O(n²) brute-force collision detection. Acceptable for current entity counts (<50), but document the limitation for future scaling.

---

## Low Priority Issues

### 10. Console.log Statements in Production Code

**Files:** GPTEngine.js:29, 33, Sprite.js:6, 74
**Status:** NEEDS CLEANUP

Add debug flag or remove console.log statements.

---

### 11. Hardcoded Canvas Size

**File:** skeleton.html
**Status:** NEEDS REVIEW

Canvas dimensions hardcoded to 800x600. Consider making responsive or configurable.

---

### 12. No Comments in Complex Math

**Files:** Vector2D.js:9-12, AsteroidSpawn.js:26-78
**Status:** NEEDS DOCUMENTATION

Complex vector math lacks explanatory comments.

---

### 13. Confusing Debug Message

**File:** Sprite.js:74
**Status:** NEEDS FIXING

Message says "Stuck loading sprites" but this may be normal on first frame. Change to "Still loading sprites" or only log after timeout.

---

### 14. No JSDoc Documentation

**Files:** All
**Status:** OPTIONAL

No JSDoc comments for classes, methods, or parameters.

---

### 15. Game Logic in HTML File

**File:** skeleton.html (1400+ lines)
**Status:** ARCHITECTURAL ISSUE

Game loop, state management, collision detection, and UI all in one HTML file. Consider extracting into separate modules for maintainability.

---

## Summary of Work Needed

**Immediate:**
1. Optimize oversized sprite assets (energy-blast.png, alien-ship.png)
2. Review sprite loading race condition

**Short Term:**
3. Refactor duplicated code (getRandomSpawnPosition, pickNewTarget)
4. Replace Date.now() timers with delta-time accumulators
5. Add named constants for magic numbers
6. Review sprite loading error handling

**Long Term:**
7. Extract game logic from skeleton.html into modules
8. Add JSDoc documentation
9. Remove/flag debug console.log statements
10. Consider responsive canvas sizing
11. Add unit tests (especially for Vector2D edge cases)
