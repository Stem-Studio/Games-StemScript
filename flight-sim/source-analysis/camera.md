# Camera System - fly.pieter.com Source Analysis

## Camera Setup (L~1300)

```js
const camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 10000);
```

- **FOV:** 85 degrees
- **Near:** 0.1
- **Far:** 10000
- **Aspect:** window.innerWidth / window.innerHeight

## Initial Camera Position (L474-476)

```js
const INITIAL_CAMERA_X = -600;
const INITIAL_CAMERA_Y = 100;
const INITIAL_CAMERA_Z = 100;
```

## Cockpit Offset (L2900)

```js
const COCKPIT_OFFSET = new THREE.Vector3(0, 1.0, -0.6);
// Changed from (0, 0.8, -0.8)
```

---

## FOV Constants (L~1280-1290)

```js
const normalFOV = 75;                     // Base FOV (stored, but camera starts at 85)
const MIN_FOV = normalFOV;                // 75 - Base FOV when stationary
const MAX_FOV_INCREASE = 5;               // Reduced - minimal zoom at speed
const TURBO_EXTRA_FOV = 5;                // Reduced - minimal turbo zoom
const TURBO_SPEED_MULTIPLIER = 5;         // 50% speed boost (note: naming mismatch)
const TURBO_FOV_INCREASE = 15;            // Increase FOV by 15 degrees during turbo
```

---

## Third-Person Camera (L~5990-6010)

```js
if (isThirdPerson) {
    const idealOffset = new THREE.Vector3(
        Math.sin(mouseX) * 10,             // Orbit horizontal (10 unit radius)
        Math.max(2 + Math.sin(mouseY) * 5, 1),  // Height: 1-7 units above
        Math.cos(mouseX) * 10              // Orbit depth (10 unit radius)
    ).applyMatrix4(player.matrixWorld);    // Transform to player space

    camera.position.lerp(idealOffset, 0.1);  // Smooth follow (lerp factor 0.1)
    camera.position.y = Math.max(camera.position.y, GROUND_LEVEL + 0.5);  // Don't go below ground
    camera.lookAt(player.position.clone().add(new THREE.Vector3(0, 1, 0)));  // Look at player + 1 unit up

    crosshairGroup.visible = false;         // Hide crosshair in third person
}
```

**Key values:**
- Orbit radius: 10 units
- Height range: 1 to 7 units above player
- Lerp factor: 0.1 (smooth)
- Min Y: GROUND_LEVEL + 0.5
- Look target: player position + (0, 1, 0)
- Mouse orbit: mouseX controls horizontal angle, mouseY controls elevation

---

## First-Person / Cockpit Camera (L~6005-6040)

```js
else {
    const cockpitPos = player.localToWorld(COCKPIT_OFFSET.clone());
    camera.position.copy(cockpitPos);          // Exact cockpit position
    camera.quaternion.copy(player.quaternion);  // Match player rotation exactly

    // Head movement effects
    const headBobAmount = 0.05;
    const headTiltAmount = -0.05;

    // Head bob based on speed
    const speedFactor = currentSpeed / maxSpeed;
    const bobOffset = Math.sin(Date.now() * 0.1 * speedFactor) * headBobAmount * speedFactor;
    camera.position.y += bobOffset;

    // Head tilt during turns
    let tiltAngle = 0;
    // tiltAngle based on roll input

    crosshairGroup.visible = true;             // Show crosshair in first person
}
```

---

## Look Behind Camera (L648-655)

```js
const rearOffset = new THREE.Vector3(0, 2, -2);       // Slightly above and behind cockpit
const lookBehindOffset = new THREE.Vector3(0, 2, 20); // Look 20 units behind
const lookAtPoint = player.position.clone().add(lookBehindOffset);
```

---

## Camera Toggle

- **Key:** `KeyV` toggles `isThirdPerson`
- Default: third person (isThirdPerson = true)

---

## Mouse Input for Camera Orbit

```js
const MOUSE_TIMEOUT = 3000;  // L2898 - Time in ms before camera starts returning to center
// mouseX, mouseY control orbital camera position in third person
// When mouse is idle for MOUSE_TIMEOUT, camera drifts back to default position
```

---

## FOV Dynamic Adjustment

```js
// FOV increases slightly with speed
// Additional FOV increase during turbo (ShiftRight)
// camera.fov = targetFov;
// camera.updateProjectionMatrix();
```

---

## Sun Light Following Camera

```js
sunLight.position.set(
    player.position.x + 100,
    player.position.y + 100,
    player.position.z + 50
);
sunLight.target.position.set(player.position.x, GROUND_LEVEL, player.position.z);
```

---

## Gear Shake Effect

```js
const GEAR_SHAKE_AMOUNT = 0.015;
// When landing gear is down at speed, camera position gets random shake offset
```
