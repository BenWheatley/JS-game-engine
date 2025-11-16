# JavaScript 2D Game Engine

A lightweight, browser-based 2D game engine built with vanilla JavaScript and HTML5 Canvas. Originally created as a collaboration with ChatGPT to explore AI-assisted game development.

## Demo

[Live Demo - Space Shooter](https://benwheatley.github.io/JS-game-engine/JS%20game%20engine/skeleton.html)

Use arrow keys to move, spacebar to shoot, and ESC to pause.

## Architecture

### Core Engine Components

#### **GPTEngine.js** - Main Engine
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

### Game Objects

#### **Player.js** - Player Ship
Fully implemented player character with:
- Thrust-based movement (forward/backward acceleration)
- Rotation controls (left/right turning)
- Maximum speed clamping
- Health: 100 HP
- Configurable physics constants

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
- Separation of concerns from main game logic

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
- Smooth rotation animation (0.5 Hz)
- Wraps at world boundaries like NPCs
- Rendered on minimap as hollow white circle
- On-screen directional indicator when off-screen

#### **Minimap.js** - Radar Display
Enhanced minimap system with:
- 150x150px radar in top-right corner
- Player-centered view (1000 unit range)
- Entity filtering by type (asteroids, enemies, wormhole)
- Different rendering for large/small asteroids
- Color coding (player: blue, enemies: red, asteroids: white, wormhole: white hollow)
- Border rendered on top of entities for clean look

#### **SimpleMusic.js** - Music System
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
- **Main Menu**: Start game, view high scores, achievements placeholder
- **Pause Menu**: Resume, volume controls (music/SFX), fullscreen toggle, quit
- **Game Over Menu**: Name input, high score submission, restart/menu options
- **High Scores Menu**: Top 10 scores with name, score, date/time, most recent highlighted in red
- Dynamic menu generation using MenuSystem.js configuration objects

**Gameplay Features:**
- **Wave-based Progression**: Difficulty increases each level, spawn counts grow exponentially
- **Wormhole Level Transitions**: Clear all NPCs → wormhole spawns → enter to advance
- **Particle Effects**: Visual feedback for impacts, explosions, with color customization
- **Game State Manager**: Menu, playing, paused, and game over states with smooth transitions
- **Player-Centered Camera**: Scrolling camera follows ship movement through infinite space
- **Unified Entity System**: NPCs and projectiles managed in consolidated arrays for efficiency
- **Rate-Limited Weapons**: Shot cooldown respects game time (pauses when game pauses)
- **Asset Preloading**: All sprites loaded before game starts, loading state displayed
- **Full Gamepad Support**: Analog controls with deadzone handling for smooth movement
- **Sound Effects**: Volume control for laser, explosions, hits, missile launcher
- **Background Music**: Looping MIDI-based music with volume control during gameplay

**Enemy Types:**
- **Basic Aliens** (100 HP, 100 pts): Simple downward movement
- **Alien Scouts** (100 HP, 100 pts): State machine AI, seeks random positions near player
- **Alien Fighters** (100 HP, 200 pts): 2x speed, shoots at player every 2 seconds
- **Missile Cruisers** (200 HP, 300 pts): Slow, tanky, fires powerful missiles every 4 seconds
- **Asteroids** (1 HP, 200 pts): Split into 3 smaller fragments when destroyed
- **Asteroid Spawns** (1 HP, 50 pts): Small fragments from destroyed asteroids

**HUD Features:**
- **Health Bar**: Graphical bar (100px wide, green/red, white border) showing current HP
- **Score Display**: Current score in top-left
- **Wave Level Display**: Current wave number (top center, appears when wormhole spawns)
- **Wormhole Indicator**: "Wormhole detected!" message and directional arrow when wormhole is off-screen
- **Mini-Map**: 150x150px radar in top-right showing:
  - Player as blue dot (always centered)
  - Asteroids as white squares (size-differentiated)
  - All enemy types as red squares
  - Wormhole as hollow white circle
  - 1000 unit range from player
  - Border rendered on top for clean visual hierarchy

**Collision & Combat:**
- **AABB Collision Detection**: Axis-aligned bounding box checks for all entities
- **Unified Collision System**: Single loop handles all NPC vs projectile interactions
- **Multi-Hit Enemies**: Missile Cruisers (200 HP) and Asteroids (variable) require multiple hits
- **Particle Effects**: Impact sparks and explosions on all collisions with color customization
- **Asteroid Splitting**: Large asteroids split into 3 smaller pieces with velocity conservation
- **Enemy Projectiles**: Plasma shots (25 damage) and missiles (50 damage) from NPCs
- **Collision Damage**: Based on entity type (asteroids: 50/25, NPCs: health value)
- **Visual Feedback**: Different particle colors for different entity types (asteroid spawns: orange)

**Persistence:**
- **High Scores**: Stored in localStorage with name, score, and timestamp
  - Top 10 displayed normally
  - Scores ranked 11+ show positions 1-8, "…", then recent score at position 10
  - Most recent score highlighted in bold red
- **Preferences**: Volume settings (music/SFX) saved to localStorage
  - Default volume: 100%
  - Settings persist across sessions

**Game Loop:**
- Delta-time based updates for frame-rate independent movement
- Separate render and update phases
- RequestAnimationFrame for smooth 60 FPS

**Collision System:**
- AABB (Axis-Aligned Bounding Box) collision detection
- Player shots vs enemies: Damage based on shot damage (10) and enemy health
- Player vs enemies: Collision damage equals enemy health, enemy destroyed
- Player vs asteroids: 50 damage (large) or 25 damage (small), asteroid destroyed
- Enemy shots vs player: 25 damage from AlienFighter shots
- Missiles vs player: 50 damage from MissileCruiser missiles
- Asteroid splits: Create 3 smaller asteroids with velocities summing to original
- Game over triggered when player health reaches zero

**Game State System:**
- **Menu State**: Main menu with start, high scores, and achievements options
- **Playing State**: Active gameplay with HUD (health bar, score, mini-map)
- **Paused State**: Pause menu with volume controls, fullscreen, and quit
- **Game Over State**: Name input and high score submission
- State transitions handle game reset and cleanup
- ESC key pauses during gameplay
- Quitting with score > 0 shows game over screen for high score submission

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
- `interstellar-news-anchors.png` - Additional artwork

**Audio Assets:**
- `laser_1.2.m4a` - Player weapon firing sound
- `explosion_medium.m4a` - Alien/asteroid destruction sound
- `explosion_small.m4a` - Player hit/collision sound
- `missile_launcher.m4a` - Missile cruiser firing sound
- `pulse 2.m4a` - Alternative weapon sound (available for future use)
- `slow_guitar.json` - Background music MIDI data (76 seconds, auto-looping)
- `slow_guitar.mid` - Original MIDI file

## Known Limitations & TODOs

**Recently Completed:** ✅
- ~~Difficulty progression~~ - Wave-based spawning with exponential growth
- ~~Particle effects~~ - Impact and explosion effects implemented
- ~~Level progression~~ - Wormhole-based level advancement
- ~~Input sanitization~~ - XSS prevention for high scores
- ~~Code duplication~~ - Array unification eliminated ~200 lines
- ~~Game time vs wall-clock~~ - Shot cooldowns now use game time

**Incomplete Features:**
- **No Power-ups**: No health packs, weapon upgrades, or shields
- **Limited Enemy Variety**: Could use more enemy types with unique behaviors (bombers, drones, bosses)
- **No Boss Encounters**: Final wave could feature boss enemy with unique mechanics
- **No Achievements System**: Placeholder in menu but not implemented

**Technical Issues:**
- **Monolithic Main File**: skeleton.html still ~1100 lines (extraction in progress)
- **No Automated Tests**: Missing unit tests for collision, spawn distribution, etc.
- **No Build Process**: No minification, bundling, or source maps
- **Collision Detection**: Basic AABB O(n²) (acceptable for current scale, could optimize with QuadTree)
- **No Screen Shake**: Missing camera shake for impacts
- **Limited Audio**: No engine sounds or ambient space audio
- **No Mobile Support**: No touch controls for mobile devices

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
├── GPTEngine.js          # Core engine singleton
├── Vector2D.js           # 2D vector mathematics
├── Sprite.js             # Sprite rendering system
├── GameEntity.js         # Base game object class
├── GameConfig.js         # Centralized configuration constants
├── NPC.js                # Base NPC/enemy class
├── NPCAIUtils.js         # Shared AI utilities for NPCs
├── Player.js             # Player ship implementation
├── Alien.js              # Basic enemy ship class
├── AlienScout.js         # Scout ship with AI
├── AlienFighter.js       # Fighter ship with shooting
├── MissileCruiser.js     # Tanky ship with missiles
├── Asteroid.js           # Large asteroids
├── AsteroidSpawn.js      # Small asteroid fragments
├── Projectile.js         # Base projectile class
├── Laser.js              # Player laser projectiles
├── Plasma.js             # Enemy plasma projectiles
├── Missile.js            # Missile projectiles
├── Wormhole.js           # Level transition portals
├── ParticleSystem.js     # Visual effects system
├── Particle.js           # Individual particle class
├── SimpleMusic.js        # Web Audio API wrapper for music synthesis
├── MusicPlayer.js        # Background music player for MIDI data
├── SoundManager.js       # Sound effects manager
├── MenuSystem.js         # Dynamic menu system
├── HighScoreManager.js   # High score persistence and display
├── Minimap.js            # Radar display system
├── css.css               # Menu and UI styling
├── skeleton.html         # Demo game (~1100 lines, being refactored)
├── soundtest.html        # Audio system test
├── *.png                 # Visual assets (sprites)
├── *.m4a                 # Sound effect files
└── slow_guitar.json      # Background music data
```

## Next Steps

**Immediate Priorities:**
1. **Continue Refactoring**: Extract SpawnSystem.js and CollisionSystem.js from skeleton.html
2. **Add Error Handling**: Try-catch for localStorage operations
3. **Move Magic Numbers**: Collision damage values to GameConfig.js
4. **Optimize Assets**: Resize oversized sprites (energy-blast.png, alien-ship.png)

**Feature Development:**
5. Add power-ups (health packs, weapon upgrades, shields, temporary invincibility)
6. Add more enemy types (bombers, drones, boss enemies with unique mechanics)
7. Implement achievements system (currently placeholder in menu)
8. Add visual effects (screen shake on hits, muzzle flash, damage indicators, thruster trails)
9. Add more sound variety (engine sounds, ambient space sounds, additional music tracks)
10. Implement combo system (score multipliers for consecutive kills)
11. Add different weapon types (spread shot, laser beam, homing missiles)
12. Mobile touch controls for broader accessibility

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

**Phase 3 - Polish & Refactoring (Claude Code - November 2025):**
- **Array Unification**: Consolidated entity arrays (eliminated ~200 lines of duplication)
- **Particle System**: Impact and explosion effects with color customization
- **Wormhole Progression**: Wave-based level advancement with visual indicators
- **Code Extraction**: HighScoreManager.js separated from main file
- **Input Sanitization**: XSS prevention with Unicode name support
- **Bug Fixes**: Game timing (Date.now → gameTime), audio system (dual AudioContext), spawn positioning
- **Architecture Improvements**: Unified collision system, instanceof-based polymorphism
- **Enhanced Minimap**: Entity filtering, wormhole rendering, improved visual hierarchy

## License

See LICENSE file for details.
