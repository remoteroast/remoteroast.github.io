# Remote Roast Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the existing Jekyll site to the approved "spreadsheet with a mouth" design — port the four committed mockups into the Jekyll layouts/includes/SCSS, add a Reviews index page and `bathrooms`/`blurb` front-matter fields, and delete the blob system.

**Architecture:** This is a **port, not a from-scratch build.** The approved mockups in `design_mockups/` (`homepage-datasheet.html`, `tldr-leaderboard.html`, `article-frgmnt.html`, `about.html`) contain the complete target markup and CSS, each in a single `<style>` block. Each task moves one page/component's styles into the SCSS partials and adapts its static HTML into Liquid templates wired to real site data. The mockups are the visual source of truth; the running Jekyll pages must match them.

**Tech Stack:** Jekyll 4.3.2, SCSS (`@import` partials under `_sass/`), Liquid, vanilla JS, Leaflet 1.9.4. No JS build step. No unit-test framework — **the test cycle is `bundle exec jekyll build` succeeding plus a Puppeteer screenshot compared against the matching mockup.**

**Spec:** `docs/superpowers/specs/2026-09-11-remoteroast-redesign-design.md`

## Global Constraints

- **No invented copy.** Every user-facing string is either existing site copy or a value approved in the spec's §6a. Post/bio/About body copy stays verbatim. Approved new strings: hero eyebrow "Latest review"; homepage heading "Recent Reviews"; homepage CTA "All shops, ranked and mapped → TL;DR"; TL;DR footnote "MTGS? = would we take a Zoom call here"; footer "Remote Roast, est. 2023" / "All opinions final"; Reviews index heading "Every Review" + sub "Reviews + round ups, newest first" + intro "Every shop we've hauled a laptop into, plus the round ups. Newest first."
- **Palette (exact):** `--paper #F2EDE6`, `--paper-2 #EAE3D7`, `--ink #0D0D0D`, `--espresso #52341E`, `--pencil #8A8378`, `--stamp #C8311C`, `--rule rgba(13,13,13,0.85)`, `--rule-lt rgba(13,13,13,0.18)`. Red (`--stamp`) is reserved for verdict/attention moments only. Gold `#D4AA20` is retired. No blob colors.
- **Type:** Bebas Neue (display), Newsreader (body/italic), DM Mono (data/labels). Families already load in `_layouts/default.html:11`.
- **Nav (all pages):** Reviews · TL;DR · About. Logo = home. No "Round Ups" or "The Verdicts" nav item.
- **Responsive floor:** `.wrap` uses `padding-inline` only (never `padding: 0 x`); section vertical spacing uses `padding-block`. `html, body { overflow-x: hidden }`, `img { max-width: 100% }`. Verified target: `scrollWidth === clientWidth` at 390px. Keyboard focus visible (`--stamp` outline); semantic tables with `scope`; `aria-label` on map and interactive rows.
- **Do not touch:** GTM/GA4 (`default.html:15-33`), `window.rrTrack`, lunr search, Disqus, jekyll-feed/sitemap/seo/archives config, JSON-LD in `post.html`, the Leaflet library includes.
- **Build command:** `bundle exec jekyll build`. **Serve:** `bundle exec jekyll serve` (default `http://localhost:4000`). Work happens on branch `redesign/datasheet` (already created).

---

## Screenshot helper (used by every task's verification)

Create this once in Task 0. It serves the built `_site` and screenshots a page at desktop + mobile, checking for horizontal overflow.

**File:** `scripts/shoot.js` (repo-local, committed)

```js
// Usage: node scripts/shoot.js <url-path> <out-name>
// Requires a running server at http://localhost:4000 (bundle exec jekyll serve)
const path = process.argv[2] || '/';
const name = process.argv[3] || 'shot';
const pptrPath = '/opt/homebrew/lib/node_modules/fast-cli/node_modules/puppeteer';
const puppeteer = require(pptrPath);
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  // desktop
  let page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4000' + path, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: `/tmp/rr_${name}_desktop.png`, fullPage: true });
  await page.close();
  // mobile + overflow check
  page = await browser.newPage();
  await page.setViewport({ width: 390, height: 800, deviceScaleFactor: 2, isMobile: true });
  await page.goto('http://localhost:4000' + path, { waitUntil: 'networkidle0' });
  const m = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  await page.screenshot({ path: `/tmp/rr_${name}_mobile.png`, fullPage: true });
  await browser.close();
  console.log(`overflow: scrollW=${m.scrollW} clientW=${m.clientW} ` +
    (m.scrollW === m.clientW ? 'OK' : 'FAIL (horizontal overflow)'));
})();
```

If the Puppeteer path differs, find it with `find /opt/homebrew/lib/node_modules -type d -name puppeteer`.

---

## Task 0: Baseline, branch, screenshot harness

**Files:**
- Create: `scripts/shoot.js` (content above)
- Verify: repo builds as-is

**Interfaces:**
- Produces: `scripts/shoot.js` screenshot helper; a green baseline build.

