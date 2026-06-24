# PLAN — Round 2: Deepening Pedagogical Quality

> Date: 2026-06-21
> Goal: Move activities from 4.5/10 to 8+/10 by adding missing pedagogical elements
> Approach: Systematic application of Singapore Math principles

---

## Round 2 Priorities (In Order)

### Priority 1: Fix Hints — Apply Method-Teaching Pattern

**Problem:** Hint 3 still gives the answer in many activities.

**Action:** For each activity, rewrite Hint 3 to leave a blank for the student to fill.

**Example transformation:**
```javascript
// ❌ BEFORE (LPD33_2_Discriminant.vue, Level 1)
hintLevels: [
  'D = b² − 4ac. Vul a = 1 en b = 6 in: D = 36 − 4·1·c = 36 − 4c. D moet 0 zijn. Los 36 − 4c = 0 op.',
  '36 − 4c = 0 → 4c = 36 → c = 9. Stel de c-slider in op 9.',
  'c = 9. D = 36 − 36 = 0. ✓'  // ← GIVES THE ANSWER
]

// ✅ AFTER
hintLevels: [
  'D = b² − 4ac. Vul a = 1 en b = 6 in: D = 36 − 4·1·c = 36 − 4c. D moet 0 zijn. Los 36 − 4c = 0 op.',
  '36 − 4c = 0 → 4c = 36 → c = ___. Stel de c-slider in op de gevonden waarde.',  // ← LEAVES BLANK
  'Controleer: D = 36 − 4(1)(___) = 36 − ___ = 0. ✓'  // ← STUDENT FILLS IN
]
```

**Activities to fix:**
- LPD33_2_Discriminant.vue (all 3 levels)
- LPD06_2_OrderingReals.vue (all 3 levels)
- LPD10_2_PythagorasVisual.vue (all 3 levels)
- LPD15_2_TrigCircle.vue (all 3 levels)
- LPD08_2_SimilarityScale.vue (all 3 levels)
- LPD22_2_SlopeLinear.vue (all 3 levels)
- LPD13_DiscountBar.vue (all 3 levels)

**Estimated effort:** 2-3 hours

---

### Priority 2: Add "Why Does This Work?" Explanations

**Problem:** Activities enforce procedure but don't explain the underlying mathematics.

**Action:** After the success message, add a brief conceptual explanation.

**Example:**
```javascript
// ✅ ADD AFTER SUCCESS IN LPD10_2_PythagorasVisual.vue
successText: 'Schitterend! a² + b² = c² → 9 + 16 = 25. Pythagoras is tevreden.',
explanation: 'Waarom werkt dit? De oppervlakte van het vierkant op de schuine zijde (c²) is altijd gelijk aan de som van de oppervlaktes van de vierkanten op de andere twee zijden (a² + b²). Dit is geen toeval — het volgt uit de geometrie van rechthoekige driehoeken.'
```

**Activities to enhance:**
- LPD33_2_Discriminant.vue — Explain why D determines number of roots (connect to quadratic formula)
- LPD15_2_TrigCircle.vue — Explain why sin/cos have specific signs in each quadrant
- LPD10_2_PythagorasVisual.vue — Explain the geometric proof of a² + b² = c²
- LPD08_2_SimilarityScale.vue — Explain why area scales with k² (not k)
- LPD22_2_SlopeLinear.vue — Explain why slope is constant for a line
- LPD13_DiscountBar.vue — Explain why two successive discounts don't add up
- LPD06_2_OrderingReals.vue — Explain why negative numbers reverse inequality

**Estimated effort:** 3-4 hours

---

### Priority 3: Add Worked Examples Before Tasks

**Problem:** Activities jump straight to the task without showing the method first.

**Action:** Add a "Voorbeeld" (Example) section before the task in each activity.

**Example:**
```javascript
// ✅ ADD BEFORE TASK IN LPD33_2_Discriminant.vue
instruction: `
  <div class="bg-blue-50 p-4 rounded-lg mb-4">
    <p class="font-bold mb-2">Voorbeeld:</p>
    <p>Gegeven: a = 2, b = 5, c = 3</p>
    <p>Bereken: D = b² − 4ac = 25 − 24 = 1</p>
    <p>Omdat D > 0: de parabool heeft 2 nulwaarden.</p>
  </div>
  Bereken D = b² − 4ac en kies de juiste parameters.
