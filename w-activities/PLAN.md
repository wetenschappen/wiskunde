# PLAN.md — Improving w-activities Depth & Rigour

> Analysis date: 2026-06-21
> Scope: 130+ activity files in `w-activities/`, evaluated via representative sample of 7

---

## 1. Problem Summary

The activities are visually polished and structurally consistent, but suffer from three systemic issues that let students pass through without genuine mathematical thinking.

### Problem A: Slider activities reward random scanning

**Affected:** TrigCircle, SimilarityScale, Discriminant (and likely all other slider-based activities)

**What happens:** The student drags a slider back and forth. The `watch()` auto-checks on every change. When the value hits the target, the success message fires. The student never performs a single calculation.

**Concrete examples:**
- `LPD08_2_SimilarityScale.vue` — slider has only 6 positions (0.5, 1.0, 1.5, 2.0, 2.5, 3.0). A student sweeps through all 6 in 10 seconds. The "challenge" is reading the goal text ("maak de oppervlakte 4x zo groot") and matching it to the right position.
- `LPD15_2_TrigCircle.vue` — Level 1 says "Draai de hoek naar 30°." The student drags until they see 30°. No trigonometric reasoning involved.
- `LPD33_2_Discriminant.vue` — Three sliders (a, b, c) with auto-check. Student can randomly adjust until the parabola visually crosses the x-axis the right number of times.

**Root cause:** The slider is both the input mechanism AND the verification mechanism. The student doesn't need to predict or calculate — they just scan.

### Problem B: Levels are cosmetic, not progressive

**Affected:** All activities (universal pattern)

**What happens:** Every activity has `totalInternalLevels = 3` with a level indicator in the header. But in most cases, the 3 levels are the same interaction with different random numbers:

| Activity | Level 1 | Level 2 | Level 3 | Real progression? |
|---|---|---|---|---|
| SimilarityScale | Find k for area factor X | Find k for area factor Y | Find k for area factor Z | No — identical task |
| TrigCircle | Go to angle X° | Go to angle in Q3 | Go to angle in Q2 with constraint | Marginal — different quadrant |
| Discriminant | Make D > 0 | Make D = 0 | Make D < 0 | No — same skill, reversed |
| OrderingReals | Sort fractions | Sort with irrationals | Sort negative irrationals | No — same skill, harder numbers |
| PythagorasVisual | Compute c² | Find missing b² | Compute all from sides | **Yes** — genuine scaffolding |
| LinearEqBalance | ax + b = c | ax on both sides | Fraction in equation | **Yes** — new technique per level |
| DiscountBar | 10-30% discount | 20-40% discount | 30-50% discount | No — same procedure |

PythagorasVisual and LinearEqBalance are the exceptions — they actually require new reasoning at each level. The rest just reshuffle the deck.

**Root cause:** The level system was designed as "3 rounds of the same game" rather than "3 stages of increasing cognitive demand."

### Problem C: Hints collapse to "here's the answer"

**Affected:** All activities with hint systems (most of them)

**What happens:** The hint escalation follows a predictable pattern:
1. Hint 1: Vague direction ("Kijk goed naar de cirkel")
2. Hint 2: More specific ("De sinus is de y-waarde")
3. Hint 3: **Literal answer** ("Probeer a=1, b=0, c=-4")

The third hint in Discriminant literally gives the parameter values. The third hint in OrderingReals gives the full sorted order. Students quickly learn that pressing "hint" 3 times is faster than thinking.

**Root cause:** Hints are designed as a linear escalation to full disclosure, rather than as scaffolding that teaches the method.

---

## 2. Detailed Findings Per Activity (Sampled)

### LPD08_2_SimilarityScale.vue — Similarity & Scale
- **Type:** Slider auto-check
- **Problem:** 6 discrete slider positions. Goal text tells you the target area factor. Student just matches k² to the target.
- **Missing:** No intermediate calculation. Student never computes k² themselves.
- **Severity:** HIGH — trivially solvable without thought.

