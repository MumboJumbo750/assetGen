# Zelos Mini-Game Spritesheet Metadata

This file provides explicit, production-ready metadata for shooter and
platformer spritesheets so asset generation is unambiguous.

Global rules
- Layout: horizontal strip, no padding between frames.
- Background: transparent.
- FPS default: 12 (unless noted).
- Single-frame states may omit the `-sheet` suffix (e.g. `astro-duck-jump-apex.png`).
- Pivot defaults:
  - Shooter (top-down): 0.5, 0.5
  - Platformer (side-view): 0.5, 0.9

## Space Shooter

Player (256x256 frames)
| File | Frames | FPS | Loop | Pivot |
| --- | --- | --- | --- | --- |
| `sprites/shooter/player/astro-duck-ship-idle-sheet.png` | 8 | 12 | yes | 0.5,0.5 |
| `sprites/shooter/player/astro-duck-ship-thrust-sheet.png` | 8 | 12 | yes | 0.5,0.5 |
| `sprites/shooter/player/astro-duck-ship-bank-left-sheet.png` | 4 | 12 | yes | 0.5,0.5 |
| `sprites/shooter/player/astro-duck-ship-bank-right-sheet.png` | 4 | 12 | yes | 0.5,0.5 |
| `sprites/shooter/player/astro-duck-ship-shoot-sheet.png` | 4 | 12 | no | 0.5,0.5 |
| `sprites/shooter/player/astro-duck-ship-hit-sheet.png` | 2 | 12 | no | 0.5,0.5 |
| `sprites/shooter/player/astro-duck-ship-death-sheet.png` | 12 | 12 | no | 0.5,0.5 |

Projectiles (base)
| File | Frame Size | Frames | FPS | Loop | Pivot |
| --- | --- | --- | --- | --- | --- |
| `sprites/shooter/projectiles/shot-player-sheet.png` | 64x64 | 2 | 12 | yes | 0.5,0.5 |
| `sprites/shooter/projectiles/shot-charged-sheet.png` | 64x64 | 4 | 12 | yes | 0.5,0.5 |
| `sprites/shooter/projectiles/shot-enemy-sheet.png` | 64x64 | 2 | 12 | yes | 0.5,0.5 |
| `sprites/shooter/projectiles/impact-spark-sheet.png` | 128x128 | 6 | 12 | no | 0.5,0.5 |

Weapons (W1-W9) - element metadata
| Element | Frame Size | Frames | FPS | Loop | Notes |
| --- | --- | --- | --- | --- | --- |
| Basic projectile | 64x64 | 2 | 12 | yes | W1/W2/W7/W9 |
| Basic muzzle | 64x64 | 2 | 12 | no | W1/W2/W7 |
| Basic impact | 128x128 | 4 | 12 | no | W1/W2/W7/W9 |
| Beam loop | 256x64 | 3 | 12 | yes | W3 |
| Beam cap start/end | 128x64 | 2 | 12 | no | W3 |
| Missile/orb projectile | 96x96 | 4 | 12 | yes | W4/W5 |
| Trail | 128x128 | 6 | 12 | yes | W4 (smoke) |
| Trail (orb) | 128x128 | 4 | 12 | yes | W5 |
| Explosion (missile) | 256x256 | 6 | 12 | no | W4 |
| Explosion (bomb) | 384x384 | 8 | 12 | no | W6 |
| Shockwave ring | 256x256 | 4 | 12 | no | W8 |
| Shockwave impact | 256x256 | 4 | 12 | no | W8 |

Weapon upgrade variants (L1-L5)
| File pattern | Frame Size | Frames | FPS | Loop | Notes |
| --- | --- | --- | --- | --- | --- |
| `sprites/shooter/weapons/{weapon}-{element}-l{level}-sheet.png` | Match base element size | Match base element frames | 12 | Match base element | Levels `l1..l5` for projectile+impact (W1/W2/W7/W9/W5), projectile+explosion (W4/W6), ring+impact (W8). Exclude W3. |

