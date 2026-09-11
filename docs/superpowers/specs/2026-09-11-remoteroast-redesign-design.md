# Remote Roast Redesign — Design Spec

**Date:** 2026-09-11
**Status:** Approved mockups, ready to plan implementation
**Visual source of truth:** `design_mockups/` (homepage-datasheet.html, tldr-leaderboard.html, article-frgmnt.html, about.html)

---

## 1. Why

The previous redesign felt "disconnected and directionless" and read as AI-generated: a seven-color palette with no clear roles, decorative `№ 01` section numbering, and pastel parallax blobs that didn't match the copy's voice. The writing was the strongest asset and stays untouched.

**The direction: "the spreadsheet with a mouth."** The blog is two data nerds quantifying coffee shops for remote work (wifi, seating, price, bathrooms) and being deadpan-serious about it — "yes we have a spreadsheet," "we sat there for 4 hours so you don't have to." So the *data itself* becomes the visual identity instead of decoration bolted on to supply personality the copy already has. Structure carries the voice; ornament is removed.

### Goals
- Replace the palette, numbering, and blobs with a coherent system where every element has a job.
- Make the measurements (ratings, wifi, drip, criteria) the primary visual material.
- Keep all existing copy, bios, and post content verbatim.
- Keep the site fast, static, and accessible; stay within the current Jekyll theme rather than rebuilding.

### Non-goals
- No copy rewrites for posts, bios, or the About page.
- No new content types or CMS changes.
- No JS framework; keep vanilla JS and Liquid.
- No change to hosting, analytics (GA4), search (lunr), or comments (Disqus) wiring.

---

## 2. Design language

### Color (replaces the current 7-color + 5-blob palette)
| Token | Value | Role |
|---|---|---|
| `--paper` | `#F2EDE6` | primary background (kept from current) |
| `--paper-2` | `#EAE3D7` | zebra rows, card fills, empty data cells |
| `--ink` | `#0D0D0D` | text, rules, table header bg (kept) |
| `--espresso` | `#52341E` | working accent — filled data bars, links-in-context, hoods |
| `--pencil` | `#8A8378` | secondary/meta text |
| `--stamp` | `#C8311C` | reserved for verdict moments only — "NO" on meetings, active map pin, focus outline, key hover |

Rules of use: espresso does the everyday accent work; **red (`--stamp`) is rationed** to verdict/attention moments so it stays meaningful. The old gold (`#D4AA20`) is retired. Blob colors deleted.

### Type (all three families already load in the theme)
- **Bebas Neue** — display: wordmark, headlines, shop names, stat numbers. Condensed, deadpan, loud.
- **Newsreader** — body serif and italic decks/quotes.
- **DM Mono** — promoted from bit part to co-star: every rating, price, wifi figure, label, and table cell. Data reads as data. (`Caveat` handwriting from earlier drafts was cut.)

### Structure = information
- Blobs removed entirely (`_blobs.scss`, `blobs.js`, `blob-bg.html`, `#parallax-svg`).
- `№ 01` decorative numbering removed. Numerals appear **only** where they encode real order — the TL;DR leaderboard rank.
- Signature elements: the **ledger table** (The Verdicts), **six-cell data readouts**, **DM Mono score bars**, hairline rules and double-rules under the masthead. These are the memorable, repeated devices.

### Shared chrome (all pages)
- **Masthead:** `REMOTE ROAST` wordmark (ROAST in espresso) + nav, a double-rule divider, and on the homepage a strap line with the real tagline "Judging your café so you don't have to." Nav: **Reviews · TL;DR · About** (logo = home). "Reviews" is a complete index of every review post *and* roundup post (see §3).
- **Footer:** double/triple rule, "Remote Roast, est. 2023" and "All opinions final" in DM Mono.

---

## 3. Page-by-page

Each maps to an existing Jekyll file; this is a restyle plus targeted structural edits, not new scaffolding.

### Homepage — `_layouts/home.html`
Top to bottom:
1. **Latest review hero** — the newest review (front-matter `hero: true`, else most recent). Left column: "Latest review" label, shop name in Bebas, a human byline sentence, the review's opening line as an italic pull, a four-cell readout (wifi / drip / meetings / bathrooms), six score bars, and a "Read the full report →" button. Right column: the review's hero photo.
2. **Round Ups** — grid of roundup posts (kicker date, title, excerpt). Moved **above** the old ticker position.
3. **Recent Reviews** — a compact table of the 5 most recent reviews, **reverse chronological**, columns: Shop / Neighborhood / Reviewed / Rating (with data bar). Capped by a button: "All 14 shops, ranked and mapped → TL;DR." The full leaderboard is **not** duplicated here.
4. **The People Responsible For This** — two bios using verbatim `_config.yml` author descriptions.
- **Removed:** the marquee/ticker, the pastel blob background, the `01` rank badge, the full verdicts grid.

