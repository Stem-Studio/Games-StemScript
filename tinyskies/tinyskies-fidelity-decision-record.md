# TinySkies — Fidelity Decision Records

User locked the fidelity bar at "behave identically" on 2026-05-05. Material classes are the one place that bar mechanically cannot hold — recorded here per the DDG-FIDELITY gate.

---

## FDR-001: Material classes (MeshPhongMaterial → MeshStandardNodeMaterial)

**Date:** 2026-05-05
**Status:** Accepted
**Impact:** Low (visual only — feel/mechanics unaffected)

### Context

Source `source/client/src/game/BiplaneMesh.ts` and `Globe.ts` build every mesh with `THREE.MeshPhongMaterial` (flat-shaded, with `shininess` 20…90). Source `source/client/src/game/RimLight.ts` patches each Phong material via `material.onBeforeCompile` to inject a Fresnel rim glow into the GLSL fragment shader.

### Problem

StemStudio runs `three.webgpu.js` exclusively. The legacy material classes (`MeshPhongMaterial`, `MeshLambertMaterial`, `MeshBasicMaterial`, `ShaderMaterial`, `RawShaderMaterial`) are not WebGPU-compatible. `material.onBeforeCompile` does not exist on the NodeMaterial pipeline — node materials drive shading through TSL graph nodes (`colorNode`, `emissiveNode`, etc.), not GLSL string injection. `tools/check-behavior-patterns.js` enforces this as an error.

### StemStudio Limitation

- No `MeshPhongMaterial` / `MeshLambertMaterial` / `ShaderMaterial`.
- No `onBeforeCompile` on NodeMaterials.
- Required replacements: `MeshStandardNodeMaterial` (closest equivalent for lit surfaces), `MeshBasicNodeMaterial` (unlit), `MeshPhysicalNodeMaterial` (PBR/Fresnel).
- Reference: `docs/domains/tsl-patterns.md` "Material Class Mapping" + the `tools/check-behavior-patterns.js` error message body.

### Gameplay Impact

None. Affects appearance only:

- Lighting model changes from Phong (specular/shininess) to Standard PBR (roughness/metalness). With shininess→roughness mapping (50→0.45, 25→0.6, 80→0.3, etc.) the silhouettes and color palette stay identical; specular highlights appear slightly softer and broader.
- Globe atmosphere fresnel formula is reproduced **byte-identically** in TSL (same `1 - dot(viewDir, normalWorld)`, same `smoothstep(0.05, 0.5)` × `1 - smoothstep(0.7, 1.0)` × `pow(rim, 1.8) * 0.22` chain). Only the implementation language differs (TSL vs GLSL).
- Rim-light glow on biplane is reproduced via TSL `emissiveNode`. Visually equivalent halo; the source's `globalRimColor` mutation hook (used by source's day/night cycle to retint rims live) is dropped — irrelevant in MVP since no day/night cycle.

REQ-009 (biplane visual) and REQ-010 (globe visual) marked `Implemented` despite the deviation; the fidelity bar was understood as visual + mechanical equivalence, not source-code-line equivalence.

### Options

#### Option A: Best Fidelity — *chosen*
Swap to NodeMaterial variants 1:1; reproduce the Phong-style highlights via roughness/metalness tuning; rebuild rim-light and atmosphere fresnel as TSL graphs that compute the same numbers. Visual delta: barely perceptible specular softness, identical Fresnel halo.

#### Option B: Best Stem-Native
Use bare `MeshStandardNodeMaterial` everywhere with default roughness/metalness; drop rim-light. Visually flatter; biplane loses its signature rim glow. Rejected.

#### Option C: Fastest Fallback
Use `MeshBasicNodeMaterial` everywhere (unlit). Trivial port. Loses all shading. Rejected — would visibly change the look.

### Decision

Option A. The shininess→roughness mapping table is documented in `imports/biplane-mesh.js` `makeStandardLitMaterial`. Rim-light helper (`applyRimLight`) and atmosphere fresnel (`tinyskiesGlobeVisual.yaml`) reproduce the source's exact intensity math in TSL.

### Consequences

- Specular highlights on the biplane are slightly softer than source. No gameplay impact.
- `globalRimColor` mutation is gone; if a future pass adds day/night, rim color will need a `uniform` node + per-frame update instead of the current hard-coded daytime tint.
- `paintSplatterSurface` userData markers are preserved on wing meshes for the paintball system (REQ-008).

