# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

An Arkanoid/Breakout game built with plain HTML, CSS and JS — **zero dependencies**. The game is implemented and playable: single-canvas (800×600) gameplay lives in `js/game.js`, styling in `css/style.css`, and the page shell in `index.html`. Art/audio assets are in `assets/` (`assets/spritesheet-breakout.png`, `assets/spritesheet.js`, `assets/sounds/*.mp3`). There is no build tool, package manager, bundler, or test suite in this repo — do not introduce one unless the user asks for it. Since it's plain HTML/JS/CSS, run/verify by opening `index.html` directly in a browser (or a simple static server).

Implemented so far (see `specs/` for full detail on each):

- **01 — MVP Arkanoid:** paddle (keyboard/mouse/touch), ball physics, 10×6 block grid, scoring, win/lose overlay with restart.
- **02 — Block explosion animation:** 4-frame explosion using `EXPLOSION_FRAMES` on block destruction.
- **03 — Sound effects:** bounce and break sounds via `assets/sounds/*.mp3`.
- **04 — Levels and progression:** 3 sequential levels with increasing ball speed and distinct block patterns, level shown in HUD.

Pause button, restart-resets-to-level-1, and game-state management have since been added directly on top of these specs (see git log for exact commits).

## Spec-driven workflow

This repo follows a spec-driven development method via two custom skills in `.agents/skills/`, with specs tracked in `specs/NN-slug.md` (see `specs/01-mvp-arkanoid.md` through `specs/04-levels-and-progression.md` for real examples) and configured by `specs/.spec-config.yml`:

- **`/spec <description>`** — Guided, conversational spec design. Asks clarifying questions in phases before writing anything, then builds the spec section-by-section with confirmation at each step. Writes only a `specs/NN-slug.md` file (numbered sequentially) — never touches code. New specs are saved in `Draft` state.
- **`/spec-impl <NN-spec-name>`** — Implements an approved spec. Refuses to run unless the spec's status is literally "Approved" (or an equivalent word in another language — this repo's specs use both "Aprobado" and "Approved"). On success it creates/switches to a git branch named `spec-NN-slug` (unless `specs/.spec-config.yml` sets `AutoCreateBranch: false`), shows the spec's objective/scope/plan/acceptance criteria, then implements the plan one step at a time, pausing for review after each step.

Each spec follows a fixed shape (see `.agents/skills/spec/template.md`): header (status/depends-on/date/one-sentence objective), Scope (in/out), Data model (if applicable), Implementation plan (numbered steps), Acceptance criteria (boolean checklist), Decisions taken and discarded, and Identified risks (if applicable).

**Practical implications for any agent working in this repo:**

- Large/new features should go through `/spec` first, not straight into code. Small fixes to existing code don't need a spec.
- Never mark a spec `Approved` yourself — that transition is made by the human reviewing it.
- When implementing a spec, follow its plan exactly; if something looks suboptimal, note it as an observation but implement what the spec says. Spec changes belong in the spec file, not as surprise deviations in code.
- Specs may be written in Spanish or English — match the language of the initial prompt/spec when working on it.
- Next spec number is sequential based on the highest `specs/NN-*.md` already present (currently 04 → next is 05).

## Assets reference (`assets/spritesheet.js`)

Defines sprite coordinates into `assets/spritesheet-breakout.png` for the paddle, ball, and colored blocks (`SPRITES`), plus multi-frame explosion animations per color (`EXPLOSION_FRAMES`, ~150ms duration). Exposes `loadSpritesheet(cb)` to lazily load and cache the image on an offscreen canvas, and `drawSprite(ctx, name, x, y, w, h)` / `drawFrame(ctx, frame, x, y, w, h)` to blit sprites onto a canvas context. Block sprite names follow the pattern `block_<color>` (e.g. `block_red`), resolved against `SPRITES.blocks`.
