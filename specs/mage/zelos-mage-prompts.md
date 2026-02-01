# Mage AI Prompt Pack: Zelos V2

This file provides prompt-ready instructions optimized for Mage AI (or any
text-to-image tool). It mirrors the project spec and keeps the style consistent.

If you are using **Juggernaut XL (SDXL)** via ComfyUI, also see:
- `specs/mage/zelos-juggernaut-prompts.md`

If you are using **Animagine XL 3.x (SDXL)** via ComfyUI, also see:
- `specs/mage/zelos-animagine-prompts.md`
- `scripts/comfyui/ANIMAGINE_XL_PROMPTING.md`

If you are testing additional SDXL checkpoints via ComfyUI, also see:
- ProtoVision XL: `specs/mage/zelos-protovision-prompts.md`
- SDXL base: `specs/mage/zelos-sdxl-prompts.md`
- Copax Timeless: `specs/mage/zelos-copax-prompts.md`

General rules
- Style: 2D/2.5D flat vector, clean lines, subtle gradients, neon glow accents.
- Not allowed: photorealistic, pixel art, heavy texture noise, 3D render.
- Lighting: top-left, soft glow edges.
- Background: transparent for sprites and UI elements.
- Palette (use as a lock):
  #0a0a0f #12121a #1a1a2e #252538 #2f2f45
  #00f5ff #ff00ff #39ff14 #ff6b35 #ff073a
  #bf00ff #fff01f #ff69b4 #f0f0f5 #a0a0b0 #606070

Consistency prompt header (prepend to all prompts)
"Zelos V2 style, 2D flat vector, clean lines, subtle gradients, neon cyan accents,
consistent line weight, top-left lighting, transparent background"

Recommended Mage AI settings (starting point)
- Size: match the requested output exactly
- Steps: 24-32 (start 28)
- CFG/Guidance: 6-8 (start 7)
- Seed: keep fixed within a set for consistency

Consistency tips
- For outfits and expressions, use image-to-image or reference image if Mage AI
  supports it, with the base view as reference.
- Keep the same seed and prompt base, then only change the outfit/expression line.

Global negative prompt (base)
"photorealistic, pixel art, 3d render, noisy, grainy, blurry, watermark, text, logo,
low detail, bad anatomy, extra limbs, inconsistent line weight, inconsistent lighting"

---

## Astro-Duck base views (undersuit only)

[MagePrompt]
Title: Astro-Duck Base - Front
Prompt: "Cute cartoon duck mascot in a minimal undersuit (no outer suit), 2D flat vector, clean lines, subtle gradients, neon cyan accents, bubble helmet optional but transparent, chibi proportions (head 40% of body height), front view, centered, consistent line weight, top-left lighting, transparent background"
Negative: Global
Size: 1024x1024
Notes: Match proportions and framing with side/three-quarter views.

[MagePrompt]
Title: Astro-Duck Base - Side
Prompt: "Cute cartoon duck mascot in a minimal undersuit (no outer suit), 2D flat vector, clean lines, subtle gradients, neon cyan accents, bubble helmet optional but transparent, chibi proportions (head 40% of body height), side view, centered, consistent line weight, top-left lighting, transparent background"
Negative: Global
Size: 1024x1024
Notes: Keep head height and body scale identical to front view.

[MagePrompt]
Title: Astro-Duck Base - Three-Quarter
Prompt: "Cute cartoon duck mascot in a minimal undersuit (no outer suit), 2D flat vector, clean lines, subtle gradients, neon cyan accents, bubble helmet optional but transparent, chibi proportions (head 40% of body height), three-quarter view, centered, consistent line weight, top-left lighting, transparent background"
Negative: Global
Size: 1024x1024
Notes: Keep head height and body scale identical to front view.

## Astro-Duck spritesheets (base)

[MagePrompt]
Title: Astro-Duck Base Idle Sheet
Prompt: "8-frame horizontal sprite sheet, cute cartoon duck in minimal undersuit, floating idle animation, 2D flat vector, clean lines, neon cyan accents, transparent background, each frame 256x256, total size 2048x256"
Negative: Global
Size: 2048x256
Notes: Keep frames aligned; no cropping.

[MagePrompt]
Title: Astro-Duck Base Fly Sheet
Prompt: "6-frame horizontal sprite sheet, cute cartoon duck in minimal undersuit, jetpack flying animation, 2D flat vector, neon cyan glow, transparent background, each frame 256x256, total size 1536x256"
Negative: Global
Size: 1536x256
Notes: Keep frames aligned; no cropping.

## Astro-Duck expressions (overlay, per view)

Template (repeat for each expression + each view)
[MagePrompt]
Title: Astro-Duck Expression - {expression} - {view}
Prompt: "Astro-Duck face overlay only, {expression} expression, 2D flat vector, clean lines, neon cyan accents, transparent background, aligned to base face, {view} view"
Negative: Global
Size: 1024x1024
Notes: Face-only overlay; no body.

Expressions list
- happy, excited, curious, concerned, celebrating, sleeping, waving, pointing
Views list
- front, side, three-quarter
Notes: Action-like ids (celebrating/sleeping/waving/pointing) remain face-only
overlays for outfit swap compatibility; keep any extra glyphs near the head.

## Astro-Duck full-body poses (base + per outfit)

