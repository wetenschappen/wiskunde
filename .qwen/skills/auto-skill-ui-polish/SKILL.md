---
name: ui-polish
description: Upgrade Vue 3 educational math activities to publisher-quality UI/UX (KaTeX, animations, a11y, theming, responsive)
source: auto-skill
extracted_at: '2026-06-17T12:55:00.000Z'
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

Replace all raw `v-html` instruction rendering with `<MathText :content="..." />`.
**There are 7 distinct template patterns to handle** (grep to find which apply):

| # | Pattern | Class variant | Files affected | Replacement |
|---|---------|---------------|----------------|-------------|
| 1 | `v-html="instruction"` | `prose prose-sm text-slate-600` | ~89 | `<MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />` |
| 2 | `v-html="instruction"` | `prose prose-sm prose-invert text-slate-300` | ~3 | `<MathText :content="instruction" class="mb-6 prose prose-sm prose-invert text-slate-300" />` |
| 3 | `v-html="props.instruction"` | both variants | ~12 | `<MathText :content="props.instruction" ... />` |
| 4 | `v-html="displayInstruction"` | `text-slate-600` | ~2 | `<MathText :content="displayInstruction" ... />` |
| 5 | `v-html="currentLevel.instruction"` | both variants | ~5 | `<MathText :content="currentLevel.instruction" ... />` |
| 6 | `v-html="currentLevelData.instruction"` | both variants | ~3 | `<MathText :content="currentLevelData.instruction" ... />` |
| 7 | `v-html="currentInstruction"` | `text-slate-600` | ~3 | `<MathText :content="currentInstruction" ... />` |
| 8 | `v-html="currentLevel.instruction \|\| props.instruction"` | `text-slate-600` | ~1 | `<MathText :content="currentLevel.instruction \|\| props.instruction" ... />` |

**Important:** When using sed for pattern #8 (contains `||`), use `#` delimiter instead of `|`:
```bash
# DON'T: sed uses | as delimiter, breaks on ||
sed -i 's|...||...||...|...|' file    # BROKEN

# DO: use # delimiter
sed -i 's#<div class="mb-6 prose prose-sm text-slate-600" v-html="currentLevel.instruction || props.instruction"></div>#<MathText :content="currentLevel.instruction || props.instruction" class="mb-6 prose prose-sm text-slate-600" />#g' file
```

**All patterns are single-line** (opening tag and `</div>` on the same line). Use grep to discover exact patterns:
```bash
grep -r 'v-html=".*instruction' w-activities/LPD*.vue | sed 's/.*\(<div.*v-html=".*instruction">\).*/\1/' | sort -u
```

Also add the import at the top of each file. The imports use two formats:
- **Multi-line** (most files): `} from '@phosphor-icons/vue'` — the `{` is on a previous line
- **Single-line** (some files): `import { PhX, ... } from '@phosphor-icons/vue'`

Add the import AFTER the Phosphor import:
```bash
# Target the closing brace line for multi-line imports:
sed -i "s|^} from '@phosphor-icons/vue'|&\\\nimport MathText from './MathText.vue'|" w-activities/LPD*.vue
```

**Tip for large-scale replacement:** Use sed with the correct patterns:
```bash
# Pattern 1 (89 files):
sed -i 's|<div class="mb-6 prose prose-sm text-slate-600" v-html="instruction"></div>|<MathText :content="instruction" class="mb-6 prose prose-sm text-slate-600" />|g' w-activities/LPD*.vue

# Pattern 2 (3 files):
sed -i 's|<div class="mb-6 prose prose-sm prose-invert text-slate-300" v-html="instruction"></div>|<MathText :content="instruction" class="mb-6 prose prose-sm prose-invert text-slate-300" />|g' w-activities/LPD*.vue

# Run ALL 8 pattern replacements in sequence (safe because unmatched patterns are no-ops)
```

### 1.3 Move font import to index.html

**Add to `index.html` `<head>`:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">
```

**Remove from all SFCs in w-activities** (not just LPD files — non-LPD files like `CustomActivityStarter.vue`, `PythagorasActivity.vue`, `CircuitsActivity.vue` also have it):

```bash
# Remove standard import from all w-activities files:
for f in w-activities/LPD*.vue; do
  sed -i "/@import url('https:\/\/fonts.googleapis.com\/css2?family=Inter:wght@400;500;700;800&display=swap');/d" "$f"
done

