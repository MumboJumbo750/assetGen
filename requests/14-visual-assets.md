# Visual Assets Guide: Zelos V2

This document provides a comprehensive inventory of all visual assets needed for Zelos V2, along with detailed descriptions suitable for AI image generation tools.

---

## Design Language Summary

### Core Visual Identity

| Aspect | Description |
|--------|-------------|
| **Theme** | Cosmic/Space universe with neon cyberpunk accents |
| **Mood** | Professional yet playful, futuristic, immersive |
| **Color Palette** | Deep dark backgrounds (#0a0a0f to #2f2f45) with vibrant neon accents (cyan #00f5ff, magenta #ff00ff, lime #39ff14) |
| **Style** | 2D/2.5D flat design with depth through glows and shadows, NOT photorealistic |
| **Consistency** | All assets should feel like they belong in the same universe |

### Art Style Guidelines

- **Flat design** with subtle gradients for depth
- **Neon glow effects** on edges and highlights
- **Clean vector-style** artwork (not pixel art, not photorealistic)
- **Consistent line weights** across all assets
- **Transparent backgrounds** (PNG format) for all sprites
- **Multiple sizes** for different zoom levels where applicable

---

## Asset Category 1: Astro-Duck Mascot 🦆🚀

The mascot is a cute cartoon duck in an astronaut suit. She should be endearing, expressive, and memorable.

### Base Character Design

**AI Prompt for Character Sheet:**
```
Create a character design sheet for "Astro-Duck" - a cute cartoon duck mascot wearing a space suit. 

Style: 2D flat vector illustration with soft gradients, similar to modern app mascots like Duolingo's owl or Discord's Wumpus.

Character details:
- Small, round, adorable duck with big expressive eyes
- White/cream colored feathers with subtle orange beak and feet
- Wearing a sleek, futuristic astronaut suit in dark gray (#252538) with cyan (#00f5ff) accent trim and glowing elements
- Clear bubble helmet showing the duck's face and expressions
- Small jetpack on back with cyan (#00f5ff) flame/thrust effect
- Overall height proportion: head is 40% of body height (cute/chibi proportions)

Show front view, side view, and 3/4 view.
Background: transparent or dark space (#0a0a0f)
Resolution: 2048x2048px
```

### Sprite Sheet: Idle Animation (8 frames)

**AI Prompt:**
```
Create an 8-frame sprite sheet for Astro-Duck floating idle animation.

Character: Cute cartoon duck in futuristic space suit with bubble helmet and small jetpack.
Style: 2D flat vector, clean lines, neon cyan (#00f5ff) accents on dark gray suit.

Animation sequence:
- Frame 1-2: Slight upward float
- Frame 3-4: Peak of float, gentle head tilt
- Frame 5-6: Slight downward drift
- Frame 7-8: Return to neutral, subtle wing adjustment

Each frame: 256x256px
Arrangement: Horizontal strip, 8 frames = 2048x256px total
Background: Transparent
Include subtle star sparkles trailing behind the jetpack
```

### Sprite Sheet: Flying Animation (6 frames)

**AI Prompt:**
```
Create a 6-frame sprite sheet for Astro-Duck flying/moving animation.

Character: Cute cartoon duck astronaut with jetpack actively firing.
Style: 2D flat vector with neon glow effects.

Animation sequence:
- Frame 1: Lean forward, jetpack igniting (small cyan flame)
- Frame 2-3: Full thrust, larger cyan (#00f5ff) and magenta (#ff00ff) flame trail
- Frame 4-5: Cruising speed, flame stabilized
- Frame 6: Slight deceleration pose

Each frame: 256x256px
Arrangement: Horizontal strip
Background: Transparent
Jetpack flame should have neon glow effect
```

### Expression Sprites (Individual PNGs)

| Expression | AI Prompt Description |
|------------|----------------------|
| **Happy** | "Astro-Duck face close-up, big smile, eyes closed in joy, small hearts or stars around head. 2D flat vector, 512x512px, transparent background." |
| **Excited** | "Astro-Duck face, wide sparkling eyes, open beak smile, small exclamation marks around. Neon cyan sparkles. 512x512px, transparent." |
| **Curious** | "Astro-Duck face, head tilted 15 degrees, one eyebrow raised, question mark floating nearby in cyan neon. 512x512px, transparent." |
| **Concerned** | "Astro-Duck face, worried expression, slight frown, sweat drop, looking to the side. 512x512px, transparent." |
| **Celebrating** | "Astro-Duck full body doing a spin, confetti particles in neon colors (cyan, magenta, lime), wings spread. 512x512px, transparent." |
| **Sleeping** | "Astro-Duck floating peacefully, eyes closed, small 'Z' letters floating up, relaxed pose. 512x512px, transparent." |
| **Waving** | "Astro-Duck waving one wing/flipper in greeting, friendly smile, slight lean. 512x512px, transparent." |
| **Pointing** | "Astro-Duck pointing with wing to the right side, helpful expression, slight lean in pointing direction. 512x512px, transparent." |

### Duck Outfit Unlockables (Achievement Rewards)

**Base Prompt Template:**
```
Astro-Duck wearing [OUTFIT DESCRIPTION]. Same cute duck character, 2D flat vector style, 512x512px, transparent background, neon accent colors.
```

| Outfit ID | Description for AI |
|-----------|-------------------|
| `outfit-pirate` | "...wearing a space pirate hat (tricorn with cyan feather), eye patch with neon glow, small cape" |
| `outfit-wizard` | "...wearing a starry wizard hat with constellation patterns, holding a glowing cyan wand" |
| `outfit-detective` | "...wearing a deerstalker hat and holding a magnifying glass with neon rim" |
| `outfit-chef` | "...wearing a chef's hat and apron, holding a glowing spatula" |
| `outfit-superhero` | "...wearing a cape flowing behind, small mask, heroic pose" |
| `outfit-scientist` | "...wearing lab goggles on head, holding a beaker with glowing liquid" |
| `outfit-musician` | "...wearing headphones with neon glow, holding a small synthesizer" |
| `outfit-explorer` | "...wearing a safari/explorer hat, binoculars around neck, adventure gear" |
| `outfit-ninja` | "...wearing a ninja headband, throwing star in wing, stealthy pose" |
| `outfit-royal` | "...wearing a small crown with gems, royal cape, regal pose" |

---

## Asset Category 2: Planets (Groups)

Planets represent groups in the hierarchy. They need to be visually distinct yet cohesive.

### Base Planet Styles

**AI Prompt Template:**
```
Create a [SIZE] planet icon for a space-themed admin UI.
Style: 2D flat illustration with subtle gradients, NOT photorealistic.
Colors: [PRIMARY COLOR] base with [SECONDARY COLOR] accents.
Features: [TEXTURE DESCRIPTION]
Size: 512x512px
Background: Transparent
Include subtle outer glow in [GLOW COLOR]
```

### Planet Textures (10 Types)

| Texture ID | AI Prompt |
|------------|-----------|
| `solid` | "Simple solid color planet with subtle radial gradient for depth. Clean, minimal. Primary: #4a90d9 (blue). Soft cyan glow." |
| `gradient` | "Planet with smooth two-color gradient from #4a90d9 (blue) at top to #9b4ad9 (purple) at bottom. Soft edge glow." |
| `marble` | "Planet with swirling marble texture, mixing #4a90d9 (blue) and white veins. Elegant, polished look. Subtle glow." |
| `rocky` | "Rocky planet with crater-like surface details, gray-brown (#8b7355) with darker shadows. Rugged texture, subtle glow." |
| `gas-giant` | "Gas giant planet with horizontal bands like Jupiter. Colors: #d9a54a (orange/tan) with darker brown bands. Atmospheric glow." |
| `ice` | "Icy crystalline planet, pale blue (#a8d8ea) with white frost patterns. Sparkle highlights. Cool cyan glow." |
| `lava` | "Volcanic planet with dark surface (#2a1a1a) and glowing orange/red (#ff6b35) lava cracks. Warm orange glow." |
| `ocean` | "Ocean world, deep blue (#1a4a7a) with lighter blue (#4a90d9) water patterns. Subtle wave-like texture. Blue glow." |
| `forest` | "Forest/nature planet, green (#39ff14 lime mixed with forest green #2d5a27). Organic texture patterns. Green glow." |
| `tech` | "Tech/circuit planet, dark gray (#252538) with glowing cyan (#00f5ff) circuit-like line patterns. Cyberpunk feel. Cyan glow." |

### Planet Decorations

**Rings:**
```
Create Saturn-like rings for a 2D planet icon.
Style: Flat design with subtle gradient.
Colors: Semi-transparent [RING COLOR] with lighter inner edge.
Size: 512x256px (wide format to wrap around planet)
Background: Transparent
Include subtle glow effect
```

**Moons (Small):**
```
Create a small moon sprite to orbit around planets.
Style: 2D flat, simple circle with subtle crater details.
Colors: Gray (#a0a0b0) with darker spots.
Size: 64x64px
Background: Transparent
Subtle white glow
```

**Atmosphere Effects:**
```
Create an atmosphere glow effect ring for a planet.
Style: Soft, semi-transparent gradient halo.
Type: [thin/normal/thick/stormy]
Color: [ATMOSPHERE COLOR] fading to transparent
Size: 600x600px (larger than planet to create halo)
Background: Transparent
```

### Planet States

| State | Visual Modification |
|-------|---------------------|
| **Selected (Reference Group)** | Bright cyan (#00f5ff) pulsing glow, 1.2x size |
| **Hovered** | Subtle brightness increase, soft glow appears |
| **Has Warnings** | Small orange (#ff6b35) warning badge/icon |
| **Has Errors** | Small red (#ff073a) error badge, subtle red glow |
| **Inherited Config** | Slightly desaturated/dimmed appearance |
| **New/Recent** | Subtle sparkle particle effect |

---

## Asset Category 3: Satellites (Feature Icons)

Satellites orbit planets and represent different features/configurations.

### Satellite Base Design

**AI Prompt:**
```
Create a satellite/space station icon for a space-themed UI.
Style: 2D flat vector, clean lines, futuristic design.
Shape: Circular base with small solar panel wings or antenna details.
Size: 128x128px
Background: Transparent
Include subtle glow effect in [ACCENT COLOR]
```

### Satellite Icons (10 Types)

| Satellite | Icon | AI Prompt |
|-----------|------|-----------|
| **Config** | ⚙️ | "Gear/cog icon in space satellite style. Dark gray (#252538) with cyan (#00f5ff) glowing edges. 128x128px, transparent." |
| **Portals** | 🌐 | "Globe/world icon with orbital rings, representing web portals. Cyan (#00f5ff) with grid lines. 128x128px, transparent." |
| **Style** | 🎨 | "Artist palette icon, space-themed. Neon color dots (cyan, magenta, lime) on dark palette. 128x128px, transparent." |
| **Modules** | 🧩 | "Puzzle piece icon, futuristic style. Interlocking pieces with neon cyan edges. 128x128px, transparent." |
| **Entrypoints** | 🚪 | "Door/portal icon, sci-fi style. Glowing doorway with cyan light emanating. 128x128px, transparent." |
| **Statistics** | 📊 | "Bar chart icon, holographic style. Cyan (#00f5ff) glowing bars on dark background. 128x128px, transparent." |
| **Users** | 👥 | "Two person silhouettes, space helmet style. Dark with cyan outline glow. 128x128px, transparent." |
| **Offerers** | 🏢 | "Building/office icon, futuristic skyscraper style. Dark with cyan window lights. 128x128px, transparent." |
| **Email** | ✉️ | "Envelope icon, holographic/digital style. Cyan glowing edges, slight transparency. 128x128px, transparent." |
| **Wordpress** | 🔗 | "Chain link icon, representing integration. Interlocked links with cyan glow. 128x128px, transparent." |

### Satellite States

| State | Visual |
|-------|--------|
| **Default** | Normal brightness, subtle glow |
| **Inherited** | Dimmed (60% opacity), dashed orbit line |
| **Has Own Config** | Full brightness, solid orbit line |
| **Unsaved Changes** | Pulsing glow animation (cyan) |
| **Error** | Red (#ff073a) ring/outline |
| **Hovered** | Enlarged (1.2x), brighter glow |
| **Selected/Open** | Bright glow, connected line to modal |

---

## Asset Category 4: Stargate (Login Portal)

The login screen features an animated stargate portal.

### Stargate Ring

**AI Prompt:**
```
Create a stargate/portal ring for a space-themed login screen.

Style: 2D flat design with neon glow effects, inspired by sci-fi portals.
Shape: Circular ring with inner opening (donut shape).
Details:
- Outer ring: Dark metallic gray (#252538) with engraved geometric patterns
- Inner edge: Glowing cyan (#00f5ff) energy effect
- Symbols/glyphs around the ring in subtle darker shade
- Energy particles emanating from inner edge

Size: 1024x1024px
Background: Transparent
The center should be empty (transparent) for the login form to sit inside.
```

### Stargate Glyph Symbols

**AI Prompt:**
```
Create a set of 12 abstract sci-fi glyphs/symbols for a stargate ring.

Style: Geometric, angular, alien-looking symbols. 2D flat vector.
Colors: Dark gray (#2f2f45) base, with option for cyan (#00f5ff) glow state.
Each symbol: 256x256px
Arrangement: 4x3 grid inside a 1024x1024px sheet
Background: Transparent

Symbols should look like constellation markers or alien writing.
```

Also provide an activated/glow state sheet with stronger cyan highlights:
`effects/stargate-glyphs-active.png` (1024x1024, same grid).

### Portal Energy Effect

**AI Prompt:**
```
Create a swirling portal energy effect for the center of a stargate.

Style: Abstract, ethereal, cosmic energy vortex.
Colors: Deep blue (#1a1a2e) center fading to cyan (#00f5ff) edges with hints of magenta (#ff00ff).
Animation: Design as a seamless tileable/loopable texture.
Size: 1024x1024px
Background: Transparent edges, energy in center

Should look like looking into a wormhole or cosmic tunnel.
```

### Warp Speed Star Streaks

**AI Prompt:**
```
Create star streak effect for warp/hyperspace travel animation.

Style: Motion blur streaks radiating from center point.
Colors: White stars with cyan (#00f5ff) and magenta (#ff00ff) color trails.
Arrangement: Radial pattern from center.
Size: 1024x1024px
Background: Dark space (#0a0a0f)

Should convey rapid forward motion through space.
```

---

## Asset Category 5: Background Elements

### Star Field (Tileable)

**AI Prompt:**
```
Create a seamless tileable star field background for a space UI.

Style: Realistic-ish stars on deep dark background.
Colors: 
- Background: Very dark blue-black (#0a0a0f)
- Stars: Various sizes, white with subtle color tints (some slightly blue, some slightly warm)
- Include a few brighter stars with subtle glow
- Occasional tiny distant galaxies/nebulae (very subtle)

Size: 1920x1080px (tileable)
Density: Medium - not too crowded, not too sparse.
```

### Nebula Clouds (Decorative)

**AI Prompt:**
```
Create a subtle nebula cloud overlay for a space background.

Style: Soft, ethereal gas clouds. Semi-transparent.
Colors: Deep purples (#1a1a2e), hints of cyan (#00f5ff), and magenta (#ff00ff).
Opacity: Very subtle (20-30% opacity feel)
Size: 1920x1080px
Background: Transparent

Should add atmosphere without distracting from UI elements.
```

### Constellation Lines

**AI Prompt:**
```
Create subtle constellation line patterns for background decoration.

Style: Thin lines connecting dots (stars), like star maps.
Colors: Very subtle gray (#2f2f45) at 30% opacity.
Pattern: Random but balanced constellation shapes.
Size: 1920x1080px (tileable)
Background: Transparent

Should be barely visible, adding subtle texture.
```

---

## Asset Category 6: UI Components

### Modal Window Frame

**AI Prompt:**
```
Create a futuristic modal window frame/border for a space-themed UI.

Style: Sleek, sci-fi interface panel. 2D flat with subtle depth.
Colors: 
- Background: Dark (#1a1a2e) with slight transparency
- Border: Thin cyan (#00f5ff) glowing line
- Corners: Subtle geometric accent shapes

Size: 800x600px (scalable 9-slice)
Include: Header area, content area, footer area divisions.
Background: Semi-transparent dark
```

### Button Styles

**AI Prompt for Primary Button:**
```
Create a futuristic primary action button for space-themed UI.

Style: Rounded rectangle, sleek sci-fi design.
Colors:
- Background: Cyan (#00f5ff) gradient
- Text area: Dark for contrast
- Border: Subtle darker cyan edge
- Glow: Soft cyan outer glow

States needed: Normal, Hover (brighter), Pressed (darker), Disabled (gray)
Size: 200x50px each state
Background: Transparent
```

### Input Field

**AI Prompt:**
```
Create a futuristic text input field for space-themed UI.

Style: Rounded rectangle, minimal, clean.
Colors:
- Background: Dark (#252538)
- Border: Subtle gray, cyan (#00f5ff) on focus
- Placeholder text area visible

States: Normal, Focused (cyan border glow), Error (red border), Disabled
Size: 300x50px each state
Background: Transparent
```

### Toast Notification

**AI Prompt:**
```
Create toast notification designs for a space-themed UI.

Style: Rounded rectangle, floating panel feel.
Types needed:
1. Success: Dark bg with lime (#39ff14) accent/icon
2. Error: Dark bg with red (#ff073a) accent/icon
3. Warning: Dark bg with orange (#ff6b35) accent/icon
4. Info: Dark bg with cyan (#00f5ff) accent/icon

Each: 350x80px
Include icon area on left, text area, close button area.
Background: Semi-transparent dark with colored left border.
```

---

## Asset Category 7: Space Piano (Easter Egg)

### Piano Panel

**AI Prompt:**
```
Create a floating piano panel UI for a space-themed easter egg.

Style: Futuristic, holographic feel. 2D flat design.
Colors:
- Panel background: Dark (#1a1a2e) with subtle transparency
- White keys: Off-white (#f0f0f5) with subtle gradient
- Black keys: Dark (#252538) with slight sheen
- Accents: Cyan (#00f5ff) glow on edges

Layout: 2 octaves (24 keys total: 14 white, 10 black)
Size: 600x200px
Include: Header bar with title, minimize/close buttons
Background: Semi-transparent
```

### Key Press Effects

**AI Prompt:**
```
Create key press glow effects for piano keys.

Style: Neon glow emanating from pressed key.
Colors: 
- White key pressed: Cyan (#00f5ff) glow
- Black key pressed: Magenta (#ff00ff) glow

Size: 50x150px (white key), 30x100px (black key)
Background: Transparent
Should look like the key is lighting up from within.
```

---

## Asset Category 8: Achievement Badges

### Badge Frame Template

**AI Prompt:**
```
Create achievement badge frames for a space-themed gamification system.

Style: Circular medallion/badge, futuristic design.
Rarity variants needed:
1. Common: Bronze/copper tones, simple design
2. Uncommon: Silver tones, slightly more ornate
3. Rare: Gold tones, decorative edges
4. Epic: Purple (#bf00ff) with glow effects, elaborate
5. Legendary: Rainbow/holographic effect, most ornate, animated shimmer

Each: 128x128px
Background: Transparent
Center area empty for achievement icon.
```

### Achievement Icons (Examples)

| Achievement | AI Prompt |
|-------------|-----------|
| First Flight 🚀 | "Small rocket ship icon, simple 2D style, cyan glow trail. 64x64px, transparent." |
| Explorer 🗺️ | "Treasure map icon with star markers, space-themed. 64x64px, transparent." |
| Speed Demon ⚡ | "Lightning bolt icon, neon yellow (#fff01f) with glow. 64x64px, transparent." |
| Night Owl 🦉 | "Owl face icon, cute style, glowing eyes. 64x64px, transparent." |
| Perfectionist ✨ | "Sparkling star icon, multiple points, bright glow. 64x64px, transparent." |
| Piano Master 🎹 | "Piano keys icon, small, with musical notes. 64x64px, transparent." |

---

## Asset Category 9: Miscellaneous

### Loading Spinner

**AI Prompt:**
```
Create a space-themed loading spinner animation.

Style: Orbital rings or rotating stargate-like element.
Colors: Cyan (#00f5ff) primary, magenta (#ff00ff) secondary.
Animation: Designed for smooth rotation (provide as sprite sheet or describe keyframes).
Size: 64x64px
Background: Transparent
```

### Cursor (Custom)

**AI Prompt:**
```
Create a custom cursor set for a space-themed UI.

Style: Sleek, futuristic pointer.
Variants:
1. Default pointer: Small arrow with cyan tip glow
2. Clickable/hand: Pointing hand with subtle glow
3. Loading: Small spinning element
4. Text select: I-beam with glow

Each: 32x32px
Background: Transparent
Hotspot should be at tip of pointer.
```

### Empty State Illustration

**AI Prompt:**
```
Create an empty state illustration for when no data is available.

Scene: Astro-Duck floating alone in space, looking around curiously.
Style: 2D flat vector, consistent with mascot design.
Mood: Slightly lonely but hopeful, not sad.
Include: A few distant stars, maybe a "?" thought bubble.
Size: 400x300px
Background: Transparent or subtle space gradient.
Text area below for "No items found" message.
```

---

## File Naming Convention

```
assets/
├── sprites/
│   ├── astro-duck/
│   │   ├── astro-duck-idle-sheet.png
│   │   ├── astro-duck-fly-sheet.png
│   │   ├── astro-duck-happy.png
│   │   ├── astro-duck-excited.png
│   │   └── outfits/
│   │       ├── outfit-pirate.png
│   │       └── ...
│   ├── planets/
│   │   ├── texture-solid.png
│   │   ├── texture-marble.png
│   │   └── ...
│   └── satellites/
│       ├── satellite-config.png
│       └── ...
├── backgrounds/
│   ├── starfield-tile.png
│   ├── nebula-overlay.png
│   └── constellation-pattern.png
├── ui/
│   ├── modal-frame.png
│   ├── button-primary-states.png
│   ├── input-states.png
│   └── toast-variants.png
├── effects/
│   ├── stargate-ring.png
│   ├── portal-energy.png
│   ├── warp-streaks.png
│   └── glow-cyan.png
└── icons/
    ├── achievements/
    └── misc/
```

---

## Export Specifications

| Asset Type | Format | Resolution | Notes |
|------------|--------|------------|-------|
| Sprites | PNG-24 | 2x for retina | Transparent background |
| Backgrounds | PNG/WebP | 1x and 2x | Tileable where noted |
| Icons | SVG preferred, PNG fallback | Multiple sizes | 16, 24, 32, 48, 64, 128 |
| Animations | PNG sprite sheet or Lottie JSON | 2x | Include frame timing data |
| UI Components | PNG 9-slice or SVG | 2x | Scalable |

---

## Color Reference Quick Sheet

| Name | Hex | Usage |
|------|-----|-------|
| Void | `#0a0a0f` | Deepest background |
| Space | `#12121a` | Primary background |
| Nebula | `#1a1a2e` | Cards, modals |
| Cosmic | `#252538` | Hover states |
| Stardust | `#2f2f45` | Borders, active |
| Neon Cyan | `#00f5ff` | Primary accent |
| Neon Magenta | `#ff00ff` | Secondary accent |
| Neon Lime | `#39ff14` | Success |
| Neon Orange | `#ff6b35` | Warning |
| Neon Red | `#ff073a` | Error |
| Neon Purple | `#bf00ff` | Special/Easter eggs |
| Neon Yellow | `#fff01f` | Highlights |
| Neon Pink | `#ff69b4` | Astro-Duck accents |
| Text Primary | `#f0f0f5` | Main text |
| Text Secondary | `#a0a0b0` | Labels |
| Text Muted | `#606070` | Disabled |

---

## Next Steps

1. **Prioritize**: Start with Astro-Duck (mascot is central to brand)
2. **Generate base assets**: Use AI tools with prompts above
3. **Iterate**: Refine based on how they look in-app
4. **Create variants**: Generate state variations (hover, active, etc.)
5. **Optimize**: Compress and optimize for web delivery
6. **Document**: Update this file with final asset locations

