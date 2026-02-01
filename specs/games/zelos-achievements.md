# Zelos Mini-Game Achievements

This spec defines the shared achievement set used by the Pixi mini-games.
Achievements are optional, lightweight, and displayed as small badge toasts.

## Storage
- Space shooter key: `zelos:space-shooter:achievements`
- Jump & run key: `zelos:jump-run:achievements`

## Badge assets
- Frame: `icons/achievements/frame-{rarity}.png`
- Icon: `icons/achievements/{id}.png`

## Shared achievements

These IDs align with the icons listed in `requests/14-visual-assets.md` and
`specs/14-visual-assets.md`. Games only auto-unlock a small subset; the host
can emit the rest via the game bus if desired.

| ID | Icon | Rarity | Trigger |
| --- | --- | --- | --- |
| `first-flight` | `first-flight` | common | First time the player starts a run (menu fade begins). |
| `explorer` | `explorer` | uncommon | Reserved for Zelos core (app-level discovery); host can emit. |
| `speed-demon` | `speed-demon` | rare | Reach `Score >= 300` in a single run (approx. 30s). |
| `night-owl` | `night-owl` | uncommon | Reserved for Zelos core (time-based or late sessions); host can emit. |
| `perfectionist` | `perfectionist` | epic | Reserved for Zelos core or no-hit runs; host can emit. |
| `piano-master` | `piano-master` | legendary | Reserved for the space piano easter egg; host can emit. |

## Host/Game bus (optional)
Games emit `achievement:unlock` with `{ id, label, icon, rarity, source: "game" }`.
Hosts can emit `achievement:unlock` without `source: "game"` to force a toast.