Base pose template (repeat for each pose + each view)
[MagePrompt]
Title: Astro-Duck Pose - {pose} - {view}
Prompt: "Astro-Duck full-body pose {pose}, minimal undersuit (no outer suit), 2D flat vector, clean lines, subtle gradients, neon cyan accents, {view} view, transparent background, centered"
Negative: Global
Size: 1024x1024
Notes: Full-body pose includes the gesture; keep proportions identical to base views.

Pose list (full-body)
- celebrating: arms up, slight bounce, small confetti or sparkles near head
- sleeping: curled float, eyes closed, small Z glyphs near head
- waving: one wing raised, friendly lean
- pointing: one wing extended, slight lean toward point direction

Outfit pose overlay template (repeat for each outfit + each pose + each view)
[MagePrompt]
Title: Astro-Duck Outfit Pose Overlay - {outfit} - {pose} - {view}
Prompt: "Astro-Duck outfit overlay only (no body), matched to pose {pose}, {outfit description}, 2D flat vector, clean lines, neon cyan accents, transparent background, aligned to base pose, {view} view"
Negative: Global
Size: 1024x1024
Notes: Overlay only; preserve silhouette and pose alignment.

Batch generation: 11 outfits × 4 poses × 3 views = 132 assets.
Recommended workflow:
1. Generate all views for one outfit+pose combo before moving to next.
2. Lock seed per outfit to maintain costume consistency across poses/views.
3. Use image-to-image with base pose as reference for alignment.
See astro-duck-outfits.json poseVariants.pattern for output paths.

## Astro-Duck outfits (overlay, per view)

Template (repeat for each outfit + each view)
[MagePrompt]
Title: Astro-Duck Outfit - {outfit} - {view}
Prompt: "Astro-Duck outfit overlay only (no body), {outfit description}, 2D flat vector, clean lines, neon cyan accents, transparent background, aligned to base undersuit, {view} view"
Negative: Global
Size: 1024x1024
Notes: Overlay only; preserve silhouette.

Outfit list
- outfit-default-suit: space suit overlay with cyan trim
- outfit-pirate: tricorn hat, eye patch, small cape
- outfit-wizard: starry hat, glowing cyan wand
- outfit-detective: deerstalker hat, magnifying glass
- outfit-chef: chef hat, apron, glowing spatula
- outfit-superhero: cape, small mask
- outfit-scientist: lab goggles, glowing beaker
- outfit-musician: neon headphones, small synth
- outfit-explorer: safari hat, binoculars
- outfit-ninja: headband, throwing star
- outfit-royal: crown, royal cape

## Astro-Duck outfit animation overlays (idle/fly sheets)

Template (repeat for each outfit)
[MagePrompt]
Title: Astro-Duck Outfit Idle Sheet - {outfit}
Prompt: "8-frame horizontal sprite sheet, Astro-Duck outfit overlay only (no body), {outfit description}, idle animation overlay aligned to base idle sheet, 2D flat vector, clean lines, neon cyan accents, transparent background, each frame 256x256, total size 2048x256"
Negative: Global
Size: 2048x256
Notes: Overlay only; match base idle sheet frame order and alignment.

[MagePrompt]
Title: Astro-Duck Outfit Fly Sheet - {outfit}
Prompt: "6-frame horizontal sprite sheet, Astro-Duck outfit overlay only (no body), {outfit description}, fly animation overlay aligned to base fly sheet, 2D flat vector, clean lines, neon cyan accents, transparent background, each frame 256x256, total size 1536x256"
Negative: Global
Size: 1536x256
Notes: Overlay only; match base fly sheet frame order and alignment.

## Planets (composite-friendly)

Template (one per texture)
[MagePrompt]
Title: Planet Texture - {texture}
Prompt: "Planet icon texture, 2D flat vector, subtle gradients, clean edges, neon glow rim, transparent background, centered, 512x512"
Negative: Global
Size: 512x512
Notes: No rings; texture only.

Rings
[MagePrompt]
Title: Planet Rings - {color}
Prompt: "Saturn-like rings overlay, 2D flat vector, subtle gradient, semi-transparent, centered, 512x256, transparent background"
Negative: Global
Size: 512x256

Atmosphere
[MagePrompt]
Title: Atmosphere - {type}
Prompt: "Planet atmosphere halo overlay, soft gradient ring, {type} thickness, transparent background, 600x600"
Negative: Global
Size: 600x600

Moon (small)
[MagePrompt]
Title: Planet Moon - Small
Prompt: "Small moon sprite, simple crater details, subtle glow, 2D flat vector, 64x64, transparent background"
Negative: Global
Size: 64x64

States (overlays)
[MagePrompt]
Title: Planet State - {state}
Prompt: "Planet state overlay badge/glow, {state} style, neon accent, transparent background, 512x512"
Negative: Global
Size: 512x512

## Satellites (composite-friendly)

Template (icon base)
[MagePrompt]
Title: Satellite Icon - {icon}
Prompt: "Satellite icon, 2D flat vector, clean lines, neon cyan glow, transparent background, 128x128"
Negative: Global
Size: 128x128

State overlays
[MagePrompt]
Title: Satellite State - {state}
Prompt: "Satellite state overlay ring/glow, {state} style, transparent background, 128x128"
Negative: Global
Size: 128x128

Glow overlays
[MagePrompt]
Title: Satellite Glow - {state}
Prompt: "Satellite glow overlay, {state} style (hover/selected/error), soft neon halo ring, transparent background, 128x128"
Negative: Global
Size: 128x128

