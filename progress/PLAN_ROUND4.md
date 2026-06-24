# PLAN — Round 4: Color & Interaction Overhaul

> Date: 2026-06-22  
> Problem: Color scheme (amber/grey/navy) almost nowhere respected. Animations and interactions are broken/rough.

---

## Key Constraint: White Canvas for Classroom Readability

The right-panel visualization area (SVG canvas, graphs, bar models, number lines) must use a **primarily white background** — projectors in classrooms wash out dark backgrounds. The amber/grey/navy accent scheme applies to **UI chrome** (buttons, headers, feedback cards), not the data-display area.

**Rule of thumb:**
- **UI chrome** (sidebar, header, buttons, feedback): Use `amber` accents on `white`/`slate-50` backgrounds
- **Canvas** (SVG, graphs, models): `bg-white` with subtle `slate-100`/`slate-200` grid lines — dark elements (`slate-700`, `slate-800`) for data, amber only for highlights/annotations
- **Keep high contrast** for readability at the back of a classroom

---

## Audit Findings

### Color Mismatch (Project scheme vs w-activities)

| Token | Defined (tailwind.config) | Used in w-activities |
|---|---|---|
| `brand-orange` / `amber-500` | #F97316 / #F59E0B | **0 occurrences** (only in ActivityTester) |
| `brand-dark` | #0B1120 | **0 occurrences** |
| `ink` | #1E293B | **0 occurrences** |
| `math-blue` | #2563EB | Only in headers (icon bg, level dots) |
| — | — | ✅ `indigo` everywhere (prediction, reflection, buttons) |
| — | — | ✅ `teal` (sliders, prediction input) |
| — | — | ✅ `pink` / `f43f5e` / `ec4899` (TrigCircle SVG) |
| — | — | ✅ `emerald` (success, SVG accents) |
| — | — | ✅ `blue` (feedback info, worked examples) |

### Canvas Issues (White Background Priority)

1. **Discriminant**: SVG background `bg-white/90` — OK but use solid `bg-white`
2. **TrigCircle**: SVG background `bg-white rounded-full` — OK
3. **SlopeLinear**: SVG background `bg-white/90` — use solid `bg-white`
4. **SimilarityScale**: Visual container `bg-slate-100` — should be `bg-white`
5. **PythagorasVisual**: Squares use various colors — canvas area should be `bg-white`
6. **DiscountBar**: Pattern grid `bg-slate-50` — use `bg-white` with subtle grid
7. **OrderingReals**: Number line on `bg-slate-100` — use `bg-white`

### Animation/Interaction Issues

1. **`transition-all duration-150/100`** — too fast, feels janky, no easing
2. **`ring-pulse-amber` animation** — uses `#fbbf24` (yellow) with just 3 cycles on open, then never again
3. **SuccessCelebration** — emerald green + rainbow confetti (wrong palette), confetti is just 12 tiny dots
4. **No hover/before states on SVG elements** — no feedback on interactive SVG parts
5. **Prediction gate unlocks** pop in instantly — no smooth transition
6. **Sliders** — no value tooltip, no snap feedback
7. **Drag-drop** — no visual feedback during drag, no shake on wrong placement
8. **Feedback cards** — no entrance stagger, no emphasis animation

---

## Plan

### Phase A: Fix Color Scheme (All 7 files + SuccessCelebration)

Replace every non-compliant color with amber/slate/navy equivalents.

#### A.0 Canvas background pass (all 7 files)
- Ensure every SVG/visualization container uses `bg-white` (not `bg-slate-100` or `bg-white/90`)
- Grid lines: use `stroke-slate-200` (subtle), not `stroke-slate-300`
- Annotations/labels: use `fill-slate-700` (not `fill-slate-500`)
- Highlight elements: use `amber-400`/`amber-500` sparingly — only for active data, current values, or key annotations
- Axes: `stroke-slate-400` (not `stroke-slate-500`)

#### A.1 Prediction sections (currently `indigo-*`, `teal-*`, `blue-*`)
- `border-2 border-indigo-200 bg-indigo-50` → `border-2 border-amber-200 bg-amber-50`
- `text-indigo-600` → `text-amber-600`
- `text-indigo-800` → `text-amber-800`
- `bg-indigo-600 hover:bg-indigo-500` → `bg-amber-600 hover:bg-amber-500`
- `focus:border-indigo-500` → `focus:border-amber-500`
- `accent-indigo-600` → `accent-amber-500`

#### A.2 Feedback areas (currently `blue-*`, `emerald-*`, `red-*`)
- Info: `bg-blue-100 text-blue-800 border-blue-400` → `bg-slate-100 text-slate-800 border-slate-400`
- Success: `bg-emerald-100 text-emerald-800 border-emerald-400` → `bg-amber-50 text-amber-800 border-amber-400`
- Error: Keep `bg-red-100 text-red-800 border-red-400` (red is universal)
- Hint: `bg-amber-50 border-amber-200` → Keep amber (already correct)

