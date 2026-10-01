# Visual investigations: first forty

> These are the detailed design briefs for 40 topics. The canonical list, with stable IDs, prerequisites and learning paths, is [`catalog.md`](catalog.md) (source: `catalog.txt`). The first column here is the legacy brief number followed by the catalogue ID.

Each episode starts with a familiar event, then offers a small rule-based simulation. The illustration is a visual question to pose before the reveal, not evidence by itself. The interactive site hosts topics 02, 05, 07, 31, and 32; the other simulations below are designs, not shipped demos.

| # | Topic | Everyday scenario | Simulation: change and observe | Intuitive explainer | Illustration brief |
|---:|---|---|---|---|---|
| 01 · THM02 | Brownian motion in a box | A pollen grain jitters under a microscope. | Surround one large tracer with many small moving particles. Vary particle speed and number; trace the grain's path. | Tiny impacts arrive unevenly. No single push determines the path, yet an ensemble spreads in a measurable way. | Large grain with unequal small-particle impacts and a jagged trail. |
| 02 · THM01 | Random walk vs directed walk | A person wanders through a crowd while another follows a sign. | Give two tracers equal step lengths; one picks random directions, one has a rightward bias. Change step length and compare trails. | Random steps cancel partly; a consistent bias accumulates. One path is not enough to infer an average law. | Teal wandering trail beside an amber rightward trail. |
| 03 · THM13 | Entropy in a two-chamber box | Perfume released in one corner fills a room. | Start particles on one side, remove a divider, and count occupancy of left and right halves over time. | There are many more mixed arrangements than concentrated ones, so mixing is overwhelmingly likely. | Divider opens between crowded and empty chambers; later both sides are populated. |
| 04 · THM14 | Arrow of time from gas expansion | A balloon bursts; its air never visibly reassembles. | Expand a reversible toy gas from one side. Reverse all velocities exactly, then add a tiny error and compare. | Microscopic rules can be reversible while a return to the special starting state is extraordinarily fragile. | Forward spread and a reverse arrow disrupted by one perturbed particle. |
| 05 · THM09 | Heat diffusion on a grid | A drop of hot tea warms a cold spoon. | Place a hot patch on a cooler grid; change the exchange rate and paint new hot spots. | Every neighboring pair exchanges heat. Together those local exchanges smooth the temperature difference. | Red hot cells fading through orange into blue cool cells. |
| 06 · OSC07 | Sine wave basics | A stadium wave circles while spectators stay in their seats. | Animate vertically moving points as a wave profile travels sideways. Adjust wavelength and frequency. | The pattern travels; the material oscillates near its own position. | Row of fixed horizontal positions with moving dots and a rightward pattern arrow. |
| 07 · OSC10 | Wave interference | Two pebbles make overlapping ripples in a pond. | Emit waves from two sources; change their separation and observe bright and dark bands. | Peaks reinforce peaks, while a peak and trough cancel at a location. | Two ripple centers with labeled reinforcement and cancellation bands. |
| 08 · OSC11 | Standing waves | A guitar string vibrates between two fixed ends. | Drive a fixed-end string at different frequencies and show amplitude over time. | Reflected waves reinforce at some frequencies, producing nodes that barely move. | String with still end points, stationary nodes, and moving antinodes. |
| 09 · EMG02 | Electric field around charges | Tiny paper bits respond to a charged comb. | Place positive and negative charges; sample force arrows on a grid and move a test charge. | The arrow at each point predicts the force on a positive test charge there. | Plus and minus charges with arrows and a marked test point. |
| 10 · GRV01 | Gravity as a field | A satellite keeps falling around Earth. | Place a central mass and launch test objects at different sideways speeds. Draw acceleration arrows and paths. | Gravity continuously bends the path; sufficient sideways motion can keep the object in orbit. | Earth, inward arrows, and curved launch paths. |


## More theoretical and applied investigations

