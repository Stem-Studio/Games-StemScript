# UI Screens - fly.pieter.com Source Analysis

## Start Screen (L362-410)

```html
<div id="startScreen" style="display:block">
    <!-- Username input -->
    <input id="usernameInput" ...>

    <!-- Join button -->
    <button class="disabled" id="startButton"
        style="font-weight:bold; padding: 10px 55px; font-size: 24px;
               cursor: pointer; background-color: #4CAF50; color: white;
               border: none; border-radius: 5px;">
        Join the game
    </button>
</div>
```

### Start Button Behavior
- Initially disabled (class="disabled")
- Enabled after WebSocket connection established
- On click: opens vehicle selection modal

### Username Validation (L822-925)
```js
const storedUsername = localStorage.getItem('username');
const usernameInput = document.getElementById('usernameInput');

let username = usernameInput.value.trim().toLowerCase();

// Bad word filter
const containsBadWord = BAD_WORDS.some(word => ...);

// Valid characters check
const isValidUsername = /^[a-zA-Z0-9_\[\]]+$/.test(username);
```

---

## Vehicle Selection Modal (L~385-440)

```html
<div class="vehicle-selection-modal">
    <div class="vehicle-grid">
        <!-- Cessna -->
        <div class="vehicle-option selected" data-vehicle="cessna">
            <img src="assets/fly_vehicle_cessna.png">
            <div class="vehicle-name">Cessna 172<br/>Free</div>
            <div class="vehicle-specs">
                Max speed: 140 knots<br>
                Max altitude: 14,000 ft<br>
                Fire power: Low
            </div>
        </div>

        <!-- F-16 (Premium) -->
        <div class="vehicle-option disabled premium" data-vehicle="f16"
             data-buy-url="https://buy.stripe.com/dR64hq6aJgxC2OI14g">
            <img src="assets/fly_vehicle_f16.png">
            <div class="vehicle-name">F-16</br>$29.99</div>
            <div class="vehicle-specs">
                Max speed: 1,500 knots<br>
                Max altitude: 50,000 ft<br>
                Fire power: Very high
            </div>
        </div>

        <!-- Cyberpink -->
        <div class="vehicle-option" data-vehicle="cyberpink">
            <img src="assets/fly_vehicle_cyberpink.jpg">
            <div class="vehicle-name">Cyberpink</br>Free</div>
            <div class="vehicle-specs">
                Max speed: 800 knots<br>
                Max altitude: 30,000 ft<br>
                Fire power: High
            </div>
        </div>

        <!-- Additional vehicles in grid -->
    </div>
</div>
```

### Selection Logic
```js
function confirmVehicleSelection() {
    const selectedVehicle = document.querySelector('.vehicle-option.selected');
    if (!selectedVehicle) return;

    document.querySelector('.vehicle-selection-modal').style.display = 'none';
    vehicleName = document.querySelector('.vehicle-option.selected').getAttribute('data-vehicle');
    startGame();
}

// Enter key also confirms selection
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const modal = document.querySelector('.vehicle-selection-modal');
        if (modal && modal.style.display !== 'none') {
            confirmVehicleSelection();
        }
    }
});
```

---

## Leaderboard (Tab Key)

```html
<div id="leaderboard">
    <!-- Table with columns: Rank, Player, Kills, Deaths -->
</div>
```

### Toggle (Tab Key)
```js
// Show on Tab keydown
if (event.code === 'Tab') {
    event.preventDefault();
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.style.display = 'block';
}

// Hide on Tab keyup
if (event.code === 'Tab') {
    event.preventDefault();
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.style.display = 'none';
}
```

### Leaderboard Data
```js
// Sorted by deaths (ascending)
return a.deaths - b.deaths;

// Row format:
`<td style="text-align: center; padding: 5px;">${player.deaths}</td>`
```

---

## Score Display

```js
const scoreDiv = document.getElementById('scoreDisplay');
// Updated with shake animation on kills
function updateScoreDisplay(shake = false) { ... }
```

---

## Chat System

```js
// Chat input activated by pressing 'T'
if (event.key === 't') {
    event.preventDefault();
    skipControls = true;                    // Disable flight controls
    chatInput.style.display = 'block';
    chatInput.focus();
}
```

---

## Death/Restart Screen

```js
// On crash/death:
window.gameEnded = true;

// Restart instructions shown for both keyboard and touch
// Space key to restart (keyboard)
// Tap anywhere to restart (mobile)

// Restart handler:
window.gameEnded = false;
// Reset all game state
```

---

## View Toggle Button (Dynamic)

```js
const viewButton = document.createElement('button');
// Toggles first-person / third-person view
// Triggers KeyV keydown event programmatically
const keyEvent = new KeyboardEvent('keydown', { code: 'KeyV', key: 'v' });
```

---

## Leaderboard Button (Dynamic)

```js
const leaderboardButton = document.createElement('button');
// Shows/hides leaderboard on click
```

---

## Message Display

```js
function showMessage(text, isKill = false) {
    // Temporary message at top of screen
    // HTML-formatted with bold player names
    // Kill messages: `<b>${attackerName}</b> (health%) killed <b>${targetName}</b> +score`
    // Hit messages: `<b>${attackerName}</b> (health%) hit <b>${targetName}</b> (health%)`
    // escapeHtml() used for security
}
```

---

## Mobile Detection

```js
// isMobileDevice flag set based on user agent / screen size
// Affects: joystick display, auto gear extension, control layout
```

---

## Country Flag

```js
// Fetched from IP geolocation API
const countryCode = data.country_code || '';
const countryFlagEmoji = data.flag_emoji || '';
// Displayed next to username in leaderboard
```
