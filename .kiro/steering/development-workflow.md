# Development Workflow

## How to Run the Game

1. Open `flappy-kiro/index.html` in a modern browser (Chrome, Firefox, Safari, Edge)
2. No build step needed — ES6 modules load directly
3. Note: Must be served via HTTP (not `file://`) due to ES module CORS restrictions
   - Use any local server: `npx serve flappy-kiro/` or VS Code Live Server extension

## How to Run Tests

```bash
cd flappy-kiro
npm install        # First time only
npm test           # Run all tests once
```

## Making Changes

### Adding a new game constant
1. Add it to `CONFIG` in `js/config.js`
2. Import `CONFIG` where needed
3. Never hardcode values in other files

### Modifying physics
1. Change constants in `config.js` (GRAVITY, FLAP_VELOCITY, SCROLL_SPEED, etc.)
2. Run property tests to verify correctness properties still hold
3. Playtest in browser to verify feel

### Adding a new subsystem
1. Create `js/NewSystem.js` with ES6 class
2. Add `<script type="module" src="js/NewSystem.js"></script>` to index.html
3. Import and instantiate in `GameEngine.js`
4. Add update/render calls in the appropriate phase
5. Write unit tests in `tests/unit/newSystem.test.js`
6. Write property tests if the system has formal correctness properties

### Modifying collision behavior
1. Edit `CollisionDetector.js` static methods
2. Run property tests (Properties 9, 10) to verify AABB correctness
3. Adjust `HITBOX_SHRINK` in config.js if collision feel needs tuning

## Common Issues

### Game doesn't load
- Check browser console for module loading errors
- Ensure you're serving via HTTP, not opening file:// directly
- Verify asset paths in `ASSET_MANIFEST` are correct relative to index.html

### Tests fail after changes
- Run `npm test` to see which properties/tests break
- Property test failures indicate a correctness violation — fix the implementation
- Unit test failures may need test updates if behavior intentionally changed

### Performance issues
- Check that object pools aren't exhausted (console warnings)
- Verify dt clamping is working (max 1/30s)
- Ensure render order groups same-type sprites (sprite batching)

## Git Workflow

- The `flappy-kiro/node_modules/` directory is development-only (testing)
- The game itself has zero runtime dependencies
- Commit all `js/` files, `index.html`, `package.json`, `vitest.config.js`, and `tests/`
- Do NOT commit `node_modules/`
