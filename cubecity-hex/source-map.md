# Source: https://github.com/hexianWeb/CubeCity

## Entrypoint Map

| Source | Role | Port Target |
|---|---|---|
| `src/main.js` | Vue + Pinia boot | `cubecity-hex.stemscript` imports + `cc.cityGame` runtime init |
| `src/App.vue` | App shell, timer startup, overlay layout | `behaviors/ccCityGame.yaml` UIKit HUD + 5-second tick |
| `src/components/GameCanvas.vue` | Three.js canvas mount | `behaviors/ccCityGame.yaml` runtime scene creation |
| `src/js/experience.js` | Main Three.js singleton | `behaviors/ccCityGame.yaml` |
| `src/js/world/world.js` | Resource-ready world creation | `behaviors/ccCityGame.yaml` |

## System Map

| Source System | Key Files | Generated System |
|---|---|---|
| Tile grid and city world | `src/js/components/tiles/city.js`, `tile.js` | Runtime tile grid in `cc.cityGame` |
| Building definitions and models | `src/constants/constants.js`, `src/js/components/tiles/building-factory.js` | Embedded building catalog + imported GLBs in `cc.cityGame` |
| Interaction flow | `src/js/tools/interactor.js`, `handlers.js`, `utils.js` | Pointer raycast and mode handlers in `cc.cityGame` |
| Camera | `src/js/camera.js` | Custom fixed-angle camera logic in `cc.cityGame` |
| Simulation metrics | `src/stores/useGameState.js` | Local runtime state + derived metric helpers in `cc.cityGame` |
| Building modifiers | `src/constants/building-interactions.js`, `building-interaction-utils.js` | Embedded adjacency modifier/status rules in `cc.cityGame` |
| HUD and overlays | `src/components/*.vue` | UIKit HUD and overlays in `cc.cityGame` |
| Music playlist | `src/components/AudioManager.vue` | HTML audio playback in `cc.cityGame` |

## Asset Map

| Source Asset | Port Asset |
|---|---|
| `public/models/*.glb` | `cubecity-hex/models/*.glb` |
| `public/textures/effect/*.png` | `cubecity-hex/textures/effect/*.png` |
| `public/audio/song01.mp3` | `cubecity-hex/audio/song01.mp3` |
| `public/audio/song02.mp3` | `cubecity-hex/audio/song02.mp3` |

## Fidelity Notes

- The port preserves the source’s click-driven city-management loop, building catalog, economic formulas, mode structure, and 2.5D camera intent.
- The source has no player avatar. The port introduces a synthetic tagged `Player` root as the gameplay anchor required by Stem.
- Source local-storage restore flow is not ported because this conversion stays session-only.
