"""Helpers for writing chapter pages in site/topics/ with the standard structure.

Usage (from a throwaway script):

    import sys; sys.path.insert(0, '/path/to/illusion/scripts')
    from chapter_kit import *
    page('slug', 'Title', 'meta description', 'THM01', 'Domain name', 'THM', '<em>H1</em>', 'lede',
         ['Reading time ≈ 9 min', ...], 'glance', story, illusion, genesis, model, reveal,
         applications, lies_html, remember, deeper)

The section order, ids and classes follow docs/chapter-template.md. Previous/next links are filled
in by site/chapter.js from the catalogue, so the pager is written empty here. Build helpers
(sim, illo, try_list, key, timeline, apps, now, lies, glossary, refs) return HTML strings; svg(),
t() and arrow_svg() draw the inline illustrations in the site's dark palette.
"""
import html
import math
from pathlib import Path

SITE = str(Path(__file__).resolve().parent.parent / 'site' / 'topics') + '/'
TOC = [('story', 'Story'), ('illusion', 'Illusion'), ('genesis', 'Genesis'), ('model', 'Model &amp; simulation'),
       ('reveal', 'Reveal'), ('applications', 'Where it shows up'), ('lies', 'Where it lies'),
       ('remember', 'Remember'), ('deeper', 'Go deeper')]


def sim(name, alt, caption):
    return f'<div data-sim="{name}" data-alt="{html.escape(alt, quote=True)}" data-caption="{html.escape(caption, quote=True)}"></div>'


def illo(svg_html, caption):
    return f'<figure class="illo">{svg_html}<figcaption>{caption}</figcaption></figure>'


def try_list(items):
    li = ''.join(f'<li>{i}</li>' for i in items)
    return f'<div class="try"><h3>Try this</h3><ol>{li}</ol></div>'


def key(label, text):
    return f'<div class="callout key"><p class="beat">{label}</p><p>{text}</p></div>'


def timeline(rows):
    li = ''.join(f'<li><span class="year">{y}</span>{t_}</li>' for y, t_ in rows)
    return f'<ol class="timeline">{li}</ol>'


def apps(rows):
    li = ''.join(f'<li><strong>{h}</strong>{t_}</li>' for h, t_ in rows)
    return f'<ul class="apps">{li}</ul>'


def now(text):
    return f'<div class="now"><p class="beat">Happening right now</p><p>{text}</p></div>'


def lies(text):
    return f'<div class="callout lies"><p class="beat">Honest limits</p><p>{text}</p></div>'


def glossary(rows):
    return '<dl class="glossary">' + ''.join(f'<dt>{a}</dt><dd>{b}</dd>' for a, b in rows) + '</dl>'


def refs(rows):
    return '<ul class="refs">' + ''.join(f'<li>{r}</li>' for r in rows) + '</ul>'


def page(slug, title, desc, tid, domain, dcode, h1, lede, meta, glance, story, illusion, genesis, model, reveal,
         applications, lies_html, remember, deeper):
    toc = ''.join(f'<li><a href="#{i}">{n}</a></li>' for i, n in TOC)
    remember_li = ''.join(f'<li><strong>{a}</strong> {b}</li>' for a, b in remember)
    doc = f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#111827">
  <title>{title} — illusion</title>
  <meta name="description" content="{html.escape(desc, quote=True)}">
  <link rel="stylesheet" href="../style.css">
  <script src="../sims.js" defer></script>
  <script src="../topics-data.js" defer></script>
  <script src="../chapter.js" defer></script>
</head>
<body>
  <header class="site-header"><a class="brand" href="../index.html">illusion<span class="dot">.</span></a><nav><a href="../index.html#library">Library</a><a href="../roadmap.html">Roadmap</a></nav></header>
  <article class="chapter">
    <p class="crumbs"><a href="../index.html">Library</a> / <a href="../roadmap.html#d-{dcode}">{domain}</a> / {tid}</p>
    <p class="eyebrow">{tid} · {domain}</p>
    <h1>{h1}</h1>
    <p class="lede">{lede}</p>
    <p class="meta">{''.join(f'<span>{m}</span>' for m in meta)}</p>

    <div class="glance"><h2>The 30-second version</h2><p>{glance}</p></div>
    <ul class="toc">{toc}</ul>

    <section id="story" class="story">
      <p class="beat">0 · The story</p>
{story}
    </section>

    <section id="illusion">
      <p class="beat">1 · The illusion</p>
{illusion}
    </section>

    <section id="genesis">
      <p class="beat">2 · Where the idea came from</p>
{genesis}
    </section>

    <section id="model">
      <p class="beat">3 · The model</p>
{model}
    </section>

    <section id="reveal">
      <p class="beat">4 · The reveal</p>
{reveal}
    </section>

    <section id="applications">
      <p class="beat">5 · Where it shows up</p>
{applications}
    </section>

    <section id="lies">
      <p class="beat">6 · Where the simulation lies</p>
{lies_html}
    </section>

    <section id="remember">
      <p class="beat">Remember</p>
      <h2>Three things to take away</h2>
      <ol>{remember_li}</ol>
    </section>

    <section id="deeper">
      <p class="beat">Go deeper</p>
      <h2>Glossary and sources</h2>
{deeper}
    </section>

    <nav class="pager" aria-label="Chapters"><a href="../index.html#library">← Library</a><a href="../index.html#library">Library →</a></nav>
  </article>
  <footer><span>illusion · A simulation is a controlled lens, not proof.</span><a href="https://github.com/sanketn26/illusion">Source ↗</a></footer>
</body>
</html>
'''
    Path(SITE + slug + '.html').write_text(doc, encoding='utf-8')
    print('wrote', slug)


# ---- small SVG helpers (all drawings use the site's dark palette) ----
TEAL, AMBER, RED, TEXT, DIM, BG = '#67d4d0', '#f5b85d', '#f18a76', '#e8edf5', '#91a3bb', '#142034'


def svg(w, h, inner, label):
    return (f'<svg viewBox="0 0 {w} {h}" role="img" aria-label="{html.escape(label, quote=True)}" '
            f'font-size="13" fill="none" stroke-linecap="round" stroke-linejoin="round">{inner}</svg>')


def t(x, y, s, fill=TEXT, size=13, anchor='start', weight='normal'):
    return f'<text x="{x}" y="{y}" fill="{fill}" font-size="{size}" text-anchor="{anchor}" font-weight="{weight}" stroke="none">{s}</text>'


def arrow_svg(x1, y1, x2, y2, color, w=2.5):
    a = math.atan2(y2 - y1, x2 - x1)
    h = 9
    p1 = (x2 - h * math.cos(a - .45), y2 - h * math.sin(a - .45))
    p2 = (x2 - h * math.cos(a + .45), y2 - h * math.sin(a + .45))
    return (f'<path d="M{x1:.1f} {y1:.1f}L{x2:.1f} {y2:.1f}" stroke="{color}" stroke-width="{w}"/>'
            f'<path d="M{x2:.1f} {y2:.1f}L{p1[0]:.1f} {p1[1]:.1f}L{p2[0]:.1f} {p2[1]:.1f}Z" fill="{color}" stroke="{color}" stroke-width="1"/>')


def poly(pts, color, w=2, extra=''):
    return '<polyline points="' + ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts) + f'" stroke="{color}" stroke-width="{w}" {extra}/>'
