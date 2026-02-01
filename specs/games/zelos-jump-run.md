# Zelos Jump & Run - Asset Requirements

This spec defines the additional sprites and tiles for a side-scrolling
platformer featuring Astro-Duck.

## Player (Astro-Duck)
Base size: 256x256 frames unless noted.
- Idle: 6 frames
- Run: 10 frames
- Jump start: 2 frames
- Jump apex: 1 frame
- Fall: 2 frames
- Land: 2 frames
- Crouch: 2 frames
- Climb (if ladders): 6 frames
- Hit: 2 frames
- Death: 10 frames

## Environment tiles
- Ground tiles (tileable, 256x256)
- Platform tiles (end, middle, corner) 256x256 each
- Background parallax layers (same as shooter)
- Hazard tiles: spikes 256x256, lava (animated 6 frames, 256x256 per frame)
- Moving platforms (idle, active) 256x256 each

## Collectibles and FX
- Coin/collectible: 6 frames
- Checkpoint flag: 4 frames
- Dust puff: 4 frames
- Jump trail: 4 frames
- Hit spark: 4 frames

## Background coherence (use core assets)
- Use `createBackgroundComposite` (starfield + nebula + constellation).
- Place a planet composite on the horizon; add satellites as distant props.
- Reuse stargate glyphs for the quiz moment between levels.

## Enemies
Each enemy type: idle/move, hit, defeat.
- Slime (128x128)
- Drone (128x128)
- Spiker (128x128)
Additional enemies:
- Beetle (128x128)
- Bat (128x128)
- Cannon bot (192x192)

Behavior specifics (animation cues)
- Slime: squash/stretch idle; small hop attack; splat on defeat.
- Drone: hover bob; short burst dash; spark on hit.
- Spiker: retract/extend spikes; pauses before charge.
- Beetle: armored idle; charge dash with dust trail; flip on defeat.
- Bat: hang idle (optional), swoop attack; wing flap loop.
- Cannon bot: turret aim animation; recoil on fire; vent steam on hit.

## Bosses
Each boss needs: idle, attack windup, attack, hit, phase transition, defeat.
Make bosses dramatic and cinematic: scale, layered effects, and clear phase
changes.
- Boss 1: Reactor Guardian (768x512)
- Boss 2: Sky Serpent (896x512)

Boss dramatics (visual cues)
- Phase 1: subtle glow pulses + small debris/falling sparks
- Phase 2: armor cracks + brighter core, wider attack windups
- Phase 3: exposed core + aggressive aura, screen shake on attacks
- Defeat: large dust burst + glow fade + collapse animation

## UI
- Health hearts
- Score or coin counter icons
- Cinematic hooks (see `specs/games/zelos-cinematics.md`)
- Glyph quiz moment: use stargate glyphs as a short input puzzle between levels
  - Prologue: office briefing with Astro-Duck at PC and headset (text-free)
- Optional stargate travel interstitial between levels when story fits
- Menu/loading background: `backgrounds/office-vignette.png` (text-free)
- Add a lightweight menu screen using the office vignette + mascot + props.

## Gameplay polish (shared)
- Safe start: first 10-15 seconds are low-intensity before ramping difficulty.
- Difficulty ramp: gradually increase speed and enemy density over 45-60 seconds.
- Feedback: screen shake + short flash on hits, stronger on boss phase changes.
- Micro slow-motion (200-300ms) on boss phase transitions.
- Consistent FX palette: cyan for friendly, magenta/orange for danger cues.
- Use `fx:hit` and `fx:boss-phase` events (see API) to trigger feedback.
- Score: increment over time and via `score:add` events; persist highscore locally.

## Spritesheet metadata
- Explicit frame counts, pivots, and FPS live in `specs/games/zelos-minigame-spritesheets.md`.

## Achievements
- Shared achievement definitions and badge assets live in `specs/games/zelos-achievements.md`.
- In-game toasts use `icons/achievements/{id}.png` + `frame-{rarity}.png`.

## Accessibility toggles (host settings)
- `reducedShake`: dampen shake intensity.
- `lowGlow`: reduce glow/alpha in background props.

## Naming suggestions
- `sprites/platformer/player/astro-duck-run-sheet.png`
- `sprites/platformer/tiles/ground-tile.png`
- `sprites/platformer/fx/dust-puff-sheet.png`
- `sprites/platformer/enemies/slime-idle-sheet.png`

## Required file naming (authoritative)
Player animations (256x256 frames)
- `sprites/platformer/player/astro-duck-idle-sheet.png`
- `sprites/platformer/player/astro-duck-run-sheet.png`
- `sprites/platformer/player/astro-duck-jump-start-sheet.png`
- `sprites/platformer/player/astro-duck-jump-apex.png`
- `sprites/platformer/player/astro-duck-fall-sheet.png`
- `sprites/platformer/player/astro-duck-land-sheet.png`
- `sprites/platformer/player/astro-duck-crouch-sheet.png`
- `sprites/platformer/player/astro-duck-climb-sheet.png`
- `sprites/platformer/player/astro-duck-hit-sheet.png`
- `sprites/platformer/player/astro-duck-death-sheet.png`

Environment tiles
- `sprites/platformer/tiles/ground-tile.png`
- `sprites/platformer/tiles/platform-mid.png`
- `sprites/platformer/tiles/platform-end.png`
- `sprites/platformer/tiles/platform-corner.png`
- `sprites/platformer/tiles/moving-platform-idle.png`
- `sprites/platformer/tiles/moving-platform-active.png`
- `sprites/platformer/tiles/hazard-spikes.png`
- `sprites/platformer/tiles/hazard-lava-sheet.png`
- `sprites/platformer/backgrounds/starfield-layer-1.png` (tileable 1024x1024)
- `sprites/platformer/backgrounds/starfield-layer-2.png` (tileable 1024x1024)
- `sprites/platformer/backgrounds/nebula-layer.png` (tileable 2048x1024)

Collectibles and FX
- `sprites/platformer/collectibles/coin-sheet.png`
- `sprites/platformer/collectibles/checkpoint-flag-sheet.png`
- `sprites/platformer/fx/dust-puff-sheet.png`
- `sprites/platformer/fx/jump-trail-sheet.png`
- `sprites/platformer/fx/hit-spark-sheet.png`

Enemies
- Pattern: `sprites/platformer/enemies/{enemy}-{state}-sheet.png`
  - enemy ids: `slime`, `drone`, `spiker`, `beetle`, `bat`, `cannon-bot`
  - states: `idle`, `hit`, `defeat`

Bosses
- Pattern: `sprites/platformer/bosses/{boss}-{state}-sheet.png`
  - boss ids: `boss-1-reactor-guardian`, `boss-2-sky-serpent`
  - states: `idle`, `windup`, `attack`, `hit`, `phase`, `defeat`

UI
- `sprites/platformer/ui/health-hearts.png` (3 icons, 64x64 each)
- `sprites/platformer/ui/score-icons.png` (6 icons, 64x64 each; order: score, coin, time, combo, bonus, special)

