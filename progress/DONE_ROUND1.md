# DONE — Round 1 Activity Improvements

> Completed: 2026-06-21
> Status: All 17 activities modified

---

## Summary

Round 1 focused on fixing the most critical pedagogical issues:
- Slider activities that rewarded random scanning
- Activities with no cognitive progression between levels
- Hints that collapsed to giving the answer

**Overall score: 4.5/10** (up from ~2/10 before Round 1)

---

## Completed Tasks

### Phase 1: Predict-First Pattern (7 activities)

Applied the "Predict → Set → Verify" pattern to slider-based activities:

- ✅ **LPD33_2_Discriminant.vue** — Predict D before adjusting sliders
- ✅ **LPD15_2_TrigCircle.vue** — Predict quadrant before setting angle
- ✅ **LPD08_2_SimilarityScale.vue** — Calculate k before confirming with slider
- ✅ **LPD22_2_SlopeLinear.vue** — Calculate slope before setting slider
- ✅ **LPD14_SquareRoot.vue** — Calculate √ before sliding
- ✅ **LPD11_BalloonMath.vue** — Predict up/down before action
- ✅ **LPD34_InverseProportion.vue** — Predict relationship before formula selection

**Pattern:** Student must calculate/predict the answer before the interactive element becomes available. The visual then serves as confirmation, not discovery.

---

### Phase 2: Calculation Gates (3 activities)

Added calculation requirements before visual/drag interactions:

- ✅ **LPD10_2_PythagorasVisual.vue** — Calculate a², b², c² before drag-and-drop
- ✅ **LPD13_DiscountBar.vue** — Calculate pricePerBlock before cutting
- ✅ **LPD09_HundredGrid.vue** — Calculate squares before coloring

**Pattern:** Student must perform the mathematical calculation first. The visual model unlocks only after correct calculation.

---

### Phase 3: Cognitive Level Progression (3 activities)

Reworked levels from "same task, different numbers" to genuine cognitive progression:

- ✅ **LPD33_2_Discriminant.vue**
  - Level 1: Given a, b, find c so D = 0 (apply)
  - Level 2: Given a and vertex, find b and c (analyze)
  - Level 3: Find a, b, c satisfying multiple constraints (evaluate/create)

- ✅ **LPD06_2_OrderingReals.vue**
  - Level 1: Convert fractions to decimals, then sort (apply)
  - Level 2: Some items pre-placed, find missing positions (analyze)
  - Level 3: Find and fix the error in a given ordering (evaluate)

- ✅ **LPD13_DiscountBar.vue**
  - Level 1: Direct discount calculation (apply)
  - Level 2: Reverse discount (find % from prices) (analyze)
  - Level 3: Compare 40% vs 2×20% (evaluate)

**Pattern:** Each level requires a different cognitive skill, following Bloom's taxonomy.

---

### Phase 4: Post-Success Reflection (4 activities)

Added reflection questions after success:

- ✅ **LPD34_DirectProportion.vue** — "Which operation?" reflection
- ✅ **LPD05_SenseOfScale.vue** — "Which unit was hardest?" reflection
- ✅ **LPD12_AbsoluteValue.vue** — Level 3 tests |x| = a has two solutions
- ✅ **LPD31_SquareNumbers.vue** — Pattern identification gate

**Pattern:** After success, student must answer a conceptual question before advancing.

---

## Files Modified

### Full Rewrites (7 files)
1. `w-activities/LPD33_2_Discriminant.vue`
2. `w-activities/LPD15_2_TrigCircle.vue`
3. `w-activities/LPD08_2_SimilarityScale.vue`
4. `w-activities/LPD06_2_OrderingReals.vue`
5. `w-activities/LPD13_DiscountBar.vue`
6. `w-activities/LPD10_2_PythagorasVisual.vue`
7. `w-activities/LPD22_2_SlopeLinear.vue`

### Prediction Gates Added (7 files)
8. `w-activities/LPD14_SquareRoot.vue`
9. `w-activities/LPD11_BalloonMath.vue`
10. `w-activities/LPD34_InverseProportion.vue`
11. `w-activities/LPD34_DirectProportion.vue`
12. `w-activities/LPD11_2_TrigRatios.vue`
13. `w-activities/LPD31_SquareNumbers.vue`
14. `w-activities/LPD12_AbsoluteValue.vue`

### Calculation Gates Added (3 files)
15. `w-activities/LPD09_HundredGrid.vue`
16. `w-activities/LPD08_NumberLine.vue`
17. `w-activities/LPD05_SenseOfScale.vue`

---

## Documentation Created

- ✅ `w-activities/PLAN.md` — Analysis of systemic problems
- ✅ `w-activities/TODO.md` — Round 1 task tracker
- ✅ `w-activities/HINT_TEMPLATE.md` — Method-teaching hint pattern (documented but not fully applied)
- ✅ `progress/REVIEW.md` — Round 1 pedagogical review
- ✅ `progress/PLAN_ROUND2.md` — Round 2 improvement plan

---

## What We Learned

### What Worked
- **Predict-first pattern** is highly effective — prevents random scanning
- **Calculation gates** force mathematical thinking before visual confirmation
- **Cognitive progression** makes levels genuinely different, not just harder numbers

### What Didn't Work
- **Hints still give answers** — we documented the fix but didn't apply it consistently
- **Missing "why" explanations** — activities enforce procedure without conceptual understanding
- **Shallow reflections** — questions test calculation, not structural understanding
- **No worked examples** — students jump straight to tasks without seeing the method
- **No error analysis** — common misconceptions aren't addressed

---

## Metrics

| Metric | Before Round 1 | After Round 1 | Target (Round 2) |
|---|---|---|---|
| Predict-first pattern | 0/17 | 7/17 | 10/17 |
| Calculation gates | 0/17 | 3/17 | 5/17 |
| Cognitive progression | 2/17 | 5/17 | 10/17 |
| Post-success reflection | 0/17 | 4/17 | 17/17 |
| Method-teaching hints | 0/17 | 0/17 | 17/17 |
| Conceptual explanations | 0/17 | 0/17 | 17/17 |
| Worked examples | 0/17 | 0/17 | 17/17 |
| Error analysis | 0/17 | 0/17 | 17/17 |
| **Overall score** | **~2/10** | **4.5/10** | **8+/10** |

---

## Next Steps

See `progress/PLAN_ROUND2.md` for detailed Round 2 plan.

**Priority order:**
1. Fix hints (apply method-teaching pattern)
2. Add "why" explanations
3. Add worked examples
4. Deepen reflection questions
5. Add error analysis for common misconceptions

**Estimated effort:** 14-19 hours
