# Sky Bomber Conversion Plan

## Source Target

- Source repository: `https://github.com/skmail/bomber`
- Source commit inspected: `04dc865ce76ab78a3b845dd23299aeb4e6ca72a9`
- Entrypoint: `index.html` -> `src/main.tsx` -> `src/App.tsx` -> `src/Scene.tsx`
- Canonical title: `Sky Bomber`, derived from the user target `sky-bomber` and source title screen text `SKY BOMBER`.

## Genre And Classification

- 3D Bomberman-style action maze on procedural floating voxel islands.
- Gameplay is grid/tile based in XZ with discrete Y changes over bridges and islands.
- The player object is `Character` in `src/voxel/Character.tsx`; the StemStudio script creates a tagged invisible `Player` object and a runtime cuboid visual.

## Core Systems To Preserve

- Start, playing, cleared, and dead phases.
- Four procedural floating islands with bridge connections.
- Hard pillars, destructible crates, and treasure chests.
- WASD / joystick grid movement, with camera-relative directional intent.
- Space / touch button bomb placement.
- Classic plus blasts and mega plus+diagonal blasts.
- Enemy wander/chase behavior with FOV, LOS, and last-seen memory.
- Extra-bomb and mega-bomb pickups.
- Level progression with enemy count, speed, detection range, and seed changes.
- HUD/menu with level, bomb capacity, mega charges, enemy count, tile label, and phase overlays.

## Asset Plan

- Do not copy source OBJ/MTL/block-atlas assets into this bundle because the inspected repo has no explicit license file.
- Rebuild visuals procedurally with WebGPU-safe NodeMaterials and primitive geometry.
- Generate and bundle a square `cover.png`; import as `ProjectCover`.
- Keep `cover.svg` as the editable local source for the generated PNG.

## Mapping Strategy

- `sky-bomber.stemscript` creates the project, scene lighting, camera, runtime host, invisible tagged `Player`, touch controls, and attaches `sb.skyBomber`.
- `behaviors/sbSkyBomber.yaml` stays intentionally thin: lifecycle, debug logging, imports, update tick, editor preview hooks.
- `imports/sky-bomber-runtime.js` owns the custom procedural gameplay runtime.
- `imports/uikit-dual-mode.yaml` renders the same UIKit HUD/menu tree in play and editor preview.
- Runtime-created meshes are visual-only children under `SkyBomber.Root`, marked `userData.isRuntimeOnly = true`, and cleaned up in `dispose()`.

## Exposed Configuration Surface

| Attribute | Source Default | Purpose |
|---|---:|---|
| `seed` | 552 | Base world seed. |
| `islandSize` | 24 | Main island footprint size. |
| `mainDensity` | 0.15 | Main-island soft crate density. |
| `secondaryDensity` | 0.10 | Secondary-island soft crate density. |
| `bridgeArc` | -0.1 | Bridge sag/arc per tile. |
| `playerSpeed` | 6 | Tile-step interpolation speed. |
| `baseEnemyCount` | 3 | Level 1 enemy count before scaling. |
| `enemySpeed` | 1.8 | Level 1 enemy speed. |
| `maxBombs` | 3 | Base simultaneous bomb limit. |
| `fuseSeconds` | 2.0 | Bomb fuse. |
| `blastDuration` | 0.45 | Blast visibility/damage duration. |
| `cameraDistance` | 32 | Follow camera distance. |
| `cameraPitch` | 35 | Follow camera pitch. |
| `cameraYaw` | 135 | Follow camera yaw. |
| `cameraStiffness` | 5 | Follow camera smoothing. |
| `debugLogs` | false | Opt-in lifecycle and major gameplay logging. |

## Risk Areas And Follow-Ups

- Full source river carving, waterfall meshes, toon fog, palette/noise post-processing, and block OBJ visuals are approximated by Stem-native primitives, fog, bloom, clouds, and procedural island blocks.
- Source mobile UI is replaced by the built-in `touchControls` behavior plus UIKit phase overlays.
- Stemscript imports `ProjectCover`, but editor-side project thumbnail assignment may still require manual selection.
