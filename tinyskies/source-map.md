# TinySkies — Source Map

Maps source files to destination StemStudio artifacts for the **MVP slice** (single-player flight + paintball). Files marked `(deferred)` are intentionally out of scope for this conversion pass.

## Client source → destination

| Source file | Lines | Role | Destination | Status |
|---|---|---|---|---|
| `client/src/main.ts` | 34 | Vite entry; `new Game(app); game.start()`. | (no destination — StemStudio is its own runtime) | n/a |
| `client/src/game/Game.ts` | 7042 | Mega-controller for everything. | Decomposed across stemscript scene + 5 behaviors below. Most systems deferred. | partial |
| `client/src/game/SphericalMath.ts` | 297 | Quaternion globe math. | `imports/spherical-math.js` — single shared script imported via `import script` + `@import "spherical-math" as S;` | mvp |
| `client/src/game/FlightControls.ts` | 99 | Keyboard input → `ControlState`. | Reproduced inside `behaviors/tinyskiesFlightController.yaml` using `this.erth.input` action bindings (or window event listeners disposed in `onStop`). | mvp |
| `client/src/game/Plane.ts` | 438 | Plane physics + state. | `behaviors/tinyskiesFlightController.yaml` (drops gremlin / boost / HP for MVP; preserves speed/altitude/yaw/bank/pitch curves verbatim). | mvp |
| `client/src/game/BiplaneMesh.ts` | 380 | Procedural biplane Group. | `imports/biplane-mesh.js` (helper script) + `behaviors/tinyskiesBiplaneVisual.yaml` (calls helper in `init()` / `onEditorAdded`). | mvp |
| `client/src/game/RimLight.ts` | (small) | `addRimLight` shader injection on PhongMaterial. | Bundled into `imports/biplane-mesh.js` (or its own `imports/rim-light.js` if reused elsewhere). | mvp |
| `client/src/game/CameraRig.ts` | 279 | Chase camera with smoothing, banking-tilt, FOV boost. | `behaviors/tinyskiesCameraRig.yaml` — drives `game.camera` from the player's transform; no behavior on the camera itself (CLAUDE.md rule). Drops `voidChase` branch (carpet-only). | mvp |
| `client/src/game/PaintballSystem.ts` | 814 | Projectile pool, decal geometry, splash, hit test. | `behaviors/tinyskiesPaintballSystem.yaml` — single-player subset: spawn projectile on Space, advance on great-circle, splat decal on globe surface, fade. No remote relay, no hit test against remote planes. | mvp |
| `client/src/game/PaintballSplash.ts` | 285 | Splash quad pool used on remote-player hits. | (deferred — single-player has no remote victims to splash) | deferred |
| `shared/types.ts` | 230 | Type defs + paintball/flag/brazier constants. | Constants inlined into `behaviors/tinyskiesPaintballSystem.yaml`; types inlined where needed. No multiplayer types used. | mvp (constants only) |
| `shared/vehicleCapabilities.ts` | (small) | Vehicle feature flags (boat/carpet vs plane). | (deferred — only Plane in MVP) | deferred |
| `client/src/game/Globe.ts` | 5803 | Sphere + atmosphere + ocean + trees + rocks + houses + clouds + balloons + windmills + moonstones + race banners + …. | `behaviors/tinyskiesGlobeVisual.yaml` — sphere mesh with two-tone ocean material + atmosphere shell only. Everything else deferred. | mvp (subset) |
| `client/src/game/SkyPresets.ts` | 202 | Day / evening / night sky/light presets. | "default" preset's sky color, fog, lights → stemscript `scene background`, `scene fog`, `scene lighting`, `light` commands. Other presets deferred. | mvp (default preset only) |
| `client/src/game/Starfield.ts` | (n/a) | Star points. | (deferred) | deferred |
| `client/src/game/Aurora.ts` | (n/a) | Aurora curtains. | (deferred) | deferred |
| `client/src/game/MoonThreat.ts` | (n/a) | Approaching-moon doom timer. | (deferred — no fail state in MVP) | deferred |
| `client/src/game/RemotePlane.ts` | (n/a) | Remote-player plane. | (deferred — single-player) | deferred |
| `client/src/game/Boat.ts` / `Carpet.ts` / `CarpetMesh.ts` / `CarpetTrail.ts` etc | (n/a) | Boat + carpet vehicle modes. | (deferred) | deferred |
| `client/src/game/PackageQuest.ts` / `RaceManager.ts` / `CarpetLandmarkSelfieQuest.ts` / `EternalFlameWorld.ts` / `CampsiteScene.ts` etc. | (n/a) | Quest systems. | (deferred) | deferred |
| `client/src/game/Volcano.ts` / `TerrainSurface.ts` / `SimplexNoise.ts` / `TerrainPresets.ts` | (n/a) | Terrain heightmap + biome props. | (deferred) | deferred |
| `client/src/game/SkyGremlins.ts` / `GremlinHearts.ts` / `VoidHearts.ts` / `VoidMoths.ts` / `VoidFlameShield.ts` etc. | (n/a) | Enemies / void content. | (deferred) | deferred |
| `client/src/game/FloatingLanterns.ts` / `MeteorShower.ts` / `GodRays.ts` / `RainOverlay.ts` / `Contrails.ts` / `BirdFlock.ts` / `OceanFish.ts` / `FireflyCluster.ts` / `RainbowArch.ts` / `SkyJellyfish.ts` | (n/a) | Ambient world FX. | (deferred) | deferred |
| `client/src/game/Rings.ts` / `RingCollectVFX.ts` | (n/a) | Speed-boost rings. | (deferred) | deferred |
| `client/src/game/CarpetPortalSystem.ts` / `CosmicWorldPortal.ts` | (n/a) | Portals + cosmic void scenes. | (deferred) | deferred |
| `client/src/game/CampsiteMarker.ts` / `CampsiteControls.ts` | (n/a) | Tutorial campsite. | (deferred) | deferred |
| `client/src/game/NpcPlanes.ts` / `NpcBoats.ts` / `PilotAvatar.ts` | (n/a) | NPC populations. | (deferred) | deferred |
| `client/src/game/ProgressionManager.ts` / `UpgradeManager.ts` | (n/a) | localStorage persistence. | (deferred — scope decision 3) | deferred |
| `client/src/game/TouchControls.ts` | (n/a) | Mobile virtual buttons. | (deferred — note for follow-up; CLAUDE.md mobile parity rule means MVP ships desktop-only with explicit disclaimer) | deferred |
| `client/src/ui/*` (HUD, Lobby, ControlHints, LevelUpCards, RaceTimerUI, …) | (varies) | All HTML UI. | (deferred — MVP has no HUD) | deferred |
| `client/src/network/*` | (varies) | Socket.io client + state sync. | (deferred — single-player) | deferred |
| `client/src/audio/AudioManager.ts` | (varies) | Sound. | (deferred) | deferred |
| `server/**/*` | (large) | Express + Socket.io + Postgres. | (deferred — single-player) | deferred |

## Asset map

The MVP needs **no GLBs**, no SVGs, no fonts, no NPC portraits. The plane is procedural; the globe is procedural. Source `client/public/3D/*.glb` and `client/public/2D/*` are entirely deferred.

| Asset | Source | Destination | Status |
|---|---|---|---|
| Cover image | (none) | `tinyskies/cover.png` (generate square; per CLAUDE.md cover-art rule) | mvp |
| (everything else) | `client/public/{3D,2D,fonts,npc}/` | (deferred) | deferred |

## Destination directory layout

```
tinyskies/
├── tinyskies.stemscript
├── tinyskies-requirements.md
├── source-analysis.json
├── source-map.md
├── conversion-plan.md
├── cover.png                                 (generated)
├── imports/
│   ├── spherical-math.js                     (verbatim port of SphericalMath.ts subset)
│   └── biplane-mesh.js                       (verbatim port of BiplaneMesh.ts + RimLight)
└── behaviors/
    ├── tinyskiesGlobeVisual.yaml
    ├── tinyskiesBiplaneVisual.yaml
    ├── tinyskiesFlightController.yaml
    ├── tinyskiesCameraRig.yaml
    └── tinyskiesPaintballSystem.yaml
```
