# BBall Conversion Plan

## Source

- **Repo:** https://github.com/elisee/bball
- **Stack:** Three.js 0.74, Socket.io 1.4, TypeScript, Node.js (server)
- **Genre:** 3v3 Multiplayer Arcade Basketball
- **LoC:** ~1,591 TypeScript across 22 files

## Source Entrypoints

- Server: `server/index.ts` → Express + Socket.io on port 3000
- Client: `client/index.ts` → browserified into `public/index.js`
- HTML: `public/index.html`

## Genre Classification

**Sports / Competitive Multiplayer Arcade**

Gameplay-critical priority (highest first):
1. Ball physics (gravity, drag, bounce, court collision)
2. Catch & throw mechanics (proximity check, aim angle, power)
3. Player movement & court bounds
4. Scoring detection (ball → basket zone)
5. Match lifecycle (waiting → playing → score freeze → end)
6. Multiplayer sync (all players see same state)
7. Team assignment & spectators
8. Fixed isometric camera
9. HUD (timer, scores, status)
10. Audio (bounce, catch, throw, score)

## Core Gameplay Systems

| System | Source Implementation | Stem Strategy |
|--------|---------------------|---------------|
| **Multiplayer** | Server-authoritative, Socket.io, 20Hz tick | Client-authoritative host via Colyseus, 20Hz accumulator in `update()` |
| **Ball physics** | Newtonian: gravity=0.04/tick, drag=0.98, bounce=0.6 | Custom behavior replicating exact physics (host-only) |
| **Movement** | Arrow keys/gamepad, 0.1 units/tick, court clamped | Custom input + movement behavior |
| **Jumping** | Parabolic: boost=0.5, gravity=0.05, 25 ticks | Replicated in player controller |
| **Catching** | Proximity check (0.5u from arm position) | Host validates, syncs via setBehaviorData |
| **Throwing** | Power=0.3, direction from aim angle | Client sends throw intent, host processes |
| **Scoring** | Ball enters basket zone → +2 pts, 60-tick freeze | Host detects zone entry, broadcasts score event |
| **Camera** | Fixed isometric: pos(0,8.5,16), rot(-π/8,0,0), FOV=50 | Custom camera behavior (cameraType=NONE) |
| **Characters** | Procedural box geometry (head/body/arms/legs) | Custom behavior building same geometry |
| **Court** | Procedural: floor, 4 walls, 2 baskets, 3 lights | Custom behavior building court geometry |
| **UI/HUD** | HTML sidebar + canvas overlay | UIKit HUD for scores/timer/status |
| **Audio** | Web Audio API, 4 SFX | erth.asset.audio + custom audio behavior |
| **Chat** | Socket.io text messages | Omitted (not essential to gameplay; can add later) |
| **Team select** | HTML dropdown in sidebar | Simplified via player data or HUD menu |

## Multiplayer Architecture Adaptation

### Source (Server-Authoritative)
- Dedicated Node.js server runs all game logic at 20Hz
- Clients send input, receive authoritative state
- Ball physics, scoring, catch validation all server-side

### Target (Client-Authoritative Host)
- One client is designated host via `mp.isHost()`
- Host runs: ball physics, catch validation, scoring, match timer
- All clients: render, process local input, send position (auto-sync via Colyseus)
- Sync channels:
  - **Player transforms** → automatic Colyseus sync
  - **Ball state** → `setBehaviorData` on ball object (host → all)
  - **Match state** → `setBehaviorData` on game manager (host → all)
  - **Player metadata** → `setPlayerData` (name, team index)

### Tick Rate Preservation
Source runs physics at 20Hz (50ms). StemStudio `update()` runs at frame rate (~60fps).
Use an accumulator pattern to step physics at exactly 20Hz for identical feel:
```javascript
let accumulator = 0;
const TICK_RATE = 1/20;
this.update = function(deltaTime) {
  accumulator += deltaTime;
  while (accumulator >= TICK_RATE) {
    accumulator -= TICK_RATE;
    tickPhysics();
  }
};
```

## Asset Extraction Plan

### Textures (5 files, copied to `textures/`)
- `floor.png` — Court floor (tileable)
- `wall.png` — Court walls (tileable)
- `ball-marker.png` — Ball shadow on ground
- `red-basket.png` — Red basket texture
- `blue-basket.png` — Blue basket texture

### Audio (4 files, copied to `audio/`)
- `bounce.wav` — Ball bounce
- `catch.wav` — Ball caught
- `throw.wav` — Ball thrown
- `score.wav` — Team scores

### Models
None — all geometry is procedural (box primitives). Will be recreated in behaviors.

## Planned Behaviors (7 total)

### 1. `bbCourt.yaml` (~250 lines)
**Purpose:** Builds the court environment (floor, walls, baskets, additional lighting)
- Floor: 14×10 plane with floor.png texture (tiled)
- Walls: 4 box walls around perimeter
- Baskets: Backboards with basket textures at each end
- Additional point lights (3) for court illumination
- Editor preview via `onEditorAdded`

