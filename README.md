# JavaScript 2D Game Engine - VibeEngine

A lightweight, browser-based 2D game engine built with vanilla JavaScript ES6 modules and HTML5 Canvas. Originally created as a collaboration with ChatGPT to explore AI-assisted game development, now fully modularized.

## Demo

[Live Demo - Space Shooter](https://benwheatley.github.io/JS-game-engine/JS%20game%20engine/skeleton.html)

Use arrow keys to move, spacebar to shoot, and ESC to pause.

## Architecture

This engine uses **ES6 modules** with explicit imports/exports. All engine components are in the `VibeEngine/` directory and can be imported via the barrel export `VibeEngine.js`.

### Core Engine Components (VibeEngine/)

#### **VibeEngine.js** - Main Engine
Singleton-pattern engine providing core game infrastructure:
- **Input System**: Keyboard, mouse, and gamepad input handling
- **Fullscreen API**: Cross-browser fullscreen support with toggle functionality
- Centralized input state accessible to all game objects

#### **Vector2D.js** - Mathematics Library
Complete 2D vector implementation with:
- Standard operations (add, subtract, multiply, divide)
- Geometric functions (dot product, cross product, distance)
- Transformation methods (rotation, lerp, normalize)
- Radial coordinate conversion for rotation-based movement

#### **Sprite.js** - Rendering System
Efficient sprite rendering with:
- Asynchronous image loading with caching
- ImageBitmap API for performance
- Rotation and transformation support
- Loading state management

#### **GameEntity.js** - Base Game Object
Abstract base class providing:
- Position, rotation, and velocity properties
- Physics-based movement updates
- Sprite management and rendering
- Collision detection hooks (onHit, onCollideWithPlayer)
- Minimap rendering interface (getMinimapInfo)

### Game Objects

#### **Player.js** - Player Ship
Fully implemented player character with:
- Thrust-based movement (forward/backward acceleration)
- Rotation controls (left/right turning)
- Maximum speed clamping
- Health: 100-200 HP (shield upgrades)
- **3 Upgrade Paths**:
  - **Weapon**: Fire rate (1.0s → 0.1s) and spread angle (0° → 20°)
  - **Engine**: Speed (1.0x → 1.8x), acceleration (1.0x → 1.6x), rotation (1.0x → 1.5x)
  - **Shield**: Max health (100 → 200 HP), regen rate (0 → 10 HP/s), regen delay (∞ → 3s)

**Menu Controls:**
- Spacebar or A Button: Start game

**In-Game Keyboard Controls:**
- Arrow Up: Forward thrust
- Arrow Down: Reverse thrust
- Arrow Left/Right: Rotate
- Spacebar: Fire weapon
- ESC: Pause game

**In-Game Gamepad Controls:**
- Left Stick (horizontal): Rotate left/right
- Right Stick (vertical): Forward/reverse thrust (analog)
- Right Trigger (RT/R2): Forward thrust (analog)
- Left Trigger (LT/L2): Reverse thrust (analog)
- A Button (Cross on PlayStation): Fire weapon
- Start Button: Pause game

#### **NPC.js** - Base Enemy Class
Abstract base class for all enemy NPCs providing:
- Health system
- Sprite management
- Update and draw methods

#### **Alien.js** - Basic Enemy Ships
Simple enemy entity (100 HP, 100 points) that spawns from top of screen and moves downward.

#### **AlienScout.js** - Scout Ships
Advanced enemy with state machine AI (100 HP, 100 points):
- Picks random target positions near player
- Player-like physics (acceleration, rotation, speed clamping)
- Re-targets when reaching destination or off-screen for 2+ seconds
- Moves at half player speed

#### **AlienFighter.js** - Fighter Ships
Aggressive enemy with shooting capability (100 HP, 200 points):
- 2x speed of AlienScout
- Fires shots forward every 2 seconds
- Same state machine AI as AlienScout

#### **MissileCruiser.js** - Missile Cruiser Ships
Slow, tanky enemy with powerful missiles (200 HP, 300 points):
- Half the speed of AlienScout
- Fires missiles every 4 seconds
- Largest and most durable enemy type

#### **Asteroid.js** - Large Asteroids
Space obstacles (1 HP, 200 points, 50 damage on collision):
- Splits into 3 smaller AsteroidSpawns when destroyed
- Velocity conserved across split asteroids
- Random rotation animation

#### **AsteroidSpawn.js** - Small Asteroids
Fragments from destroyed asteroids (1 HP, 50 points, 25 damage):
- Half the size of parent asteroid
- Faster rotation animation
- Despawns when far from player

#### **Projectile.js** - Base Projectile Class
Abstract base class for all projectiles providing:
- Position and velocity management
- Sprite rendering
- Damage property
- Common update/draw methods

#### **Shot.js** - Energy Blasts
Player weapon projectiles (10 damage):
- Fires in direction player is facing
- Fast-moving energy bolts
- Destroys on impact

#### **Missile.js** - Missiles
Heavy projectiles fired by MissileCruisers (50 damage):
- Slower than regular shots
- Larger sprite
- Higher damage output

#### **MenuSystem.js** - Menu System
Comprehensive menu system with multiple item types:
- **Button**: Clickable buttons with actions
- **Slider**: Range inputs for volume/settings (0-100)
- **Checkbox**: Boolean toggle options (e.g., fullscreen)
- **Text Input**: Player name entry with validation
- **Score List**: High score display with highlighting
- Dynamic menu rendering from configuration objects
- Title, items, and instructions areas
- Supports autofocus for text inputs

#### **HighScoreManager.js** - High Score Management
Dedicated high score system with:
- LocalStorage persistence with max 100 scores
- Input sanitization for XSS prevention
- Unicode name support (Chinese, Arabic, Cyrillic, etc.)
- Smart display logic (top 10, or top 8 + ellipsis + most recent)
- Most recent score highlighted
- Automatic sorting by score descending
- Event-driven integration with game state

#### **AchievementManager.js** - Achievement System
- Tracks and persists achievements using LocalStorage
- Visual notifications on unlock

#### **ParticleSystem.js** - Visual Effects
Particle effects system providing:
- Impact effects (collision sparks)
- Explosion effects (expanding particle clouds)
- Customizable colors per effect type
- Lifecycle management (age-based alpha fade)
- Object pooling for performance
- Integration with collision detection

#### **Wormhole.js** - Level Progression
Wormhole-based level transitions:
- Spawns when all NPCs are destroyed
- Player must enter to advance to next level
- On-screen directional indicator when off-screen

#### **Minimap.js** - Radar Display
- Entity filtering by type (asteroids, enemies, wormhole)
- Different rendering for large/small asteroids
- Color coding (player: blue, enemies: red, asteroids: white, wormhole: white hollow)
- Border rendered on top of entities for clean look

#### **Note.js** - Music System
Web Audio API integration featuring:
- Note-to-frequency conversion (supports standard notation like "A4", "C#5")
- MIDI pitch number to note name conversion
- Oscillator-based sound synthesis with envelope control
- Click-free note start/stop with fade-in/fade-out envelopes
- Dynamic volume control (0.0-1.0)
- Automatic AudioContext initialization
- Static methods for playing and stopping notes globally

#### **SoundManager.js** - Sound Effects System
Handles game audio effects:
- Asynchronous sound file loading with Web Audio API
- Audio buffer caching for instant playback
- Volume control per sound effect
- Supports multiple audio formats (m4a, mp3, wav, ogg)
- Sound preloading during game initialization

#### **MusicPlayer.js** - Background Music System
Plays background music from MIDI data:
- Loads and plays MIDI JSON data (converted from .mid files)
- Converts MIDI pitch numbers to musical notes
- Precise timing using setTimeout scheduling
- Automatic looping support
- Integrates with SimpleMusic.js Note system
- State-aware (plays during gameplay, stops on menu/game over)

## Demo Game (skeleton.html)

The included demo showcases a fully-featured space shooter with:

**Menu System:**
- **Main Menu**: Start game, view high scores, view achievements
- **Pause Menu**: Resume, volume controls (music/SFX), fullscreen toggle, quit
- **Game Over Menu**: Name input, high score submission, restart/menu options
- **High Scores Menu**: Top 10 scores with name, score, date/time, most recent highlighted in red
- **Achievements Menu**: 9 achievements with unlock status, descriptions, and timestamps
- **Upgrade Menu**: 3 upgrade paths (Weapon/Engine/Shield) with 10 levels each
- Dynamic menu generation using MenuSystem.js configuration objects
- Event-driven state transitions

**Gameplay Features:**
- **Wave-based Progression**: Difficulty increases each level
- **Wormhole Level Transitions**: Clear all NPCs → wormhole spawns → enter to advance
- **Upgrade System**: Choose weapon/engine/shield upgrades between waves
- **Achievement System**
- **Particle Effects**: Visual feedback for impacts, explosions, with color customization
- **Game State Manager**: Event-driven architecture with clean state transitions
- **Player-Centered Camera**: Scrolling camera follows ship movement
- **Asset Preloading**: All sprites and sounds loaded before game starts
- **Full Gamepad Support**: Analog controls with deadzone handling for smooth movement
- **Sound Effects**: Volume control for laser, explosions, hits, missile launcher
- **Background Music**: Looping MIDI-based music with volume control during gameplay

**Enemy Types:**
- **Alien Scouts** (100 HP, 100 pts): State machine AI, seeks random positions near player
- **Alien Fighters** (100 HP, 200 pts): 2x speed, shoots plasma every 2 seconds
- **Alien Saucers** (150 HP, 250 pts): Curved ease-in-out movement, fires 8-way ring after stopping
- **Missile Cruisers** (200 HP, 300 pts): Slow, tanky, fires powerful missiles every 4 seconds
- **Asteroids** (3 HP, 200 pts): Split into 3 smaller fragments when destroyed, multi-hit
- **Asteroid Spawns** (1 HP, 50 pts): Small fragments from destroyed asteroids

**Game Loop:**
- Delta-time based updates for frame-rate independent movement
- Separate render and update phases
- RequestAnimationFrame for smooth 60 FPS

**Collision System:**
- AABB (Axis-Aligned Bounding Box) collision detection

## Assets

**Visual Assets:**
- `player-ship.png` - Player spacecraft sprite (48x48)
- `alien-ship.png` - Basic alien enemy sprite (48x48)
- `alien-scout.png` - Scout ship sprite (50x50)
- `alien-fighter.png` - Fighter ship sprite (50x50)
- `missile_ship.png` - Missile cruiser sprite (60x60)
- `asteroid-big.png` - Large asteroid sprite (60x60)
- `asteroid-medium.png` - Medium asteroid sprite (40x40)
- `asteroid-small.png` - Small asteroid fragment sprite (30x30)
- `laser.png` - Player weapon projectile (10x10)
- `plasma.png` - Enemy fighter projectile (10x10)
- `missile.png` - Missile projectile (20x20)
- `wormhole.png` - Wormhole portal sprite (81x84)
- `background.png` - Scrolling space background (1536x1024 tileable)
- `title.png` - Game title image for main menu

**Audio Assets:**
- `laser_1.2.m4a` - Player weapon firing sound
- `explosion_medium.m4a` - Alien/asteroid destruction sound
- `explosion_small.m4a` - Player hit/collision sound
- `missile_launcher.m4a` - Missile cruiser firing sound
- `pulse 2.m4a` - Alternative weapon sound (available for future use)
- `slow_guitar.json` - Background music MIDI data (76 seconds, auto-looping)
- `slow_guitar.mid` - Original MIDI file

## Known Limitations & TODOs

**Technical Issues:**
- **No Automated Tests**: Missing unit tests for collision, spawn distribution, etc.
- **No Build Process**: No minification, bundling, or source maps
- **Collision Detection**: Basic AABB O(n²) (acceptable for current scale, could optimize with QuadTree)
- **No Screen Shake**: Missing camera shake for impacts
- **Limited Audio**: No engine sounds or ambient space audio
- **No Mobile Support**: No touch controls for mobile devices
- **Global References**: Some globals (engine, menuSystem, soundManager) still used in Game.js - should use dependency injection

## Getting Started

1. Clone the repository
2. Open `JS game engine/skeleton.html` in a web browser
3. Or serve via local web server for development:
   ```bash
   python -m http.server 8000
   # Then visit http://localhost:8000/JS%20game%20engine/skeleton.html
   ```

## File Structure

```
JS game engine/
├── VibeEngine/                    # Engine modules (ES6)
│   ├── VibeEngine.js              # Barrel export for all engine classes
│   ├── Vector2D.js                # 2D vector mathematics
│   ├── Sprite.js                  # Sprite rendering system
│   ├── Projectile.js              # Base projectile class
│   ├── Particle.js                # Individual particle class
│   ├── ParticleSystem.js          # Visual effects system
│   ├── CollisionDetection.js      # AABB collision detection
│   ├── Note.js                    # Web Audio API wrapper for music
│   ├── MusicPlayer.js             # MIDI player using Note.js
│   ├── SoundManager.js            # Sound effects manager
│   ├── MenuSystem.js              # Dynamic menu system
│   ├── HighScoreManager.js        # High score persistence
│   ├── AchievementManager.js      # Achievement tracking
│   ├── PreferencesManager.js      # Settings persistence
│   ├── AssetLoader.js             # Preload sprites and sounds
│   └── DebugLogger.js             # Conditional debug logging
├── main.js                        # Game entry point (ES6 module)
├── Game.js                        # Game class (extends EventTarget)
├── GameEntity.js                  # Base game object class
├── GameConfig.js                  # Centralized configuration
├── NPC.js                         # Base NPC/enemy class
├── NPCAIUtils.js                  # Shared AI utilities
├── SpawnSystem.js                 # Wave-based enemy spawning
├── Player.js                      # Player ship with upgrades
├── AlienScout.js                  # Scout ship with AI
├── AlienFighter.js                # Fighter ship with plasma
├── AlienSaucer.js                 # Saucer with 8-way attack
├── MissileCruiser.js              # Tanky ship with missiles
├── Asteroid.js                    # Multi-hit asteroids
├── AsteroidSpawn.js               # Small asteroid fragments
├── Laser.js                       # Player laser projectiles
├── Plasma.js                      # Enemy plasma projectiles
├── Missile.js                     # Missile projectiles
├── Wormhole.js                    # Level transition portals
├── Minimap.js                     # Radar display system
├── UpgradeBackground.js           # Animated upgrade menu background
├── css.css                        # Menu and UI styling
├── skeleton.html                  # Demo game HTML
├── *.png                          # Visual assets (sprites)
├── *.m4a                          # Sound effect files
└── slow_guitar.json               # Background music data
```

## Next Steps

**Immediate Priorities:**
1. **Remove Globals**: Refactor Game.js to accept engine, menuSystem, soundManager via constructor
2. **Add Error Handling**: Try-catch for localStorage operations
3. **ESLint Integration**: Add linting to development workflow
4. **Optimize Assets**: Resize oversized sprites if any remain

**Feature Development:**
5. Add temporary power-ups (health packs, damage boost, invincibility, score multipliers)
6. Add more enemy types (bombers, drones, boss enemies with unique mechanics)
7. Add visual effects (screen shake on hits, muzzle flash, damage indicators, thruster trails)
8. Add more sound variety (engine sounds, ambient space sounds, additional music tracks)
9. Implement combo system (score multipliers for consecutive kills without taking damage)
10. Mobile touch controls for broader accessibility
11. Boss encounters at milestone waves (5, 10, 15, etc.)

**Technical Improvements:**
13. Add automated testing (Vitest/Jest for collision, spawn, input sanitization)
14. Implement build process (Vite for HMR, minification, bundling)
15. Add ESLint configuration for code quality
16. Consider spatial partitioning (QuadTree) if entity counts grow significantly

## Development History

This project was developed through AI collaboration:

**Phase 1 - Initial Engine (ChatGPT):**
- Core engine architecture (GPTEngine, Vector2D, Sprite, GameEntity)
- Basic game loop and input systems
- Player movement and shooting
- Simple enemy spawning
- [Public share link](https://chatgpt.com/share/6cc120c4-443c-4915-afe1-b4cceb8484e1)

**Phase 2 - Advanced Features (Claude Code):**
- Advanced enemy AI with state machines
- Multiple enemy types with unique behaviors
- Comprehensive menu system with persistence
- High score system with localStorage
- HUD improvements (graphical health bar, mini-map)
- Asteroid splitting mechanics
- Projectile inheritance refactoring
- Volume controls and preferences
- Enhanced game states (pause menu, game over flow)

**Phase 3 - Polish & Refactoring (Claude Code - November 2024):**
- **Array Unification**: Consolidated entity arrays (eliminated ~200 lines of duplication)
- **Particle System**: Impact and explosion effects with color customization
- **Wormhole Progression**: Wave-based level advancement with visual indicators
- **Code Extraction**: HighScoreManager.js separated from main file
- **Input Sanitization**: XSS prevention with Unicode name support
- **Bug Fixes**: Game timing (Date.now → gameTime), audio system (dual AudioContext), spawn positioning
- **Architecture Improvements**: Unified collision system, instanceof-based polymorphism
- **Enhanced Minimap**: Entity filtering, wormhole rendering, improved visual hierarchy

**Phase 4 - ES6 Modules & Systems (Claude Code - November 2024):**
- **ES6 Module System**: Converted all files to ES6 modules with explicit imports/exports
- **Engine Organization**: Moved all engine files to `VibeEngine/` directory
- **Upgrade System**: 3 upgrade paths (Weapon/Engine/Shield) with 20 total levels
- **Achievement System**: 9 achievements with localStorage persistence
- **Shield Regeneration**: Auto-healing system with configurable delay and rate
- **Event-Driven Architecture**: Game class extends EventTarget for clean state management
- **Alien Saucer**: New enemy with curved movement and 8-way ring attack
- **Code Extraction**: SpawnSystem.js, main.js, UpgradeBackground.js separated from skeleton.html
- **Import Resolution**: Fixed all circular dependencies and missing imports

## License

See LICENSE file for details.
