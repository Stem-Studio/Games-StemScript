# TinySkies - Gameplay Design

This is a post-ship design snapshot for the current Tinyskies port plus the 2026-05-11 batching/performance pass. The source-fidelity requirements remain authoritative in `tinyskies-requirements.md`.

## Core Fantasy

The player feels like a nimble toy aircraft skimming around a tiny living planet, with pickups, paint, quests, and sky effects making each orbit feel playful and readable.

## Requirements Covered

| Requirement ID | Gameplay Design Coverage | Status After This Doc |
|----------------|--------------------------|-----------------------|
| REQ-001 - REQ-018 | Core flight, camera, paintball, procedural globe, and MVP visual feel. | Already Implemented |
| REQ-019 - REQ-034 | Boosts, enemies, terrain, vehicles, quests, ambience, decor, and source-fidelity polish layers. | Already Implemented |
| REQ-035 | Performance pass preserves gameplay counts and visual intent while reducing renderer/CPU overhead. | Implemented |

## Game Loop

### Primary Loop

| Step | Player Action | System Response | Reward |
|------|---------------|-----------------|--------|
| 1 | Fly around the globe using thrust, turn, climb, and brake. | Flight controller keeps the player on a spherical path above terrain. | Smooth traversal and readable horizon. |
| 2 | Collect rings, race checkpoints, quest pickups, and heal pickups. | Store events trigger boost, quest progress, healing, or respawn timers. | Speed, progress, and visible feedback. |
| 3 | Fire paintballs and dodge enemy projectiles. | Paintball system resolves projectile arcs and hits. | Globe decals, enemy damage, and survival pressure. |

### Secondary Loop

Lifetime stats persist locally for sessions played, rings collected, hits, and pickups. Race, delivery, selfie, and vehicle systems add reasons to revisit landmarks without requiring server persistence.

### Session Arc

A session starts with free flight and orientation, peaks as the player chains pickups or enters vehicle-specific activities, and ends when the player reloads or exits play mode. There is no hard fail state in this port.

## Mechanic Rationale

| Mechanic | Why It Exists | What It Replaces If Removed | Risk If Poorly Tuned |
|----------|---------------|-----------------------------|----------------------|
| Spherical flight | Defines the game identity and keeps motion wrapped around the globe. | Generic free-flight. | Clipping, camera disorientation, or sluggish turning. |
| Paintball | Gives the player a low-stakes action during traversal. | Passive sightseeing only. | Spawn spam or unreadable decals. |
| Pickups and quests | Create short-term goals across the planet. | Aimless orbiting. | Too much clutter or unclear objectives. |
| Decorative world layers | Makes the globe feel populated and source-faithful. | Bare terrain. | Excess draw calls and frame spikes. |

## State Machine

```
[Loading] --(behaviors initialized)--> [Playing]
[Playing] --(vehicle switch)--> [Playing: Vehicle Mode]
[Playing] --(quest trigger)--> [Playing: Quest Active]
[Playing] --(reload / exit play)--> [Disposed]
```

## Tuning Parameters

| Parameter | Default | Affects | Tuning Note |
|-----------|---------|---------|-------------|
| `globeRadius` | 5 | Flight, camera, decor placement | Source radius; do not change for performance. |
| `treeCount` | 10000 | Vegetation density | Already instanced; optimize batching before reducing. |
| `cloudCount` | 30 | Atmospheric silhouette | Batch puffs, preserve count. |
| `floatingTreeClusters` | 28 | Floating island canopy feel | Slice dynamic matrix updates, preserve count. |
| `butterflyGardenCount` | 4 | Biome landmark density | Batch flowers, preserve garden count. |
| `sparkleCount` | 1500 | Ocean glints | Already instanced and sliced. |

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Batching changes visual transforms. | Clouds or flowers shift from source-like placement. | Use the same seeded random sequence and local transforms, only change render representation. |
| Dynamic instance updates still upload full buffers. | Frame spikes remain visible. | Slice CPU-side matrix writes and keep future engine profiling separate. |
| Shared material disposal misses textures. | Runtime memory grows after reloads. | Dispose mapped textures before material disposal in teardown. |

## Open Questions

- None for this pass. If profiling still shows slow frames after batching, the next step is a browser profile and an engine/render-quality pass.
