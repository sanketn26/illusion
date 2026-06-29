# illusion

> Code-first physics simulations that reveal where intuition breaks.

`illusion` is a long-term simulation and storytelling project for explaining physics through code, visuals, and first-principles reasoning.

The aim is not to make photorealistic animations. The aim is to build small, clear simulations that expose the gap between everyday intuition and how physical systems actually behave.

The project is designed for a YouTube channel, GitHub repository, and eventually an interactive learning site.

## Why this exists

Most people experience physics through formulas, lectures, or finished diagrams. But many concepts only become intuitive when you can watch the system evolve.

`illusion` treats each physics idea as a system:

- state
- rules
- constraints
- observables
- feedback
- emergence
- failure of intuition

Every simulation should answer one question:

> What does the visual system reveal that words alone cannot?

## Audience

This project is for:

- software engineers curious about physics
- students who need visual intuition
- self-learners who like first-principles explanations
- builders who want to see equations become simulations
- viewers who enjoy channels like 3Blue1Brown, PBS Space Time, Veritasium, and Primer

The tone should be precise, visual, humble, and code-first.

## Core philosophy

Every episode should have four parts:

1. **The illusion** — What does everyday intuition get wrong?
2. **The model** — What simplified system will we simulate?
3. **The reveal** — What behavior emerges when the simulation runs?
4. **Where the simulation lies** — What did we simplify, hide, approximate, or exaggerate?

A simulation is not proof. It is a controlled lens.

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

## Repository layout

```text
illusion/
  README.md
  pyproject.toml
  LICENSE
  docs/
    philosophy.md
    production-notes.md
    physics-review-checklist.md
  simulations/
    001_brownian_motion/
      README.md
      notes.md
      references.md
    002_entropy_box/
    003_arrow_of_time/
  notebooks/
    prototypes/
  scripts/
  assets/
    images/
    audio/
    thumbnails/
  site/
    index.html
```

## Roadmap

This is a 100-item backlog aimed at a steady sequence of visual investigations:

- some become 5-minute shorts
- some become 12-15 minute YouTube episodes
- some become notebooks only
- some become interactive web demos
- some become deeper multi-part series

Practical cadence:

- **Year 1:** foundations, motion, entropy, waves, fields, relativity basics
- **Year 2:** quantum mechanics, cosmology, black holes, advanced/emergent ideas

Difficulty scale:

- **S** = starter simulation
- **M** = moderate simulation
- **H** = hard simulation
- **X** = advanced/speculative; needs careful framing and review

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

These will build the visual language for everything that comes later.

## Status

Early planning stage.

First milestone:

> Render the first working Brownian motion scene and publish the code.

## Documentation

- `/home/runner/work/illusion/illusion/docs/philosophy.md`
- `/home/runner/work/illusion/illusion/docs/production-notes.md`
- `/home/runner/work/illusion/illusion/docs/physics-review-checklist.md`
- `/home/runner/work/illusion/illusion/simulations/001_brownian_motion/README.md`

## License

- MIT License for code
- Creative Commons BY-SA for written and visual educational content
