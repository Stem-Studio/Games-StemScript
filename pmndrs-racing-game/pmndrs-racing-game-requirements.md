# PMNDRS Racing Game Requirements

## Requirements

| ID | Status | Type | Priority | Requirement | Source / Rationale | Acceptance Criteria | Design Links | Completion Evidence |
|---|---|---|---|---|---|---|---|---|
| REQ-001 | Validated | Gameplay | MVP | Preserve arcade vehicle driving with acceleration, braking, boost, steering, collision response, and reset behavior. | `src/store.ts`, `src/models/vehicle/Vehicle.tsx`, `src/models/BoundingBox.tsx` | Player can drive, boost, brake, collide, and reset through the authored track. | `source-map.md` Mechanics Map | `behaviors/prgRaceGame.yaml`; `node tools/check-generated-syntax.js --level=warn pmndrs-racing-game` |
| REQ-002 | Validated | Gameplay | MVP | Preserve start, checkpoint, and finish gate race timing. | `src/models/Goal.ts` | Timer arms at the start gate, records checkpoint split, and records finish time. | `source-map.md` Mechanics Map | `pmndrs-racing-game.stemscript`; `behaviors/prgRaceGame.yaml` |
| REQ-003 | Validated | UI | MVP | Replace React UI with UIKit intro, HUD, help, finish, notices, and leaderboard panel. | `src/ui/*.tsx` | UI renders through UIKit and passes UIKit validation. | `source-map.md` Mechanics Map | `node tools/check-uikit-patterns.js pmndrs-racing-game` |
| REQ-004 | Validated | Asset | MVP | Import source vehicle, wheel, track, and audio assets with direct provenance. | `public/models/*`, `public/sounds/*` | Stemscript imports all mapped GLB and audio assets and asset binding passes. | `source-map.md` Asset Map | `node tools/check-asset-binding.js pmndrs-racing-game` |
| REQ-005 | Validated | Input | MVP | Provide desktop controls and mobile steering/gas/brake touch controls. | Source keyboard controls plus mobile parity requirement. | InputManager drives keyboard controls; built-in `touchControls` is recognized as scene-level input. | `conversion-plan.md` | `node tools/check-stemscript-semantics.js pmndrs-racing-game`; `node tools/check-editor-import.js pmndrs-racing-game` |
| REQ-006 | Deferred | Service | Later | Restore source-authenticated persistent leaderboard behavior against the game services backend. | Source used Supabase/auth leaderboard; current runtime transport is not guaranteed in the behavior compartment. | Authenticated runs save and fetch rankings through the supported Game Services API without global access. | `conversion-notes.md` | Deferred until gameId/apiBaseUrl and user identity contract are supplied. |

## Completion Summary

MVP driving, timing, UIKit, asset, and input requirements are validated by the focused validators. Persistent authenticated leaderboard storage remains a later requirement because the old global transport is not compartment-safe.

## Open Questions

- Which Game Services identity and transport contract should this port use for authenticated leaderboard persistence?
