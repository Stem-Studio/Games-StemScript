# StemStudio Pattern Reference

Comprehensive copy-paste syntax reference extracted from existing game projects.
Sources: fsim, hexgl, flypieter-2, survivor, solar-system, beachy-ball, pocket-orbit, canonical examples.

---

## 1. Stemscript Format

### 1.1 Project Title & Header

```stemscript
project title "Pieter Flight Simulator"
```

With comments/metadata (not parsed, just documentation):

```stemscript
# Scene: Pieter Flight Simulator
# Description: MMO flight simulator with 8 procedural vehicles, combat, and full HUD
# Source: fly.pieter.com (Pieter Levels)
# Mode: Multiplayer
```

### 1.2 Asset Imports

**Models:**
```stemscript
import model "B738" "models/b738.glb" "Boeing 737-800 airliner from fsim"
```

**Images/Textures:**
```stemscript
import image name="SunTex" filepath="textures/2k_sun.jpg" comment="Sun surface texture"
import image name=PFSPlaneIcon filepath="assets/vehicle-icons/plane.svg" comment="Vehicle selector icon"
```

**Audio:**
```stemscript
import audio A10Gun "A-10 Warthog gun sound effect"
import audio AmbientMusic "Background music loop"
import audio FootstepsSFX "Footstep sounds"
import audio PunchSFX "Punch impact sound"
import audio ShootSFX "Shooting sound effect"
```

### 1.3 Behavior Imports

```stemscript
import behavior "FSIM Flight Controller" "behaviors/fsimFlightController.yaml"
import behavior "FSIM Token Field" "behaviors/fsimTokenField.yaml"
import behavior "FSIM HUD" "behaviors/fsimHud.yaml"
```

Multiple behaviors (flight sim pattern):
```stemscript
import behavior "PFS Environment Builder" "behaviors/pfsEnvironmentBuilder.yaml"
import behavior "PFS Vehicle Builder" "behaviors/pfsVehicleBuilder.yaml"
import behavior "PFS Flight Physics" "behaviors/pfsFlightPhysics.yaml"
import behavior "PFS Input Controller" "behaviors/pfsInputController.yaml"
import behavior "PFS Combat System" "behaviors/pfsCombatSystem.yaml"
import behavior "PFS Camera Controller" "behaviors/pfsCameraController.yaml"
import behavior "PFS Procedural Audio" "behaviors/pfsProceduralAudio.yaml"
import behavior "PFS HUD" "behaviors/pfsHUD.yaml"
import behavior "PFS Start Screen" "behaviors/pfsStartScreen.yaml"
import behavior "PFS Vehicle Selector" "behaviors/pfsVehicleSelector.yaml"
import behavior "PFS Leaderboard" "behaviors/pfsLeaderboard.yaml"
import behavior "PFS Pause Menu" "behaviors/pfsPauseMenu.yaml"
import behavior "PFS Multiplayer Manager" "behaviors/pfsMultiplayerManager.yaml"
import behavior "PFS Message Feed" "behaviors/pfsMessageFeed.yaml"
import behavior "PFS Bird Flock" "behaviors/pfsBirdFlock.yaml"
import behavior "PFS Minimap" "behaviors/pfsMinimap.yaml"
import behavior "PFS Explosion Effect" "behaviors/pfsExplosionEffect.yaml"
```

### 1.4 Scene Settings

**Background types:**
```stemscript
# Solid color
scene background type=Color color=#000000
scene background type=Color color=#7f93aa
scene background type=Color color=#87ceeb
scene background type=Color color=#00bfff

# Gradient
scene background type=Gradient gradient="linear-gradient(0deg, #4a7c4e 0%, #87CEEB 100%)"
```

**Fog:**
```stemscript
scene fog type=none
scene fog type=linear color=#87CEEB near=200 far=5000
scene fog type=linear color=#87ceeb near=40 far=120
scene fog type=exponential color=#92a5b7 density=0.000035
```

**Lighting:**
```stemscript
# Full lighting setup
scene lighting ambient={color:#6d7a91,intensity:0.58} hemisphere={skyColor:#c6d7ee,groundColor:#37412e,intensity:0.78} shadows={enabled:true,intensity:1.0}

# Simpler variants
scene lighting ambient={color:"#ffffff",intensity:0.3}
scene lighting ambient={intensity:0.1}
scene lighting hemisphere={skyColor:"#87CEEB",groundColor:"#4a7c4e",intensity:0.5}
scene lighting shadows={enabled:true}
```

**Tone mapping:**
```stemscript
scene tonemapping type=ACESFilmicToneMapping exposure=1.0
```

