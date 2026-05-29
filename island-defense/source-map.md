# Source Map — Island Defense

## Source Inputs

The repo `quangrau/island-defense-demo` only ships the built distribution (`assets/island-defense-vnoha80H.js`, 1.4 MB minified, **no sourcemap**). Game logic is reverse-engineered from:

| Input | Use |
|---|---|
| `index.html` | DOM scaffold (single `#root` div for React) |
| `assets/island_defense/assets.json` | Authoritative manifest of asset dimensions, frame counts, and file paths |
| `assets/island_defense/sounds/` | BGM + SFX (10 files); 4 selected for Phase 1 import |
| `assets/island_defense/units/`, `buildings/`, `terrain/`, `particles/`, `ui/` | ~250 PNG sprite sheets (deferred to Phase 2 — see FDR-002) |
| `README.md` | Test Panel control list + camera spec |
| `chongdashu/phaserjs-tinyswords/public/index.html` | Code-pattern reference for Phaser scene structure, AIController, unit waypoints (different game, but same author family / similar idioms) |

Cached locally:
- `docs/source/island-defense-min.js` (full minified bundle)
- `docs/source/assets.json` (manifest)
- `docs/source/castle-clash-duel.html` (tinyswords reference)

## Source → Stem Mapping

| Source Component (Phaser/React) | Stem Equivalent |
|---|---|
| `BootScene.preload()` | Phase 1: not needed (no asset load). Phase 2: imported assets resolved in behavior `init` via `erth.asset.image.findByName`. |
| `MenuScene` / `WorldMapScene` / `LevelIntroScene` | Phase 1: skipped (demo doesn't have these; Test Panel is the menu). |
| `GameScene.create()` | Behavior `init` builds UIKit Fullscreen + sub-containers |
| `GameScene.gameState` | `this._state` instance fields inside the behavior |
| `GameScene.buildTerrain()` | Phase 1: blue/beige UIKit gradient backgrounds |
| `GameScene.createCastles()` | Two UIKit containers (blue + red) at fixed screen positions |
| `GameScene.spawnUnit(team, type, x, y)` | `_spawnUnit` method — creates UIKit container, pushes to `this._units` |
| `GameScene.update()` (per-frame motion + AI) | Behavior `update(deltaTime)` |
| `AIController.spawnTimer / update / spawnUnit` | `this._aiTimer` + `_updateAI(dt)` + `_spawnUnit('red', 'warrior', ...)` |
| `AIController.spawnInterval` (lerp from start to min over `aiScaleTime`) | Same lerp formula in `_updateAI` |
| `UIScene` (Phaser HUD) | UIKit HUD container parented to root |
| `PauseScene` / `GameOverScene` | UIKit overlay containers; banner triggers from Test Panel |
| `localStorage.castle-clash-duel_highscore` | Not used (demo has no high-score persistence) |
| Phaser arcade physics + waypoint pathing | Manual position lerp + distance check (FDR-003) |
| Phaser `setCameraBounds` + pinch-zoom controls | Fixed orthographic camera (FDR-001) |
| Sprite-sheet animations (Phaser AnimationManager) | None Phase 1; UV-cycling sprite material in Phase 2 (FDR-002) |
| Phaser audio (`scene.sound.play(...)`) | Stem audio system (Phase 2) — Phase 1 imports audio but does not yet play |

## Port Mapping

| Source area | Port location |
|---|---|
| Whole game | `island-defense/behaviors/islandDefenseGame.yaml` (single behavior) |
| Stemscript scene + asset imports | `island-defense/island-defense.stemscript` |
| Audio assets | `island-defense/assets/sounds/{bg_loop, sword_impact_hit_1, finish, defeat}.mp3` |
| Image assets | (Phase 2) `island-defense/assets/{buildings, units, terrain, ui}/...` |

## Knowledge Sources

- README: https://github.com/quangrau/island-defense-demo#readme
- Asset manifest: cached at `docs/source/assets.json`
- Reference Phaser code: cached at `docs/source/castle-clash-duel.html`
- Stem reference: `2048/behaviors/game2048.yaml` (single-behavior UIKit pattern)
- Stem reference: `math-meteors/behaviors/mathMeteorsGame.yaml` (same conversion run, applied lessons including the `_parentRootToCamera` init+update dual-call fix)
