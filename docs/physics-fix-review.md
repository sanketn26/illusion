# Review of the physics fixes — 2 October 2026

The fixes substantially improve the lessons, but the resolution statement that all 31 errors and all 8 qualifications have been corrected is premature. The following findings remain. This review compares the current lesson text with the pre-fix text saved during the audit, including summaries, captions and glossaries. Lesson files have not been edited by this review.

## Findings

1. **[P2] Replace the new 26% gas-equilibrium baseline.** `site/topics/arrow-of-time.html:57`; also repeated in the audit's resolution.
   The chart and caption now explain 26% occupancy as a third minus the wall strip. That is not the equilibrium of the implemented box. Its width is 600 px and its wall-force threshold is 9 px, so even the hard-wall approximation gives `(200 − 9)/(600 − 18) ≈ 32.82%`. Direct headless runs of the current simulation give a long-time average of **32.59%** in the left third, across eight seeded trajectories, sampling steps 2,000–5,990. Use approximately 33% as the equilibrium reference. If 26% was measured at a particular instant, label it as a finite-time measurement rather than equilibrium. The revised 350-step reversal results are plausible: a separate 12-seed check gave approximately 79.6% for the smallest perturbation and 45.7% for the largest. This does not reproduce or authenticate the stated 80-run dataset.

2. **[P2] Remove the remaining claim that heat's direction is absent from the averaging rule.** `site/topics/heat-diffusion.html:70` and `:77`.
   The revised paragraph correctly says the averaging rule is one-way, but its heading still says the direction “isn't in the rule.” The surprise box also still calls the rules symmetric without distinguishing spatial from temporal symmetry. Change the heading to “The averaging rule already has a direction,” and state that spatially symmetric averaging produces irreversible smoothing; reversibility belongs to the underlying microscopic model. This prevents the heading from teaching the opposite of the corrected paragraph. [MIT heat-equation notes](https://ocw.mit.edu/courses/18-086-mathematical-methods-for-engineers-ii-spring-2006/5db29e69494eb09a26f7224d43adc6f6_am54.pdf).

