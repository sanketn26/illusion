# Production plan: writing the whole catalogue in batches

The catalogue has 268 topics. They are written in **34 batches of 5–12 chapters** (see the Batches table in [`catalog.md`](catalog.md), source `catalog.txt`). A batch is one theme and roughly one to two working sessions. Prerequisites always come first, so the site is coherent after every batch.

## Resuming (start of every session)

```sh
python3 scripts/build_catalog.py --next
```

This validates the catalogue, prints progress, and lists the next unfinished batch with each topic's illusion and hook. Then work through the batch using the procedure below. Do not start a second batch until the first passes its checks.

## What a finished chapter contains

Each chapter is `site/topics/<slug>.html`, following [`chapter-template.md`](chapter-template.md). The bar:

1. **A story cold open.** A concrete scene, person or event in the first lines, ending on the question the chapter answers. Never a definition first.
2. **The illusion, stated as the thing most people believe**, in plain words.
3. **Genesis.** A dated timeline of who asked the question and what changed. Only claims you are confident in; flag anything uncertain in the batch notes.
4. **A purpose-built simulation** with controls that make the viewer predict, then see. Where the sim has non-obvious numerics, test it headlessly (see below).
5. **At least two illustrations** (inline SVG) or one illustration plus the simulation doing visual work. Every colour and arrow is labelled.
6. **The reveal**, building from the model, ending on "The surprise".
7. **Happening right now.** One callout naming where this physics is operating at this moment, in something the reader uses or can look up.
8. **Applications** (5–6, each with a one-line why), **where the simulation lies** (concrete simplifications), **Remember** (three takeaways), **Go deeper** (glossary and sources).

Intuition first: a reader should be able to explain the idea to a friend after the story, the simulation and the "remember" box, without having read the equation.

## Procedure per batch

1. `python3 scripts/build_catalog.py --next` and read the brief.
2. Design each simulation first. Add it to `site/sims.js` (`SIMS` entry; `controls`, `buttons`, `pointer` as needed). Reuse an existing simulation when the idea is the same.
3. **Test numerics headlessly** when the sim has dynamics (collisions, orbits, reversibility, stability). `node` with a stubbed canvas context and `window.IllusionSims` is enough. Check the behaviour the chapter claims, with numbers. Note any limit you found (for example reversal fails past a certain length) and say so in the chapter.
4. Write the chapter pages. `scripts/chapter_kit.py` provides the page template and helpers (`page`, `sim`, `illo`, `try_list`, `timeline`, `apps`, `now`, `lies`, inline-SVG `svg`/`t`/`arrow_svg`); write a throwaway generator script that imports it, which keeps every chapter's structure identical. Mark each `shipped:<slug>` in `docs/catalog.txt`.
5. Run `python3 scripts/build_catalog.py`; fix any validation errors.
6. Render each new page in headless Chrome and look at it (`google-chrome --headless=new --screenshot`), including a mobile width. Check that the simulation draws and the controls work.
7. Physics review against [`physics-review-checklist.md`](physics-review-checklist.md). Re-check every date and attribution in the genesis timeline.
8. Update the batch status (the build script does it) and commit with a message naming the batch.

## Working at scale

- Batches are independent once their prerequisites are shipped, so chapters inside a batch can be written in parallel by separate agents, each owning one chapter page and one simulation entry. Merge `sims.js` carefully, since it is the shared file.
- Keep each chapter's simulation to one or two controls plus at most two buttons. Complexity belongs in the story, not the control panel.
- Sources are cited by author, title and year. Do not invent URLs.
- If the facts in a genesis timeline can't be verified, write the section around what is certain and list the open item in the batch notes rather than guessing.

## Cadence

About one batch per session. Batch 1 (the ten "Start here" topics plus the two earlier chapters brought up to this format) is the template for everything after it. Batch 2 (everyday motion) followed the same procedure.

## Lessons from batches 1 to 6

- Render every simulation and every inline illustration before calling a batch done. Clipped text and labels sitting on lines were the most common defects, and tests do not catch them.
- Headless Chrome does not advance `requestAnimationFrame`, so drive a simulation by calling `step()` in a small harness page and screenshot the result.
- Test each simulation against the closed-form answer the chapter quotes (stopping distance, landing time, momentum sum) before writing prose that claims it.
- Keep illustration SVGs inside their `viewBox` and caption text short; lines of more than about 30 characters in a narrow column get clipped.
- Give a simulation a read-only `debug()` hook returning its internal state when a test needs to check a conserved quantity or a settled position; a simulation can also move its own slider through the optional `sync()` hook (used by the auto-zoom in orders of magnitude).
- When a simulation claims a regime (for example "it escapes"), test the boundary cases, not just the clear ones. Batch 4's escape-velocity sim wrongly said "escapes" for speeds just below the limit until a boundary test caught it.
- Check text and diagram claims against the geometry you draw: an illustration of a hanging shape and a Moon-phase ring were both drawn wrongly at first and only the render showed it.
- A button can move a slider: `act()` stores the new values and `sync()` returns them once (`diffract` and `alias` do this). The site calls `sync()` after a button press as well as every frame, so it works while paused too.
- When a sum of waves is built numerically (wave packets, dispersion), check that the window does not contain a repeat of the sum (spacing of the wave numbers sets the repeat length) and that truncating the Gaussian does not distort the claim. Batch 6's packet first read a length × spread of 0.86 instead of 0.5 until the cut-off was widened.
- A scene that loops (the Doppler car re-entering the screen) produces one false measurement at the jump; mark the first event after the jump and skip it, then compare with the closed form on a window without a jump.
- For diffraction-type claims, test in the far field where the formula applies (first null at 60,000 px matched asin(λ/w) to 0.02°); the on-screen picture is near-field and only approximately matches.
- Keep inline-SVG caption lines under about 85 characters at 12 px and put legends where no curve passes; both were fixed after the gallery render in batch 6.
- Review finding (audit of 2 October 2026): universal wording in takeaways ("every collision", "no pitch", "never", "only") was the most common error. State the conditions in the same sentence, and keep takeaways consistent with the limits section. See `physics-fact-audit.md`.
