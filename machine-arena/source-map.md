# Machine Arena Source Map

## Entrypoints

| Source | Destination | Notes |
|---|---|---|
| `index.html` | `machine-arena.stemscript` | StemStudio import script replaces Vite page bootstrap. |
| `src/main.js` | `behaviors/maMachineArena.yaml` | Main loop, state, FPS input, waves, combat, UI, shop, audio, and boss flow collapsed into one custom behavior. |

## Runtime Systems

| Source file/system | StemStudio mapping | Fidelity notes |
|---|---|---|
| `src/arena.js` | `buildArena()` inside `ma.machineArena` | Preserves industrial floor plates, octagonal bounds, pillars/crates, elevated walkways, jump pads, lighting shifts, and hazards with simplified geometry. |
| `src/weapons.js` | `WEAPON_DEFS` inside behavior | Source weapon damage, fire-rate, magazine, reload, range, spread, pellet count, recoil, health, and movement speed are carried over. |
| `src/enemies.js` | `ENEMY_DEFS`, enemy mesh builders, `spawnWave()`, `updateEnemies()` | Enemy roster, wave health scaling, boss waves, sniper telegraph, mortar zones, medic healing, shielder frontal mitigation, and boss phases are preserved in simplified form. |
| `src/upgrades.js` | `UPGRADES`, upgrade selection overlay | Card pool and core upgrade effects are preserved. Cards are selected with keys `1-3` instead of DOM click cards. |
| `src/fragments.js` | `FRAGMENTS`, fragment runtime helpers | Preserves the main fragment identities and effects in lower-complexity form: aura, spear, rocket, slow, damage streak, shell, overclock, memento, glass cannon, blood link. |
| `src/metaProgression.js` | In-memory `meta` object and workshop UI | Universal/class/ability upgrade concept is preserved. Browser `localStorage` persistence is intentionally not relied on for the first StemStudio pass. |
| `src/workshop3d.js` | `phase === "workshop"` UIKit overlay | Functional upgrade purchasing and class choice preserved; separate 3D lab room and terminal renderer are deferred. |
| `src/effects.js` | `spawnTrail()`, `spawnParticle()`, weapon view model | Preserves muzzle flash, projectile trails, hit particles, enemy death sparks, and simple first-person weapon meshes. |
| `public/*.mp3` | `audio/*.mp3` imports | Source music is bundled and resolved by behavior audio attributes. |
| `others/1.png` | `textures/source-screens/about-this-game.png` | Bundled as a reference/provenance screenshot, not used in gameplay. |

## Player Identification

The source player is the FPS camera/controller state in `src/main.js`. In StemStudio this maps to the invisible `Player` capsule with `tag=Player`, while the custom behavior drives `DefaultCamera` as the first-person view and mirrors the player position onto `Player`.

## Configuration Mapping

| Source value | Stem attribute | Default |
|---|---|---|
| `state.arenaSize` | `arenaSize` | `40` |
| `PLAYER_EYE_Y` | `playerEyeHeight` | `1.6` |
| `GRAVITY` | `gravity` | `22` |
| `JUMP_FORCE` | `jumpForce` | `9` |
| camera base FOV | `baseFov` | `75` |
| 15-wave mission | `totalWaves` | `15` |
| `3 + wave * 2` | `waveBaseCount`, `waveCountStep` | `3`, `2` |
| runtime audio sliders | `musicVolume`, `sfxVolume` | `0.35`, `0.45` |

## Asset Map

| Source asset | Destination asset | Status |
|---|---|---|
| `public/music1_alt.mp3` | `audio/music1_alt.mp3` | Copied. |
| `public/music1.mp3` | `audio/music1.mp3` | Copied. |
| `public/music2.mp3` | `audio/music2.mp3` | Copied. |
| `public/tyger.mp3` | `audio/tyger.mp3` | Copied. |
| `others/1.png` | `textures/source-screens/about-this-game.png` | Copied. |
| Generated cover art | `cover.png` | Generated and imported as `ProjectCover`. |