Badge overlays
[MagePrompt]
Title: Satellite Badge - {state}
Prompt: "Satellite badge overlay, {state} style (warning/error), small badge anchored to lower-right corner, transparent background, 128x128"
Negative: Global
Size: 128x128

## Stargate (composite-friendly)

[MagePrompt]
Title: Stargate Ring
Prompt: "Sci-fi portal ring, dark metallic gray, cyan inner glow, geometric engravings, 2D flat vector, transparent center, 1024x1024"
Negative: Global
Size: 1024x1024

[MagePrompt]
Title: Stargate Glyphs Sheet
Prompt: "12 sci-fi glyphs, geometric, 2D flat vector, cyan glow option, 4x3 grid inside a 1024x1024 canvas, transparent background"
Negative: Global
Size: 1024x1024

[MagePrompt]
Title: Stargate Glyphs Active Sheet
Prompt: "12 sci-fi glyphs, geometric, 2D flat vector, activated glow state, brighter cyan halo, 4x3 grid inside a 1024x1024 canvas, transparent background"
Negative: Global
Size: 1024x1024

[MagePrompt]
Title: Portal Energy
Prompt: "Swirling portal energy texture, blue to cyan gradient, hints of magenta, seamless tile, 1024x1024, transparent edges"
Negative: Global
Size: 1024x1024

[MagePrompt]
Title: Warp Streaks
Prompt: "Warp speed star streaks, radial blur lines, cyan and magenta trails, transparent background, 1024x1024"
Negative: Global
Size: 1024x1024

[MagePrompt]
Title: Stargate Particles
Prompt: "Stargate particle overlay, tiny glowing motes and arcs, cyan/magenta accents, 2D flat vector, transparent background, 1024x1024"
Negative: Global
Size: 1024x1024

[MagePrompt]
Title: Glow Cyan
Prompt: "Soft cyan glow blob, radial gradient, subtle bloom, 2D flat vector, transparent background, 512x512"
Negative: Global
Size: 512x512

## Backgrounds

[MagePrompt]
Title: Starfield Tile
Prompt: "Seamless starfield tile, deep blue-black background, varied star sizes, subtle glow, 1920x1080"
Negative: Global
Size: 1920x1080

[MagePrompt]
Title: Starfield Tile (1024)
Prompt: "Seamless starfield tile, deep blue-black background, varied star sizes, subtle glow, 1024x1024"
Negative: Global
Size: 1024x1024

[MagePrompt]
Title: Nebula Overlay
Prompt: "Subtle nebula clouds overlay, semi-transparent, cyan and magenta hints, 1920x1080"
Negative: Global
Size: 1920x1080

[MagePrompt]
Title: Nebula Overlay (2048x1024)
Prompt: "Subtle nebula clouds overlay, semi-transparent, cyan and magenta hints, 2048x1024"
Negative: Global
Size: 2048x1024

[MagePrompt]
Title: Constellation Overlay
Prompt: "Constellation line overlay, thin lines, subtle gray, tileable, 1920x1080"
Negative: Global
Size: 1920x1080

[MagePrompt]
Title: Vignette Soft
Prompt: "Soft edge vignette overlay, dark corners fading to transparent center, 2D flat vector, 1920x1080"
Negative: Global
Size: 1920x1080
Notes: Shared asset for general UI and shooter FX; no separate shooter variant needed.

[MagePrompt]
Title: Office Vignette Background
Prompt: "Office vignette background for menu/loading, Astro-Duck not required, sleek desk, headset resting near a glowing PC monitor with abstract UI shapes (no text), soft neon cyan and magenta accents, 2D flat vector, subtle gradients, 1920x1080"
Negative: Global
Size: 1920x1080

## UI Components

[MagePrompt]
Title: Modal Frame
Prompt: "Futuristic modal frame, 2D flat vector, cyan border glow, dark translucent panel, 800x600, transparent background"
Negative: Global
Size: 800x600

[MagePrompt]
Title: Primary Button States
Prompt: "Primary button states in one sheet: normal, hover, pressed, disabled, cyan gradient, 2D flat vector, 200x50 each, horizontal strip"
Negative: Global
Size: 800x50

[MagePrompt]
Title: Input Field States
Prompt: "Input field states in one sheet: normal, focused, error, disabled, 300x50 each, horizontal strip, 2D flat vector"
Negative: Global
Size: 1200x50

[MagePrompt]
Title: Toast Variants
Prompt: "Toast notifications sheet: success, error, warning, info, 350x80 each, horizontal strip, 2D flat vector"
Negative: Global
Size: 1400x80

## Space piano (UI easter egg)

[MagePrompt]
Title: Space Piano Panel
Prompt: "Floating space piano panel UI, 2 octaves (24 keys), futuristic holographic feel, dark panel with cyan accents, 2D flat vector, 600x200, transparent background, no text"
Negative: Global
Size: 600x200

[MagePrompt]
Title: Space Piano Key Glow - White
Prompt: "Key press glow effect for a white piano key, neon cyan glow, 2D flat vector, transparent background, 50x150"
Negative: Global
Size: 50x150

[MagePrompt]
Title: Space Piano Key Glow - Black
Prompt: "Key press glow effect for a black piano key, neon magenta glow, 2D flat vector, transparent background, 30x100"
Negative: Global
Size: 30x100