### Files Affected

- `tinyskies/imports/biplane-mesh.js` — every material class swapped; `addRimLight` rewritten as `applyRimLight` (TSL).
- `tinyskies/behaviors/tinyskiesGlobeVisual.yaml` — surface MeshStandardNodeMaterial, atmosphere MeshBasicNodeMaterial + TSL fresnel.
- (Future) `tinyskies/behaviors/tinyskiesPaintballSystem.yaml` — paintball projectile material will follow same rule.

---

## FDR-002: Keyboard input via InputManager (key layout remap)

**Date:** 2026-05-05
**Status:** Accepted
**Impact:** Low (key labels change; flight feel preserved)

### Context

Source `source/client/src/game/FlightControls.ts` reads keyboard via raw `window.addEventListener("keydown"/"keyup")`, mapping:

- A / D = yaw left / right
- W / S = forward thrust / brake
- ArrowUp = climb (altitude up)
- Space = fire paintball (one-shot per press)
- F = interact (no-op in MVP)

### Problem

`tools/check-generated-syntax.js` flags both `window.addEventListener` and `document.addEventListener` as `nonSuppressible: true` errors — `// @check-ok` cannot be used. The engine mandates `game.inputManager` for keyboard. Default InputManager bindings (per `docs/domains/input-manager-guide.md`) bind W/S **and ArrowUp/Down** to the same `forward` motion ±1, so the source's separate "thrust on W" + "climb on ArrowUp" semantics cannot be expressed without `setBindingFromMaps()` — which is a destructive full replacement.

### Gameplay Impact

Flight feel — speed envelope, smoothing rates, banking, altitude curves — is preserved exactly (all numeric constants ported verbatim). The only deviation is which keys trigger which action:

| Source key | New key | Action |
|---|---|---|
| A / D | A / D (via `motion("lateral")` × −1) | Yaw left / right |
| W / S | W / S (via `motion("forward")`; +1 = thrust, −1 = brake) | Forward / brake |
| ArrowUp | **Shift** (via `getAction("run")`) | Climb to high altitude |
| (none) | **Ctrl** (via `getAction("crouch")`) | Descend (bonus — source has no descend key) |
| Space | Space (via `getAction("jump")` + edge detection) | Fire paintball |
| F | F (via `getAction("drop")`) | Interact (no-op in MVP) |

### Options

