# HUD Layout - fly.pieter.com Source Analysis

## HUD Status

The canvas-based HUD is **disabled** in the current version:
```js
function updateHUD() {
    // disable HUD for now
    return false;
    // ...
}
```

When active, the HUD is only shown in first-person mode (hidden in third person).

---

## HUD Canvas Setup

```js
const hud = document.getElementById('hud');
const hudCtx = hud.getContext('2d');

hud.width = hud.clientWidth;
hud.height = hud.clientHeight;

// HUD style
hudCtx.strokeStyle = '#0f0';              // Green
hudCtx.fillStyle = '#0f0';
hudCtx.lineWidth = 2;                     // Reduced from 4
hudCtx.font = '12px monospace';           // Reduced from 24px
hudCtx.globalAlpha = 1;
```

---

## HUD Elements (when enabled)

### Crosshair
```js
const centerX = hud.width / 2;
const centerY = hud.height / 2;

hudCtx.arc(centerX, centerY, 2.5, 0, Math.PI * 2);  // Small center circle
hudCtx.moveTo(centerX - 30, centerY);                 // Horizontal line
hudCtx.lineTo(centerX + 30, centerY);
hudCtx.moveTo(centerX, centerY - 30);                 // Vertical line
hudCtx.lineTo(centerX, centerY + 30);
```

### Speed / Altitude / Heading
- Speed in knots displayed
- Altitude above ground
- Heading in degrees

### Artificial Horizon
- Pitch and roll indicators

---

## 3D Crosshair (Always Active)

```js
crosshairGroup = new THREE.Group();

const crosshairMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    fog: false
});

// Vertical line
const verticalGeometry = new THREE.BoxGeometry(0.02, 0.3, 0.02);
crosshairGroup.add(new THREE.Mesh(verticalGeometry, crosshairMaterial));

// Horizontal line
const horizontalGeometry = new THREE.BoxGeometry(0.3, 0.02, 0.02);
crosshairGroup.add(new THREE.Mesh(horizontalGeometry, crosshairMaterial));

// Position in front of the plane
crosshairGroup.position.y = 1;          // Offset upward
crosshairGroup.position.z = -10;        // 10 units in front

// Added to player group
player.add(crosshairGroup);

// Visible only in first person (hidden in third person)
```

---

## Minimap/Radar (L542-546, L667-780)

### Constants
```js
const MINIMAP_SCALE = 0.02;
const MINIMAP_PLAYER_DOT_SIZE = 4;
const MINIMAP_OTHER_DOT_SIZE = 3;
const minimapSize = window.innerWidth <= 768 ? 100 : 150;  // Responsive
```

### Canvas Setup
```js
const minimapCanvas = document.getElementById('minimapCanvas');
const minimapCtx = minimapCanvas.getContext('2d');
```

### Drawing
```js
// Background: radial gradient (transparent center to semi-transparent edge)
const gradient = minimapCtx.createRadialGradient(0, 0, 0, 0, 0, minimapCanvas.width/2);

// Draw runway on radar
const runwayRelX = 0 - player.position.x;
const runwayRelZ = 0 - player.position.z;
const runwayMapX = centerX + runwayRelX * 0.1;
const runwayMapY = centerY + runwayRelZ * 0.1;
minimapCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
minimapCtx.fillRect(runwayMapX - 1, runwayMapY - 10, 2, 20);  // Thin vertical rectangle

// Draw carrier on radar
const carrierRelX = -600 - player.position.x;
const carrierRelZ = 0 - player.position.z;
const carrierMapX = centerX + carrierRelX * 0.1;
const carrierMapY = centerY + carrierRelZ * 0.1;
minimapCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
minimapCtx.fillRect(carrierMapX - 2, carrierMapY - 8, 4, 16);

// Draw self (always center)
minimapCtx.fillStyle = '#ffffff';
minimapCtx.arc(centerX, centerY, MINIMAP_PLAYER_DOT_SIZE, 0, Math.PI * 2);

// Draw other players
otherPlayers.forEach((otherPlane, planeId) => {
    const relX = otherPlane.position.x - player.position.x;
    const relZ = otherPlane.position.z - player.position.z;
    const mapX = centerX + relX * 0.3;   // Zoomed out a bit
    const mapY = centerY + relZ * 0.3;

    // Color based on health
    const health = otherPlane.userData.health || 100;
    // Green = healthy, Red = low health
});
```

### Radar Sweep
```js
let radarAngle = -Math.PI/2;
// Animated sweep line on the minimap
```

---

## HTML-Based HUD Elements

### Score Display
```js
const scoreDiv = document.getElementById('scoreDisplay');
// Shows current score, updated with shake animation on kills
```

### Speed/Altitude Display (DOM overlays)
```js
// Speed shown as "XXX kts"
// Altitude shown as "XXX ft"
// Vertical speed indicator
```

### Health Bar
- HTML div-based health bar
- Updates color based on health percentage

### Kill/Death Counter
```js
let currentDeaths = 0;
let currentKills = 0;
// Displayed in leaderboard
```

---

## In-Game Leaderboard (Three.js Canvas Texture)

```js
// ingameleaderboard rendered as canvas texture on a 3D plane
// Shows player names, kills, deaths
// Updated via updateLeaderboard()
```

---

## Message System

```js
function showMessage(text, isKill = false) {
    // Shows temporary messages at top of screen
    // Kill messages formatted with bold player names
    // Messages include escaped HTML for security
}
```