[MagePrompt]
Title: Space Piano Key Glow Sheet - White (4 frames)
Prompt: "4-frame horizontal sprite sheet of a white piano key glow pulse, neon cyan, 2D flat vector, transparent background, each frame 50x150"
Negative: Global
Size: 200x150

[MagePrompt]
Title: Space Piano Key Glow Sheet - Black (4 frames)
Prompt: "4-frame horizontal sprite sheet of a black piano key glow pulse, neon magenta, 2D flat vector, transparent background, each frame 30x100"
Negative: Global
Size: 120x100

## Badges

[MagePrompt]
Title: Badge Frames - Rarity Set
Prompt: "Achievement badge frames (common, uncommon, rare, epic, legendary) in a row, 2D flat vector, glowing accents, 128x128 each, transparent background"
Negative: Global
Size: 640x128

[MagePrompt]
Title: Badge Icon - {name}
Prompt: "Achievement icon {name}, 2D flat vector, neon accent, transparent background, 64x64"
Negative: Global
Size: 64x64

Badge icon list
- first-flight
- explorer
- speed-demon
- night-owl
- perfectionist
- piano-master

## Misc

[MagePrompt]
Title: Loading Spinner
Prompt: "Space-themed loading spinner, orbital rings, cyan and magenta accents, 2D flat vector, 64x64"
Negative: Global
Size: 64x64

[MagePrompt]
Title: Loading Spinner Sheet (8 frames)
Prompt: "8-frame horizontal sprite sheet of a space-themed loading spinner, orbital rings rotating, cyan/magenta accents, 2D flat vector, each frame 64x64, transparent background"
Negative: Global
Size: 512x64

[MagePrompt]
Title: Cursor Set
Prompt: "Custom cursor set: pointer, hand, text, loading, 32x32 each, 2D flat vector, neon cyan glow, transparent background"
Negative: Global
Size: 128x32

[MagePrompt]
Title: Empty State Illustration
Prompt: "Astro-Duck floating in space, subtle stars, 2D flat vector, hopeful mood, 400x300, transparent background"
Negative: Global
Size: 400x300

## Video prompts (short cinematics)

Use these as storyboard/video prompts for AI video tools. Keep shots short,
simple, and consistent with the Zelos palette and glow style. Do not add any
on-screen text or logos (text-free).

[MageVideo]
Title: Office Briefing
Prompt: "Astro-Duck at a sleek office desk, wearing a headset, facing a glowing PC monitor with abstract UI shapes (no text), neon cyan accents, 2D flat vector style, soft top-left light, subtle ambient motion"
Duration: 6-8s
Aspect: 16:9

[MageVideo]
Title: Intro Briefing L1
Prompt: "Astro-Duck launches from a small satellite dock, starfield backdrop, neon cyan accents, 2D flat vector style, gentle parallax, cinematic pan"
Duration: 7s
Aspect: 16:9

[MageVideo]
Title: Stargate Travel
Prompt: "Stargate travel interstitial, portal ring ignites, warp streaks pull toward center, cyan and magenta glow, 2D flat vector style, smooth forward motion, no text"
Duration: 5-7s
Aspect: 16:9

[MageVideo]
Title: Boss Intro L1
Prompt: "Small drone swarm parts to reveal a glowing core, dramatic cyan pulse, 2D flat vector, subtle particles"
Duration: 6s
Aspect: 16:9

[MageVideo]
Title: Intro Briefing L2
Prompt: "Tech planet fills frame, satellite icons orbit, cyan data scan sweeps, 2D flat vector style"
Duration: 7s
Aspect: 16:9

[MageVideo]
Title: Boss Intro L2
Prompt: "Nebula Leviathan silhouette emerges from magenta fog, bright core glow, particles drifting"
Duration: 6s
Aspect: 16:9

[MageVideo]
Title: Mid-Arc L3 Stargate
Prompt: "Stargate ring hums, glyphs flicker on, portal energy swirls, cyan glow intensifies"
Duration: 8s
Aspect: 16:9

[MageVideo]
Title: Boss Intro L3
Prompt: "Orbital Core rotates, energy rings ignite, shockwave ring expands, 2D flat vector"
Duration: 7s
Aspect: 16:9

[MageVideo]
Title: Intro Briefing L4
Prompt: "Nebula drift, warning lights pulse, enemy silhouettes flash by, fast camera push"
Duration: 7s
Aspect: 16:9

[MageVideo]
Title: Boss Intro L4
Prompt: "Reactor Guardian powers up, armor cracks glow, sparks fall, cyan/orange accents"
Duration: 7s
Aspect: 16:9

[MageVideo]
Title: Intro Briefing L5
Prompt: "Deep space void, stargate shards reassemble, faint glyph trail, quiet tension"
Duration: 8s
Aspect: 16:9

[MageVideo]
Title: Final Boss Intro L5
Prompt: "Sky Serpent coils across screen, exposed core glow, shockwave ripple, dramatic reveal"
Duration: 10-12s
Aspect: 16:9

[MageVideo]
Title: Outro Wrap
Prompt: "Astro-Duck returns to a calm orbit, planets align, soft cyan glow, gentle fade-out"
Duration: 8s
Aspect: 16:9

## Quiz overlays (Jump & Run)

[MagePrompt]
Title: Quiz Glyphs Prompt Overlay
Prompt: "Transparent UI overlay with 3 highlighted stargate glyph slots, subtle cyan glow rings, no text, 2D flat vector, 1920x1080"
Negative: Global
Size: 1920x1080

