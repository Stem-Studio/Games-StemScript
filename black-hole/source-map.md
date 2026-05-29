# Source Map: webgl-black-hole -> black-hole

Source: https://github.com/brunosimon/webgl-black-hole (Three.js / GLSL)

| Source path | Destination | Notes |
|---|---|---|
| `sources/Experience/Experience.js` | absorbed into stemscript scene wiring | Static singleton orchestrator; not needed under stem's owned engine |
| `sources/Experience/Renderer.js` | `behaviors/bhBlackHole.yaml` (renderer section) | `composition.space` + `composition.distortion` render targets are owned by the behavior; final composite plane is parented to `game.camera` so stem's main render draws it |
| `sources/Experience/World.js` | `behaviors/bhBlackHole.yaml` (instantiates BlackHole + Stars) | One-line spawner |
| `sources/Experience/BlackHole.js` | `behaviors/bhBlackHole.yaml` (`_setupBlackHole`) | disc cylinder + 50k particles + active/mask distortion planes |
| `sources/Experience/Stars.js` | `behaviors/bhBlackHole.yaml` (`_setupStars`) | 50k stars on sphere radius 400 |
| `sources/Experience/Noises.js` | `behaviors/bhBlackHole.yaml` (`_renderNoises`) | One-shot 128×128 noise texture for the disc |
| `sources/Experience/Camera.js` | `behaviors/bhOrbitCamera.yaml` | Stem's `game.camera` is rotated by drag + scroll-zoom |
| `sources/Experience/Cupola.js` | `behaviors/bhCupola.yaml` (optional, commented out in stemscript) | Mirrors the upstream comment status |
| `sources/Experience/Materials/*.js` (×7) | inlined as JS material factories in `bhBlackHole.yaml` | All `RawShaderMaterial` w/ `glslVersion: THREE.GLSL3` |
| `sources/Experience/shaders/*.glsl` (×14 + 3 partials) | inlined as JS template literals in `bhBlackHole.yaml` | `noises` shader patches `#include ../partials/perlin3dPeriodic.glsl` to inline the perlin function |
| `sources/Experience/Resources.js` + `Loader.js` | not ported (no runtime asset loading needed) | Cupola/lenna handled by stem's import pipeline if used |
| `sources/Experience/Utils/*.js` | not ported (Time/Sizes/Events handled by stem) | Time = `update(deltaTime)`; Sizes = `game.renderer.getSize()` |
| `sources/Experience/Debug/*.js` | not ported (lil-gui debug UI omitted) | Color/intensity tunables exposed as behavior attributes |
| `public/assets/models/cupola.glb` | `models/cupola.glb` | mirrored |
| `public/assets/lenna.png` | `textures/lenna.png` | mirrored (also commented out upstream) |