**Render settings:**
```stemscript
render settings useShadows=true
render settings useShadows=true shadowMapType=2
render settings useShadows=false
```

**Light objects:**
```stemscript
light "Directional Light" intensity=2.4 color=#fff5d8 castShadow=true shadowMapSize=2048
update "Directional Light" position=900,1200,700

# Shadow bias for flickering prevention
light "Directional Light" intensity=1.8 color=#fff5e0 castShadow=true shadowMapSize=2048 shadowBias=-0.002

light "AmbientLight" intensity=0.1
delete "HemisphereLight"
```

### 1.5 Camera Setup

```stemscript
# Disable built-in camera (custom behavior controls it)
camera "DefaultCamera" cameraType=NONE fov=60 near=0.1 far=50000

# Chase camera disabled for custom behavior
camera "DefaultCamera" cameraType=NONE fov=45 near=0.1 far=200

# IMPORTANT: near < 1 (0.1 recommended) when using UIKit
```

### 1.6 Game Settings

```stemscript
game settings enabled=true showHUD=false
```

### 1.7 Object Primitives

**Groups (containers):**
```stemscript
add group name="World" position=0,0,0
add group name="PlayerAircraft" position=0,3.5,1900
add group name="GameManager" position=0,0,0
add group name="EnemyPool" position=0,0,0
add group name="BulletPool" position=0,0,0
add group name="Decorations" position=0,0,0
```

**Planes:**
```stemscript
add plane name="Ground" position=0,-0.02,0 scale=16000,16000,1 rotation=-90,0,0
add plane name="Runway" position=0,0.01,0 scale=100,4000,1 rotation=-90,0,0
```

**Boxes:**
```stemscript
add box name="RunwayStripe01" position=0,0.03,-1600 scale=3,0.02,110 color=#f2f2f2
add box name="TowerMarker" position=400,50,-500 scale=20,100,20 color=#4d5966
```

**Spheres:**
```stemscript
add sphere name="Earth" position=7,0,0 scale=1,1,1
add sphere name="Sun" position=0,0,0 scale=5,5,5
```

**Capsules (player characters):**
```stemscript
add capsule name="Player" position=0,1,0 scale=0.5,1,0.5
```

### 1.8 Tags & Player Setup

```stemscript
# Player tag is REQUIRED for controller/camera/triggers/touch
update "PlayerAircraft" tag=Player
update "Player" tag=Player

# Move imported model under player group
move "B738" parent="PlayerAircraft"
```

### 1.9 Materials

**Simple color materials:**
```stemscript
material Ground color=#5f6f63 roughness=1 metalness=0
material Runway color=#23272d roughness=0.92 metalness=0.05
material TowerMarker roughness=0.95 metalness=0.02
material Earth metalness=0.1 roughness=0.7
```

**Textures applied to materials:**
```stemscript
texture TrackCityscape imageAsset=TrackDiffuse
texture TrackCityscape imageAsset=TrackNormal textureType=normalMap
texture TrackCityscape imageAsset=TrackSpecular textureType=metalnessMap
material TrackCityscape metalness=0.6 roughness=0.4 tileAmountX=1 tileAmountY=1

texture StartBanner imageAsset=StartBannerTex
material StartBanner tileAmountX=1 tileAmountY=1
```

### 1.10 Behavior Attach

**Simple attach:**
```stemscript
behavior attach "GameManager" behaviorId="fsim.flightController" config={playerName:"PlayerAircraft"}
behavior attach "GameManager" behaviorId="fsim.tokenField" config={playerName:"PlayerAircraft"}
behavior attach "GameManager" behaviorId="fsim.hud"
```

**With asset references in config:**
```stemscript
behavior attach Player behaviorId=pfs.vehicleBuilder
behavior attach Player behaviorId=pfs.flightPhysics
behavior attach Player behaviorId=pfs.inputController
behavior attach Player behaviorId=pfs.combatSystem
behavior attach Player behaviorId=pfs.proceduralAudio config={gunSound:"A10Gun"}
behavior attach Player behaviorId=pfs.cameraController
```

**With model/audio asset references:**
```stemscript
behavior attach "Player" behaviorId="sv.player" config={moveSpeed:12,punchRange:3,punchCooldown:0.5,punchDamage:20,shootCooldown:0.25,maxHealth:100,playerModel:"CubeGuy",footstepSound:"FootstepsSFX",punchSound:"PunchSFX"}
behavior attach "Default Scene" behaviorId="sv.game" config={ambientMusic:"AmbientMusic"}
```