[MagePrompt]
Title: Quiz Glyphs Panel
Prompt: "Compact UI panel for glyph input, rounded rectangle with cyan border glow, subtle dark fill, no text, 2D flat vector, 800x240, 9-slice ready"
Negative: Global
Size: 800x240

## Shooter weapon effects (Mage AI prompts)

Template (repeat per weapon + element)
[MagePrompt]
Title: Weapon {weapon} - {element}
Prompt: "{weapon} {element} for space shooter, 2D flat vector, neon glow accents, transparent background, consistent style with Zelos, {size}"
Negative: Global
Size: {size}

Recommended weapons
- W1 Single Shot (cyan): projectile 64x64, muzzle 64x64, impact 128x128
- W2 Spread Shot (cyan+magenta): projectile 64x64, muzzle 64x64, impact 128x128
- W3 Laser Beam (cyan): beam 256x64, caps 128x64
- W4 Homing Missile (lime): missile 96x96, smoke trail 128x128, explosion 256x256
- W5 Plasma Orb (magenta): orb 96x96, trail 128x128, impact 256x256
- W6 Bomb (orange): bomb 96x96, explosion 384x384
- W7 Rail Shot (blue-white): projectile 64x64, muzzle 64x64, impact 128x128
- W8 Shockwave Pulse (violet): ring 256x256, impact 256x256
- W9 Ice Shard (pale cyan): shard 64x64, impact 128x128

Upgrade levels
- Create L1/L2/L3/L4/L5 variants per weapon element:
  - W1/W2/W7/W9: projectile + impact
  - W4/W6: projectile + explosion
  - W5: projectile + impact
  - W8: ring + impact

## Shooter player (Astro-Duck ship)

[MagePrompt]
Title: Shooter Player - Idle
Prompt: "Astro-Duck ship idle animation, 8-frame horizontal sheet, 2D flat vector, neon cyan accents, transparent background, each frame 256x256"
Negative: Global
Size: 2048x256

[MagePrompt]
Title: Shooter Player - Thrust
Prompt: "Astro-Duck ship thrust animation, 8-frame horizontal sheet, stronger jetpack flames, neon cyan/magenta accents, transparent background, each frame 256x256"
Negative: Global
Size: 2048x256

[MagePrompt]
Title: Shooter Player - Bank Left
Prompt: "Astro-Duck ship bank left animation, 4-frame horizontal sheet, neon cyan accents, transparent background, each frame 256x256"
Negative: Global
Size: 1024x256

[MagePrompt]
Title: Shooter Player - Bank Right
Prompt: "Astro-Duck ship bank right animation, 4-frame horizontal sheet, neon cyan accents, transparent background, each frame 256x256"
Negative: Global
Size: 1024x256

[MagePrompt]
Title: Shooter Player - Shoot
Prompt: "Astro-Duck ship shoot animation, 4-frame horizontal sheet, slight recoil, neon cyan accents, transparent background, each frame 256x256"
Negative: Global
Size: 1024x256

[MagePrompt]
Title: Shooter Player - Hit
Prompt: "Astro-Duck ship hit flash animation, 2-frame horizontal sheet, neon cyan glow, transparent background, each frame 256x256"
Negative: Global
Size: 512x256

[MagePrompt]
Title: Shooter Player - Death
Prompt: "Astro-Duck ship death/explosion animation, 12-frame horizontal sheet, neon cyan/magenta accents, transparent background, each frame 256x256"
Negative: Global
Size: 3072x256

## Platformer player (Astro-Duck)

[MagePrompt]
Title: Platformer Player - Idle
Prompt: "Astro-Duck platformer idle animation, 6-frame horizontal sheet, 2D flat vector, neon cyan accents, transparent background, each frame 256x256"
Negative: Global
Size: 1536x256

[MagePrompt]
Title: Platformer Player - Run
Prompt: "Astro-Duck platformer run animation, 10-frame horizontal sheet, 2D flat vector, neon cyan accents, transparent background, each frame 256x256"
Negative: Global
Size: 2560x256

[MagePrompt]
Title: Platformer Player - Jump Start
Prompt: "Astro-Duck platformer jump start, 2-frame horizontal sheet, 2D flat vector, neon cyan accents, transparent background, each frame 256x256"
Negative: Global
Size: 512x256

[MagePrompt]
Title: Platformer Player - Jump Apex
Prompt: "Astro-Duck platformer jump apex, single frame, 2D flat vector, neon cyan accents, transparent background, 256x256"
Negative: Global
Size: 256x256

[MagePrompt]
Title: Platformer Player - Fall
Prompt: "Astro-Duck platformer fall animation, 2-frame horizontal sheet, 2D flat vector, neon cyan accents, transparent background, each frame 256x256"
Negative: Global
Size: 512x256

[MagePrompt]
Title: Platformer Player - Land
Prompt: "Astro-Duck platformer land animation, 2-frame horizontal sheet, 2D flat vector, neon cyan accents, transparent background, each frame 256x256"
Negative: Global
Size: 512x256

[MagePrompt]
Title: Platformer Player - Crouch
Prompt: "Astro-Duck platformer crouch animation, 2-frame horizontal sheet, 2D flat vector, neon cyan accents, transparent background, each frame 256x256"
Negative: Global
Size: 512x256

