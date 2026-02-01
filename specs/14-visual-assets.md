# Zelos V2 Asset Plan and Decisions

This file captures the resolved decisions for `requests/14-visual-assets.md`, plus
open uncertainties and the best-practice defaults chosen so production can proceed.

## Project root and folder structure
- Project root: `assets/zelos/`
- Folder structure: as defined in the request MD under "File Naming Convention"

```
assets/zelos/
|-- sprites/
|   |-- astro-duck/
|   |   |-- base/
|   |   |   |-- astro-duck-base-front.png
|   |   |   |-- astro-duck-base-side.png
|   |   |   |-- astro-duck-base-three-quarter.png
|   |   |   |-- astro-duck-base-idle-sheet.png
|   |   |   `-- astro-duck-base-fly-sheet.png
|   |   |-- expressions/
|   |   |   |-- astro-duck-happy-front.png
|   |   |   |-- astro-duck-happy-side.png
|   |   |   |-- astro-duck-happy-three-quarter.png
|   |   |   |-- astro-duck-excited-front.png
|   |   |   |-- astro-duck-excited-side.png
|   |   |   |-- astro-duck-excited-three-quarter.png
|   |   |   |-- astro-duck-curious-front.png
|   |   |   |-- astro-duck-curious-side.png
|   |   |   |-- astro-duck-curious-three-quarter.png
|   |   |   |-- astro-duck-concerned-front.png
|   |   |   |-- astro-duck-concerned-side.png
|   |   |   |-- astro-duck-concerned-three-quarter.png
|   |   |   |-- astro-duck-celebrating-front.png
|   |   |   |-- astro-duck-celebrating-side.png
|   |   |   |-- astro-duck-celebrating-three-quarter.png
|   |   |   |-- astro-duck-sleeping-front.png
|   |   |   |-- astro-duck-sleeping-side.png
|   |   |   |-- astro-duck-sleeping-three-quarter.png
|   |   |   |-- astro-duck-waving-front.png
|   |   |   |-- astro-duck-waving-side.png
|   |   |   |-- astro-duck-waving-three-quarter.png
|   |   |   |-- astro-duck-pointing-front.png
|   |   |   |-- astro-duck-pointing-side.png
|   |   |   `-- astro-duck-pointing-three-quarter.png
|   |   |-- poses/
|   |   |   |-- astro-duck-celebrating-front.png
|   |   |   |-- astro-duck-celebrating-side.png
|   |   |   |-- astro-duck-celebrating-three-quarter.png
|   |   |   |-- astro-duck-sleeping-front.png
|   |   |   |-- astro-duck-sleeping-side.png
|   |   |   |-- astro-duck-sleeping-three-quarter.png
|   |   |   |-- astro-duck-waving-front.png
|   |   |   |-- astro-duck-waving-side.png
|   |   |   |-- astro-duck-waving-three-quarter.png
|   |   |   |-- astro-duck-pointing-front.png
|   |   |   |-- astro-duck-pointing-side.png
|   |   |   `-- astro-duck-pointing-three-quarter.png
|   |   |-- outfits/
|   |   |   |-- outfit-default-suit-front.png
|   |   |   |-- outfit-default-suit-side.png
|   |   |   |-- outfit-default-suit-three-quarter.png
|   |   |   |-- outfit-default-suit-idle-sheet.png
|   |   |   |-- outfit-default-suit-fly-sheet.png
|   |   |   |-- outfit-pirate-front.png
|   |   |   |-- outfit-pirate-side.png
|   |   |   |-- outfit-pirate-three-quarter.png
|   |   |   |-- outfit-pirate-idle-sheet.png
|   |   |   |-- outfit-pirate-fly-sheet.png
|   |   |   |-- outfit-wizard-front.png
|   |   |   |-- outfit-wizard-side.png
|   |   |   |-- outfit-wizard-three-quarter.png
|   |   |   |-- outfit-wizard-idle-sheet.png
|   |   |   |-- outfit-wizard-fly-sheet.png
|   |   |   |-- outfit-detective-front.png
|   |   |   |-- outfit-detective-side.png
|   |   |   |-- outfit-detective-three-quarter.png
|   |   |   |-- outfit-detective-idle-sheet.png
|   |   |   |-- outfit-detective-fly-sheet.png
|   |   |   |-- outfit-chef-front.png
|   |   |   |-- outfit-chef-side.png
|   |   |   |-- outfit-chef-three-quarter.png
|   |   |   |-- outfit-chef-idle-sheet.png
|   |   |   |-- outfit-chef-fly-sheet.png
|   |   |   |-- outfit-superhero-front.png
|   |   |   |-- outfit-superhero-side.png
|   |   |   |-- outfit-superhero-three-quarter.png
|   |   |   |-- outfit-superhero-idle-sheet.png
|   |   |   |-- outfit-superhero-fly-sheet.png
|   |   |   |-- outfit-scientist-front.png
|   |   |   |-- outfit-scientist-side.png
|   |   |   |-- outfit-scientist-three-quarter.png
|   |   |   |-- outfit-scientist-idle-sheet.png
|   |   |   |-- outfit-scientist-fly-sheet.png
|   |   |   |-- outfit-musician-front.png
|   |   |   |-- outfit-musician-side.png
|   |   |   |-- outfit-musician-three-quarter.png
|   |   |   |-- outfit-musician-idle-sheet.png
|   |   |   |-- outfit-musician-fly-sheet.png
|   |   |   |-- outfit-explorer-front.png
|   |   |   |-- outfit-explorer-side.png
|   |   |   |-- outfit-explorer-three-quarter.png
|   |   |   |-- outfit-explorer-idle-sheet.png
|   |   |   |-- outfit-explorer-fly-sheet.png
|   |   |   |-- outfit-ninja-front.png
|   |   |   |-- outfit-ninja-side.png
|   |   |   |-- outfit-ninja-three-quarter.png
|   |   |   |-- outfit-ninja-idle-sheet.png
|   |   |   |-- outfit-ninja-fly-sheet.png
|   |   |   |-- outfit-royal-front.png
|   |   |   |-- outfit-royal-side.png
|   |   |   |-- outfit-royal-three-quarter.png
|   |   |   |-- outfit-royal-idle-sheet.png
|   |   |   `-- outfit-royal-fly-sheet.png
|   |-- planets/
|   |   |-- texture-solid.png
|   |   |-- texture-gradient.png
|   |   |-- texture-marble.png
|   |   |-- texture-rocky.png
|   |   |-- texture-gas-giant.png
|   |   |-- texture-ice.png
|   |   |-- texture-lava.png
|   |   |-- texture-ocean.png
|   |   |-- texture-forest.png
|   |   |-- texture-tech.png
|   |   |-- ring-cyan.png
|   |   |-- moon-small.png
|   |   |-- atmosphere-thin.png
|   |   |-- atmosphere-normal.png
|   |   |-- atmosphere-thick.png
|   |   |-- atmosphere-stormy.png
|   |   |-- state-selected.png
|   |   |-- state-hovered.png
|   |   |-- state-warning.png
|   |   |-- state-error.png
|   |   |-- state-inherited.png
|   |   `-- state-new.png
|   `-- satellites/
|       |-- satellite-config.png
|       |-- satellite-portals.png
|       |-- satellite-style.png
|       |-- satellite-modules.png
|       |-- satellite-entrypoints.png
|       |-- satellite-statistics.png
|       |-- satellite-users.png
|       |-- satellite-offerers.png
|       |-- satellite-email.png
|       |-- satellite-wordpress.png
|       |-- state-selected.png
|       |-- state-hovered.png
|       |-- state-error.png
|       |-- state-unsaved.png
|       |-- state-inherited.png
|       |-- state-own-config.png
|       |-- glow-hover.png
|       |-- glow-selected.png
|       |-- glow-error.png
|       |-- badge-warning.png
|       `-- badge-error.png
|-- backgrounds/
|   |-- starfield-tile.png
|   |-- nebula-overlay.png
|   |-- constellation-pattern.png
|   |-- vignette-soft.png
|   `-- office-vignette.png
|-- ui/
|   |-- modal-frame.png
|   |-- button-primary-states.png
|   |-- input-states.png
|   |-- toast-variants.png
|   |-- space-piano-panel.png
|   |-- space-piano-key-glow-white.png
|   |-- space-piano-key-glow-black.png
|   |-- space-piano-key-glow-white-sheet.png
|   |-- space-piano-key-glow-black-sheet.png
|   |-- loading-spinner.png
|   |-- loading-spinner-sheet.png
|   |-- cursor-set.png
|   `-- empty-state.png
|-- effects/
|   |-- stargate-ring.png
|   |-- stargate-glyphs.png
|   |-- stargate-glyphs-active.png
|   |-- portal-energy.png
|   |-- warp-streaks.png
|   |-- stargate-particles.png
|   `-- glow-cyan.png
|-- icons/
|   |-- achievements/
|   |   |-- frame-common.png
|   |   |-- frame-uncommon.png
|   |   |-- frame-rare.png
|   |   |-- frame-epic.png
|   |   |-- frame-legendary.png
|   |   |-- first-flight.png
|   |   |-- explorer.png
|   |   |-- speed-demon.png
|   |   |-- night-owl.png
|   |   |-- perfectionist.png
|   |   `-- piano-master.png
|   `-- misc/
|-- audio/
|   |-- shooter/
|   `-- platformer/
|-- video/
`-- pixi/
    `-- zelos-pixi-kit.js