### TL;DR — `_pages/tldr.md`
1. Hero: "The Shortcut" / `TL;DR` / three stat blocks (Reviews / Opinions / Chill), with the intro line ("All 14 reviews. Ranked. Mapped…") spanning **full width** directly above the map.
2. **Map + Leaderboard** side by side (map ~1.55fr, leaderboard ~1fr) in one bordered panel. Reuses the existing Leaflet map and `leaderboard-row.html`.
3. **Detail panel** shown on pin/row click: shop photo with overlay (hood, name, "Read Full Review →"), a **Breakdown** column of six DM Mono score bars, and a **Profile** radar chart. Reuses existing `radar-chart.html` logic, restyled.
4. **The Verdicts** — the full 14-shop ledger table (rank / shop / neighborhood / rating+bar / wifi / drip / meetings / best-for), zebra-striped, sticky-dark header, with the footnote "MTGS? = would we take a Zoom call here." This is what the retired "The Verdicts" nav item pointed at.
5. **Best For…** cards — verbatim existing copy.
6. Support CTA (Venmo) — existing.

### Review post — `_layouts/post.html`
Existing structure restyled; the theme already has hero, meta strip, two-column body, scorecard sidebar, mini-map, pro-tip JS, post-nav, and JSON-LD — all kept.
- **Hero photo** shows at the top of the post (front-matter `image`).
- Body: serif column on the left; the inline markdown `table.table` blocks render as **ledger strips** (label over mono value). Sticky right rail = "The Numbers" card: overall `x/5`, the four key facts, six score bars, "best for" as plain mono text (not colored handwriting), and Maps link.
- Pull quotes, pro-tip box, prev/next, structured data: unchanged behavior, restyled.

### About — `_pages/about.md`
Verbatim copy. Structure: "Who we are" kicker / "About Remote Roast" headline / the welcome line as a wide italic lead / a labeled "The mission" two-paragraph column / "Who are we?" two photo+bio cards (the longer About-page bios) / a dark "Buy our next coffee!" support block with both Venmo buttons.

### Round Ups post — `_layouts/roundup.html` / post.html roundup branch
Inherits the post restyle; full-width body, no scorecard sidebar. Restyle only.

### Reviews index — nav "Reviews" (new page or restyled `_layouts/archive.html`)
A complete catalog of **all review posts and all roundup posts**, most-recent first, as a ledger-style list or card grid in the redesign language. This is distinct from TL;DR (ranked leaderboard + map of shop reviews only) and from the homepage (curated front page). The homepage keeps its own curated "Round Ups" content section; there is no separate "Round Ups" nav item.

---

## 4. Components (SCSS + includes)

Restyle in place; keep class names where the theme already has them to avoid churn.

- **Masthead / nav** — `_includes/nav.html`. Keep the hamburger + `is-open` toggle for mobile; restyle to the double-rule wordmark bar.
- **Footer** — `_includes/footer.html`.
- **Shop card** (homepage recent reviews) — `_includes/shop-card.html` → ledger-row style on desktop, stacked block on mobile.
- **Leaderboard row** — `_includes/leaderboard-row.html`, restyle rank/name/sub/stars.
- **Verdicts table** — new partial or inline in tldr; zebra rows, dark sticky header, data bars.
- **Score bars** — shared DM Mono bar (filled espresso cells / empty paper-2 cells). Replaces the animated `score-bar__fill` width bars; keep it CSS-simple.
- **Readout / ledger strip** — six-cell mono key/value block; used in hero and to render post `table.table` inline tables.
- **Radar chart** — `_includes/radar-chart.html` restyled (espresso fill/stroke, mono labels).
- **Star rating** — `_includes/stars.html` recolor (espresso, not gold).
- **Data readout / stat blocks** — TL;DR hero stats, post "The Numbers" card.
- **Map** — existing Leaflet setup; restyle pins to the espresso teardrop / red active pin and popups to the new palette.

### SCSS file plan (`_sass/`)
- `_tokens.scss` — rewrite palette per §2; drop blob tokens; keep spacing/type scale.
- `_typography.scss` — promote DM Mono roles; keep families.
- `_components.scss` / `_layouts.scss` — restyle cards, tables, hero, scorecard, readouts, masthead.
- `_stars.scss` — recolor.
- `_blobs.scss` — **delete**; remove its `@import`.

---

## 5. Data-driven vs. placeholder

In the mockups these are hardcoded; in the build they come from data:
- **Recent Reviews list** — `site.posts` where tag `review`, sorted by date desc, first 5, excluding the hero.
- **Leaderboard + Verdicts table** — all review posts sorted by `rating` desc; each row from front matter (`title`, `categories`, `rating`, `wifi`, `drip`, `meeting`, `bestfor`, `lat`/`lng`).
- **Hero readout + score bars** — the hero post's `wifi`, `drip`, `meeting`, bathrooms(*), and `scores.{coffee,wifi,seating,vibe,outlet,quiet}`.
- **Round Up cards** — roundup posts' title, month/year, and `blurb` (falls back to the existing `description` front-matter value).
- **Map pins** — `lat`/`lng` per review (existing `window.__shops`).
- **Bios** — `_config.yml` (homepage) and `_pages/about.md` (About), verbatim.

