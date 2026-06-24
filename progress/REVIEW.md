# REVIEW — Round 1 Activity Improvements

> Date: 2026-06-21
> Scope: 17 activities modified across 3 phases
> Lens: Singapore Math pedagogy, cognitive science, best practices in math education

---

## What We Did Right

### 1. Predict → Set → Verify (Strong Alignment with Singapore CPA)

The predict-first pattern we applied to slider activities (Discriminant, TrigCircle, SimilarityScale, SlopeLinear, SquareRoot) directly mirrors Singapore Math's **Concrete → Pictorial → Abstract (CPA)** progression:

- **Predict** = Abstract reasoning (student calculates before seeing visual confirmation)
- **Set** = Pictorial confirmation (slider/visual validates the calculation)
- **Verify** = Concrete exploration (student can now experiment freely)

This is correct. Singapore Math never lets students skip the abstract step. Our activities now enforce: "Think first, confirm second."

### 2. Calculation Gates (Alignment with Bar Model Philosophy)

The calculation gates in PythagorasVisual, DiscountBar, HundredGrid, and NumberLine enforce what Singapore Math calls **model drawing before operation**. Students must:
1. Represent the problem mathematically (calculate a², compute pricePerBlock, convert fractions)
2. Then use the visual model to confirm

This prevents the visual model from becoming a crutch. The bar model in Singapore Math is a *thinking tool*, not an answer-revealing device. Our gates ensure students draw the model mentally first.

### 3. Cognitive Level Progression (Bloom's Taxonomy Alignment)

The reworked levels in Discriminant, OrderingReals, PythagorasVisual, and DiscountBar now follow genuine cognitive progression:

| Level | Bloom's | Example (Discriminant) |
|---|---|---|
| 1 | **Apply** | Given a, b, find c so D = 0 |
| 2 | **Analyze** | Given a and vertex position, find b and c |
| 3 | **Evaluate/Create** | Find a, b, c satisfying multiple constraints |

This is correct. Singapore Math textbooks use this exact progression: routine application → multi-step reasoning → open-ended problem solving.

### 4. Post-Success Reflection (Metacognition)

The reflection questions we added (e.g., "If k = 3, what is the area factor?" after SimilarityScale) force students to **generalize** from the specific case they just solved. This is a hallmark of Singapore Math's "variation" approach — changing one parameter to test understanding of the underlying structure.

---

## What We Did Wrong or Incompletely

### 1. Hints Still Collapse to Answers (Critical Failure)

**The problem:** Despite documenting the 3-level method-teaching hint pattern in `HINT_TEMPLATE.md`, many activities still use the old pattern where Hint 3 gives the answer.

**Evidence from code review:**

- **LPD33_2_Discriminant.vue** — Hint 3 in Level 1 says: `"c = 9. D = 36 − 36 = 0. ✓"` — This IS the answer.
- **LPD06_2_OrderingReals.vue** — Hint 3 in Level 1 says: `"1/2 = 0,5 · 4/5 = 0,8 · -3/4 = -0,75"` — This gives all conversions.
- **LPD10_2_PythagorasVisual.vue** — Hint 3 says: `"Elk koppel met c = 5 en b² < 20a is juist. Bijv. a = 2, b = 5, c = 5 → D = −15 < 0. ✓"` — This gives a complete solution.

**Why this is wrong:** Singapore Math's "scaffold, don't tell" principle means hints should teach the *method*, not reveal the *answer*. A student who reads Hint 3 learns nothing — they just copy.

**What we should have done:**
```
❌ Old Hint 3: "c = 9. D = 36 − 36 = 0. ✓"
✅ New Hint 3: "36 − 4c = 0 → 4c = 36 → c = ___" (student fills the blank)
```

**Status:** We documented the correct pattern but didn't apply it consistently. This is a **Round 2 priority**.

---

### 2. Missing "Why Does This Work?" Explanations

**The problem:** Our activities enforce correct procedure but rarely explain *why* the procedure works.

**Examples:**

- **Discriminant:** We require students to calculate D = b² − 4ac, but we never explain *why* D determines the number of roots. The visual shows roots appearing/disappearing, but there's no text connecting D to the quadratic formula: x = (−b ± √D) / 2a.

- **TrigCircle:** We require students to predict the quadrant, but we never explain *why* sin and cos have specific signs in each quadrant. The unit circle is shown, but the connection between coordinates (cos, sin) and the quadrant is implicit, not explicit.

- **PythagorasVisual:** We require students to calculate a², b², c², but we never state the theorem explicitly: "In a right triangle, the square on the hypotenuse equals the sum of the squares on the other two sides."

**Why this is wrong:** Singapore Math emphasizes **conceptual understanding before procedural fluency**. Students should understand *why* a² + b² = c² before they calculate it. Our activities skip the "why" and jump to "how."

**What we should have done:** Add a brief explanatory note after success:
```
✅ After PythagorasVisual success:
"Pythagoras' Stelling: In een rechthoekige driehoek is de oppervlakte van het vierkant op de schuine zijde (c²) gelijk aan de som van de oppervlaktes van de vierkanten op de andere twee zijden (a² + b²). Dit werkt omdat..."
```

**Status:** Missing entirely. **Round 2 priority**.

---

### 3. Reflection Questions Are Too Easy

**The problem:** Most reflection questions are trivial restatements of the task, not genuine generalization.