#### A.3 Reflection cards (currently `indigo-*`)
- `bg-indigo-50 border-indigo-200 border-l-indigo-400` → `bg-slate-100 border-slate-300 border-l-slate-800`

#### A.4 Button colors (currently `teal-600`, `emerald-600`, mixed)
- Primary actions → `bg-amber-500 hover:bg-amber-600 text-white`
- Secondary → `bg-slate-800 hover:bg-slate-700 text-white`
- Toggle/reset → `bg-white border border-slate-200 hover:bg-slate-100`

#### A.5 SuccessCelebration
- Change from `bg-emerald-500` green check to brand-consistent look
- Use `bg-amber-500` with `text-white` checkmark
- Confetti particles: use amber/slate/navy color palette instead of rainbow

#### A.6 SVG accent colors
- **TrigCircle**: `#ec4899` (pink) → `#f97316` (amber), `#f43f5e` (rose) → `#f59e0b` (amber)
  - `#10b981` (emerald) → `#0f172a` (navy/slate-900)
  - `#3b82f6` (blue) → `#64748b` (slate-500)
- **SimilarityScale**: `bg-emerald-500/600` → `bg-amber-500/600`
- **Discriminant**: `#0f766e` (teal) → `#f97316` (amber), `stroke="#ef4444"` → keep (red for error)
- **SlopeLinear**: `#0d9488` (teal) → `#f97316` (amber), `#3b82f6` (blue) → `#64748b` (slate)

---

### Phase B: Fix Animations & Interactions (All 7 files)

#### B.1 Consistent easing curve
- Replace all `transition-all duration-150`, `duration-100`, `duration-300`
- Standardize to: `transition-all duration-200 ease-out`
- SVG elements: Keep `transition-all duration-200`

#### B.2 Gate unlock transition
- When prediction passes → content fades in with `scale-95 → scale-100` + opacity
- Use Vue `<Transition>` with custom classes

#### B.3 Slider polish
- Add custom thumb styling (Brilliant.org style — large visible circle, shadow)
- On snap to correct value: brief amber glow

#### B.4 Feedback entrance
- Error: brief red border flash + subtle shake
- Success: brief green border flash + scale bounce
- Info: fade-in only (no flash)

#### B.5 Drag-drop feedback (OrderingReals, PythagorasVisual)
- On drag start: item gets `shadow-lg scale-105`
- On dragover: drop zone gets `border-amber-400 bg-amber-50`
- On correct drop: subtle scale bounce
- On wrong drop: subtle horizontal shake

#### B.6 Remove ring-pulse-amber on load
- Currently plays 3 times when activity opens — feels frantic
- Replace with a single subtle scale pulse on the header icon only

#### B.7 SuccessCelebration overhaul
- Replace emerald check with dark navy circle + amber checkmark
- Confetti: Use geometric shapes (triangle, square, circle) in amber/slate tones
- Animation: `scale-0 → scale-100` with spring easing
- Total duration: 1.2s

#### B.8 Remove `animate-ping` from celebration
- Replace with SVG stroke-dashoffset checkmark draw animation

---

### Phase C: Consistency Pass

1. **Prediction section**: Unified amber border/background across all 7 activities
2. **Feedback footer**: Unified layout — reset button (left) + action button (right)
3. **Slider styling**: Custom thumb (24px circle with white border + shadow)
4. **Goal card**: Use `border-amber-200 bg-amber-50/50` instead of `bg-math-blue-bg`

---

## Execution Order

```
Phase A (colors) → Phase B (animations) → Phase C (consistency) → Test in ActivityTester
```

**Estimated scope**: ~80-120 edits across 7 files + 1 shared component

---

## Files Affected

1. `w-activities/LPD33_2_Discriminant.vue`
2. `w-activities/LPD15_2_TrigCircle.vue`
3. `w-activities/LPD08_2_SimilarityScale.vue`
4. `w-activities/LPD06_2_OrderingReals.vue`
5. `w-activities/LPD10_2_PythagorasVisual.vue`
6. `w-activities/LPD22_2_SlopeLinear.vue`
7. `w-activities/LPD13_DiscountBar.vue`
8. `w-activities/SuccessCelebration.vue`

---

## Success Criteria

- [ ] No indigo, teal, pink, or emerald accent colors remain in any of the 7 activities
- [ ] Only amber (#F97316/#F59E0B), slate, navy (#0B1120), and red (for errors) are used
- [ ] Canvas areas use primarily white backgrounds with high contrast elements
- [ ] All transitions use `duration-200 ease-out`
- [ ] Gate unlock animation is smooth (scale + opacity)
- [ ] Slider interaction feels polished (custom thumb, snap feedback)
- [ ] Disabled state is visually muted but readable
- [ ] SuccessCelebration is brand-consistent (navy + amber, no rainbow)
- [ ] Drag-drop has visual feedback during interaction
