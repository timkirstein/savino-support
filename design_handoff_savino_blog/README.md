# Handoff: Savino Blog Post Template → Jekyll

## Overview
This package converts a finished HTML blog-post mockup into a working Jekyll site. The deliverable is a Jekyll theme/structure that lets the Savino team write Markdown posts and have them rendered with the design in this bundle.

## About the design files
`Savino Blog Post Template.html` is a **design reference** — a finished single-file HTML mock showing exactly what a rendered blog post should look like. It is not production code. The task is to split it into proper Jekyll building blocks (`_layouts`, `_includes`, `_sass`, front matter) so editors can author posts as Markdown without touching HTML.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and component structure in the mock are final. The Jekyll output should match the mock pixel-for-pixel at desktop widths and respect the mobile breakpoint at `880px` already encoded in the CSS.

---

## Target Jekyll structure

```
savino-blog/
├── _config.yml
├── _layouts/
│   ├── default.html        # <html>, <head>, header, footer
│   ├── post.html           # extends default, renders article body
│   └── blog-index.html     # the /blog landing (list of posts)
├── _includes/
│   ├── head.html           # <head> tags, font preconnect, meta
│   ├── header.html         # sticky site header (logo + nav + CTAs)
│   ├── footer.html         # © + policy links
│   ├── meta-row.html       # category pill + date + author + reading time
│   ├── conversion-card.html # the deep-green "Last ned" card before footer
│   ├── related-posts.html  # 3-up grid below the article
│   └── wine-list.html      # data block (see Components below)
├── _sass/
│   ├── _tokens.scss        # CSS custom properties from :root
│   ├── _header.scss
│   ├── _article.scss
│   ├── _convert.scss
│   ├── _related.scss
│   └── _footer.scss
├── assets/
│   ├── css/main.scss       # imports all _sass/* partials
│   ├── img/logo.png
│   ├── img/salvino-screen.png
│   └── posts/<post-slug>/hero.jpg
├── _posts/
│   └── 2026-02-25-vin-til-grillet-laks.md
├── _data/
│   └── authors.yml         # avatar initials, full name, optional photo
├── pages/
│   ├── blog.html           # uses layout: blog-index
│   ├── personvern.md
│   ├── vilkar.md
│   └── kontakt.md
└── index.html              # marketing landing (separate, not in scope)
```

---

## Front matter contract (the post Markdown file)

Every post should have this front matter. The layout reads these keys directly — keep names exact.

```yaml
---
layout: post
title: "Vin til grillet laks med sitron"
lead: "Grillet laks med sitron er sommerens enkleste og beste rett. Her er Savinos tips til hvilken vin som passer — og hvorfor det finnes flere gode valg enn du tror."
date: 2026-02-25
category: Sjømat
author: sigrid          # key into _data/authors.yml
hero:
  src: /assets/posts/vin-til-grillet-laks/hero.jpg
  alt: "Grillet laks med sitron på et trebord"
  caption: "Sommerens enkleste rett — og en av de enkleste å pare vin med."
# reading_time: auto-calculated by a plugin or a simple Liquid word-count filter
---
```

Post body is plain Markdown, with two custom components rendered via Liquid `{% include %}` tags:

````markdown
## Hva å se etter i vinen

Three things do the job: **frisk syre** som speiler sitronen, **moderat fylde** ...

> Du leter ikke etter en vin som matcher laksen — du leter etter en som matcher sitronen.

## Klassikeren: Sauvignon Blanc

En Sauvignon Blanc fra Loire-dalen eller New Zealand er det klassiske og enkle valget…

{% include wine-list.html wines=page.wines_section_1 %}

## Et mer overraskende valg: tørr rosé

…

{% include figure-aside.html
   image="/assets/posts/vin-til-grillet-laks/app-screen.png"
   eyebrow="Slik ser det ut i appen"
   heading="Anbefalingene tilpasses ditt nærmeste Vinmonopol"
   body="Skriv inn retten — Savino sjekker hvilke av flaskene som finnes på din lokale pol akkurat nå…" %}
````

The wine list data comes from extra front matter:

```yaml
wines_section_1:
  - name: Cloudy Bay Sauvignon Blanc 2024
    meta: "Marlborough · New Zealand · 12.5 %"
    price: "279,90 kr"
  - name: Domaine Vacheron Sancerre 2023
    meta: "Loire · Frankrike · 13 %"
    price: "329,00 kr"
  - name: Villa Maria Private Bin 2024
    meta: "Marlborough · New Zealand · 13 %"
    price: "169,90 kr"
```

---

## Sub-heading numbering

The mock has each `<h2>` prefixed with a mono "01 / 02 / 03" number. Implement with a CSS counter rather than hard-coding in the Markdown:

```scss
.body { counter-reset: h2; }
.body h2::before {
  counter-increment: h2;
  content: counter(h2, decimal-leading-zero);
  display: block;
  margin-bottom: 8px;
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--green);
}
```

