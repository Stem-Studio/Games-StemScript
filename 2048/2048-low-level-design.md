# 2048 Low-Level Design

## Object Hierarchy

```text
Default Scene
├── GameBoard
│   └── g2048.game behavior
├── DefaultCamera
└── UI Camera
    └── UIKit.Fullscreen root created by the behavior
```

## Requirements Covered

| Requirement ID | Technical Design Coverage | Owning Artifact / System |
|----------------|---------------------------|--------------------------|
| REQ-001 | `Grid` and `GameTile` classes own board state and merge rules. | `2048/behaviors/game2048.yaml` |
| REQ-002 | UIKit tree owns header, score boxes, board cells, instructions, and overlays. | `2048/behaviors/game2048.yaml`, `2048/imports/uikit-dual-mode.yaml` |
| REQ-003 | InputManager polling owns directional keyboard and motion swipe edges. | `2048/behaviors/game2048.yaml` |
| REQ-004 | Docs and validators will encode supported persistence, UIKit, and event-listener patterns from DOT-7609 review. | `docs/domains/*`, `tools/check-*.js` |

## Component Architecture

| Behavior/Lambda | Attached To | Responsibility | Pattern |
|----------------|-------------|----------------|---------|
| `g2048.game` | `GameBoard` | Game state, input polling, UIKit rendering, restart/win/loss flow. | Single behavior with UIKit dual-mode helper. |
| `uikit-dual-mode` script import | Imported script asset | Creates editor/play contexts, root, attach, tick, teardown. | Shared helper script. |

## Data Flow Per Game Event

### Event: Valid Move

```text
InputManager edge -> _inputQueue -> _move(direction) -> Grid mutation -> score/best update -> _dirty -> _updateUI()
```

### Event: Restart

```text
R key or UIKit button -> _restart() -> new Grid -> two start tiles -> _dirty -> _updateUI()
```

### Event: DOT-7609 Persistent Best Score Candidate

```text
engine login event -> supported Game Services helper -> metadata.highscore read/write -> best score UI update
```

The supported generation target should not use deprecated `EventBus.instance.*`, raw `globalThis` service lookups, or document-level keyboard listeners.

## State Ownership Table

| Key / Store Path | Owner | Readers | Sync Mechanism | Reset On |
|-----------------|-------|---------|----------------|----------|
| `_grid` | `g2048.game` | `g2048.game` | Behavior instance field | restart/init |
| `_score` | `g2048.game` | UIKit score text | Behavior instance field | restart/init |
| `_bestScore` | `g2048.game` | UIKit best score text | Behavior instance field; DOT-7609 proposes backend metadata persistence | init or backend load |
| `_over`, `_won`, `_keepGoing` | `g2048.game` | Overlay visibility logic | Behavior instance fields | restart/init |
| `_inputQueue`, `_inputPrev`, `_touchAxisLatched` | `g2048.game` | update loop | Behavior instance fields | init |

## Asset Pipeline

| Asset Key | Source | Format | Calibration Scale | Notes |
|-----------|--------|--------|-------------------|-------|
| `uikit-dual-mode` | `2048/imports/uikit-dual-mode.yaml` | script import | n/a | Shared helper for editor/play UIKit root lifecycle. |

## Init-Order Dependencies

```text
1. Behavior init stores game reference and initializes board state.
2. UIKit play context creates a Fullscreen root with game.renderer.
3. UIKit root attaches to game.uiCamera with deferred retry through helper tick.
4. update polls InputManager and refreshes UI only when state is dirty.
```

## Physics Configuration

No physics objects are required.

## Memory Budget

| Category | Count | Geometry | Materials | Textures | Notes |
|----------|-------|----------|-----------|----------|-------|
| UIKit board | 1 root, header, controls, 16+ cells | UIKit meshes | UIKit managed | none | Count scales with `gridSize * gridSize`. |
| Game state | gridSize squared tiles max | none | none | none | Plain JS objects. |

## API Endpoints

The current main behavior is session-only. DOT-7609 introduces a backend high-score candidate using `api:gameProgress:get` and `api:gameProgress:update`; this pass should translate that into supported Game Services guidance instead of deprecated event/global access.

## Open Technical Questions

- Which official runtime service wrapper should be preferred for in-game score persistence when REST Game Services and websocket bridge APIs are both present.