These are curated additions to the teaching sequence, drawn from or compatible with the broader 100-topic idea backlog. They are concepts for future simulations, not live demos.

| # | Track | Topic | Real-world hook | Simulation: change and observe | Intuitive reveal | Illustration brief |
|---:|---|---|---|---|---|---|
| 11 · MEC07 | Theoretical | Conservation of momentum | Two skaters push apart on ice. | Vary their masses and push strength; compare both velocities. | Their momenta change by equal and opposite amounts in an isolated system. | Two skaters move apart with unequal speeds. |
| 12 · OSC04 | Theoretical | Resonance | A playground swing rises when pushed at the right rhythm. | Drive an oscillator at different frequencies and plot amplitude. | Energy builds fastest when the driving frequency matches a natural frequency. | A swing arc grows under timed pushes. |
| 13 · OSC13 | Theoretical | Fourier decomposition | A musical note has a distinctive tone. | Mix sine waves; change amplitudes and compare waveform and spectrum. | A complex periodic signal can be assembled from simpler frequencies. | Several small waves combine into one jagged trace. |
| 14 · MEC12 | Theoretical | Potential energy landscapes | A marble settles into a bowl. | Move a particle through adjustable hills and wells. | Forces point downhill in potential energy; total energy sets reachable regions. | A ball sits in a valley between energy hills. |
| 15 · THM22 | Theoretical | Phase transitions | Water can abruptly freeze as it cools. | Vary temperature in a lattice model and track collective order. | Many local interactions can produce a sharp change in bulk behavior. | Disordered cells become an aligned patch. |
| 16 · REL03 | Theoretical | Special relativity: light clock | Fast-moving clocks run differently. | Send light between mirrors in two reference frames; change relative speed. | Observers agree on light speed but measure different elapsed times. | A vertical light path and a diagonal path between mirrors. |
| 17 · REL10 | Theoretical | Spacetime light cones | A distant flash cannot affect you immediately. | Move events on a spacetime diagram and mark reachable regions. | Finite signal speed divides events into possible and impossible causal connections. | An event sits at the tip of two cones. |
| 18 · QNT11 | Theoretical | Quantum tunneling | Electrons cross barriers in electronic components. | Change barrier width and height in a one-dimensional wave model. | A wave can have nonzero transmission where a classical particle cannot cross. | A wave shrinks inside a barrier and emerges beyond it. |
| 19 · QNT10 | Theoretical | Wave-packet uncertainty | A short pulse contains a range of pitches. | Narrow a wave packet and compare its spread in position and wave number. | A sharper location requires a broader mix of wave numbers. | Narrow pulse beside a broad frequency band. |
| 20 · GRV16 | Theoretical | Gravitational lensing | A galaxy bends light from a more distant galaxy. | Trace idealized light paths around a lensing mass. | Different paths can make one source appear shifted, stretched, or multiple. | Two light paths curve around a central mass. |
| 21 · MEC05 | Applied | Braking distance and friction | A wet road lengthens a car stop. | Change speed, friction, and reaction delay; plot stopping distance. | Reaction distance grows with speed; braking distance rises roughly with speed squared in this simple model. | Two cars at different speeds leave unequal stopping trails. |
| 22 · CAS04 | Applied | Bridge vibrations | A bridge sways under rhythmic foot traffic. | Model a driven damped beam; change forcing rate and damping. | Driving near a mode can amplify motion, while damping limits the response. | A bridge deck bends with a labeled vibration mode. |
| 23 · CAS03 | Applied | Noise-cancelling headphones | Headphones reduce a steady background hum. | Add a signal and an adjustable opposite-phase signal. | Cancellation depends on matching phase and amplitude at the listener. | Two offset waves combine into a smaller result. |
| 24 · CAS05 | Applied | Solar-panel angle | A tilted panel receives less direct noon light. | Rotate a panel under a fixed beam and compare intercepted power. | For a fixed beam, projected area falls with the angle from the panel normal. | Light rays meet panels at two angles. |
| 25 · OPT05 | Applied | Lens focus and cameras | A camera lens brings a distant scene into focus. | Move a converging lens and image plane; trace paraxial rays. | The image sharpens when rays from one object point meet on the sensor. | Rays converge through a lens onto a sensor. |
| 26 · CAS07 | Applied | Ultrasound echoes | Medical ultrasound measures depth from returning pulses. | Send a pulse through layers with adjustable sound speeds and boundaries. | Echo delay gives depth when the wave speed is known; boundaries create reflections. | A pulse reflects from two tissue boundaries. |
| 27 · CAS08 | Applied | MRI signal and relaxation | MRI distinguishes tissues using magnetic signals. | Rotate simplified spin vectors and vary relaxation rates. | Different return rates change measured signal contrast; the toy model omits full imaging. | Spin arrows recover at different rates. |
| 28 · THM12 | Applied | Thermal insulation | A thermos slows a drink cooling. | Compare layered walls by conductivity and thickness. | A larger thermal resistance lowers heat flow for a given temperature difference. | Temperature gradient crosses several material layers. |
| 29 · CAS09 | Applied | Power-grid frequency | A grid must balance generation and demand. | Change load and supply in a simplified rotating-generator model. | An imbalance briefly changes stored rotational energy and grid frequency. | Generator, demand, and a frequency gauge. |
| 30 · CAS10 | Applied | Rocket staging | A launch vehicle drops an empty fuel tank. | Compare idealized trajectories with and without discarded dry mass. | Shedding unused mass improves the remaining vehicle’s attainable speed. | Two-stage rocket separates above a rising path. |