**Examples:**

- **SimilarityScale Level 1:** After finding k = 2 (area factor 4), reflection asks: "If k = 3, what is the area factor?" Answer: 9. This is just plugging into k² = 9. No reasoning required.

- **Discriminant Level 1:** After finding c = 9 so D = 0, reflection asks: "How many roots does D = 0 give?" Answer: 1. This is a definition, not a reflection.

- **SlopeLinear Level 1:** After finding a = 2, reflection asks: "If the point was (2×px, 2×py), what is a?" Answer: same a. This is a trivial observation.

**Why this is wrong:** Singapore Math's "variation" questions should test **structural understanding**, not just parameter substitution. A good reflection question forces the student to articulate a general principle.

**What we should have done:**
```
❌ Old: "If k = 3, what is the area factor?" (answer: 9)
✅ New: "Why does the area scale with k² and not k? Explain using the formula for area."

❌ Old: "How many roots does D = 0 give?" (answer: 1)
✅ New: "If D < 0, can you still find the roots? Why or why not? (Hint: look at the quadratic formula.)"

❌ Old: "If the point was (2×px, 2×py), what is a?" (answer: same)
✅ New: "Why does doubling both coordinates not change the slope? What does this tell you about the nature of slope?"
```

**Status:** Reflections are present but shallow. **Round 2 priority**.

---

### 4. Missing Worked Examples Before Task

**The problem:** Our activities jump straight into the task without showing a worked example first.

**Singapore Math principle:** Before students attempt a problem, they should see a **fully worked example** that demonstrates the method. This is called "I do, we do, you do" (gradual release of responsibility).

**What we have:**
```
Instruction: "Bereken D = b² − 4ac en kies de juiste parameters."
Task: "Gegeven: a = 1, b = 6. Kies c zodat D = 0."
```

**What we should have:**
```
Worked example: "Voorbeeld: Als a = 2, b = 5, c = 3, dan D = 25 − 24 = 1. Omdat D > 0, zijn er 2 nulwaarden."
Instruction: "Bereken D = b² − 4ac en kies de juiste parameters."
Task: "Gegeven: a = 1, b = 6. Kies c zodat D = 0."
```

**Why this matters:** Cognitive load theory says students learn better when they see the *structure* of a solution before attempting it themselves. Our activities assume students already know the method, which is false for many.

**Status:** Missing entirely. **Round 2 priority**.

---

### 5. No Error Analysis of Common Mistakes

**The problem:** Our activities don't anticipate or address common student misconceptions.

**Examples:**

- **Discriminant:** Common mistake: "D = b² − 4ac, so if b = 6, then b² = 12" (forgetting to square). We don't catch this or explain why it's wrong.

- **TrigCircle:** Common mistake: "sin(30°) = 0.5, so the angle is 30°" (forgetting there's another angle in Q2 with sin = 0.5). We don't address this.

- **OrderingReals:** Common mistake: "-3/4 > -1/2 because 3/4 > 1/2" (forgetting that negative numbers reverse the inequality). We don't address this.

**Singapore Math principle:** Effective math instruction **anticipates misconceptions** and addresses them explicitly. This is called "error analysis" or "misconception preemption."

**What we should have done:** Add a "Let op!" (Watch out!) note after common errors:
```
✅ After Discriminant error (b² = 12):
"Let op: b² betekent b × b, niet b × 2. Als b = 6, dan b² = 36, niet 12."

✅ After TrigCircle error (only finding 30°):
"Let op: sin(α) = 0.5 heeft twee oplossingen tussen 0° en 360°: α = 30° (Q1) en α = 150° (Q2). De eenheidscirkel laat zien waarom."
```

**Status:** Missing entirely. **Round 2 priority**.

---

## Summary: Round 1 Scorecard

| Criterion | Score | Notes |
|---|---|---|
| Predict-first pattern | ✅ 9/10 | Strong alignment with CPA. Minor: some predictions are trivial. |
| Calculation gates | ✅ 8/10 | Good enforcement of "model before operation." Minor: some gates are too easy. |
| Cognitive level progression | ✅ 7/10 | Discriminant and PythagorasVisual are excellent. Others are weaker. |
| Post-success reflection | ⚠️ 5/10 | Reflections are present but shallow. Need deeper "why" questions. |
| Method-teaching hints | ❌ 3/10 | Documented but not applied. Hint 3 still gives answers. |
| Conceptual explanations | ❌ 2/10 | Missing "why does this work?" entirely. |
| Worked examples | ❌ 1/10 | Missing entirely. Activities jump straight to tasks. |
| Error analysis | ❌ 1/10 | No anticipation of common mistakes. |

**Overall Round 1 score: 4.5/10**

We fixed the most critical problem (slider auto-check) and added good structural improvements (calculation gates, level progression). But we missed the deeper pedagogical elements: conceptual explanation, worked examples, error analysis, and deep reflection.

---

## What Round 2 Must Fix

1. **Replace answer-revealing hints with method-teaching hints** (apply the pattern we documented)
2. **Add "Why does this work?" explanations** after success in every activity
3. **Add worked examples** before every task (I do → we do → you do)
4. **Deepen reflection questions** to test structural understanding, not just parameter substitution
5. **Add error analysis** for common misconceptions in every activity

These 5 fixes will bring the activities from 4.5/10 to 8+/10.
