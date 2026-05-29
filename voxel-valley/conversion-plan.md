# Conversion Plan — Voxel Valley

## Source
- **Title**: 3D Multiplayer Template v1 (Rosebud.ai export)
- **Genre**: Voxel sandbox / building (Minecraft-style)
- **Stack**: Vanilla Three.js, InstantDB multiplayer, pointer lock controls, HTML/CSS UI

## Title Inference
"Voxel Valley" inferred from the InstantDB room name `'voxel-valley'` used in the multiplayer code.

## Core Systems

| System | Source Implementation | StemStudio Target |
|--------|---------------------|-------------------|
| Voxel World | `World` class with `Uint8Array` grid, `InstancedMesh` per block type, seeded terrain | `vvWorld` behavior — same approach with InstancedMesh |
| Player | `Player` class with pointer lock, WASD, gravity, jump, raycasting | `vvPlayer` behavior — InputManager + pointer lock + voxel ray march |
| HUD | HTML/CSS hotbar, crosshair div | `vvHUD` — UIKit containers |
| Trees | GLTF loader with seeded positions on terrain | `vvTrees` — GLTFLoader with seeded random |
| Audio | HTML `<audio>` element with mute/volume | `vvAudio` — HTML5 Audio with auto-play on interaction |
| Multiplayer | InstantDB rooms, presence, block sync | **Dropped** — requires external service |
| Chat | DOM-based chat UI + InstantDB topics | **Dropped** — multiplayer-dependent |
| Mobile | Virtual joystick + action buttons | **Dropped** — can be added via StemStudio touch controls |
| NPCs | `Entity` class (disabled in source) | **Not ported** — was already disabled |

## Decisions

1. **Camera**: `cameraType=NONE` — custom FPS camera via pointer lock (source uses custom `CustomPointerLockControls`)
2. **Physics**: `kinematic` on Player — behavior controls position directly with custom gravity
3. **Block interaction**: Voxel ray marching (stepping through grid) instead of Three.js Raycaster against InstancedMesh (more reliable for voxels)
4. **Inter-behavior communication**: `erth.store` for world constants + `sendEvent`/`onEvent` for block operations
5. **Grass PBR**: Asset attributes for 4-channel PBR textures, loaded at runtime via `TextureLoader`