## Production guardrails

- Show the real scenario before introducing model particles, cells, or waves.
- Make the viewer predict what a parameter change will do, then show the result.
- Label what each color, trail, arrow, or band represents.
- End with the model's main omission. For example, the shipped random-walk demo is not a collision-based Brownian motion simulation; the heat demo omits fluid flow; the wave demo uses idealized scalar waves.
- Compare ensemble statistics when explaining randomness or entropy. One animated run is an example, not a proof of a statistical claim.

## Physics in action: ten more episodes

These episodes start with a real device or event. The two highlighted diagrams on the site are live conceptual models; the other eight are planned. These entries supplement the topic backlog rather than replacing it.

| # | Topic | Real-time scenario | Simulation: what to change | Intuitive explainer | Illustration |
|---:|---|---|---|---|---|
| 31 · FLU06 | How an airplane flies | A plane accelerates, rotates, climbs, and later glides with reduced engine power. | Change wing angle of attack and watch qualitative lift and drag arrows; compare with weight and thrust. | A moving wing deflects airflow and experiences an aerodynamic force. Lift is the component opposing weight; thrust helps maintain motion against drag. More angle initially raises lift, but excessive angle can cause stall. | Wing cross-section, airflow bent downward, and four labeled force arrows. |
| 32 · CAS01 | How air defense detects and intercepts | A projectile is launched while a defended area is monitored. | Step through sensing, repeated tracking, a predicted path, and an illustrative interception event. | Radar echoes provide observations; successive observations support a changing track and prediction. A control system can decide whether to engage and command an interceptor. Actual interception is uncertain and may leave hazardous debris. | Four-panel sequence: radar pulse, observations, projected path, interception in open sky. |
| 33 · FLU13 | Why helicopters can hover | A helicopter lifts vertically without a runway. | Change rotor airflow and compare upward thrust with weight. | Rotors accelerate air downward; the reaction can support the craft. Hover still requires continuous power. | Rotor disk with downward airflow and upward force. |
| 34 · FLU03 | Why ships float | A loaded boat settles deeper but stays afloat. | Add cargo and change hull volume; show displaced water. | Buoyancy equals the weight of displaced fluid; the vessel sinks until the forces balance or it floods. | Two waterlines around a hull at different loads. |
| 35 · MEC09 | How a seat belt protects | A car stops suddenly but an unrestrained passenger keeps moving. | Change stopping time and compare peak deceleration in a simplified passenger model. | Extending the time over which momentum changes lowers average force for the same speed change. | Same passenger stop over short and long time intervals. |
| 36 · CAS11 | Why a bicycle stays steerable | A moving bicycle leans and the rider steers into the lean. | Change speed and steering in a simplified balance model. | Steering moves the tire contact region relative to the center of mass; bicycle stability has several interacting causes. | Leaning bicycle, contact point, and center of mass. |
| 37 · CAS12 | How GPS uses time | A phone estimates position from satellite signals. | Shift signal arrival times and show distance spheres changing. | Signal travel time constrains distance; multiple satellites and clock correction locate the receiver. | Satellite distance circles intersect near a phone. |
| 38 · CAS13 | How a microwave heats food | A microwave warms some spots faster than others. | Change an idealized field pattern and rotate a food sample. | Electromagnetic energy is absorbed unevenly; rotation changes which regions receive energy over time. | Hot and cool patches move through a standing field pattern. |
| 39 · OPT06 | Why a rainbow forms | Sunlight meets rain after a shower. | Change droplet geometry and wavelength in a ray diagram. | Refraction and internal reflection redirect light; different wavelengths leave at different angles. | White ray enters a drop; colored rays leave at different angles. |
| 40 · OSC03 | How a suspension smooths bumps | A car crosses repeated road bumps. | Change spring stiffness, damping, and bump spacing; watch body motion. | The spring stores energy and the damper dissipates it; tuning changes bounce and comfort. | Road bump, wheel, spring, damper, and body displacement trace. |