**Scene-level behaviors (attach to "Default Scene"):**
```stemscript
behavior attach "Default Scene" behaviorId=sw.solarController
behavior attach "Default Scene" behaviorId=sw.solarOrbitCamera config={distance:30,minDistance:5,maxDistance:60}
```

**Per-object behaviors:**
```stemscript
behavior attach Earth behaviorId=sw.planetOrbit config={orbitRadius:7,orbitSpeed:1.0,rotationSpeed:1.0,textureName:"EarthTex"}
behavior attach Saturn behaviorId=sw.planetOrbit config={orbitRadius:15,orbitSpeed:0.4,rotationSpeed:4.0,textureName:"SaturnTex"}
```

### 1.11 Touch Controls (Built-in Behavior)

**Flight-sim touch layout:**
```stemscript
behavior attach "Default Scene" behaviorId=touchControls config={mobileEnabled:true,tabletEnabled:true,desktopEnabled:false,mobileHorizontalLayout:{joystick:{joystickEnabled:true,joystickPosition:[0.12,0.2],joystickSize:130,joystickDeadzone:0.08,joystickRunThreshold:0.7,joystickMappedInputs:[{inputName:"gpLeftX",axis:"x"},{inputName:"gpLeftY",axis:"y"}]},buttons:[{buttonId:"fireBtn",buttonType:"custom",buttonEnabled:true,buttonPosition:[0.88,0.25],buttonSize:80,buttonLabel:"FIRE",customInputName:"pfs_touch_fire"},{buttonId:"turboBtn",buttonType:"custom",buttonEnabled:true,buttonPosition:[0.88,0.1],buttonSize:60,buttonLabel:"TURBO",customInputName:"pfs_touch_turbo"}]}}
```

**Platformer touch layout (joystick + jump):**
```stemscript
behavior attach "Default Scene" behaviorId=touchControls config={mobileEnabled:true,tabletEnabled:true,desktopEnabled:false,mobileHorizontalLayout:{joystick:{joystickEnabled:true,joystickPosition:[0.15,0.2],joystickSize:120,joystickDeadzone:0.1,joystickRunThreshold:0.7},buttons:[{buttonId:"jumpBtn",buttonType:"jump",buttonEnabled:true,buttonPosition:[0.85,0.2],buttonSize:70}]},mobileVerticalLayout:{joystick:{joystickEnabled:true,joystickPosition:[0.15,0.12],joystickSize:100,joystickDeadzone:0.1,joystickRunThreshold:0.7},buttons:[{buttonId:"jumpBtn",buttonType:"jump",buttonEnabled:true,buttonPosition:[0.85,0.12],buttonSize:60}]},tabletHorizontalLayout:{joystick:{joystickEnabled:true,joystickPosition:[0.12,0.2],joystickSize:140,joystickDeadzone:0.08,joystickRunThreshold:0.7},buttons:[{buttonId:"jumpBtn",buttonType:"jump",buttonEnabled:true,buttonPosition:[0.88,0.2],buttonSize:80}]}}
```

### 1.12 Object Settings & Visibility

```stemscript
# Runtime-only objects (hidden in editor, visible at runtime)
objectSettings EnemyPool gameVisibility=false
objectSettings BulletPool gameVisibility=false
```

---

## 2. Behavior YAML Format

### 2.1 Full YAML Structure

```yaml
meta:
  tool: StemStudio
  type: behavior
  exportVersion: 1

config:
  name: "PFS Flight Physics"
  id: "pfs.flightPhysics"
  author: "flight-sim"
  isScript: true
  main: "script.js"
  version: "1.0.0"
  priority: 0
  description: "Flight physics — throttle, pitch, roll, yaw, gravity, ground handling"
  tags:
    - gameplay
  attributes: {}
  documentation: >-
    Flight physics engine. Configure attributes in the editor to tune behavior.

code: |
  // JavaScript code here...
```

### 2.2 Attributes Declaration

**Number attributes:**
```yaml
  attributes:
    moveSpeed:
      name: "Move Speed"
      type: "number"
      default: 12
    punchRange:
      name: "Punch Range"
      type: "number"
      default: 3
      min: 0
      max: 100
    orbitRadius:
      name: "Orbit Radius"
      type: "number"
      default: 7
      min: 0
      max: 100
```

**String attributes:**
```yaml
    orbitTarget:
      name: "Orbit Target Name"
      type: "string"
      default: ""
    textureName:
      name: "Texture Asset Name"
      type: "string"
      default: ""
```

