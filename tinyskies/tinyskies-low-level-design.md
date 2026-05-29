# TinySkies - Low-Level Design

This document captures the current Tinyskies runtime architecture and the 2026-05-11 batching/performance plan. The stemscript and behavior YAML files are the source of truth.

## Object Hierarchy

```
Default Scene
|-- Globe
|   |-- tinyskies.globeVisual
|   |-- tinyskies.globeVegetation
|   |-- tinyskies.globeStructures
|   |-- tinyskies.globeLandmarks
|   |-- tinyskies.globeBiomeDecor
|   |-- tinyskies.globeAtmospheric
|   |-- tinyskies.globeMonuments
|   |-- quest, portal, world-effect behaviors
|-- Plane (tag=Player)
|   |-- biplane / boat / carpet visual behaviors
|   |-- tinyskies.flightController
|   |-- tinyskies.cameraRig
|-- PaintballManager
|-- DayNightCycle
|-- Starfield / Aurora / GodRays / FloatingLanterns / MeteorShower / Contrails
|-- BoostRings
|-- SkyGremlins
|-- VehicleSwitcher
```

## Requirements Covered

| Requirement ID | Technical Design Coverage | Owning Artifact / System |
|----------------|---------------------------|--------------------------|
| REQ-001 - REQ-018 | Core player, camera, globe, paintball, import scripts. | `tinyskies.stemscript`, core behavior YAMLs |
| REQ-019 - REQ-034 | Expanded gameplay, ambience, decor, particles, vehicles, and local persistence. | Tinyskies behavior YAMLs |
| REQ-035 | Cloud and flower decorations render via batched instancing; dynamic updates reuse scratch objects and slice high-count instance work. | `tinyskiesGlobeAtmospheric.yaml`, `tinyskiesGlobeBiomeDecor.yaml`, hot update behaviors |

## Component Architecture

| Behavior | Attached To | Responsibility | Pattern |
|----------|-------------|----------------|---------|
| `tinyskies.globeVisual` | Globe | Terrain-deformed sphere, atmosphere shell, globe surface tag. | Runtime mesh builder with editor preview. |
| `tinyskies.globeVegetation` | Globe | Trees, palms, rocks, mushrooms. | Instanced static geometry. |
| `tinyskies.globeBiomeDecor` | Globe | Hotsprings, flower gardens, particles. | Runtime placement plus batched flower instances. |
| `tinyskies.globeAtmospheric` | Globe | Clouds, balloons, floating trees, race banners. | Instanced cloud puffs, dynamic instanced floating trees. |
| `tinyskies.flightController` | Plane | Spherical movement, vehicle envelope, player state store. | Matrix owner and store producer. |
| `tinyskies.paintballSystem` | PaintballManager | Projectile pool, decals, enemy hit queue. | Object pool and store consumer. |
| `tinyskies.cameraRig` | Plane | Chase camera and horizon alignment. | Store consumer, camera mutator. |

## Data Flow Per Game Event

### Event: Player Frame Update

```
InputManager -> tinyskies.flightController -> erth.store tinyskies/q*
  -> tinyskies.cameraRig
  -> tinyskies.paintballSystem
  -> quest and vehicle behaviors
```

### Event: Race Banner Query

```
tinyskies.globeAtmospheric init()
  -> erth.store.set("tinyskies/raceBanners", payload)
  -> tinyskies.raceQuest reads banner positions
  -> erth.store.set("tinyskies/raceBannersVisibilityCommand", command)
  -> tinyskies.globeAtmospheric update() toggles banner visibility
```

### Event: Decorative Batching

```
Seeded placement -> local transform records -> InstancedMesh matrix buffers
  -> update loop mutates only dynamic instances
  -> teardown disposes geometry, materials, and mapped textures
```

## State Ownership Table

| Key / Store Path | Owner | Readers | Reset On |
|------------------|-------|---------|----------|
| `tinyskies/qx`, `qy`, `qz`, `qw`, `heading`, `pitch`, `altitude`, `speedRatio` | `flightController` | Camera, paintball, portals, quests | Play start |
| `tinyskies/firePaintball` | `flightController` | Paintball, carpet portal system | Consumed event |
| `tinyskies/raceBanners` | `globeAtmospheric` | Race quest | Behavior init |
| `tinyskies/raceBannersVisibilityCommand` | Race quest | `globeAtmospheric` | Race state change |
| `tinyskies/hotspringNormals`, `tinyskies/butterflyNormals` | `globeBiomeDecor` | Selfie quest | Behavior init |
| `tinyskies/nightWeight`, `dayWeight`, `sunDirection` | `dayNightCycle` | Ambience effects | Per frame |
| `tinyskies/gremlinPositions`, `gremlinHits` | Enemy and paintball systems | Enemy and paintball systems | Per frame queue |
| `tinyskies/applyHeartHeal` | Heart pickup behavior | `flightController` | Consumed event |

## Asset Pipeline

| Asset Key | Source | Format | Notes |
|-----------|--------|--------|-------|
| `ProjectCover` | Source social card | PNG | Scene thumbnail. |
| `PyramidModel`, `HotspringModel`, `StatueModel`, `Moonstone*`, `EternalFlameModel`, `CapybaraModel` | Source `client/public/3D` | GLB | Imported once, hidden as templates. |
| `spherical-math`, `terrain`, `biplane-mesh`, `vehicle-meshes` | Source TypeScript helpers | Script imports | Runtime helper APIs for behavior code. |

## Init-Order Dependencies

```
1. Stemscript imports shared scripts and model templates.
2. Globe behaviors build terrain and publish landmark/decor data.
3. Player visual behaviors attach meshes to Plane.
4. flightController writes player state to store.
5. Camera, projectiles, quests, portals, and ambience consume store state.
```

## Memory Budget

| Category | Count | Strategy | Notes |
|----------|-------|----------|-------|
| Vegetation trees | 10000 | Existing `InstancedMesh` buckets | Static after placement. |
| Cloud puffs | Roughly 150-250 | Single `InstancedMesh` | Ring drift handled by parent group rotation. |
| Floating trees | 1120 | One dynamic `InstancedMesh` | Matrix writes sliced across frames. |
| Flower garden parts | Roughly 1200-1500 subparts | `InstancedMesh` buckets | Stalks, centers, and petal-color buckets. |
| Water sparkles | 1500 | Existing sliced `InstancedMesh` | Already optimized. |

## Open Technical Questions

- Whether the engine can expose partial `InstancedBufferAttribute` upload ranges reliably for all supported Three.js/WebGPU versions. This pass uses sliced CPU updates without relying on that API.