### Episode 31 explainer: How an airplane flies

At takeoff, thrust from the engines accelerates the airplane. As air moves over and under the wing, the wing turns the surrounding flow; pressure and shear forces on the wing have an upward component called lift. A useful first approximation is that lift depends on air density, wing area, speed squared, and a lift coefficient that depends strongly on shape and angle of attack. The wing does not need an engine to make lift: a glider maintains airflow by descending. In level, unaccelerated flight, lift balances weight and thrust balances drag. Pulling the nose up changes angle of attack; at first lift tends to rise, but too large an angle can cause flow separation and a stall. The site's demo shows this trend qualitatively, not a flight-performance calculation.

Visual sequence: **runway acceleration → airflow around a wing → four force arrows → raise angle of attack → stall region**. Ask: “If an engine stops, does lift vanish instantly?” The glider example reveals why the answer is no.

### Episode 32 explainer: How air defense detects and intercepts

At a public, conceptual level, Iron Dome is described as a system with detection and tracking radar, battle management, and interceptor missiles. Radar measurements identify and update a track; a control system estimates where a projectile may go and decides whether to engage; an interceptor is launched to meet a selected threat. Interception is a physical event with uncertainty and potential debris. The site's four-stage diagram explains the information flow and shows a symbolic interception. It does **not** model actual Iron Dome timing, performance, engagement decisions, guidance, or weapon effects.

Visual sequence: **radar echo → repeated position observations → predicted path and decision → symbolic interception**. Ask: “Why is one radar echo insufficient to know where an object is going?” The need for repeated measurements reveals the difference between detection and tracking.

### Sources for the two explainers

- [NASA Glenn: Four Forces on an Airplane](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/four-forces-on-an-airplane/)
- [NASA Glenn: Factors That Affect Lift](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/factors-that-affect-lift/)
- [NASA Glenn: Inclination Effects on Lift](https://www.grc.nasa.gov/www/k-12/VirtualAero/BottleRocket/airplane/incline.html)
- [Rafael: Iron Dome overview](https://he.rafael.co.il/wp-content/uploads/2019/03/Iron-Dome-Multi-Mission.pdf)
- [RTX Raytheon: Iron Dome overview](https://www.rtx.com/raytheon/what-we-do/integrated-air-and-missile-defense/irondome)