### 2. `bbCharacterModel.yaml` (~250 lines)
**Purpose:** Procedural box-based player avatar
- Head (0.5³ box), body (0.4×0.4×0.5), arms (0.6×0.2×0.2), legs (0.2×0.6×0.2)
- Team color on body (red=#ff4444, blue=#4444ff)
- Skin color on head/arms/legs (#ff8888 / #cc8888)
- Canvas-based nametag plane above head
- Jump animation (Y offset from jump state)
- Arm pose for catching/throwing
- Editor preview

### 3. `bbPlayerController.yaml` (~300 lines)
**Purpose:** Local player input and movement
- Keyboard: arrows=move, Space=jump, Ctrl/Shift=catch, X=throw
- Gamepad: left stick=move, right stick=aim, RT=catch, LT=throw, LB/RB=jump
- Movement: 0.1 units/tick, clamped to court [-6,6] × [-4,4]
- Movement disabled while holding ball
- Writes input state to `erth.store` for other behaviors
- Store keys: `bb_input_*`

### 4. `bbBallController.yaml` (~400 lines)
**Purpose:** Ball physics and interaction mechanics (host-only physics)
- Newtonian simulation at 20Hz: gravity=0.04, drag=0.98, bounce=0.6
- Court wall collision (x: ±6.3, z: ±4.3, y floor: 0.3)
- Catch: host checks proximity of all players' arm positions to ball (0.5u radius)
- Throw: velocity from aim angle × power(0.3)
- Scoring: ball enters basket zone (x=±6.99, y∈[3,4.25], z∈[-1.5,1.5])
- Ball shadow marker on ground
- Multiplayer: host syncs ball state via `setBehaviorData`; non-host applies via `onStateUpdated`

### 5. `bbGameManager.yaml` (~450 lines)
**Purpose:** Match lifecycle, multiplayer orchestration, HUD
- Match states: waiting → playing → scoring-freeze → ended
- Match timer: 300 ticks (5 min at 20Hz)
- Score tracking per team and per player
- Score freeze: 60 ticks after basket, ball resets to center
- Remote player creation/destruction via player lifecycle listeners
- Team assignment via `setPlayerData`
- UIKit HUD: score display, timer, match status messages
- Host syncs match state via `setBehaviorData`

### 6. `bbCamera.yaml` (~100 lines)
**Purpose:** Fixed isometric camera
- Position: (0, 8.5, 16)
- Rotation: (-π/8, 0, 0)
- FOV: 50
- Slow Y-rotation during waiting state
- Disables built-in camera (cameraType=NONE)

### 7. `bbAudio.yaml` (~120 lines)
**Purpose:** Game sound effects
- Loads 4 sounds via asset attributes
- Listens for store-key triggers or onEvent messages
- bounce: volume scales with intensity
- catch/throw/score: fixed volume 0.5
- Spatial audio not needed (source doesn't use it)

## Store Communication Map

| Key | Writer | Reader | Type |
|-----|--------|--------|------|
| `bb_match_state` | bbGameManager | bbCamera, bbPlayerController | string |
| `bb_match_timer` | bbGameManager | bbGameManager (HUD) | number |
| `bb_team0_score` | bbGameManager | bbGameManager (HUD) | number |
| `bb_team1_score` | bbGameManager | bbGameManager (HUD) | number |
| `bb_ball_owner` | bbBallController | bbPlayerController, bbCharacterModel | string/null |
| `bb_score_timer` | bbGameManager | bbBallController | number |
| `bb_local_angle_x` | bbPlayerController | bbBallController | number |
| `bb_local_angle_y` | bbPlayerController | bbBallController, bbCharacterModel | number |
| `bb_local_catching` | bbPlayerController | bbBallController | boolean |
| `bb_local_throwing` | bbPlayerController | bbBallController | boolean |
| `bb_local_jumping` | bbPlayerController | bbCharacterModel | boolean |
| `bb_audio_event` | bbBallController, bbGameManager | bbAudio | string |

## Stemscript Structure

```
# 1. Import assets
import image ... (floor, wall, baskets, ball-marker textures)
import audio ... (bounce, catch, throw, score)

# 2. Import behaviors (7)
import behavior ... (bbCourt, bbCharacterModel, bbPlayerController, bbBallController, bbGameManager, bbCamera, bbAudio)

# 3. Scene settings
scene background gradient="..."
scene lighting ambientIntensity=0.5 ...
light "Directional Light" intensity=0.3 castShadow=true
game settings enabled=true isMultiplayer=true

# 4. Create court
add group name="Court"
behavior attach "Court" behaviorId=bbCourt

# 5. Create player (local)
add group name="Player" position=0,0,0
update "Player" tag=Player
behavior attach "Player" behaviorId=bbCharacterModel
behavior attach "Player" behaviorId=bbPlayerController

# 6. Create ball
add sphere name="Ball" position=0,0.3,0 radius=0.15 color=#d65628
behavior attach "Ball" behaviorId=bbBallController

# 7. Camera setup
camera "DefaultCamera" cameraType=NONE
behavior attach "DefaultCamera" behaviorId=bbCamera

# 8. Game manager + audio on Default Scene
behavior attach "Default Scene" behaviorId=bbGameManager
behavior attach "Default Scene" behaviorId=bbAudio

# 9. Touch controls
behavior attach "Default Scene" behaviorId=touchControls config={...}
```

## Expected Manual Follow-ups

1. **Team selection UI** — Basic HUD buttons for team join; full lobby UI may need iteration
2. **Chat** — Omitted from initial port; can be added as enhancement
3. **Spectator mode** — Players not on a team should observe; basic support in game manager
4. **Nametag polish** — Canvas texture nametags may need font/sizing tuning
5. **Audio asset import** — User needs to confirm audio files import correctly in editor
6. **Touch control layout** — May need tuning for basketball-specific button placement

## Open Questions / Risk Areas

1. **Multiplayer fidelity** — Client-authoritative model may feel different from server-authoritative; catch validation timing may vary with network latency
2. **Physics feel** — 20Hz accumulator should preserve feel, but frame-rate-independent rendering between ticks may need interpolation
3. **Max players** — Source allows 3v3 (6 total). StemStudio Colyseus room limit needs verification
4. **Ball-in-basket detection** — Source uses simple AABB zone check; may need refinement for edge cases
5. **Gamepad support** — StemStudio's input layer vs. raw Gamepad API in behaviors
