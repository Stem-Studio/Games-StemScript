# Source Map: Procedural Terrain Generation -> StemStudio

## Source File -> Generated File Mapping

| Source File | Generated File(s) | Notes |
|------------|-------------------|-------|
| `main.js` | `procedural-terrain.stemscript`, `ptgCameraController.yaml` | Scene setup -> stemscript, camera init -> cameraController |
| `src/chunk.js` | `ptgTerrainManager.yaml` | Chunk class, getHeight(), biome colors, tree/cloud generation |
| `src/chunkManager.js` | `ptgTerrainManager.yaml` | Chunk streaming, LOD, disposal logic |
| `src/trees.js` | `ptgTerrainManager.yaml` | Instanced tree rendering (merged into terrain manager) |
| `src/clouds.js` | `ptgTerrainManager.yaml` | Instanced cloud rendering (merged into terrain manager) |
| `src/plane.js` | `ptgAirplaneController.yaml` | Player flight, input, trails, audio |
| `src/shaders/color-fragment.glsl` | `ptgTerrainManager.yaml` | Biome color thresholds with sine/cosine boundary perturbation -> per-vertex getBiomeColor() |
| `src/shaders/common.glsl` | `ptgTerrainManager.yaml` | Simplex noise -> inline createNoise2D() |
| `public/airplane/scene.gltf` | `models/airplane/scene.gltf` | Airplane GLTF model (self-contained, no textures) |
| `public/airplane/scene.bin` | `models/airplane/scene.bin` | Airplane GLTF binary data |
| `src/shaders/project-vertex.glsl` | Not ported | Wave animation on water vertices |
| `src/shaders/project-vertex-plane.glsl` | Not ported | Trail banking vertex effect |
| `src/shaders/project-vertex-clouds.glsl` | Not ported | Cloud drift vertex animation |
| `src/shaders/project-vertex-boat.glsl` | Not ported | Boat wave vertex animation |
| `src/shaders/project-instanced-vertex.glsl` | Not ported | Tree wind sway vertex animation |
| `src/shaders/color-instanced-fragment.glsl` | Not ported | Tree distance fade |
| `src/shaders/color-instanced-fragment-clouds.glsl` | Not ported | Cloud distance fade |
| `src/shaders/normal-fragment-map.glsl` | Not ported | Distance-based normal map intensity |
| `index.html` | Not ported | UI overlay removed (no UIKit) |
| `style.css` | Not ported | Handled by scene settings |

## Mechanics Map

| Source Mechanic | Stem System | Faithful? |
|----------------|-------------|-----------|
| Simplex noise heightmap | Inline noise in `ptg.terrainManager` | Yes |
| Chunk-based LOD streaming | Custom chunk pool in `ptg.terrainManager` | Yes (simplified LOD) |
| 8-layer biome coloring | Per-vertex colors via `getBiomeColor()` with sine/cosine perturbed boundaries | Approximated (per-vertex vs per-pixel, boundaries faithful) |
| Mouse/touch cursor input | Window event listeners in `ptg.airplaneController` | Yes |
| Mobile speed disable | `isMobile ? 0 : speedVar` | Yes (source: isMobile ? 0 : ...) |
| Forward flight (translateZ) | `this.target.translateZ()` in behavior | Yes |
| Yaw from cursor X | `this.target.rotation.y` in behavior | Yes |
| Model banking (roll) | `model.rotation.z` lerp in behavior | Yes |
| Camera child of player | `this.target.add(camera)` in cameraController | Yes |
| Camera Y=7 offset | `camera.position.set(0, 7, Z)` | Yes (source: camera at y=7) |
| Camera side offset | `camera.position.x` lerp from cursor X | Yes |
| Instanced trees | InstancedMesh in terrain manager (detail 4, source 5) | Yes |
| Instanced clouds | InstancedMesh in terrain manager (detail 5, source 10, color 0x555555) | Yes |
| GLTF airplane model | Loaded via `erth.asset.model.createInstance()` with source transforms | Yes |
| GLTF boat cloning | Not ported (boat model has 11 separate textures, import command limitation) | No |
| Start screen | Not ported (no UIKit) | No |
| Audio playback | HTML5 Audio via erth.asset.audio | Stem-native |
| Planet curvature | Not ported (fog hides horizon) | No |
| Ocean waves | Not ported (flat water) | No |
| Tree wind sway | Not ported (static) | No |
| Cloud drift | Not ported (static) | No |

## Asset Map

| Source Asset | Destination | Used By |
|-------------|------------|---------|
| `/src/audio/epic-soundtrack.mp3` | `audio/epic-soundtrack.mp3` | `ptg.airplaneController` (soundtrack attribute) |
| `/src/textures/normal.jpg` | `textures/normal.jpg` | Retained for future use |
| `/public/airplane/scene.gltf` | `models/airplane/scene.gltf` | `ptg.airplaneController` (airplaneModel attribute) |
| `/public/airplane/scene.bin` | `models/airplane/scene.bin` | Referenced by scene.gltf |