3. **[P2] Do not retain the fixed-inertial-plane explanation for a Foucault pendulum at general latitudes.** `site/topics/pendulums.html:58`, and the caption at `:49`.
   Adding “tends to” and the correct sine-of-latitude rate does not fix the underlying claim that the plane remains fixed relative to the stars while the floor rotates beneath it. That literal picture applies at the poles. Elsewhere the local vertical changes orientation, and the Earth-frame precession is `ΩEarth sin(latitude)`. The unchanged caption repeats the original claim. Explain the latitude-dependent precession and restrict the inertial-plane picture to the polar case. [University of Texas derivation](https://farside.ph.utexas.edu/teaching/336k/Newtonhtml/node59.html).

4. **[P2] Carry the horizontal-launch and equal-elevation conditions into the projectile reveal.** `site/topics/projectile-motion.html:58`.
   The summary and remember box were qualified, but immediately after discussing angled throws the reveal still says vacuum range is maximized at exactly 45° and that throwing harder cannot increase flight time. For a fixed upward launch angle on level ground, `T = 2v sin θ/g`: increasing launch speed increases time aloft. A launch from a cliff generally has an optimal range angle below 45°, even without drag. State equal launch/landing heights for the 45° rule, and restrict the height-only flight time to the horizontal launches shown by the simulation.

5. **[P2] Qualify the wave-packet takeaway as well as its glossary.** `site/topics/wave-packets.html:57` and `:79`.
   The updated glossary distinguishes group velocity from signal-front velocity, but the surprise box still equates group velocity with the speed of messages and energy universally. That contradicts the anomalous-dispersion exception in the preceding paragraph. State that group velocity describes envelope transport for a **narrowband** packet in the appropriate regime; it need not equal information-front velocity in strongly dispersive/absorbing media. Also change the new glossary's “narrow packet” to “narrowband packet”: a spatially short packet usually has a broad spectrum.

6. **[P2] Do not strengthen the dimensionality argument into an unconditional three-dimension requirement.** `site/topics/inverse-square-law.html:58`.
   The Bertrand correction is good, but the new statement that stable planetary orbits and atoms “need exactly three dimensions” is too strong. Stability depends on the adopted force law and model. In two spatial dimensions, the Gauss-law analogue `F = −k/r` has effective potential `k ln r + L²/(2mr²)`, with a stable circular-orbit minimum for nonzero angular momentum. Attribute Ehrenfest's argument and state its model assumptions, rather than presenting a universal prohibition on stable systems in other dimensions.

7. **[P2] Keep the distinction between reversible and symplectic integration.** `site/topics/arrow-of-time.html:63`.
   Replacing exact conservation with “small and bounded” error is an improvement, but time reversibility alone does not guarantee bounded energy error. Identify the example as a symplectic, time-reversible Verlet integrator and qualify its long-time energy behavior by an appropriate step size and suitable Hamiltonian dynamics. The generic claim about all time-reversible integrators remains incorrect. [Hairer, Lubich and Wanner on Störmer–Verlet](https://www.unige.ch/~hairer/preprints/gniverlet.html).

8. **[P2] Remove the Brownian caption's remaining denial of physical speed.** `site/topics/brownian-motion.html:59`.
   The added paragraph correctly distinguishes a physical particle's velocity from the mathematical Brownian limit, but the very next caption still concludes that speed is not a meaningful number. Say that a coarse-resolution path-length estimate does not measure instantaneous velocity, and confine nondifferentiability to the ideal mathematical process. [Li et al.'s velocity measurement](https://users.physics.ox.ac.uk/~Foot/Phynance/Raizen1BrownianM.pdf).

9. **[P2] Remove the resonance instructions' remaining phase-drift explanation.** `site/topics/resonance.html:49`.
   The reveal now correctly describes a fixed phase lag after the transient, but the first try-it instruction still says an off-resonance response is small because the pushes keep falling out of step. Replace that explanation with the steady-state frequency-response argument. At 0.60 Hz the settled response is at 0.60 Hz with a fixed phase offset; its relative phase does not keep drifting. [MIT forced-oscillation notes](https://ocw.mit.edu/courses/8-03sc-physics-iii-vibrations-and-waves-fall-2016/782069da3820fc514c10c26ae0c15b01_MIT8_03SCF16_Text_Ch2.pdf).

10. **[P2] Restrict the reflection takeaway's new “only” statements to the rope model.** `site/topics/reflection-and-echoes.html:74`.
    The replacement now says zero reflection requires matching media and zero transmission requires a wall or free end. As a general wave claim this is false: p-polarized light at Brewster incidence can have zero reflection between unequal media, and total internal reflection has zero transmitted far-field power without a wall or free endpoint. Introduce the sentence with “For this lossless one-dimensional rope model,” or use “can” instead of “only.” The chapter applies its takeaways to optics, so the scope matters. [University of Virginia treatment of Brewster incidence and total internal reflection](https://galileoandeinstein.phys.virginia.edu/Elec_Mag/2022_Lectures/EM_46_Plane_Electromagnetic_Waves.html).

## Smaller remaining consistency issues

- `site/topics/speed-and-acceleration.html:36` and `:74` still equate **steady speed** with rest-like motion. Use **constant velocity**, since a car turning at constant speed has acceleration. The timeline at `:42` also retains acceleration as change of speed without the straight-line condition.
- `site/topics/weightlessness.html:74` still defines unqualified weight as the floor's push. The revised next item uses apparent weight, but the first item should also say **apparent weight**, matching the glossary and the separate free-fall lesson's definition of gravitational weight.

## Verification

- Compared edits across the lessons with the pre-fix prose saved during the original audit; inspected captions and the arrow-of-time SVG values separately.
- `node --check site/sims.js` passes.
- Ran the actual exposed `window.IllusionSims.arrow` headlessly with a deterministic linear-congruential random generator. Twelve seeds checked 350-step forward/reverse runs for zero, minimum and maximum perturbation. Eight further seeds sampled late-time occupancy after allowing 2,000 steps to settle, through 6,000 steps. The long-time result was 32.5866%; individual trajectory averages ranged from 30.63% to 34.41%.
- This was not a browser render test of all lessons or a reproduction of the claimed 80-run chart dataset. The original measurement script and seeds were not found in the repository.

The corrected `4Dt` formula, stopping-distance ratio, impulse-area scaling, Fourier phase/DC distinction, neutron-moderation example, electric-field-line definition, centre-of-mass glossary, spring proportional limit, and flywheel energy description are sound. Finish the findings above before marking the audit fully resolved.
