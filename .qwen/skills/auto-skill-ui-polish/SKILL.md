---
name: ui-polish
description: Upgrade Vue 3 educational math activities to publisher-quality UI/UX (KaTeX, animations, a11y, theming, responsive)
source: auto-skill
extracted_at: '2026-06-17T10:35:00.186Z'
---

# UI Polish for Math Activities (Publisher Quality)

Transform functional Level 3 LPD activities into polished, Pearson/Brilliant.org-grade educational components. This skill targets 10 quality dimensions across 117 self-contained Vue 3 SFCs in `w-activities/`.

## When to use

- All LPD activities are at Level 3 (randomization + hints + manipulation=answer)
- You need visual and interaction quality that matches professional educational publishers
- You're doing a post-functionality polish pass before classroom deployment

## Prerequisites

- All 117 `w-activities/LPD*.vue` files exist and are at Level 3
- `katex` is installed as a dependency (check `package.json`)
- `src/composables/useMathRenderer.js` exists
- The project's `tailwind.config.js` has the custom `math-*`, `surface-*`, `ink-*` color palette (it does)

## Execution Strategy

Split into **4 batches** processed sequentially:

| Batch | Area | Files | Depends on |
|-------|------|-------|------------|
| 1 | KaTeX rendering + font de-duplication | All 117 + index.html | Nothing |
| 2 | Celebration animations | All 117 | Batch 1 |
| 3 | Accessibility attributes | All 117 | Batch 1 |
| 4 | Color standardization + responsive SVG fixes | All 117 | Batch 1 |

Each batch: use the `batch` skill or parallel subagents (3 agents, ~39 files each). Verify between batches. Commit after each.

---

## Batch 1: KaTeX + Font Fix

### 1.1 Create MathText shared component

Create `w-activities/MathText.vue`:

```vue
<template>
  <span v-html="rendered"></span>
</template>

<script setup>
import { computed } from 'vue'
import { renderMath } from '../src/composables/useMathRenderer.js'

const props = defineProps({
  content: { type: String, default: '' }
})

const rendered = computed(() => renderMath(props.content))
</script>
```

### 1.2 Wire MathText into activity templates

For each LPD file, replace raw `v-html` instruction rendering:

**Before:**
```vue
<div class="mb-6 prose prose-sm text-slate-600" v-html="instruction"></div>
```

**After:**
```vue
<MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />
```

Also replace any plain-text math in feedback texts. Where feedback contains formulas like `"a² + b² = c²"`, convert to LaTeX notation `\(a^2 + b^2 = c^2\)` so the KaTeX renderer picks it up.

Import MathText at the top of each file:
```vue
import MathText from './MathText.vue'
```

**Tip for large-scale replacement:** Many files share identical instruction rendering patterns. Use a single find+replace across all 117 files:
- Pattern: `<div class="mb-6 prose prose-sm text-slate-600" v-html="instruction">` 
- Replace with `<MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />`

### 1.3 Move font import to index.html

**Add to `index.html` `<head>`:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">
```

**Remove from all 117 SFCs:**
```css
/* Remove this from every file's scoped <style> */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');
```

This is a simple find+replace across all files.

### Verification for Batch 1

```bash
# KaTeX — every file should now import MathText or reference katex
grep -c "MathText\|renderMath\|katex" w-activities/LPD*.vue

# Font import should be gone from all w-activities
grep -c "fonts.googleapis.com" w-activities/LPD*.vue
# Expected: 0

# The index.html should have the font link
grep "fonts.googleapis.com" index.html
# Expected: 1
```

---

## Batch 2: Celebration Animations

### 2.1 Create SuccessCelebration component

Create `w-activities/SuccessCelebration.vue`:

```vue
<template>
  <div v-if="show" class="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
    <!-- Checkmark burst -->
    <div class="relative">
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-24 h-24 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
      </div>
      <div class="relative w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center">
        <PhCheck weight="bold" class="w-12 h-12 text-white" />
      </div>
    </div>
    <!-- Confetti particles -->
    <div v-for="i in 12" :key="i" class="absolute w-2 h-2 rounded-full"
      :style="{
        backgroundColor: colors[i % colors.length],
        left: `${50 + (Math.random() - 0.5) * 60}%`,
        top: `${50 + (Math.random() - 0.5) * 60}%`,
        animation: `confetti-fall ${0.5 + Math.random() * 0.5}s ease-out forwards`,
        animationDelay: `${Math.random() * 0.3}s`
      }">
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { PhCheck } from '@phosphor-icons/vue'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['done'])

const colors = ['#34d399', '#60a5fa', '#fbbf24', '#f472b6', '#a78bfa', '#fb923c']

watch(() => props.show, (val) => {
  if (val) {
    setTimeout(() => emit('done'), 1500)
  }
})
</script>

<style scoped>
@keyframes confetti-fall {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(80px) scale(0); opacity: 0; }
}
</style>
```

### 2.2 Wire into activities

In each LPD file, add near the feedback area or after the main interactive area:

```vue
<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" />
```

Add ref:
```vue
const celebrationDone = ref(false)
```

Reset in `resetActivityState()`:
```vue
celebrationDone.value = false
```

**Selective application:** Not every activity needs the full confetti. Simple click activities can show a subtle version. For efficiency in batch processing, apply a standard variant to all files first, then refine.

### Verification for Batch 2

```bash
grep -c "SuccessCelebration\|celebrationDone\|confetti" w-activities/LPD*.vue
# Expected: all 117 files
```

---

## Batch 3: Accessibility

### 3.1 SVG interactive elements

For every clickable SVG circle/rect/path, add:

```vue
<circle
  role="button"
  tabindex="0"
  :aria-label="`Selecteer punt (${x}, ${y})`"
  @click="handleClick(x, y)"
  @keydown.enter.prevent="handleClick(x, y)"
  @keydown.space.prevent="handleClick(x, y)"