# Also remove from non-LPD files:
sed -i "/@import url('https:\/\/fonts.googleapis.com\/css2?family=Inter:wght@400;500;700;800&display=swap');/d" w-activities/CustomActivityStarter.vue
sed -i "/@import url('https:\/\/fonts.googleapis.com\/css2?family=Inter:wght@400;500;700;800;900&display=swap');/d" w-activities/CircuitsActivity.vue
sed -i "/@import url('https:\/\/fonts.googleapis.com\/css2?family=Inter:wght@400;500;700;800&display=swap');/d" w-activities/PythagorasActivity.vue
```

**Watch for variant parameters:** Some files use `display=true` instead of `display=swap`:
```bash
# Check for remaining font imports:
grep -rn "fonts.googleapis.com" w-activities/
```

### Verification for Batch 1

```bash
# KaTeX — every file should now import MathText
echo "MathText import: $(grep -l 'import MathText' w-activities/LPD*.vue | wc -l)/117"
echo "MathText template: $(grep -l '<MathText' w-activities/LPD*.vue | wc -l)/117"

# Font import should be gone from ALL w-activities (not just LPD)
echo "Font imports remaining: $(grep -r 'fonts.googleapis.com' w-activities/ | wc -l) (want 0)"

# The index.html should have the font link
echo "Font link in index.html: $(grep -c 'fonts.googleapis.com' index.html) (want 2 — preconnect + stylesheet)"

# No remaining v-html instruction patterns
echo "Remaining v-html instruction: $(grep -rl 'v-html=".*instruction' w-activities/LPD*.vue | wc -l) (want 0)"
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

Add 4 things to each LPD file:

1. **Import**: `import SuccessCelebration from './SuccessCelebration.vue'` — add AFTER the MathText import
2. **Ref**: `const celebrationDone = ref(false)` — add AFTER `const isCorrect = ref(...)` (or near other refs)
3. **Template**: Before the last `</template>`: `<SuccessCelebration :show="isCorrect && !celebrationDone" @done="celebrationDone = true" />`
4. **Reset**: `celebrationDone.value = false` — add INSIDE `resetActivityState()` after `isCorrect.value = false`

#### ⚠️ CRITICAL GOTCHAS

**GOTCHA 1: Some files have nested `<template>` tags** (12 files — LPD10_GCDRuler, LPD11_FractionArea, LPD14_SquareRoot, LPD15_PowerOfPower, LPD15_ProductRule, LPD16_EqualSign, LPD16_OrderOfOps, LPD27_FillPrism, LPD36_FrequencyTable, LPD37_RobotDebug, LPD_K2_GraphModel, LPD_K3_EulerPath). These use `<template v-for="">` inside the root template. When using `sed 's|</template>|...|g'`, it matches **every** `</template>` in the file, creating duplicate SuccessCelebration tags.

**Fix:** After initial insertion, remove duplicates from affected files:
```bash
# Remove ALL SuccessCelebration lines
sed -i '/<SuccessCelebration :show=/d' w-activities/LPD*.vue
# Re-add exactly ONE line before the LAST </template> in the file
```

**GOTCHA 2: Multiple `isCorrect.value = false` occurrences** — ~55 files have this pattern in BOTH `resetActivityState()` AND answer-checking logic. Adding `celebrationDone.value = false` after every occurrence creates duplicates.

**Fix:** Use `awk` to target only the `resetActivityState()` function:
```bash
awk '/function resetActivityState/{infunc=1} infunc && /isCorrect.value = false/{print; print "celebrationDone.value = false"; infunc=0; next} 1' file > file.tmp && mv file.tmp file
```

**GOTCHA 3: Indentation** — sed adds matching lines at column 0. Read the file first to check indentation context, and adjust if needed. Files with dark theme typically use more deeply indented template blocks.

#### Recommended step-by-step approach:

```bash
# Step 1: Add import (after MathText import)
sed -i "/import MathText from '.\/MathText.vue'/a import SuccessCelebration from '.\/SuccessCelebration.vue'" w-activities/LPD*.vue

# Step 2: Add ref (after isCorrect ref)
sed -i "/const isCorrect = ref(/a const celebrationDone = ref(false)" w-activities/LPD*.vue

# Step 3: Add reset (INSIDE resetActivityState only — use awk)
for f in w-activities/LPD*.vue; do
  awk '/function resetActivityState/{infunc=1} infunc && /isCorrect.value = false/{print; print "celebrationDone.value = false"; infunc=0; next} 1' "$f" > "${f}.tmp" && mv "${f}.tmp" "$f"
done

# Step 4: Add template before </template>
for f in w-activities/LPD*.vue; do
  sed -i 's|</template>|<SuccessCelebration :show="isCorrect \&\& !celebrationDone" @done="celebrationDone = true" />\n</template>|' "$f"
done

# Step 5: Fix 12 files with duplicate template tags (see Gotcha 1)
# Remove all SuccessCelebration from affected files
for f in LPD10_GCDRuler LPD11_FractionArea LPD14_SquareRoot LPD15_PowerOfPower LPD15_ProductRule LPD16_EqualSign LPD16_OrderOfOps LPD27_FillPrism LPD36_FrequencyTable LPD37_RobotDebug LPD_K2_GraphModel LPD_K3_EulerPath; do
  sed -i '/<SuccessCelebration :show=/d' "w-activities/${f}.vue"
  sed -i 's|</template>|<SuccessCelebration :show="isCorrect \&\& !celebrationDone" @done="celebrationDone = true" />\n</template>|' "w-activities/${f}.vue"
done
```