Authors then write plain `## Headline` — they don't have to think about numbering.

---

## Reading time

Use a built-in word-count filter, no plugin needed:

```liquid
{% assign words = page.content | number_of_words %}
{% assign reading_time = words | divided_by: 220 | plus: 1 %}
<span>{{ reading_time }} min lesning</span>
```

(220 wpm is the common Norwegian estimate for editorial prose.)

---

## Author data (`_data/authors.yml`)

```yaml
sigrid:
  name: Sigrid Holm
  initials: SH
  bio: "Skriver om vin og hverdagsmat for Savino."

mathias:
  name: Mathias Borg
  initials: MB
```

Referenced in the meta row:

```liquid
{% assign author = site.data.authors[page.author] %}
<span class="author">
  <span class="author-avatar">{{ author.initials }}</span>{{ author.name }}
</span>
```

---

## Categories → URLs

The category pill is a link to the category archive. Generate archives without a plugin using collections, or with `jekyll-archives` if the team is OK with plugins.

Without plugins: create `/blog/kategori/sjomat.html` etc. manually, each filtering `site.posts` by category.

---

## Related posts

Use `site.related_posts` (Jekyll computes this automatically based on tags/recency). The mock shows 3 cards — slice the array:

```liquid
{% assign related = site.related_posts | slice: 0, 3 %}
{% for post in related %}
  <a class="card" href="{{ post.url | relative_url }}">
    <span class="cat-tag">{{ post.category }}</span>
    <h5>{{ post.title }}</h5>
    <span class="date">{{ post.date | date: "%-d. %B %Y" }}</span>
  </a>
{% endfor %}
```

For more relevant matches, add `lsi: true` to `_config.yml` (slow at build, set only for production builds).

---

## Norwegian date formatting

Jekyll's default `date` filter outputs English month names. Either:

1. Set `LANG=nb_NO.UTF-8` in the build environment so `strftime` picks up Norwegian (works on Netlify with a `LANG` env var); or
2. Use a Liquid replacement chain — translate the 12 month names in `_config.yml` under a `months` key and look them up. Slightly more work but plugin-free.

The mock format is `25. februar 2026` — lowercase month, no comma.

---

## Design tokens

Lift these into `_sass/_tokens.scss` as both CSS custom properties (for runtime use) and SCSS variables (for compile-time math if needed).

### Colors
| Token | Hex | Use |
|---|---|---|
| `--green` | `#199978` | Primary buttons, headings accents |
| `--green-secondary` | `#4AA783` | Hover surfaces |
| `--green-deep` | `#146F5B` | CTA hover, links, lead-paragraph text |
| `--green-dark` | `#115F4E` | Phone frame |
| `--green-darker` | `#0B3F35` | Conversion card background |
| `--mint-bright` | `#5DE0A8` | Pill accent dot, conversion glow |
| `--mint` | `#E8F5EE` | Page background |
| `--mint-2` | `#D5EBDF` | Aside figure background |
| `--mint-3` | `#c8e3d3` | Reserved |
| `--white` | `#FFFFFF` | Wine list rows, cards |
| `--ink` | `#0A1A14` | Body text |
| `--ink-2` | `#3A4B43` | Secondary text |
| `--muted` | `#6E7E76` | Meta text, dates |
| `--line` | `rgba(10,26,20,0.10)` | Hairlines |
| `--line-strong` | `rgba(10,26,20,0.18)` | Button borders, dots |

### Typography
| Family | Variable | Source | Use |
|---|---|---|---|
| Manrope (300–800) | `--sans` | Google Fonts | Body, UI, headings |
| DM Serif Display (italic + roman) | `--serif` | Google Fonts | Lead, pull quotes, conversion card title |
| JetBrains Mono (400, 500) | `--mono` | Google Fonts | Numbers, prices, eyebrows |

Scale used in the article:
- `h1` — clamp(40px, 5vw, 64px), weight 700, line-height 1.04, letter-spacing −0.022em
- `.lead` — clamp(22px, 2.2vw, 27px), serif italic, line-height 1.4, color `--green-deep`
- `h2` — 28px, weight 700, line-height 1.2, letter-spacing −0.012em
- `body p` — 17px, line-height 1.65, color `--ink`
- `.pullquote` — 22px, serif italic, line-height 1.45, color `--green-deep`
- `figcaption` — 14px, serif italic, color `--ink-2`

### Layout
- `--reading-width: 680px` — body column (≈68 characters)
- `--content-width: 1080px` — hero, conversion card, related grid
- Article vertical padding: `56px` top / `96px` bottom on desktop, `36px` / `64px` on mobile
- Mobile breakpoint: `880px`

### Radii & shadows
- Cards / wine list: `14px`
- Hero figure / conversion card: `18–22px`
- Phone frame: `28px` with `8px` solid `--green-dark` border
- Conversion card glow: radial `rgba(93,224,168,0.25)` 360×360px offset bottom-right
- Related card hover: `0 12px 24px -16px rgba(11,63,53,0.2)` + `translateY(-2px)`

