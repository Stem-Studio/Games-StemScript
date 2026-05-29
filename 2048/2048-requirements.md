# 2048 Requirements

## Requirements

| ID | Status | Type | Priority | Requirement | Source / Rationale | Acceptance Criteria | Design Links | Completion Evidence |
|----|--------|------|----------|-------------|--------------------|---------------------|--------------|---------------------|
| REQ-001 | Implemented | Gameplay | MVP | Preserve classic 2048 slide/merge rules on a configurable square grid. | Original 2048 behavior and `2048/conversion-notes.md`. | Tiles slide in the requested direction, equal adjacent tiles merge once per move, two start tiles spawn, and game over occurs only when no moves remain. | `2048-gameplay-design.md` | `2048/behaviors/game2048.yaml` |
| REQ-002 | Implemented | UI | MVP | Render the full board, score, best score, instructions, restart, win, and game-over flow with UIKit. | Source UI mapping in `2048/conversion-notes.md`. | Play mode shows a centered 4x4 board, score boxes, New Game button, and overlays for win/loss. | `2048-gameplay-design.md`, `2048-low-level-design.md` | `2048/behaviors/game2048.yaml` |
| REQ-003 | Implemented | Input | MVP | Support keyboard and mobile swipe input for all directional moves plus restart. | Source input mapping in `2048/conversion-notes.md`. | Arrow/WASD/Vim keys move once per edge; R restarts; mobile swipe maps to one move per gesture latch. | `2048-gameplay-design.md`, `2048-low-level-design.md` | `2048/behaviors/game2048.yaml` |
| REQ-004 | Designed | Technical | MVP | Update importer knowledge sources and validators so DOT-7609 manual fixes become repeatable generation rules where they match supported APIs. | User ask: incoming DOT-7609 branch includes manual runtime fixes. | Docs explain the supported equivalent patterns; validators reject or warn on unsupported variants that caused manual repair. | `2048-low-level-design.md`, `../docs/planning/2026-05-09-dot-7609-2048-validator-knowledge.md` | Pending validator/doc changes |

## Source-Fidelity Requirements

| Area | Source Evidence | Destination Obligation | Allowed Deviation |
|------|-----------------|------------------------|-------------------|
| Gameplay rules | `2048/conversion-notes.md` preserved gameplay systems | Preserve move traversal order, spawn odds, win detection, keep-playing, and no-move loss detection. | Tile animation and cross-session persistence are optional deviations already documented in conversion notes. |
| UI flow | `2048/conversion-notes.md` UI Flow Mapping | Preserve score/best display, New Game, win overlay, game-over overlay, and instructions. | Exact CSS animation timing may be omitted. |

## Traceability Rules

- `Proposed`: captured from the user, source code, or engine constraint.
- `Designed`: referenced from a design artifact such as gameplay design, low-level design, mechanic mapping, or design doc.
- `Implemented`: linked to concrete generated artifacts such as `.stemscript`, behavior YAML, lambda YAML, import script, asset, or data file.
- `Validated`: linked to validator output, editor import check, runtime smoke test, source-fidelity review, or user gate.
- `Deferred`: includes a reason and impact in completion evidence.

## Completion Summary

| Status | Count | Notes |
|--------|-------|-------|
| Proposed | 0 | |
| Designed | 1 | DOT-7609 knowledge/validator update in progress. |
| Implemented | 3 | Existing playable 2048 behavior. |
| Validated | 0 | This pass has not yet run final validators. |
| Deferred | 0 | |

## Open Questions

- Whether the incoming persistent best-score behavior should be implemented in `2048` after the knowledge/validator pass, or only documented as generation guidance.
