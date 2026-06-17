---
name: deep-polish
description: Second-pass publisher-quality polish for Vue 3 math activities — design token adoption, metadata, animation hygiene, deep a11y, content QA
source: auto-skill
extracted_at: '2026-06-17T12:55:00.000Z'
---

# Deep Polish for Math Activities (Publisher Quality — Second Pass)

Elevate 117 LPD activities from "functional & polished" to "consistent, intentional, publisher-grade." This skill targets the 5 remaining quality gaps after the initial `ui-polish` pass: **design system adoption**, **metadata & shell**, **animation refinement**, **deep accessibility**, and **content quality assurance**.

Builds on the results of `ui-polish` (KaTeX rendering, celebration components, feedback aria-live, focus management, responsive SVG fixes).

## When to use

- `ui-polish` phase is complete (all 117 files have MathText, SuccessCelebration, aria-live, focus management)
- A design system exists in `tailwind.config.js` (custom `math-*`/`surface-*`/`ink-*` colors, custom shadows) but **0 of 117 files use it**
- You want to eliminate all "vibe coded" visual markers (inconsistent radiuses, shadows, spacing, colors)
- You need the product to pass a publisher-quality review

## Prerequisites

- All 117 `w-activities/LPD*.vue` files exist, at Level 3, with `ui-polish` batch results applied
- `tailwind.config.js` has custom color tokens (`math.*`, `surface.*`, `ink.*`) and custom shadows
- `w-activities/MathText.vue` and `w-activities/SuccessCelebration.vue` exist
- The `builder.mjs` or equivalent Node.js build tool is available for Vue-SFC-aware processing
- Node.js ≥18 is available

## The 5 Gaps (from the "Vibe Coded" report audit)

| Gap | Report Flag | Codebase Finding | Severity |
|-----|-------------|------------------|----------|
| **Design tokens unused** | Generic colors everywhere | 12 color families, 0 use custom palette | 🔴 High |
| **Radius explosion** | Too many border radiuses | 7 variants (sm, base, lg, xl, 2xl, 3xl, full) | 🔴 High |
| **Shadow explosion** | Inconsistent depths | 7 variants (sm, base, md, lg, xl, 2xl, inner) | 🔴 High |
| **Broken spacing rhythm** | No 4/8-point grid | 585× p-3, 268× gap-3 (not on 8px grid) | 🔴 High |
| **Missing metadata** | No OG tags, generic title | Title "Planner", no OG, no description | 🔴 High |
| **Unrefined animations** | Overused ping/pulse | 23× pulse, 1× ping (educational, but noisy) | ⚠️ Medium |
| **SVG a11y missing** | Non-interactive interactive elements | 0/117 files have role=button on SVG clickables | 🔴 High |
| **Content inconsistency** | Varying instruction/feedback quality | Success/error messages vary per file | ⚠️ Medium |

## Execution Strategy

Split into **5 phases**, executed sequentially. Each phase has:
1. A purpose-built script (Vue-SFC-aware replacements)
2. Dry-run mode
3. Git snapshot before execution
4. Concrete verification gates
5. Rollback on verification failure

---

## Phase 1 — Design System Adoption

### 1.1 Build the token migration script