### LPD15_2_TrigCircle.vue — Trigonometric Circle
- **Type:** Slider auto-check
- **Problem:** Level 1 gives the exact target angle. Level 2 gives sin(α) and asks to find the angle — still just scanning.
- **Missing:** No prediction ("what quadrant is sin negative and cos positive?"), no reverse reasoning.
- **Severity:** HIGH — the unit circle is a rich concept reduced to "find the number on the slider."

### LPD33_2_Discriminant.vue — Discriminant & Roots
- **Type:** 3-slider auto-check with debounce
- **Problem:** Visual parabola updates in real-time. Student can see when roots appear/disappear without computing D.
- **Missing:** No requirement to calculate D. No constraint that forces specific values.
- **Severity:** HIGH — the discriminant is a calculation skill, but the activity makes calculation optional.

### LPD10_2_PythagorasVisual.vue — Pythagoras (Areas)
- **Type:** Drag-and-drop with auto-check
- **Strength:** Genuine 3-level progression (given areas → find missing → compute all).
- **Problem:** Student can still trial-and-error with the provided number options. No requirement to compute a² before placing it.
- **Severity:** MEDIUM — strongest activity sampled, but could be stronger.

### LPD18_2_LinearEqBalance.vue — Linear Equations (Balance)
- **Type:** Operation selection + apply
- **Strength:** Requires sequential decision-making. Each operation changes the state.
- **Problem:** The visual balance doesn't explain WHY the operation preserves equality. Student can learn the procedure without understanding the principle.
- **Severity:** LOW — already the most cognitively demanding pattern.

### LPD06_2_OrderingReals.vue — Ordering Real Numbers
- **Type:** Drag-and-drop ordering
- **Problem:** Levels differ only in number type (fractions → irrationals → negative irrationals). The skill (comparing magnitudes) is identical.
- **Missing:** No conversion step, no error analysis, no partial-placement challenges.
- **Severity:** MEDIUM — the drag-and-drop is fine, but levels need differentiation.

### LPD13_DiscountBar.vue — Percentage Discount
- **Type:** Click-to-cut + input answer
- **Problem:** The bar model is purely visual. After clicking "knip af," the remaining blocks are counted visually. The student never calculates pricePerBlock × remainingBlocks themselves — they can just count blocks.
- **Severity:** MEDIUM — the visual model is helpful but makes calculation optional.

---

## 3. Proposed Improvements

### Improvement A: Predict → Set → Verify (for slider activities)

**Applies to:** SimilarityScale, TrigCircle, Discriminant, and any activity with slider-based auto-check.

**Pattern:**
1. **Predict phase** (before touching the slider): Show the current state. Ask a conceptual question about what will happen if a parameter changes. Multiple choice or short answer. Must answer correctly to proceed.
2. **Set phase** (slider interaction): Now adjust the slider to achieve the goal. But add a constraint — e.g., "You must use a = 2" or "k must be a whole number."
3. **Verify phase** (after success): Ask the student to state what they observed. "When k went from 1 to 3, the area factor went from ___ to ___."

**Why it works:** The student must reason BEFORE the visual feedback helps them. The slider becomes a verification tool, not a discovery crutch.

### Improvement B: Constraint-based level design

**Applies to:** Discriminant, SimilarityScale, and other parameter-exploration activities.

**Pattern:** Instead of "make D > 0" (open-ended, scannable), give constraints that require calculation:
- Level 1: "Given a=1, b=6. Find c so that D = 0." (one unknown → direct calculation: c = b²/4a = 9)
- Level 2: "Given a=1. Choose b and c so that D = 0 AND the vertex is at x = -3." (two constraints → b = -2·a·x_top = 6, then c = b²/4a = 9)
- Level 3: "Find a, b, c so that D < 0 AND f(0) = 5 AND f(1) > 0." (system of conditions)

**Why it works:** Constraints eliminate the possibility of random scanning. The student must set up and solve equations.

### Improvement C: Scaffolded subtasks (replace cosmetic levels)

**Applies to:** OrderingReals, DiscountBar, and other activities where levels are "same task, different numbers."

