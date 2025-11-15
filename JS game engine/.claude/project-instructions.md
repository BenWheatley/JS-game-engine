# Project Instructions

## Development Workflow

- **DO NOT** run `open skeleton.html` or similar browser commands
- The game is already open in a browser tab during development
- `file:///` URLs have CORS restrictions that prevent asset loading
- Testing happens manually by the developer

## Code Style

- Use tabs for indentation (existing project convention)
- Prefer `const` and `let` over `var`
- Use ES6 class syntax for all entities

## Security

- Input sanitization is implemented for player names
- XSS protection uses `textContent` (never `innerHTML`) for user content
- International character support (Unicode) is enabled for player names
