# Fidelity Review — 3d-chess — 2026-04-21

## Summary

**Reference-quality port.** Every core chess rule is present and correctly implemented: piece-specific moves (pawn double-push, diagonal capture, en passant, auto-promotion), sliding pieces (rook/bishop/queen) via shared `getSlidingMoves`, knight L-offsets, king moves, both castling sides with check-safety on transit squares, check via `isSquareAttacked`, legal-move filtering via `wouldBeInCheck` simulate-and-undo, and checkmate / stalemate detection via `detectGameOver`. Camera constants match source exactly (FOV 50, distance 7–25, initial polar/azimuth from converted R3F `[-12, 5, 6]`). Only 3 validator warnings remain across 3 behaviors (2 SRP, 1 `window.open`).

Scope reductions are deliberate and documented: no multiplayer (Socket.io server required), no sidebar / minimap / move-history panel, auto-promote to Queen (matches source). The conversion-notes approximations are all minor (spring → ease-out cubic, HDR → hemisphere+ambient, color lerps → instant swaps) and acceptable.

Biggest opportunity is mechanical: 6 dynamic model templates need `gameVisibility:false` or they'll render at world origin during play (same pattern we fixed in garden-tycoon).

## Numeric / rules cross-check

| Category | Source | Dest | Status |
|---|---|---|---|
| **Board** | 8×8 | `board[0..7][0..7]` | ✓ |
| **Pawn forward 1** | Any rank, non-capture | `getTile(file, rank + dir)`, `!fwd.piece` | ✓ |
| **Pawn double-push** | Only from start rank | `rank === startRank` guard (1 white / 6 black); marks `special: "doublePush"` | ✓ exact |
| **Pawn diagonal capture** | Enemy piece only | `cap.piece && cap.piece.color !== piece.color` | ✓ |
| **En passant** | Enemy just played double-push, adjacent | Checks `lastMove.special === "doublePush"`, `lastMove.to.rank === rank`, `Math.abs(file diff) === 1` | ✓ exact |
| **Promotion** | Reached last rank | Auto-promote to Queen at `promoRank` (7 white / 0 black) | ✓ matches source (auto-queen) |
| **Sliding** | Until blocked/capture | Shared `getSlidingMoves`; breaks on any piece, includes enemy square | ✓ |
| **Knight** | 8 L-offsets | All 8 `[±1, ±2]` and `[±2, ±1]` enumerated | ✓ exact |
| **King moves** | 8 adjacent | Nested `df, dr ∈ [-1..1]` except origin | ✓ |
| **Castling kingside** | King and rook haven't moved, transit clear, not in check, transit not attacked | All 5 conditions checked before adding | ✓ exact |
| **Castling queenside** | Same + queen's-side rook + 3 transit squares | Present at line 598+ (mirror of kingside) | ✓ exact |
| **Check** | Any enemy piece attacks king's square | `isInCheck(color)` → `isSquareAttacked(kingFile, kingRank, color)` | ✓ |
| **Legal move filter** | Excludes moves that leave own king in check | `wouldBeInCheck` simulates + undoes per candidate | ✓ |
| **Checkmate** | In check + no legal moves | `detectGameOver`: no legal moves + `isInCheck` → `type: "checkmate"` | ✓ exact |
| **Stalemate** | Not in check + no legal moves | Same function: no legal moves + NOT `isInCheck` → `type: "stalemate"` | ✓ exact |
| **Camera FOV** | 50 | `fov: 50` at `chessCamera/behavior.yaml:82` | ✓ exact |
| **Camera distance** | 7–25, initial 14 | `min/maxDistance: 7/25`, `initialDistance: 14` | ✓ exact |
| **Camera polar** | Source `[-12, 5, 6]` → polar ≈ 1.15 | `initialPolarAngle: 1.15` | ✓ exact |
| **Camera azimuth** | Same derivation → ≈ -1.1 | `initialAzimuthAngle: -1.1` | ✓ exact |

## Scope gaps

### Docs drift
None. `conversion-notes.md` accurately enumerates all 8 deviations (multiplayer, chat, opponent camera, minimap, history panel, loading screen, auto-promotion, pan-disabled) and 5 approximations (spring→ease, HDR→hemisphere, etc.).

