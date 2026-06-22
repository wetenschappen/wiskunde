# Handover — Activity Improvement Project

> Date: 2026-06-22
> Context: Session completed. 117/117 files now touched. Build passes.

---

## Project Goal

Improve all 117 Vue 3 activities in `w-activities/` to prove LPD (leerplandoel) achievement to government inspectors. Each activity needs the **8-element pedagogical pattern**:

1. **Worked example** (indigo-50 box, click-to-reveal steps, level 0 only)
2. **Prediction gate** (amber-50 box with PhBrain icon, force commitment before interaction)
3. **3-level method-teaching hints** (Hint 1: conceptual, Hint 2: different-numbers example, Hint 3: method with BLANK — NEVER give answer)
4. **"Waarom werkt dit?"** (2-3 Dutch sentences after success, indigo-100 box with PhLightbulb)
5. **"Let op!" error analysis** (2-3 specific misconceptions, detected BEFORE success check)
6. **Deep reflection** (structural "waarom" question, only on last level)
7. **Blooms labels** "(Toepassen)" L0, "(Analyseren)" L1, "(Evalueren)" L2
8. **LPD evidence** — student confirms they reached the goal

---

## What's Been Done (10 commits on `main`)

| Commit | Files | What |
|---|---|---|
| `926b0a4` | 59 | Scaffolding shell (prediction/reflection/worked example refs) |
| `fcc3aeb` | 64 | Full 8-element: logic(6), algebra(13), geometry(17), vector/stats(10), restored(18) |
| `cecd1ed` | +6 | PythagorasVisual, BalloonMath, RealNumbers, OrderingReals, NumberLine |
| `288178f` | +1 | HundredGrid |
| `ab72b16` | **+1** | LPD05_SenseOfScale — full 8-element rewrite |
| `26678e4` | **+1** | LPD13_DiscountBar — full 8-element rewrite |
| `f53d287` | **+1** | LPD14_SquareRoot — full 8-element rewrite |
| `dd09515` | **+2** | LPD34_DirectProportion + LPD34_InverseProportion — full 8-element rewrites |
| `5ad73bd` | **+1** | LPD11_2_TrigRatios — full 8-element rewrite |
| `ef60efa` | **+45** | Bloom's labels (levelLabels) + LPD evidence markers injected |
| **Total** | **117/117** | **all files touched** |

### Deep-8 rewrites done this session (6 files):
- LPD05_SenseOfScale — drag-drop units with worked example, prediction, 3-level hints, why, error analysis, reflection
- LPD11_2_TrigRatios — click triangle sides with SOS CAS TOA prediction
- LPD13_DiscountBar — bar model discount with prediction gate
- LPD14_SquareRoot — slider + SVG grid with why/reflection
- LPD34_DirectProportion — table + graph prediction
- LPD34_InverseProportion — hyperbola exploration with formula classification

### Remaining gaps in 59 shell files (from `926b0a4`):

**Bloom's labels + LPD evidence**: DONE (injected into all 59 shell files in `ef60efa`)

**"Waarom werkt dit?" explanation blocks**: ~25 files still lack the template block.
The template injection approach is fragile (breaks div nesting) and needs per-file attention.
Files that currently have it: LPD16_EqualSign (in feedback text), LPD04_DigitalRuler (in feedback text)

**"Let op!" error analysis blocks**: ~7 files still lack specific error detection.
These need targeted per-file addition as `errorDetected` refs with specific misconception text.

---

## Key Rules for the Next Agent

### CRITICAL: Never minify Vue templates
- Every HTML tag on its own line
- No backtick template literals inside `:style` bindings — use computed properties
- No nested template literals with ternary operators (breaks Vue parser)

### Implementation pattern
- Props: isOpen, title, instruction, currentStep, totalSteps, fullscreen(false!), icon
- Emits: close, complete, update:currentStep
- Import: `{ ref, computed, watch, nextTick, onMounted, onUnmapped }` from 'vue'
- Icons: `{ PhX, PhCheckCircle, PhWarningCircle, PhArrowRight, PhArrowClockwise, PhBookOpen, PhBrain, PhLightbulb, PhChatCircleText, PhPencilSimpleLine }` from `@phosphor-icons/vue`
- `MathText` from `./MathText.vue`, `SuccessCelebration` from `./SuccessCelebration.vue`
- NO requestFullscreen/exitFullscreen. fullscreen: false
- Colors: amber-* primary, slate-* structure, emerald-* success, red-* errors, indigo-* reflection
- `tabular-nums` on numbers, `animate-fadeIn` for transitions (0.3s ease-out)
- Dutch text, math in `\(...\)` KaTeX

### Hint rule (most important)
- Hint 1: conceptual direction + formula reminder (no specific values)
- Hint 2: worked example with DIFFERENT numbers
- Hint 3: method with actual numbers, but LAST STEP LEFT AS BLANK (`___`)
- **NEVER** give the exact answer in any hint

### Commit workflow
1. Write/improve files
2. `npm run build` — must pass
3. `git add w-activities/<files>` + `git commit` after each batch

### Reference files for patterns
- LPD16_OrderOfOps.vue — clean 8-element example with all features
- LPD05_SenseOfScale.vue — drag-drop with full pedagogy (this session)
- LPD20_BalanceTriangle.vue — good geometry reference

---

## Files That Still Need Why + Error Analysis (Priority)

### 6 files needing both why AND error analysis:
LPD04_DigitalRuler, LPD11_FractionArea, LPD16_EqualSign, LPD18_Diagonals, LPD21_CityMap, LPD37_2_ChartSelection

### 19 files needing why explanation only:
LPD03_2_FunctionGrapher, LPD04_Protractor, LPD05_AreaConversion, LPD09_MatchingFractions, LPD10_GCDRuler, LPD10_LCMFrogs, LPD19_2_Inequalities, LPD21_2_FunctionMachine, LPD23_2_LinearRepresentations, LPD24_2_LinearFeatures, LPD26_2_SystemsGraphically, LPD35_DataDetective, LPD36_FrequencyTable, LPD36_OutlierEffect, LPD38_2_BoxplotFeatures, LPD39_2_MisleadingStats, LPD40_2_ScatterCorrelation, LPD_B3_LineEquations, LPD_B4_RelativePositions

### 7 files needing error analysis only:
LPD03_DynamicGeometry, LPD07_SetSymbols, LPD18_ParallelAngles, LPD19_QuadHierarchy, LPD19_TriangleGrid, LPD20_2_FormulaManipulation, LPD32_PerfectSquare

### Key approach for why/error injection:
- Add `showWhy` ref + `whyText` ref + `errorDetected` ref in script section
- Add `function showWhyExplanation(text) { showWhy.value = true; whyText.value = text }`
- Call `showWhyExplanation()` on success before setting feedback
- Add the template block inside the left sidebar's `overflow-y-auto` div, NOT by splitting existing div tags
- The template block should be inserted right before the bottom controls div, not by modifying it
