# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

An Arkanoid/Breakout game built with plain HTML, CSS and JS — **zero dependencies**. As of now the game itself is not yet implemented; only art assets exist (`assets/spritesheet-breakout.png`, `assets/spritesheet.js`, `assets/sounds/*.mp3`). There is no build tool, package manager, bundler, or test suite in this repo — do not introduce one unless the user asks for it. Since it's plain HTML/JS/CSS, run/verify by opening the HTML file directly in a browser (or a simple static server) once it exists.

## Spec-driven workflow

This repo follows a spec-driven development method via two custom skills in `.agents/skills/`:

- **`/spec <description>`** — Guided, conversational spec design. Asks clarifying questions in phases before writing anything, then builds the spec section-by-section with confirmation at each step. Writes only a `specs/NN-slug.md` file (numbered sequentially) — never touches code. New specs are saved in `Draft` state.
- **`/spec-impl <NN-spec-name>`** — Implements an approved spec. Refuses to run unless the spec's status is literally "Approved" (or an equivalent word in another language). On success it creates/switches to a git branch named `spec-NN-slug` (unless `specs/.spec-config.yml` sets `AutoCreateBranch: false`), shows the spec's objective/scope/plan/acceptance criteria, then implements the plan one step at a time, pausing for review after each step.

**Practical implications for any agent working in this repo:**

- Large/new features should go through `/spec` first, not straight into code. Small fixes to existing code don't need a spec.
- Never mark a spec `Approved` yourself — that transition is made by the human reviewing it.
- When implementing a spec, follow its plan exactly; if something looks suboptimal, note it as an observation but implement what the spec says. Spec changes belong in the spec file, not as surprise deviations in code.
- `specs/` does not exist yet in this repo — it will be created by the first `/spec` invocation.

## Assets reference (`assets/spritesheet.js`)

Defines sprite coordinates into `assets/spritesheet-breakout.png` for the paddle, ball, and colored blocks (`SPRITES`), plus multi-frame explosion animations per color (`EXPLOSION_FRAMES`, ~150ms duration). Exposes `loadSpritesheet(cb)` to lazily load and cache the image on an offscreen canvas, and `drawSprite(ctx, name, x, y, w, h)` / `drawFrame(ctx, frame, x, y, w, h)` to blit sprites onto a canvas context. Block sprite names follow the pattern `block_<color>` (e.g. `block_red`), resolved against `SPRITES.blocks`.