### Verification for Batch 2

```bash
echo "Import: $(grep -l 'import SuccessCelebration' w-activities/LPD*.vue | wc -l)/117"
echo "Template usage: $(grep -l '<SuccessCelebration' w-activities/LPD*.vue | wc -l)/117"
echo "Exactly 1 template per file: $(for f in w-activities/LPD*.vue; do count=$(grep -c '<SuccessCelebration' "$f"); if [ "$count" -eq 1 ]; then echo ok; fi; done | wc -l)/117"
echo "Ref: $(grep -l 'const celebrationDone = ref' w-activities/LPD*.vue | wc -l)/117"
echo "Reset: $(grep -l 'celebrationDone.value = false' w-activities/LPD*.vue | wc -l)/117"
echo "Duplicate resets (expect 0): $(for f in w-activities/LPD*.vue; do count=$(grep -c 'celebrationDone.value = false' "$f"); if [ "$count" -gt 1 ]; then echo "$f"; fi; done | wc -l)"
```

**Note:** `grep -c 'SuccessCelebration'` matches BOTH the import line and the template line (each contains "SuccessCelebration"). Use `grep -c '<SuccessCelebration'` to count only template usage.

---

## Batch 3: Accessibility

**⚠️ Execution strategy matters:** Use sed/awk for the consistent patterns (feedback live region, focus management). These cover 100% of files instantly. Reserve agent-based processing ONLY for SVG aria attributes, which are highly file-specific.

### 3.1 Feedback live region — USE SED

All 117 files have a feedback div with either a single-line or multi-line `:class` binding. Add `role="status"` and `aria-live="polite"` directly to the existing div (no wrapping needed).

**Step 1: Check which patterns exist**
```bash
# Pattern A (single-line, light theme):
grep -l ":class=\"{'bg-emerald-100 text-emerald-800': feedback.type === 'success'" w-activities/LPD*.vue | wc -l

# Pattern B (single-line, dark theme):
grep -l ":class=\"{'bg-emerald-900/50 text-emerald-300 border border-emerald-800': feedback.type === 'success'" w-activities/LPD*.vue | wc -l

# Pattern C (multi-line): files NOT matching patterns A+B
```

**Step 2: Apply sed for single-line patterns**
```bash
sed -i "s/:class=\"{'bg-emerald-100 text-emerald-800': feedback.type === 'success'/role='status' aria-live='polite' aria-atomic='true' :class=\"{'bg-emerald-100 text-emerald-800': feedback.type === 'success'/" w-activities/LPD*.vue

sed -i "s/:class=\"{'bg-emerald-900\/50 text-emerald-300 border border-emerald-800': feedback.type === 'success'/role='status' aria-live='polite' aria-atomic='true' :class=\"{'bg-emerald-900\/50 text-emerald-300 border border-emerald-800': feedback.type === 'success'/" w-activities/LPD*.vue
```

**Step 3: Apply perl for multi-line pattern**
```bash
for f in w-activities/LPD*.vue; do
  if ! grep -q 'aria-live' "$f"; then
    perl -0777 -pi -e 's/(:class="\{\n\s+'\''bg-emerald-100 text-emerald-800'\'')/role="status" aria-live="polite" aria-atomic="true" \1/' "$f"
  fi
done
```

### 3.2 Focus management — USE SED + AWK

**Step 1: Add ref and tabindex to the first content div**
```bash
# Target the FIRST occurrence of flex-1 p-6 overflow-y-auto (the sidebar content)
for f in w-activities/LPD*.vue; do
  sed -i '0,/class="\(flex\( flex-col\)\? \)\?flex-1 p-6 overflow-y-auto"/{s/class="\(flex\( flex-col\)\? \)\?flex-1 p-6 overflow-y-auto"/ref="mainArea" tabindex="-1" class="\1flex-1 p-6 overflow-y-auto"/}' "$f"
done
```

**Step 2: Add nextTick focus in the isOpen watcher**
Use awk to add after `resetActivityState()` calls but NOT after `function resetActivityState()` definitions:

