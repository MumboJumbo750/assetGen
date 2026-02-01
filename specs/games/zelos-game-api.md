# Zelos Pixi Games API (Easter Eggs)

This defines the minimal API expected by the embedded Pixi mini-games. The host
environment handles keyboard input and forwards it to the game.

## Global input interface
The host should expose a `window.ZelosInput` object:

```js
window.ZelosInput = {
  // directional (1, 0, -1)
  axisX: 0,
  axisY: 0,

  // discrete actions (boolean)
  actions: {
    jump: false,
    shoot: false,
    dash: false,
    pause: false,
  },

  // called by host each frame before update
  poll() {},
};
```

## Game bus (optional)
The host may expose a simple bus for events and score updates:

```js
window.ZelosGameBus = {
  emit(eventName, payload) {},
  on(eventName, handler) {},
};
```

### Cinematic events (optional)
- `cinematic:play` payload: `{ id: "intro-briefing-l1" }`
- `cinematic:stop` payload: `{ id: "intro-briefing-l1" }` (if needed)
  - Used by skip controls (icon-only UI, no text).

### FX events (optional)
- `fx:hit` payload: optional `{ strength, color }`
- `fx:boss-phase` payload: optional `{ phase }`

### Score events (optional)
- `score:add` payload: `{ amount: 50 }` or number
- `score:set` payload: `{ value: 1200 }` or number
- Local highscores are stored per game in `localStorage` by the game.

### Achievement events (optional)
- `achievement:unlock` payload: `{ id, label?, icon?, rarity?, source? }`
  - Games emit `source: "game"` to notify the host.
  - Hosts may emit without `source: "game"` to trigger in-game toasts.

### Optional achievements adapter (host)
If the main Zelos app has a global achievements system, expose a lightweight
adapter so the mini-games can sync without custom wiring:

```js
window.ZelosAchievements = {
  // Return true if the achievement is already unlocked.
  isUnlocked(id) {},

  // Persist/forward unlocks to the global system.
  unlock(id, meta) {},

  // Optional: return an array of unlocked ids for initial sync.
  list() {},
};
```

Games will call these methods if present, otherwise they fall back to local
storage + bus events.

## Optional runtime settings
The host can expose simple settings for accessibility:

```js
window.ZelosGameSettings = {
  reducedShake: false, // reduces screen shake intensity
  lowGlow: false,      // lower glow/alpha in backgrounds and props
};
```

## Required lifecycle (from host)
Each game exports `createGame({ pixi, root, input, bus })` and returns:

```js
{
  app,            // Pixi.Application
  destroy(),      // cleanup
  resize(w, h),   // resize to full screen
}
```

Host calls:
1. `const game = await createGame(...)`
2. `game.resize(window.innerWidth, window.innerHeight)`
3. On resize, call `game.resize(...)`
4. On teardown, call `game.destroy()`

## Asset root
Games assume `root = "./assets/zelos"` and use the Pixi kit for composites.

## Cinematics playback (optional)
For short in-game clips, use the Pixi kit helper `createVideoSprite` and
preload the video source before showing it to avoid hitching.
