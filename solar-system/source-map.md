# Source Map — Solar System

## Source → Generated Mapping

| Source File | Generated File(s) | Purpose |
|-------------|-------------------|---------|
| `components/solar-system/Planet.tsx` | `behaviors/planetOrbit.yaml` | Orbital motion + self-rotation loop |
| `components/solar-system/Planet.tsx` (SaturnRing) | `behaviors/saturnRing.yaml` | Saturn ring mesh creation |
| `components/solar-system/Sun.tsx` | `behaviors/sunGlow.yaml` | Point light + emissive material |
| `components/solar-system/Moon.tsx` | `behaviors/planetOrbit.yaml` | Reuses orbit behavior with `orbitTarget="Earth"` |
| `components/solar-system/OrbitRing.tsx` | `behaviors/solarController.yaml` | Orbit ring line generation |
| `components/solar-system/SolarScene.tsx` | `behaviors/orbitCamera.yaml` | Camera orbit controls |
| `components/solar-system/SolarScene.tsx` (Stars) | `behaviors/solarController.yaml` | Star particle field |
| `components/ui/ControlBar.tsx` | `behaviors/solarController.yaml` | Keyboard speed/pause controls |
| `components/ui/InfoPanel.tsx` | Deferred | Planet info display (not in initial port) |
| `components/ui/ComparePanel.tsx` | Not ported | Compare mode UI |
| `components/ui/LoadingScreen.tsx` | Not ported | Loading screen |
| `app/page.tsx` | `solar-system.stemscript` | Entry point, state management |
| `data/planets.ts` | Embedded in behaviors | Planet data constants |
| `public/textures/*` | `textures/*` | All textures copied 1:1 |

## Important Entrypoints

- **Source:** `app/page.tsx` → renders `<SolarScene>` with state props
- **Destination:** `solar-system.stemscript` → creates scene and attaches behaviors

## Mechanics Map

| Source Mechanic | Stem Implementation |
|-----------------|---------------------|
| `useFrame` orbit loop | `planetOrbit.update()` per-frame callback |
| `useFrame` rotation | `planetOrbit.update()` rotation increment |
| React state `speedMultiplier` | `erth.store.get("solarSpeed")` |
| React state `paused` | `erth.store.get("solarPaused")` |
| `OrbitControls` (drei) | Custom `orbitCamera` behavior with spherical math |
| `Stars` (drei) | `solarController` creates `THREE.Points` |
| `Line` (drei) | `solarController` creates `THREE.Line` per orbit |
| `useLoader(TextureLoader)` | `erth.asset.image.findByName()` + `createTexture()` |
| `pointLight` (R3F) | `sunGlow` creates `THREE.PointLight` |
| React onClick (planet) | Deferred (needs raycasting) |

## Asset Map

| Source Path | Destination Path | Import Name |
|-------------|-----------------|-------------|
| `public/textures/2k_sun.jpg` | `textures/2k_sun.jpg` | SunTex |
| `public/textures/2k_mercury.jpg` | `textures/2k_mercury.jpg` | MercuryTex |
| `public/textures/2k_venus_surface.jpg` | `textures/2k_venus_surface.jpg` | VenusTex |
| `public/textures/2k_earth_daymap.jpg` | `textures/2k_earth_daymap.jpg` | EarthTex |
| `public/textures/2k_mars.jpg` | `textures/2k_mars.jpg` | MarsTex |
| `public/textures/2k_jupiter.jpg` | `textures/2k_jupiter.jpg` | JupiterTex |
| `public/textures/2k_saturn.jpg` | `textures/2k_saturn.jpg` | SaturnTex |
| `public/textures/2k_saturn_ring_alpha.png` | `textures/2k_saturn_ring_alpha.png` | SaturnRingTex |
| `public/textures/2k_uranus.jpg` | `textures/2k_uranus.jpg` | UranusTex |
| `public/textures/2k_neptune.jpg` | `textures/2k_neptune.jpg` | NeptuneTex |
| `public/textures/2k_moon.jpg` | `textures/2k_moon.jpg` | MoonTex |
