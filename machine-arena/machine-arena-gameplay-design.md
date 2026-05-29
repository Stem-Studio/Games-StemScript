# Machine Arena Gameplay Design

## Core Fantasy

The player feels like a countermeasure dropped into a hostile machine arena, barely surviving waves long enough to turn a basic weapon into a runaway roguelite build.

## Game Loop

### Primary Loop

| Step | Player Action | System Response | Reward |
|------|---------------|-----------------|--------|
| 1 | Pick class and deploy | FPS arena starts, enemies spawn at arena edges | Immediate combat start |
| 2 | Move, aim, shoot, reload, use tactical tools | Enemies pursue, attack, telegraph, and drop gears on death | Score, gears, survival room |
| 3 | Clear the wave | Upgrade-card overlay appears | One run upgrade, ammo refresh, next wave |

### Secondary Loop

Run gears feed the workshop. Workshop upgrades unlock stronger starts, class choice, and fragment selection for later runs.

### Session Arc

The session starts in a menu/workshop state, escalates through 15 waves with boss spikes every fifth wave, and ends in victory or system failure with banked gears.

## Mechanic Rationale

| Mechanic | Why It Exists | What It Replaces If Removed | Risk If Poorly Tuned |
|----------|---------------|-----------------------------|----------------------|
| FPS movement and mouse look | Core boomer-shooter feel | Static turret combat | If broken, the game is unplayable |
| Weapon classes | Distinct starts and speed/health tradeoffs | One flat weapon | Classes can feel cosmetic |
| Upgrade cards | Roguelite power curve | Linear wave survival | Weak cards make waves repetitive |
| Tactical abilities | Emergency movement/defense choices | Pure DPS race | Cooldowns can trivialize or vanish |
| Boss waves | Session peaks and source identity | Flat horde mode | Bosses can feel unfair or irrelevant |
| Workshop | Between-run progression | One-session arcade loop | Persistence gaps reduce long-term motivation |

## State Machine

```text
[menu] --Enter--> [playing]
[menu] --Tab--> [workshop]
[workshop] --Enter--> [playing]
[playing] --wave clear--> [upgrade]
[upgrade] --1/2/3--> [playing]
[playing] --Tab--> [shop]
[shop] --Tab/Esc--> [playing]
[playing] --Esc--> [paused]
[paused] --Esc/Enter--> [playing]
[playing] --health <= 0--> [gameover]
[playing] --wave 15 clear--> [victory]
[gameover|victory] --Enter--> [menu]
```

## Difficulty Curve

| Phase | Duration | Challenge Level | New Elements Introduced |
|-------|----------|-----------------|------------------------|
| Early | Waves 1-4 | Low-Medium | Swarms, drones, walkers, upgrade ramp |
| Boss 1 | Wave 5 | Medium | Carmackion and jump pads |
| Mid | Waves 6-9 | Medium-High | Tanks, snipers, mortars, shielders |
| Boss 2 | Wave 10 | High | Darioltman and stronger specials |
| Late | Waves 11-14 | High | Spectres, fragments, dense mixed waves |
| Finale | Wave 15 | Very High | Nanoman |

## Tuning Parameters

| Parameter | Default | Min | Max | Affects | Tuning Note |
|-----------|---------|-----|-----|---------|-------------|
| `totalWaves` | 15 | 1 | 30 | Session length | Source-faithful default |
| `arenaSize` | 40 | 18 | 80 | Room scale and spawn distance | Larger arenas slow pressure |
| `baseFov` | 75 | 55 | 110 | Camera feel | FPS comfort |
| `mouseSensitivity` | 0.002 | 0.0005 | 0.01 | Aim feel | Critical to player feel |
| `gravity` | 22 | 5 | 60 | Jump arc | Source value |
| `jumpForce` | 9 | 3 | 25 | Jump height | Source value |
| `waveBaseCount` | 3 | 1 | 20 | Enemy count | Source curve base |
| `waveCountStep` | 2 | 0 | 8 | Enemy count growth | Source curve step |

## Reward Loops

| Trigger | Reward Type | Magnitude | Feedback |
|---------|-------------|-----------|----------|
| Enemy kill | Score and gears | Enemy-dependent | Particles, HUD update |
| Wave clear | Upgrade card | One choice | Upgrade overlay |
| Boss kill | Score/gears and progression | Large | Message, particles |
| Run end | Banked gears | Run total | Game over/victory overlay |

## Current Bug Fixes / Improvements

| Date | Issue | Design Impact |
|------|-------|---------------|
| 2026-04-29 | Player reports no movement after load | Movement/input is a blocking core-loop failure; startup and play-state input must work without relying on unsupported custom bindings. Click-to-start and default-action fallbacks are required. |

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| InputManager custom action registration may not activate for generated behavior inputs | Start/menu/movement can appear dead | Use default InputManager actions where possible and keep start/play controls reachable |
| Monolithic behavior is large | Harder future iteration | Keep docs current; split later after runtime works |
| Boss choreography is approximate | Source-fidelity gap | Track as later polish |

## Open Questions

- After movement is restored, the player-feel gate still needs manual feedback on speed, mouse sensitivity, and jump arc.
