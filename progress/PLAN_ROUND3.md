# PLAN — Round 3: Visual Polish

> Date: 2026-06-22
> Goal: Premium visual polish that feels like Brilliant.org — no confetti overload, no glow effects, just refined design.
> Scope: 7 Phase 1 activities + shared components

---

## Phase 0: Fix Round 2 Bugs First

Before any polish, fix the bugs found in the Round 2 review.

- [ ] **OrderingReals** — Fix operator precedence bug in inline CSS class check
- [ ] **OrderingReals** — Add missing reflection step (showReflection, reflection question, reflection input) to match the other 6 activities
- [ ] **TrigCircle / SimilarityScale / PythagorasVisual** — Fix info feedback icon (use `PhInfo` or `PhLightbulb` instead of `PhCheckCircle`)
- [ ] **DiscountBar** — Verify two-step gate flow sets `discountApplied` and bar model shows correctly
- [ ] **All 7** — Unify `fadeIn` animation timing (pick one: `0.3s ease-out`)
- [ ] **All 7** — Unify range slider styling (either all custom thumb or all `accent-*`)
- [ ] **All 7** — Replace emoji `📋` in worked example boxes with Phosphor `PhBookOpen` icon via `<component>` or SVG inline

---

## Phase 1: SVG Audit & Fix

Check every SVG for clipping, overflow, misalignment, and rendering issues.

### 1.1 LPD33_2_Discriminant.vue — Parabola SVG
- [ ] Verify `viewBox="-120 -120 240 240"` matches the grid range (13 lines × 20px = 260px, but viewBox is 240 — check for off-by-one)
- [ ] Verify `graphPath` computed property doesn't produce NaN when `valA = 0` (a=0 shows dashed line)
- [ ] Root markers (`<circle>`) — check they don't clip at viewBox edges when roots are at ±6
- [ ] SVG `overflow-visible` on the SVG element — confirm the container doesn't clip it
- [ ] Root count label at `y="-90"` — check it doesn't overlap with the parabola peak

### 1.2 LPD15_2_TrigCircle.vue — Unit Circle SVG
- [ ] Verify `viewBox="-150 -150 300 300"` is large enough for labels at ±140px
- [ ] Angle arc path — verify `M 25 0 A 25 25 0 ...` large-arc-flag is correct for angles > 180°
- [ ] Point coordinate label — add dynamic offset that avoids the circle edge (currently hardcoded `+12` / `-8`)
- [ ] Cosine/sine labels — check they don't overlap with axis labels at extreme angles
- [ ] Quadrant highlight rects — verify they only show when relevant (currently hardcoded for 30°, 225°, 210°)

### 1.3 LPD22_2_SlopeLinear.vue — Coordinate Grid SVG
- [ ] Verify `viewBox="-10 -10 20 20"` grid lines align with axis labels
- [ ] Point marker at `r="0.4"` — check visibility at different zoom levels
- [ ] Slope triangle path `M 0 0 L 1 0 L 1 ${-a}` — verify it renders correctly for negative slopes
- [ ] Labels at `font-size="0.6"` — check readability at standard screen sizes
- [ ] SVG `overflow-visible` — confirm container handles lines extending beyond viewBox

### 1.4 LPD10_2_PythagorasVisual.vue — Triangle & Squares
- [ ] **Critical**: The C square uses `transform: rotate(36.87deg) translateY(-200px)` — this is hardcoded for a 3-4-5 triangle. Check if it breaks for levels with different side ratios.
- [ ] Square B (160px height) — verify it doesn't clip on smaller screens within the `min-h-[400px]` container
- [ ] Drag-drop zones — verify `overflow` on the squares container doesn't clip drag ghost images
- [ ] Side labels — check they don't overlap with square borders

### 1.5 LPD08_2_SimilarityScale.vue — Triangle Visualization
- [ ] `clip-path: polygon(50% 0%, 0% 100%, 100% 100%)` — verify both triangles render correctly
- [ ] Dynamic sizing `width: Math.max(20, 80 * visualK) + 'px'` — check max scale (3x) doesn't overflow the container
- [ ] `transform-origin-bottom` CSS class — verify it's defined in `<style scoped>` (it is)
- [ ] Triangle height scales with visualK — verify no jitter during slider drag