#### Option A: Use InputManager defaults with key remap — *chosen*
Adapt the source's input model to InputManager's pre-existing actions, accepting that climb shifts from ArrowUp to Shift. Adds Ctrl-descend as a small bonus (source's `descend` arg always passes `false`).

#### Option B: Full `setBindingFromMaps()` replacement
Re-declare every default action+motion to add a custom `climb` action on ArrowUp. Doc warns this is destructive; risks breaking touch / gamepad coverage in a future MP/mobile pass. Rejected for MVP.

#### Option C: Document.addEventListener
Forbidden by validator. Rejected.

### Decision

Option A. Source feel is the bar; key labels are not. Updated control-hint surface (when added in a future pass) will show the new layout.

### Consequences

- ArrowUp does nothing (W is the default forward binding via `forward` motion).
- Shift hold = climb (was: ArrowUp). Ctrl hold = descend (new).
- Mobile/gamepad inherits InputManager's standard `run` and `crouch` virtual buttons / gamepad shoulder buttons for free — better than source's keyboard-only setup.
- REQ-002 retitled in `tinyskies-requirements.md` Notes column to point at this FDR.

### Files Affected

- `tinyskies/behaviors/tinyskiesFlightController.yaml` — uses `game.inputManager.getMotion / getAction`; no window listeners.

---

## FDR-003: SkyGremlins capped to basic gremlin (no King)

**Date:** 2026-05-05
**Status:** Accepted
**Impact:** Low (one enemy variant + heart pickups deferred; core enemy gameplay intact)

### Context

Source `source/client/src/game/SkyGremlins.ts` is 1507 lines and ships:

- The basic green gremlin (3-HP, single shot pattern)
- The Gremlin King — a special enemy that spawns after 7 takedowns, 10-HP, larger model with crown/armor, 2× damage shots, longer fire range, retaliate mode after taking damage
- `RETALIATE` mode (king fires faster + farther for 5.5s after being hit)
- Heart pickups via `client/src/game/GremlinHearts.ts` (292 lines) — drops on gremlin death; player flying over restores 1 HP up to GREMLIN_HP_MAX

### Problem

Porting all of this in one batch is overkill. The core combat loop (chase + shoot + take damage) is already in the basic gremlin. The King + Hearts pickups add depth but aren't on the critical path for "the paintball has a target."

### Decision

Ship only the basic gremlin variant in Batch B. Defer the Gremlin King and GremlinHearts to a polish micro-batch the user can opt into later (likely paired with the boat/carpet vehicles or terrain).

### Consequences

- Player can't progress to the King fight (no King spawn condition tracked).
- No HP recovery once damaged — if a player dies to gremlins, they stay at 0 HP until restart. The flightController publishes `tinyskies/playerHp` for a future HUD/game-over screen but no behavior consumes it yet.
- Aesthetic: gremlins use a much simpler procedural mesh than source (5-part body vs source's 14+-part body with backpack/goggles/teeth/limbs). Visually distinct as enemies but less detailed.

### Files Affected

- `tinyskies/behaviors/tinyskiesSkyGremlins.yaml` — single gremlin type, basic AI.
- `tinyskies/behaviors/tinyskiesFlightController.yaml` — gremlin slow + wobble + HP branches added; no GremlinHearts consumption.
- (Future) `tinyskies/behaviors/tinyskiesGremlinKing.yaml` + `tinyskiesGremlinHearts.yaml` — would land in a future polish batch.

---

## FDR-004: Terrain heightmap shipped without ocean backbone, volcanoes, or props

**Date:** 2026-05-05
**Status:** Accepted
**Impact:** Low (visual; deformation + biomes shipped, secondary detail layers deferred)

### Context

Source `source/client/src/game/{TerrainSurface,SimplexNoise,TerrainPresets}.ts` (~615 lines combined) plus `Volcano.ts` (621 lines) plus the prop-placement code inside `Globe.ts` (trees / rocks / villages / balloons / windmills / moonstones — diffused across thousands of lines of Globe.ts) produce the source's full terrain layer.

### Problem

Porting all of it in one batch is overkill. The core asks ("the globe has continents and mountains; the plane can't fly through mountains") need the noise + displacement + biome coloring, not the secondary detail layers. The ocean-backbone river-carving system requires axis-perpendicular generators + connected-region flood-fill + an OceanRegionCacheEntry — adds significant complexity for a feature most players won't notice. Volcanoes are their own VFX system. Props are a separate massive subsystem.

### Decision

Ship the noise + presets + displacement + biome coloring. Defer:

- **Ocean backbone** — the smooth-channel river systems carved into landmasses. Visually noticeable on `pangaea` preset; less so on others. Future micro-batch.
- **Volcanoes** (5 per globe) — erupting visual effects with smoke columns + lava emitter. Pairs with weather/audio.
- **Props** — trees, rocks, coconut clusters, villages (8-16 houses each, 20 villages), balloons, windmills, moonstone ruins. ~10k tree instances and similar for the rest. Major subsystem; would need its own batch.
- **Race banners + campsite + gremlin hearts surface placement** — niche UI furniture.

### Consequences

- Globe shows recognizable land + ocean + mountains + biome colors (good).
- No rivers carved into continents on `default` / `archipelago` / `pangaea` presets.
- No trees, villages, or other ground props — landscapes look bare from low altitude. Acceptable for a flight game where the camera mostly sees globe-scale silhouette.
- No volcanoes erupting in the distance.
- Floating lanterns can land on bare hilltops with nothing beneath them — fine, they read as floating.
- Boost rings + gremlins still spawn at fixed altitude offsets above globe radius (not surface-aware) — they fly safely above mountains because the terrain max displacement is ~0.54 (LAND_HEIGHT 0.02 + MOUNTAIN_HEIGHT 0.52) and rings/gremlins live at altitude 0.55-1.35. No code change needed.

### Files Affected

- `tinyskies/imports/terrain.js` — port of TerrainSurface + SimplexNoise + TerrainPresets subset.
- `tinyskies/behaviors/tinyskiesGlobeVisual.yaml` — sphere geometry vertex deformation + biome coloring.
- `tinyskies/behaviors/tinyskiesFlightController.yaml` — terrain-aware hover floor (was hardcoded 0).
- `tinyskies/behaviors/tinyskiesFloatingLanterns.yaml` — terrain-aware cluster altitude + `landOnly` re-roll.
- (Future) `tinyskies/behaviors/tinyskiesVolcano.yaml`, `tinyskiesPropTerrain.yaml` — would land in a future polish batch.

---

## FDR-005: Capped single sweep — vehicles + persistence + quests + multiplayer

**Date:** 2026-05-05
**Status:** Accepted
**Impact:** Medium (final 4 Later-priority requirements all shipped, but each ~10-30% of source surface area)

### Context

After Batches A/B/C, the remaining `Later` requirements were REQ-022 (boat + carpet), REQ-023 (quests + NPCs), REQ-025 (multiplayer), REQ-026 (persistence). Combined source surface area ≈ 12-17k lines. User chose "Option 2 — capped single sweep" over a multi-session polish trail; this FDR records what's deliberately omitted from each.

### REQ-022 — Boat + Carpet (capped)

**Shipped**: procedural boat hull + procedural carpet rug; runtime cycle key (R) toggles between plane/boat/carpet; flightController applies per-vehicle altitude envelope (boat surface-locked at 0.05; carpet up to 1.0 max).

**Cut from source**:
- Cloth-wobble vertex shader on the carpet — TSL `positionNode` port is non-trivial; shipped static geometry instead.
- Sail / oars / waterline trim on the boat — simple hull only.
- `NpcBoats` (NPC-driven boats around the world) — single-player only.
- `CarpetPortalSystem` + `CosmicWorldPortal` — entire void/cosmic-scene system removed (~1500 lines).
- `CarpetTrail` / `CarpetWake` / `CarpetDriftSmoke` / `CarpetLeaves` — carpet motion VFX.
- Vehicle-specific lobby + `vehicleCapabilities` lookup — runtime cycler only.

### REQ-023 — Quests + NPCs (capped)

**Shipped**: 1 of 6 quest systems — Package Delivery. Pickup column → fly through → delivery column → fly through → loop. Both columns are runtime-spawned land-only land markers (terrain-aware via `T.sampleTerrain`).

**Cut from source**:
- 5 of 6 quest systems: `RaceManager`, `CarpetLandmarkSelfieQuest`, `EternalFlameWorld`, `HotspringPhotoUI`, `CapybaraFlameShots`.
- All 14 NPC portraits (auntie_rue, clockmaster_gale, stargazer_orion, postmaster_quill, nana_clover, doctor_celeste, shepherd_fable, beekeeper_thyme, fisherman_cork, professor_astrid, warden_flint, capatain_moss, baker_finch, cobbler_pip).
- NPC dialog system + dialog UI + branching conversations.
- `LevelUpCards` + `UpgradeManager` (XP gates, perk picks).
- `PilotAvatar` (player customization).
- `CampsiteMarker` + `CampsiteScene` + `CampsiteControls` (tutorial / hub area).

### REQ-025 — Multiplayer (capped)

**Shipped**: `game.multiplayerState` skeleton — broadcasts our spherical pose at 10 Hz, renders phantom blue biplanes for remote players. Stemscript opts in via `game settings isMultiplayer=true`; behavior idles when single-player.

**Cut from source**:
- Paintball relay (remote player paintballs are not visible).
- Remote-player paintball hits on local player (no PvP combat).
- Hot-potato flag mode + `FlagSystem` (free-flag pickup, capture mechanic, immunity windows).
- Remote-player name labels (`RemotePlayerNameLabels`).
- Carry-flag / carry-package visual sync.
- Custom hull color sync per player.
- Slerp interpolation between received states (current ship snaps).
- Server-authoritative paintball hit-test (the source server runs `paintball/hitTest`); MVP would defer to host-authority via `mp.isHost()` if/when paintball relay lands.
- `stemstudio-multiplayer/` submodule changes — engine's default Colyseus room is used as-is.

### REQ-026 — Persistence (capped)

**Shipped**: localStorage-backed lifetime stats (rings collected, gremlin hits, sessions played). Persists across reload, published to `tinyskies/lifetime*` store keys.

**Cut from source**:
- Game Services API integration (`stemstudio-growafarm/api/v1/gameProgress/*`) — would need separate submodule work.
- Cross-device sync (would also need Game Services).
- Leaderboard (top scores per server).
- World saves (player can save/share custom world configs).
- Lantern feed / save feed (asynchronous social features).
- Upgrades persistence (no upgrades shipped — see REQ-023 cut).
- Progression / XP / level (no XP shipped — see REQ-023 cut).

### Why capped instead of deferred

User explicitly chose Option 2 (capped sweep) over Option 1 (4 separate sessions). Each capped system gives a working stub the user can verify; the deferred details can be promoted later by editing the same behavior files instead of writing new ones from scratch.

### Files Affected

Across all four caps:
- `tinyskies/imports/vehicle-meshes.js` — boat + carpet mesh helpers.
- `tinyskies/behaviors/tinyskiesBoatVisual.yaml`, `tinyskiesCarpetVisual.yaml`, `tinyskiesVehicleSwitcher.yaml` — vehicles.
- `tinyskies/behaviors/tinyskiesProgression.yaml` — persistence.
- `tinyskies/behaviors/tinyskiesPackageQuest.yaml` — single quest.
- `tinyskies/behaviors/tinyskiesRemotePlayers.yaml` — MP state-sync.
- `tinyskies/behaviors/tinyskiesFlightController.yaml` — per-vehicle altitude envelope.
- `tinyskies/behaviors/tinyskiesBiplaneVisual.yaml` — vehicle-aware visibility toggle.
- `tinyskies/tinyskies.stemscript` — `isMultiplayer=true`, all new imports + scene-graph blocks.

---

## FDR-006: Globe decoration port — closes the "bare deformed sphere" gap

**Date:** 2026-05-07.
**Reason:** Source `Globe.ts` is 5,803 lines with 18 procedural decoration systems. The MVP shipped only `createSurface` + `createAtmosphere` (281 LOC); the remaining 16 systems (~5,000 source LOC) were deferred per FDR-001 / FDR-004 footnotes. User flagged the visual gap against the source `screenshots/screenshot.png` after a runtime test. This batch ports all 16 missing systems plus retrofits the deferred particle effects.

### Behaviors added (5 phased commits + 2 follow-ups)

- `tinyskies/behaviors/tinyskiesGlobeVegetation.yaml` — Trees, CoconutTrees, Rocks, Mushrooms (~950 source LOC). REQ-028.
- `tinyskies/behaviors/tinyskiesGlobeStructures.yaml` — Villages + house geo, Lighthouses, Windmills (~1,070 source LOC). REQ-029.
- `tinyskies/behaviors/tinyskiesGlobeLandmarks.yaml` — Observatories, Stonehenges, Shrines, Pyramid (~1,395 source LOC). REQ-030.
- `tinyskies/behaviors/tinyskiesGlobeBiomeDecor.yaml` — Hotsprings, ButterflyGardens (~489 source LOC). REQ-031.
- `tinyskies/behaviors/tinyskiesGlobeAtmospheric.yaml` — Clouds, Balloons, FloatingTreeClusters, RaceBanners (~735 source LOC). REQ-032.
- `tinyskies/behaviors/tinyskiesGlobeMonuments.yaml` — Statue, MoonstoneRuins (~717 source LOC). REQ-033.

### Helpers added to `tinyskies/imports/terrain.js`

- `getPropTerrainSink()` — returns 0.018 (matches source `PROP_TERRAIN_SINK` from `TerrainSurface.ts:27`).
- `terrainRingElevationRoughness(seed, type, nx, ny, nz, ringDist)` — std-dev of normalized land elevation in a ring. Returns 999 if any sample is water. Used by mushroom / butterfly-garden / shrine / hotspring / pyramid / statue / moonstone-ruin placement.
- `waterRatioAround(seed, type, nx, ny, nz, sampleDist, checks)` — fraction of ring samples in water. Used by coconut-tree / mushroom / lighthouse / windmill / hotspring placement.

### Material strategy (consistent across all 6 behaviors)

- `MeshStandardNodeMaterial` + TSL fresnel emissive (`applyRimLight` helper inline in each behavior) replacing the source `MeshPhongMaterial` + GLSL `addRimLight` `onBeforeCompile` patch. Visual equivalent on WebGPU.
- `MeshBasicNodeMaterial` for unlit emissive surfaces (lighthouse beam, hotspring water, statue beacon, moonstone arches).
- TSL `uv()` flag pattern for window-glow night emission in villages (replaces source's `vIsWindow > 0.5` GLSL injection).

### Substituted (not byte-faithful) — source loads GLBs we don't have

- **Pyramid** (REQ-030) — source loads `/3D/pyramid.glb`. Substituted with a 5-tier procedural ziggurat (sandstone + cornice trim + capstone). Placement rules byte-identical (seed 939191, MIN_SEPARATION_DOT 0.80).
- **Hotspring** (REQ-031) — source loads `/3D/hotspring.glb`. Substituted with a stone-rim circular pool + warm-blue water emissive + 4 accent stones.
- **Statue** (REQ-033) — source loads `/3D/statue.glb`, gated by post-victory `ProgressionManager.moonFrozenByEternalFlames` flag. Substituted with a procedural figure (pedestal + tapered cylinder body + outstretched arms + halo + TSL beacon beam, color 0x88ccff matching source `PackageQuestBeam`). Ships unconditionally (we don't model the victory state).
- **MoonstoneRuins** (REQ-033) — source loads `/3D/moonstone_left.glb` + `/3D/moonstone_right.glb`. Substituted with mirrored procedural crystal-arch halves (5 faceted blocks following a quarter-circle arc + octahedron apex + buried base). Idle-phase hover only — the source's cinematic union state machine (raising / floating / postUnionActive) is gameplay-driven and our port has no `MoonstoneCinematic` controller.

### Particle retrofit (REQ-034)

After completing the geometry port, the user authorized adding `three.quarks` to the behavior compartment endowments (engine commit `feat(behaviors): expose three.quarks classes to behavior compartment` on `feat/live-play`). All 6 deferred ShaderMaterial particle systems were retrofitted to real `ParticleEmitter` / `ParticleSystem` instances registered with the engine's shared `BatchedRenderer`:

- mushroom spores (per-grove, pastel cycle, `SphereEmitter` r=0.045)
- shrine sparkles (per-shrine, warm gold, `SphereEmitter` r=0.06)
- hotspring steam (per-pool, white-gray, `SphereEmitter` r=0.07)
- butterfly swarms (per-garden, orange/blue, `SphereEmitter` r=0.07)
- lighthouse glow (per-lantern, warm-orange halo, scaled to lanternR)
- moonstone dust (per-ruin, pale moonlight blue, `SphereEmitter` r=0.18)

Each emitter is registered in `init()` after `_buildVisuals` populates `this._particleEmitters`, and deregistered + disposed in `_teardownVisuals` (BEFORE `system.dispose()` to avoid WebGPU buffer-disposal-during-tick errors).

Canonical pattern: `docs/examples/canonical/engine_particle_system_example.js`.

### Cut (no path without parent-repo work)

- Per-instance wind sway shader on trees / coconut trees / village garden trees (Globe.ts:741-760, 954-973, 1610-1628). Visual smoothing only; gameplay-neutral. Defer to a TSL `positionNode` retrofit.
- Source's MOON_APPROACH_DIR impact-bias on FloatingTreeClusters — simplified to uniform sphere distribution since our port doesn't model the moon-collision arc.
- Race banner fabric sway shader (Globe.ts:4973-5005) — visual only; the canvas texture renders correctly without it.

### Validators added

- `tools/lib/type-env.js` `INJECTED_GLOBALS` extended with `Quarks`, `ParticleEmitter`, `ParticleSystem`, `BatchedRenderer`, `QuarksUtil`, `SphereEmitter`, `ConeEmitter`, `DonutEmitter`.
- `tools/check-generated-syntax.js` `ALLOWED_GLOBAL_IDENTIFIERS` extended with the same identifiers so behaviors using the new endowments don't trip the no-undef gate.

### What this closes

- The 18-system geometry gap on the globe surface is closed. Source-faithful 16/18; procedural-substitute 4/4 (Pyramid / Hotspring / Statue / MoonstoneRuins — geometry differs, placement byte-identical).
- The 6 ShaderMaterial particle systems are closed via three.quarks retrofit; previously deferred per FDR-001 / FDR-004 footnotes.
- Wind-sway shader on trees and race banner fabric sway remain deferred (visual smoothing only).
