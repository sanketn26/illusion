# Physics fact audit — 2 October 2026

Reviewed the prose and displayed equations in all 52 current `site/topics/*.html` lessons, plus the existing Brownian-motion episode notes. Checked selected claims against the simulation source, recalculated numerical examples, and consulted the sources linked below. This is a content audit, not a complete numerical validation of every simulation or a comprehensive verification of every historical attribution. Locations refer to the files as reviewed. Lesson files have not been changed.

The review identifies **31 factual errors or incorrect explanations**, followed by **8 claims needing clearer conditions**. Multiple findings sometimes concern the same lesson. Explicitly declared toy-model choices are not counted as errors merely for being simplified.

## Factual errors and incorrect explanations

1. **Heat averaging is incorrectly described as time-reversible.** [Heat diffusion, line 71](../site/topics/heat-diffusion.html#reveal), repeated in the takeaway at line 106.
   The lesson says the averaging rule looks the same forwards and backwards and calls it symmetric. Spatial symmetry is not time-reversal symmetry. Under `t → −t`, `∂T/∂t = α∇²T` becomes an anti-diffusion equation, with the opposite sign. Replace the explanation with: “The heat equation already describes irreversible smoothing; the microscopic dynamics from which it emerges can be reversible.” The counting explanation belongs to that microscopic/coarse-graining distinction. [MIT heat-equation notes](https://ocw.mit.edu/courses/18-086-mathematical-methods-for-engineers-ii-spring-2006/5db29e69494eb09a26f7224d43adc6f6_am54.pdf).

2. **The Brownian mean-squared-displacement formula has the wrong dimensional factor.** [Brownian motion, line 48](../site/topics/brownian-motion.html#model).
   `⟨distance²⟩ ≈ 2Dt` describes displacement along one coordinate. For the lesson’s two-dimensional distance, `⟨Δx² + Δy²⟩ = 4Dt`; in three dimensions it is `6Dt`. State `⟨|Δr|²⟩ = 2dDt` for isotropic diffusion, after the inertial regime and before confinement matters. This follows by adding the variances of independent coordinates; the [MIT diffusion kernel](https://ocw.mit.edu/courses/18-086-mathematical-methods-for-engineers-ii-spring-2006/5db29e69494eb09a26f7224d43adc6f6_am54.pdf) provides the same coordinate-wise result.

3. **“The path has no speed” confuses mathematical Brownian motion with a physical grain.** [Brownian motion, line 57](../site/topics/brownian-motion.html#reveal).
   An ideal Wiener path has no ordinary instantaneous derivative. A real particle has inertia and a measurable velocity at sufficiently short time scales, with a transition from ballistic to diffusive motion. Keep the resolution argument, but label it as a property of the overdamped mathematical limit. [Li et al., measurement of instantaneous Brownian velocity](https://users.physics.ox.ac.uk/~Foot/Phynance/Raizen1BrownianM.pdf).

4. **Acceleration is repeatedly defined as change of speed rather than change of velocity.** [Speed versus acceleration, line 80](../site/topics/speed-and-acceleration.html#deeper), also in the introductory summary and takeaways.
   The general definition is `a = dv/dt`, where velocity includes direction. Uniform circular motion has constant speed and nonzero acceleration. Say: “Acceleration measures how velocity changes, through speed, direction, or both; along this straight road it is the rate of change of signed velocity.”

5. **A phone accelerometer does not “only report changes” in speed.** [Speed versus acceleration, line 63](../site/topics/speed-and-acceleration.html#applications).
   A stationary supported phone normally measures a specific-force vector of magnitude approximately `g`; an ideal freely falling phone measures approximately zero. That steady reading is what permits tilt sensing. Distinguish an accelerometer’s specific force from coordinate acceleration and from a software output with gravity removed. [Analog Devices accelerometer data sheet](https://www.analog.com/media/en/technical-documentation/data-sheets/ADXL103_203.pdf).

6. **Bertrand’s theorem is incorrectly used to claim other force laws cause spiralling or escape.** [Inverse-square law, line 58](../site/topics/inverse-square-law.html#reveal).
   The theorem concerns central potentials for which **all bound orbits are closed**, not which potentials admit stable bound motion. Other attractive central laws can produce bounded, precessing orbits without spiralling in or escaping. For a concrete counterexample, `F = −k/r` has effective potential `k ln r + L²/(2mr²)`, with a stable minimum for nonzero angular momentum. Rewrite the claim around closed versus precessing orbits. [Bertrand theorem proof](https://scipp.ucsc.edu/~profumo/teaching/phys210_12/bertrand.pdf).

7. **Standing-wave cancellation does not erase unwanted wavelengths or dissipate their energy.** [Standing waves, line 55](../site/topics/standing-waves.html#reveal), also line 23.
   The ideal, loss-free string’s free motion is a sum of modes satisfying its boundary conditions. Reflection and interference do not destroy energy “within a few bounces.” A string can also respond to an external drive away from its natural frequencies, with smaller amplitude. Explain the allowed free modes separately from driven resonance and damping. [Standing waves and resonance](https://openstax.org/books/university-physics-volume-1/pages/16-6-standing-waves-and-resonance).

8. **Harmonic sizes alone are not a complete description of an arbitrary waveform.** [Fourier decomposition, line 74](../site/topics/fourier-decomposition.html#remember).
   Reconstruction needs amplitudes **and phases**, or equivalent signed sine/cosine coefficients, plus the mean/DC component. For example, `sin x + sin 2x` and `sin x − sin 2x` have the same amplitude spectrum and different shapes. The limits section mentions phase, but the takeaway directly contradicts it. [MIT Fourier analysis](https://visionbook.mit.edu/image_processing_fourier.html).

9. **A measured crystal diffraction pattern is not the Fourier transform itself.** [Fourier decomposition, line 63](../site/topics/fourier-decomposition.html#applications).
   In the usual kinematic approximation, the scattered amplitude is related to the Fourier transform of electron density, while measured intensity is proportional to its squared magnitude. The phases are missing: this is the crystallographic phase problem. Replace “the pattern is the Fourier transform” with that distinction. [MIT discussion of Fourier magnitude and phase](https://visionbook.mit.edu/image_processing_fourier.html) supports why losing phase prevents simple inversion; the intensity/amplitude distinction also follows from `I ∝ |E|²`.

10. **A supersonic source does not cease to have an audible pitch.** [Doppler effect, line 74](../site/topics/doppler-effect.html#remember), also the try-it instructions.
    A supersonic source produces a Mach cone; an observer can receive tonal sound after the cone arrives. A shock’s transient boom does not replace every subsequent oscillation. Also distinguish the drawn cone of linear wavefronts from a computed nonlinear shock. Replace the takeaway with: “Above Mach 1, wavefronts form a Mach cone; its passage can produce a sonic boom.” [NASA sonic-boom explanation](https://www.nasa.gov/blogs/quesst/2026/08/10/nasa-x-59-explainer-science-of-sonic-booms/) explains the continuous production of the boom during supersonic flight.

11. **The impulse lesson says graph area barely changes when speed doubles.** [Impulse, line 49](../site/topics/impulse.html#model).
    At fixed mass, stopping from twice the speed doubles `|Δp|`; the area under an acceleration–time graph also doubles because it equals `|Δv|`. For 70 kg, the impulses at 50 and 100 km/h are about 972 and 1,944 N·s. Say the area stays fixed when **stopping distance changes at fixed initial speed**, not when initial speed changes.

12. **The wet-road numerical example says the braking distance doubles when it rises by 75%.** [Friction and braking, line 49](../site/topics/friction-and-braking.html#model).
    Changing `μ` from 0.70 to 0.40 multiplies braking distance by `0.70/0.40 = 1.75`. At 50 km/h it changes from approximately 14.0 m to 24.6 m. Change “doubles” to “increases by about 75%,” or choose `μ = 0.35` for a doubling.

13. **Graphite moderation is wrongly treated as an equal-mass collision that removes half the neutron’s energy.** [Collisions, line 63](../site/topics/collisions.html#applications).
    A hydrogen nucleus has approximately the neutron’s mass; a carbon nucleus has approximately twelve times its mass. For a stationary carbon nucleus, the maximum fractional transfer in one elastic collision is `4A/(A+1)² ≈ 28.4%` at `A = 12`. Under isotropic centre-of-mass scattering the mean loss is approximately 14.2%, rather than 50%. The hydrogen example can retain the half-energy average with its angular assumption stated. [DOE reactor-theory handbook](https://archives.standards.doxcelerate.com/documents/doe-hdbk-1019-1-93-doe-fundamentals-handbook-nuclear-physics-and-reactor-theory-volume-1-of-2).

14. **Electric field lines are described as charge trajectories.** [Electric field, line 78](../site/topics/electric-field.html#deeper).
    A field line is tangent to the electric field and indicates the instantaneous force direction on a positive test charge. It does not generally show where that charge travels: its velocity and inertia matter. Use “showing the direction of force” instead of “showing where a small positive charge would go.”

15. **The vector-field lesson applies a velocity-following rule to charge motion without stating its extra assumptions.** [Vector fields, line 58](../site/topics/vector-fields.html#reveal).
    `dr/dt = u(r)` traces a prescribed velocity field. An electric field instead enters `m d²r/dt² = qE` for a particle subject only to electric force. In a wire, a drift-velocity rule also needs a transport model, scattering, and the charge sign. Limit the leaf algorithm to velocity fields; introduce force-field particle motion as a separate integration problem.

16. **Moving source spacing by half a wavelength does not swap every bright and dark point.** [Wave interference, line 74](../site/topics/wave-interference.html#reveal).
    What must change by half a wavelength is the **path difference at the observation point**, or equivalently the relative phase by π. Changing source separation affects different observation points differently; the perpendicular bisector remains equal-distance and constructive for in-phase sources. State that local path-difference condition instead.

17. **The displacement-resonance peak is incorrectly placed exactly at the undamped natural frequency.** [Resonance, line 42](../site/topics/resonance.html#genesis), repeated in the explanation.
    For the equation printed in the lesson, its maximum displacement response occurs at `r = √(1 − 2ζ²)` when `ζ < 1/√2`. At `r = 1`, the gain is indeed `1/(2ζ)`, but that is not exactly the maximum for nonzero damping. Label equality with the natural frequency as a weak-damping approximation. [MIT frequency-response and practical-resonance notes](https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/pages/unit-ii-second-order-constant-coefficient-linear-equations/frequency-response-and-practical-resonance/).

18. **The resonance lesson incorrectly says drive and motion keep drifting out of step away from resonance.** [Resonance, line 55](../site/topics/resonance.html#reveal).
    After the transient dies away, a damped oscillator responds at the driving frequency with a fixed phase lag. At the undamped natural driving frequency, force is in phase with velocity; at other frequencies their phase offset is different, but it does not continually drift. Distinguish transient beating from the steady-state response. [MIT forced-oscillation notes](https://ocw.mit.edu/courses/8-03sc-physics-iii-vibrations-and-waves-fall-2016/782069da3820fc514c10c26ae0c15b01_MIT8_03SCF16_Text_Ch2.pdf).

19. **The Moon’s orbital period is confused with its phase-cycle period.** [Seasons and eclipses, line 58](../site/topics/seasons-and-eclipses.html#reveal).
    The Moon orbits Earth relative to the stars in approximately 27.3 days. The phase cycle takes approximately 29.5 days because Earth also moves around the Sun. Replace “moves around us in 29.5 days” with “completes a phase cycle in 29.5 days.” [NASA orbital-period explanation](https://starchild.gsfc.nasa.gov/docs/StarChild/questions/question32.html).

20. **Zero axial tilt is incorrectly said to eliminate all seasonal variation.** [Seasons and eclipses, line 49](../site/topics/seasons-and-eclipses.html#model).
    Zero tilt eliminates the modeled day-length and solar-height seasons. An eccentric orbit still creates a global annual variation in incoming sunlight: using the lesson’s 147 and 152 million km distances, the perihelion/aphelion irradiance ratio is about 1.069. Say “no tilt-driven seasons in these graphs,” rather than “no seasons at all.” The actual seasonal dominance of tilt remains correct.

21. **A mechanical metronome is incorrectly explained solely by changing simple-pendulum length.** [Pendulums, line 63](../site/topics/pendulums.html#applications).
    Its sliding weight changes both the moment of inertia and the gravitational restoring torque of a compound, inverted pendulum with an additional lower weight. The relevant small-angle period is `2π√(I/(Mgd))`, where `d` is the distance of the combined centre of mass below the pivot. Describe a compound pendulum rather than equating the slider to simple-string length.

22. **A Foucault pendulum is incorrectly said to preserve one fixed plane in space at every latitude.** [Pendulums, line 58](../site/topics/pendulums.html#reveal).
    The Earth-frame precession rate is `ΩEarth sin(latitude)`. The literal fixed-inertial-plane picture works at the poles; elsewhere the support and local vertical also change orientation. Retain the correct approximately 11°/hour Paris value, and explain the latitude-dependent precession. [University of Texas derivation](https://farside.ph.utexas.edu/teaching/336k/Newtonhtml/node59.html).

23. **Hooke’s-law range is confused with the elastic limit.** [Springs, lines 42 and 68](../site/topics/springs.html#lies).
    The proportional limit marks the end of approximately linear force versus extension. The elastic limit marks the end of fully recoverable deformation. A spring or material can behave nonlinearly while remaining elastic. Replace “obeys Hooke’s law only up to the elastic limit” with “approximately up to the proportional limit; beyond the elastic limit it can retain permanent deformation.” [University of Illinois material-behavior notes](https://mechref.engr.illinois.edu/sol/material.html).

24. **The momentum glossary says the centre of mass moves only if an outside force acts.** [Momentum, line 80](../site/topics/momentum.html#deeper).
    Without net external force, the centre of mass can move at constant velocity. External force changes its velocity: `M aCOM = Fexternal`. Change “moves only if” to “accelerates only if a net outside force acts.” The two-skater example remains correct because it starts at rest.

25. **A proton is incorrectly called the smallest thing we measure.** [Orders of magnitude, line 56](../site/topics/orders-of-magnitude.html#reveal).
    Experiments probe structure at distances far below a proton’s approximately `10⁻¹⁵ m` scale. The 42-order span is valid for the chosen comparison endpoints, but it is not the full range of measured physics. Replace the claim with “from a proton’s size to the observable universe’s diameter.” [CERN particle-detector lecture](https://indico.cern.ch/event/579032/contributions/2413246/attachments/1419393/2174438/2017-02-20-Detectors.pdf).

26. **Every human cell is incorrectly assigned two metres of DNA.** [Orders of magnitude, line 63](../site/topics/orders-of-magnitude.html#applications).
    Mature human red blood cells have no nucleus and no nuclear genome. The total-DNA estimate therefore cannot multiply the full body cell count by two metres. Say “a typical diploid nucleated human cell contains roughly two metres of nuclear DNA,” then use a count of the appropriate cells if retaining a body-wide estimate. [NHGRI laboratory guide](https://www.genome.gov/Pages/Education/Modules/GeneticsInTheLaboratory.pdf).

27. **The reflection takeaway wrongly excludes zero transmission except when media match.** [Reflection and echoes, line 74](../site/topics/reflection-and-echoes.html#remember).
    A fixed or free endpoint can have complete reflection and zero transmission; the lesson explicitly demonstrates both. A matched interface instead has zero reflection and nonzero transmission. More general systems also include absorption and total internal reflection. Replace the universal statement with the conditions for this two-medium, lossless, one-dimensional interface.

28. **A flywheel is incorrectly said to store energy “as angular momentum.”** [Angular momentum, line 63](../site/topics/angular-momentum.html#applications).
    It stores rotational kinetic energy `K = ½Iω²` and carries angular momentum `L = Iω`. These are different quantities with different units; for fixed `I`, `K = L²/(2I)`. Use “stores rotational kinetic energy and carries angular momentum.”

29. **The hammer–feather result is incorrectly said to be impossible to see on Earth.** [Free fall, line 30](../site/topics/free-fall.html#story).
    It can be demonstrated on Earth in an evacuated chamber or tube. Replace “On Earth you will never see this” with “In ordinary air on Earth, drag obscures this result; in a vacuum chamber the objects fall together.” This follows directly from the no-air assumption used by the lesson.

30. **The arrow-of-time chart assigns the wrong equilibrium fraction to the left third of the box.** [Arrow of time, line 57](../site/topics/arrow-of-time.html#reveal), including its preceding SVG chart.
    A uniform distribution puts approximately one third, not one half, of the particles in that region. `site/sims.js:240` actually counts `p.x < BW/3`, and line 244 labels it the left third. Change the claimed equilibrium reference to approximately 33%, with finite-size/wall corrections if desired. The chart’s specific “average of six runs” numbers require remeasurement; they were not reproduced in this audit and should not be treated as validated measurements.

31. **Reversible numerical integration is incorrectly equated with energy conservation.** [Arrow of time, line 63](../site/topics/arrow-of-time.html#applications).
    Time reversibility, symplecticity, and exact energy conservation are different properties. Velocity Verlet, used by this simulation, is reversible in exact arithmetic and symplectic for this Hamiltonian model, but generally has a nonzero energy error. For well-behaved problems at an appropriate time step, its energy error can remain bounded over long runs. Replace the blanket conservation claim with those distinctions. [Hairer, Lubich and Wanner on Störmer–Verlet integration](https://www.unige.ch/~hairer/preprints/gniverlet.html).

## Claims needing clearer conditions

These are not automatically errors in the stated toy model, but their current general wording can teach the wrong rule.

| Lesson and location | Required qualification |
| --- | --- |
| [Projectile motion, lines 23, 58 and 74](../site/topics/projectile-motion.html#remember) | Flight time depends only on height **for a horizontal launch or fixed initial vertical velocity**, with uniform gravity and no drag. Generally it also depends on initial vertical velocity. The 45° maximum-range result additionally requires equal launch and landing elevations. |
| [Wave speed, line 58](../site/topics/wave-speed.html#reveal) | The medium fixes the dispersion relation. Phase speed can depend on frequency, and nonlinear-wave speed can depend on amplitude. “The source never decides how fast” needs the linear, nondispersive, fixed-medium assumptions stated beside it. |
| [Wave packets, lines 57 and 79](../site/topics/wave-packets.html#deeper) | Group velocity describes narrowband envelope propagation in suitable regimes; it is not universally the velocity of information or energy. The lesson already mentions anomalous dispersion, so its unqualified glossary should also distinguish signal-front velocity. |
| [Circular motion, lines 23 and 74](../site/topics/circular-motion.html#remember) | “There is no outward force” refers to the absence of an additional outward interaction on the ball in the inertial frame. A rotating frame uses the centrifugal inertial force. State the frame instead of dismissing that valid description. |
| [Collisions, line 23](../site/topics/collisions.html#illusion), and [momentum, line 23](../site/topics/momentum.html#illusion) | Momentum of the selected system is conserved when net external impulse vanishes. “In every collision” needs the system boundary and negligible-external-impulse condition. |
| [Weightlessness, lines 49 and 74](../site/topics/weightlessness.html#remember) | Use **apparent weight** for the scale/support force, consistent with the glossary. The free-fall equivalence applies locally; tidal measurements across a finite laboratory can distinguish Earth's field from gravity-free space. The limits section acknowledges gradients, but the absolute “no way to tell” should carry the same condition. |
| [Escape velocity, lines 23 and 63](../site/topics/escape-velocity.html#applications) | Direction independence refers to the unbound-energy threshold, assuming a trajectory that does not hit the planet. The black-hole description should introduce an event horizon and label Newtonian escape speed a heuristic, not the full general-relativistic explanation or a material surface. [NASA black-hole anatomy](https://science.nasa.gov/universe/black-holes/anatomy/). |
| [Tides, lines 23 and 56](../site/topics/tides.html#reveal) | Two daily high tides describe the ideal equilibrium model and many coasts, not every coast. Real tides include diurnal and mixed regimes. Also clarify line 58: tidal torque adds lunar orbital angular momentum, while the Moon's mean orbital speed **decreases** as its near-circular orbit grows. [NOAA tidal-cycle types](https://oceanservice.noaa.gov/education/tutorial_tides/tides07_cycles.html). |

## Validation and next action

Direct calculations checked the Brownian dimensional factor, braking ratio, impulse scaling, carbon-collision energy limits, resonance-peak position, and Earth-distance irradiance variation. The arrow-of-time equilibrium finding was checked against the actual counting code. The findings about fields, centre-of-mass motion, interference and the compound pendulum follow from the governing equations stated in this report.

Start corrections with heat diffusion, standing waves, inverse-square orbital stability, Fourier reconstruction, and supersonic sound: each currently gives an incorrect central explanation. Then correct the formulas, numerical examples, glossary definitions, and repeated summaries. Remeasure the arrow-of-time plot before publishing it as experimental output. A later pass should verify historical claims and live “right now” examples individually, and exercise every interactive simulation; neither is represented here as complete.

## Resolution (2 October 2026)

All 31 errors and the 8 qualifications were checked against the page text and corrected in `site/topics/*.html`, except where noted below. Pages still load with no script errors.

- Item 30: the chart's averages were re-measured (80 runs, 350-step reversal): 78, 72, 65, 59, 53, 51 and 46%. My first note called 26% the equilibrium share; that was wrong. The 26% is the share at the 350-step moment. A long-run mixed gas gives about 33% (the reviewer measured 32.6%). The text now says 33% for the long-run reference.
- Item 10: the simulation's on-canvas message and the two lesson passages no longer say a supersonic source has no pitch.
- Item 17: the formula was checked (peak at r = √(1 − 2ζ²)); the text now says "almost exactly at r = 1 for light friction".
- Items 2, 4 and 8 also touched the glance, glossary and remember boxes, not just the cited line.
- Not done: the later pass the audit proposes (every historical claim and every "happening right now" example, and a full run of every simulation).

Rule added to the production plan: a takeaway that says "every", "always", "never" or "only" needs its conditions stated in the same sentence.

## Second review (2 October 2026)

All ten findings and the two consistency points in `physics-fix-review.md` were applied: equilibrium reference 33%, heat heading and surprise box, Foucault text and caption, projectile reveal conditions, wave-packet takeaway and "narrowband", the dimensionality claim attributed to Ehrenfest with its assumptions, symplectic Verlet wording, Brownian caption, resonance try-it, reflection scoped to the rope model, "constant velocity" in the acceleration lesson, and "apparent weight".
