# 3D Chess — Conversion Plan

## Source

- **Repository**: https://github.com/joshwrn/3d-chess
- **Stack**: Next.js 13 + React Three Fiber + Three.js 0.148 + Socket.io + Zustand
- **Genre**: Board game (turn-based strategy)
- **Canonical Title**: "3D Chess" (from repo name and README)

## Source Entrypoint

- `src/pages/index.tsx` — Canvas setup with R3F
- `src/components/Board.tsx` — Main game logic + 3D rendering
- `src/logic/pieces/` — Chess move validation

## Detected Systems

| System | Source | Stem Mapping |
|--------|--------|-------------|
| Chess logic | `src/logic/pieces/` (7 files) | Inlined in `chessGame` behavior |
| Board rendering | `src/components/Board.tsx` + `src/models/Tile.tsx` | `chessGame` behavior creates tiles/border with Three.js |
| Piece rendering | `src/models/*.tsx` + GLTF models | `chessGame` behavior loads GLTF via `erth.asset.model` |
| Piece materials | `meshPhysicalMaterial` with metalness/roughness | `MeshPhysicalNodeMaterial` (TSL-compatible) |
| Tile materials | `meshPhysicalMaterial` | `MeshStandardNodeMaterial` |
| Selection | State + emissive glow + lift | Material swap + Y offset |
| Valid moves | Red tile highlighting | Material swap on tile meshes |
| Piece animation | Framer Motion 3D + react-spring | Custom parametric arc animation |
| Camera | OrbitControls (drei) | Custom `chessCamera` orbit behavior |
| Turn management | Zustand store | Behavior local state |
| Input | R3F onClick → raycasting | Pointer events + THREE.Raycaster |
| UI | React absolute-positioned overlays | UIKit HUD behavior |
| Multiplayer | Socket.io rooms | Omitted (local play only) |
| Chat | Socket.io messages | Omitted |
| HDR environment | `dawn.hdr` + drei Environment | Omitted (approximated with hemisphere light) |

## Assets

| Asset | Source Path | Destination |
|-------|------------|-------------|
| Pawn model | `public/pawn.gltf` | `models/pawn.gltf` |
| Rook model | `public/rook.gltf` | `models/rook.gltf` |
| Knight model | `public/knight.gltf` | `models/knight.gltf` |
| Bishop model | `public/bishop.gltf` | `models/bishop.gltf` |
| Queen model | `public/queen.gltf` | `models/queen.gltf` |
| King model | `public/king.gltf` | `models/king.gltf` |
| HDR env | `public/dawn.hdr` | `textures/dawn.hdr` (reference copy) |

## Architecture

### Behaviors

1. **chessGame** (`chess.chessGame`) — Core behavior on `ChessBoard` group:
   - Creates 8×8 board tiles and border with BoxGeometry
   - Loads 6 GLTF piece models via `erth.asset.model`
   - Full chess rules (all piece types, castling, en passant, promotion, check/checkmate/stalemate)
   - Raycasting input for piece selection and movement
   - Arc animation for piece moves, fly-off for captures
   - Selection highlighting (emissive glow + lift + red tiles + point light)
   - Editor preview callbacks for board visualization

2. **chessCamera** (`chess.chessCamera`) — Orbit camera:
   - Spherical coordinate orbit around board center
   - Drag to rotate, scroll to zoom
   - Smoothed interpolation, min/max distance limits
   - Source-faithful initial position and FOV

3. **chessHUD** (`chess.chessHUD`) — UIKit HUD:
   - Turn indicator (White/Black to move)
   - Check warning
   - Game over overlay with checkmate/stalemate message
   - Reset button

### Configuration Surface

| Parameter | Behavior | Default | Purpose |
|-----------|----------|---------|---------|
| Piece Scale | chessGame | 0.15 | GLTF model scale factor |
| White/Black Tile Color | chessGame | #aaaaaa / #5a5a5a | Board tile colors |
| White/Black Piece Color | chessGame | #d9d9d9 / #7c7c7c | Piece material colors |
| Valid Move Color | chessGame | #ff0101 | Highlight for legal move tiles |
| Selection Emissive | chessGame | #733535 | Glow color on selected piece |
| Move Arc Height | chessGame | 1.2 | Height of piece movement arc |
| Move Duration | chessGame | 0.6s | Duration of move animation |
| Initial Distance | chessCamera | 14 | Camera starting distance |
| Min/Max Distance | chessCamera | 7 / 25 | Zoom limits |
| FOV | chessCamera | 50 | Camera field of view |
| Rotate/Zoom Speed | chessCamera | 0.005 / 0.5 | Camera control sensitivity |

## Fidelity Assessment

### Preserved
- Full chess rules (movement, capture, castling, en passant, promotion, check, checkmate, stalemate)
- Original GLTF piece models
- Metallic PBR material look (metalness=1, roughness=0.5)
- Selection glow (emissive #733535) and piece lift
- Valid move red highlighting
- Orbit camera with zoom limits
- Shadow-casting point light
- Board geometry (8×8 tiles + border)
- Piece movement arc animation
- Capture fly-off animation
- Turn-based gameplay
- Color scheme

### Approximated
- Spring physics animation → ease-out cubic parametric animation (very close visual feel)
- HDR environment lighting → hemisphere + ambient light (slightly less reflective)
- Camera smoothing uses lerp instead of orbit-controls damping

### Omitted
- Multiplayer (Socket.io) — source requires a server; StemStudio runs client-side
- Chat system — multiplayer dependency
- Opponent camera indicator (floating sphere) — multiplayer dependency
- Loading screen — GLTF preloading handled differently
- Sidebar with minimap/history — could be added as future enhancement

## Manual Follow-ups

1. After importing, manually assign the 6 GLTF model assets to the chessGame behavior attributes in the editor (or rely on `findByName` fallback)
2. Verify GLTF models load correctly and piece geometry extracts properly
3. If HDR reflections are important, manually add an environment map in the editor

## Open Questions / Risks

- GLTF models are 4-6MB each; combined 30MB may affect load time
- `MeshPhysicalNodeMaterial` with reflectivity may render slightly differently than source `meshPhysicalMaterial`
- Raycasting on 64 tile meshes should be performant but hasn't been profiled
