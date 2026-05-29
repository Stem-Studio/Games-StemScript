# Island Defense — Gameplay Design

> Phase-1 MVP design. Phase-2 visual fidelity (sprites, animations, audio playback, camera) is in `island-defense-todo.md`.

## Core Fantasy

You're commanding the Blue army defending an island fortress. The red AI keeps sending waves; you summon reinforcements (via the Test Panel — a stand-in for the KiasuDash quiz hook) faster than the enemy can advance.

## Game Loop

### Primary Loop (5–30 s cycle)

| Step | Player Action | System Response | Reward |
|------|--------------|-----------------|--------|
| 1 | Pick difficulty (Easy/Medium/Hard) before Start | Difficulty buttons highlight; AI interval/HP scaled when battle begins | Strategic agency |
| 2 | Click **Start Battle** | Round 1 banner appears for 1.8 s; AI begins spawning red warriors at the difficulty-set interval | Tension begins |
| 3 | Click **+1 / +3 / +5 Blue** | N blue warriors spawn at base of blue castle and march right | Visible reinforcement |
| 4 | Wait — Blue + Red warriors collide mid-lane and trade attacks every 700 ms | HP bars deplete; dead units vanish | Battle dynamics |
| 5 | Survivors reach enemy castle → attack → castle HP drops | HP bar above castle shrinks | Progress toward win |
| 6 | First castle to 0 HP triggers **VICTORY** (red dies first) or **DEFEAT** banner | Banner persists; battle stops | Conclusion |

### Secondary Loop (single session)

- **Difficulty escalation:** Easy → Medium → Hard re-runs. Hard scales red warrior HP × 1.5 and tightens AI spawn to 1.5 s, shifting the balance toward attrition.
- **Reset Battle** button restores HP and clears the field for another run.

### Session Arc

- 0–10 s: choose difficulty, hit Start Battle.
- 10–30 s: trickle in blue warriors, watch first skirmishes.
- 30–120 s: sustained mid-lane war; HP bars on castles start dropping once units break through.
- 120–300 s: Victory or Defeat banner.

## Mechanic Rationale

| Mechanic | Why It Exists | If Removed | Risk If Poorly Tuned |
|---|---|---|---|
| Test Panel spawn buttons | Player agency; replaces the KiasuDash quiz hook in demo mode | Pure idle/auto-battler — no player input | +5 too cheap → player floods red with no thought |
| AI interval scales with difficulty | Difficulty selector matters | Single-difficulty game | Hard interval too short → AI floods, can't react |
| Hard HP multiplier | Hard adds defensive depth, not just rate | Hard would just feel "fast Easy" | Multiplier too high → individual reds become bullet sponges |
| Per-unit HP bars | See combat outcome at a glance | Battles look uniform | None |
| Castle HP visible at top HUD | Quick at-a-glance status | Have to look at the castle itself | Bar position too high → off-screen on phone |
| Round banner | Pacing punctuation; matches Test Panel preview | Confusing transitions | Banner too long → game stalls |
| Persistent end banners | Player needs to see win/lose clearly | Game just stops silently | None |

## State Machine

```
[Idle (Start Screen)] --(Start Battle)--> [Battle Round N]
[Battle Round N]      --(red HP = 0)-->   [Victory]
[Battle Round N]      --(blue HP = 0)-->  [Defeat]
[Victory | Defeat]    --(Reset Battle)--> [Idle]
[Idle]                --(Difficulty btn)--> [Idle (with new difficulty)]
[any]                 --(Banner R1/R2/R3 / Victory / Defeat preview)--> [shows transient banner]
```

## Difficulty Curve

| Difficulty | AI Spawn Interval | Red Warrior HP | Effective AI DPS |
|---|---|---|---|
| Easy   | 4000 ms | 30  | low — player keeps up easily |
| Medium | 2500 ms | 30  | balanced — battle ebbs and flows |
| Hard   | 1500 ms | 45 (×1.5) | aggressive — player must spam +5 to survive |

## Tuning Parameters (behavior attributes)

| Parameter | Default | Min | Max | Affects |
|---|---|---|---|---|
| `castleHP` | 100 | 1 | 10000 | Game length |
| `warriorHP` | 30 | 1 | 500 | Per-unit survivability |
| `warriorAttack` | 5 | 1 | 100 | Damage per hit |
| `warriorSpeedPxPerSec` | 30 | 1 | 500 | Time-to-engage |
| `aiSpawnEasyMs` | 4000 | 100 | 60000 | Easy difficulty |
| `aiSpawnMediumMs` | 2500 | 100 | 60000 | Medium difficulty |
| `aiSpawnHardMs` | 1500 | 100 | 60000 | Hard difficulty |
| `aiHardHpMul` | 1.5 | 1 | 10 | Hard HP scaling |
| `totalRounds` | 3 | 1 | 20 | Phase-1 only uses round 1 to win/lose; multi-round is Phase 7 |

## Reward Loops

| Trigger | Reward | Magnitude | Feedback |
|---|---|---|---|
| Spawn blue warriors | Visible reinforcements | +N units appear | Units spawn at castle base |
| Damage red unit | HP bar shrinks | Visual | Unit's HP fill turns yellow → red |
| Kill red unit | Threat eliminated | Unit vanishes | (Phase 2: death anim + dust) |
| Damage red castle | Progress toward victory | HP bar shrinks | Castle HP label updates |
| Victory | End of run | Persistent banner | Big green "VICTORY!" overlay |

## Juice Checklist

- [ ] Pixel-art sprites (Phase 2 — FDR-002)
- [ ] Idle/run/attack animations (Phase 2 — FDR-002)
- [ ] BGM playing during battle (Phase 2 — FDR-006)
- [ ] Impact SFX on melee hit (Phase 2 — FDR-006)
- [ ] Spawn dust + impact burst (Phase 2 — FDR-004)
- [x] HP bars on units + castles
- [x] Round transition banner
- [x] Victory / Defeat overlays
- [x] Color-coded teams (blue vs red)

## Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Phase 1 visual blandness undersells the game | High | FDR-002 documents the deferral; user knows the trade-off in advance |
| Difficulty calibration off (no source numbers) | Medium | All values exposed as behavior attributes; tunable post-ship |
| Test Panel obscures battlefield on narrow viewports | Medium | Documented; Phase 2 mobile-friendly variant |
| AI never spawns torch / archer | Medium | FDR-003; Phase-2 plan |

## Open Questions

- Should Easy / Medium / Hard also adjust _player_ unit HP (not just AI)? Currently no — only AI scales. Defer to user.
- Should Round 2 / Round 3 actually do anything in Phase 1? Currently `_round` increments but win/lose triggers on first castle-fall regardless. Phase 7 plan turns this into a real multi-round system.
