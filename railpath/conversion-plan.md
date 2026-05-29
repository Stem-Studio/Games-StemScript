# Conversion Plan — Star Fox Railpath 2.0

## Source Target
- **Repo**: https://github.com/mustache-dev/Starfox-railpath-2.0
- **Stack**: React Three Fiber + drei + GSAP + wawa-vfx + zustand
- **Size**: ~1500 lines across 13 source files

## Detected Entrypoints
- `src/App.jsx` → Canvas + Game component
- `src/Game.jsx` → Scene composition (player, lasers, lighting, path, VFX)

## Genre Classification
**Rail Shooter** — on-rails space combat (Star Fox-style)

## Core Gameplay Systems

| System | Source Files | Priority |
|--------|------------|----------|
| Rail path following | `Path.jsx`, `curve.js` | Critical |
| Player movement (constrained XY) | `PlayerController.jsx` | Critical |
| Camera (behind-ship, rail-locked) | `PlayerController.jsx` | Critical |
| Barrel roll (double-tap) | `Arwing.jsx` | High |
| Laser shooting (burst-fire) | `Lasers.jsx` | High |
| Engine glow shader | `Glow.jsx` | Medium |
| Viewfinder crosshairs | `PlayerController.jsx` | Medium |
| Barrel roll VFX | `Rolling.jsx` | Low |
| Engine trails | `Arwing.jsx` (Trail) | Low |
| Bloom postprocessing | `Composer.jsx` | Medium |

## Asset Extraction Plan
- `arwing-transformed.glb` — Arwing spacecraft model (direct copy)
- `testenv-transformed.glb` — Environment terrain plane (direct copy)
- `viewfinder.png` — Crosshair texture (direct copy, reserved for texture mapping)
- `rolling.png` — Barrel roll effect texture (direct copy, not used in initial port)
- `burst.jpg` — Burst effect texture (direct copy, commented out in source)

## Planned Built-in Reuse
- **Bloom postprocessing** via `scene postprocessing bloom={...}`
- **Scene lighting** via `scene lighting ambient={...}`
- **Camera NONE mode** for custom camera control

## Planned Custom Systems

| Behavior | Purpose |
|----------|---------|
| `sf.railPath` | CatmullRomCurve3 path following with lerp/slerp smoothing |
| `sf.playerController` | XY movement, camera control, barrel roll, viewfinder, glow |
| `sf.laserSystem` | Burst-fire projectile spawning and lifecycle |

## Routing / Region Strategy
Single scene, single path. No multi-region routing needed.

## Expected Manual Follow-ups
1. Environment plane may need flipping (source used negative scale)
2. Viewfinder texture alpha map not applied (using solid emissive material)
3. Warehouse HDRI environment not available — model reflections will be darker
4. Engine trails (MeshLine) not ported — would need VFX particle trail
5. Barrel roll VFX (Rolling shader) not ported — visual-only omission
6. wawa-vfx particle emitter not ported — engine particles omitted

## Open Questions / Risk Areas
- Camera orientation relies on the Matrix4.lookAt camera-style calculation matching the source's Object3D.lookAt + π-flip combination — needs visual verification
- Keyboard input via document.addEventListener (no StemStudio InputManager alternative for custom behaviors)
- Environment negative scale → positive scale conversion may affect visual appearance
