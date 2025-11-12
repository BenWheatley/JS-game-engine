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

**Controls:**
- Arrow Up: Forward thrust
- Arrow Down: Reverse thrust
- Arrow Left/Right: Rotate
- Spacebar: Fire weapon

#### **Alien.js** - Enemy Ships
Simple enemy entity with health property, currently spawns from top of screen and moves downward.

#### **Shot.js** - Projectiles
Player weapon projectiles with fixed upward velocity and damage property.

#### **SimpleMusic.js** - Audio System
Web Audio API integration featuring:
- Note-to-frequency conversion (supports standard notation like "A4", "C#5")
- Oscillator-based sound synthesis
- Dynamic note start/stop control

## Demo Game (skeleton.html)

The included demo showcases a space shooter with:

**Implemented Features:**
- Player-centered scrolling camera that follows ship movement
- Periodic alien spawning with rotation animation
- Rate-limited weapon firing
- Fullscreen toggle (ESC key)
- Asset preloading with loading state
- Gamepad connection detection

**Game Loop:**
- Delta-time based updates for frame-rate independent movement
- Separate render and update phases
- RequestAnimationFrame for smooth 60 FPS

## Assets

The engine includes placeholder art assets:
- `player-ship.png` - Player spacecraft sprite
- `alien-ship.png` - Enemy spacecraft sprite
- `energy-blast.png` - Weapon projectile
- `background.png` - Scrolling background
- `planet-1.png`, `planet-2.png` - Environmental objects
- `asteroid-1/2/3.png` - Obstacle sprites
- `slow_guitar.mid` / `.json` - Music data (not yet integrated)

## Known Limitations & TODOs

**Missing Core Features:**
- **No Collision Detection**: Objects pass through each other
- **No Game States**: No start menu, game over, or win conditions
- **No Scoring System**: No points or progression tracking
- **Incomplete Audio Integration**: Music system exists but not used in game

**Incomplete Features:**
- **Gamepad Support**: Detected but not mapped to controls (currently only logs input)
- **Health System**: Defined on entities but never modified
- **Shot Direction**: Shots always fire straight up regardless of player rotation

**Technical Issues:**
- No collision system architecture
- Camera follows player but doesn't account for world boundaries

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
├── SimpleMusic.js        # Web Audio API wrapper
├── skeleton.html         # Demo game
├── soundtest.html        # Audio system test
└── *.png                 # Game assets
```

## Next Steps

Potential areas for development:
1. Implement collision detection (AABB or circle-based)
2. Integrate music system into gameplay
3. Create game state manager (menu, playing, game over)
4. Fix shot direction to match player rotation
5. Complete gamepad control mapping
6. Add particle effects for explosions
7. Implement scoring and difficulty progression

## Development History

Original collaboration with ChatGPT:
- [Public share link](https://chatgpt.com/share/6cc120c4-443c-4915-afe1-b4cceb8484e1)

## License

See LICENSE file for details.