**Pattern:** Each level tests a different cognitive skill:
- Level 1 — **Execution**: Perform the core task (sort the numbers)
- Level 2 — **Analysis with partial info**: Some items are pre-placed. Find the error or complete the missing parts.
- Level 3 — **Error analysis / justification**: A completed ordering is shown with one deliberate mistake. Find and fix it. Explain why it's wrong.

**Why it works:** Bloom's taxonomy progression. Level 3 (evaluation) is cognitively orders of magnitude harder than Level 1 (execution), even with the same content.

### Improvement D: Intermediate calculation gates

**Applies to:** PythagorasVisual, DiscountBar, and other activities where the visual makes computation optional.

**Pattern:** Before the interactive element activates, require the student to compute one or more intermediate values:
- PythagorasVisual: "Calculate a² = ___" and "b² = ___" (input fields). Only after correct values are entered do the drag options appear.
- DiscountBar: "What is the value of one block (10%)? €___" before the cut button activates.

**Why it works:** Forces the calculation step that the visual would otherwise make unnecessary.

### Improvement E: Method-teaching hints (replace answer-revealing hints)

**Applies to:** All activities with hint systems.

**Pattern:** Replace the 3-hint escalation (vague → specific → answer) with:
1. Hint 1: Conceptual direction ("Think about what D = b² - 4ac tells you about the roots.")
2. Hint 2: Worked example with DIFFERENT numbers ("If a=1, b=5, c=6, then D = 25 - 24 = 1 > 0, so 2 roots. Now apply this to your problem.")
3. Hint 3: Step-by-step method with the actual numbers, but the final step is left blank for the student to complete.

**Why it works:** Teaches the method rather than handing over the answer. The student still has to execute the final step.

### Improvement F: Post-success reflection

**Applies to:** All activities.

**Pattern:** After the success celebration, before the "Volgend Level" button appears, show a 1-question check:
- SimilarityScale: "You found k = 2. If k = 5, what would the area factor be? ___"
- Discriminant: "You made D = 0. How many solutions does the equation have? ___"
- TrigCircle: "You found α = 210°. What is cos(210°) exactly? ___"

**Why it works:** 5-second check that transforms "I completed the task" into "I understand why it worked." Takes almost no development time.

---

## 4. Implementation Strategy

### Phase 1: Fix the worst offenders (slider auto-check)
Start with Discriminant, TrigCircle, and SimilarityScale. These are the most trivially gameable.

### Phase 2: Add cognitive progression to levels
Rework OrderingReals and DiscountBar levels from "same task, harder numbers" to genuinely different cognitive demands.

### Phase 3: Add calculation gates
PythagorasVisual and DiscountBar get intermediate calculation requirements before the interactive element activates.

### Phase 4: Fix hint systems globally
Replace answer-revealing hints across all activities with method-teaching hints. This is a cross-cutting change.

### Phase 5: Add post-success reflection
Lightweight addition to all activities. One question after success, before advancing.

---

## 5. Activities NOT sampled but likely affected

Based on naming patterns, these likely share the same problems:

| Likely slider auto-check | Likely cosmetic levels | Likely answer-revealing hints |
|---|---|---|
| LPD11_2_TrigRatios | LPD05_SenseOfScale | All activities with `getHintText()` or `hints[]` |
| LPD22_2_SlopeLinear | LPD08_NumberLine | |
| LPD12_AbsoluteValue | LPD09_HundredGrid | |
| LPD34_DirectProportion | LPD14_SquareRoot | |
| LPD34_InverseProportion | LPD31_SquareNumbers | |

These should be audited using the same criteria before being improved.

---

## 6. What NOT to change

- **LinearEqBalance** — already strong. Minor improvement: add a "why does this work?" tooltip when an operation is applied.
- **PythagorasVisual** — already strong. Add calculation gates (Improvement D) but don't restructure.
- **Visual design / layout system** — the consistent sidebar + main area + pattern-grid layout is good. Don't touch it.
- **SuccessCelebration / MathText** — shared components work well.
- **Level indicator dots** — keep the UI pattern, just make the levels actually different.
