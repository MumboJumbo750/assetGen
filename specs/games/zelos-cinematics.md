# Zelos Cinematics and Story Beats

Short, optional video clips that introduce each level and boss. These clips
should feel like part of the same universe as the UI and sprites.

## Video format
- Formats: MP4 (H.264) primary, WebM (VP9) optional
- Duration: 5-12 seconds each
- Resolution: 1920x1080 (16:9) + optional 1280x720 for lighter builds
- Frame rate: 24 or 30 fps
- Audio: optional bed; can be silent if the host plays SFX/BGM
- Posters: include a matching PNG poster frame per clip

## Visual language lock
- Style: 2D/2.5D flat vector, clean lines, subtle gradients, neon glows
- Palette: use the Zelos palette (see `specs/mage/zelos-mage-prompts.md`)
- Lighting: top-left, soft edge glows
- No on-screen text or logos (text-free videos)

## Pixi playback guidelines (smooth video)
- Encode MP4 with constant frame rate (24 or 30 fps).
- Use H.264 (Baseline or Main), 4:2:0, "fast start" (moov atom at front).
- Keep GOP/keyframe interval ~1-2 seconds for smooth seeking.
- Avoid variable frame rate; avoid huge bitrates (target ~8-12 Mbps for 1080p).
- If autoplaying, keep audio muted in-engine and let host play BGM/SFX.
- Use the Pixi kit helper `createVideoSprite` for consistent setup.

## Story arc (5 levels)
Prologue: Office dispatch
- Beat: Astro-Duck at a desk, wearing a headset, monitoring a mission feed.
- Elements: office desk, PC/monitor glow, subtle UI shapes (no text), neon accents.

Level 1: Boot sequence and first flight
- Beat: Astro-Duck launches from a small satellite dock.
- Elements: satellite icons, starfield, minimal stargate ring.

Level 2: Orbit sweep
- Beat: pass by a tech planet; scan nearby satellites.
- Elements: tech planet texture + orbiting satellites.

Level 3: Rift anomaly
- Beat: stargate hums; glyphs flicker; anomaly opens.
- Elements: stargate ring + glyphs + portal energy.

Level 4: Deep sector chase
- Beat: nebula drift; enemy silhouettes; warning glows.
- Elements: nebula overlay + warning state cues.

Level 5: Core showdown
- Beat: boss reveal, dramatic glow surge, particles.
- Elements: boss silhouette + shockwave ring.

Optional: Stargate travel interstitial
- Beat: short travel tunnel shot between levels when it fits the story.
- Elements: stargate ring + warp streaks + portal energy.

## Clip list (recommended)
0) office-briefing (6-8s)
1) intro-briefing-l1 (7s)
2) boss-intro-l1 (6s)
3) intro-briefing-l2 (7s)
4) boss-intro-l2 (6s)
5) mid-arc-l3-stargate (8s)
6) boss-intro-l3 (7s)
7) intro-briefing-l4 (7s)
8) boss-intro-l4 (7s)
9) intro-briefing-l5 (8s)
10) final-boss-intro-l5 (10-12s)
11) outro-wrap (8s)
12) stargate-travel (5-7s, optional)

## File naming
assets/zelos/video/
- `office-briefing.mp4`
- `intro-briefing-l1.mp4`
- `boss-intro-l1.mp4`
- `intro-briefing-l2.mp4`
- `boss-intro-l2.mp4`
- `mid-arc-l3-stargate.mp4`
- `boss-intro-l3.mp4`
- `intro-briefing-l4.mp4`
- `boss-intro-l4.mp4`
- `intro-briefing-l5.mp4`
- `final-boss-intro-l5.mp4`
- `outro-wrap.mp4`
- `stargate-travel.mp4` (optional)

Poster frames (PNG, 1920x1080)
- `office-briefing.png`
- `intro-briefing-l1.png`
- `boss-intro-l1.png`
- `intro-briefing-l2.png`
- `boss-intro-l2.png`
- `mid-arc-l3-stargate.png`
- `boss-intro-l3.png`
- `intro-briefing-l4.png`
- `boss-intro-l4.png`
- `intro-briefing-l5.png`
- `final-boss-intro-l5.png`
- `outro-wrap.png`
- `stargate-travel.png` (optional)

## Jump & Run glyph quiz insert
- Use the existing stargate glyph set as a quick puzzle moment.
- In the cinematic, show 3 highlighted glyphs; player repeats order in-game.
- Provide a simple overlay PNG for the quiz prompt (see notes below).
- Use the active glyph sheet (`effects/stargate-glyphs-active.png`) when a glyph is pressed.

Optional UI overlays (PNG):
- `ui/quiz-glyphs-prompt.png` (1920x1080 transparent overlay)
- `ui/quiz-glyphs-panel.png` (800x240 panel, 9-slice)

## Notes
- Keep clips short to avoid blocking gameplay.
- Reuse existing planet/satellite/glyph art wherever possible.
- Ensure all clips match the main palette and glow strength.
- Skip affordance: optional icon-only control (no text), click/tap to skip.
