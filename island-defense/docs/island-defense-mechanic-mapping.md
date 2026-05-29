# Mechanic Mapping — Island Defense

> Gate DDG-MECHANIC-MAP. Companion to `conversion-plan.md` (which has the high-level summary).

## Source Inventory

| Source System | Reference | Type | Priority |
|---|---|---|---|
| Game scene + state machine | reverse-engineered from minified bundle | Core | 1 |
| Round system (3 rounds, banners between) | demo README + Test Panel buttons | Core | 1 |
| Difficulty selector (Easy / Medium / Hard) | demo Test Panel | Core | 2 |
| Player blue unit spawning (+1, +3, +5) | demo Test Panel | Core | 1 |
| AI red unit spawning + path marching | reverse-engineered + tinyswords AIController | Core | 1 |
| Unit vs unit melee combat | reverse-engineered | Core | 2 |
| Unit vs castle damage | reverse-engineered | Core | 2 |
| Castle HP bars | demo HUD | Core | 2 |
| Victory / Defeat detection | castle HP = 0 | Core | 1 |
| Round transition banners | Test Panel preview buttons | Core | 3 |
| BGM (`bg_loop.mp3`) | demo Test Panel "BGM" preview | Polish | 4 |
| Impact SFX (`sword_impact_hit_*.mp3`) | Test Panel preview | Polish | 5 |
| Finish / Defeat SFX | Test Panel preview | Polish | 5 |
| Pixel-art sprite rendering (units, castles, terrain) | assets.json | Polish (Phase 2) | 5 |
| Sprite-sheet animations (idle/run/attack) | assets.json frame counts | Polish (Phase 2) | 5 |
| Camera pan + zoom (drag, pinch, wheel, +/-) | demo README "In-Game Camera" | Polish (Phase 2) | 6 |
| Particle dust on spawn | tinyswords `spawnDustEffect` | Polish (Phase 2) | 7 |
| Archer unit + arrow projectile | assets.json units.archer | Secondary (Phase 2) | 6 |
| Torch unit (5-attack sheet) | assets.json units.torch | Secondary (Phase 2) | 7 |
| Tilemap terrain (water + ground tiles) | assets.json terrain.tileset | Polish (Phase 2) | 6 |

## Built-in Coverage Assessment

| Source System | Built-in Candidate | Coverage | Decision |
|---|---|---|---|
| HUD / Test Panel / banners | `UIKit.Fullscreen` + `Container` + `Text` | 100% | Use UIKit |
| Click input | UIKit `onClick` | 100% | Use UIKit |
| Per-frame loop | Behavior `update(dt)` | 100% | Use behavior |
| Camera | Fixed `cameraType=NONE` | Phase 1: 100%; Phase 2: needs custom pan/zoom behavior | Phase 1 only |
| Audio playback | `game.audio` / scene audio system | TBD — wiring deferred to Phase 2 | Phase 1 imports only |
| Sprite rendering | Three.js `Sprite` + texture | requires custom code | Phase 2 |

## Custom Systems Needed

| Custom System | Type | Reason | Complexity |
|---|---|---|---|
| `id.game` (whole-game) | behavior | Single tightly-coupled game logic + UIKit rendering | Medium-high |
| (Phase 2) `id.spriteRenderer` | behavior | UV-cycle sprite-sheet animation on `THREE.Sprite` | Medium |
| (Phase 2) `id.cameraController` | behavior | Drag-pan + wheel/pinch zoom + key zoom | Medium |
| (Phase 2) `id.particleManager` | behavior | Pooled dust particles on unit spawn | Low |

## State Flow

All Phase 1 state in single behavior. No `erth.store`, no inter-behavior events.

```
this._difficulty       'easy' | 'medium' | 'hard'
this._round            0 (idle) | 1 | 2 | 3
this._battleActive     bool
this._blueCastleHP     number (max: castleHP attribute)
this._redCastleHP      number
this._units            Array<UnitObject>
  UnitObject = {
    team: 'blue' | 'red',
    type: 'warrior',     // Phase 1: warrior only
    x, y,                // pixel coords in screen space
    hp,
    attack,
    speed,
    target: castle | unit | null,
    lastAttackMs: number,
    container: UIKit.Container,
    hpBar: UIKit.Container
  }
this._aiSpawnTimer     ms
this._gameTime         ms
this._bannerText       string
this._bannerExpireMs   ms
this._gameResult       'victory' | 'defeat' | null
```

## Fidelity Risks

| Risk | Source | Stem Approximation | Impact | Mitigation |
|---|---|---|---|---|
| Pixel-art identity lost | Sprite-rendered Tiny Swords units | Colored UIKit rectangles | High (visual) | FDR-002 + Phase 2 plan |
| No idle/run/attack animations | Phaser sprite-sheet anim | Static colored containers | Medium (game-feel) | FDR-002 + Phase 2 plan |
| No camera pan/zoom | Drag/pinch/wheel/keys | Fixed camera (Phase 1) | Medium | FDR-001 + Phase 2 plan |
| No archer / torch units | 3 unit types in source | Warrior only (Phase 1) | Medium | FDR-003 + Phase 2 plan |
| No projectiles | Arrows fly, do AOE | (Not applicable — only melee in Phase 1) | Medium | FDR-003 + Phase 2 plan |
| No particle dust | Spawn dust + impact | UIKit text "→ +N" indicator only | Low | FDR-004 + Phase 2 plan |
| No tilemap terrain | Multi-tile water + grass | Two solid color bands | Medium | FDR-005 + Phase 2 plan |
| Audio imported but not playing | BGM auto-plays in source | Imported only — playback wiring Phase 2 | Medium | FDR-006 + Phase 2 plan |
| AI difficulty curve | Source uses Phaser.Math.Linear over time | Constant interval per difficulty (no time scaling) | Low-medium | Acceptable for MVP; Phase 2 can add scaling |

## Configuration Surface Plan

| Source Value | Exposed As | Default | Range |
|---|---|---|---|
| Initial castle HP | `castleHP` | 100 | 1–10000 |
| Warrior HP | `warriorHP` | 30 | 1–500 |
| Warrior attack damage | `warriorAttack` | 5 | 1–100 |
| Warrior speed (px/s) | `warriorSpeedPxPerSec` | 30 | 1–500 |
| AI Easy spawn interval (ms) | `aiSpawnEasyMs` | 4000 | 100–60000 |
| AI Medium spawn interval (ms) | `aiSpawnMediumMs` | 2500 | 100–60000 |
| AI Hard spawn interval (ms) | `aiSpawnHardMs` | 1500 | 100–60000 |
| AI Hard HP multiplier | `aiHardHpMul` | 1.5 | 1–10 |
| Total rounds | `totalRounds` | 3 | 1–20 |
