# Testing Guide

## Running Tests

```bash
# Run all tests once (from flappy-kiro/ directory)
npm test

# Run tests in watch mode
npm run test:watch

# Run a specific test file
npx vitest --run tests/unit/player.test.js

# Run only property tests
npx vitest --run tests/properties/
```

## Test Framework

- **Vitest** — fast, ESM-native test runner
- **fast-check** — property-based testing library
- **Environment:** Node.js (no browser needed for logic tests)

## Test Structure

```
tests/
├── unit/                    # One file per module, example-based
├── properties/              # One file per domain, property-based (100 iterations)
└── integration/             # Full game loop cycle tests
```

## Writing Unit Tests

- Import from `../../js/ModuleName.js`
- Mock browser APIs (Image, Audio, localStorage, canvas context) since tests run in Node
- Use `vi.fn()` for spies and mocks
- Test boundary values explicitly (e.g., velocity = ±IDLE_THRESHOLD)

## Writing Property Tests

- Use `fc.assert(fc.property(...), { numRuns: 100 })`
- Generate inputs with appropriate constraints (positive dt, valid positions)
- Use `Math.fround()` for float constraints when fast-check requires it
- Each property test validates a specific correctness property from the design doc
- Tag tests with the property number: "Property N: description"

## Mocking Patterns

### Image/Audio (AssetLoader tests)
```javascript
class MockImage {
  set src(value) {
    this._src = value;
    setTimeout(() => this.onload && this.onload(), 0);
  }
}
globalThis.Image = MockImage;
```

### localStorage (ScoreManager tests)
```javascript
const mockStorage = {};
globalThis.localStorage = {
  getItem: (key) => mockStorage[key] ?? null,
  setItem: (key, val) => { mockStorage[key] = String(val); }
};
```

### Canvas context (render tests)
```javascript
const ctx = {
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  drawImage: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  clearRect: vi.fn(),
  fillText: vi.fn(),
  // ... add as needed
};
```

## Key Testing Principles

- Logic modules (Player, CollisionDetector, ScoreManager, PipeGenerator, CoinSystem) are fully testable without DOM
- Render methods are tested by verifying ctx method calls, not visual output
- Property tests prove universal correctness; unit tests cover specific edge cases
- Audio failures should never cause test failures (non-fatal by design)
