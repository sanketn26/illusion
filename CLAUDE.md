# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

`illusion` is a code-first physics-explainer project (YouTube + GitHub + eventual interactive site). It is in an early planning stage: there is no build system, test suite, or linter. `pyproject.toml` declares Python >=3.11 with no dependencies; the Python/Manim/NumPy toolchain described in the docs is planned, not yet present. Most of the repo is documentation and scaffolding (`.gitkeep` placeholders in `assets/`, `notebooks/prototypes/`, `scripts/`, `simulations/002_*`, `simulations/003_*`).

## Commands

The only runnable artifact is the static browser lab in `site/` (plain HTML/CSS/JS, no build step, no dependencies):

```sh
python3 -m http.server 8000 --directory site   # then open http://localhost:8000
```

Topic list: `docs/catalog.txt` is the single source of truth (stable IDs like `THM01`, domain, level, soft prerequisites, core illusion, hook, learning paths). After editing it run `python3 scripts/build_catalog.py`, which validates it and regenerates `site/topics-data.js` (used by `roadmap.html` and the home page tiles) and `docs/catalog.md`. Never edit those two generated files or reuse/renumber an ID. A shipped chapter is marked `shipped:<slug>` in the catalogue.

Chapters are written in batches (`@batch` lines in the catalogue; 34 batches, prerequisites first). To resume, run `python3 scripts/build_catalog.py --next` and follow `docs/production-plan.md` (quality bar, per-batch procedure, headless testing of simulations via `window.IllusionSims`). Finish and verify one batch before starting the next.

Deploy by publishing the `site/` directory to any static host.

## Architecture

- `site/` — static site, two jobs: host the simulations and present each topic as reading material that doubles as the video script. `index.html` is the library (chapter cards) plus domain tiles; `roadmap.html` is the filterable catalogue. Each shipped topic is a chapter page in `site/topics/<slug>.html` with a fixed section order (illusion, genesis, model & simulation, reveal, applications, where it lies, remember, go deeper); see `docs/chapter-template.md`. `sims.js` mounts any `div[data-sim="walk|heat|waves|flight|defense"]` as an independent interactive figure; a simulation is a `SIMS` entry with `make(ctx, param)` returning `reset`/`step`/`draw`. Adding a topic means: a `SIMS` entry (if new), a chapter page, a card in the `#library` list, `shipped:<slug>` in the catalogue, and pager links on neighbouring chapters.
- `simulations/NNN_name/` — one folder per planned episode with `README.md` (illusion / model / governing idea / parameters / what to show / where the simulation lies), `notes.md`, `references.md`. Numbering follows the "first 10 releases" order in the root README.
- `docs/` — `philosophy.md`, `production-notes.md` (toolchain and release strategy), `physics-review-checklist.md` (pre-release gate), `launch-topics.md` (design briefs for 40 topics, keyed to catalogue IDs), `catalog.txt`/`catalog.md` (all topics and batches), `production-plan.md` (how the batches are run).

## Conventions that matter

- Every simulation/episode is structured as four parts: **the illusion**, **the model**, **the reveal**, **where the simulation lies**. Every chapter must state the rule its simulation uses and its limits (the `#model` and `#lies` sections); never claim a toy model proves the full theory.
- The random-walk demo is deliberately a discrete toy model, distinct from the planned collision-based Brownian-motion episode (001); keep that distinction in any copy.
- Chapters must state the history accurately (dates, attributions) and include a "where the simulation lies" section. Keep topics like the air-defense demo conceptual (information flow only, no real-system modeling or effectiveness claims).
- Avoid over-engineering in the first 10 simulations.
- Licensing: MIT for code, CC BY-SA for written/visual educational content.
