# Conversion Plan: 2048

## Source Target
- **Repository**: https://github.com/gabrielecirulli/2048
- **Entrypoint**: `js/application.js` → `GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager)`
- **Stack**: Vanilla JavaScript + HTML/CSS (no framework)
- **Nature**: 2D grid-based puzzle game

## Canonical Project Title
**2048** — derived from the original game's title screen and repository name.

## Genre
Puzzle / Tile-sliding

## Gameplay-Critical Systems
1. **4x4 Grid** — column-major storage, cells contain tile references or null
2. **Tile Movement** — arrow keys / swipe to slide all tiles in one direction
3. **Tile Merging** — same-value tiles merge on collision (one merge per tile per move)
4. **Scoring** — score += merged tile value; best score tracked
5. **Spawn** — new tile (90% chance of 2, 10% chance of 4) after each valid move
6. **Win condition** — reaching 2048 tile (configurable); "Keep Playing" option
7. **Loss condition** — no moves available (no empty cells + no adjacent matches)
8. **Visual identity** — specific tile colors per value (#eee4da for 2, #ede0c8 for 4, etc.)

## Asset Extraction Plan
- **No external assets** — the original game is pure HTML/CSS/JS
- Tile colors extracted from `style/main.css`
- Font: "Clear Sans" / Arial fallback → using Arial (universally available)

## Built-ins to Reuse
- None — the game is entirely custom logic with no StemStudio behavior equivalents

## Custom Systems Needed
1. **game2048** behavior — handles all game logic, rendering, and input

## Architecture
Single behavior attached to an anchor box. The behavior:
- Creates a PlaneGeometry (4:5 aspect ratio) with CanvasTexture
- Renders the entire game UI via 2D canvas (board, tiles, scores, overlays)
- Handles keyboard (arrow keys, R) and touch/swipe input
- Uses raycasting for button click detection on the canvas plane

Camera: `cameraType=NONE`, fixed overhead at y=10, looking straight down.

## Configuration Surface
| Parameter | Default | Description |
|-----------|---------|-------------|
| Grid Size | 4 | Grid dimension (3-8) |
| Win Tile Value | 2048 | Target tile to win |
| Chance to Spawn 4 | 0.1 | Probability of spawning a 4 instead of 2 |

## Expected Manual Follow-ups
- None — the game is fully self-contained in the stemscript + behavior

## Routing Strategy
Single scene, single stemscript entrypoint.

## Approximations
- **Tile animations**: The original uses CSS transitions for tile sliding (~100ms), new tile pop-in (~200ms), and merge bounce. The port renders final state immediately. Gameplay is unaffected.
- **Font**: Original uses "Clear Sans" web font. Port uses Arial.
- **Local storage**: Original persists game state and best score across sessions. Port is session-only.
- **Score addition float**: Original shows "+N" floating up from score. Not reproduced.

## Open Questions / Risks
- None identified — straightforward port of a self-contained 2D game.
