# Production Notes

## Initial toolchain

Start simple:

- Python for simulation logic
- Manim for mathematical animation
- NumPy for computation
- Matplotlib for quick prototypes
- Jupyter notebooks for exploration
- Three.js / React Three Fiber later for browser-based interactives
- Godot later for richer real-time physical scenes

Avoid over-engineering in the first 10 simulations.

## Release strategy

The catalogue carries a large backlog (see below); release order is a separate decision from catalogue order.

- Some ideas become short videos.
- Some become full YouTube episodes.
- Some stay as notebooks.
- Some become browser-based interactives.
- Some expand into multi-part series.

Cadence:

- **Year 1:** foundations, motion, entropy, waves, fields, relativity basics
- **Year 2:** quantum mechanics, cosmology, black holes, advanced and emergent ideas

Difficulty scale:

- **S** = starter simulation
- **M** = moderate simulation
- **H** = hard simulation
- **X** = advanced/speculative; needs careful framing and review

## Topic catalogue

The backlog now lives in one place: [`catalog.txt`](catalog.txt), with a generated readable view in [`catalog.md`](catalog.md) and a browsable page at `site/roadmap.html`. It replaces the earlier 100-row table. Each topic has a stable ID, a domain, difficulty, prerequisites, its core illusion and an everyday hook; learning paths are defined alongside. Add or change topics there, then run `python3 scripts/build_catalog.py`, which validates IDs, prerequisites and path order.

## First 10 recommended releases

1. Brownian motion in a box
2. Random walk vs directed walk
3. Entropy in a two-chamber box
4. Arrow of time from gas expansion
5. Heat diffusion on a grid
6. Sine wave basics
7. Wave interference
8. Standing waves
9. Electric field around charges
10. Gravity as a field

These early releases should be simple, visual, and confidence-building.

## Episode template

Each simulation folder should include:

```md
# 001 Brownian Motion

## The illusion
Motion that looks random is meaningless.

## The model
Particles move in a 2D box and collide with each other and the walls.

## Governing idea
Random microscopic collisions produce stable macroscopic patterns.

## Simulation parameters
- number of particles
- box size
- particle velocity
- collision rule
- time step

## What to show
- particles initially clustered
- particles spreading over time
- density plot
- comparison with diffusion curve

## Where the simulation lies
- real molecules are 3D
- real collisions are quantum-mechanical
- air has many more particles
- visualization exaggerates size and spacing
```

## Long-term vision

Possible expansions:

- interactive browser simulations
- physics notebooks for self-learners
- animated essays
- code-first physics curriculum
- visual glossary of physics concepts
- simulation challenges for students
- AI-assisted storyboard generation
- local rendering pipeline
- community-contributed simulations

Long-term goal:

> Build a visual physics lab where intuition is tested, broken, and rebuilt through simulation.