Create `fix_tokens.mjs` in the project root. This script must:
- Parse each Vue SFC into `<template>`, `<script>`, `<style>` sections
- Apply replacements **only** in `<template>` class bindings/attributes and `<style>` blocks
- Skip `<script>` sections (to avoid corrupting JS variable names, string literals)
- Support a `--dry-run` flag (print planned changes, don't write)
- Support a `--revert` flag (restore from backup)

### 1.2 Unified accent color

Replace all 12 ad-hoc accent color families with `math-blue` (the existing design token in `tailwind.config.js`). This matches publisher-standard approach:
- Brilliant.org uses orange consistently
- Pearson uses blue consistently
- Khan Academy uses green consistently

**Replace these in template classes and style blocks:**

| Old class | New class |
|-----------|-----------|
| `bg-amber-*`, `bg-teal-*`, `bg-rose-*`, `bg-pink-*`, `bg-fuchsia-*` | `bg-math-blue` / `bg-math-blue-light` / `bg-math-blue-bg` (preserve shade) |
| `bg-indigo-*`, `bg-purple-*`, `bg-violet-*`, `bg-orange-*` | same |
| `text-amber-*`, `text-teal-*`, `text-rose-*`, `text-pink-*`, `text-fuchsia-*` | `text-math-blue` / `text-math-blue-light` |
| `text-indigo-*`, `text-purple-*`, `text-violet-*`, `text-orange-*` | same |
| `border-amber-*`, `border-teal-*`, etc. | `border-math-blue` / `border-surface-200` |
| `ring-amber-*`, `ring-teal-*`, etc. | `ring-math-blue` |
| `from-amber-*`, `to-amber-*`, etc. | Remove gradients entirely (flat color) |

**Preserve these (not ad-hoc accents):**
- `bg-emerald-*` — feedback success (green)
- `bg-red-*` — feedback error (red)
- `bg-blue-*` — feedback info (blue)
- `bg-slate-*` — neutral backgrounds & surfaces (these get replaced with `surface-*` equivalents in a future pass)
- `text-emerald-*`, `text-red-*`, `text-blue-*` — same feedback purposes

**Shade mapping** (for consistent shading with math-* tokens):
- `*-100` → `*-bg` (background tint: `math-blue-bg`, `math-orange-bg`, etc.)
- `*-200` → `*-light` (border tint: `math-blue-light`)
- `*-500`, `*-600` → base color: `math-blue` / `math-orange` / etc.
- `*-700`, `*-800` → keep as-is or use `ink-DEFAULT`

### 1.3 Standardize border radiuses

Reduce from 7 variants to 3:

| Old | New | Context |
|-----|-----|---------|
| `rounded-sm`, `rounded` (bare) | `rounded-lg` | Default elements |
| `rounded-lg` | keep | Buttons, inputs (primary interactive) |
| `rounded-xl`, `rounded-2xl`, `rounded-3xl` | `rounded-xl` | Cards, containers, panels |
| `rounded-full` | keep | Avatars, level dots, icon containers |

### 1.4 Standardize shadows

Reduce from 7 elevations to 3:

| Old | New | Context |
|-----|-----|---------|
| `shadow-sm`, `shadow` | `shadow-sm` | Default surface |
| `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl` | `shadow-md` | Elevated (modals, dropdown cards) |
| `shadow-inner` | keep | Inset (pressed states, input fields) |

### 1.5 Fix spacing rhythm

Replace off-grid spacing with 8-point equivalents:

| Old (value) | Old (px) | New (value) | New (px) | Rationale |
|-------------|----------|-------------|----------|-----------|
| `p-3` | 12px | `p-4` | 16px | Round up to next 8px increment |
| `gap-3` | 12px | `gap-4` | 16px | Same |
| `space-y-3` | 12px | `space-y-4` | 16px | Same |
| `px-3` / `py-3` | 12px | `px-4` / `py-4` | 16px | Same |
| `mx-3` / `my-3` | 12px | `mx-4` / `my-4` | 16px | Same |

**Exception**: `p-3` in `<svg>` elements or inside interactive controls (sliders, small buttons) may keep `p-3` if `p-4` would break layout. These should be flagged during dry-run and reviewed.

### 1.6 Verification for Phase 1

```bash
echo "=== Phase 1 Verification ==="
echo "Non-math-* accent colors in templates:"
grep -rn 'class="[^"]*bg-amber\|class="[^"]*bg-teal\|class="[^"]*bg-rose\|class="[^"]*bg-pink\|class="[^"]*bg-fuchsia\|class="[^"]*bg-indigo' w-activities/LPD*.vue
# Expected: 0 matches

echo "Disallowed radiuses:"
grep -rn 'rounded-2xl\|rounded-3xl\|rounded-sm\b' w-activities/LPD*.vue
# Expected: 0 matches

echo "Disallowed shadows:"
grep -rn 'shadow-lg\|shadow-xl\|shadow-2xl' w-activities/LPD*.vue
# Expected: 0 matches

echo "p-3 spacing:"
grep -rn '\bp-3\b' w-activities/LPD*.vue
# Expected: 0 matches (or only SVG/control exceptions)

echo "gap-3 spacing:"
grep -rn '\bgap-3\b' w-activities/LPD*.vue
# Expected: 0 matches

echo "All radiuses (should only be: lg, xl, full):"
grep -roh 'rounded-[a-z0-9]*' w-activities/LPD*.vue | sort | uniq -c | sort -rn

echo "All shadows (should only be: sm, md, inner):"
grep -roh '\bshadow[^a-z]\|\bshadow-sm\b\|\bshadow-md\b\|\bshadow-lg\b\|\bshadow-xl\b\|\bshadow-2xl\b\|\bshadow-inner\b' w-activities/LPD*.vue | sort | uniq -c | sort -rn
```

---

## Phase 2 — Shell & Metadata Polish

### 2.1 Update index.html

Replace the minimal `index.html` with a proper shell:

```diff
- <title>Planner</title>
+ <title>Wiskunde — Interactieve Activiteiten | 1e & 2e Graad</title>
+ <meta name="description" content="Interactieve wiskunde-activiteiten voor de 1e en 2e graad van het secundair onderwijs in Vlaanderen. Ontdek algebra, meetkunde, statistiek en meer via ontdekkend leren.">
+ <meta property="og:title" content="Wiskunde — Interactieve Activiteiten">
+ <meta property="og:description" content="Interactieve wiskunde-activiteiten gebaseerd op het leerplan van de 1e en 2e graad.">
+ <meta property="og:type" content="website">
+ <meta property="og:image" content="/og-image.png">
+ <meta name="twitter:card" content="summary_large_image">
```

Remove unused preconnects:
```diff
- <link rel="preconnect" href="https://images.unsplash.com">
- <link rel="preconnect" href="https://www.desmos.com">
```

### 2.2 Verification for Phase 2

```bash
echo "OG tags:"
grep -c 'og:title\|og:description\|og:image' index.html
# Expected: ≥3

echo "Removed preconnects:"
grep 'unsplash\|desmos' index.html
# Expected: 0

echo "Title:"
grep '<title>' index.html
# Expected: descriptive title
```

---

## Phase 3 — Animation & Interaction Refinement

### 3.1 Refine SuccessCelebration component

Edit `w-activities/SuccessCelebration.vue`:

| Property | Before | After | Rationale |
|----------|--------|-------|-----------|
| Confetti particles | 12 | 6 | Less visually noisy |
| Duration | 1500ms | 1000ms | Faster, snappier |
| Replay guard | None | Add `@done` emission + check | Prevent replay on same level |
| Scale | None | Small pop for single tasks, bigger for level completion | Context-appropriate |

### 3.2 Standardize button press feedback

Add `active:scale-[0.98]` to all interactive buttons across 117 files:

```bash
# Add to all buttons, level navigation, and reset buttons
# Target pattern: any element with @click that is a <button>
# For each file, find <button @click=...> and add active:scale to class
```

### 3.3 Tame ping/pulse animations

- `animate-ping` (1 file: LPD28_RadarTarget): Reduce to single ping, add `once` behavior
- `animate-pulse` (23 files): Replace with subtle `animate-fadeIn` where appropriate
- Remove duplicated `animate-fadeIn` keyframe definitions from per-file `<style>` blocks, consolidate to app-level CSS

### 3.4 Verification for Phase 3

```bash
echo "Button press feedback:"
grep -c 'active:scale' w-activities/LPD*.vue
# Expected: 117 (all files)

echo "Ping animations:"
grep -c 'animate-ping' w-activities/LPD*.vue
# Expected: 0 or 1 (intentional)

echo "Pulse animations:"
grep -c 'animate-pulse' w-activities/LPD*.vue
# Expected: reduced from 23

echo "Duplicated fadeIn keyframes:"
grep -c '@keyframes fadeIn' w-activities/LPD*.vue
# Expected: 0 (moved to app-level)
```

---

## Phase 4 — Accessibility Deep Pass

### 4.1 SVG interactive aria attributes

For every LPD file, find SVG elements with `@click` handlers and add:

```vue
role="button"
tabindex="0"
:aria-label="`{{description in Dutch}}`"
@keydown.enter.prevent="sameHandler"
@keydown.space.prevent="sameHandler"
```

**Execution**: Use a single focused agent (not parallel) to process all 117 files sequentially. The agent reads each file, identifies SVG clickable elements (circles, rects, paths, g tags with @click), and adds the attributes. Process files one at a time to avoid race conditions.

Common patterns to look for:
- `<circle @click="handleClick(x, y)">` → most common (radar grids, coordinate systems)
- `<rect @click="handleClick(x, y)">` → grid activities (sieve, Venn, set symbols)
- `<g @click="handleClick(item)">` → drag-drop containers
- `<path @click="handleClick(option)">` → interactive diagrams

### 4.2 Focus-visible outlines

Add `focus-visible:ring-2 focus-visible:ring-math-blue` to all interactive elements:

```bash
# For each file, add focus-visible classes to:
# - Buttons (primary, secondary, reset, level nav)
# - Clickable SVG elements (circles, rects, g)
# - Interactive areas with tabindex
```

### 4.3 Touch target minimums

Ensure all interactive elements meet WCAG minimum touch target (44×44px):

```bash
# For SVG circles/r rects with role="button":
# Add class="min-w-[44px] min-h-[44px]" or adjust existing sizes
# Pay special attention to small (r=6, r=12) clickable SVG circles
```

### 4.4 Verification for Phase 4

```bash
echo "SVG role=button:"
grep -c 'role="button"' w-activities/LPD*.vue
# Expected: 117 (all files have at least one)

echo "Keyboard handlers:"
grep -c 'keydown\.enter\|keydown\.space' w-activities/LPD*.vue
# Expected: ≥100 (files with SVG interactives)

echo "Focus-visible:"
grep -c 'focus-visible' w-activities/LPD*.vue
# Expected: 117

echo "Focus management (from ui-polish batch 3):"
grep -c 'mainArea.value?.focus' w-activities/LPD*.vue
# Expected: 117 (preserved)
```

---

## Phase 5 — Content Quality Assurance

### 5.1 Standardize instruction structure

Ensure every activity has a consistent instruction in the sidebar:
1. **Context**: "Een vijandige onderzeeër is gespot!" (what/why)
2. **Task**: "Klik op de radar op de juiste coördinaten" (what to do)
3. **Interaction hint**: "Gebruik de x-as voor horizontaal, y-as voor verticaal" (how to interact)

This requires reading each file's instruction prop/default and editing the text. Use a batch agent approach with 3 parallel agents, each processing ~39 files.

### 5.2 Standardize feedback language

Standardize success/error messages across all files:

| Type | Prefix | Example |
|------|--------|---------|
| Success | `"Prima! "` or `"Juist! "` | `"Prima! Het antwoord is 12."` |
| Partial | `"Bijna! "` | `"Bijna! Let op de volgorde van bewerkingen."` |
| Error (1st) | `"Niet helemaal... "` | `"Niet helemaal... Kijk naar de richting van de grafiek."` |
| Error (2nd) | `"Bijna! "` | `"Bijna! Je hebt x en y omgedraaid!"` |
| Error (3rd) | `"Probeer dit: "` | `"Probeer dit: stel a = 2 in."` |

Replace hardcoded feedback strings using find+replace for common patterns.

### 5.3 Convert plain-text math to LaTeX

Replace plain-text math notation in feedback strings with LaTeX:

| Plain text | LaTeX |
|------------|-------|
| `a²` | `\(a^2\)` |
| `√36` | `\(\sqrt{36}\)` |
| `a + b = c` | `\(a + b = c\)` |
| `x > 5` | `\(x > 5\)` |
| `3/4` | `\(\frac{3}{4}\)` |

Note: These conversions appear inside Vue template strings like:
```
feedback.value = { type: 'success', text: 'Prima! \(a^2 + b^2 = c^2\)' }
```
The MathText component (from ui-polish) already renders `\(...\)` and `\[...\]` via KaTeX, so any LaTeX-ified feedback will render correctly.

### 5.4 Review gate — math-education-review

Run the `math-education-review` skill on a 20% sample (every 5th file alphabetically):

```bash
for f in $(ls w-activities/LPD*.vue | awk 'NR%5==0'); do
  echo "=== Reviewing $f ==="
  # Invoke math-education-review on this file
done
```

**Review criteria**:
- LaTeX notation is mathematically correct
- Dutch instructions are pedagogically sound
- Feedback messages are appropriate for the difficulty level
- Hint progression (attemptCount) is logical

**Pass threshold**: ≥90% of sampled files must meet all criteria.

### 5.5 Verification for Phase 5

```bash
echo "Standardized success messages:"
grep -l 'Prima\|Juist\|Helemaal juist' w-activities/LPD*.vue | wc -l
# Expected: 117

echo "Files with LaTeX in feedback:"
grep -l '\\\\(' w-activities/LPD*.vue
# Expected: increase from baseline

echo "Review pass rate:"
# Expected: ≥90%
```

---

## Safeguards & Rollback

### Before each phase
```bash
git add -A && git commit -m "backup before deep-polish phase N"
```

### After each phase (on verification pass)
```bash
git add -A && git commit -m "deep-polish phase N complete — summary"
```

### If verification fails
```bash
git reset --hard HEAD~1 && fix && retry
```

### Script safety
- `fix_tokens.mjs` must have `--dry-run` mode
- `--dry-run` shows file-by-file planned changes
- After dry-run review, run without flag to apply
- The script should create a backup directory per file before modifying

## Visual Reference

### Color mapping table for accents

| Tailwind Color | → math-* token | Shade mapping |
|----------------|----------------|---------------|
| `*-100` | `math-blue-bg` | Background tint |
| `*-200`/`*-300` | `math-blue-light` | Border/light accent |
| `*-500`/`*-600` | `math-blue` | Primary accent |
| `*-400`/`*-700`+ | `ink-light` or `ink-muted` | Text on accent |

### Publisher-grade consistency targets

| Element | Value | Source |
|---------|-------|--------|
| Button radius | `rounded-lg` (8px) | Consistent |
| Card radius | `rounded-xl` (12px) | Consistent |
| Default shadow | `shadow-sm` | Tailwind default |
| Elevated shadow | `shadow-md` | Tailwind default |
| Spacing unit | 8px grid | `p-4`, `gap-4`, `space-y-4` |
| Primary accent | `math-blue` (#2563EB) | tailwind.config.js |
| Surface | `surface-*` | tailwind.config.js |
| Text | `ink-*` | tailwind.config.js |

## Key Risks

| Risk | Mitigation |
|------|------------|
| `fix_tokens.mjs` corrupts JS code in `<script>` | Section-aware parsing; only modify `<template>` class attrs and `<style>` blocks |
| Color replacement changes semantic meaning (e.g. red=error) | Exclude feedback colors (emerald, red, blue) from accent replacement |
| Domain-specific color coding desired | Use unified `math-blue` — consistent with publisher standards (Brilliant.org, Pearson) |
| SVG a11y attributes break activity interactions | Test 5 high-complexity files after Phase 4 |
| LaTeX in feedback produces rendering errors | Rely on existing `renderMath()` error handling; test 3 files visually |
