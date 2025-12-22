# VibeEngine - JavaScript 2D Game Engine

A lightweight, modular 2D game engine built with vanilla JavaScript ES6 modules and HTML5 Canvas, featuring comprehensive collision detection (AABB/Circle/Polygon), entity management, particle effects, and a complete space shooter demo with upgrades, achievements, and wave-based progression.

## [Live Demo - Space Shooter](https://benwheatley.github.io/JS-game-engine/JS%20game%20engine/skeleton.html)

**Controls:**
- Arrow Keys / Left Stick: Move
- Spacebar / A Button: Shoot
- ESC / Start: Pause

## Features

**Engine:**
- ES6 module architecture
- Multi-shape collision detection (AABB, Circle, Polygon with SAT)
- Entity management with lifecycle hooks
- Camera system with world/screen conversion
- Particle effects system
- Web Audio API for sound and music

**Demo Game:**
- Wave-based space shooter
- 3 upgrade paths (Weapon/Engine/Shield) with 10 levels each
- 6 enemy types with unique AI behaviors
- Achievement system
- High score tracking with localStorage
- Full gamepad support

## Getting Started

1. Clone the repository
2. Open `JS game engine/skeleton.html` in a browser
3. Or serve locally: `python -m http.server 8000`

## Testing

- **Unit Tests**: `UnitTests.html` - 220+ automated tests
- **Interactive**: `CollisionTest.html` - Visual collision verification

## Development

Originally created through AI collaboration (ChatGPT + Claude Code, 2024-2025) exploring AI-assisted game development.

See `ISSUES.md` for outstanding tasks and improvement opportunities.

## License

See LICENSE file for details.