```

## Naming rules (authoritative)
- Use lowercase kebab-case for file names.
- View ids in code: `front`, `side`, `threeQuarter`.
- View tokens in file names: `front`, `side`, `three-quarter`.
- Spritesheets use suffix `-sheet` (e.g., `astro-duck-base-idle-sheet.png`).
- Single-frame animation states may omit `-sheet` (e.g., `astro-duck-jump-apex.png`).
- Pose variants use `astro-duck-{pose}-{view}.png` in `sprites/astro-duck/poses/`.
- Outfit pose overlays use `outfit-{id}-{pose}-{view}.png` in `sprites/astro-duck/outfits/`.
- State overlays use `state-{state}.png` and glows use `glow-{state}.png`.
- Badges use `badge-{state}.png`, rings use `ring-{color}.png`.
- Keep prefixes consistent: `outfit-`, `astro-duck-`, `satellite-`, `texture-`.

## Asset index and validation
- Asset index: `specs/zelos-asset-index.json`
- Audio index: `specs/zelos-audio-index.json`
- Validation script: `scripts/validate-assets.py`
- Example: `python scripts/validate-assets.py --root assets/zelos`
- Optional size check: `python scripts/validate-assets.py --root assets/zelos --check-size`
- Spritesheet metadata check:
  - `python scripts/validate-assets.py --root assets/zelos --spritesheet-spec specs/games/zelos-minigame-spritesheets.md`
  - Add `--strict-spritesheets` to fail on missing files.
- Audio validation:
  - `python scripts/validate-assets.py --index specs/zelos-audio-index.json --root assets/zelos --include-planned`
- The validator checks file presence against the index (sizes are documented but
  size validation runs only when `--check-size` is provided).

## Astro-Duck character sheet
- Split into three clean files (no combined sheet):
  - `assets/zelos/sprites/astro-duck/base/astro-duck-base-front.png`
  - `assets/zelos/sprites/astro-duck/base/astro-duck-base-side.png`
  - `assets/zelos/sprites/astro-duck/base/astro-duck-base-three-quarter.png`
- Layout and metadata described in `specs/astro-duck-character-sheet.json`
- Note: this plan overrides request sizes; use 1024x1024 for base views and
  expressions, and 256x256 frames for sheets as documented here and in Mage prompts.

## Astro-Duck actions (base character)
Include the full original action set from the request:
- Base character views: front, side, 3/4 (separate files)
- Idle spritesheet (8 frames)
- Fly spritesheet (6 frames)
- Expressions (individual PNGs): happy, excited, curious, concerned, celebrating,
  sleeping, waving, pointing
  - Expressions live in `assets/zelos/sprites/astro-duck/expressions/`
  - Naming pattern: `astro-duck-{expression}-{view}.png`
  - All expressions above are required for each view.
  - Expressions are face-only overlays (keep any gesture cues as small glyphs near the head).
- Full-body pose variants (base + outfit overlays): celebrating, sleeping, waving, pointing
  - Base pose files live in `assets/zelos/sprites/astro-duck/poses/`
  - Outfit pose overlays live in `assets/zelos/sprites/astro-duck/outfits/`
  - Use these when a full-body gesture is needed (marketing, vignettes, key art).
  - When a pose is used, set expression to `none` unless a custom face overlay is desired.

## Outfits (standardized + coherent)
- All outfits must keep:
  - Same body proportions, head/body ratio, and silhouette
  - If the outfit includes a suit, keep suit base (#252538) and cyan trim (#00f5ff)
    unless explicitly overridden
  - Same line weight, glow strength, and shading direction
  - Same pose and framing box for consistent alignment
- Outfit items sit on top of the base character; do not alter beak/eyes shape
- Outfit outputs documented in:
  - `specs/astro-duck-outfits.json`
  - Full outfit list and files are defined there; the tree shows examples only.
- Output files must be drop-in replacements for the base views so swapping
  outfits is a resource replacement only.

## Layering model (base + overlays)
- Base duck uses a minimal undersuit layer (no outer suit/armor).
- Default space suit is an overlay (treat as a costume).
- All other outfits are overlays; they must align perfectly with the base.
- Pose variants replace the base view with a full-body pose image; pair with the
  matching outfit pose overlay for drop-in swapping.
- For animations, overlays are per-frame sheets that match base animation sheets
  exactly (size, frame order, pivots).
- Expressions are overlays that sit on top of base + outfit (face-only layer).
- Expression overlays must be provided for each view: front, side, threeQuarter.

## Costume compatibility rules (current and future)
- Base layer is the canonical silhouette; overlays must not change body scale.
- All overlays must preserve:
  - Head size and eye position (no shifting)
  - Beak placement and wing/arm joints
  - Overall bounding box and margins
- Overlay thickness budget: keep added costume elements within the base framing
  (no cropping or overflow outside 1024x1024 view box).
- Alignment anchors:
  - Center pivot at 0.5,0.6 for floating assets
  - Helmet center aligned to eye line; collar aligned to suit neckline
- Color compatibility:
  - Base undersuit stays neutral/dark; costumes may add accents but keep
    the cyan trim style consistent for sci-fi reads.
- Future costumes must follow the same file naming and framing rules:
  - `outfit-{id}-front.png`, `outfit-{id}-side.png`, `outfit-{id}-three-quarter.png`
  - Animation overlays: `outfit-{id}-idle-sheet.png`, `outfit-{id}-fly-sheet.png`

## Spritesheet metadata (best-practice defaults)
- Default pivot for floating character animations: `pivotX=0.5`, `pivotY=0.6`
  - Rationale: keeps the character centered in air without anchoring to a floor.
- If any animation is ground-based, use `pivotY=0.9` and note it in the sheet spec.

## Frame and pivot policy
- Base character views: 1024x1024, centered, no cropping.
- Expression overlays: 1024x1024, aligned to base face; transparent outside face.
- Astro-Duck animation sheets: 256x256 frames, horizontal strips only.
- Shooter sprites: center pivot (0.5, 0.5) for player, enemies, projectiles.
- Platformer sprites: ground pivot (0.5, 0.9) for player and enemies.
- Overlays must share the same pivot as their base asset.

## Animation variants (resource replacement)
- Outfit variants can be produced for animated sheets as full replacements.
- Requirements for drop-in swaps:
  - Same frame size, frame count, and frame ordering as the base animation
  - Same sheet dimensions and layout (horizontal strip)
  - Same pivot/anchor and alignment per frame
  - Use the same file naming with outfit prefix or suffix as documented in
    `specs/astro-duck-animation-variants.json`
- Frame alignment rule: keep head height and suit size consistent across all sheets.

## Composite usage beyond Astro-Duck
- Planets: base texture + rings + atmosphere + state overlays (selected/hovered/warning/error/inherited/new)
- Satellites: base icon + state overlay + glow/badge layers
- Stargate: ring + glyphs + energy core + particle overlay
- Backgrounds: starfield base + nebula overlay + constellation overlay + vignette
- Badges: frame + rarity glow + achievement icon
- UI components: base panel/button + hover/pressed overlays
- Planets may optionally use `sprites/planets/moon-small.png` for orbiting accents.

## Space piano (UI easter egg assets)
- Panel: `ui/space-piano-panel.png` (600x200, two octaves, text-free).
- Key press glow effects:
  - White key glow: `ui/space-piano-key-glow-white.png` (50x150)
  - Black key glow: `ui/space-piano-key-glow-black.png` (30x100)
- Optional animated glow sheets (4 frames, horizontal strip):
  - White key: `ui/space-piano-key-glow-white-sheet.png` (200x150)
  - Black key: `ui/space-piano-key-glow-black-sheet.png` (120x100)
- Style: same palette + glow strength as core UI elements.
- Interactive composition (recommended):
  - Base layer: panel image.
  - Overlay: reuse the glow sprite per key; animate alpha/scale on key press.
  - If using the optional sheets, advance frames on press for a pulse effect.

## Misc UI assets
- Loading spinner: `ui/loading-spinner.png` (64x64, static fallback).
- Preferred animation: `ui/loading-spinner-sheet.png` (8 frames, 64x64 each, 512x64 strip).
- Cursor set: `ui/cursor-set.png` (128x32, 4 icons in a row).
- Empty state illustration: `ui/empty-state.png` (400x300).

### Explicit metadata (best-practice defaults)
Loading spinner (preferred)
```json
{
  "id": "loading-spinner",
  "type": "spritesheet",
  "path": "ui/loading-spinner-sheet.png",
  "frameWidth": 64,
  "frameHeight": 64,
  "frames": 8,
  "layout": "horizontal",
  "fps": 12,
  "loop": true,
  "pivot": { "x": 0.5, "y": 0.5 }
}
```

Cursor set
```json
{
  "id": "cursor-set",
  "path": "ui/cursor-set.png",
  "layout": { "rows": 1, "cols": 4, "cell": [32, 32] },
  "order": ["pointer", "hand", "loading", "text"],
  "hotspots": {
    "pointer": [4, 4],
    "hand": [14, 6],
    "loading": [16, 16],
    "text": [16, 16]
  }
}
```

## Composite canvas standards (size alignment)
- Background layers: 1920x1080 for starfield, nebula, constellation, vignette, office vignette.
- Stargate layers: 1024x1024 for ring, glyphs sheet, portal energy, particles, warp streaks.
- Planet layers: keep existing sizes (centered), ring and atmosphere must be centered to the texture.
- Tileable requirement: starfield + constellation must be seamless tiles; portal energy should be loopable.

Composite variants to support (align with Pixi kit presets)
- Planets:
  - Textures: solid, gradient, marble, rocky, gas-giant, ice, lava, ocean, forest, tech
  - Atmospheres: thin, normal, thick, stormy
  - States: selected, hovered, warning, error, inherited, new
- Satellites:
  - Icons: config, portals, style, modules, entrypoints, statistics, users, offerers, email, wordpress
  - States: selected, hovered, error, unsaved, inherited, own-config
  - Glows: hover, selected, error
  - Badges: warning, error
- Badges:
  - Rarities: common, uncommon, rare, epic, legendary

Composite file naming (effects overlays)
- Planets:
  - Rings: `sprites/planets/ring-{color}.png` (e.g., `ring-cyan.png`)
  - Atmospheres: `sprites/planets/atmosphere-{type}.png` (thin/normal/thick/stormy)
  - States: `sprites/planets/state-{state}.png` (selected/hovered/warning/error/inherited/new)
- Satellites:
  - States: `sprites/satellites/state-{state}.png` (selected/hovered/error/unsaved/inherited/own-config)
- Stargate:
  - Glyphs: `effects/stargate-glyphs.png` (1024x1024, 4x3 grid)
  - Glyphs active: `effects/stargate-glyphs-active.png` (1024x1024, 4x3 grid)
- Backgrounds:
  - Vignette: `backgrounds/vignette-{type}.png` (e.g., `vignette-soft.png`)
- Satellites (optional glow/badge overlays):
  - Glow: `sprites/satellites/glow-{state}.png` (hover/selected/error)
  - Badge: `sprites/satellites/badge-{state}.png` (warning/error)
- Badges:
  - Frames: `icons/achievements/frame-{rarity}.png`

## Pixi project kit (copy with assets)
- File: `assets/zelos/pixi/zelos-pixi-kit.js`
- Purpose: helper utilities for loading and composing Zelos layered assets in Pixi.
- Keep this file in sync when new outfits/expressions/states are added.
- Includes `zelosPalette` so code and UI effects can share the same colors.
- Includes `zelosPresets` for standardized ids (outfits, expressions, textures, states).
- Usage (example):
  - Import the kit in your app and call `createAstroDuckComposite(...)` or
    `createCompositeLayers(...)` with your desired layers.
  - `createAstroDuckComposite` supports a `pose` option for full-body pose swaps.
- Preset helpers included: `createPlanetComposite`, `createSatelliteComposite`,
    `createStargateComposite`, `createBackgroundComposite`, `createBadgeComposite`,
    `createUiComposite`, `createPianoComposite`, `createVideoSprite` (for short cinematics).

## Mage AI prompt pack
- File: `specs/mage/zelos-mage-prompts.md`
- This is the prompt-ready spec for Mage AI with sizes, negatives, and templates.
- Includes full minigame asset prompts (enemies, tiles, pickups, FX, UI).

## Additional game assets (easter eggs)
- Shooter spec: `specs/games/zelos-space-shooter.md`
- Platformer spec: `specs/games/zelos-jump-run.md`
- API contract: `specs/games/zelos-game-api.md`
- Audio SFX spec: `specs/games/zelos-audio.md`
- Cinematics + story beats: `specs/games/zelos-cinematics.md`
- Optional mini-game UI overlays:
  - `ui/quiz-glyphs-prompt.png` (1920x1080)
  - `ui/quiz-glyphs-panel.png` (800x240, 9-slice ready)
- Gameplay polish + accessibility toggles are defined in the game specs and API.

## Cinematics and story beats (optional but recommended)
- Goal: short, punchy clips (5-12s) that add immersion without blocking gameplay.
- Style: same palette, line weight, glow strength, and lighting as core assets.
- Text-free videos (no on-screen text or logos).
- Integrate existing elements (planets, satellites, stargates, glyphs) to keep
  the world coherent and reduce new asset overhead.
- Use clips for:
  - Prologue: office briefing (Astro-Duck at PC with headset)
  - Mission briefings (level start)
  - Boss introductions (dramatic reveal)
  - Stargate travel interstitials (when story fits)
  - Mid-arc transition (after level 3)
  - Final wrap-up (after level 5)
- Jump & Run includes a simple glyph-quiz moment using the stargate glyph set.
- Playback/encoding guidance lives in `specs/games/zelos-cinematics.md`.

## Office vignette background (menus/loading)
- Purpose: unify the UI with the prologue setting outside cinematics.
- File: `backgrounds/office-vignette.png`
- Size: 1920x1080, text-free, subtle glow, same palette.
- Games should show a simple menu screen using this background.

## Delivery bundles
- Core UI bundle: `backgrounds/`, `ui/`, `effects/`, `icons/achievements/`
- Mascot bundle: `sprites/astro-duck/` (base, expressions, poses, outfits, sheets)
- Orbits bundle: `sprites/planets/` + `sprites/satellites/`
- Mini-games bundle: `sprites/shooter/`, `sprites/platformer/`, `audio/`
- Cinematics bundle: `video/` (short MP4/WebM clips + poster frames)

```js
import { createAstroDuckComposite, createPlanetComposite } from "./pixi/zelos-pixi-kit.js";

