# Drop7 — Design Doc

## Project

- **Title:** Drop7
- **Genre:** Puzzle
- **Mode:** 2D presented through UIKit
- **Players:** Solo
- **Target Complexity:** Simple

## Concept Summary

Create a classic-style Drop7 puzzle game where the player drops numbered or solid discs into a 7x7 grid, clears numbered discs when their value matches the contiguous run length in a row or column, and survives as periodic solid rows rise from the bottom.

## Genre

Primary genre is single-screen puzzle. The game emphasizes board readability, chain planning, and score survival rather than movement, physics, or exploration.

## Core Game Loop

1. Read the current disc and board state.
2. Choose a column and drop the disc.
3. Resolve clears, chain reactions, and solid-disc cracking/reveals.
4. Survive row rises, improve the score, and continue until no legal space remains.

## Player

- **Object:** No world-space avatar; the player interacts through UIKit column selection.
- **Tag strategy:** No `Player` object is needed because this is a single-screen UI puzzle rather than a locomotion game.
- **Abilities:** Move column focus, place current disc, restart round.

## Camera

- **Type:** Fixed top-down camera used only to satisfy scene setup.
- **Built-in or Custom:** Static `cameraType=NONE`; gameplay is rendered through a `UIKit.Fullscreen` HUD.
- **Key Settings:** `near=0.1` for UIKit safety, overhead pose, no follow behavior.

## Systems Inventory

| System | Built-in / Custom | Description |
|--------|-------------------|-------------|
| Board rules | Custom | 7x7 grid, contiguous-run clear checks, gravity, chain resolution |
| Solid disc cracking | Custom | Hidden discs crack on first adjacent explosion and reveal a random number on the second |
| Row rise cadence | Custom | Adds a solid row from the bottom after a configurable number of turns |
| Input | Custom + engine input manager | Arrow keys move selection, Space/Enter drops, click/tap selects columns |
| UI / HUD | Custom UIKit | Title, score, best, level, rise counter, current-disc preview, board, overlays |

## Systems Needed

- Board state container
- Match detection for contiguous row/column runs
- Chain reaction resolver
- Row-rise progression
- Score tracking and best-score retention within the current session
- UIKit board renderer and game-over overlay

## Asset Requirements

| Category | Assets Needed | Sourcing Plan |
|----------|--------------|---------------|
| Models | None | Not needed; UI-only presentation |
| Textures | None | Flat UIKit colors only |
| Audio | None in first pass | Optional later polish |

## Built-in Reuse Plan

- Reuse the engine input manager through behavior `inputs`.
- Reuse UIKit and `UIKitPointerEvents` for the full HUD.
- Do not use built-in puzzle behaviors because Drop7 rule evaluation, cracking, and row-rise cadence are bespoke.

## Custom Systems Needed

- `drop7.game` custom behavior to own all gameplay state and rendering.
- No custom lambdas are needed in the first pass.

## Configuration Surface

| Parameter | Behavior | Type | Default | Purpose |
|-----------|----------|------|---------|---------|
| `roundLength` | `drop7.game` | number | 5 | Turns before a solid row rises |
| `solidDiscChance` | `drop7.game` | number | 0.18 | Chance that the current disc is solid instead of numbered |
| `clearBaseScore` | `drop7.game` | number | 7 | Base points per cleared disc before combo multiplier |
| `clearBoardBonus` | `drop7.game` | number | 70000 | Bonus for clearing the entire board |

## UI / HUD Plan

- Fullscreen UIKit root parented to `game.uiCamera`
- Header row with title, score, best, and progression stats
- Current-disc preview and control hint row
- Clickable column buttons plus clickable board cells
- Full 7x7 board rendered as circular discs inside a framed grid
- Game-over overlay with restart action

## Naming Plan

- Scene anchor object: `GameBoard`
- Behavior id: `drop7.game`
- Runtime-only UI root remains behavior-owned and is not mirrored into scene objects

## Open Questions

- Exact original Drop7 scoring and mode cadence are not fully documented in repo sources, so the first pass uses a configurable classic-style approximation.
- Future follow-up could add Blitz/Sequence variants once the user confirms the fidelity target.

## Risk Areas

- Contiguous-run logic must treat hidden and cracked discs as occupied for counting, while only numbered discs can clear.
- UIKit board interaction must stay readable on smaller screens without relying on DOM overlays.