**Asset attributes (resolved to AssetRef objects):**
```yaml
    playerModel:
      name: "Player Model"
      type: "modelAsset"
    footstepSound:
      name: "Footstep Sound"
      type: "audioAsset"
    punchSound:
      name: "Punch Sound"
      type: "audioAsset"
    ambientMusic:
      name: "Ambient Music"
      type: "audioAsset"
```

**Empty attributes:**
```yaml
  attributes: {}
```

### 2.3 Throttle Config (Optional)

```yaml
  throttleConfig:
    throttlePriority: "MEDIUM"
    enableFrustumCulling: true
    enableDistanceThrottling: true
    requiresConsistentUpdates: false
```

### 2.4 Behavior Lifecycle Methods

```javascript
// === INIT (called once when behavior loads) ===
// IMPORTANT: `game` param is deprecated — use `this.erth`
let game;
let store;

this.init = function(_game) {
  game = _game;
  store = this.erth.store;
  // Pre-allocate reusable objects here (NOT in update)
  this.velocity = new THREE.Vector3();
  this.tempVec = new THREE.Vector3();
  this.raycaster = new THREE.Raycaster();
};

// === ON START (called after init, scene is ready) ===
this.onStart = function() {
  // Safe to load assets, access scene objects
  this.loadPlayerModel();
  this.setupAudio();
};

// === UPDATE (called every frame) ===
this.update = function(deltaTime) {
  if (!store) return;
  // Game logic here
  this.gameObject.position.x += this.velocity.x * deltaTime;
};

// === FIXED UPDATE (for physics, called at fixed rate) ===
this.fixedUpdate = function(deltaTime) {
  // Physics calculations
};

// === ON EVENT (receive messages from other behaviors) ===
this.onEvent = function(msg, data) {
  if (msg === "pfs_respawn") {
    // Reset state
  }
};

// === DISPOSE (cleanup when behavior is removed) ===
this.dispose = function() {
  if (this.shadow) {
    this.shadow.geometry.dispose();
    this.shadow.material.dispose();
  }
  store = null;
  game = null;
};

// === ON STOP (called before dispose) ===
this.onStop = function() {
  this.dispose();
};

// === EDITOR CALLBACKS (rendering only, no physics/input) ===
this.onEditorAdded = function(editor) {
  // Build preview geometry
};

this.onEditorUpdate = function() {
  // Animate preview
};

this.onEditorDispose = function() {
  // Clean up preview
};
```

---

## 3. Common Code Patterns

### 3.1 Accessing GameObjects

```javascript
// Current object (ALWAYS use this.gameObject, NOT this.target)
const obj = this.gameObject;

// Raw Three.js object (only when needed)
const three = this.gameObject._internal.three;

// Position/rotation
this.gameObject.position.set(x, y, z);
this.gameObject._internal.three.rotation.set(0, 0, 0);
this.gameObject._internal.three.rotateY(yawAngle);
this.gameObject._internal.three.rotateX(pitch);
this.gameObject._internal.three.rotateZ(roll);
this.gameObject.translateZ(-speed);

// Find objects in scene
let obj = game.scene.getObjectByName("PlayerAircraft");
game.scene.traverse(function(child) {
  if (child.name === targetName) { /* found */ }
});
```

### 3.2 Store (Inter-Behavior Communication)

```javascript
// Write state
this.erth.store.set('pfs_ui_state', 'start');
this.erth.store.set('pfs_phys_speed', currentSpeed);
this.erth.store.set('sv_fireBullet', {
  origin: pos.clone(),
  direction: dir.clone(),
  timestamp: Date.now()
});

// Read state
let uiState = this.erth.store.get('pfs_ui_state') || 'start';
let speed = this.erth.store.get('pfs_phys_speed') || 0;
let isActive = this.erth.store.get('pfs_input_turbo') || false;

// Delete state
this.erth.store.delete('sv_restart');

// Convention: prefix keys with game abbreviation
// pfs_ = pieter flight sim
// sv_  = survivor
// fsim_ = flight sim
```

### 3.3 Reading Attributes

```javascript
// In init or update
let moveSpeed = this.attributes.moveSpeed || 12;
let orbitRadius = this.attributes.orbitRadius || 7;
let playerModel = this.attributes.playerModel; // AssetRef for modelAsset

// Alternative (canonical)
this.moveSpeed = this.getAttribute("moveSpeed") ?? 6;
```

### 3.4 Asset Loading

**Models:**
```javascript
// Load and instantiate a model from attributes
const ref = this.attributes.playerModel;
if (!ref) return;

await this.erth.asset.model.preload(ref);
const gameObject = await this.erth.asset.model.createInstance(ref);
// gameObject is a GameObject, NOT Object3D
gameObject.scale.set(0.75, 0.75, 0.75);
gameObject.position.copy(this.gameObject._internal.three.position);
await this.erth.scene.addObject(gameObject); // top-level
await this.erth.scene.addObject(gameObject, this.gameObject); // as child
```

