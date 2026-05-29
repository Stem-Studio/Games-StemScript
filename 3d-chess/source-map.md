# 3D Chess — Source Map

Maps source files to their destination equivalents.

| Source File | Purpose | Destination |
|-------------|---------|-------------|
| `src/pages/index.tsx` | Canvas + scene setup | `3d-chess.stemscript` |
| `src/components/Board.tsx` | Board rendering, click handling, game flow | `behaviors/chessGame/behavior.yaml` |
| `src/models/index.tsx` | MeshWrapper, piece materials, animation variants | `behaviors/chessGame/behavior.yaml` (materials section) |
| `src/models/Tile.tsx` | Tile mesh + material | `behaviors/chessGame/behavior.yaml` (buildBoardVisuals) |
| `src/models/Border.tsx` | Board border mesh | `behaviors/chessGame/behavior.yaml` (buildBoardVisuals) |
| `src/models/Pawn.tsx` | Pawn GLTF loader | `behaviors/chessGame/behavior.yaml` (loadPieceModels) |
| `src/models/Rook.tsx` | Rook GLTF loader | `behaviors/chessGame/behavior.yaml` (loadPieceModels) |
| `src/models/Knight.tsx` | Knight GLTF loader | `behaviors/chessGame/behavior.yaml` (loadPieceModels) |
| `src/models/Bishop.tsx` | Bishop GLTF loader | `behaviors/chessGame/behavior.yaml` (loadPieceModels) |
| `src/models/Queen.tsx` | Queen GLTF loader | `behaviors/chessGame/behavior.yaml` (loadPieceModels) |
| `src/models/King.tsx` | King GLTF loader | `behaviors/chessGame/behavior.yaml` (loadPieceModels) |
| `src/logic/board.ts` | Board utilities | `behaviors/chessGame/behavior.yaml` (board state section) |
| `src/logic/pieces/index.ts` | Move validation core | `behaviors/chessGame/behavior.yaml` (chess logic section) |
| `src/logic/pieces/pawn.ts` | Pawn movement + en passant | `behaviors/chessGame/behavior.yaml` (getPawnMoves) |
| `src/logic/pieces/rook.ts` | Rook movement | `behaviors/chessGame/behavior.yaml` (getRookMoves) |
| `src/logic/pieces/knight.ts` | Knight movement | `behaviors/chessGame/behavior.yaml` (getKnightMoves) |
| `src/logic/pieces/bishop.ts` | Bishop movement | `behaviors/chessGame/behavior.yaml` (getBishopMoves) |
| `src/logic/pieces/queen.ts` | Queen movement | `behaviors/chessGame/behavior.yaml` (getQueenMoves) |
| `src/logic/pieces/king.ts` | King + castling | `behaviors/chessGame/behavior.yaml` (getKingMoves) |
| `src/state/game.ts` | Turn/game state store | `behaviors/chessGame/behavior.yaml` (state variables) |
| `src/state/player.ts` | Player identity store | Omitted (no multiplayer) |
| `src/state/history.ts` | Move history store | `behaviors/chessGame/behavior.yaml` (moveHistory) |
| `src/components/StatusBar.tsx` | Turn indicator UI | `behaviors/chessHUD/behavior.yaml` |
| `src/components/GameCreation.tsx` | Room join/create | Omitted (no multiplayer) |
| `src/components/Chat.tsx` | Chat UI | Omitted (no multiplayer) |
| `src/components/Sidebar.tsx` | Minimap + history panel | Omitted (future enhancement) |
| `src/components/Opponent.tsx` | Opponent camera sphere | Omitted (no multiplayer) |
| `src/utils/socket.ts` | Socket.io client | Omitted (no multiplayer) |
| `src/pages/api/socket.ts` | Socket.io server | Omitted (no multiplayer) |
| `public/pawn.gltf` | Pawn 3D model | `models/pawn.gltf` |
| `public/rook.gltf` | Rook 3D model | `models/rook.gltf` |
| `public/knight.gltf` | Knight 3D model | `models/knight.gltf` |
| `public/bishop.gltf` | Bishop 3D model | `models/bishop.gltf` |
| `public/queen.gltf` | Queen 3D model | `models/queen.gltf` |
| `public/king.gltf` | King 3D model | `models/king.gltf` |
| `public/dawn.hdr` | HDR environment map | `textures/dawn.hdr` (reference) |