[MagePrompt]
Title: Platformer Player - Climb
Prompt: "Astro-Duck platformer climb animation, 6-frame horizontal sheet, 2D flat vector, neon cyan accents, transparent background, each frame 256x256"
Negative: Global
Size: 1536x256

[MagePrompt]
Title: Platformer Player - Hit
Prompt: "Astro-Duck platformer hit flash animation, 2-frame horizontal sheet, 2D flat vector, neon cyan accents, transparent background, each frame 256x256"
Negative: Global
Size: 512x256

[MagePrompt]
Title: Platformer Player - Death
Prompt: "Astro-Duck platformer death animation, 10-frame horizontal sheet, 2D flat vector, neon cyan accents, transparent background, each frame 256x256"
Negative: Global
Size: 2560x256

## Shooter weapon upgrades (Mage AI prompts)

[MagePrompt]
Title: Weapon Upgrade - Small Projectile
Prompt: "Weapon upgrade projectile (small), 2 frames, neon cyan/magenta accents, 2D flat vector, transparent background, 64x64 each, horizontal sheet"
Negative: Global
Size: 128x64

[MagePrompt]
Title: Weapon Upgrade - Small Impact
Prompt: "Weapon upgrade impact (small), 4 frames, neon cyan/magenta accents, 2D flat vector, transparent background, 128x128 each, horizontal sheet"
Negative: Global
Size: 512x128

[MagePrompt]
Title: Weapon Upgrade - Medium Projectile
Prompt: "Weapon upgrade projectile (medium), 4 frames, neon cyan/magenta accents, 2D flat vector, transparent background, 96x96 each, horizontal sheet"
Negative: Global
Size: 384x96

[MagePrompt]
Title: Weapon Upgrade - Bomb Projectile
Prompt: "Weapon upgrade projectile (bomb), 2 frames, neon cyan/magenta accents, 2D flat vector, transparent background, 96x96 each, horizontal sheet"
Negative: Global
Size: 192x96

[MagePrompt]
Title: Weapon Upgrade - Explosion (Medium)
Prompt: "Weapon upgrade explosion (medium), 6 frames, neon cyan/magenta accents, 2D flat vector, transparent background, 256x256 each, horizontal sheet"
Negative: Global
Size: 1536x256

[MagePrompt]
Title: Weapon Upgrade - Impact (Large)
Prompt: "Weapon upgrade impact (large), 6 frames, neon cyan/magenta accents, 2D flat vector, transparent background, 256x256 each, horizontal sheet"
Negative: Global
Size: 1536x256

[MagePrompt]
Title: Weapon Upgrade - Explosion (Large)
Prompt: "Weapon upgrade explosion (large), 8 frames, neon cyan/magenta accents, 2D flat vector, transparent background, 384x384 each, horizontal sheet"
Negative: Global
Size: 3072x384

[MagePrompt]
Title: Weapon Upgrade - Shockwave Ring
Prompt: "Weapon upgrade shockwave ring, 4 frames, neon cyan/magenta accents, 2D flat vector, transparent background, 256x256 each, horizontal sheet"
Negative: Global
Size: 1024x256

[MagePrompt]
Title: Weapon Upgrade - Shockwave Impact
Prompt: "Weapon upgrade impact (ring), 4 frames, neon cyan/magenta accents, 2D flat vector, transparent background, 256x256 each, horizontal sheet"
Negative: Global
Size: 1024x256

## Shooter assets (enemies, pickups, FX, projectiles)

[MagePrompt]
Title: Shooter Enemy - {enemy} - Idle
Prompt: "Space shooter enemy {enemy}, idle animation, 2D flat vector, neon glow accents, transparent background, {size}, 6-frame horizontal sprite sheet"
Negative: Global
Size: {sheetSize}

[MagePrompt]
Title: Shooter Enemy - {enemy} - Hit
Prompt: "Space shooter enemy {enemy}, hit flash animation, 2D flat vector, neon glow accents, transparent background, {size}, 2-frame horizontal sprite sheet"
Negative: Global
Size: {sheetSize}

[MagePrompt]
Title: Shooter Enemy - {enemy} - Explode
Prompt: "Space shooter enemy {enemy}, explode animation, 2D flat vector, neon glow accents, transparent background, {size}, 8-frame horizontal sprite sheet"
Negative: Global
Size: {sheetSize}

[MagePrompt]
Title: Shooter Pickups
Prompt: "Space shooter pickups (shield, double-shot, speed-boost, coin), 2D flat vector, neon glow accents, transparent background, 64x64 per frame, 4-6 frame horizontal sheets as specified"
Negative: Global
Size: "Varies by pickup"

[MagePrompt]
Title: Shooter Projectiles
Prompt: "Space shooter projectiles (player, charged, enemy, impact spark), 2D flat vector, neon glow accents, transparent background, 64x64/128x128 frames, 2-6 frame horizontal sheets as specified"
Negative: Global
Size: "Varies by projectile"

[MagePrompt]
Title: Shooter FX
Prompt: "Space shooter FX (engine trail + explosions small/medium/large), 2D flat vector, neon glow accents, transparent background, 128x128/256x256/384x384 frames, 6-12 frame horizontal sheets as specified"
Negative: Global
Size: "Varies by FX"

Shooter enemy size map
- enemy-a / enemy-d: 128x128 (sheet 768x128 idle, 256x128 hit, 1024x128 explode)
- enemy-b / enemy-f / enemy-g: 192x192 (sheet 1152x192 idle, 384x192 hit, 1536x192 explode)
- enemy-c: 256x256 (sheet 1536x256 idle, 512x256 hit, 2048x256 explode)
- enemy-e: 160x160 (sheet 960x160 idle, 320x160 hit, 1280x160 explode)

