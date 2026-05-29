# Audio System - fly.pieter.com Source Analysis

## Audio Context

```js
window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
```

---

## Engine Sound Setup

The engine sound system uses multiple oscillators layered together with filters.

### Engine Sound Object
```js
window.engineSound = {
    osc1: oscillator1,           // Primary tone
    osc2: oscillator2,           // Secondary harmonic
    osc3: oscillator3,           // Third harmonic
    gain1: gainNode1,            // Primary gain
    gain2: gainNode2,            // Secondary gain
    gain3: gainNode3,            // Third gain
    noise: noiseGain,            // Noise channel gain
    filter: biquadFilter         // Low-pass filter
};
```

### Oscillator Setup
```js
// Multiple oscillators created via audioCtx.createOscillator()
// Connected through gain nodes to destination
// Filter applied for tonal shaping
```

---

## Vehicle-Specific Sound Profiles

### Cessna / Default Aircraft
```js
// normalizedSpeed = sqrt((currentSpeed - minSpeed) / (maxSpeed - minSpeed))
// turboMultiplier = keys['ShiftRight'] ? 1.5 : 1

// Gain levels:
window.engineSound.gain1.gain.setValueAtTime(
    (0.1 + normalizedSpeed * 0.3) * gainMultiplier, audioCtx.currentTime
);
window.engineSound.gain2.gain.setValueAtTime(
    (0.05 + normalizedSpeed * 0.15) * gainMultiplier, audioCtx.currentTime
);
window.engineSound.gain3.gain.setValueAtTime(
    (0.02 + normalizedSpeed * 0.06) * gainMultiplier, audioCtx.currentTime
);
window.engineSound.noise.gain.setValueAtTime(
    (0.1 + normalizedSpeed * 0.3) * gainMultiplier, audioCtx.currentTime
);

// Filter:
window.engineSound.filter.frequency.setValueAtTime(
    800 + normalizedSpeed * 3000 * turboMultiplier, audioCtx.currentTime
);
```

### F-16 / A-10 / Cyberpink (Jet Sound)
```js
// Same normalizedSpeed calculation
const baseFreq = 20 + normalizedSpeed * 50;
const turboMultiplier = keys['ShiftRight'] ? 2 : 1;   // 2x turbo for jets

// Turbine-like sound with higher frequencies
// Filter sweep with speed
```

### Apache (Helicopter Sound)
```js
// Base frequency tuned to real-world rotor speed
// Main rotor frequency: mainRotorFreq
// Blade slap gain: bladeSlapGain
// "sawtooth" oscillator type for rotor chop
// Harmonics for turbine whine
```

### Ski
```js
window.engineSound.osc1.type = 'noise';    // Snow friction sound
window.engineSound.osc2.type = 'sine';      // Subtle sine for smooth gliding
window.engineSound.osc3.type = 'sine';      // Additional harmonic

window.engineSound.osc1.frequency.setValueAtTime(100 * normalizedSpeed, audioCtx.currentTime);
window.engineSound.osc2.frequency.setValueAtTime(80 * normalizedSpeed, audioCtx.currentTime);
window.engineSound.osc3.frequency.setValueAtTime(120 * normalizedSpeed, audioCtx.currentTime);

// Gain: quadratic relationship with speed (silent when not moving)
const skiGain = normalizedSpeed * normalizedSpeed * turboMultiplier;

// Filter:
window.engineSound.filter.frequency.setValueAtTime(500 + 2000 * normalizedSpeed, audioCtx.currentTime);
window.engineSound.filter.Q.setValueAtTime(1 + normalizedSpeed * 5, audioCtx.currentTime);
```

### Tank
```js
// Ground vehicle engine sound
// Lower frequencies than aircraft
```

---

## Wheel Sound (Ground Rolling)

```js
function setupWheelSound() {
    // Noise source through bandpass filter
    const filter = audioCtx.createBiquadFilter();

    // Pitch LFO for surface irregularity
    const pitchLfo = audioCtx.createOscillator();
    pitchLfo.type = 'sine';
    pitchLfo.frequency.value = 3;              // 3 Hz
    const pitchDepth = audioCtx.createGain();
    pitchDepth.gain.value = 30;                // Modulation depth

    // Volume LFO for bump feel
    const volumeLfo = audioCtx.createOscillator();
    volumeLfo.type = 'sine';
    volumeLfo.frequency.value = 3;             // 3 Hz
    const volumeDepth = audioCtx.createGain();
    volumeDepth.gain.value = 0.08;             // Subtle pulsing

    // Signal chain: noise -> filter -> gain -> destination
    // LFOs modulate filter frequency and gain

    window.wheelSound = {
        osc: filter,
        gain: gainNode,
        pitchLfo, pitchDepth,
        volumeLfo, volumeDepth
    };
}
```

---

## Air Raid Siren (Disabled)

```js
function setupAirRaidSiren() {
    // Square wave + sine LFO + distortion + delay/reverb
    // Currently disabled
}
```

---

## A-10 Gun Sound (BRRRT)

```js
let brrtAudio = null;
let brrtGainNode = null;
let isA10Shooting = false;

// Activated when vehicleName === 'a10' and Space key pressed
// Stopped on Space key up
function stopA10GunSound() { ... }
```

---

## Sound Effects

### Engine Toggle Sound
```js
function playEngineToggleSound(engineOn) {
    // Plays when engine is toggled on/off via 'KeyE'
    // Different sound for on vs off
}
```

### Explosion Sound
```js
function playExplosionSound() {
    // Called on missile hits, crashes
    // Procedural explosion using noise + filter
}
```

### Landing Sound
```js
function playLandingSound(intensity) {
    // Called on ground contact
    // intensity: 1.0 (always loud for now)
}
```

---

## Audio State

```js
let isMuted = false;                       // L456
// Toggle mute functionality available
```

---

## Other Player Audio

```js
// Distance-based audio for other players' engines
function removeOtherPlayerAudio(plane) {
    // Called when player is removed (stale/disconnected)
}

// Audio distance calculation:
const audioDistance = Math.sqrt(relX * relX + relZ * relZ);
// Volume decreases with distance
```
