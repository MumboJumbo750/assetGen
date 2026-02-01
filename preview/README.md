# Preview App

This is a lightweight Pixi preview to validate assets.

## Run locally
1) `cd preview`
2) `python -m http.server 5173`
3) Open `http://localhost:5173`

## Configure assets
Edit `preview/data/manifest.json` and add items under a project in `projects`.

Tip: preset buttons appear for kit-backed composites to quickly check common states,
and the palette swatches render above the stage controls.

Manifest fields
- defaultProject: project id selected on load
- projects: array of project objects
  - id: unique id for the project
  - label: display name in the menu
  - root: optional path prefix for assets (e.g. \"..\" or \"../assets/project-a\")
  - games: optional list of game launchers (id, label, path, description)
  - assets: list of assets for this project

Asset fields
- id: unique id for the entry
- type: "image" or "spritesheet"
- path: path to the image or spritesheet JSON (relative to project root if provided)
- label: display label
- fps: animation fps (spritesheet only)
- loop: true/false
- maxSize: max render size in pixels
- scale: additional scale multiplier
- frameTag or animation: name of the animation in the spritesheet data

Composite asset fields (type: "composite")
- base: { paths: { front, side, threeQuarter } }
- views: array of view ids (default: front, side, threeQuarter)
- outfits: [{ id, label, paths: { front, side, threeQuarter } }]
- expressions: [{ id, label, path | paths }] (overlay faces)
- defaultView, defaultOutfit, defaultExpression: optional defaults
- kit: "astroDuck" to render via the Pixi kit helpers
- useKit: false to bypass the kit and use manifest paths directly

Composite layers (type: "compositeLayers")
- views: optional array of view ids if a layer has `paths` per view
- layers: [{ id, label, kind, options, default, optional, ui }]
  - kind: "select" (default) or "toggle"
  - options: [{ id, label, path, paths }]
  - optional: adds a "None" option when true
  - ui: "hidden" to skip a control (useful for fixed layers)
 - kit: set to "planet" | "satellite" | "stargate" | "background" | "badge" | "ui" to use the Pixi kit helpers