/>
```

**Key changes per file:**
- All `<circle v-for>` in clickable grids/radars get `role="button"` + `tabindex`
- All SVG `<g>` containers that handle clicks get the same
- Add `:aria-label` describing the interaction
- Add `@keydown.enter` and `@keydown.space` alongside `@click`

### 3.2 Feedback live region

Wrap the feedback container with:
```vue
<div aria-live="polite" aria-atomic="true">
  <!-- existing feedback -->
</div>
```

### 3.3 Drag-and-drop accessibility

HTML5 native drag is not keyboard-accessible. For drag-drop activities, add a **click-to-select, click-to-place** fallback that activates on keyboard focus + Enter:

```vue
<div
  role="button"
  tabindex="0"
  :aria-label="`Sleep ${item.label} naar het juist vak`"
  @click="selectItem(item)"
  @keydown.enter.prevent="selectItem(item)"
  @keydown.space.prevent="selectItem(item)"
>
```

### 3.4 Focus management

Ensure the main interactive area receives focus when an activity opens:
```vue
<div ref="mainArea" tabindex="-1" class="...">
```

```vue
// In the isOpen watcher:
nextTick(() => mainArea.value?.focus())
```

### Verification for Batch 3

```bash
grep -c "role=\|aria-\|tabindex\|keydown\.enter\|keydown\.space" w-activities/LPD*.vue
# Expected: all 117 files have at least some a11y attributes
```

---

## Batch 4: Color + Responsive

### 4.1 Standardize accent colors

The `tailwind.config.js` already defines these custom colors:

```js
colors: {
  math: {
    blue:   '#2563EB', 'blue-light':  '#DBEAFE', 'blue-bg':  '#EFF6FF',
    orange: '#EA580C', 'orange-light':'#FED7AA', 'orange-bg':'#FFF7ED',
    emerald:'#059669', 'emerald-light':'#A7F3D0','emerald-bg':'#ECFDF5',
    violet: '#7C3AED', 'violet-light':'#DDD6FE','violet-bg':'#F5F3FF',
  },
  surface: { white: '#FFF', 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1' },
  ink: { DEFAULT: '#1E293B', light: '#475569', muted: '#94A3B8', dark: '#0F172A' },
}
```

Replace arbitrary color classes with these tokens:

| Old pattern | Replace with |
|-------------|-------------|
| `bg-rose-100` | `bg-math-blue-bg` (for algebra) |
| `text-rose-600` | `text-math-blue` |
| `bg-amber-100` | `bg-surface-100` |
| `border-rose-200` | `border-surface-200` |

**Optional:** Map color by topic domain for visual grouping:

| Domain | Color |
|--------|-------|
| Algebra / functions | `math-blue` |
| Geometry / measurement | `math-emerald` |
| Statistics / probability | `math-orange` |
| Logic / set theory | `math-violet` |
| Numbers / operations | `ink-DEFAULT` (neutral) |

### 4.2 Responsive SVG fixes

For each SVG container, ensure responsive scaling:

**Before:**
```vue
<svg width="400" height="400">
```

**After:**
```vue
<svg viewBox="0 0 400 400" class="w-full max-w-md h-auto">
```

Also add to SVG interactive elements:
```css
touch-action: manipulation;
```

### Verification for Batch 4

```bash
# Spot-check 5 random files for theme color usage
# Check that SVGs use viewBox + responsive classes
grep "viewBox" w-activities/LPD*.vue | head -5
grep "w-full.*h-auto" w-activities/LPD*.vue | head -5
```

---

## Overall Verification Checklist

```bash
echo "=== Final Verification ==="
echo "KaTeX: $(grep -l 'MathText\|renderMath' w-activities/LPD*.vue | wc -l)/117"
echo "Font dupes: $(grep -c 'fonts.googleapis.com' w-activities/LPD*.vue | grep -v '^0$' | wc -l) remaining"
echo "Celebration: $(grep -l 'SuccessCelebration' w-activities/LPD*.vue | wc -l)/117"
echo "A11y roles: $(grep -l 'role=' w-activities/LPD*.vue | wc -l)/117"
echo "Aria live: $(grep -l 'aria-live' w-activities/LPD*.vue | wc -l)/117"
echo "viewBox SVGs: $(grep -c 'viewBox' w-activities/LPD*.vue | head -1)"
```

## File Management

```bash
# Before each batch:
git add -A && git commit -m "backup before ui-polish batch N"
# After verification passes:
git add -A && git commit -m "ui-polish batch N complete"
# If verification fails:
git reset --hard HEAD~1 && retry
```

## Key Risks

| Risk | Mitigation |
|------|------------|
| KaTeX syntax errors break rendering | Test 3 high-complexity files visually after batch 1 |
| MathText component import path breaks | Verify `../src/composables/` path works from `w-activities/` — test with a single file first |
| Celebration component conflicts with existing animations | Use CSS-only (no JS animation libs) to avoid conflicts |
| Find+replace on 117 files misses some | Run grep verification after each batch, spot-check outliers |