**Textures/Images:**
```javascript
const ref = await this.erth.asset.image.findByName("EarthTex");
if (ref) {
  const tex = await this.erth.asset.image.createTexture(ref);
  target.material.map = tex;
  target.material.needsUpdate = true;
}
```

**Audio:**
```javascript
// Audio attributes are AssetRef objects — resolve to URL first
const ref = this.attributes.footstepSound;
if (ref) {
  const url = await this.erth.asset.audio.getUrl(ref);
  const audio = new Audio(url);
  audio.volume = 0.5;
  audio.play().catch(function(){});
}
```

### 3.5 Procedural Geometry (Three.js Primitives)

```javascript
// ALWAYS use MeshStandardNodeMaterial (not MeshStandardMaterial)
const bodyMat = new THREE.MeshStandardNodeMaterial({ color: 0x3388cc });
const wingMat = new THREE.MeshStandardNodeMaterial({ color: 0x224466 });

// Common geometries
const bodyGeo = new THREE.CylinderGeometry(0.4, 0.3, 3.5, 8);
const wingGeo = new THREE.BoxGeometry(6, 0.07, 0.9);
const cockpitGeo = new THREE.SphereGeometry(0.35, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
const circleGeo = new THREE.CircleGeometry(0.5, 16);

// Create mesh helper pattern
function makeMesh(geo, mat) {
  const m = new THREE.Mesh(geo, mat);
  m.userData = m.userData || {};
  m.userData.isRuntimeOnly = true;
  m.castShadow = true;
  m.receiveShadow = true;
  allMeshes.push(m);
  allGeometries.push(geo);
  allMaterials.push(mat);
  return m;
}

// Basic material (for shadows, overlays)
const circleMat = new THREE.MeshBasicNodeMaterial({
  color: 0x000000,
  transparent: true,
  opacity: 0.3
});
```

### 3.6 Runtime-Only Objects

```javascript
// Mark objects that should not be serialized/saved
function markRuntimeOnly(obj) {
  if (!obj) return obj;
  obj.userData = obj.userData || {};
  obj.userData.isRuntimeOnly = true;
  if (obj.children) {
    for (let i = 0; i < obj.children.length; i++) {
      markRuntimeOnly(obj.children[i]);
    }
  }
  return obj;
}
```

### 3.7 Dispose / Cleanup Pattern

```javascript
// Traverse and dispose all resources
function disposeObjectTree(obj) {
  if (!obj) return;
  obj.traverse(function(child) {
    if (child.geometry && child.geometry.dispose) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        for (let i = 0; i < child.material.length; i++) {
          if (child.material[i] && child.material[i].dispose) child.material[i].dispose();
        }
      } else if (child.material.dispose) {
        child.material.dispose();
      }
    }
  });
  if (obj.parent) obj.parent.remove(obj);
}

// UIKit cleanup
this.dispose = function() {
  if (rootRegistered) {
    try { UIKitPointerEvents.unregisterRoot(root); } catch(e) {}
    rootRegistered = false;
  }
  if (root) {
    root.removeFromParent();
    if (root.dispose) root.dispose();
    root = null;
  }
  try { UIKitPointerEvents.deinitialize(); } catch(e) {}
  store = null;
  game = null;
};
```

---

## 4. UIKit Patterns

### 4.1 Fullscreen Root Setup

```javascript
// Create root — MUST use renderer
root = new UIKit.Fullscreen(game.renderer, {
  pointerEvents: "none",        // or "auto" for interactive
  flexDirection: "column",
  justifyContent: "space-between",
  paddingTop: 16,
  paddingBottom: 16,
  visibility: "visible"
});

// Parent to uiCamera (deferred — may not be ready in init)
if (game.uiCamera) {
  game.uiCamera.add(root);
  rootParented = true;
}

// Retry in update if not ready
this.update = function(deltaTime) {
  if (!rootParented && game.uiCamera) {
    game.uiCamera.add(root);
    rootParented = true;
  }
};

// Initialize pointer events
UIKitPointerEvents.initialize(game);
UIKitPointerEvents.registerRoot(root);

// Update every frame for interaction
UIKitPointerEvents.update(deltaTime);
```

### 4.2 Container

