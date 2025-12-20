# Outstanding Issues

**Last Updated:** 2025-12-20

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

**Code Issues:** 2
**Missing Tests:** 5 components (all low priority)
**Engine Opportunities:** 5 components identified