Shooter pickup sheets
- shield/double-shot/speed-boost: 4 frames @ 64x64 (sheet 256x64)
- coin: 6 frames @ 64x64 (sheet 384x64)

Shooter projectile sheets
- shot-player: 2 frames @ 64x64 (sheet 128x64)
- shot-charged: 4 frames @ 64x64 (sheet 256x64)
- shot-enemy: 2 frames @ 64x64 (sheet 128x64)
- impact-spark: 6 frames @ 128x128 (sheet 768x128)

Shooter FX sheets
- engine-trail: 6 frames @ 128x128 (sheet 768x128)
- explosion-small: 8 frames @ 128x128 (sheet 1024x128)
- explosion-medium: 10 frames @ 256x256 (sheet 2560x256)
- explosion-large: 12 frames @ 384x384 (sheet 4608x384)

## Platformer assets (tiles, enemies, collectibles, FX)

[MagePrompt]
Title: Platformer Tiles
Prompt: "Platformer tiles (ground, platform mid/end/corner, moving platform idle/active, spikes), 2D flat vector, neon accents, transparent background, 256x256 each"
Negative: Global
Size: 256x256

[MagePrompt]
Title: Platformer Hazard - Lava Sheet
Prompt: "Animated lava hazard tile, 6-frame horizontal sprite sheet, 2D flat vector, neon orange/red accents, transparent background, each frame 256x256, total size 1536x256"
Negative: Global
Size: 1536x256

[MagePrompt]
Title: Platformer Enemies
Prompt: "Platformer enemy {enemy}, idle animation, 2D flat vector, neon accents, transparent background, {size}, 6-frame horizontal sheet"
Negative: Global
Size: {sheetSize}

[MagePrompt]
Title: Platformer Enemies - Hit
Prompt: "Platformer enemy {enemy}, hit flash, 2D flat vector, neon accents, transparent background, {size}, 2-frame horizontal sheet"
Negative: Global
Size: {sheetSize}

[MagePrompt]
Title: Platformer Enemies - Defeat
Prompt: "Platformer enemy {enemy}, defeat animation, 2D flat vector, neon accents, transparent background, {size}, 6-frame horizontal sheet"
Negative: Global
Size: {sheetSize}

[MagePrompt]
Title: Platformer Collectibles
Prompt: "Platformer collectibles (coin, checkpoint flag), 2D flat vector, neon accents, transparent background, 64x64 frames, 4-6 frame horizontal sheets as specified"
Negative: Global
Size: "Varies by collectible"

[MagePrompt]
Title: Platformer FX
Prompt: "Platformer FX (dust puff, jump trail, hit spark), 2D flat vector, neon accents, transparent background, 128x128 frames, 4-frame horizontal sheets"
Negative: Global
Size: 512x128

Platformer enemy size map
- slime/drone/spiker/beetle/bat: 128x128 (sheet 768x128 idle, 256x128 hit, 768x128 defeat)
- cannon-bot: 192x192 (sheet 1152x192 idle, 384x192 hit, 1152x192 defeat)

Platformer collectible sheets
- coin: 6 frames @ 64x64 (sheet 384x64)
- checkpoint-flag: 4 frames @ 64x64 (sheet 256x64)

Platformer FX sheets
- dust-puff/jump-trail/hit-spark: 4 frames @ 128x128 (sheet 512x128)

## Shooter UI (weapons)

[MagePrompt]
Title: Weapon Icons Sheet
Prompt: "Weapon UI icons for W1-W9, 2D flat vector, neon cyan/magenta accents, transparent background, 9 icons in a row, each 64x64"
Negative: Global
Size: 576x64

[MagePrompt]
Title: Weapon Level Pips
Prompt: "Weapon level pips, 5 small glowing dots/badges, 2D flat vector, transparent background, 16x16 each, 5 in a row"
Negative: Global
Size: 80x16

[MagePrompt]
Title: Shooter Health Bar States
Prompt: "Health bar UI states (full, mid, low, empty), sleek sci-fi style, cyan accents, 2D flat vector, transparent background, 4 states in a row, each 256x32"
Negative: Global
Size: 1024x32

[MagePrompt]
Title: Shooter Score Icons
Prompt: "Score/collectible UI icons (6 variants), neon cyan/magenta accents, 2D flat vector, transparent background, 6 icons in a row, each 64x64, order left-to-right: score, coin, time, combo, bonus, special"
Negative: Global
Size: 384x64

[MagePrompt]
Title: Shooter Pause Overlay
Prompt: "Fullscreen pause overlay, dark translucent panel with subtle cyan glow corners, icon-only (no text), 2D flat vector, 1920x1080"
Negative: Global
Size: 1920x1080

## Platformer UI

[MagePrompt]
Title: Platformer Health Hearts
Prompt: "Health hearts UI states (full, half, empty), 2D flat vector, neon cyan outline, transparent background, 3 icons in a row, each 64x64"
Negative: Global
Size: 192x64

[MagePrompt]
Title: Platformer Score Icons
Prompt: "Score/collectible UI icons (6 variants), 2D flat vector, neon accents, transparent background, 6 icons in a row, each 64x64, order left-to-right: score, coin, time, combo, bonus, special"
Negative: Global
Size: 384x64

