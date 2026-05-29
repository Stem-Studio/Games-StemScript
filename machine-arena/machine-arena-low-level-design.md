# Machine Arena Low-Level Design

## Object Hierarchy

```text
Default Scene
├── DefaultCamera (cameraType=NONE, driven by ma.machineArena)
├── Player (tag=Player, invisible capsule, mirrored to FPS camera position)
├── GameRoot
│   └── ma.machineArena
│       ├── MA_RuntimeWorld (runtimeOnly)
│       ├── MA_Enemies (runtimeOnly)
│       ├── MA_Projectiles (runtimeOnly)
│       ├── MA_VFX (runtimeOnly)
│       └── MA_WeaponView (runtimeOnly, parented to camera)
└── UI Camera
    └── MA_UIRoot (UIKit Fullscreen)
```

## Component Architecture

| Behavior/Lambda | Attached To | Responsibility | Pattern |
|-----------------|-------------|----------------|---------|
| `ma.machineArena` | `GameRoot` | Owns FPS camera, input, procedural arena, weapons, enemies, waves, upgrades, fragments, shop, HUD, audio, and cleanup | Consolidated source-loop port |

## Data Flow Per Game Event

### Event: Run Start

```text
Menu input -> startRun() -> resetRun() -> buildArena() -> startNextWave() -> phase="playing"
```

### Event: Player Movement

```text
InputManager motion/actions -> updatePlayer(dt) -> mutate state.pos/state.yaw/state.pitch -> DefaultCamera position/quaternion -> Player mirror position
```

### Event: Wave Clear

```text
updateEnemies() sees zero alive -> completeWave() -> unlockFragments() -> phase="upgrade" or victory
```

### Event: Upgrade Selection

```text
Input selection -> applyUpgrade(index) -> mutate weapon/player run state -> startNextWave()
```

## State Ownership Table

| Key / Store Path | Owner | Readers | Sync Mechanism | Reset On |
|------------------|-------|---------|----------------|----------|
| Local `state.phase` | `ma.machineArena` | Same behavior | Closure state | Run/menu transitions |
| Local `state.pos/yaw/pitch` | `ma.machineArena` | Same behavior | Closure state | `resetRun()` |
| Local `state.weapon` | `ma.machineArena` | Same behavior | Closure state | `resetRun()` |
| Local `enemies/projectiles/particles/trails` arrays | `ma.machineArena` | Same behavior | Closure arrays | `clearRuntimeActors()` / `cleanupRuntime()` |
| No `erth.store` keys | N/A | N/A | N/A | N/A |

## Asset Pipeline

| Asset Key | Source | Format | Calibration Scale | Notes |
|-----------|--------|--------|-------------------|-------|
| `ProjectCover` | Generated | PNG | N/A | Bundled; thumbnail may be manual |
| `MA Menu Music` | `public/music1_alt.mp3` | MP3 | N/A | Loaded through `erth.asset.audio` |
| `MA Combat Music` | `public/music1.mp3` | MP3 | N/A | Loaded through `erth.asset.audio` |
| `MA Boss Music` | `public/music2.mp3` | MP3 | N/A | Loaded through `erth.asset.audio` |
| `MA Tyger Sound` | `public/tyger.mp3` | MP3 | N/A | One-shot victory/special audio |

## Init-Order Dependencies

```text
1. Stemscript creates GameRoot and Player.
2. Stemscript attaches ma.machineArena to GameRoot.
3. init() caches game, erth, input manager, renderer canvas, and Player.
4. init() builds runtime geometry and UIKit.
5. update() drives all gameplay once state.phase is playing.
```

## Physics Configuration

The first pass uses custom AABB collision in the behavior instead of engine physics bodies. Runtime world cover/walls populate an `obstacles` array. Elevated surfaces populate `walkables`.

| Object | Collision Type | Shape | Mass | Layer | Notes |
|--------|----------------|-------|------|-------|-------|
| Player | custom kinematic | capsule concept | 0 | default | Camera/body position with radius checks |
| Arena walls/cover | custom static | AABB | 0 | default | `obstacles` entries |
| Enemies | custom kinematic | radius | 0 | default | Separation and obstacle depenetration |

## Memory Budget

| Category | Count | Geometry | Materials | Textures | Notes |
|----------|-------|----------|-----------|----------|-------|
| Arena | ~100 meshes | Box/cylinder primitives | Node materials | none | Built once per run |
| Enemies | Wave dependent | Primitive groups | Node materials | none | Disposed on death/reset |
| VFX | Short-lived | Boxes/lines | Node materials | none | Disposed by lifetime |
| UI | One fullscreen | UIKit | Node materials | none | Disposed on behavior dispose |

## Current Bug Investigation Contract

- Movement must not depend on custom behavior inputs for core WASD/mouse movement.
- If custom inputs are unreliable in the runtime, menu/start actions need a fallback or default-binding path.
- Any input fallback must preserve validator cleanliness and be documented here.
- Runtime fallback: canvas click starts a run and requests pointer lock; default movement/action input can also deploy from the menu. Generated custom key inputs remain convenience bindings only.

## Open Technical Questions

- Whether behavior-declared `inputs:` are registered in the current StemStudio runtime for generated YAML behaviors attached through stemscript.
- Whether the current runtime requires `game.inputManager.resume()` after menu/UI states.
