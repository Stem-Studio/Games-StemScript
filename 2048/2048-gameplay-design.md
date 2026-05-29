# 2048 Gameplay Design

## Core Fantasy

The player calmly compresses a number board, planning slide direction and merge order to build a 2048 tile before the grid fills.

## Requirements Covered

| Requirement ID | Gameplay Design Coverage | Status After This Doc |
|----------------|--------------------------|-----------------------|
| REQ-001 | Defines slide, merge, spawn, win, and loss loop. | Implemented |
| REQ-002 | Defines board/HUD/overlay presentation. | Implemented |
| REQ-003 | Defines keyboard and swipe input expectations. | Implemented |

## Game Loop

### Primary Loop

| Step | Player Action | System Response | Reward |
|------|--------------|-----------------|--------|
| 1 | Choose a direction. | All tiles slide and matching pairs merge once. | Higher tile values and score increase. |
| 2 | System spawns a new tile after a valid move. | A 2 or 4 appears in an empty cell. | New planning constraint. |
| 3 | Continue until 2048 or no moves. | Win overlay or game-over overlay appears. | Keep going or restart. |

### Secondary Loop

The best score gives short-session persistence inside the current runtime; the incoming DOT-7609 branch explores backend persistence for cross-session score continuity.

### Session Arc

A session starts with two random tiles, escalates as empty cells disappear and merge values rise, and ends at win or no-move loss with immediate restart available.

## Mechanic Rationale

| Mechanic | Why It Exists | What It Replaces If Removed | Risk If Poorly Tuned |
|----------|--------------|----------------------------|---------------------|
| Directional slide | Core puzzle decision. | Game loses all agency. | Multiple moves per keypress feel unfair. |
| One merge per tile per move | Preserves original 2048 strategy. | Cascading merges change source rules. | Players cannot predict results. |
| Random 2/4 spawn | Adds uncertainty and pressure. | Board becomes deterministic and solved. | Too many 4s raises difficulty sharply. |
| Win/keep-going overlay | Marks success without forcing stop. | Win state is invisible or abrupt. | Overlay can block continued play if keep-going fails. |

## State Machine

```text
Boot -> Playing
Playing -- valid move creates 2048 --> Won
Won -- keep going --> Playing
Playing -- no moves available --> GameOver
Playing/Won/GameOver -- restart --> Playing
```

## Difficulty Curve

| Phase | Duration | Challenge Level | New Elements Introduced |
|-------|----------|----------------|-------------------------|
| Opening | 0-30s | Low | Sparse board, many safe moves. |
| Middle | 30s-5m | Medium | Merge planning and corner strategy matter. |
| Endgame | 5m+ | High | Board congestion and high-value tile positioning. |

## Tuning Parameters

| Parameter | Default | Min | Max | Affects | Tuning Note |
|-----------|---------|-----|-----|---------|-------------|
| gridSize | 4 | 3 | 8 | Board complexity and cell size. | 4 preserves source game. |
| winTile | 2048 | 2 | none | Win condition. | Powers of two are expected. |
| spawnChance4 | 0.1 | 0 | 1 | Difficulty and score pace. | Source-faithful default is 10 percent. |

## Reward Loops

| Trigger | Reward Type | Magnitude | Feedback |
|---------|-------------|-----------|----------|
| Merge | Score increase | Value of merged tile | Score text updates. |
| Reach win tile | Achievement | Session milestone | Win overlay and keep-going button. |
| Restart | Fresh attempt | Full reset | New two-tile board. |

## Juice Checklist

- [ ] Tile slide animation
- [ ] Merge pop animation
- [x] Visual feedback for score and overlays
- [x] Restart flow
- [ ] Persistent best score validation

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| UIKit overlay or pointer events fail to attach. | New Game, Try Again, and Keep Going become unusable. | Validators should enforce `Fullscreen(game.renderer, props)`, uiCamera parenting, pointer registration, and constructor-time handlers. |
| Persistent best score uses unsupported event or global APIs. | Game works only after manual repair or leaks listeners. | Knowledge and validators should require `this.erth.events.on` or documented Game Services wrappers. |

## Open Questions

- Whether cross-session best score should be added to the current 2048 behavior or kept as future guidance only.
