# JavaScript 2D Game Engine

A lightweight, browser-based 2D game engine built with vanilla JavaScript and HTML5 Canvas. Originally created as a collaboration with ChatGPT to explore AI-assisted game development.

## Demo

[Live Demo - Space Shooter](https://benwheatley.github.io/JS-game-engine/JS%20game%20engine/skeleton.html)

Use arrow keys to move, spacebar to shoot, and ESC to toggle fullscreen.

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
- Configurable physics constants

**Menu Controls:**
- Spacebar or A Button: Start game

**In-Game Keyboard Controls:**
- Arrow Up: Forward thrust
- Arrow Down: Reverse thrust
- Arrow Left/Right: Rotate
- Spacebar: Fire weapon
- ESC: Toggle fullscreen

**In-Game Gamepad Controls:**
- Left Stick (horizontal): Rotate left/right
- Right Stick (vertical): Forward/reverse thrust (analog)
- Right Trigger (RT/R2): Forward thrust (analog)
- Left Trigger (LT/L2): Reverse thrust (analog)
- A Button (Cross on PlayStation): Fire weapon
- Start Button: Toggle fullscreen

**Game Over Controls:**
- R: Restart game
- M: Return to menu

#### **Alien.js** - Enemy Ships
Simple enemy entity with health property, currently spawns from top of screen and moves downward.

#### **Shot.js** - Projectiles
Player weapon projectiles with configurable velocity that fires in the direction the player is facing.

#### **SimpleMusic.js** - Music System
Web Audio API integration featuring:
- Note-to-frequency conversion (supports standard notation like "A4", "C#5")
- MIDI pitch number to note name conversion
- Oscillator-based sound synthesis with envelope control
- Click-free note start/stop with fade-in/fade-out envelopes
- Dynamic note start/stop control
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

The included demo showcases a space shooter with:

**Implemented Features:**
- Game state manager with menu, playing, and game over states
- Start menu with instructions and controls
- Game over screen with final score and restart options
- Player-centered scrolling camera that follows ship movement
- Periodic alien spawning with rotation animation
- Rate-limited weapon firing that follows player rotation direction
- Fullscreen toggle (ESC key or Start button)
- Asset preloading with loading state
- Full gamepad support with analog controls and deadzone handling
- AABB collision detection (shots destroy aliens, aliens damage player)
- Scoring system (100 points per alien destroyed)
- HUD displaying health and score
- Player death and game over when health reaches zero
- Sound effects system with shooting, explosion, and hit sounds
- Background music system that plays during gameplay and loops automatically

**Game Loop:**
- Delta-time based updates for frame-rate independent movement
- Separate render and update phases
- RequestAnimationFrame for smooth 60 FPS

**Collision System:**
- AABB (Axis-Aligned Bounding Box) collision detection
- Shot-alien collisions: Both entities destroyed on impact, awards 100 points
- Player-alien collisions: Alien destroyed, player takes damage equal to alien's health (100)
- Game over triggered when player health reaches zero

**Game State System:**
- **Menu State**: Title screen with instructions, press Space or A button to start
- **Playing State**: Active gameplay with HUD showing health and score
- **Game Over State**: Shows final score with options to restart (R) or return to menu (M)
- State transitions handle game reset and cleanup
- ESC key toggles fullscreen in all states

## Assets

**Visual Assets:**
- `player-ship.png` - Player spacecraft sprite
- `alien-ship.png` - Enemy spacecraft sprite
- `energy-blast.png` - Weapon projectile
- `background.png` - Scrolling background
- `planet-1.png`, `planet-2.png` - Environmental objects
- `asteroid-1/2/3.png` - Obstacle sprites
- `interstellar-news-anchors.png` - Additional artwork

**Audio Assets:**
- `laser_1.2.m4a` - Player weapon firing sound
- `explosion_medium.m4a` - Alien destruction sound
- `explosion_small.m4a` - Player hit/collision sound
- `missile_launcher.m4a` - Alternative weapon sound (available for future use)
- `pulse 2.m4a` - Alternative weapon sound (available for future use)
- `slow_guitar.json` - Background music MIDI data (76 seconds, auto-looping)
- `slow_guitar.mid` - Original MIDI file

## Known Limitations & TODOs

**Incomplete Features:**
- **No Difficulty Progression**: Game maintains same difficulty throughout
- **No High Score System**: Score resets each game with no persistence

**Technical Issues:**
- Camera follows player but doesn't account for world boundaries
- Collision detection uses basic AABB (could be optimized with spatial partitioning for large entity counts)

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
├── Player.js             # Player ship implementation
├── Alien.js              # Enemy ship class
├── Shot.js               # Projectile class
├── SimpleMusic.js        # Web Audio API wrapper for music synthesis
├── MusicPlayer.js        # Background music player for MIDI data
├── SoundManager.js       # Sound effects manager
├── skeleton.html         # Demo game
├── soundtest.html        # Audio system test
├── *.png                 # Game assets
├── *.m4a                 # Sound effect files
└── slow_guitar.json      # Background music data
```

## Next Steps

Potential areas for development:
1. Add particle effects for explosions and thruster trails
2. Implement difficulty progression (faster spawn rates, increased alien speed)
3. Add high score persistence (localStorage or backend)
4. Add power-ups (health packs, weapon upgrades, shields)
5. Add different enemy types with varied behaviors
6. Implement world boundaries or wrapping
7. Add visual effects (screen shake on hits, muzzle flash)
8. Add more sound variety (engine sounds, ambient space sounds, additional music tracks)
9. Add music volume control in menu

## Development History

Original collaboration with ChatGPT:
- [Public share link](https://chatgpt.com/share/6cc120c4-443c-4915-afe1-b4cceb8484e1)

## License

See LICENSE file for details.