Upgrade sheet sizes (explicit)
| Weapon | Element | Frame Size | Frames | Sheet Size |
| --- | --- | --- | --- | --- |
| W1/W2/W7/W9 | projectile | 64x64 | 2 | 128x64 |
| W1/W2/W7/W9 | impact | 128x128 | 4 | 512x128 |
| W4/W5 | projectile | 96x96 | 4 | 384x96 |
| W6 | projectile | 96x96 | 2 | 192x96 |
| W4 | explosion | 256x256 | 6 | 1536x256 |
| W5 | impact | 256x256 | 6 | 1536x256 |
| W6 | explosion | 384x384 | 8 | 3072x384 |
| W8 | ring | 256x256 | 4 | 1024x256 |
| W8 | impact | 256x256 | 4 | 1024x256 |

Enemies
| Type | Frame Size | Frames (idle/hit/explode) | FPS | Pivot |
| --- | --- | --- | --- | --- |
| Enemy A / D | 128x128 | 6 / 2 / 8 | 12 | 0.5,0.5 |
| Enemy B / F / G | 192x192 | 6 / 2 / 8 | 12 | 0.5,0.5 |
| Enemy C | 256x256 | 6 / 2 / 8 | 12 | 0.5,0.5 |
| Enemy E | 160x160 | 6 / 2 / 8 | 12 | 0.5,0.5 |

Bosses
| Boss | Frame Size | Frames (idle/windup/attack/hit/phase/defeat) | FPS | Pivot |
| --- | --- | --- | --- | --- |
| Orbital Core | 512x512 | 8 / 6 / 8 / 4 / 6 / 12 | 12 | 0.5,0.5 |
| Nebula Leviathan | 768x512 | 8 / 6 / 8 / 4 / 6 / 12 | 12 | 0.5,0.5 |

Pickups
| File | Frame Size | Frames | FPS | Loop | Pivot |
| --- | --- | --- | --- | --- | --- |
| `sprites/shooter/pickups/shield-sheet.png` | 64x64 | 4 | 12 | yes | 0.5,0.5 |
| `sprites/shooter/pickups/double-shot-sheet.png` | 64x64 | 4 | 12 | yes | 0.5,0.5 |
| `sprites/shooter/pickups/speed-boost-sheet.png` | 64x64 | 4 | 12 | yes | 0.5,0.5 |
| `sprites/shooter/pickups/coin-sheet.png` | 64x64 | 6 | 12 | yes | 0.5,0.5 |

FX
| File | Frame Size | Frames | FPS | Loop | Pivot |
| --- | --- | --- | --- | --- | --- |
| `sprites/shooter/fx/engine-trail-sheet.png` | 128x128 | 6 | 12 | yes | 0.5,0.5 |
| `sprites/shooter/fx/explosion-small-sheet.png` | 128x128 | 8 | 12 | no | 0.5,0.5 |
| `sprites/shooter/fx/explosion-medium-sheet.png` | 256x256 | 10 | 12 | no | 0.5,0.5 |
| `sprites/shooter/fx/explosion-large-sheet.png` | 384x384 | 12 | 12 | no | 0.5,0.5 |

UI (sheets and overlays)
| File | Size | Notes |
| --- | --- | --- |
| `sprites/shooter/ui/health-bar-states.png` | 1024x32 | 4 states, 256x32 each (full, mid, low, empty). |
| `sprites/shooter/ui/score-icons.png` | 384x64 | 6 icons, 64x64 each; order: score, coin, time, combo, bonus, special. |
| `sprites/shooter/ui/pause-overlay.png` | 1920x1080 | Fullscreen translucent pause overlay. |
| `sprites/shooter/ui/weapon-icons.png` | 576x64 | 9 weapon icons, 64x64 each (W1-W9). |
| `sprites/shooter/ui/weapon-level-pips.png` | 80x16 | 5 pips, 16x16 each. |

## Jump & Run (Platformer)