```javascript
const panel = new UIKit.Container({
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: 420,
  height: 200,
  padding: 32,
  gap: 12,
  borderRadius: 16,
  backgroundColor: 0x16213e,
  backgroundOpacity: 0.95,
  visibility: "visible"
});

// With border
const bordered = new UIKit.Container({
  width: 240,
  height: 160,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  borderRadius: 10,
  border: { width: 2, color: "#00ff88" },
  padding: 12,
  visibility: "visible"
});

// Transparent container
const overlay = new UIKit.Container({
  flexDirection: "row",
  justifyContent: "space-between",
  width: 600,
  height: 60,
  backgroundOpacity: 0,
  visibility: "visible"
});

// Anchored positioning
const topRight = new UIKit.Container({
  position: { x: -200, y: 20 },
  width: 180,
  height: 50,
  anchorX: "right",
  visibility: "visible"
});

const bottomRight = new UIKit.Container({
  position: { x: -20, y: -20 },
  width: 220,
  height: 70,
  anchorX: "right",
  anchorY: "bottom",
  visibility: "visible"
});
```

### 4.3 Text

```javascript
const label = new UIKit.Text({
  text: "SPEED: 0 kts",
  fontSize: 20,
  fontWeight: "bold",
  color: "#FFFFFF",
  letterSpacing: 2,
  visibility: "visible"
});

// With content key (alternative)
const alt = new UIKit.Text({
  content: "Score: 0",
  fontSize: 18,
  color: "#ffd700",
  fontFamily: "Orbitron, monospace",
  visibility: "visible"
});

// Update text
label.setProperties({ text: "SPEED: " + speed + " kts" });
```

### 4.4 Input

```javascript
const nameInput = new UIKit.Input({
  width: 300,
  height: 48,
  placeholder: "Type your callsign...",
  fontSize: 20,
  color: 0xffffff,
  backgroundColor: "rgba(28, 35, 66, 0.98)",
  borderRadius: 8,
  borderWidth: 2,
  borderColor: "#4F6B9A",
  textAlign: "center",
  onValueChange: function(value) {
    if (typeof value === "string") {
      playerName = value;
    }
  },
  visibility: "visible"
});
```

### 4.5 Interactive Button

```javascript
const playButton = new UIKit.Container({
  width: 300,
  height: 52,
  borderRadius: 8,
  backgroundColor: 0x0066cc,
  justifyContent: "center",
  alignItems: "center",
  pointerEvents: "auto",
  hover: { backgroundColor: 0x0088ff },
  onClick: function() {
    beginPlay();
  },
  visibility: "visible"
});

const playLabel = new UIKit.Text({
  text: "PLAY",
  fontSize: 22,
  fontWeight: "bold",
  color: "#FFFFFF",
  letterSpacing: 2,
  visibility: "visible"
});
playButton.add(playLabel);
```

### 4.6 Visibility Control

```javascript
// CORRECT: Use setProperties
root.setProperties({ visibility: "visible" });
root.setProperties({ visibility: "hidden" });

// Update element text + visibility together
errorText.setProperties({ text: "Error message", visibility: "visible" });
errorText.setProperties({ text: "", visibility: "hidden" });

// Health bar width
healthBarFill.setProperties({ width: (healthPct / 100) * 200 });

// WRONG: .visible = false (has NO effect on UIKit)
// WRONG: UIKit.Block (does NOT exist, use UIKit.Container)
// WRONG: element.set() (does NOT exist, use setProperties)
```

### 4.7 Valid UIKit Classes

```
UIKit.Fullscreen  - Full-viewport root container
UIKit.Container   - Flex layout container (NOT UIKit.Block)
UIKit.Text        - Text label
UIKit.Image       - Image display
UIKit.Svg         - SVG display
UIKit.Input       - Text input field
UIKit.Root        - Alternative root container
```

---

## 5. Multiplayer Patterns

### 5.1 Colyseus Room Access

```javascript
let mp = null; // game.multiplayerState

this.init = function(_game) {
  game = _game;
  mp = game.multiplayerState || null;
};
```

### 5.2 Player Lifecycle Listeners

```javascript
// Listen for players joining/leaving
playerAddedToken = mp.room.state.players.onAdd(function(player, sessionId) {
  if (isLocalPlayer(sessionId)) return;
  createRemotePlayer(sessionId, player);
});

playerRemovedToken = mp.room.state.players.onRemove(function(player, sessionId) {
  removeRemotePlayerBySessionId(sessionId);
});

// Data change listener
playerDataChangedToken = mp.room.state.players.onChange(function(player, sessionId) {
  updateRemotePlayer(sessionId, player);
});
```

### 5.3 Outbound Sync (10Hz)

