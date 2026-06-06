# mundel — Logo system

**Concept “Equilibrium.”** The mark is the IS-LM model at its core: a downward IS curve and an
upward LM curve crossing at a single **amber equilibrium point** — the moment where macroeconomics
gives a trade its rationale. Academic navy keeps it trustworthy and educational.

## Files

| File | Use |
|------|-----|
| `mundel-horizontal.svg` | Primary lockup — site header, nav, business cards |
| `mundel-vertical.svg` | Centered lockup — social profiles, splash |
| `mundel-wordmark.svg` | Text-only — tight/minimal spaces |
| `mundel-icon.svg` | Framed icon (white card) on light backgrounds |
| `mundel-icon-tile.svg` | Navy app-icon tile — iOS/Android/desktop app icon |
| `mundel-icon-minimal.svg` | Frameless mark — watermarks, loaders |
| `mundel-favicon.svg` | 32px favicon (also reads at 16px) |
| `mundel-horizontal-reversed.svg` | Primary lockup for **dark** backgrounds |
| `mundel-horizontal-mono.svg` | Single-colour (uses `currentColor`) for print / 1-colour |
| `preview.html` | Open in a browser to see every variation at multiple sizes |

## Colours

| Role | Hex |
|------|-----|
| Navy (text / IS curve / frame) | `#102A56` |
| IS curve | `#1E40AF` |
| LM curve | `#3B82F6` |
| Equilibrium point (accent) | `#F59E0B` |
| Axes (muted) | `#CBD5E1` |

## Notes

- **Font:** the wordmark uses `Geist` (matches the app) with system fallbacks. For a frozen, render-safe
  asset, convert the `<text>` to outlines in a vector editor before final delivery.
- **Monochrome:** `mundel-horizontal-mono.svg` inherits `currentColor` — set CSS `color` (or the `color`
  attribute) to recolour the whole lockup in one place.
- **Clear space:** keep padding equal to the icon’s corner radius on all sides.
- **Minimum size:** 24px for the icon, 110px wide for the horizontal lockup.

## Export to PNG

```bash
# rsvg-convert (librsvg)
rsvg-convert -b white mundel-horizontal.svg -w 1200 -o mundel-horizontal.png

# or Inkscape
inkscape mundel-icon-tile.svg --export-filename=mundel-icon-1024.png -w 1024
```