### 1.6 LPD13_DiscountBar.vue — Bar Model
- [ ] Block transitions `translate-y-full opacity-0` — verify smooth animation when discount is applied
- [ ] Scissors button positioning `translateX(${50 - discountBlocks * 5}%)` — check alignment for different discount percentages
- [ ] Cut line `h-[180px]` — verify it aligns with the bar height
- [ ] Price helper labels below — check they don't overlap for narrow remaining blocks
- [ ] Two-step comparison grid — verify `col-span-2` renders correctly

### 1.7 LPD06_2_OrderingReals.vue — Number Line
- [ ] `overflow-x-auto` on the container — check the number line doesn't get cut off on mobile
- [ ] Drop zone sizing `w-24 h-20` — check if fraction labels like `-√5` fit without overflow
- [ ] Tick marks `w-2 h-8` — verify alignment with drop zones
- [ ] Remove button `absolute -top-3 -right-3` — check it's not clipped by parent overflow

---

## Phase 2: Premium Visual Polish

Transform from "functional" to "Brilliant.org quality" without going overboard.

### 2.1 Typography Refinement
- [ ] **Goal cards**: Add subtle letter-spacing (`tracking-wide`) to goal text for a more editorial feel
- [ ] **Formula display**: Use `tabular-nums` on all `font-mono` numeric displays to prevent width jitter during slider drag
- [ ] **Section labels**: Uppercase section labels (`uppercase tracking-wider text-xs`) should use `font-semibold` instead of `font-bold` for a cleaner look
- [ ] **Headings**: Ensure consistent heading hierarchy — currently some use `text-lg font-bold`, others `text-sm font-bold`

### 2.2 Color Consistency
- [ ] **Prediction sections**: All use `border-teal-200 bg-teal-50` or `border-indigo-200 bg-indigo-50` — pick ONE accent for prediction across all 7 activities (recommend `indigo` for consistency)
- [ ] **Error state**: All use `border-red-400 bg-red-50` — verify consistency
- [ ] **Success state**: All use `border-emerald-300 bg-emerald-50` — verify consistency
- [ ] **Info/neutral**: Some use `bg-slate-50`, others `bg-slate-100` — unify
- [ ] **Accent colors**: Discriminant uses `accent-teal-600`, TrigCircle uses `accent-pink-600`, SimilarityScale uses `accent-indigo-600` — unify to one accent color

### 2.3 Spacing & Layout
- [ ] **Sidebar padding**: All use `p-6` — verify consistency
- [ ] **Card spacing**: Most use `mb-4` or `mb-6` between sections — create a consistent rhythm
- [ ] **Goal card**: Some use `p-5`, others `p-4` — unify
- [ ] **Footer**: All use `p-6 bg-slate-50 border-t` — verify consistency
- [ ] **Min-height**: All visualization panels use `min-h-[400px]` — verify this is sufficient

### 2.4 Border & Shadow Refinement
- [ ] **Cards**: Currently mix `shadow-sm`, `shadow-md`, `shadow-inner` — create a consistent shadow hierarchy
- [ ] **Borders**: Mix of `border`, `border-2`, `border-4` — reduce to 2 weights (1px default, 2px interactive)
- [ ] **Rounded corners**: Mix of `rounded-lg`, `rounded-xl`, `rounded-2xl` — pick 2 sizes and stick to them
- [ ] **Focus rings**: All use `focus-visible:ring-2 focus-visible:ring-math-blue` — good, keep consistent

### 2.5 Interactive Element Polish
- [ ] **Buttons**: Ensure all primary buttons have `shadow-sm` (not `shadow-md` which is too heavy)
- [ ] **Active states**: All use `active:scale-[0.98]` — good
- [ ] **Disabled states**: Add `disabled:opacity-50 disabled:cursor-not-allowed` where missing
- [ ] **Hover states**: Ensure all interactive elements have `hover:` transitions
- [ ] **Transition timing**: Use `transition-all duration-200` consistently (some use `duration-150`, others `duration-300`)