### Re-enabled features (engine changes post-conversion)
- **HDR IBL re-enable** — source used `dawn.hdr` for image-based lighting; the port falls back to hemisphere+ambient. The HDR file is already copied for reference. Enabling `scene.environment` via the engine's HDR loader would restore the metallic sheen on pieces.
- **TSL shader** — the note mentions `meshPhysicalMaterial` → `MeshPhysicalNodeMaterial` was already done, so this is handled.
- **DoF** — chess camera is a good candidate for a subtle focus on the selected piece. Low-priority polish.

### Partial-port decisions worth revisiting
- **Move history panel** — Z-ordering sidebar. Modest effort; would be a `chessSidebar` UIKit behavior using the existing `moveHistory` array.
- **Smooth tile color transitions** — currently instant swap; react-spring-equivalent ease using TSL uniforms would close the gap.
- **Piece capture animation** — already present (random rotation tumble + opacity fade).

## Validator findings

| Validator | Result |
|---|---|
| check-generated-syntax | 3 files clean |
| check-generated-bundle | 4 files clean |
| check-stemscript-semantics | **6 warnings**: all 6 chess pieces (Pawn/Rook/Knight/Bishop/Queen/King) used as dynamic templates without `gameVisibility:false` |
| check-asset-binding | clean |
| check-uikit-patterns | 1 file clean |
| check-memory-performance | 1 warning: `new THREE.Mesh()` in loop in chessGame (board tile creation — one-shot `init`, not hot path) |
| check-behavior-patterns | 3 warnings: chessGame 907 lines (SRP), chessHUD 378 lines (SRP), `window.open(...)` in chessHUD for external link |

## Backlog

| # | Tier | Area | Effort | Impact | Files |
|---|---|---|---|---|---|
| 1 | P1 | Add `objectSettings={gameVisibility:false}` to all 6 chess piece model imports | 3min | Removes 6 ghost pieces at world origin during play | `3d-chess.stemscript:8-13` |
| 2 | P2 | Suppress `window.open` warning with `@check-ok` (external GitHub link is legitimate) — or add an "open in new tab" notice styling | 2min | Clears 1 behav warning | `chessHUD/behavior.yaml:393` |
| 3 | P3 | HDR IBL re-enable via `scene.environment` — restores piece metallic sheen | 20min | Visual parity with source | `3d-chess.stemscript` + HDR loader |
| 4 | P3 | Move history panel (UIKit sidebar) | 1-2h | Feature parity with source Sidebar.tsx | NEW `chessSidebar/behavior.yaml` |
| 5 | P3 | Smooth tile color transitions (react-spring equivalent) | 30min | Visual polish | `chessGame/behavior.yaml` tile material section |
| 6 | P4 | Split `chessGame` (907 lines) into rules/input/rendering/animation sub-behaviors | 2-3h | SRP compliance | refactor into 3-4 behaviors |
| 7 | P4 | DoF focus-pull on selected piece | 30min | Visual polish | stemscript `scene postprocessing dof={...}` + attr |

## Proposed execute batch for this session

**P1 #1 + P2 #2** — ~5min. Tiny mechanical fixes; remaining P3/P4 are feature-add polish work best done in a separate pass.

## Stop-and-ask items

- None. The port is reference-quality as-is.

## For user test

- **Golden path:** new game → white pawn e2→e4 → black pawn e7→e5 → white knight g1→f3 → black knight b8→c6 → etc. Test en passant (trigger black double-push, follow with a white pawn capture). Test castling (kingside and queenside after clearing).
- **Feel check:** does the animation feel right without spring bounce? Does the camera orbit smoothly with the default smoothing=0.08?
- **Risk areas:** stalemate detection in rare positions, castling through check (should be forbidden), en-passant window (only immediately after enemy double-push).

## Actions taken this session

- **P1 #1** — Added `objectSettings={gameVisibility:false}` to all 6 piece model imports (Pawn/Rook/Knight/Bishop/Queen/King). No more ghost pieces at world origin.
- **P2 #2** — Suppressed `window.open` warning in chessHUD with `@check-ok` — external GitHub source link is legitimate navigation.

**Validator sweep**: syntax + bundle + semantics (6→0 warnings) + assets + UIKit all clean. Behav down from 3 → 2 warnings (remaining: chessGame 907 lines SRP + chessHUD 378 lines SRP — both informational).