(*) Bathrooms isn't a dedicated front-matter field today; see open questions.

---

## 6. Decisions (resolved)

1. **Nav = Reviews · TL;DR · About.** "Reviews" is a full index of all reviews *and* roundups (§3). "The Verdicts" is retired as a nav item (survives as the TL;DR table heading). No separate "Round Ups" nav item.
2. **Add optional `bathrooms:` front-matter field.** Hero readout and post facts show it; hide the cell when absent.
3. **No invented copy.** Every user-facing string must be either existing site copy or approved by Juliet before it ships. See §6a.

## 6a. Copy inventory — approval gate

Rule: reuse existing theme copy wherever it exists; anything genuinely new needs Juliet's words before implementation. Post/bio/About body copy stays verbatim.

**Reuse existing (no approval needed):** "The Shortcut", "TL;DR", stat labels "Reviews / Opinions / Chill", "Leaderboard", "Click a pin to explore", "Breakdown", "Profile", "Best For…" (+ its four cards), "Buy our next coffee!" + its blurb, "The Verdicts" + "don't @ us", "Who are we?", "The People Responsible For This", "The Breakdown", "Overall", "Find It", the "Judging your café so you don't have to" tagline, and "Minneapolis & St. Paul".

**Reverted in mockups to existing labels:** post sidebar card → "The Breakdown" (was "The Numbers"); hero CTA → "Read the Review →" (was "Read the full report →"); post nav → "All Reviews →" (was "All the verdicts →").

**Removed as invented decoration:** the "Reviewer" role label on bios; the "Support the spreadsheet" eyebrow on the About CTA; the scone figcaption; the TL;DR detail "Selected: … click any pin or row to swap" hint (it's a mockup annotation; the real panel is dynamic).

**Approved by Juliet (final):**
- Homepage hero eyebrow — "Latest review". ✓
- Homepage recent-reviews heading — "Recent Reviews". ✓
- Homepage CTA button — "All shops, ranked and mapped → TL;DR" (number dropped). ✓
- TL;DR Verdicts footnote — "MTGS? = would we take a Zoom call here". ✓
- Footer lines — "Remote Roast, est. 2023" / "All opinions final". ✓
- **Round Up card blurbs** — use each roundup post's existing `description` front-matter value (real copy, in voice); card kicker is the post month/year. Add an optional `blurb:` front-matter field that overrides `description` when Juliet wants different card copy. Current values:
  - Spring Round Up 1 → "A little recap of the first half of spring!"
  - Spring/Summer Round Up → "Spring part 2 plus a little bit of summer!"
  - Summer Round Up → "It's cold. We're sad. Let's reflect on Summer."

**Reviews index heading + intro — approved:**
- Heading: **"Every Review"** (mono sub: "Reviews + round ups, newest first")
- Intro line: **"Every shop we've hauled a laptop into, plus the round ups. Newest first."**

*Data-composed strings (not invented, kept):* the hero byline from real fields ("St Anthony Main, Minneapolis. Reviewed by Juliet, September 2024."), roundup card kicker (post month/year), the post deck from the post's own `<h5>`, prev/next titles.

---

## 7. Responsive & accessibility floor

- `.wrap` uses `padding-inline` only (never the `padding: 0 x` shorthand) so section vertical spacing via `padding-block` can't zero out horizontal gutters — this was the root cause of the mobile "flush left / no top padding" bug.
- `html, body { overflow-x: hidden }` and `img { max-width: 100% }` as guards; verified `scrollWidth === clientWidth` at 390px on every mockup.
- ≤640px: masthead stacks (wordmark over wrapping nav), sections reduce padding, the Verdicts table stacks to blocks, multi-column grids collapse to one.
- Keep visible keyboard focus (`--stamp` outline), `prefers-reduced-motion` respected (score bars need not animate), semantic table markup with `scope`, and `aria-label`s on the map and interactive rows.

---

## 8. Files touched (summary)

- **Restyle:** `_sass/_tokens.scss`, `_typography.scss`, `_components.scss`, `_layouts.scss`, `_stars.scss`; `_layouts/home.html`, `post.html`, `roundup.html`, `archive.html`; `_pages/tldr.md`, `about.md`; `_includes/nav.html`, `footer.html`, `shop-card.html`, `leaderboard-row.html`, `radar-chart.html`, `stars.html`, `star_rating*`.
- **Add:** a **Reviews index page** (nav "Reviews") listing all reviews + roundups — new `_pages/reviews.md` or restyled `archive.html`; optional `bathrooms:` (and maybe `blurb:`) front-matter fields; a verdicts-table partial.
- **Delete / remove import:** `_sass/_blobs.scss`, `assets/js/blobs.js`, `_includes/blob-bg.html`, and any `#parallax-svg` / blob include references in `_layouts/default.html`.
- **Unchanged:** GA4, lunr search, Disqus, feed/SEO, structured data, the Leaflet library include.
