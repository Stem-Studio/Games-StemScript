# HexGL Source Map

## Source → Destination File Mapping

| Source File | Destination | Notes |
|---|---|---|
| `bkcore/hexgl/ShipControls.js` | `behaviors/hglShipController.yaml` | Full 806-line port of ship physics |
| `bkcore/threejs/CameraChase.js` | `behaviors/hglCameraChase.yaml` | Chase camera with speed offset |
| `bkcore/hexgl/ShipEffects.js` | `behaviors/hglShipEffects.yaml` | Booster + particle effects |
| `bkcore/threejs/Particles.js` | `behaviors/hglShipEffects.yaml` | Particle system inlined |
| `bkcore/hexgl/HUD.js` | `behaviors/hglHudOverlay.yaml` | Canvas HUD overlay |
| `bkcore/hexgl/Gameplay.js` | `behaviors/hglRaceManager.yaml` | Race state machine |
| `bkcore/hexgl/HexGL.js` | `hexgl.stemscript` | Init flow → stemscript commands |
| `bkcore/hexgl/tracks/Cityscape.js` | `hexgl.stemscript` | Track setup, material config |
| `launch.js` | `behaviors/hglRaceManager.yaml` | Partial port: launch overlay and explicit start flow |

## Geometry → Model Mapping

| Source Geometry | Destination GLB |
|---|---|
| `geometries/ships/feisar/feisar.js` | `models/feisar.glb` |
| `geometries/tracks/cityscape/track.js` | `models/track-cityscape.glb` |
| `geometries/tracks/cityscape/scrapers1.js` | `models/scrapers1.glb` |
| `geometries/tracks/cityscape/scrapers2.js` | `models/scrapers2.glb` |
| `geometries/tracks/cityscape/start.js` | `models/start-line.glb` |
| `geometries/tracks/cityscape/startbanner.js` | `models/start-banner.glb` |
| `geometries/tracks/cityscape/bonus/speed.js` | `models/bonus-speed.glb` |
| `geometries/bonus/base/base.js` | `models/bonus-base.glb` |
| `geometries/booster/booster.js` | `models/booster.glb` |

## Texture Mapping

| Source Texture | Destination |
|---|---|
| `textures.full/ships/feisar/diffuse.jpg` | `textures/ship-diffuse.jpg` |
| `textures.full/ships/feisar/normal.jpg` | `textures/ship-normal.jpg` |
| `textures.full/ships/feisar/specular.jpg` | `textures/ship-specular.jpg` |
| `textures.full/tracks/cityscape/diffuse.jpg` | `textures/track-diffuse.jpg` |
| `textures.full/tracks/cityscape/normal.jpg` | `textures/track-normal.jpg` |
| `textures.full/tracks/cityscape/specular.jpg` | `textures/track-specular.jpg` |
| `textures.full/tracks/cityscape/collision.png` | `textures/collision.png` |
| `textures.full/tracks/cityscape/height.png` | `textures/height.png` |
| `textures.full/skybox/dawnclouds/*.jpg` | `textures/skybox/` |
| (+ scrapers, start, bonus textures) | `textures/` |

## Audio Mapping

| Source Audio | Destination |
|---|---|
| `audio/bg.ogg` | `audio/bg.ogg` |
| `audio/wind.ogg` | `audio/wind.ogg` |
| `audio/crash.ogg` | `audio/crash.ogg` |
| `audio/boost.ogg` | `audio/boost.ogg` |
| `audio/destroyed.ogg` | `audio/destroyed.ogg` |

## Store Key Communication

| Key | Writer | Reader(s) | Type |
|---|---|---|---|
| `hgl_speed` | ShipController | HudOverlay | number (0-100) |
| `hgl_speedRatio` | ShipController | CameraChase, ShipEffects | number (0-1) |
| `hgl_boost` | ShipController | RaceManager | number |
| `hgl_shield` | ShipController | HudOverlay | number (0-100) |
| `hgl_shieldRatio` | ShipController | HudOverlay | number (0-1) |
| `hgl_collision` | ShipController | ShipEffects, RaceManager | {left,right,front} |
| `hgl_destroyed` | ShipController | RaceManager | boolean |
| `hgl_active` | ShipController | — | boolean |
| `hgl_boostHit` | ShipController | RaceManager | boolean |
| `hgl_time` | RaceManager | HudOverlay | string |
| `hgl_lap` | RaceManager | HudOverlay | string |
| `hgl_message` | RaceManager | HudOverlay | string |
| `hgl_raceActive` | RaceManager | — | boolean |