### 2.6 Feedback Area Polish
- [ ] **Feedback cards**: Add a subtle left-border accent (e.g., `border-l-4`) matching the feedback type color
- [ ] **Hint cards**: Add a `border-l-4 border-amber-400` accent to the amber hint boxes
- [ ] **Reflection cards**: Add a `border-l-4 border-indigo-400` accent
- [ ] **Success messages**: Ensure the explanation text is visually distinct from the success heading (e.g., smaller font, muted color)

### 2.7 Progress Indicator Polish
- [ ] **Level dots**: Currently `w-2 h-2 rounded-full` — consider `w-2.5 h-2.5` for better visibility
- [ ] **Level counter**: Add a subtle background pill behind "Level X van Y"
- [ ] **Step progress**: Add a thin progress bar at the top of the modal showing overall completion

### 2.8 Worked Example Box Polish
- [ ] Replace inline HTML with a proper component or at least consistent styling
- [ ] Use `bg-blue-50/50` (semi-transparent) for a more subtle background
- [ ] Replace emoji `📋` with an inline SVG Phosphor icon
- [ ] Add `rounded-lg border-l-4 border-blue-400` for a more editorial look
- [ ] Ensure KaTeX math renders correctly inside the worked example

---

## Phase 3: Micro-interactions & Transitions

Small details that make the difference between "functional" and "polished."

### 3.1 Smooth State Transitions
- [ ] **Gate unlock**: When prediction passes → slider/gate section fades in with a subtle scale (`scale-95 → scale-100`)
- [ ] **Level transition**: When moving to next level, fade out current content before fading in new content
- [ ] **Feedback appearance**: Already has `animate-fadeIn` — add a subtle `translateY` offset for a slide-up feel
- [ ] **Correct state**: When answer is correct, add a brief border flash (`border-emerald-400 → border-emerald-300`)

### 3.2 Drag & Drop Polish (PythagorasVisual, OrderingReals)
- [ ] Add `drop-shadow` to dragged items
- [ ] Drop zones should pulse subtly when a drag is in progress
- [ ] Correctly placed items should have a subtle scale animation on drop
- [ ] Wrong placement should have a subtle shake animation

### 3.3 Slider Polish
- [ ] Add a value tooltip above the slider thumb showing the current value
- [ ] When slider snaps to correct value (after prediction), add a brief highlight
- [ ] Disabled sliders should have a `grayscale` filter, not just `opacity-50`

### 3.4 Number Input Polish
- [ ] Add a subtle pulse to the border when an input receives focus
- [ ] Correct inputs should show a brief green flash
- [ ] Wrong inputs should have a subtle shake animation

---

## Phase 4: Responsive & Edge Cases

### 4.1 Mobile / Small Screens
- [ ] All activities hide the sidebar below `md` breakpoint — verify content is accessible
- [ ] SVG visualizations should scale down proportionally (use `max-w-full h-auto`)
- [ ] Font sizes should remain readable on mobile
- [ ] Touch targets should be at least 44×44px (already set on close buttons)

### 4.2 Large Screens
- [ ] Verify layouts don't stretch awkwardly on wide screens
- [ ] SVG visualizations should have a `max-w` to prevent over-scaling

### 4.3 Keyboard Navigation
- [ ] All interactive elements should be keyboard-accessible
- [ ] Tab order should be logical (top-to-bottom, left-to-right)
- [ ] Enter key should submit (already implemented)
- [ ] Escape should close (already implemented)

---

## Execution Order

1. **Phase 0** — Fix bugs (no polish until things work correctly)
2. **Phase 1** — SVG audit (ensure nothing is broken)
3. **Phase 2** — Visual polish (the bulk of the work)
4. **Phase 3** — Micro-interactions (the finishing touches)
5. **Phase 4** — Responsive testing (final pass)

---

## Success Criteria

- No SVG clipping, overflow, or rendering bugs
- Consistent color palette across all 7 activities
- Consistent spacing, typography, and border/shadow hierarchy
- Smooth, purposeful transitions (no gratuitous animation)
- Feels like a single product, not 7 separate activities
- Passes basic keyboard navigation and accessibility checks
- Works on mobile (sidebar hidden) and desktop (sidebar visible)
