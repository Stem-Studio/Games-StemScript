# BBall Source Map

## Source → Stem File Mapping

| Source File | Stem File | Notes |
|-------------|-----------|-------|
| `shared.ts` (constants) | All behavior YAMLs | Constants replicated in each behavior that needs them |
| `shared.ts` (tickBall) | `bbBallController.yaml` | Exact physics formula replicated |
| `shared.ts` (getArmPosition) | `bbBallController.yaml` | Exact arm position formula |
| `shared.ts` (getAvatarY) | `bbPlayerController.yaml`, `bbGameManager.yaml` | Exact jump height formula |
| `server/game.ts` | `bbGameManager.yaml` | Match tick loop, player tracking |
| `server/Player.ts` | `bbPlayerController.yaml`, `bbBallController.yaml` | Input handling, catch/throw validation |
| `server/match.ts` | `bbGameManager.yaml` | Match start/tick/end lifecycle |
| `client/renderer/index.ts` | `bbCharacterModel.yaml`, `bbBallController.yaml` | Avatar pose updates, ball visual positioning |
| `client/renderer/input.ts` | `bbPlayerController.yaml` | Keyboard/gamepad gathering, prediction |
| `client/renderer/camera.ts` | `bbCamera.yaml` | Fixed isometric camera |
| `client/renderer/character.ts` | `bbCharacterModel.yaml` | Box avatar geometry, nametag canvas |
| `client/renderer/courtModel.ts` | `bbCourt.yaml` | Floor, walls, baskets, lighting |
| `client/renderer/ballModel.ts` | `bbBallController.yaml` | Ball sphere mesh |
| `client/renderer/ballMarker.ts` | `bbBallController.yaml` | Ball shadow marker |
| `client/renderer/audio.ts` | `bbAudio.yaml` | Web Audio API sound loading/playback |
| `client/gameClient.ts` | `bbGameManager.yaml` | Multiplayer event handling, state sync |
| `client/status.ts` | `bbGameManager.yaml` (HUD) | Timer/score display |
| `client/sidebar/*` | Not implemented | Chat, name input, team selection (omitted) |
| `public/index.html` | `bball.stemscript` | Replaced by script-driven scene setup |
| `public/index.css` | Not applicable | CSS replaced by canvas-based HUD |

## Mechanics Map

| Mechanic | Source Location | Stem Behavior |
|----------|----------------|---------------|
| Ball Newtonian physics | `shared.ts:tickBall()` | `bbBallController` |
| Ball catch (proximity) | `server/Player.ts:onInput` | `bbBallController` (host) |
| Ball throw (velocity) | `server/Player.ts:onThrowBall` | `bbBallController` (host) |
| Ball reset after score | `shared.ts:resetBall()` | `bbBallController` |
| Scoring detection | `shared.ts:tickBall()` | `bbBallController` |
| Player movement | `client/renderer/input.ts:predict()` | `bbPlayerController` |
| Jumping (parabolic) | `shared.ts:getAvatarY()` | `bbPlayerController`, `bbGameManager` |
| Match timer | `server/match.ts:tick()` | `bbGameManager` (host) |
| Team assignment | `server/Player.ts:onJoinTeam` | `bbGameManager` (auto) |
| Remote player sync | `server/game.ts:tick()` | `bbGameManager` + Colyseus |
| Camera orbit (idle) | `client/renderer/index.ts:animate()` | `bbCamera` |
| Character rendering | `client/renderer/character.ts` | `bbCharacterModel` |
| Nametag canvas | `client/renderer/character.ts:updateNametag()` | `bbCharacterModel` |
| Sound effects | `client/renderer/audio.ts` | `bbAudio` |

## Asset Map

| Source Path | Destination Path | Import Name |
|-------------|-----------------|-------------|
| `public/textures/floor.png` | `textures/floor.png` | BBFloor |
| `public/textures/wall.png` | `textures/wall.png` | BBWall |
| `public/textures/red-basket.png` | `textures/red-basket.png` | BBRedBasket |
| `public/textures/blue-basket.png` | `textures/blue-basket.png` | BBBlueBasket |
| `public/textures/ball-marker.png` | `textures/ball-marker.png` | BBBallMarker |
| `public/sounds/bounce.wav` | `audio/bounce.wav` | BBBounce |
| `public/sounds/catch.wav` | `audio/catch.wav` | BBCatch |
| `public/sounds/throw.wav` | `audio/throw.wav` | BBThrow |
| `public/sounds/score.wav` | `audio/score.wav` | BBScore |
