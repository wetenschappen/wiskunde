# AGENTS.md - Archimedes

Single source of truth for coding agents in this repo.

## Scope

- Main source tree is `src/` plus root config files.
- Treat `src/single-file-presentation/` as legacy/noise unless the task explicitly asks for it.
- This file replaces old multi-doc guidance. Do not rely on deleted docs.

## Dev Commands

```bash
npm run dev
npm run build
npm run preview
```

If `npm` is blocked on Windows:

```bash
node ./node_modules/vite/bin/vite.js dev
```

## Current App Architecture

- App entry: `src/main.js` mounts `App.vue` and imports KaTeX CSS globally.
- `src/App.vue` combines 3 lesson files (`chemie-bindingen-les-1/2/3`) into one planner flow.
- `combineLessons()`:
  - prefixes step keys as `lesson{n}_{stepKey}`
  - prefixes card IDs as `${lesson.id}-${card.id}`
  - merges all `lesson.activities` into one map
- Progress tracking is hardcoded to `combined-chemie-bindingen` via `useProgress()`.
- `useLesson()` flattens top-level lesson fields plus `config` into `lesson.config`.

## Lesson Data Reality (Important)

Current real lessons do **not** match the old broad template exactly.

- Real lessons use multiple slide arrays and cards reference them with `slidesKey`.
  - Example keys in use: `hook_slides`, `theory_slides`, `guided_slides`, `summary_slides`.
- Timeline in production lessons is strictly steps `A/B/C` (not old mandatory `A-E`).
- Real lessons include `date`.
- Real lessons currently do **not** define a `config` object (template still does).
  - App still reads `lesson.config` for links/tools/goals widget metadata.
  - If adding/changing lessons, provide `config` (especially in first lesson of a combined flow).

## Card Actions in `App.vue`

Handled actions:

- `presentation` -> opens `PresentationModal` with `card.slidesKey` (default `slides`).
- `workbook` -> opens `WorkbookModal`.
- `exit-ticket` -> opens `ExitTicketModal` with lesson-specific questions.
- `external-link` -> `window.open(card.url)` and marks done immediately.
- `activity` -> opens activity via `activityId`/`activityType`.
- `custom` -> marks done only.

`route-assessment` is not handled in current `App.vue` this feature was removed by the user due to being too complex.

## Presentation + Slides

Main file: `src/components/modals/PresentationModal.vue`

- Auto-requests fullscreen on open; closes modal when fullscreen is exited.
- `showDisciplineSlide` prepends an auto-generated `discipline` slide.
  - App enables this for the first presentation card, or when `card.showDiscipline` is set.
- Keyboard:
  - `ArrowRight` / `Space`: advance
  - `ArrowLeft`: back
  - `S`: reveal steps for `steps`, `exercise`, `exercise-cycle`
    - gated by `teacher_unlocked` localStorage and password (`config.groenAntwoord`, fallback `1234`)

Supported slide layouts in renderer:

- `discipline`, `title`, `hero`, `standard`, `steps`, `exercise`, `equation`, `comparison`, `split`, `image-grid`, `big`, `multichoice`, `attention`, `task`, `predict`, `realworld`, `recap`, `summary`, `image-left`, `image-grid-2`, `image-hero`, `celebration`, `exercise-cycle`

Known rendering mismatch:

- `comparison.bottom` exists in lesson data but is currently not rendered.

## KaTeX / Math

- KaTeX is active (`katex` dependency, CSS in `src/main.js`, and in `PresentationModal.vue`).
- `PresentationModal.vue` processes all slide strings recursively and renders inline math wrapped as `\( ... \)`.
- `src/composables/useMathRenderer.js` exists but is currently unused by the main flow.

## Activity System

Registry in `src/composables/useActivitySystem.js`:

- `fillBlanks`
- `hotspot`
- `chemicalBonding`
- `ionicBonding`
- `metalBonding`
- `atomicLattice`

Notes:

- No active DragDrop/CategorySort/Sequence/TrueFalse registry in the current app.
- If activity data is missing, system can still open a component by ID-only fallback.
- Activity completion marks progress as `card-${activityId}`.
  - To sync with timeline completion, card IDs should align with that pattern (or completion will not mark the timeline card done).

## Exit Ticket Behavior

Main file: `src/components/modals/ExitTicketModal.vue`

- Supported question types: `mc`, `open`.
- Modal appends built-in `mood` and `finish` steps after provided questions.
- Open questions require more than 10 characters to continue.

Known mismatch in current lessons:

- Lessons contain `type: 'juist-fout'`, but this type is not supported by the modal.

## Local Storage Keys In Use

- `combined-chemie-bindingen` (planner progress)
- `planner-goals-newton` (goals widget state)
- `planner-show-watermark` (background watermark toggle)
- `teacher_unlocked` (presentation reveal unlock)
- `fill-blanks-progress-...` (FillBlanks activity state)
- `lab-report-data` (lab report composable)

## Global Keyboard Shortcuts

From `src/App.vue`:

- `N` -> toggle name picker
- `C` -> toggle watermark
- `R` -> reset progress

## Design System

Based on current Tailwind and CSS (`tailwind.config.js`, `src/style.css`):

- Font stack:
  - body: `Open Sans`
  - mono accents: `JetBrains Mono`
- Core colors:
  - slate palette (`slate-50` to `slate-900`)
  - brand: `brand.dark` `#0B1120`, `brand.orange` `#F97316`
  - common accents: indigo, amber, emerald, rose, sky
- UI style:
  - rounded cards/modals
  - strong contrast headers
  - timeline beam/glow effects
  - gradients are used in multiple components (do not assume "no gradients")

## Adding / Updating Lessons Safely

- Prefer matching existing combined-flow conventions in `src/App.vue`.
- Use `slidesKey` on presentation cards and keep slide arrays in lesson files.
- Ensure each card has a unique `id` **before** combine prefixing.
- Keep `exitTicket.questions` to `mc`/`open` unless modal support is extended.
- If using activities with completion tracking, align card IDs with `card-${activityId}` or update completion logic.
- Add `config` when possible; toolbox/goals/name-picker integration depends on it.

## Known Issues

- `comparison.bottom` data not rendered in presentation comparison slides.
- `juist-fout` exit-ticket items are present in lessons but unsupported by modal.
- Current lesson files lack `config`; some UI features rely on config fields.

## Useful Paths

- `src/App.vue`
- `src/components/modals/PresentationModal.vue`
- `src/components/modals/ExitTicketModal.vue`
- `src/composables/useActivitySystem.js`
- `src/composables/useProgress.js`
- `src/lessons/chemie-bindingen-les-1.js`
- `src/lessons/chemie-bindingen-les-2.js`
- `src/lessons/chemie-bindingen-les-3.js`
