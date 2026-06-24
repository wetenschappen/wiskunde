# Round 2 Review — Pedagogical Changes Audit

> Date: 2026-06-22
> Reviewed files: All 7 Phase 1 activities + SuccessCelebration + MathText

---

## Logic & Functionality Issues

### 1. LPD06_2_OrderingReals.vue — Operator Precedence Bug (CSS live validation)
**Severity: Medium**
The inline template CSS class check has a precedence bug:
```javascript
Math.abs(parseFloat((conversionInputs[n.id] || '').replace(',', '.')) || 9999 - n.value) < 0.01
```
Should be:
```javascript
Math.abs((parseFloat((conversionInputs[n.id] || '').replace(',', '.')) || 9999) - n.value) < 0.01
```
The `|| 9999 - n.value` binds incorrectly — when input is empty/NaN, it falls back to `9999 - n.value` instead of `(9999) - n.value`.

### 2. LPD10_2_PythagorasVisual.vue — Square C Transform Overflow
**Severity: Low**
The C square (hypotenuse) uses a complex CSS transform chain:
```css
transform: rotate(36.87deg) translateY(-200px);
```
Combined with `origin-top-left` and absolute positioning, this may clip on smaller screens or cause the square to extend outside the `overflow-hidden` container. The 36.87° rotation is hardcoded for a 3-4-5 triangle but may not match other triangle proportions in levels 2 and 3.

### 3. LPD15_2_TrigCircle.vue — SVG Point Coordinates Near Edge
**Severity: Low**
The coordinate label text (`({{ cosVal.toFixed(2) }}, {{ sinVal.toFixed(2) }})`) can overlap with the circle edge or axis labels when the angle is near 0°, 90°, 180°, or 270°. The text offset is hardcoded at `+12` / `-8` px.

### 4. LPD22_2_SlopeLinear.vue — SVG Line Y-Intercept Bug
**Severity: Low**
The line equation is `y = a*x`, but the SVG renders:
```html
<line x1="-10" :y1="10 * a" x2="10" :y2="-10 * a" ... />
```
The y1 and y2 calculations don't account for a y-intercept (b). When b=0 this is correct for `f(x)=ax`, but the label shows `f(x) = {{ a }}x` which is correct. No actual bug — just verifying.

### 5. LPD06_2_OrderingReals.vue — No Reflection Step
**Severity: Medium**
After success, OrderingReals immediately shows "Volgend Level" instead of a reflection question like all other 6 activities. This breaks the pattern: success → explanation → reflection → next.

### 6. DiscountBar — Two-step Level Gate Logic
**Severity: Low**
In the two-step level, after `checkGate2()` passes, `userAns` is not set — the final answer (the difference €4) is checked by `checkAnswer()` but the button label says "Controleer" while it's checking the difference. The `discountApplied` flag isn't set in this flow, so the bar model may not show correctly.

---

## Visual/CSS Issues Found

### 7. Inconsistent Animation Easing
- **DiscountBar**: `fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)` 
- **All others**: `fadeIn 0.3s ease-out`
Should be unified.

### 8. Range Slider Inconsistency
- **SimilarityScale**: Custom `::-webkit-slider-thumb` and `::-webkit-slider-runnable-track` styles
- **All others**: Just `accent-teal-600` / `accent-pink-600` / `accent-indigo-600`
Inconsistent look across activities.

### 9. Feedback Icon Mismatch
- **Discriminant, DiscountBar, OrderingReals, SlopeLinear**: Use `PhWarningCircle` for error + `PhCheckCircle` for success/info
- **TrigCircle, SimilarityScale, PythagorasVisual**: Use `PhCheckCircle` for both success AND info (wrong icon for info)
The info type should use a distinct icon (e.g., `PhInfo` or `PhLightbulb`).

### 10. Worked Example Box Styling
All 7 activities use inline HTML in the `instruction` prop with raw emoji `📋` instead of Phosphor icons. This is inconsistent with the rest of the design system which uses Phosphor icons throughout.

### 11. SuccessCelebration Confetti
- Uses `Math.random()` in template — values compute once on mount, not on each show
- Only 12 particles with small `w-2 h-2` dots — looks sparse
- No `is-level-complete` prop handling (receives it but doesn't use it)

### 12. Missing `showReflection` in OrderingReals
OrderingReals has no `showReflection` state, no reflection question, and no reflection input. After success it goes directly to `handleNext()`. This is inconsistent with the other 6 activities.

---

## Summary

| # | Issue | Severity | Files |
|---|---|---|---|
| 1 | Operator precedence bug in CSS class check | Medium | OrderingReals |
| 2 | Hardcoded 36.87° rotation for C square | Low | PythagorasVisual |
| 3 | SVG label overlap at cardinal angles | Low | TrigCircle |
| 4 | SVG line rendering (verified correct) | None | SlopeLinear |
| 5 | Missing reflection step | Medium | OrderingReals |
| 6 | Two-step gate flow issue | Low | DiscountBar |
| 7 | Inconsistent fadeIn easing | Low | All 7 |
| 8 | Inconsistent range slider styling | Low | All 7 |
| 9 | Wrong icon for info feedback | Low | 3 activities |
| 10 | Emoji in worked example boxes | Low | All 7 |
| 11 | Sparse/broken celebration confetti | Low | SuccessCelebration |
| 12 | No reflection in OrderingReals | Medium | OrderingReals |

**Overall Round 2 quality: Solid pedagogically, functionally sound, but needs visual consistency fixes before Round 3 polish.**
