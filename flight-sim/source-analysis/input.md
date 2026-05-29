# Input Handling - fly.pieter.com Source Analysis

## Keyboard Input

### Key State Tracking
```js
let keys = {};
window.addEventListener('keydown', (event) => {
    keys[event.code] = true;
    if (event.code === 'AltLeft') keys['ShiftRight'] = true;  // Alt = Turbo
});
window.addEventListener('keyup', (event) => {
    keys[event.code] = false;
    if (event.code === 'AltLeft') keys['ShiftRight'] = false;
});
```

---

## Key Bindings

### Flight Controls (All Aircraft)
| Key | Action |
|-----|--------|
| `KeyW` | Throttle up / Accelerate |
| `KeyS` | Throttle down / Decelerate (8x faster than accel) |
| `ShiftRight` or `AltLeft` | Turbo boost |
| `ArrowUp` | Pitch up |
| `ArrowDown` | Pitch down |
| `ArrowLeft` or `KeyA` | Roll/Bank left |
| `ArrowRight` or `KeyD` | Roll/Bank right |
| `Space` | Fire missile |

### Vehicle-Specific Controls
| Key | Vehicle | Action |
|-----|---------|--------|
| `ArrowUp` | Tank | Raise turret |
| `ArrowDown` | Tank | Lower turret |
| `KeyW`/`KeyS` | Tank | Forward/Reverse |

### System Keys
| Key | Action |
|-----|--------|
| `KeyV` | Toggle first-person / third-person camera |
| `KeyE` | Toggle engine on/off |
| `KeyG` | Toggle landing gear |
| `KeyB` | Toggle speedbrakes |
| `KeyT` | Open chat input (disables flight controls) |
| `Tab` | Show/hide leaderboard (held) |
| `Escape` | Toggle pitch debug logging |
| `Enter` | Confirm vehicle selection / Send chat |

---

## Mouse Input

### Pointer Lock
```js
// requestPointerLock() on click
// exitPointerLock() on escape
```

### Mouse Movement (Camera Orbit)
```js
// mouseX, mouseY track mouse position for third-person camera orbit
// MOUSE_TIMEOUT = 3000ms - camera returns to center after 3s idle
```

---

## Touch Input

### Joysticks
```js
// Left joystick: Roll/Yaw control
// - leftJoystickData.x < -0.3: Roll left
// - leftJoystickData.x > 0.3: Roll right
// - leftJoystickData.y > 0.3: Pitch up
// - leftJoystickData.y < -0.3: Pitch down

// Right joystick: Throttle control
// - rightJoystickData.y > 0.3: Throttle up
// - rightJoystickData.y < -0.3: Throttle down
```

### Touch Fire
```js
function handleTouchStart(event) {
    // Tap anywhere (not on joysticks) = Space (fire)
    if (!event.target.closest('#leftJoystick') &&
        !event.target.closest('#rightJoystick')) {
        keys['Space'] = true;
    }
}

function handleTouchEnd(event) {
    if (!event.target.closest('#leftJoystick') &&
        !event.target.closest('#rightJoystick')) {
        keys['Space'] = false;
        if (vehicleName === 'a10') {
            stopA10GunSound();
        }
    }
}
```

---

## Gamepad Input (L~1100-1155)

```js
// Gamepad detection
window.addEventListener('gamepadconnected', (event) => { ... });

// Polling in animation loop:
const gp = navigator.getGamepads()[gamepad.index];

// Left stick X axis (turning) - axis 0, deadzone 0.1
keys['ArrowLeft'] = gp.axes[0] < -0.1;
keys['ArrowRight'] = gp.axes[0] > 0.1;

// Left stick Y axis (pitch) - axis 1, deadzone 0.1
keys['ArrowUp'] = gp.axes[1] < -0.1;
keys['ArrowDown'] = gp.axes[1] > 0.1;

// Buttons:
keys['Space'] = gp.buttons[0].pressed;          // A button - shooting
keys['KeyW'] = gp.buttons[7].pressed;           // RT - throttle up
keys['KeyS'] = gp.buttons[6].pressed;           // LT - throttle down
keys['KeyV'] = gp.buttons[8].pressed;           // SELECT - camera toggle
keys['ShiftRight'] = gp.buttons[1].pressed ||
                     gp.buttons[5].pressed;      // B or RB/R1 - turbo
keys['Enter'] = gp.buttons[9].pressed;          // START - enter/confirm
```

---

## Control Authority Gating

Flight controls are gated by `skipControls` flag:
```js
let skipControls = false;

// Set true when: chat is open, certain UI interactions
// When true: no flight input processed
```

---

## Engine Toggle (KeyE)
```js
if (event.code === 'KeyE') {
    engineOn = !engineOn;
    playEngineToggleSound(engineOn);
    showMessage(engineOn ? 'Engine ON' : 'Engine OFF - gliding', true);
}
```

---

## Mobile Auto-Features
```js
if (isMobileDevice) {
    // Auto extend landing gear on approach
    // Touch-optimized joystick layout
    // Simplified control scheme
}
```
