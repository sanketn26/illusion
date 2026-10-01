# Chapter template

Every topic is one static page in `site/topics/<slug>.html` that serves two jobs: reading material for the site and the script for the video. Copy an existing chapter (e.g. `random-walk.html`) and keep the section order and ids, so readers always know where to look.

| Section (id) | Video beat | What it must do |
|---|---|---|
| Glance box | Cold open / short | The whole idea in about 30 seconds. |
| `#story` | 0 · The story | A concrete scene that ends on the question the chapter answers. Never a definition first. |
| `#illusion` | 1 · The illusion | State the intuition that breaks, in everyday terms. |
| `#genesis` | 2 · Where the idea came from | A dated timeline: who asked the question, what changed. Be careful with dates and attributions. |
| `#model` | 3 · The model | The rule or equation, the embedded simulation, a "Try this" list, and an illustration. Aim for at least two illustrations per chapter (inline SVG, labelled). |
| `#reveal` | 4 · The reveal | Why it behaves that way; end with "The surprise". |
| `#applications` | 5 · Where it shows up | A "Happening right now" callout (where this physics is operating at this moment), then 5–6 real uses, each with a one-line why. |
| `#lies` | 6 · Where the simulation lies | Concrete simplifications. Required by the physics review checklist. |
| `#remember` | Remember | Three takeaways, written to be skimmed on a return visit. |
| `#deeper` | Go deeper | Glossary and sources. |

## Embedding a simulation

```html
<div data-sim="walk" data-alt="..." data-caption="..."></div>
```

`site/sims.js` mounts any `div[data-sim]` with its own canvas, slider and controls, and pauses it when off-screen. To add a simulation, add an entry to `SIMS` (`label`, `min`, `max`, `value`, `animated`, and a `make(ctx, param)` returning `reset`/`step`/`draw`). Then register the chapter in the library list in `site/index.html` and in the pager links of its neighbours.

The full quality bar and the per-batch procedure are in [`production-plan.md`](production-plan.md). `site/chapter.js` fills the previous/next links from the catalogue, so chapters only need the empty `<nav class="pager">`.