```javascript
const SYNC_INTERVAL = 0.1; // 10Hz
let syncTimer = 0;

this.update = function(deltaTime) {
  syncTimer += deltaTime;
  if (syncTimer >= SYNC_INTERVAL) {
    syncTimer = 0;

    mp.room.send("playerUpdate", {
      username: store.get("pfs_ui_username") || "Pilot",
      vehicleType: store.get("pfs_vehicle_type") || "plane",
      x: this.gameObject.position.x,
      y: this.gameObject.position.y,
      z: this.gameObject.position.z,
      rx: this.gameObject._internal.three.rotation.x,
      ry: this.gameObject._internal.three.rotation.y,
      rz: this.gameObject._internal.three.rotation.z,
      health: store.get("pfs_combat_health") || 100
    });
  }
};
```

### 5.4 Remote Player Mesh (Procedural)

```javascript
function createRemotePlayer(sessionId, playerData) {
  let group = new THREE.Group();
  markRuntimeOnly(group);
  group.name = "Remote_" + sessionId;

  // Build vehicle mesh for remote player
  buildRemoteVehicle(group, playerData.vehicleType);

  // Add to scene
  game.scene.add(group);
  remotePlayers.set(sessionId, { group: group, data: playerData });
}

function removeRemotePlayerBySessionId(sessionId) {
  let remote = remotePlayers.get(sessionId);
  if (!remote) return;
  if (remote.group) {
    remote.group.traverse(function(child) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    if (remote.group.parent) remote.group.parent.remove(remote.group);
  }
  remotePlayers.delete(sessionId);
}
```

---

## 6. Physics Patterns

### 6.1 Kinematic Physics Configuration

```javascript
if (this.gameObject && this.gameObject.physics) {
  this.gameObject.physics.configure({
    enabled: true,
    bodyType: 'kinematic',
    shape: 'capsule',
    shapeDimensions: { radius: 0.4, height: 1.6 },
    rotationLock: { x: true, z: true },
  });
}
```

### 6.2 Camera-Relative Movement (Canonical)

```javascript
const localMove = new THREE.Vector3();
const worldMove = new THREE.Vector3();
const cameraForward = new THREE.Vector3();
const cameraRight = new THREE.Vector3();

this.fixedUpdate = function(deltaTime) {
  const motion = game.inputManager.getMotion("move");
  if (!motion) return;

  localMove.set(motion.x ?? 0, 0, motion.y ?? 0);
  if (localMove.lengthSq() === 0) return;

  const step = Math.min(deltaTime, 0.1);

  cameraForward.set(0, 0, -1).applyQuaternion(game.camera.quaternion);
  cameraForward.y = 0;
  if (cameraForward.lengthSq() === 0) return;
  cameraForward.normalize();

  cameraRight.crossVectors(cameraForward, this.gameObject.up).normalize();

  worldMove
    .copy(cameraRight)
    .multiplyScalar(localMove.x)
    .addScaledVector(cameraForward, localMove.z);

  if (worldMove.lengthSq() === 0) return;
  worldMove.normalize().multiplyScalar(this.moveSpeed * step);
  this.gameObject.position.add(worldMove);
};
```

### 6.3 Flight Physics (Custom Kinematic)

```javascript
// Throttle management
if (keyW) targetThrottle = Math.min(1.0, targetThrottle + 0.02);
if (keyS) targetThrottle = Math.max(0, targetThrottle - 0.02);
throttle += (targetThrottle - throttle) * THROTTLE_RESPONSE;

// Thrust and drag
let thrust = engineOn ? (idleThrust + throttle * (MAX_THRUST - idleThrust)) : 0;
let drag = currentSpeed * currentSpeed * DRAG_COEFFICIENT;
let netAccel = (thrust - drag) * dt * 60;
currentSpeed = Math.max(minSpeed, Math.min(maxSpeed, currentSpeed + netAccel));

// Apply rotations (order matters: yaw, pitch, roll)
this.gameObject.rotation.set(0, 0, 0);
this.gameObject.rotateY(yawAngle);
this.gameObject.rotateX(currentPitch);
this.gameObject.rotateZ(currentRoll);

// Move forward
this.gameObject.translateZ(-currentSpeed);
```

---

## 7. Input Patterns

### 7.1 InputManager (Preferred)

```javascript
const forwardMotion = game.inputManager.getMotion('forward') || 0;
const lateralMotion = game.inputManager.getMotion('lateral') || 0;
const motion = game.inputManager.getMotion("move");
// motion = { x: lateralMotion, y: forwardMotion }
```

### 7.2 Keyboard via Store

