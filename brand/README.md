# owlabee brand

The mark: two honeycomb cells that share a wall become an owl's eyes, with a gold monocle on one eye and a drop of honey for a beak. The owl's wisdom and the bee's work, in one shape.

Regenerate everything here with `node tools/brand/render.mjs` (needs Playwright's Chromium and Python Pillow).

| Color | Hex | Use |
|---|---|---|
| Cream | `#FAF7F1` | page ground |
| Charcoal | `#2E2E2E` | mark, wordmark, text |
| Gold | `#C29A45` | monocle, beak, rules; not small text |
| Gold Deep | `#8C6A26` | italic taglines, 20 px and up |
| Sage | `#7F8E7C` | monochrome tile |
| Stone | `#5E5A55` | secondary text |
| Linen | `#F4EDE2` | cards |
| Hairline | `#E2D3B5` | rules, rings |

Type: Jost (500, spaced capitals for the wordmark and labels; 300/400 for body) and Cormorant Garamond italic for taglines.

Files:
- `owlabee-mark*.svg` / `.png`: the mark (full color, reversed, one-color charcoal or cream, small).
- `owlabee-lockup-*.png`: primary (stacked) and horizontal lockups.
- `avatar-*-1024.png`: GitHub org, Apify profile and social avatars.
- `app-icon-*-1024.png`: cream, charcoal, sage and gold app icons.
- `favicon.ico`, `favicon.svg`, `favicon-16/32/48.png`, `apple-touch-icon.png`, `icon-512.png`.
- `og-image.png` (1200×630 social card), `banner-1500x500.png` (X, LinkedIn and similar).
- `apify-icons/<actor>.png`: one 512×512 icon per Apify Actor. Charcoal for public records, sage for web monitoring, gold for documents and AI.

Small sizes: the monocle chain goes on app icons; favicons drop the monocle, and the beak at 16 px.

## Brand authority

This repo is the authority on owlabee's marketing, brand and styling (owner rule, 2026-11-09). Everything that shows owlabee or its Apify Actors follows this kit, every time it changes:

- **jrhite/mmm** (the Actors): each Actor's `docs/logo.png` is a copy of `brand/apify-icons/<store-name>.png` (mmm `tools/make-logo.py` copies it; it never draws), and Store banners and output images use this palette and type (`tools/actor-images.mjs` there). A new Actor gets its icon here first, in `ACTOR_ICONS` in `tools/brand/render.mjs`.
- **jrhite/jacobhite.com** (the owner's site): the `--owlabee-*` tokens and `ProjectMark.astro` carry this palette and the cream avatar; its Projects page lists the live Store slugs.
- **owlabee.com** (this repo's `docs/`): the Actor list in `tools/actors.mjs` and `tools/actors.data.json`.

When an Actor is added, renamed, published or widened, all three are updated in the same pass, in this style, and only once the Actor is public.
