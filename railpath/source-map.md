# Source Map — Star Fox Railpath 2.0

## Source → Generated File Mapping

| Source File | Generated File(s) | Notes |
|-------------|-------------------|-------|
| `src/App.jsx` | `railpath.stemscript` | Canvas + scene setup → stemscript scene settings |
| `src/Game.jsx` | `railpath.stemscript` | Scene composition → stemscript hierarchy and behavior attachment |
| `src/curve.js` | `behaviors/sfRailPath.yaml` | 420 curve points inlined as compact flat array |
| `src/Path.jsx` | `behaviors/sfRailPath.yaml` | GSAP timeline path following → manual progress + lerp/slerp |
| `src/PlayerController.jsx` | `behaviors/sfPlayerController.yaml` | Movement, camera, tilt → custom behavior |
| `src/models/player/Arwing.jsx` | `behaviors/sfPlayerController.yaml` | Barrel roll logic merged into player controller |
| `src/models/player/Glow.jsx` | `behaviors/sfPlayerController.yaml` | Engine glow shader created in _createEngineGlow() |
| `src/Lasers.jsx` | `behaviors/sfLaserSystem.yaml` | InstancedMesh2 → individual mesh pool |
| `src/Lighting.jsx` | `railpath.stemscript` | Ambient light → `scene lighting ambient={intensity:1}` |
| `src/Composer.jsx` | `railpath.stemscript` | Bloom → `scene postprocessing bloom={...}` |
| `src/models/Testenv.jsx` | `railpath.stemscript` | Environment import and placement |
| `src/store/store.js` | `erth.store` | Zustand → erth.store for shoot state |
| `src/particles/Rolling.jsx` | — | Not ported (barrel roll VFX) |
| `src/main.jsx` | — | React entrypoint, not applicable |
| `src/index.css` | — | Styles, not applicable |

## Important Entrypoints

| Entrypoint | Description |
|-----------|-------------|
| `railpath.stemscript` | Single main entrypoint — imports all assets and behaviors, sets up scene |
| `behaviors/sfRailPath.yaml` | Rail path system (must be attached to a group) |
| `behaviors/sfPlayerController.yaml` | Player controller (must be child of rail path group) |
| `behaviors/sfLaserSystem.yaml` | Laser system (must be on same object as player controller) |

## Mechanics Map

| Mechanic | Source Implementation | Stem Implementation |
|----------|----------------------|---------------------|
| Rail following | CatmullRomCurve3 + GSAP timeline | CatmullRomCurve3 + manual dt/duration |
| XY movement | useFrame + MathUtils.damp/clamp | behavior update + THREE.MathUtils |
| Camera | Manual position lerp + quaternion copy | game.camera direct control |
| Barrel roll | GSAP tween + double-tap detection | Manual easeOutCubic + perf.now() timing |
| Laser burst | InstancedMesh2 + burst counter | Mesh pool + burst counter |
| Billboard | drei Billboard component | Manual lookAt(camera) in update |

## Asset Map

| Asset | Source Path | Destination Path | Provenance |
|-------|-----------|-----------------|------------|
| Arwing model | `public/models/arwing-transformed.glb` | `models/arwing-transformed.glb` | Original (gltfjsx transformed) |
| Environment | `public/models/testenv-transformed.glb` | `models/testenv-transformed.glb` | Original (gltfjsx transformed) |
| Viewfinder | `public/textures/viewfinder.png` | `textures/viewfinder.png` | Original |
| Rolling | `public/textures/rolling.png` | `textures/rolling.png` | Original (unused) |
| Burst | `public/textures/burst.jpg` | `textures/burst.jpg` | Original (unused in source too) |
