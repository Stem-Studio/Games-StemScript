# Conversion Plan — Small World

## Source Target

- **Repo**: https://github.com/brunosimon/small-world
- **Framework**: Vanilla Three.js (r134) + GSAP + Webpack
- **Entry point**: `src/script.js` → `Experience.js` singleton

## Genre Classification

**Interactive Diorama / 3D Art Piece** — No gameplay, physics, or win conditions. The experience is pure observation and camera exploration of a hand-crafted miniature world scene.

## Core Systems

| System | Source Implementation | Conversion Strategy |
|--------|----------------------|---------------------|
| **Matcap Rendering** | Custom ShaderMaterial with matcap lookup + floor bounce + point light | Custom behavior with standalone GLSL shaders |
| **Wind Animation** | Vertex shader deformation using vertex color mask | Same approach, `USE_WIND` define on flag materials |
| **Telescope/Gears** | GSAP tweens, continuous random rotation | Procedural tweens replacing GSAP |
| **Floor Background** | Fullscreen clip-space quad with 4-corner vertex color gradient | Recreated as runtime Three.js mesh |
| **Floor Overlays** | Baked shadow/light meshes with alpha mask shaders | Same approach, custom ShaderMaterial |
| **Entrance Model** | White emissive mesh | Set emissive color on imported model |
| **Entrance Strokes** | 10-instance InstancedMesh with GSAP tweens | InstancedMesh with procedural animation |
| **Wind Strokes** | Randomly spawned cloned meshes with progress shader | Same approach, procedural animation |
| **Camera** | Spherical orbit with smooth easing, boom/truck, clamped ranges | Custom camera behavior |
| **Depth of Field** | BokehPass with raycasted dynamic focus | **Not ported** — Stem has no DOF pass |

## Asset Extraction Plan

### Models (6 GLBs, DRACO-compressed)
- `model.glb` — Main diorama (all named meshes: telescopeY/X, gear0/1, flag*)
- `entranceModel.glb` — Entrance portal
- `bakedFloorShadowModel.glb` — Floor shadow overlay mesh
- `bakedFloorLightModel.glb` — Floor light overlay mesh
- `windStroke1Model.glb` — Wind stroke template variant 1
- `windStroke2Model.glb` — Wind stroke template variant 2

### Textures (14 PNGs)
- 11 matcap textures (brass, fabricPinkDark/Light, foliage, globe, lens, metal, paper, stone, stoneDark, wood)
- 2 floor baked textures (shadow alpha, light alpha)
- 1 entrance stroke alpha map

## Built-in Reuse

| Built-in | Used? | Reason |
|----------|-------|--------|
| `rotation` lambda | No | Telescope needs GSAP-like random motion, not constant spin |
| `animation` behavior | No | No skeletal animations in source |
| `genericSound` | No | No audio in source |
| `tween` behavior | No | Custom shader-driven animations not compatible |

## Custom Systems

| Custom System | Purpose |
|---------------|---------|
| `sw.smallWorld` behavior | All visual content, shaders, animations |
| `sw.orbitCamera` behavior | Spherical orbit camera navigation |

## Expected Manual Follow-ups

1. Verify DRACO-compressed GLBs load correctly in Script Tool
2. Verify matcap texture names match model material names
3. Tune matcap shader appearance if Three.js version differences affect color space

## Open Questions / Risk Areas

- **DRACO decoding**: Source GLBs are DRACO-compressed; StemStudio's GLTFLoader should handle this but worth verifying
- **Three.js version delta**: Source uses r134, Stem uses 0.179. The custom matcap shader avoids Three.js includes to prevent compatibility issues
- **Color space**: Matcap textures may render slightly differently due to color management changes between r134 and r179
- **Depth of field**: Omitted entirely — this is a presentation-layer approximation documented in conversion-notes
