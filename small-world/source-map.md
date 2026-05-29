# Source Map — Small World

## Source → Generated File Mapping

| Source File | Generated System | Generated File(s) |
|-------------|-----------------|-------------------|
| `src/Experience/Experience.js` | Stemscript orchestration | `small-world.stemscript` |
| `src/Experience/MatcapsModel.js` | Matcap shaders + telescope animation | `behaviors/swSmallWorld.yaml` (model traversal, shader creation, telescope tweens) |
| `src/Experience/Floor.js` | Floor background + baked overlays | `behaviors/swSmallWorld.yaml` (camera-locked background quad, shadow/light materials) |
| `src/Experience/Entrance.js` | Entrance model + stroke particles | `behaviors/swSmallWorld.yaml` (entrance emissive, InstancedMesh strokes) |
| `src/Experience/WindStrokes.js` | Wind stroke VFX | `behaviors/swSmallWorld.yaml` (wind stroke spawning/animation) |
| `src/Experience/Navigation.js` | Camera orbit controls | `behaviors/swOrbitCamera.yaml` (renderer-canvas-relative pointer handling) |
| `src/Experience/Camera.js` | Camera configuration | `behaviors/swOrbitCamera.yaml` (FOV, near, far) + stemscript |
| `src/Experience/Renderer.js` | Renderer + postprocessing | Stemscript scene settings (DOF omitted) |
| `src/Experience/DepthOfField.js` | Dynamic DOF focus | **Not ported** |
| `src/Experience/Resources.js` | Asset loading | Stemscript `import` commands |
| `src/Experience/assets.js` | Asset manifest | Stemscript `import` commands |
| `src/Experience/shaders/matcap/*` | Matcap GLSL | Inline in `behaviors/swSmallWorld.yaml` (MATCAP_VERT, MATCAP_FRAG) |
| `src/Experience/shaders/floorBackground/*` | Floor gradient GLSL | Inline in `behaviors/swSmallWorld.yaml` (FLOOR_BG_VERT, FLOOR_BG_FRAG) |
| `src/Experience/shaders/floorBaked/*` | Floor overlay GLSL | Inline in `behaviors/swSmallWorld.yaml` (FLOOR_BAKED_VERT, FLOOR_BAKED_FRAG) |
| `src/Experience/shaders/windStroke/*` | Wind stroke GLSL | Inline in `behaviors/swSmallWorld.yaml` (WIND_STROKE_VERT, WIND_STROKE_FRAG) |
| `src/Experience/World.js` | Scene coordination | `behaviors/swSmallWorld.yaml` (init orchestration) |
| `src/style.css` | Cursor styling | `behaviors/swOrbitCamera.yaml` (canvas.style.cursor) |
| `static/assets/*.glb` | 3D models | `models/*.glb` (direct copy) |
| `static/assets/*.png` | Textures | `textures/*.png` (direct copy) |
| `static/assets/matcaps/*.png` | Matcap textures | `textures/matcaps/*.png` (direct copy) |

## Important Entrypoints

| Source Entrypoint | Stem Equivalent |
|-------------------|----------------|
| `src/script.js` | `small-world.stemscript` |
| `new Experience()` | Stemscript import + scene setup + behavior attach |
| `Experience.update()` | `swSmallWorld.update()` + `swOrbitCamera.update()` |

## Asset Map

| Source Asset | Import Name | Usage |
|-------------|-------------|-------|
| `model.glb` | `SWDiorama` | Main diorama, behavior target |
| `entranceModel.glb` | `SWEntrance` | White emissive portal |
| `bakedFloorShadowModel.glb` | `SWFloorShadow` | Shadow overlay mesh |
| `bakedFloorLightModel.glb` | `SWFloorLight` | Light overlay mesh |
| `windStroke1Model.glb` | `SWWindStroke1` | Wind stroke clone template |
| `windStroke2Model.glb` | `SWWindStroke2` | Wind stroke clone template |
| `matcaps/brass.png` | `MCBrass` | Matcap for brass meshes |
| `matcaps/fabricPinkDark.png` | `MCFabricPinkDark` | Matcap for dark pink fabric |
| `matcaps/fabricPinkLight.png` | `MCFabricPinkLight` | Matcap for light pink fabric |
| `matcaps/foliage.png` | `MCFoliage` | Matcap for foliage/leaves |
| `matcaps/globe.png` | `MCGlobe` | Matcap for globe/glass |
| `matcaps/lens.png` | `MCLens` | Matcap for lens/glass |
| `matcaps/metal.png` | `MCMetal` | Matcap for generic metal |
| `matcaps/paper.png` | `MCPaper` | Matcap for paper/matte |
| `matcaps/stone.png` | `MCStone` | Matcap for light stone |
| `matcaps/stoneDark.png` | `MCStoneDark` | Matcap for dark stone |
| `matcaps/wood.png` | `MCWood` | Matcap for wood grain |
| `bakedFloorShadowTexture.png` | `SWFloorShadowTex` | Shadow alpha mask |
| `bakedFloorLightTexture.png` | `SWFloorLightTex` | Light alpha mask |
| `entranceStrokeTexture.png` | `SWEntranceStrokeTex` | Stroke alpha map |