## Boss dramatics (Mage AI prompts)

Template (per boss phase element)
[MagePrompt]
Title: Boss {boss} - Phase {phase} - {element}
Prompt: \"{boss} boss phase {phase} {element}, cinematic scale, bright neon glows, layered energy arcs, 2D flat vector, transparent background, consistent with Zelos palette, {size}\"
Negative: Global
Size: {size}

Suggested elements
- Phase 1: aura glow, minor particle drift
- Phase 2: ring arcs, crack highlights, wide telegraph
- Phase 3: exposed core glow, particle rain, shockwave ring
- Defeat: explosion chain, screen flash overlay

Boss state mapping (zelos-minigame-asset-index.json):
| Prompt Phase | Index States |
|--------------|---------------|
| Phase 1 | idle, windup |
| Phase 2 | attack, hit |
| Phase 3 | phase (transition) |
| Defeat | defeat |

### Concrete boss prompts

[MagePrompt]
Title: Orbital Core - Phase 1 - Aura
Prompt: \"Orbital Core boss, phase 1 aura glow, subtle particle drift, 2D flat vector, neon cyan accents, transparent background, 512x512\"
Negative: Global
Size: 512x512

[MagePrompt]
Title: Orbital Core - Phase 2 - Rings
Prompt: \"Orbital Core boss, phase 2 energy ring arcs, brighter core, 2D flat vector, neon cyan and magenta accents, transparent background, 512x512\"
Negative: Global
Size: 512x512

[MagePrompt]
Title: Orbital Core - Phase 3 - Exposed Core
Prompt: \"Orbital Core boss, phase 3 cracked shell with exposed core glow, particle rain, 2D flat vector, neon accents, transparent background, 512x512\"
Negative: Global
Size: 512x512

[MagePrompt]
Title: Orbital Core - Defeat - Explosion Chain
Prompt: \"Orbital Core defeat explosion chain with shockwave ring, bright flash overlay, 2D flat vector, transparent background, 512x512\"
Negative: Global
Size: 512x512

[MagePrompt]
Title: Nebula Leviathan - Phase 1 - Aura
Prompt: \"Nebula Leviathan boss, phase 1 aura glow, flowing nebula body, 2D flat vector, cyan/magenta accents, transparent background, 768x512\"
Negative: Global
Size: 768x512

[MagePrompt]
Title: Nebula Leviathan - Phase 2 - Rings
Prompt: \"Nebula Leviathan boss, phase 2 energy arcs and bright core, 2D flat vector, neon cyan/magenta, transparent background, 768x512\"
Negative: Global
Size: 768x512

[MagePrompt]
Title: Nebula Leviathan - Phase 3 - Exposed Core
Prompt: \"Nebula Leviathan boss, phase 3 cracked plates with exposed core, particle rain, 2D flat vector, neon accents, transparent background, 768x512\"
Negative: Global
Size: 768x512

[MagePrompt]
Title: Nebula Leviathan - Defeat - Shockwave
Prompt: \"Nebula Leviathan defeat sequence, explosion chain and shockwave ring, bright flash overlay, 2D flat vector, transparent background, 768x512\"
Negative: Global
Size: 768x512

[MagePrompt]
Title: Reactor Guardian - Phase 1 - Aura
Prompt: \"Reactor Guardian boss, phase 1 aura glow, subtle sparks, 2D flat vector, neon cyan accents, transparent background, 768x512\"
Negative: Global
Size: 768x512

[MagePrompt]
Title: Reactor Guardian - Phase 2 - Cracks
Prompt: \"Reactor Guardian boss, phase 2 armor cracks with brighter core, 2D flat vector, neon cyan/orange accents, transparent background, 768x512\"
Negative: Global
Size: 768x512

[MagePrompt]
Title: Reactor Guardian - Phase 3 - Exposed Core
Prompt: \"Reactor Guardian boss, phase 3 exposed core glow, heavy particle sparks, 2D flat vector, neon accents, transparent background, 768x512\"
Negative: Global
Size: 768x512

[MagePrompt]
Title: Reactor Guardian - Defeat - Collapse
Prompt: \"Reactor Guardian defeat sequence, large dust burst and glow fade, 2D flat vector, transparent background, 768x512\"
Negative: Global
Size: 768x512

[MagePrompt]
Title: Sky Serpent - Phase 1 - Aura
Prompt: \"Sky Serpent boss, phase 1 aura glow, flowing segmented body, 2D flat vector, neon cyan accents, transparent background, 896x512\"
Negative: Global
Size: 896x512

[MagePrompt]
Title: Sky Serpent - Phase 2 - Cracks
Prompt: \"Sky Serpent boss, phase 2 energy arcs, brighter core along spine, 2D flat vector, neon cyan/magenta, transparent background, 896x512\"
Negative: Global
Size: 896x512

[MagePrompt]
Title: Sky Serpent - Phase 3 - Exposed Core
Prompt: \"Sky Serpent boss, phase 3 exposed core glow, aggressive aura, 2D flat vector, neon accents, transparent background, 896x512\"
Negative: Global
Size: 896x512

[MagePrompt]
Title: Sky Serpent - Defeat - Shockwave
Prompt: \"Sky Serpent defeat sequence, shockwave ring and large dust burst, 2D flat vector, transparent background, 896x512\"
Negative: Global
Size: 896x512