`
```

**Activities to enhance:**
- LPD33_2_Discriminant.vue — Show D calculation for one set of values
- LPD15_2_TrigCircle.vue — Show how to find angle from sin/cos values
- LPD10_2_PythagorasVisual.vue — Show a² + b² = c² calculation
- LPD08_2_SimilarityScale.vue — Show k² calculation for area scaling
- LPD22_2_SlopeLinear.vue — Show Δy/Δx calculation
- LPD13_DiscountBar.vue — Show pricePerBlock calculation
- LPD06_2_OrderingReals.vue — Show fraction-to-decimal conversion

**Estimated effort:** 2-3 hours

---

### Priority 4: Deepen Reflection Questions

**Problem:** Reflection questions test parameter substitution, not structural understanding.

**Action:** Rewrite reflections to ask "why" or "what if" questions that require explanation.

**Example transformations:**
```javascript
// ❌ BEFORE (LPD08_2_SimilarityScale.vue, Level 1)
reflection: 'Als k = 3, hoeveel keer groter wordt de oppervlakte?',
reflectionAnswer: ['9', '9 keer']

// ✅ AFTER
reflection: 'Waarom schaalt de oppervlakte met k² en niet met k? Leg uit met de formule voor oppervlakte.',
reflectionAnswer: ['want', 'formule', 'lengte', 'breedte']  // Keywords that must appear in answer

// ❌ BEFORE (LPD33_2_Discriminant.vue, Level 1)
reflection: 'Hoeveel nulwaarden heeft een kwadratische functie als D = 0?',
reflectionAnswer: ['1', 'een', 'één']

// ✅ AFTER
reflection: 'Als D < 0, kun je dan nog steeds de nulwaarden berekenen met de abc-formule? Waarom wel/niet? (Hint: kijk naar √D)',
reflectionAnswer: ['niet', 'wortel', 'negatief']  // Keywords

// ❌ BEFORE (LPD22_2_SlopeLinear.vue, Level 1)
reflection: 'Als het punt (2×px, 2×py) was, wat zou a dan zijn?',
reflectionAnswer: [String(target), target.toFixed(1)]

// ✅ AFTER
reflection: 'Waarom verandert de richtingscoëfficiënt niet als je beide coördinaten verdubbelt? Wat zegt dit over de aard van een rechte lijn?',
reflectionAnswer: ['constant', 'verhouding', 'zelfde']  // Keywords
```

**Activities to enhance:**
- LPD33_2_Discriminant.vue (all 3 levels)
- LPD15_2_TrigCircle.vue (all 3 levels)
- LPD08_2_SimilarityScale.vue (all 3 levels)
- LPD22_2_SlopeLinear.vue (all 3 levels)
- LPD13_DiscountBar.vue (all 3 levels)
- LPD10_2_PythagorasVisual.vue (all 3 levels)
- LPD06_2_OrderingReals.vue (all 3 levels)

**Estimated effort:** 4-5 hours

---

### Priority 5: Add Error Analysis for Common Misconceptions

**Problem:** Activities don't anticipate or address common student mistakes.

**Action:** Add "Let op!" (Watch out!) notes after common errors.

**Example:**
```javascript
// ✅ ADD IN LPD33_2_Discriminant.vue
function checkPrediction() {
  const data = currentLevelData.value
  const val = parseFloat(predictedD.value)
  
  if (!isNaN(val) && Math.abs(val - data.expectedD) < 0.01) {
    predictionPassed.value = true
    feedback.value = { type: 'info', text: 'Correct!' }
  } else {
    // Check for common mistake: b² = b × 2 instead of b × b
    const b = data.b
    const bSquaredError = b * 2
    if (Math.abs(val - bSquaredError) < 0.01 && b !== 2) {
      feedback.value = { 
        type: 'error', 
        text: `Let op: b² betekent b × b, niet b × 2. Als b = ${b}, dan is b² = ${b*b}, niet ${bSquaredError}.` 
      }
    } else {
      feedback.value = { type: 'error', text: 'Niet helemaal. Bereken D = b² − 4ac.' }
    }
  }
}
```

**Common misconceptions to address:**

