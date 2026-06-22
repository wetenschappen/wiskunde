# TODO: Activity Rewrite Progress

> Last updated: 2026-06-21 — ALL 17 ACTIVITIES COMPLETE

## ✅ Completed (17 activities)

### Phase 1 — Slider Predict-First + Full Rewrites (7)

| # | Activity | Key improvement |
|---|---|---|
| 1 | `LPD33_2_Discriminant.vue` | Constraint-based levels + predict D first + reflection |
| 2 | `LPD15_2_TrigCircle.vue` | Predict quadrant/angle + reverse reasoning + reflection |
| 3 | `LPD08_2_SimilarityScale.vue` | Calculate k first → slider as confirmation + inequality/reverse levels |
| 4 | `LPD06_2_OrderingReals.vue` | Convert-to-decimal gate + partial-placement + error-find levels |
| 5 | `LPD13_DiscountBar.vue` | Price-per-block calculation gate + reverse + two-step comparison |
| 6 | `LPD10_2_PythagorasVisual.vue` | Area calculation gates before drag-and-drop + reflection |
| 7 | `LPD22_2_SlopeLinear.vue` | Predict slope 'a' first → slider confirms + reflection |

### Phase 2 — Prediction Gates Added (7)

| # | Activity | Key improvement |
|---|---|---|
| 8 | `LPD14_SquareRoot.vue` | Predict √ answer first → slider confirms |
| 9 | `LPD11_BalloonMath.vue` | Predict balloon up/down before action button |
| 10 | `LPD34_InverseProportion.vue` | Predict "if x doubles, y halves?" before formula selection |
| 11 | `LPD11_2_TrigRatios.vue` | SOS/CAS/TOA formula gate before clicking triangle sides |
| 12 | `LPD31_SquareNumbers.vue` | Pattern-type identification gate before number fill |
| 13 | `LPD08_NumberLine.vue` | Convert-fraction-to-decimal gate before sorting |
| 14 | `LPD09_HundredGrid.vue` | Calculate-squares-of-100 gate before grid coloring |

### Phase 3 — Post-Success Reflection Added (3)

| # | Activity | Key improvement |
|---|---|---|
| 15 | `LPD34_DirectProportion.vue` | Reflection: time × speed formula identification |
| 16 | `LPD05_SenseOfScale.vue` | Reflection: pick hardest unit to estimate |
| 17 | `LPD12_AbsoluteValue.vue` | Level 3: \|x\| = a has TWO solutions |

### Documentation

| File | Purpose |
|---|---|
| `PLAN.md` | Analysis of systemic problems |
| `TODO.md` | This file |
| `HINT_TEMPLATE.md` | Reusable 3-level hint pattern |

## Patterns Applied

### Predict → Set → Verify (for sliders / interactive elements)
1. **Predict**: Student calculates/identifies the answer first (without slider/tool)
2. **Set**: Interactive element auto-confirms the correct value
3. **Verify**: Student can still explore with the tool after

### Calculation Gates (for visual / drag-drop activities)
1. Student calculates a required value first (area, decimal, fraction-of-100, etc.)
2. Correct calculation unlocks the interactive element
3. Wrong answer provides method-teaching hints (3 levels deep)

### Post-Success Reflection
1. 1-question check before advancing to next level
2. Targets the key conceptual insight of the activity
3. MC with specific wrong-answer feedback per option
