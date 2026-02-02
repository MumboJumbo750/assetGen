# Zelos Game Audio SFX - Requirements

This spec lists the sound effects needed for the two Pixi mini-games. Provide
clean, game-ready WAV (or OGG) at 48kHz, normalized, short tails, no clipping.

Audio index: `database/specs/zelos-audio-index.json`

## Global guidelines
- Format: WAV 48kHz (primary), OGG optional
- Loudness: consistent perceived volume across the set
- Style: sci-fi, friendly, neon cyberpunk
- Variants: 2-3 variations for frequently repeated sounds

## Space Shooter SFX
Player
- Engine idle loop (soft)
- Engine thrust loop (strong)
- Shoot single (3 variants)
- Shoot spread (3 variants)
- Laser beam start + loop + end
- Charge build + charge release
- Hit (short zap)
- Death/explosion (large)

Weapons/FX
- Missile launch + explosion
- Plasma orb impact
- Bomb drop + explosion
- Shockwave pulse
- Ice shard hit (frost crack)

Enemies
- Spawn (whoosh)
- Hit (zap)
- Explode small/medium/large
- Boss intro sting
- Boss phase transition (riser)

UI
- Pickup (powerup)
- Score tick
- Pause in/out
- Game over

## Music (BGM)
Provide loopable tracks (seamless loop points).
- Menu/Title loop (calm neon ambient)
- Space shooter gameplay loop (driving synthwave)
- Boss battle loop (tense, higher tempo)
- Jump & Run gameplay loop (upbeat, playful)
- Win/Results sting (3-5s)

## Jump & Run SFX
Player
- Run step (2-3 variants)
- Jump start
- Jump land
- Crouch/stand
- Hit
- Death

Environment
- Coin pickup
- Checkpoint
- Moving platform loop
- Hazard (spike/lava) hit

Enemies
- Enemy hit
- Enemy defeat
- Boss intro sting
- Boss phase transition

UI
- Pause in/out
- Game over

## File naming (authoritative)
All files in `assets/zelos/audio/` (WAV 48kHz). Optional OGG mirrors same names.

Space Shooter SFX (`assets/zelos/audio/shooter/`)
- `engine-idle-loop.wav`
- `engine-thrust-loop.wav`
- `shoot-single-01.wav`
- `shoot-single-02.wav`
- `shoot-single-03.wav`
- `shoot-spread-01.wav`
- `shoot-spread-02.wav`
- `shoot-spread-03.wav`
- `laser-start.wav`
- `laser-loop.wav`
- `laser-end.wav`
- `charge-build.wav`
- `charge-release.wav`
- `hit-zap.wav`
- `death-explosion.wav`
- `missile-launch.wav`
- `missile-explosion.wav`
- `plasma-impact.wav`
- `bomb-drop.wav`
- `bomb-explosion.wav`
- `shockwave-pulse.wav`
- `ice-shard-hit.wav`
- `enemy-spawn.wav`
- `enemy-hit.wav`
- `enemy-explode-small.wav`
- `enemy-explode-medium.wav`
- `enemy-explode-large.wav`
- `boss-intro-sting.wav`
- `boss-phase-riser.wav`
- `pickup-powerup.wav`
- `score-tick.wav`
- `pause-in.wav`
- `pause-out.wav`
- `game-over.wav`

Jump & Run SFX (`assets/zelos/audio/platformer/`)
- `step-01.wav`
- `step-02.wav`
- `step-03.wav`
- `jump-start.wav`
- `jump-land.wav`
- `crouch-stand.wav`
- `hit.wav`
- `death.wav`
- `coin-pickup.wav`
- `checkpoint.wav`
- `platform-move-loop.wav`
- `hazard-hit.wav`
- `enemy-hit.wav`
- `enemy-defeat.wav`
- `boss-intro-sting.wav`
- `boss-phase-riser.wav`
- `pause-in.wav`
- `pause-out.wav`
- `game-over.wav`

Music (loopable, `assets/zelos/audio/`)
- `bgm-menu-loop.wav`
- `bgm-shooter-loop.wav`
- `bgm-boss-loop.wav`
- `bgm-platformer-loop.wav`
- `bgm-win-sting.wav`