---

## Components in the layout

Each maps to a Jekyll include or a CSS class — listed in document order.

### 1. Sticky site header
Logo lockup left, three actions right: `Blogg` text link, `Google Play` filled pill, `App Store` filled pill. Reuses the landing-page header — extract into `_includes/header.html` and use on both this site and the marketing site.

### 2. Meta row
Category pill (filled `--green`, white text, mint-bright dot inside) · long-form date · separator dot · author avatar+name · separator dot · reading time. All inline-flex with 14px gap; wraps on mobile.

### 3. H1 title
Max-width 880px, `text-wrap: balance` for nice line breaks. No prefix, no eyebrow.

### 4. Lead paragraph
Serif italic, larger than body, color `--green-deep`. Pulled from `page.lead` front matter (not the first paragraph of content — those are different fields).

### 5. Hero figure
`aspect-ratio: 21 / 9`, full content-width (1080px), `18px` radius. Caption centered below in serif italic.

### 6. Body
680px column, 17px body text. `<h2>` gets the CSS-counter prefix described above. Standard Markdown: `**strong**`, `*em*`, `> blockquote`, links.

### 7. Pull quote
`<blockquote>` styled with left border `3px solid --green`. Render plain `> …` Markdown lines as this style.

### 8. Wine list
A 3-column grid per row: badge (mono number in mint circle) · name + meta (vendor / region / abv) · price (mono). White card, 14px radius, hairline separators. Data lives in front matter; rendered via `{% include wine-list.html %}`.

### 9. Aside figure (phone + caption block)
Breaks out of the reading column to content-width. Left: 240px phone in deep-green bezel with shadow. Right: eyebrow + h3 + body. Stacks vertically below 880px.

### 10. Conversion card
Deep-green panel before footer with serif italic headline, body copy, two white pill CTAs (App Store + Google Play), and a tilted phone mockup on the right. The radial mint-bright glow lives in `::before`. Hide the phone column on mobile.

### 11. Back link
A single outlined pill — `← Tilbake til blogg` — separated from content by a hairline.

### 12. Related posts
3-column grid; collapses to single column at 880px. Card hover lifts 2px with a subtle shadow.

### 13. Footer
Single row, max 1240px. Copyright left, `Blogg · Personvern · Vilkår · Kontakt` right.

---

## Interactions & behavior

- **Header is sticky** (`position: sticky; top: 0;`). Background stays `--mint` so it blends with the page.
- **Smooth scroll** for any in-page anchors — add `html { scroll-behavior: smooth; }` to a base stylesheet.
- **Hover states** are present for all links, CTAs, and the related-post cards. See the source CSS for exact values.
- **No JavaScript required** for the layout itself. Optional enhancements:
  - Reading progress bar at top of viewport
  - Copy-link button next to H2s when hovered
  - Save-for-later in the meta row

---

## Assets included
- `assets/logo.png` — Savino mark, transparent PNG
- `assets/salvino-screen.png` — app screenshot used in the aside figure and conversion card
- `assets/salmon-photo.png` — hero photo placeholder (replace per post)
- `Savino Blog Post Template.html` — the source mockup; reference this for any unclear spacing

---

## Implementation order (suggested)

1. `_config.yml`, `_layouts/default.html`, `_includes/head.html`, `_includes/header.html`, `_includes/footer.html` — get the chrome rendering
2. `_sass/_tokens.scss` and `assets/css/main.scss` — wire up design tokens
3. `_layouts/post.html` — render meta row, h1, lead, hero, body, back link
4. Markdown post (`_posts/2026-02-25-vin-til-grillet-laks.md`) — get one real post building
5. `_includes/wine-list.html`, `_includes/figure-aside.html` — the two custom components
6. `_includes/conversion-card.html`, `_includes/related-posts.html` — the post-body sections
7. CSS-counter numbering on h2 — last, after content is flowing
8. `_layouts/blog-index.html` and `/blog.html` — the listing page (use the same card style as related posts)
9. Norwegian date formatting + reading-time filter
10. Pages: `personvern.md`, `vilkar.md`, `kontakt.md` — simple Markdown with the default layout

---

## Acceptance checklist

- [ ] A new `.md` post in `_posts/` with the documented front matter renders identically to the mockup
- [ ] H2 numbering increments automatically (`01`, `02`, `03`, …) without author intervention
- [ ] Reading time is computed, not authored
- [ ] Norwegian dates render as `25. februar 2026`
- [ ] Wine list renders from front matter, not inline HTML
- [ ] Mobile layout collapses at 880px: aside stacks, conversion card hides the phone, related grid becomes single-column
- [ ] Header is sticky and stays mint
- [ ] Lighthouse a11y score ≥ 95 (color contrast, headings, alt text)
- [ ] Build is plugin-free (or uses only plugins on GitHub Pages' allow-list, if hosted there)
