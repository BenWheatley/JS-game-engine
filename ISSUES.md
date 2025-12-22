# Outstanding Issues

**Last Updated:** 2025-12-22

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

### 3. Null Canvas Context Validation
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

### 4. Missing deltaTime Validation
**File:** VibeEngine.js (lines 169-171)
**Priority:** Medium

If system clock jumps (sleep/resume), deltaTime could be enormous, causing physics errors and entities teleporting.

**Recommendation:**
```javascript
const currentTime = performance.now();
let deltaTime = currentTime - this._lastCallTime;
deltaTime = Math.min(deltaTime, 100); // Cap at 100ms
this._lastCallTime = currentTime;
```

---

### 5. Asset Loading Partial Failure Handling
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

**Code Issues:** 5 (1 High Priority, 4 Medium Priority)
**Missing Tests:** 5 components (all low priority)
**Engine Opportunities:** 5 components identified
