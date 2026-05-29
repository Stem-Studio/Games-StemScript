# Source Map: 2048

## Source → Destination File Mapping

| Source File | Role | Destination |
|------------|------|-------------|
| `js/game_manager.js` | Game logic (move, merge, spawn, win/loss) | `behaviors/game2048.yaml` (game logic section) |
| `js/grid.js` | Grid data structure | `behaviors/game2048.yaml` (Grid class) |
| `js/tile.js` | Tile data structure | `behaviors/game2048.yaml` (GameTile class) |
| `js/keyboard_input_manager.js` | Keyboard + touch/swipe input | `behaviors/game2048.yaml` (input handlers in init) |
| `js/html_actuator.js` | DOM rendering + score/message display | `behaviors/game2048.yaml` (canvas rendering) |
| `js/local_storage_manager.js` | Game state persistence | Not ported (session-only) |
| `js/application.js` | Bootstrap (new GameManager) | `2048.stemscript` (behavior attachment) |
| `style/main.css` | Tile colors, grid styling, layout | `behaviors/game2048.yaml` (TILE_COLORS map, layout constants) |
| `index.html` | Page structure, grid template | `behaviors/game2048.yaml` (canvas layout) |

## Key Value Mappings

### Tile Colors (from `style/main.css`)
| Value | Background | Text |
|-------|-----------|------|
| 2 | #eee4da | #776e65 |
| 4 | #ede0c8 | #776e65 |
| 8 | #f2b179 | #f9f6f2 |
| 16 | #f59563 | #f9f6f2 |
| 32 | #f67c5f | #f9f6f2 |
| 64 | #f65e3b | #f9f6f2 |
| 128 | #edcf72 | #f9f6f2 |
| 256 | #edcc61 | #f9f6f2 |
| 512 | #edc850 | #f9f6f2 |
| 1024 | #edc53f | #f9f6f2 |
| 2048 | #edc22e | #f9f6f2 |
| >2048 | #3c3a32 | #f9f6f2 |

### Direction Vectors (from `game_manager.js`)
| Direction | Key | Vector |
|-----------|-----|--------|
| Up | 0 | (0, -1) |
| Right | 1 | (1, 0) |
| Down | 2 | (0, 1) |
| Left | 3 | (-1, 0) |

### Spawn Probability
- 90% chance of value 2
- 10% chance of value 4
- (from `GameManager.prototype.addRandomTile`)
