# kapoordeepanshu.github.io

Personal portfolio — freelance full-stack developer, 12+ years, security-first.
Plain HTML, CSS and JavaScript. No build step, no dependencies, no trackers.

**Live:** https://kapoordeepanshu.github.io

```
index.html          the whole page (+ JSON-LD structured data in <head>)
css/style.css       design tokens + all styling
js/main.js          nav, scroll-spy, reveals, custom cursor, clipboard
robots.txt          crawler directives
sitemap.xml         one URL; update <lastmod> when you edit the page
.nojekyll           tells GitHub Pages to serve the files as-is
```

Sections, in order: Hero → Trust strip → About → Skills → Services → Projects →
"Project in mind?" CTA band → Contact.

CTAs sit at four scroll depths so an enquiry is never more than one screen away.

---

## Also worth a look before launch

| Where | What |
|---|---|
| `#home` — stats | `12+ years` is accurate; `80+ projects` is a placeholder — set it or remove it |
| `#work` | Three real projects. Add more cards in the same shape as you ship them |

Nothing else is a placeholder.

---

## Run it locally

Any static server works. With Node installed:

```bash
npx serve .
```

Or Python:

```bash
python -m http.server 8080
```

Then open http://localhost:8080. Opening `index.html` directly via `file://`
mostly works, but the clipboard button won't — it needs a secure context.

---

## Deploy to GitHub Pages

1. Create a public repo named **exactly** `kapoordeepanshu.github.io`.
   The name has to match your username or Pages won't serve it at the root domain.
2. Push this folder to `main` (commands below).
3. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `/ (root)`.
4. Live in a minute or two at `https://kapoordeepanshu.github.io`.

A user-site repo (`<username>.github.io`) must be public on the free plan.

### First push

```bash
git remote add origin https://github.com/kapoordeepanshu/kapoordeepanshu.github.io.git
git push -u origin main
```

---

## After it's live

1. Verify the site in [Google Search Console](https://search.google.com/search-console)
   and submit `sitemap.xml`.
2. Check the structured data with the
   [Rich Results Test](https://search.google.com/test/rich-results).
3. Add the URL to your LinkedIn profile and to each repo's **About** field —
   those will be your only backlinks at first, and they matter more than anything
   on the page.
4. Update `<lastmod>` in `sitemap.xml` when you make substantial edits.

---

## Design system

Dark-first glassmorphism with an indigo → violet → pink gradient. **Dark is the
default for every first-time visitor**, regardless of OS preference — the glow,
orbs and glass surfaces are designed for it. Light is a one-click toggle and the
choice persists in `localStorage`.

| Token | Value |
|---|---|
| Background | `#0a0a0f` / `#12121a` |
| Accents | `#6366f1` → `#8b5cf6` → `#ec4899` |
| Type | Inter (UI), JetBrains Mono (labels, data) |
| Easing | `cubic-bezier(.16, 1, .3, 1)` — expo.out |
| Timing | 180ms micro-interactions, 300ms states, 500ms reveals |

Motion: hero load choreography, count-up stats, staggered scroll reveals (60ms
apart, capped at 400ms), ambient background orbs, a spinning conic profile ring,
one magnetic CTA, pointer-tracked card glow, an animated logo mark (chevron draws
in, caret blinks, gradient drifts), and a custom cursor (conic ring + dot) that
blooms over links and becomes a caret over inputs.

All of it collapses under `prefers-reduced-motion: reduce`, and the cursor stays
native on touch devices. The one deliberate exception is the logo caret: a 6×2px
blink at ~0.9Hz, far below the 3Hz WCAG seizure threshold and involving no
movement at all.

### Two things not to undo

**`backdrop-filter` is deliberately not on `.glass-card`.** Twenty-odd blurring
elements made the browser re-sample the background every scroll frame, which is
what caused scroll stutter. The orbs are already blurred, so translucency alone
gives the same look. Keep it limited to the few fixed elements (navbar, mobile
menu, hero badge, profile status).

**Assets are cache-busted with `?v=N`.** Bump the number in `index.html` when you
change `style.css` or `main.js`, or returning visitors keep the old file.

---

## Contact details wired in

| | |
|---|---|
| Email | `deepanshukapoor756@gmail.com` |
| LinkedIn | `linkedin.com/in/deepanshukapoor` |
| WhatsApp | `wa.me/kapoordeepanshu` — links to the WhatsApp username, so the phone number never appears on the site |
| GitHub | `github.com/kapoordeepanshu` |

There's a floating WhatsApp button, bottom-left, that expands its label on hover.
Delete the `.wa-float` block in `index.html` if you don't want it.

There is no contact form — enquiries go through WhatsApp or email, which is fewer
moving parts and converts better for freelance work anyway.

---

## SEO

Done:

- Keyword-led `<title>` and meta description aimed at what clients search for
  ("freelance full-stack developer", "ChatGPT / Claude / Gemini integration",
  "website malware removal", "secure web development")
- Open Graph + Twitter cards, so shared links render a proper preview
- `schema.org` JSON-LD: `Person` (22 `knowsAbout` entries), `ProfessionalService`
  with a six-item offer catalog, and `WebSite`
- `robots.txt` + `sitemap.xml`, canonical URL, one `<h1>`, sequential headings,
  descriptive alt text, and no keyword-bearing text injected by JavaScript

Known gaps, in order of value:

1. **The `<h1>` is "Hi, I'm Deepanshu Kapoor"** — no keywords in the strongest
   on-page signal there is. Worth reconsidering.
2. **One page means one primary intent.** "Website malware removal" and
   "freelance full-stack developer" are different searches wanting different
   pages. Separate service pages are the real unlock; malware removal first,
   since that traffic is panic-driven and doesn't price-shop.
3. **Font Awesome (100 KB) + Devicon (52 KB) are render-blocking** for roughly
   40 icons. Self-hosting a subset would cut ~95% of that and improve LCP.
4. **`og:image` is the GitHub avatar** — square, where social cards want
   1200×630. Shared links will crop badly.
5. No FAQ section or `FAQPage` schema — the cheapest remaining ranking win.
6. `areaServed` is `"Worldwide"`; add a city if you want local clients.

---

## Keeping the repo yours

Public repo, but nobody can push to it:

- **Nobody can push unless you invite them.** A public repo is read-only to
  strangers by default. They can fork it and open a pull request; that never
  touches your branch until you merge. Check *Settings → Collaborators* is empty.
- **Protect `main` anyway** — *Settings → Rules → Rulesets → New branch ruleset*,
  target `main`, enable **Restrict deletions**, **Block force pushes**, and
  **Require a pull request before merging**. This also protects you from your own
  bad `--force`.
- **Turn on 2FA.** Account takeover is the realistic threat here, not a rogue push.
- **Sign your commits** so a merged PR can't quietly impersonate you.
- **Settings → Actions → General** → set *Fork pull request workflows* to require
  approval, so a PR can't run CI without you saying so.

---

## Licence

Content and design © Deepanshu Kapoor. Code is yours to learn from.
