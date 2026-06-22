# Hint Template — Method-Teaching Hints

> Replace answer-revealing hints with this 3-level pattern.
> Never let the third hint give the answer directly.

---

## The 3-Level Hint Pattern

| Level | Content | Example (Discriminant) |
|---|---|---|
| **Hint 1** | Conceptual direction + formula reminder | "D = b² − 4ac. Welke waarden heb je al? a=1, b=6. D moet 0 zijn." |
| **Hint 2** | Worked example with DIFFERENT numbers | "Als a=2, b=5, c=3: D = 25 − 24 = 1 > 0. Pas dit toe op jouw waarden." |
| **Hint 3** | Step-by-step method with YOUR numbers, one step left blank | "36 − 4c = 0 → 4c = 36 → c = __" (student fills the blank) |

---

## Rules

1. **Hint 1** must never give away a specific value. It points to the formula or the concept.
2. **Hint 2** uses a worked example with completely different numbers. The student must still apply the method.
3. **Hint 3** shows the method on the actual numbers but leaves the final calculation or answer as a blank/unknown.
4. **No hint** should ever say the exact answer values (e.g., "Probeer a=1, b=0, c=-4").

---

## Before & After Examples

### ❌ Old pattern (Discriminant)
```
Hint 1: "Gebruik de schuifregelaars om a, b, c aan te passen."
Hint 2: "Kijk naar D = b² − 4ac."
Hint 3: "Probeer a=1, b=0, c=-4 voor D=16>0."
```

### ✅ New pattern (Discriminant)
```
Hint 1: "D = b² − 4ac. Vul a = 1 en b = 6 in: D = 36 − 4c. D moet 0 zijn."
Hint 2: "Als a=2, b=5, c=3: D = 25 − 24 = 1. Nu bij jou: 36 − 4c = 0 → los op."
Hint 3: "36 − 4c = 0 → 4c = 36 → c = __"
```

### ❌ Old pattern (TrigCircle)
```
Hint 1: "De groene lijn is de sinus."
Hint 2: "Kijk naar de cirkel."
Hint 3: "Zet de slider op 30°."
```

### ✅ New pattern (TrigCircle)
```
Hint 1: "sin(α) = 0,5. Welke speciale hoeken ken je waar sin = 0,5?"
Hint 2: "sin(30°) = 0,5. Maar cos(30°) ≈ 0,866. Klopt dat met cos(α) > 0?"
Hint 3: "30° in Q1: sin(+) en cos(+). Juiste antwoord: α = __°"
```

### ❌ Old pattern (OrderingReals)
```
Hint 1: "Zet alles om naar kommagetallen."
Hint 2: "Vergelijk de waarden."
Hint 3: "Juiste volgorde: -1.5 < -0.75 < 0 < 0.5 < 0.8"
```

### ✅ New pattern (OrderingReals)
```
Hint 1: "Zet breuken om: 1/2 = 0,5 en -3/4 = -0,75."
Hint 2: "Negatieve getallen: -1,5 is kleiner dan -0,75. Positieve: 0,5 < 0,8."
Hint 3: "Van klein naar groot: __ < -0,75 < __ < 0,5 < __"
```

---

## Implementation

```javascript
// In your activity's hintLevels array:
hintLevels: [
  'Conceptual direction (no specific values)',
  'Worked example with DIFFERENT numbers',
  'Step-by-step with actual numbers, final blank'
]
```

Then in the hint display logic:
```javascript
function showHint() {
  hintCount.value++
  const data = currentLevelData.value
  if (data && data.hintLevels) {
    const idx = Math.min(hintCount.value - 1, data.hintLevels.length - 1)
    if (idx >= 0) {
      feedback.value = { type: 'info', text: data.hintLevels[idx] }
    }
  }
}
```

Never exceed 3 hints. At hint 3, the student should be able to complete the task by filling in the blank in the method.
