# Zelos Space Shooter - Asset Requirements

This spec defines the additional sprites and effects for a top-down space shooter
using Astro-Duck as the player character. Assets are designed to plug into the
Zelos Pixi kit pipeline.

## Player (Astro-Duck pilot)
Base size: 256x256 frames unless noted.
- Idle/hover: 8 frames (gentle bob)
- Thrust: 8 frames (strong jetpack flames)
- Bank left/right: 4 frames each (tilt + flame angle)
- Shoot: 4 frames (brief recoil or wing motion)
- Hit flash: 2 frames (blink or glow)
- Death/explosion: 12 frames

## Projectiles
- Player shot: 2 frames (glow pulse)
- Charged shot: 4 frames (build-up)
- Enemy shot: 2 frames (distinct color)
- Impact spark: 6 frames

## Weapon system (recommended set)
Each weapon includes: projectile sprite, muzzle flash, trail, impact effect.
- W1 Single Shot (cyan): 2 frames projectile, 2 frames muzzle, 4 frames impact
- W2 Spread Shot (cyan+magenta): 2 frames projectile, 2 frames muzzle, 4 frames impact
- W3 Laser Beam (cyan): 3-frame beam loop + 2-frame start/stop caps
- W4 Homing Missile (lime): 4-frame missile + 6-frame smoke trail + 6-frame explosion
- W5 Plasma Orb (magenta): 4-frame orb + 4-frame trail + 6-frame impact burst
- W6 Bomb (orange): 2-frame bomb + 8-frame large explosion
- W7 Rail Shot (blue-white): 2-frame projectile, 2-frame muzzle, 4-frame impact
- W8 Shockwave Pulse (violet): 4-frame expanding ring, 4-frame impact
- W9 Ice Shard (pale cyan): 2-frame projectile, 4-frame impact with frost crack

## Weapon upgrades (optional)
- Levels: L1/L2/L3/L4/L5 variant sprites for projectile/impact/explosion/ring
- UI weapon icons: 64x64 per weapon + 5 small level pips
- Naming (upgrades):
  - `sprites/shooter/weapons/{weapon}-{element}-l{level}-sheet.png`
  - Elements: `projectile`, `impact`, `explosion`, `ring` (only where listed below)
  - Levels: `l1`, `l2`, `l3`, `l4`, `l5`
  - Applies to all weapons except W3 laser beam.
- Upgrade variants must match the base element size and frame count for that weapon.
  - Elements by weapon type:
    - W1/W2/W7/W9: `projectile`, `impact`
    - W4/W6: `projectile`, `explosion`
    - W5: `projectile`, `impact` (orb impact)
    - W8: `ring`, `impact`

## Enemies (minimum set)
Each enemy type needs: idle/move, hit, explode.
- Enemy A: small drone (128x128)
- Enemy B: medium fighter (192x192)
- Enemy C: turret/mini-boss (256x256)
Additional enemies:
- Enemy D: fast interceptor (128x128)
- Enemy E: shielded orb (160x160)
- Enemy F: mine layer (192x192)
- Enemy G: sniper ship (192x192)

Behavior specifics (animation cues)
- Enemy A (drone): slow drift; hit flash; explode with small burst.
- Enemy B (fighter): swoops in arcs; wing/fin tilt on turns; medium explosion.
- Enemy C (turret/mini-boss): rotates; charge-up glow before shooting; larger explosion.
- Enemy D (interceptor): fast dash lines; brief afterimage trail on dash.
- Enemy E (shielded orb): shield shimmer loop; shield break flash on hit.
- Enemy F (mine layer): hatch open/close when deploying mines; small recoil.
- Enemy G (sniper ship): long charge beam glow, then single high-speed shot.

## Bosses
Each boss needs: idle/move, attack windup, attack, hit, phase transition, defeat.
Make bosses dramatic and cinematic: larger scale, brighter glows, screen-filling
effects, and multi-phase visual changes.
- Boss 1: Orbital Core (512x512)
- Boss 2: Nebula Leviathan (768x512)

Boss dramatics (visual cues)
- Phase 1: subtle glow pulses + minor particle drift
- Phase 2: stronger glow, additional rings/energy arcs, wider attack telegraphs
- Phase 3: cracked shell + exposed core glow, heavy particle rain
- Defeat: long explosion chain + shockwave ring + screen flash

## Powerups and pickups
- Shield pickup: 4 frames
- Double shot: 4 frames
- Speed boost: 4 frames
- Coin/collectible: 6 frames

## FX and environment
- Engine trail (loop): 6 frames
- Explosion small/medium/large: 8/10/12 frames
- Screen vignette overlay (optional): 1920x1080
- Parallax backgrounds (tileable):
  - Starfield layer 1 (slow): 1024x1024
  - Starfield layer 2 (mid): 1024x1024
  - Nebula layer (slow): 2048x1024

