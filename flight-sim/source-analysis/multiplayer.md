# Multiplayer System - fly.pieter.com Source Analysis

## WebSocket Connection

```js
const WS_SERVER = 'wss://fly.pieter.com:8080';     // L1356
socket = new WebSocket(WS_SERVER);                   // L9347
```

---

## Constants

```js
const BROADCAST_INTERVAL = 0.05;           // L502 - 50ms between broadcasts (20 Hz)
const PLAYER_TIMEOUT = 10000;              // L539 - Remove players after 10 seconds no updates
```

---

## Broadcast Position (L7484)

```js
function broadcastPosition() {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    const currentTime = Date.now();
    if (currentTime - lastPositionUpdate < BROADCAST_INTERVAL * 1000) return;  // Rate limit

    const positionData = {
        x: Math.round(player.position.x * 100) / 100,
        y: Math.round(player.position.y * 100) / 100,
        z: Math.round(player.position.z * 100) / 100,
        rotationX: Math.round(player.rotation.x * 100) / 100,
        rotationY: Math.round(player.rotation.y * 100) / 100,
        rotationZ: Math.round(player.rotation.z * 100) / 100,
        speed: Math.round(currentSpeed * 1000) / 1000,
        heading: currentHeading,
        verticalSpeed: Math.round(currentVerticalSpeed * 100) / 100,
        timestamp: currentTime
    };

    const message = {
        type: 'position',
        planeId: selfPlaneId,
        username: selfUsername,
        data: positionData,
        vehicle: vehicleName,
        health: currentHealth,
        score: score,
        kills: currentKills,
        deaths: currentDeaths,
        countryFlagEmoji: selfCountryFlagEmoji,
        verifyToken: verifyToken
    };

    socket.send(JSON.stringify(message));
    lastPositionUpdate = currentTime;
}
```

---

## Message Types

### Position Update
```js
{ type: 'position', planeId, username, data: {...}, vehicle, health, score, kills, deaths, countryFlagEmoji, verifyToken }
```

### Hit Notification
```js
{ type: 'hit', planeId, targetPlaneId, damage, isKill, username, timestamp, verifyToken }
```

### Crash Notification
```js
{ type: 'crash', planeId, username, verb, timestamp, verifyToken }
```

### Chat Message
```js
// Chat messages sent via socket.send(JSON.stringify(chatMessage))
```

---

## Incoming Message Handler (socket.onmessage, L9359)

```js
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // Process chat messages
    if (data.chats !== undefined && data.chats.length > 0) {
        data.chats.forEach(message => handleIncomingChatData(message));
    }

    // Sync time
    if (data.time !== undefined) {
        const timeDifference = Math.abs(gameTime - data.time);
        if (timeDifference > 100) {
            gameTime = data.time;            // Sync game time from server
        }
    }

    // Process player positions
    // Update otherPlayers map with position/rotation/health/score
};
```

---

## Other Player Management

### Data Structure
```js
const otherPlayers = new Map();            // planeId -> THREE.Group

// Each other player stores:
otherPlane.userData.targetX / targetY / targetZ     // Target position for interpolation
otherPlane.userData.targetRotationX / Y / Z         // Target rotation
otherPlane.userData.useEulerRotation                // Human vs bot rotation mode
otherPlane.userData.hasReceivedPosition              // Has received at least one update
otherPlane.userData.lastUpdate                       // Last update timestamp
otherPlane.userData.health                           // Player health
otherPlane.userData.deaths                           // Death count
otherPlane.userData.roll                             // Roll angle (for heading-based rotation)
```

### Interpolation (interpolateMoveOtherPlanes, L~7600)

```js
function interpolateMoveOtherPlanes() {
    otherPlayers.forEach((plane, planeId) => {
        if (!plane.userData.hasReceivedPosition) return;

        // Smooth exponential interpolation
        // Higher = snappier, lower = smoother. 15 gives ~150ms smooth catchup
        const lerpFactor = 1 - Math.exp(-15 * deltaTime);

        // Lerp position
        plane.position.x += (plane.userData.targetX - plane.position.x) * lerpFactor;
        plane.position.y += (plane.userData.targetY - plane.position.y) * lerpFactor;
        plane.position.z += (plane.userData.targetZ - plane.position.z) * lerpFactor;

        // Lerp rotation
        if (plane.userData.useEulerRotation) {
            // Human players: lerp euler angles
            plane.rotation.x += (plane.userData.targetRotationX - plane.rotation.x) * lerpFactor;
            plane.rotation.y += (plane.userData.targetRotationY - plane.rotation.y) * lerpFactor;
            plane.rotation.z += (plane.userData.targetRotationZ - plane.rotation.z) * lerpFactor;
        } else {
            // Bot players: heading-based rotation
            const headingRad = (plane.userData.roll || 0) * Math.PI / 180;
            plane.rotation.set(0, 0, 0);
            plane.rotateY(-headingRad);
        }
    });
}
```

---

## Stale Player Cleanup (L~7560)

```js
function cleanupStalePlayers() {
    const currentTime = Date.now();
    otherPlayers.forEach((plane, planeId) => {
        if (currentTime - plane.userData.lastUpdate > PLAYER_TIMEOUT) {  // 10 seconds
            console.log(`Removing stale player ${planeId}`);
            removeOtherPlayerAudio(plane);
            scene.remove(plane);
            otherPlayers.delete(planeId);
        }
    });
}

setInterval(cleanupStalePlayers, 5000);    // Check every 5 seconds
```

---

## Runway Fade Effect (L~7170)

```js
const RUNWAY_FADE_START = 50;              // Distance from runway where fading begins
const RUNWAY_FADE_DISTANCE = 100;          // Distance where players fully appear

// Other players near runway fade in/out to prevent spawn camping visibility
const fadeRatio = (distance - RUNWAY_FADE_START) / (RUNWAY_FADE_DISTANCE - RUNWAY_FADE_START);
```

---

## Player ID Generation

```js
function generatePlaneId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}
```

---

## Round System

```js
const ROUND_DURATION = 15 * 60;           // L451 - 15 minutes per round
let roundTimeElapsed;
let roundTimeRemaining;
```