```javascript
// Write in input controller behavior
document.addEventListener('keydown', function(e) {
  switch (e.code) {
    case 'KeyW': store.set('pfs_input_throttleUp', true); break;
    case 'KeyS': store.set('pfs_input_throttleDown', true); break;
    case 'ArrowLeft': store.set('pfs_input_rollLeft', true); break;
    case 'ArrowRight': store.set('pfs_input_rollRight', true); break;
  }
});

// Read in physics behavior
let keyW = store.get('pfs_input_throttleUp') || false;
```

### 7.3 Mouse Aim

```javascript
this.mousePos = { x: 0, y: 0 };
this.raycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const intersection = new THREE.Vector3();

document.addEventListener('pointermove', function(e) {
  this.mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
  this.mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;
}.bind(this));

// In update:
this.raycaster.setFromCamera(this.mousePos, game.camera);
this.raycaster.ray.intersectPlane(groundPlane, intersection);
```

---

## 8. Complete Stemscript Template (Flight Sim)

```stemscript
# =============================================================================
# Game Title
# Description: ...
# =============================================================================

project title "Game Title"

# =============================================================================
# Step 1: Import Assets
# =============================================================================
import audio EngineSFX "Engine sound effect"
import image name=Icon1 filepath="assets/icon1.svg" comment="UI icon"

# =============================================================================
# Step 2: Import Behaviors
# =============================================================================
import behavior "Game Controller" "behaviors/gameController.yaml"
import behavior "Game HUD" "behaviors/gameHUD.yaml"
import behavior "Game Camera" "behaviors/gameCamera.yaml"

# =============================================================================
# Scene Settings
# =============================================================================
scene background type=Gradient gradient="linear-gradient(0deg, #4a7c4e 0%, #87CEEB 100%)"
scene lighting ambient={color:"#ffffff",intensity:0.3} hemisphere={skyColor:"#87CEEB",groundColor:"#4a7c4e",intensity:0.5} shadows={enabled:true}
scene fog type=linear color=#87CEEB near=200 far=5000
render settings useShadows=true shadowMapType=2
light "Directional Light" intensity=1.8 color=#fff5e0 castShadow=true shadowMapSize=2048

# =============================================================================
# Camera
# =============================================================================
camera "DefaultCamera" cameraType=NONE fov=60 near=0.1 far=50000

# =============================================================================
# Game Settings
# =============================================================================
game settings enabled=true showHUD=false

# =============================================================================
# World Objects
# =============================================================================
add group name="World" position=0,0,0
add plane name="Ground" position=0,0,0 scale=16000,16000,1 rotation=-90,0,0
material Ground color=#5f6f63 roughness=1 metalness=0

# =============================================================================
# Player
# =============================================================================
add group name="Player" position=0,3,0
update "Player" tag=Player

# =============================================================================
# GameManager (holds UI + multiplayer behaviors)
# =============================================================================
add group name="GameManager" position=0,0,0

# =============================================================================
# Attach Behaviors
# =============================================================================
behavior attach Player behaviorId=game.controller
behavior attach Player behaviorId=game.camera
behavior attach "GameManager" behaviorId=game.hud

# =============================================================================
# Touch Controls
# =============================================================================
behavior attach "Default Scene" behaviorId=touchControls config={mobileEnabled:true,tabletEnabled:true,desktopEnabled:false,...}
```

---

## 9. Key Rules Reminder

1. **`this.target` is DEPRECATED** -- use `this.gameObject`
2. **`game` param is DEPRECATED** -- use `this.erth` (store game via closure `let game; ... game = _game;`)
3. **NodeMaterial only** -- `MeshStandardNodeMaterial`, `MeshBasicNodeMaterial`, never legacy
4. **No GLSL** -- TSL patterns only if custom shading needed
5. **UIKit.Container** -- NOT `UIKit.Block` (does not exist)
6. **`.setProperties({})`** -- NOT `.set()` for UIKit updates
7. **`visibility: 'hidden'/'visible'`** -- NOT `.visible = false` for UIKit
8. **Camera `near < 1`** when using UIKit (recommended `0.1`)
9. **`userData.isRuntimeOnly = true`** on procedural objects
10. **Pre-allocate** Vector3/Quaternion/Raycaster in `init()`, never in `update()`
11. **`erth.scene.addObject(obj, parent)`** -- both must be `GameObject`
12. **Audio AssetRef** must be resolved via `this.erth.asset.audio.getUrl(ref)` first
13. **Store key prefix** -- use consistent game prefix (e.g., `pfs_`, `sv_`)
14. **Dispose everything** -- geometries, materials, textures, audio, UIKit roots