Player (256x256 frames)
| File | Frames | FPS | Loop | Pivot |
| --- | --- | --- | --- | --- |
| `sprites/platformer/player/astro-duck-idle-sheet.png` | 6 | 12 | yes | 0.5,0.9 |
| `sprites/platformer/player/astro-duck-run-sheet.png` | 10 | 12 | yes | 0.5,0.9 |
| `sprites/platformer/player/astro-duck-jump-start-sheet.png` | 2 | 12 | no | 0.5,0.9 |
| `sprites/platformer/player/astro-duck-jump-apex.png` | 1 | 12 | no | 0.5,0.9 |
| `sprites/platformer/player/astro-duck-fall-sheet.png` | 2 | 12 | no | 0.5,0.9 |
| `sprites/platformer/player/astro-duck-land-sheet.png` | 2 | 12 | no | 0.5,0.9 |
| `sprites/platformer/player/astro-duck-crouch-sheet.png` | 2 | 12 | yes | 0.5,0.9 |
| `sprites/platformer/player/astro-duck-climb-sheet.png` | 6 | 12 | yes | 0.5,0.9 |
| `sprites/platformer/player/astro-duck-hit-sheet.png` | 2 | 12 | no | 0.5,0.9 |
| `sprites/platformer/player/astro-duck-death-sheet.png` | 10 | 12 | no | 0.5,0.9 |

Environment (animated)
| File | Frame Size | Frames | FPS | Loop | Pivot |
| --- | --- | --- | --- | --- | --- |
| `sprites/platformer/tiles/hazard-lava-sheet.png` | 256x256 | 6 | 12 | yes | 0.5,0.9 |

Environment tiles (static)
| File | Size | Pivot | Notes |
| --- | --- | --- | --- |
| `sprites/platformer/tiles/ground-tile.png` | 256x256 | 0.5,0.5 | Tileable base ground. |
| `sprites/platformer/tiles/platform-mid.png` | 256x256 | 0.5,0.5 | Platform middle segment. |
| `sprites/platformer/tiles/platform-end.png` | 256x256 | 0.5,0.5 | Platform end segment. |
| `sprites/platformer/tiles/platform-corner.png` | 256x256 | 0.5,0.5 | Corner/edge segment. |
| `sprites/platformer/tiles/moving-platform-idle.png` | 256x256 | 0.5,0.5 | Idle moving platform. |
| `sprites/platformer/tiles/moving-platform-active.png` | 256x256 | 0.5,0.5 | Active moving platform. |
| `sprites/platformer/tiles/hazard-spikes.png` | 256x256 | 0.5,0.5 | Static hazard tile. |

Collectibles and FX
| File | Frame Size | Frames | FPS | Loop | Pivot |
| --- | --- | --- | --- | --- | --- |
| `sprites/platformer/collectibles/coin-sheet.png` | 64x64 | 6 | 12 | yes | 0.5,0.5 |
| `sprites/platformer/collectibles/checkpoint-flag-sheet.png` | 64x64 | 4 | 12 | yes | 0.5,0.9 |
| `sprites/platformer/fx/dust-puff-sheet.png` | 128x128 | 4 | 12 | no | 0.5,0.9 |
| `sprites/platformer/fx/jump-trail-sheet.png` | 128x128 | 4 | 12 | no | 0.5,0.9 |
| `sprites/platformer/fx/hit-spark-sheet.png` | 128x128 | 4 | 12 | no | 0.5,0.9 |

Enemies
| Type | Frame Size | Frames (idle/hit/defeat) | FPS | Pivot |
| --- | --- | --- | --- | --- |
| Slime / Drone / Spiker / Beetle / Bat | 128x128 | 6 / 2 / 6 | 12 | 0.5,0.9 |
| Cannon bot | 192x192 | 6 / 2 / 6 | 12 | 0.5,0.9 |

Bosses
| Boss | Frame Size | Frames (idle/windup/attack/hit/phase/defeat) | FPS | Pivot |
| --- | --- | --- | --- | --- |
| Reactor Guardian | 768x512 | 8 / 6 / 8 / 4 / 6 / 12 | 12 | 0.5,0.9 |
| Sky Serpent | 896x512 | 8 / 6 / 8 / 4 / 6 / 12 | 12 | 0.5,0.9 |

UI (sheets)
| File | Size | Notes |
| --- | --- | --- |
| `sprites/platformer/ui/health-hearts.png` | 192x64 | 3 hearts, 64x64 each (full/half/empty). |
| `sprites/platformer/ui/score-icons.png` | 384x64 | 6 icons, 64x64 each; order: score, coin, time, combo, bonus, special. |
