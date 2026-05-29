# Sky Bomber Mechanic Mapping

## Source Inventory

| Source System | Source File(s) | Type | Priority |
|---|---|---|---:|
| Phase/progression loop | `src/Scene.tsx`, `MenuOverlay.tsx` | Core | 10 |
| Procedural islands | `world.ts`, `build.ts`, `pipeline.ts`, `generate.ts` | Core | 9 |
| WorldGrid flags | `worldGrid.ts` | Core | 10 |
| Player movement | `Character.tsx`, `controls/*` | Core | 10 |
| Bombs and blasts | `Bombs.tsx` | Core | 10 |
| Enemy AI | `Enemies.tsx`, `Enemy.tsx` | Core | 9 |
| Obstacles/treasure | `bomberman.ts`, `Obstacles.tsx`, `Treasures.tsx` | Core | 9 |
| Pickups | `Pickups.tsx` | Core | 8 |
| HUD/menu | `Scene.tsx`, `MenuOverlay.tsx` | Core | 8 |
| Clouds/sky/post | `Skybox.tsx`, `CloudPuffs.tsx`, `depthEffects.tsx` | Polish | 5 |

## Built-In Coverage Assessment

| Source System | Built-In Candidate | Coverage | Decision |
|---|---|---|---|
| Mobile controls | `touchControls` | High for joystick + bomb button | Use built-in. |
| Camera | Built-in third-person camera | Medium; source needs custom fixed yaw/pitch smoothing | Custom camera in runtime. |
| UI | UIKit | High for HUD/menu content, not exact CSS animation | Use UIKit. |
| Physics/collision | Scene physics | Low; source uses discrete grid flags | Custom grid runtime. |
| World generation | Terrain/primitive commands | Low; source is procedural per level | Custom runtime geometry. |

## Custom Systems Needed

| Custom System | Type | Reason Built-In Insufficient | Complexity |
|---|---|---|---|
| `sky-bomber-runtime` | script import | Tightly coupled grid, world, bombs, enemy, pickup, and camera logic. | High |
| `sb.skyBomber` | behavior | Lifecycle, debug logging, UIKit/editor/play integration. | Low |

## State Flow

- State is behavior-local on `owner._sb`.
- No `erth.store` keys are used.
- The hidden `Player` object is tagged `Player`; runtime mirrors its transform for engine systems.
- UIKit click handlers call `advance(owner)` directly inside the runtime import.
- `touchControls` feeds `game.inputManager`; the runtime reads `forward`, `lateral`, optional `move`, `jump`, and `sb_Enter`.

## Fidelity Risks

| Risk | Source Behavior | Stem Approximation | Impact | Mitigation |
|---|---|---|---|---|
| River/waterfall rendering | Source carves rivers, renders river meshes and waterfall ribbons | Not reproduced in this pass | Visual medium, gameplay low | Keep island/bridge/bomber loop intact; document in FDR. |
| Source OBJ block look | Source can load voxel model assets | Primitive NodeMaterial blocks | Visual medium | Avoid asset redistribution without license; keep chunky voxel readability. |
| Free orbit camera | OrbitControls can rotate and zoom | Fixed smooth follow camera | Feel low/medium | Expose yaw, pitch, distance, stiffness attributes. |

## Configuration Surface Plan

See `conversion-plan.md` for the full attribute table.

