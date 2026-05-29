# Sky Bomber Source Map

## Entrypoints

| Source | StemStudio Mapping |
|---|---|
| `index.html`, `src/main.tsx`, `src/App.tsx` | `sky-bomber.stemscript` project bootstrap and behavior attach. |
| `src/Scene.tsx` | `sb.skyBomber` behavior lifecycle plus `sky-bomber-runtime` phase/world loop. |

## Runtime Systems

| Source File(s) | Source Role | Generated File/System |
|---|---|---|
| `src/voxel/world.ts`, `build.ts`, `pipeline.ts`, `generate.ts` | Four procedural floating islands, seed hashing, island placement. | `imports/sky-bomber-runtime.js` `buildPlacements`, `addIslandCells`. |
| `src/voxel/bridge.ts`, `Connectors.tsx` | Bridge layout, visual Y arc, walkable Y. | `buildBridge` with configurable `bridgeArc`. |
| `src/voxel/worldGrid.ts` | Packed gameplay flags for walkable/obstacle/entity/blast cells. | Runtime grid object with equivalent `F_*` flags and `gridHasColumn`. |
| `src/voxel/bomberman.ts` | Hard pillar lattice, soft crate densities, spawn clear radius. | `addObstacles`; main soft crates use a reachability filter before acceptance. |
| `src/voxel/Character.tsx`, `controls/*` | Player grid stepping, camera-relative controls, death checks. | `updatePlayer`, `desiredStep`, `pickNeighbor`, `checkPlayerDeath`. |
| `src/voxel/FollowCamera.tsx` | Smooth follow target/camera offset. | `updateCamera`, driven by `cameraDistance`, `cameraPitch`, `cameraYaw`, `cameraStiffness`. |
| `src/voxel/Bombs.tsx` | Fuse, blast propagation, soft destruction, mega bombs. | `placeBomb`, `updateBombs`, `detonate`, `destroySoft`. |
| `src/voxel/Enemies.tsx`, `Enemy.tsx` | Enemy spawn distribution, wander/chase AI, FOV, LOS, memory. | `createEnemies`, `enemyChaseState`, `hasLineOfSight`, `wanderStep`, `chaseStep`. |
| `src/voxel/Pickups.tsx` | Extra bomb and mega bomb pickups. | `spawnPickup`, `updatePickups`, `bombBonus`, `megaCharges`. |
| `src/MenuOverlay.tsx`, inline Scene HUD | Title/phase overlays and HUD readouts. | UIKit tree in `buildUi` and `updateUi`. |
| `src/MobileControls.tsx` | Source DOM mobile joystick + bomb button. | StemStudio scene-level `touchControls` behavior attached to `"Default Scene"` as required by bundle validation. |
| `src/voxel/CloudPuffs.tsx`, `CloudFloor.tsx`, `Skybox.tsx` | Atmosphere and clouds. | Stemscript gradient/fog plus runtime cloud puffs. |
| `src/voxel/RiverMesh.tsx`, `Waterfall.tsx`, `depthEffects.tsx` | Rivers, waterfalls, toon fog/post effects. | Visual approximation via terrain colors, fog, bloom, clouds; see fidelity decision record. |

## Asset Map

| Source Asset | Decision |
|---|---|
| `public/assets/models/*.obj`, `*.mtl`, `block_bits_texture.png` | Not copied; no explicit source license was present. Rebuilt procedurally with primitives. |
| `public/assets/block_atlas.png` | Not copied; the runtime uses NodeMaterial colors. |
| `public/favicon.svg` | Used only as source-reference inspiration for the generated project cover. |
| `cover.svg`, `cover.png` | Programmatically generated cover art bundled as `ProjectCover`. |

## Tuning Map

| Source Value | Source Location | Generated Attribute |
|---|---|---|
| `seed: 552` | `Scene.tsx useControls` | `seed` |
| `size: 24` | `Scene.tsx useControls` | `islandSize` |
| `mainDensity: 0.15` | `Scene.tsx useControls` | `mainDensity` |
| `secondaryDensity: 0.10` | `Scene.tsx useControls` | `secondaryDensity` |
| `bridgeArc: -0.1` | `Scene.tsx useControls` | `bridgeArc` |
| `PLAYER_SPEED = 6` | `Scene.tsx` | `playerSpeed` |
| `enemyCount = 3 + level - 1` | `Scene.tsx` | `baseEnemyCount` |
| `enemySpeed = 1.8 + level * 0.2` | `Scene.tsx` | `enemySpeed` |
| `maxBombs = 3` | `Scene.tsx useControls` | `maxBombs` |
| `FUSE_SECONDS = 2.0` | `Bombs.tsx` | `fuseSeconds` |
| `BLAST_DURATION = 0.45` | `Bombs.tsx` | `blastDuration` |
| `CAM_DISTANCE = 32`, `CAM_PITCH = 35`, `CAM_INITIAL_AZIMUTH = 135deg`, `FOLLOW_STIFFNESS = 5` | `Scene.tsx` | `cameraDistance`, `cameraPitch`, `cameraYaw`, `cameraStiffness` |