## Background coherence (use core assets)
- Use `createBackgroundComposite` (starfield + nebula + constellation).
- Add at least one planet composite and 1-2 satellite icons as stage dressing.
- Keep colors aligned with the Zelos palette and glow strength.

## UI
- Player health bar (states)
- Score icons
- Pause overlay
- Cinematic hooks (see `specs/games/zelos-cinematics.md`):
  - Level briefings and boss intro clips (5-12s) between levels
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
- `sprites/shooter/player/astro-duck-ship-idle-sheet.png`
- `sprites/shooter/player/astro-duck-ship-thrust-sheet.png`
- `sprites/shooter/projectiles/shot-player-sheet.png`
- `sprites/shooter/enemies/enemy-a-idle-sheet.png`
- `sprites/shooter/fx/explosion-small-sheet.png`
- `sprites/shooter/pickups/shield-sheet.png`

## Required file naming (authoritative)
Player animations (256x256 frames)
- `sprites/shooter/player/astro-duck-ship-idle-sheet.png`
- `sprites/shooter/player/astro-duck-ship-thrust-sheet.png`
- `sprites/shooter/player/astro-duck-ship-bank-left-sheet.png`
- `sprites/shooter/player/astro-duck-ship-bank-right-sheet.png`
- `sprites/shooter/player/astro-duck-ship-shoot-sheet.png`
- `sprites/shooter/player/astro-duck-ship-hit-sheet.png`
- `sprites/shooter/player/astro-duck-ship-death-sheet.png`

Projectiles / impacts
- `sprites/shooter/projectiles/shot-player-sheet.png`
- `sprites/shooter/projectiles/shot-charged-sheet.png`
- `sprites/shooter/projectiles/shot-enemy-sheet.png`
- `sprites/shooter/projectiles/impact-spark-sheet.png`

Weapons (W1-W9)
- Pattern: `sprites/shooter/weapons/{weapon}-{element}-sheet.png`
  - weapon ids: `w1-single`, `w2-spread`, `w3-laser`, `w4-homing`, `w5-plasma`,
    `w6-bomb`, `w7-rail`, `w8-shockwave`, `w9-ice`
  - element ids:
    - `projectile`, `muzzle`, `impact`
    - `beam-loop`, `beam-cap-start`, `beam-cap-end` (W3)
    - `trail` (W4, W5), `explosion` (W4, W6), `ring` (W8)
  - Upgrade variants:
    - Pattern: `sprites/shooter/weapons/{weapon}-{element}-l{level}-sheet.png`
    - elements: `projectile`, `impact`, `explosion`, `ring` (per weapon type)
    - levels: `l1`, `l2`, `l3`, `l4`, `l5`
    - weapons: all except `w3-laser` (see weapon element mapping above)

Enemies (A-G)
- Pattern: `sprites/shooter/enemies/{enemy}-{state}-sheet.png`
  - enemy ids: `enemy-a`, `enemy-b`, `enemy-c`, `enemy-d`, `enemy-e`, `enemy-f`, `enemy-g`
  - states: `idle`, `hit`, `explode`

Bosses
- Pattern: `sprites/shooter/bosses/{boss}-{state}-sheet.png`
  - boss ids: `boss-1-orbital-core`, `boss-2-nebula-leviathan`
  - states: `idle`, `windup`, `attack`, `hit`, `phase`, `defeat`

Pickups
- Pattern: `sprites/shooter/pickups/{pickup}-sheet.png`
  - pickup ids: `shield`, `double-shot`, `speed-boost`, `coin`

FX
- `sprites/shooter/fx/engine-trail-sheet.png`
- `sprites/shooter/fx/explosion-small-sheet.png`
- `sprites/shooter/fx/explosion-medium-sheet.png`
- `sprites/shooter/fx/explosion-large-sheet.png`
- `sprites/shooter/fx/vignette.png` (1920x1080)
- `sprites/shooter/backgrounds/starfield-layer-1.png` (tileable 1024x1024)
- `sprites/shooter/backgrounds/starfield-layer-2.png` (tileable 1024x1024)
- `sprites/shooter/backgrounds/nebula-layer.png` (tileable 2048x1024)

UI
- `sprites/shooter/ui/health-bar-states.png` (4 states, 256x32 each)
- `sprites/shooter/ui/score-icons.png` (6 icons, 64x64 each; order: score, coin, time, combo, bonus, special)
- `sprites/shooter/ui/pause-overlay.png` (1920x1080 overlay)
- `sprites/shooter/ui/weapon-icons.png` (9 icons, 64x64 each)
- `sprites/shooter/ui/weapon-level-pips.png` (5 pips, 16x16 each)

