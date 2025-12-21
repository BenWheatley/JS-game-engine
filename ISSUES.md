# Outstanding Issues

**Last Updated:** 2025-12-21

---

## Code Issues

### 1. Error Handling for localStorage
**File:** HighScoreManager.js
**Priority:** Medium

No try-catch around localStorage operations. Code should handle quota errors gracefully (e.g., when localStorage is full or disabled).

**Recommendation:**
```javascript
saveHighScore(name, score) {
  try {
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
**Priority:** Medium

Failed sprite loads throw errors and crash the game. Consider fallback/error sprites or graceful degradation.

**Recommendation:** Add error handling with colored rectangles as fallback sprites for missing assets.

---

### 3. XSS Vulnerability in MenuSystem
**File:** MenuSystem.js (line 247)
**Priority:** High

Uses `innerHTML` with achievement data which could allow script injection if achievement configuration is modified or loaded externally.

**Recommendation:**
```javascript
// Replace innerHTML with textContent
const nameEl = document.createElement('strong');
nameEl.textContent = achievement.name;
const descEl = document.createElement('div');
descEl.textContent = achievement.description;
toast.appendChild(nameEl);
toast.appendChild(descEl);
```

---

### 4. Division by Zero in Vector2D
**File:** Vector2D.js (lines 41-42)
**Priority:** High

`div()` method has no safety check for division by zero. If velocity becomes (0,0) and `norm()` is called, subsequent `div()` will produce NaN values, corrupting game state.

**Recommendation:**
```javascript
norm() {
  const m = this.mag();
  if (m === 0) return new Vector2D(0, 0);
  return this.div(m);
}
```

---

### 5. Null Canvas Context Validation
**File:** VibeEngine.js (line 28)
**Priority:** High

`getElementById(canvasName)` could return null if canvas doesn't exist, causing silent failure.

**Recommendation:**
```javascript
this._canvas = document.getElementById(canvasName);
if (!this._canvas) {
  throw new Error(`Canvas element "${canvasName}" not found`);
}
```

---

### 6. Unchecked Gamepad API Access
**File:** Game.js (line 792)
**Priority:** High

`navigator.getGamepads()` can return null/undefined in some browsers, causing TypeError crashes.

**Recommendation:**
```javascript
const gamepads = navigator.getGamepads?.() || [];
if (!gamepads || gamepads.length === 0) return;
```

---

### 7. Race Condition in MusicPlayer
**File:** MusicPlayer.js (lines 67-77)
**Priority:** High

`onPlaybackEnd()` doesn't check if `isPlaying` changed during timeout execution. If `stop()` is called just before timeout fires, it will restart music unexpectedly.

**Recommendation:**
```javascript
onPlaybackEnd() {
  if (!this.isPlaying) return; // Check state before restarting
  if (this.looping) {
    this.play();
  }
}
```

---

### 8. Missing deltaTime Validation
**File:** VibeEngine.js (lines 169-171)
**Priority:** Medium

If system clock jumps (sleep/resume), deltaTime could be enormous, causing physics errors and entities teleporting.

**Recommendation:**
```javascript
const currentTime = Date.now();
let deltaTime = currentTime - this._lastCallTime;
deltaTime = Math.min(deltaTime, 100); // Cap at 100ms
this._lastCallTime = currentTime;
```

---

### 9. AudioContext State Not Checked
**File:** SoundManager.js (lines 76-94)
**Priority:** Medium

Doesn't validate AudioContext state before creating nodes. If context is closed, operations will fail silently.

**Recommendation:**
```javascript
play(soundName, volume = 1.0) {
  if (this.audioContext.state === 'closed') {
    DebugLogger.error('AudioContext is closed');
    return;
  }
  // ... rest of method
}
```

---

### 10. Infinite Loop Risk in Vector2D
**File:** Vector2D.js (lines 22-26)
**Priority:** Medium

While loops with no iteration limit in `normalizeAngleDiff`. If inputs are NaN or Infinity, loops forever and freezes browser tab.

**Recommendation:**
```javascript
static normalizeAngleDiff(angle) {
  if (!isFinite(angle)) return 0;
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}
```

---

### 11. Memory Leak in ParticleSystem
**File:** ParticleSystem.js (line 70)
**Priority:** Medium

Particle array is filtered every frame. If particles never die (isDead() always false due to bug), array grows unbounded causing memory leak.

**Recommendation:**
```javascript
// Add age limit as failsafe
update(deltaTime) {
  const MAX_PARTICLE_AGE = 10000; // 10 seconds
  this.particles = this.particles.filter(p => {
    p.update(deltaTime);
    return !p.isDead() && p.age < MAX_PARTICLE_AGE;
  });
}
```

---

### 12. Date.now() Instead of performance.now()
**File:** VibeEngine.js (lines 164, 169)
**Priority:** Medium

Uses `Date.now()` which is affected by system clock changes. `performance.now()` is monotonic and immune to clock adjustments.

**Recommendation:**
```javascript
// In start():
this._lastCallTime = performance.now();

// In _loop():
const currentTime = performance.now();
```

---

### 13. Asset Loading Partial Failure Handling
**File:** AssetLoader.js (line 64)
**Priority:** Medium

`Promise.all()` will reject on first failure, leaving partial state with some assets loaded and others not.

**Recommendation:**
```javascript
// Use Promise.allSettled() instead
const results = await Promise.allSettled([...loadPromises]);
const failures = results.filter(r => r.status === 'rejected');
if (failures.length > 0) {
  DebugLogger.error('Some assets failed to load:', failures);
}
```

---

## Missing Unit Tests

### Low Priority
- [ ] **PreferencesManager** - save/load preferences, default values
- [ ] **AssetLoader** - image loading and caching
- [ ] **SoundManager/MusicPlayer** - audio playback (needs mocking)
- [ ] **MenuSystem/DialogSystem** - UI navigation (better tested manually)
- [ ] **AchievementManager/HighScoreManager** - progression tracking

---

## Engine Development Opportunities

Components that could be generalized and moved to VibeEngine:

### High Priority
- [ ] **Minimap** - Generic minimap component with configurable entity icons/colors
- [ ] **AI Utilities** - Common AI patterns (seek, flee, wander, patrol) from NPCAIUtils.js

### Medium Priority
- [ ] **Spawn System** - Generic off-screen/on-screen spawn zone manager
- [ ] **World Wrapping** - WorldBounds utility class for toroidal space
- [ ] **Beam Weapons** - Generalized LineProjectile or RaycastWeapon from BeamWeapon.js

---

## Summary

**Code Issues:** 13 (6 High Priority, 7 Medium Priority)
**Missing Tests:** 5 components (all low priority)
**Engine Opportunities:** 5 components identified
