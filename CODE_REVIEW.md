# Code Review: Issues to Address

**Review Date:** 2025-11-15
**Codebase Version:** main branch (commit 3bdf5cb)

---

## Critical Issues

### 1. Vector Division by Zero

**File:** Vector2D.js:61-67
**Status:** ✓ FIXED (zero-check added)

The `norm()` method now properly handles zero magnitude vectors.

---

### 2. Sprite Aspect Ratio Distortion

**Files:** Multiple entity classes
**Status:** NEEDS FIXING

Several sprite sizes don't match actual image dimensions:

| Class | Current Code Size | Actual Image | Image Dimensions | Status |
|-------|------------------|--------------|------------------|---------|
| Player | (48, 48) | player-ship.png | 42 x 43 | ❌ Wrong aspect ratio |
| AlienScout | (50, 50) | alien-scout.png | 52 x 54 | ❌ Wrong dimensions |
| AlienFighter | (50, 50) | alien-fighter.png | 52 x 50 | ❌ Wrong dimensions |
| MissileCruiser | (180, 180) | missile_ship.png | 36 x 46 | ❌ Wrong aspect ratio (should be 72x92 for 2x scale) |
| Missile | (40, 40) | missile.png | 16 x 34 | ❌ Wrong aspect ratio (should be 32x68 for 2x scale) |
| Asteroid (big) | ? | asteroid-big.png | 52 x 52 | ✓ Verify in code |
| Asteroid (medium) | ? | asteroid-medium.png | 27 x 26 | ✓ Verify in code |
| EnergyBlast | (10, 10) | energy-blast.png | 512 x 512 | ⚠️ Massive waste (51x downscale) |
| AlienShip | (50, 50) | alien-ship.png | 512 x 512 | ⚠️ Massive waste (10x downscale) |

**Recommendations:**
- Update entity sizes to match actual image dimensions
- Consider creating properly-sized versions of energy-blast.png (16x16) and alien-ship.png (100x100) to reduce file size

---

## High Priority Issues

### 3. Missing Semicolon

**File:** GPTEngine.js:6
**Status:** NEEDS FIXING

```javascript
this._configureUserInput() // Missing semicolon
```

Should be:
```javascript
this._configureUserInput();
```

---

### 4. Non-Strict Equality in Vector2D

**File:** Vector2D.js:98
**Status:** ✓ FIXED

Changed from `==` to `===` for strict equality.

---

### 5. Sprite Loading Race Condition

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

### 6. localStorage Security Risk

**File:** skeleton.html (high scores)
**Status:** NEEDS REVIEW

High scores can be easily manipulated via browser DevTools. Consider adding basic validation:
- Limit score range (0-999999)
- Validate data types
- Add integrity hash (optional)
- Document that this is a known limitation for offline games

---

## Medium Priority Issues

### 7. Magic Numbers Throughout Codebase

**Files:** Multiple (AlienScout.js, AlienFighter.js, MissileCruiser.js, Asteroid.js)
**Status:** NEEDS FIXING

Examples:
```javascript
return distance < 50; // What is 50?
if (this.offScreenTime > 2000) // Why 2000?
const despawnDistance = Math.max(screenSize.x, screenSize.y) * 3; // Why 3x?
```

Add named constants at top of files.

---

### 8. Code Duplication: getRandomSpawnPosition()

**Files:** AlienScout.js, AlienFighter.js, MissileCruiser.js
**Status:** NEEDS REFACTORING

Identical ~20-line method duplicated across three classes. Move to NPC base class.

---

### 9. Code Duplication: Angle Normalization

**Files:** AlienScout.js:103-105, AlianFighter.js:108-110, MissileCruiser.js:108-110
**Status:** ✓ PARTIALLY FIXED

Vector2D.js now has `normalizeAngleDiff()` static method. Refactor enemy classes to use it.

---

### 10. Code Duplication: pickNewTarget()

**Files:** AlienScout.js:63-73, AlienFighter.js:68-78, MissileCruiser.js:68-78
**Status:** NEEDS REFACTORING

Identical method across three classes. Move to NPC base class.

---

### 11. Date.now() for Game Timing

**Files:** AlienFighter.js:34, MissileCruiser.js:34
**Status:** NEEDS FIXING

Using wall-clock time for shot cooldowns means timers run even when game is paused. Use delta-time accumulators instead.

---

### 12. No Error Handling for Sprite Preloading Failure

**File:** Sprite.js:50-60
**Status:** NEEDS REVIEW

Failed sprite loads throw errors and crash the game. Consider fallback/error sprites.

---

### 13. XSS Vulnerability in Player Name Input

**File:** skeleton.html (high score display)
**Status:** ✓ FIXED

Now uses `textContent` instead of `innerHTML` for player names.

---

### 14. No Collision Detection Optimization

**File:** skeleton.html (collision detection)
**Status:** ACCEPTABLE (document limitation)

O(n²) brute-force collision detection. Acceptable for current entity counts (<50), but document the limitation for future scaling.

---

## Low Priority Issues

### 15. Console.log Statements in Production Code

**Files:** GPTEngine.js:29, 33, Sprite.js:6, 74
**Status:** NEEDS CLEANUP

Add debug flag or remove console.log statements.

---

### 16. Hardcoded Canvas Size

**File:** skeleton.html
**Status:** NEEDS REVIEW

Canvas dimensions hardcoded to 800x600. Consider making responsive or configurable.

---

### 17. No Comments in Complex Math

**Files:** Vector2D.js:9-12, AsteroidSpawn.js:26-78
**Status:** NEEDS DOCUMENTATION

Complex vector math lacks explanatory comments.

---

### 18. Confusing Debug Message

**File:** Sprite.js:74
**Status:** NEEDS FIXING

Message says "Stuck loading sprites" but this may be normal on first frame. Change to "Still loading sprites" or only log after timeout.

---

### 19. No JSDoc Documentation

**Files:** All
**Status:** OPTIONAL

No JSDoc comments for classes, methods, or parameters.

---

### 20. Game Logic in HTML File

**File:** skeleton.html (1400+ lines)
**Status:** ARCHITECTURAL ISSUE

Game loop, state management, collision detection, and UI all in one HTML file. Consider extracting into separate modules for maintainability.

---

## Summary of Work Needed

**Immediate:**
1. Fix sprite aspect ratios (items match actual image dimensions)
2. Add semicolon in GPTEngine.js:6
3. Optimize oversized sprite assets (energy-blast.png, alien-ship.png)

**Short Term:**
4. Refactor duplicated code (getRandomSpawnPosition, pickNewTarget, angle normalization)
5. Replace Date.now() timers with delta-time accumulators
6. Add named constants for magic numbers
7. Review sprite loading and error handling

**Long Term:**
8. Extract game logic from skeleton.html into modules
9. Add JSDoc documentation
10. Remove/flag debug console.log statements
11. Consider responsive canvas sizing
12. Add unit tests (especially for Vector2D edge cases)