```bash
for f in w-activities/LPD*.vue; do
  awk '{
    if ($0 ~ /resetActivityState\(\)[[:space:]]*;?[[:space:]]*$/ && prev !~ /function/) {
      print
      print "    nextTick(() => mainArea.value?.focus())"
    } else {
      print
    }
    prev=$0
  }' "$f" > "${f}.tmp" && mv "${f}.tmp" "$f"
done
```

**Step 3: Handle 4 edge-case files** where `resetActivityState()` is on the same line as other code:
```bash
# These files have inline watchers: if (...) { resetActivityState(); ... }
# Manually add nextTick focus after the inline call in the watcher.
# Files: LPD31_TablePattern, LPD32_PerfectSquare, LPD33_EquationBalance, LPD33_ReverseMachine
```

### 3.3 SVG interactive elements — USE AGENT FOR THIS PART ONLY

**Do NOT attempt with sed** — the SVG patterns are too varied across 117 files. Use a `general-purpose` subagent per batch of ~39 files.

For each clickable SVG element (`<circle>`, `<rect>`, `<g>` with `@click`), add:
- `role="button" tabindex="0"` 
- `:aria-label="..."` (Dutch, describing the interaction)
- `@keydown.enter.prevent="sameHandler"` 
- `@keydown.space.prevent="sameHandler"`

**How to launch (3 parallel agents, ~39 files each):**
```bash
# Launch agent with clear instructions for its file group.
# Each agent: read file → add SVG attributes → verify → read next file.
# Don't include feedback-live-region or focus-management (already done via sed).
```

**Known challenge:** Each agent processes ~39 files × 3-5 edits = ~156 edits. At 10-20 seconds per edit this takes 30+ min. For time-sensitive work, defer SVG aria.

### 3.4 Drag-and-drop accessibility

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

### Verification for Batch 3

```bash
echo "aria-live: $(grep -l 'aria-live' w-activities/LPD*.vue | wc -l)/117"
echo "mainArea ref: $(grep -l 'ref="mainArea"' w-activities/LPD*.vue | wc -l)/117"
echo "mainArea focus: $(grep -l 'mainArea.value' w-activities/LPD*.vue | wc -l)/117"
echo "role=button: $(grep -l 'role="button"' w-activities/LPD*.vue | wc -l)/117 (may be 0 if SVG pass deferred)"
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
| **KaTeX syntax errors break rendering** | Test 3 high-complexity files visually after batch 1 |
| **MathText component import path breaks** | Verify `../src/composables/` path works from `w-activities/` — test with a single file first |
| **Celebration component conflicts with existing animations** | Use CSS-only (no JS animation libs) to avoid conflicts |
| **Find+replace on 117 files misses some** | Run grep verification after each batch, spot-check outliers |
| **Multiple `</template>` tags per file** | 12 files have nested `<template v-for>` tags — `sed` with global flag hits all of them. Fix post-insertion by removing duplicates |
| **Multiple `isCorrect.value = false` occurrences** | ~55 files use this in both reset AND answer-checking logic. Use `awk` to target only the `resetActivityState()` function |
| **`||` in sed pattern** | Pattern D uses `||` which breaks `|`-delimited sed. Use `#` delimiter instead: `s#pattern#replacement#g` |
| **Variant font import parameters** | Some files use `display=true` instead of `display=swap` — check with `grep -rn fonts.googleapis.com` and handle separately |
| **Inconsistent indentation** | sed adds lines at column 0; the surrounding code may use indentation. Check results and manually fix if needed |
| **Non-LPD files in w-activities** | Font imports also exist in `CustomActivityStarter.vue`, `PythagorasActivity.vue`, `CircuitsActivity.vue` — extend removal beyond `LPD*.vue` |

## Lessons Learned (from execution)

1. **Always read before editing:** The `edit` tool requires you to have read the file first (even a partial read). Use `read_file` with `offset`/`limit` for targeted reading.

2. **Verify with grep after each batch:** Check exact counts. A simple `grep -c SuccessCelebration` gives 2 results (import + template), while `grep -c '<SuccessCelebration'` gives just template usage.

3. **Use parallel subagents for complex file-specific changes:** Batch 3 (accessibility) is too varied to sed across all files. Split 117 files into 3 groups of ~39, each processed by a `general-purpose` agent with clear, per-file instructions.

4. **Commit between batches:** Each batch has a clean `git commit` with a descriptive message. This allows easy rollback if a batch fails verification.

5. **Discover patterns empirically before designing replacements:** Run `grep` to find all variants before writing sed commands. Common files can hide unusual variants.

6. **Phosphor icons are imported in two formats:** Most files use multi-line `{`/`}` style, some use single-line `import { ... } from ...`. Target `} from '@phosphor-icons/vue'` for the multi-line pattern, and the full `import {` line for the single-line pattern.

7. **KaTeX CSS is already imported** in `src/main.js` — no need to add it in index.html or individual activities.