- [ ] **Step 1: Confirm branch**

Run: `git branch --show-current`
Expected: `redesign/datasheet` (if not, `git checkout redesign/datasheet`).

- [ ] **Step 2: Baseline build must pass**

Run: `bundle exec jekyll build`
Expected: "done in N.NNN seconds", no errors.

- [ ] **Step 3: Create the screenshot helper**

Create `scripts/shoot.js` with the content from the "Screenshot helper" section above.

- [ ] **Step 4: Smoke-test the helper against the current site**

Run (two terminals or background the server):
```bash
bundle exec jekyll serve --detach
sleep 4
node scripts/shoot.js / home_baseline
```
Expected: prints `overflow: ... OK` or `FAIL`; writes `/tmp/rr_home_baseline_desktop.png`. (Baseline still shows the OLD design — that's expected; this only proves the harness works.)

- [ ] **Step 5: Stop the detached server**

Run: `pkill -f "jekyll serve" || true`

- [ ] **Step 6: Commit**

```bash
git add scripts/shoot.js
git commit -m "chore: add screenshot verification helper"
```

---

## Task 1: Palette + typography tokens, delete the blob system

**Files:**
- Modify: `_sass/_tokens.scss` (rewrite color section, drop blob tokens)
- Modify: `_sass/_typography.scss` (base body/heading/link/label roles)
- Modify: `assets/css/main.scss:4` (remove `@import "blobs";`)
- Modify: `_layouts/default.html:40,46` (remove blob include + blobs.js)
- Delete: `_sass/_blobs.scss`, `assets/js/blobs.js`, `_includes/blob-bg.html`

**Interfaces:**
- Produces: CSS custom properties on `:root` matching the Global Constraints palette, available to every later task. Note: current partials use **SCSS variables** (`$bg`, `$accent`, …); introduce the CSS custom properties AND keep the SCSS `$` variables as aliases pointing at the new values so the 2,400 lines of existing partials keep compiling until each is restyled.

- [ ] **Step 1: Rewrite the color block in `_sass/_tokens.scss`**

Replace the color + blob section (lines ~3-18) with:

```scss
// Color — redesign palette (see spec §2)
$bg:        #F2EDE6;   // --paper
$bg-alt:    #EAE3D7;   // --paper-2
$ink:       #0D0D0D;
$ink-soft:  #1E1C1A;
$ink-mid:   #8A8378;   // --pencil
$accent:    #52341E;   // --espresso (was gold)
$accent-2:  #52341E;   // espresso hover
$stamp:     #C8311C;   // verdict red
$border:    rgba(13, 13, 13, 0.18);

:root {
  --paper: #F2EDE6;
  --paper-2: #EAE3D7;
  --ink: #0D0D0D;
  --espresso: #52341E;
  --pencil: #8A8378;
  --stamp: #C8311C;
  --rule: rgba(13,13,13,0.85);
  --rule-lt: rgba(13,13,13,0.18);
}
```

Delete the `$blob-*` variables and the `$z-blob` line's blob comment (keep `$z-blob: 0;` — harmless, or remove; if removed, also remove any `z-index: $z-blob` usages, which live only in `_blobs.scss` being deleted).

- [ ] **Step 2: Remove the blob import**

In `assets/css/main.scss`, delete the line `@import "blobs";`.

- [ ] **Step 3: Delete blob files**

```bash
git rm _sass/_blobs.scss assets/js/blobs.js _includes/blob-bg.html
```

- [ ] **Step 4: Remove blob wiring from the base layout**

In `_layouts/default.html`, delete line 40 (`{% include blob-bg.html %}`) and line 46 (`<script src="{{ '/assets/js/blobs.js' | relative_url }}" defer></script>`).

- [ ] **Step 5: Set base typography in `_sass/_typography.scss`**

Ensure the base rules match the mockups (they already use these families). Confirm/So set:
```scss
body { font-family: 'Newsreader', Georgia, serif; background: var(--paper); color: var(--ink); }
h1, h2, h3, h4, h5, h6, .display { font-family: 'Bebas Neue', Impact, sans-serif; font-weight: 400; text-transform: uppercase; letter-spacing: 0.01em; color: var(--ink); }
.label, .meta, .data { font-family: 'DM Mono', ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.16em; color: var(--pencil); }
a { color: inherit; }
```
Keep existing type-scale variables. Add global guards at the top of the partial:
```scss
html, body { overflow-x: hidden; }
img { max-width: 100%; }
```

- [ ] **Step 6: Build must pass**

Run: `bundle exec jekyll build`
Expected: no SCSS errors ("done in …"). If a deleted `$blob-*` var is still referenced, grep `grep -rn 'blob' _sass _layouts _includes assets/css` and remove the straggler.

- [ ] **Step 7: Verify blobs are gone visually**

```bash
bundle exec jekyll serve --detach && sleep 4
node scripts/shoot.js / home_noblob
pkill -f "jekyll serve" || true
```
Open `/tmp/rr_home_noblob_desktop.png`: no colored blobs behind content; background is flat paper. (Layout will still be the old design — only blobs should be gone.)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: redesign palette tokens, remove blob system"
```

---

## Task 2: Shared chrome — masthead, nav, footer, .wrap

**Files:**
- Modify: `_includes/nav.html` (markup → mockup masthead; nav = Reviews/TL;DR/About)
- Modify: `_includes/footer.html` (markup → mockup footer)
- Create: `_sass/_chrome.scss` (masthead/nav/footer/.wrap styles, ported from any mockup's `<style>` — they're identical across mockups)
- Modify: `assets/css/main.scss` (add `@import "chrome";` after `typography`)
- Reference (source of truth): `design_mockups/about.html` `<style>` — `.wrap`, `header.site`, `.mast*`, `nav.mast__nav*`, `.dbl-rule`, `footer.site*`, and the shared `@media (max-width: 640px)` masthead rules.

**Interfaces:**
- Consumes: palette custom properties from Task 1.
- Produces: `.wrap` (max-width 1200, `padding-inline: 24px`, 18px ≤640), `header.site` + `.mast` masthead, `footer.site`. Later page tasks assume these exist and wrap their content in `.wrap`.

- [ ] **Step 1: Port chrome CSS**

Create `_sass/_chrome.scss`. Copy these rule sets verbatim from `design_mockups/about.html`'s `<style>`: `.wrap`, `header.site`, `.mast`, `.mast__wordmark` (+ `.roast`), `nav.mast__nav` (+ `a`, `a:hover`, `a.active`), `.dbl-rule`, `footer.site` (+ `.row`), and the `@media (max-width: 640px)` block's masthead lines (`.wrap`, `header.site`, `.mast`, `.mast__wordmark`, `nav.mast__nav`). Also add the shared focus rule:
```scss
a:focus-visible, [role="button"]:focus-visible, button:focus-visible { outline: 2px solid var(--stamp); outline-offset: 2px; }
```

- [ ] **Step 2: Import it**

In `assets/css/main.scss`, add `@import "chrome";` immediately after `@import "typography";`.

- [ ] **Step 3: Rewrite `_includes/nav.html`**

Replace its contents with the mockup masthead, wired to Jekyll. Keep it a `<header class="site wrap">` so `.wrap` applies:
```html
<header class="site wrap">
  <div class="mast">
    <a class="mast__wordmark" href="{{ '/' | relative_url }}">REMOTE<span class="roast"> ROAST</span></a>
    <nav class="mast__nav" aria-label="Main navigation">
      <a href="{{ '/reviews' | relative_url }}"{% if page.url contains 'reviews' %} class="active" aria-current="page"{% endif %}>Reviews</a>
      <a href="{{ '/tldr' | relative_url }}"{% if page.url contains 'tldr' %} class="active" aria-current="page"{% endif %}>TL;DR</a>
      <a href="{{ '/about' | relative_url }}"{% if page.url contains 'about' %} class="active" aria-current="page"{% endif %}>About</a>
    </nav>
  </div>
  <div class="dbl-rule" aria-hidden="true"></div>
</header>
```
(The mobile masthead stacks via CSS; no hamburger needed. Remove the old hamburger `<button>` and its `<script>`.)

- [ ] **Step 4: Rewrite `_includes/footer.html`**

```html
<footer class="site">
  <div class="wrap row">
    <span>Remote Roast, est. 2023</span>
    <span>All opinions final</span>
  </div>
</footer>
```

- [ ] **Step 5: Build**

Run: `bundle exec jekyll build`
Expected: passes.

- [ ] **Step 6: Verify masthead on desktop + mobile**

```bash
bundle exec jekyll serve --detach && sleep 4
node scripts/shoot.js /about about_chrome
pkill -f "jekyll serve" || true
```
Expected console: `overflow: … OK`. Compare `/tmp/rr_about_chrome_*` masthead against `design_mockups/about.html` (wordmark + REVIEWS · TL;DR · ABOUT, double rule; mobile stacks with top padding). Body below still old until later tasks.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: redesign masthead, nav (Reviews/TL;DR/About), footer"
```

---

## Task 3: About page

**Files:**
- Modify: `_pages/about.md` (replace body markup with mockup structure; body copy verbatim)
- Modify: `_layouts/page.html` (ensure it renders content inside `main.site-content` without old chrome; likely minimal — verify it just outputs `{{ content }}`)
- Create: `_sass/_about.scss`; import in `main.scss`
- Reference: `design_mockups/about.html` (`.abouthead`, `.mission`, `.who`, `.bio`, `.support`, `.btn`, and its media queries).

**Interfaces:**
- Consumes: `.wrap`, chrome from Task 2.
- Produces: nothing later tasks depend on (leaf page). Establishes the `.btn` used again on TL;DR/homepage — put `.btn` in `_sass/_components-new.scss`? No: define `.btn` once here is risky. **Decision:** create `_sass/_ui.scss` for shared bits (`.btn`, `.sec-head`, score bars, data readout, ledger table) and import it before page partials. This task creates `_ui.scss` with just `.btn`; later tasks add to it.

- [ ] **Step 1: Create `_sass/_ui.scss` with the shared button**

Copy `.btn` (+ `.btn--ghost` if present) from `design_mockups/about.html`. Add `@import "ui";` in `main.scss` after `chrome`.

- [ ] **Step 2: Create `_sass/_about.scss`**

Copy `.abouthead*`, `.mission*`, `.who*`, `.bio*`, `.support*` and the About `@media` blocks from `design_mockups/about.html`. Import after `ui`.

- [ ] **Step 3: Rewrite `_pages/about.md` body**

Keep the front matter (`layout: page`, `title`, `permalink: /about`). Replace the body with the mockup's `<main class="wrap">…</main>` inner sections (abouthead, mission, who, support), using **verbatim** copy from the current `about.md`/mockup. Photos: `assets/images/osmar.png`, `assets/images/juliet.jpeg` via `{{ '…' | relative_url }}`. Venmo links unchanged. No "Reviewer" labels, no kicker, no "The mission" label (per spec §6a).

- [ ] **Step 4: Confirm `page.html` doesn't inject old markup**

Read `_layouts/page.html`. It must render `{{ content }}` within the default layout (which now has clean chrome). Remove any old `.container`/sidebar wrappers that would fight the new full-bleed sections. If `page.html` wraps content in an old container, change it to output `{{ content }}` directly (the About content brings its own `.wrap`).

- [ ] **Step 5: Build + verify**

```bash
bundle exec jekyll build && bundle exec jekyll serve --detach && sleep 4
node scripts/shoot.js /about about
pkill -f "jekyll serve" || true
```
Expected: `overflow … OK`. `/tmp/rr_about_desktop.png` matches `design_mockups/about.html` (headline, wide italic lead, mission column, two bios, dark support block). Mobile stacks.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: redesign About page"
```

---

## Task 4: Homepage — hero, recent reviews, round ups, people

**Files:**
- Modify: `_layouts/home.html` (full rewrite to mockup structure, data-wired)
- Create: `_sass/_home.scss`; import in `main.scss`
- Add to `_sass/_ui.scss`: `.sec-head`, the data readout (`.readout*`), the six-cell score bars (`.scores`/`.score*`), and the ledger table (`.sheet`/`table`/`thead`/`td` variants) — these recur on TL;DR and posts.
- Reference: `design_mockups/homepage-datasheet.html` (all `<style>` + `<main>`).

**Interfaces:**
- Consumes: chrome, `.btn`.
- Produces (in `_ui.scss`): `.sec-head`, `.readout`, `.scores`/`.score`, `.sheet`+table styles, `.databar`. TL;DR (Task 6) and posts (Task 5) reuse `.scores`/`.databar`/`.sheet`.

- [ ] **Step 1: Move shared components into `_sass/_ui.scss`**

From `design_mockups/homepage-datasheet.html`, copy into `_ui.scss`: `.sec-head` (+ `.title-wrap`, `.geo`), `.readout*`, `.scores`/`.score*`, `.sheet`, `table`, `thead th`, `tbody td` + zebra + hover, `td.rank/.shop/.hood/.best/.num/.mtg`, `.databar` (+ `.on`/`.half`), `.footnote`. Keep the selectors identical to the mockup.

- [ ] **Step 2: Create `_sass/_home.scss`**

Copy the homepage-only rules from the mockup: `.hero*` (incl. `padding-block`), `.roundups*`/`.roundup-card*`, `.people*`/`.person*`, and the homepage `@media (max-width: 900px)` and `@media (max-width: 640px)` blocks. Import after `ui`.

- [ ] **Step 3: Rewrite `_layouts/home.html` — hero**

Pick the hero post: `site.posts | where_exp:"p","p.tags contains 'review'"`, then `where:"hero", true | first`, else first. Render the mockup hero: label "Latest review", `{{ featured.title }}`, byline sentence from real fields (`{{ featured.categories[0] }}, {{ featured.categories[1] }}. Reviewed by {{ author.display_name }}, {{ featured.date | date: "%B %Y" }}.`), the review's opening line (`{{ featured.excerpt | strip_html | truncatewords: 30 }}`) as the italic pull, the 4-cell readout (`featured.wifi` mbps, `$featured.drip`, `featured.meeting`, `featured.bathrooms` — hide the bathrooms cell with `{% if featured.bathrooms %}`), six `.scores` bars from `featured.scores.{coffee,wifi,seating,vibe,outlet,quiet}` (fill N of 5), a `.btn` "Read the Review →" to `featured.url`, and the photo (`featured.image`) in `.hero__figure`.

Score-bar Liquid pattern (reuse everywhere):
```liquid
{% assign val = featured.scores.coffee | default: 0 %}
<span class="score__bar">{% for i in (1..5) %}<i{% if i <= val %} class="on"{% endif %}></i>{% endfor %}</span>
```

- [ ] **Step 4: home.html — Recent Reviews table (reverse-chron, 5, excludes hero)**

```liquid
{% assign recent = review_posts | where_exp: "p", "p != featured" | sort: "date" | reverse %}
```
Render `.sheet` table, header "Recent Reviews" in `.sec-head` with geo "Minneapolis & St. Paul". Columns: Shop (link) / Neighborhood (`categories[0]`) / Reviewed (`date | date: "%b %Y"`) / Rating (databar filled to `round(rating)` + numeric). Loop first 5. Below: `.btn` "All shops, ranked and mapped → TL;DR" → `/tldr`.

Databar fill for a possibly-half rating:
```liquid
{% assign full = post.rating | floor %}
{% assign half = post.rating | minus: full %}
<span class="databar">{% for i in (1..5) %}<i{% if i <= full %} class="on"{% elsif i == full|plus:1 and half >= 0.5 %} class="half"{% endif %}></i>{% endfor %}</span>{{ post.rating }}
```

- [ ] **Step 5: home.html — Round Ups**

`{% assign roundups = site.posts | where_exp:"p","p.tags contains 'roundup'" %}`. Section `.roundups` with `.sec-head` "Round Ups" / geo "multi-shop". For each: kicker `{{ post.date | date: "%b %Y" }}`, title, and blurb `{{ post.blurb | default: post.description }}`.

- [ ] **Step 6: home.html — People**

Port `.people` section. Loop `site.authors`, skipping the `juliet + osmar` combined key (`{% if key == "juliet + osmar" %}{% continue %}{% endif %}`). Name = `display_name`, bio = `description` (verbatim from `_config.yml`), photo = `avatar`. No role label.

- [ ] **Step 7: Remove old pagination JS if unused**

The old `home.html` had a pagination `<script>`. The new homepage shows a fixed 5 rows + full list on TL;DR, so pagination is gone. Delete that script block.

- [ ] **Step 8: Build + verify**

```bash
bundle exec jekyll build && bundle exec jekyll serve --detach && sleep 4
node scripts/shoot.js / home
pkill -f "jekyll serve" || true
```
Expected: `overflow … OK`. `/tmp/rr_home_desktop.png` matches `design_mockups/homepage-datasheet.html` order: hero → Round Ups → Recent Reviews → People. Round Up blurbs show the real descriptions. Mobile stacks; the recent-reviews table becomes stacked blocks ≤640px.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: redesign homepage (hero, recent reviews, round ups, people)"
```

---

## Task 5: Review post layout + `bathrooms` field

**Files:**
- Modify: `_layouts/post.html` (restructure to mockup: hero photo, two-col body, "The Breakdown" sticky card; keep JSON-LD, pro-tip JS, mini-map JS)
- Create: `_sass/_post.scss`; import in `main.scss`
- Modify: one review post to carry `bathrooms:` (e.g. `_posts/2024-09-17-frgmnt-st-anthony-main.md` → `bathrooms: 4`) as the reference example
- Reference: `design_mockups/article-frgmnt.html`.

**Interfaces:**
- Consumes: chrome, `.scores` bars, `.sheet` (not needed here), `.btn`.
- Produces: `.artgrid`/`.statcard`/`.strip` styles; the inline-table → ledger-strip JS transform. Roundup posts (Task 8 uses same layout branch) rely on the roundup path staying full-width.

- [ ] **Step 1: Create `_sass/_post.scss`**

Copy from the mockup: `.arthead*`, `.artgrid`, `.statcard*`, `.score*` (if not already global — they are, from `_ui.scss`; skip dupes), `.artbody*`, `.strip*`, `figure.artphoto*`, `.protip*`, `.artnav*`, and the post `@media` blocks. Import after `home`.

- [ ] **Step 2: Add `bathrooms` to the reference post**

In `_posts/2024-09-17-frgmnt-st-anthony-main.md` front matter, add `bathrooms: 4`.

- [ ] **Step 3: Rewrite `_layouts/post.html` header + hero (reviews)**

Replace breadcrumb/hero/meta-strip with the mockup `.arthead` (kicker "Review", `{{ page.title }}`, deck from the post's first `<h5>`? — the deck "F is for freaking huge." is post body copy, not front matter. **Keep it simple:** use `page.description` is "FRGMNT" (not the deck). So render deck only if a `deck:` field exists, else omit. Do **not** invent a deck.) Byline: `By {{ author.display_name }}. {{ page.date | date: "%B %-d, %Y" }}. {{ page.categories[0] }}{% if page.categories[1] %}, {{ page.categories[1] }}{% endif %}.` Then the hero photo (`page.image`) full-width at the top of `.artbody`.

- [ ] **Step 4: post.html — two-column body + The Breakdown card**

Wrap content in `.artgrid` (reviews only; roundups stay full-width — keep the existing `is_roundup` branch). Left `.artbody` renders `{{ content }}`. Right `<aside class="statcard">`: head "The Breakdown" + `{{ page.rating }}/5`; facts grid (wifi/drip/meetings/bathrooms, each `{% if %}`-guarded); six `.scores` bars from `page.scores`; foot with `page.bestfor` (plain mono, not colored) and a Maps link (`page.maps`). Keep `{% unless is_roundup %}` around the sidebar.

- [ ] **Step 5: post.html — restyle inline tables to ledger strips**

The post body contains `table.table` HTML. Keep the existing JS that adds `data-label` (it aids mobile). In `_post.scss`, style `.post-body__content table.table` as the ledger strip look (bordered row of key/value cells) OR add a small JS transform. **Simplest, no new JS:** style the existing tables via CSS to resemble `.strip` (top/bottom rule, mono values, uppercase `data-label` headers shown on mobile). Provide the CSS in `_post.scss` targeting `.post-body__content .table`.

- [ ] **Step 6: post.html — keep functional JS/SEO**

Preserve verbatim: the pro-tip wrapping `<script>`, the mini-map `<script>` (`#review-map`, recolor the marker SVG to espresso `#52341E` teardrop / keep readable), the IntersectionObserver GA4 hooks, the JSON-LD block, and the Leaflet `<script src>` guard. Update the prev/next `.post-nav` markup to `.artnav` styling; labels are prev/next titles + "All Reviews →" to `/reviews`.

- [ ] **Step 7: Build + verify**

```bash
bundle exec jekyll build && bundle exec jekyll serve --detach && sleep 4
node scripts/shoot.js /frgmnt-st-anthony-main/ post   # confirm the real URL via _site
pkill -f "jekyll serve" || true
```
(Confirm the post URL: `ls _site` or check `permalink`. FRGMNT slug from filename.) Expected: `overflow … OK`. Compare to `design_mockups/article-frgmnt.html`: hero photo, ledger strips for the wifi/noise/tables data, sticky "The Breakdown" card with `4/5`, bathrooms `4`, "Best Aesthetic" plain mono. Pro-tip box renders. Mini-map appears.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: redesign review post layout, add bathrooms field"
```

---

## Task 6: TL;DR page — map, leaderboard, detail panel, verdicts table

**Files:**
- Modify: `_pages/tldr.md` (restructure to mockup; keep `window.__shops` data block, Leaflet, radar include, map JS)
- Create: `_sass/_tldr.scss`; import in `main.scss`
- Modify: `_includes/leaderboard-row.html` (markup → mockup `.row` button)
- Modify: `_includes/radar-chart.html` (recolor to espresso; keep geometry)
- Modify: `assets/js/tldr-map.js` (restyle pins/popup only if colors are hard-coded; keep behavior)
- Reference: `design_mockups/tldr-leaderboard.html`.

**Interfaces:**
- Consumes: chrome, `.scores` bars, `.sheet` table, `.footnote`, `.btn`.
- Produces: the TL;DR interactive layout. No downstream consumers.

- [ ] **Step 1: Create `_sass/_tldr.scss`**

Copy from the mockup: `.tldr-hero*`, `.tldr-main`, `.map-col*` (the fake-pin styles are mockup-only — **omit** `.map-col__map` grid placeholder and `.pin*`; the real Leaflet map fills `#tldr-map`), `.board*`, `.row*`, `.detail*`, `.radar*` (if the radar include needs it), `.bestfor*`, and TL;DR `@media` blocks. Import after `post`.

- [ ] **Step 2: tldr.md — hero with full-width sub**

Keep the `window.__shops` `<script>` and front matter (`leaflet: true`). Replace the hero with `.tldr-hero` (label "The Shortcut", h1 "TL;DR", stats: `{{ review_posts.size }}` Reviews / 100% Opinions / 0 Chill). Put the sub **outside** the hero flex as a full-width `<p class="tldr-hero__sub">` spanning to the map (verbatim sub copy from spec).

- [ ] **Step 3: tldr.md — map + leaderboard panel**

`.tldr-main` grid: left `.map-col` containing `<div id="tldr-map">` (existing) + `.map-col__hint` "Click a pin to explore"; right `.board` with head "Leaderboard" and the loop `{% include leaderboard-row.html post=post rank=rank %}`.

- [ ] **Step 4: Rewrite `_includes/leaderboard-row.html`**

Match the mockup `.row` (a `<button>` or keep the existing `role="button"` div, preserving `data-lat/lng/url/shop` for the map JS). Structure: `.row__rank` (zero-padded), `.row__info` (`.row__name` link + `.row__sub` city), `.row__stars` (mono stars via `stars.html` or a mono glyph). Keep the `data-*` attributes the map JS reads.

- [ ] **Step 5: tldr.md — detail panel**

Port `.detail` (image col with overlay: hood, name, "Read Full Review →"; Breakdown col with six `.scores` bars; Profile col with `{% include radar-chart.html %}`). The panel is populated by the existing map JS on click — keep `#tldr-detail`, `#det-*` IDs the JS expects (cross-check `assets/js/tldr-map.js`). Restyle only; do not rename the IDs the JS depends on.

- [ ] **Step 6: tldr.md — verdicts table + best-for + support**

Full `.sheet` table titled "The Verdicts" (all reviews sorted by rating desc): rank/shop/neighborhood/rating+bar/wifi/drip/meetings(`NO` in `.stamp` red)/best-for. Footnote "MTGS? = would we take a Zoom call here." Keep the existing "Best For…" cards (verbatim) and the Venmo support block.

- [ ] **Step 7: Recolor radar + map pins**

In `_includes/radar-chart.html` (and/or `_tldr.scss`), change fills/strokes to `--espresso`; labels DM Mono `--pencil`. In `assets/js/tldr-map.js`, if the pin SVG or popup colors are gold `#D4AA20`, change to espresso `#52341E` (active pin `#C8311C`). Behavior unchanged.

- [ ] **Step 8: Build + verify**

```bash
bundle exec jekyll build && bundle exec jekyll serve --detach && sleep 4
node scripts/shoot.js /tldr tldr
pkill -f "jekyll serve" || true
```
Expected: `overflow … OK`. Compare to mockup: hero + full-width sub above the real map, leaderboard beside it, the Verdicts ledger table, Best For cards. Click a pin manually in a browser to confirm the detail panel still populates (JS intact).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: redesign TL;DR (map, leaderboard, detail, verdicts table)"
```

---

## Task 7: Reviews index page ("Every Review")

**Files:**
- Create: `_pages/reviews.md` (permalink `/reviews`)
- Modify: `_layouts/archive.html` OR render inline in the page (choose page-inline for control)
- Add to `_sass/_home.scss` or new `_sass/_reviews.scss`: the index list styles
- Reference: reuse the `.sheet` ledger table look from `_ui.scss`.

**Interfaces:**
- Consumes: chrome, `.sheet` table or `.roundup-card` grid, `.sec-head`.
- Produces: the `/reviews` page that the nav "Reviews" link and post "All Reviews →" target.

- [ ] **Step 1: Create `_pages/reviews.md`**

Front matter: `layout: page`, `title: Reviews`, `permalink: /reviews`. Body: a `.wrap` with a header block — h1 "Every Review", mono sub "Reviews + round ups, newest first", intro line "Every shop we've hauled a laptop into, plus the round ups. Newest first." (verbatim, approved).

- [ ] **Step 2: List all reviews + roundups, newest first**

```liquid
{% assign entries = site.posts | where_exp: "p", "p.tags contains 'review' or p.tags contains 'roundup'" | sort: "date" | reverse %}
```
Render as a `.sheet` ledger table: columns Shop/Title, Type (Review/Round Up from tags), Neighborhood or "—", Reviewed (date), Rating (databar for reviews; "—" for roundups). Each title links to `post.url`.

- [ ] **Step 3: Build + verify**

```bash
bundle exec jekyll build && bundle exec jekyll serve --detach && sleep 4
node scripts/shoot.js /reviews reviews
pkill -f "jekyll serve" || true
```
Expected: `overflow … OK`; page lists all 14 reviews + 3 roundups, newest first, styled like the ledger. Nav "Reviews" is marked active.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Reviews index page (Every Review)"
```

---

## Task 8: Roundup layout + `blurb` field + Reviews/archive polish

**Files:**
- Modify: `_layouts/roundup.html` (restyle to redesign; full-width body)
- Modify: `_layouts/archive.html` (restyle or confirm unused; jekyll-archives may generate category/tag pages that should match)
- Add optional `blurb:` to one roundup post as the reference (`_posts/2023-10-30-summer-roundup.md` → `blurb:` equal to a chosen line, or leave to prove fallback to `description`)
- Reference: `design_mockups/homepage-datasheet.html` roundup cards; `article-frgmnt.html` for post chrome.

**Interfaces:**
- Consumes: chrome, `.sheet`, post chrome.
- Produces: consistent roundup rendering; confirms `blurb` fallback.

- [ ] **Step 1: Restyle `_layouts/roundup.html`**

Apply the redesign masthead/typography (inherits from default). Give the roundup a `.arthead` header (kicker "Round Up", title, byline) and a full-width body in `.wrap`. Its per-shop `shops:` front-matter cards should adopt the ledger/readout look (reuse `.readout`/`.databar`/`.scores`). Keep all copy verbatim (`intro`, `outro`, bullets).

- [ ] **Step 2: Confirm `blurb` fallback works**

Home + Reviews already use `{{ post.blurb | default: post.description }}`. Add `blurb: "…"` to `_posts/2023-10-30-summer-roundup.md` (choose Juliet-approved wording, or reuse its `description` to prove no visual change), rebuild, and confirm the Summer card shows the `blurb` value.

- [ ] **Step 3: Restyle or neutralize `_layouts/archive.html`**

If `jekyll-archives` generates `/categories`/`/tags` pages, restyle `archive.html` to the redesign (reuse `.sheet` list). If those pages aren't linked anywhere in the new nav, still ensure they inherit the new chrome and don't reference deleted classes. Build must not error.

- [ ] **Step 4: Build + verify**

```bash
bundle exec jekyll build && bundle exec jekyll serve --detach && sleep 4
node scripts/shoot.js /summer-round-up/ roundup   # confirm real URL
node scripts/shoot.js / home_blurb
pkill -f "jekyll serve" || true
```
Expected: roundup page styled consistently; homepage Summer card reflects the `blurb`. `overflow … OK` on both.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: redesign roundup layout, add blurb field, restyle archives"
```

---

## Task 9: Full-site sweep, cleanup, CI parity

**Files:**
- Modify: any partial still referencing retired classes/gold/blobs
- Modify: `_sass/_stars.scss` (recolor to espresso), `_includes/stars.html`/`star_rating*` if gold is hard-coded
- Verify: `_sass/_layouts.scss` / `_components.scss` — retire dead rules the redesign no longer uses (only delete what's provably unused to avoid breakage)

**Interfaces:**
- Produces: a clean, consistent build with no leftover old-design CSS bleeding through.

- [ ] **Step 1: Recolor stars**

In `_sass/_stars.scss` and any star include, replace gold `#D4AA20`/`$accent` old value with `--espresso`. Rebuild; check a star rating renders espresso, not gold.

- [ ] **Step 2: Grep for retired tokens**

Run:
```bash
grep -rn '#D4AA20\|#B58F0E\|blob\|parallax\|№\|01 ·' _sass _layouts _includes _pages assets/js assets/css
```
Expected: no meaningful hits (only historical/unused). Fix any live references.

- [ ] **Step 3: Every page overflow + visual pass**

```bash
bundle exec jekyll build && bundle exec jekyll serve --detach && sleep 4
for p in "/ home" "/tldr tldr" "/about about" "/reviews reviews"; do set -- $p; node scripts/shoot.js "$1" "$2"; done
node scripts/shoot.js /frgmnt-st-anthony-main/ post
node scripts/shoot.js /summer-round-up/ roundup
pkill -f "jekyll serve" || true
```
Expected: every line prints `overflow … OK`. Eyeball each `/tmp/rr_*_desktop.png` and `_mobile.png` against its mockup.

- [ ] **Step 4: CI parity — html-proofer**

Reproduce CI locally (see `.github/workflows`): `bundle exec jekyll build` then the repo's html-proofer invocation. Fix broken links/images the redesign introduced (e.g., `/reviews` link, image paths).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: recolor stars, remove retired tokens, full-site verification"
```

---

## Task 10: Remove mockups from shipped site, finalize

**Files:**
- Modify: `_config.yml` (ensure `design_mockups/` and `docs/` are excluded from the build so they don't publish) OR move mockups out of the published tree
- Verify: final build + branch ready for PR

- [ ] **Step 1: Exclude non-site dirs from the build**

In `_config.yml`, add to `exclude:` — `design_mockups`, `docs`, `scripts`, `README*` as appropriate (confirm they aren't already excluded and aren't needed at runtime). Rebuild; confirm `_site/design_mockups` is absent.

- [ ] **Step 2: Final build + overflow sweep**

Run Task 9 Step 3 again. All `OK`.

- [ ] **Step 3: Commit + open PR**

```bash
git add -A
git commit -m "chore: exclude mockups/docs from published build"
git push -u origin redesign/datasheet
gh pr create --title "Redesign: spreadsheet-with-a-mouth" --body "$(cat <<'BODY'
Implements docs/superpowers/specs/2026-09-11-remoteroast-redesign-design.md.
Reskins the site (palette, type, structure), removes the blob system,
adds a Reviews index page and bathrooms/blurb fields.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
BODY
)"
```

---

## Self-review notes (author)

- **Spec coverage:** palette/type (T1), chrome/nav (T2), About (T3), homepage incl. recent-reviews/roundups/people (T4), review post + bathrooms (T5), TL;DR map/leaderboard/detail/verdicts (T6), Reviews index (T7), roundup + blurb (T8), stars/cleanup (T9), publish hygiene (T10). All spec §3 pages and §5 data bindings and §6 decisions are covered.
- **Copy:** every new string is drawn from Global Constraints (spec §6a). No task introduces unapproved copy; decks/blurbs fall back to real front matter.
- **Consistency:** shared components (`.wrap`, `.btn`, `.sec-head`, `.scores`, `.databar`, `.sheet`) are defined once in `_chrome.scss`/`_ui.scss` and reused; page partials only add page-specific rules. Score-bar and databar Liquid patterns are specified once and reused verbatim.
- **Risk:** `_layouts.scss` (1883 lines) and `_components.scss` (562) hold the OLD design. The plan layers new partials that override by being imported later and by new markup using new class names; T9 greps for and removes live references to retired classes/colors. If old rules bleed through visually, delete the specific offending old blocks (don't mass-delete).
