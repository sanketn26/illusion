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

This project carries a 100-item backlog for roughly two years of releases.

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

## 100 simulations to pursue

| # | Module | Simulation / Episode Idea | Core illusion to break | Difficulty |
|---:|---|---|---|---|
| 1 | Motion | Brownian motion in a box | Random motion can create predictable statistics | S |
| 2 | Motion | Random walk vs directed walk | Randomness still has structure | S |
| 3 | Motion | Drunkard's walk and diffusion | Spreading can emerge without intention | S |
| 4 | Motion | Ballistic motion vs diffusive motion | Not all motion scales the same way | S |
| 5 | Motion | Collision rules in a particle gas | Simple local rules create global behavior | S |
| 6 | Motion | Conservation of momentum | Motion is redistributed, not lost | S |
| 7 | Motion | Elastic vs inelastic collisions | Energy can change form without disappearing | S |
| 8 | Motion | Center of mass | A messy system can have a simple summary | S |
| 9 | Motion | Coupled pendulums | Systems can exchange energy rhythmically | M |
| 10 | Motion | Resonance in a driven oscillator | Small pushes can become large effects | M |
| 11 | Time | Entropy in a two-chamber box | Disorder is about countable possibilities | S |
| 12 | Time | Arrow of time from gas expansion | Time direction emerges from probability | M |
| 13 | Time | Reversing particle motion | Reversal is possible in math, fragile in reality | M |
| 14 | Time | Poincare recurrence toy model | Even reversible systems can look irreversible | H |
| 15 | Time | Clocks in moving frames | Time is not universal | M |
| 16 | Time | Relativistic light clock | Motion changes measured time | M |
| 17 | Time | Twin paradox as worldlines | The path through spacetime matters | H |
| 18 | Time | Simultaneity failure | “Now” is not globally shared | H |
| 19 | Time | Light cones and causality | Events are constrained by signal speed | M |
| 20 | Time | Block universe visual metaphor | Flow may be a perspective, not a mechanism | X |
| 21 | Waves | Sine wave basics | A wave is motion of pattern, not matter transport | S |
| 22 | Waves | Superposition of two waves | Waves can pass through and combine | S |
| 23 | Waves | Constructive and destructive interference | Adding can erase | S |
| 24 | Waves | Standing waves on a string | Boundaries create allowed patterns | S |
| 25 | Waves | Fourier decomposition | Complex shapes are built from simple waves | M |
| 26 | Waves | Beats from nearby frequencies | Slow patterns can emerge from fast oscillations | S |
| 27 | Waves | Doppler effect | Observation depends on relative motion | M |
| 28 | Waves | Wave packets | A localized object can be made of spread-out waves | M |
| 29 | Waves | Dispersion | Different frequencies travel differently | M |
| 30 | Waves | Shock waves and sonic boom | Information can pile up into a front | H |
| 31 | Fields | Vector field visualization | Space itself can carry direction and magnitude | S |
| 32 | Fields | Electric field around one charge | Forces can be represented as a field | S |
| 33 | Fields | Electric field around two charges | Fields combine across space | S |
| 34 | Fields | Coulomb force simulation | Invisible rules create visible motion | S |
| 35 | Fields | Gravitational field around masses | Gravity can be treated as a field | S |
| 36 | Fields | Potential wells | Motion follows gradients in stored possibility | M |
| 37 | Fields | Equipotential contours | Geometry can encode energy | M |
| 38 | Fields | Magnetic field around a wire | Current reshapes space around it | M |
| 39 | Fields | Lorentz force on a charged particle | Motion can curve without direct contact | M |
| 40 | Fields | Electromagnetic wave propagation | Electric and magnetic fields sustain each other | H |
| 41 | Thermodynamics | Temperature as average kinetic energy | Heat is microscopic motion | S |
| 42 | Thermodynamics | Heat diffusion on a grid | Local smoothing creates global equilibrium | S |
| 43 | Thermodynamics | Boltzmann distribution | Systems prefer common energy arrangements | M |
| 44 | Thermodynamics | Maxwell-Boltzmann gas speeds | Not all particles move at the average speed | M |
| 45 | Thermodynamics | Phase transition on a lattice | Sudden change can emerge from local alignment | M |
| 46 | Thermodynamics | Ising model magnetization | Collective order can emerge from neighbors | H |
| 47 | Thermodynamics | Maxwell's demon | Information has physical cost | H |
| 48 | Thermodynamics | Entropy and compression | Organization requires external work | M |
| 49 | Thermodynamics | Refrigerator as entropy pump | Cooling one place warms another | M |
| 50 | Thermodynamics | Heat death toy universe | Equilibrium can mean no usable gradients | X |
| 51 | Matter | Atom as probability cloud | Electrons are not tiny planets | M |
| 52 | Matter | Quantum harmonic oscillator | Quantization creates allowed states | M |
| 53 | Matter | Energy levels in a box | Boundaries create discrete realities | M |
| 54 | Matter | Electron orbitals visualized | Shape replaces orbit | H |
| 55 | Matter | Pauli exclusion toy model | Matter resists compression due to state limits | H |
| 56 | Matter | Molecular vibration modes | Matter stores energy in patterns | M |
| 57 | Matter | Crystal lattice vibrations | Solids move internally | M |
| 58 | Matter | Phonons as collective modes | Quasi-particles are useful illusions | H |
| 59 | Matter | Defects in a lattice | Imperfection changes material behavior | M |
| 60 | Matter | Solids, liquids, gases from particles | Phases emerge from interaction strength | S |
| 61 | Quantum | Double-slit probability pattern | Particles do not behave like tiny bullets | M |
| 62 | Quantum | Single-particle interference build-up | Probability becomes pattern over time | M |
| 63 | Quantum | Wavefunction collapse toy model | Observation changes what can be predicted | X |
| 64 | Quantum | Quantum tunneling through a barrier | Forbidden does not mean impossible | H |
| 65 | Quantum | Uncertainty principle via wave packets | Localization has a cost | M |
| 66 | Quantum | Spin as a two-state system | Quantum properties are not classical rotation | H |
| 67 | Quantum | Stern-Gerlach experiment | Measurement produces discrete outcomes | H |
| 68 | Quantum | Entanglement correlation simulator | Shared state is not ordinary hidden messaging | X |
| 69 | Quantum | Bell inequality game | Local intuition fails under quantum statistics | X |
| 70 | Quantum | Quantum Zeno effect | Repeated observation can freeze evolution | H |
| 71 | Relativity | Galilean vs Einstein velocity addition | Speeds do not simply add near light speed | M |
| 72 | Relativity | Length contraction | Space measurements depend on motion | H |
| 73 | Relativity | Spacetime interval | Something remains invariant across observers | H |
| 74 | Relativity | Minkowski diagram basics | Geometry can encode causality | H |
| 75 | Relativity | Relativistic Doppler shift | Light color changes with relative motion | M |
| 76 | Relativity | Gravity as curved paths | Straight paths can look bent in curved geometry | H |
| 77 | Relativity | Rubber-sheet gravity metaphor critique | Useful pictures can mislead | M |
| 78 | Relativity | Gravitational time dilation | Clocks depend on gravitational potential | H |
| 79 | Relativity | Orbit precession toy model | Newtonian orbits are not the full story | H |
| 80 | Relativity | Gravitational lensing | Mass can act like a lens | H |
| 81 | Cosmology | Expanding grid universe | Space can expand without a center | M |
| 82 | Cosmology | Raisin bread expansion model | Every point can see others receding | S |
| 83 | Cosmology | Redshift from expansion | Light stretches with space | M |
| 84 | Cosmology | Cosmic microwave background map concept | The early universe leaves a thermal fingerprint | M |
| 85 | Cosmology | N-body gravity toy universe | Large structure grows from small differences | H |
| 86 | Cosmology | Dark matter halo proxy | Invisible mass can shape visible motion | H |
| 87 | Cosmology | Galaxy rotation curve | Observed motion reveals hidden assumptions | M |
| 88 | Cosmology | Cosmic inflation toy field | Tiny regions can become universe-sized | X |
| 89 | Cosmology | Structure formation from noise | Random seeds can become cosmic architecture | H |
| 90 | Cosmology | Fate of the universe scenarios | Expansion history decides cosmic future | X |
| 91 | Black Holes | Escape velocity and event horizon | A boundary can trap all future paths | M |
| 92 | Black Holes | Light bending near compact mass | Light follows spacetime geometry | H |
| 93 | Black Holes | Accretion disk visual model | Friction and gravity create extreme light | H |
| 94 | Black Holes | Tidal forces and spaghettification | Gravity changes across space | M |
| 95 | Black Holes | Hawking radiation toy analogy | Vacuum is not simply empty | X |
| 96 | Emergence | Cellular automata and local rules | Complex behavior can come from simple rules | S |
| 97 | Emergence | Conway's Game of Life physics metaphor | Patterns can behave like objects | S |
| 98 | Emergence | Flocking and collective motion | Coordination can emerge without a leader | M |
| 99 | Emergence | Information flow in physical systems | Physics can be viewed through constraints on information | X |
| 100 | Emergence | Reality as layers of effective models | Every model is useful at the right scale | X |

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