const duck = await createAstroDuckComposite({
  pixi: PIXI,
  root: "./assets/zelos",
  view: "front",
  outfit: "outfit-default-suit",
  expression: "happy",
  pose: "none",
});
app.stage.addChild(duck.container);

await duck.update({ nextOutfit: "outfit-pirate", nextExpression: "excited" });

const planet = await createPlanetComposite({
  pixi: PIXI,
  root: "./assets/zelos",
  texture: "solid",
  rings: "cyan",
  atmosphere: "normal",
  state: "selected",
});
app.stage.addChild(planet.container);
```

## State variants (best-practice default)
- Use base assets plus separate effect overlays for states where possible.
  - Example: selection glow, warning/error badges, hover brightness handled by UI.
- If a state must be a baked asset, add it with a suffix:
  - `-hover`, `-selected`, `-error`, `-warning`

## Quality gates (must pass)
- Correct size and aspect ratio (no auto-resize).
- Consistent line weight and palette usage.
- No stray alpha pixels or clipping at frame edges.
- Clean transparency; no matte edges.
- Naming matches the rules and asset index.
- Optimized for web (PNG compression, sRGB).

## Visual consistency checklist (design guardrails)
- Line weight: use a single stroke family across all assets (recommended 2-3px at 1024px base; scale proportionally for smaller icons).
- Glow strength: subtle, not overpowering. Outer glow radius 8-16px at 1024px base; opacity 30-60%.
- Edge softness: keep a soft glow edge but avoid heavy blur; glows should feel crisp neon, not hazy.
- Palette lock: limit accents to cyan/magenta/lime/orange/red/purple/yellow as defined; avoid new hues.
- Lighting: top-left soft highlight across all assets (consistent shadow direction).
- Contrast discipline: UI overlays (vignettes/pause screens) must stay low contrast so gameplay remains readable.
- FX hierarchy: friendly FX = cyan; hostile FX = magenta/orange; warning = orange; error = red.
- Sprite sheets: keep internal alignment; no frame-to-frame size drift.

## Icons and scalability
- Preferred: SVG for icons and UI where scalable vectors are needed.
- Fallback: PNG at a uniform base size.
  - Satellite icons base size: `128x128`
  - Achievement icons base size: `64x64`
  - Misc icons base size: `64x64`
- If SVGs are delivered, also export PNGs at the base sizes above for runtime and validation.
- Scale in CSS only when vectors are not available; keep proportions identical.

## Uncertainties and chosen defaults
- **Pivots**: unknown. Chosen default pivot is `0.5, 0.6` for floating assets.
- **State variants**: unknown. Chosen approach is overlays + UI effects, not full
  per-state assets, unless a state must be baked for fidelity.
- **Icon format**: SVG preferred, PNG fallback with uniform base size.
- **Action expressions**: expression IDs remain face-only overlays to preserve
  outfit swapping. Full-body pose variants are delivered separately as base
  pose images + per-outfit pose overlays.

## Spritesheet metadata (embedding specs)
- `specs/astro-duck-idle.md`
- `specs/astro-duck-fly.md`
- `specs/games/zelos-minigame-spritesheets.md`
- Outfit overlay sheets reuse the same frame layout and pivots as the base sheets.
- Add new spec files for any additional animated assets (loading spinner, stargate glyphs if animated).