| Activity | Misconception | Detection | Feedback |
|---|---|---|---|
| Discriminant | b² = b × 2 | val ≈ b × 2 | "b² means b × b, not b × 2" |
| TrigCircle | Only finding one angle | N/A (need to check if they found both) | "sin(α) = 0.5 has two solutions: α = 30° and α = 150°" |
| OrderingReals | -3/4 > -1/2 because 3/4 > 1/2 | Wrong order | "For negative numbers, the larger absolute value is the smaller number" |
| SimilarityScale | Area scales with k (not k²) | Wrong k | "Area scales with k² because both length and width are multiplied by k" |
| PythagorasVisual | a² + b² = (a+b)² | Wrong calculation | "a² + b² is not the same as (a+b)². (a+b)² = a² + 2ab + b²" |
| DiscountBar | 20% + 20% = 40% | Wrong answer | "Two successive discounts don't add up. 20% off €100 = €80, then 20% off €80 = €64, not €60" |
| SlopeLinear | Slope changes when you move along the line | Wrong calculation | "Slope is constant for a straight line. That's what makes it a line!" |

**Estimated effort:** 3-4 hours

---

## Implementation Strategy

### Phase 1: Fix Hints (Priority 1)
**Why first:** This is the most critical pedagogical failure. Hints that give answers prevent learning.

**Approach:**
1. Open each activity file
2. Find the `hintLevels` array
3. Rewrite Hint 3 to leave a blank
4. Test that the hint still guides the student without giving the answer

**Validation:** After rewriting, ask: "Can a student copy-paste Hint 3 as their answer?" If yes, it's still too revealing.

---

### Phase 2: Add Explanations (Priority 2)
**Why second:** Understanding "why" is more important than avoiding errors.

**Approach:**
1. For each activity, identify the core mathematical principle
2. Write a 2-3 sentence explanation
3. Add it to the `successText` or as a separate `explanation` field
4. Display it after the success celebration

**Validation:** Read the explanation aloud. Does it answer "Why does this work?" in plain language?

---

### Phase 3: Add Worked Examples (Priority 3)
**Why third:** Students need to see the method before attempting it.

**Approach:**
1. For each activity, create a worked example with different numbers
2. Add it to the `instruction` field as a highlighted box
3. Make sure the example demonstrates the exact method required for the task

**Validation:** Can a student who missed the lesson learn the method from the worked example alone?

---

### Phase 4: Deepen Reflections (Priority 4)
**Why fourth:** Deep reflection consolidates understanding.

**Approach:**
1. For each reflection question, ask: "Does this test understanding or just calculation?"
2. If calculation, rewrite to ask "why" or "what if"
3. Use keyword matching instead of exact answer matching

**Validation:** Would a student who memorized the procedure fail this reflection? If yes, it's deep enough.

---

### Phase 5: Add Error Analysis (Priority 5)
**Why last:** This is the most complex and time-consuming.

**Approach:**
1. For each activity, list the top 3 common mistakes
2. Add detection logic in the check function
3. Provide specific feedback for each mistake

**Validation:** Ask a colleague: "What mistakes do students commonly make here?" If our feedback addresses them, we're good.

---

## Estimated Total Effort

| Priority | Task | Hours |
|---|---|---|
| 1 | Fix hints | 2-3 |
| 2 | Add explanations | 3-4 |
| 3 | Add worked examples | 2-3 |
| 4 | Deepen reflections | 4-5 |
| 5 | Add error analysis | 3-4 |
| **Total** | | **14-19 hours** |

---

## Success Criteria

After Round 2, each activity should:

✅ **Never give the answer in hints** (Hint 3 leaves a blank)
✅ **Explain "why"** after success (2-3 sentence conceptual explanation)
✅ **Show a worked example** before the task (I do → we do → you do)
✅ **Ask deep reflection questions** (test understanding, not calculation)
✅ **Anticipate common mistakes** (detect and address top 3 misconceptions)

**Target score: 8+/10** on the pedagogical quality rubric.

---

## Next Steps

1. Review this plan and confirm priorities
2. Start with Priority 1 (fix hints) — most critical
3. Work through priorities sequentially
4. After each priority, test 2-3 activities to validate the approach
5. Adjust the plan if needed based on testing feedback

---

## Questions for Discussion

1. Should we add worked examples to ALL activities, or only the most complex ones?
2. For reflection questions, should we use keyword matching or accept any reasonable explanation?
3. Should we add video explanations for the hardest concepts (e.g., discriminant, unit circle)?
4. Do we need to translate the "Let op!" notes to English for international users?
