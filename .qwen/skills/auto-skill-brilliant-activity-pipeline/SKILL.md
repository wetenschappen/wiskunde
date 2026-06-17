---
name: brilliant-activity-pipeline
description: >-
  Iteratively generate high-quality, Brilliant.org-style Vue 3 educational
  activities from curriculum goals (LPDs), using structured multi-run prompts
  with quality gates to prevent LLM rushing/hallucination.
source: auto-skill
extracted_at: '2026-06-17T09:26:17.973Z'
---

# Brilliant Activity Pipeline

Generate Singapore-math / Brilliant.org-style Vue 3 educational activities from
a list of curriculum goals (Leerplandoelen / LPDs). The approach is designed to
prevent LLM agents from rushing, half-assing, or hallucinating completion by
splitting the work into strict phases and micro-batches.

## When to use this skill

- You have a list of curriculum objectives (LPDs / learning goals) and need
  interactive, pedagogically sound Vue 3 activities for each one.
- You want the activities to follow CPA (Concrete-Pictorial-Abstract) didactics
  and Brilliant.org-style "interaction is the answer" design.
- You are working with an LLM agent that tends to rush or hallucinate
  completion when the task is large.

## Required Inputs

1. A file with learning goals (e.g., `1stegraad.txt`, `2degraad.txt`)
2. A starter Vue component template (e.g., `CustomActivityStarter.vue`)
3. A target output directory (e.g., `w-activities/`)

## Critical Verification — Count Files Before & After Every Run

LLM agents **will** claim full completion while skipping files. This is the #1 failure mode.

```bash
# BEFORE starting any run:
BEFORE=$(ls -1 w-activities/*.vue | wc -l)
echo "Files before: $BEFORE"

# AFTER the agent claims completion:
AFTER=$(ls -1 w-activities/*.vue | wc -l)
echo "Files after:  $AFTER"

# Check timestamps — any file with an old timestamp was skipped:
ls -lt w-activities/*.vue | tail -20
```

If the file count hasn't changed but should have, the agent skipped the work.
If some files have old timestamps, those were not touched.

## Concrete Code Pattern for Upgrading Single-Level → Multi-Level

When adding 3 levels to an existing component, use this exact structural pattern.
It preserves all existing visual design while adding level navigation.

```vue
<script setup>
// ... existing imports ...

// --- LEVEL STRUCTURE (add this) ---
const currentInternalLevel = ref(0)
const totalInternalLevels = 3

const levels = [
  { /* level 1 config */ },
  { /* level 2 config */ },
  { /* level 3 config */ },
]

const currentLevel = computed(() => levels[currentInternalLevel.value])

function nextLevel() {
  if (currentInternalLevel.value < totalInternalLevels - 1) {
    currentInternalLevel.value++
    resetActivityState()  // MUST call reset
  } else {
    emit('complete')
  }
}
// --- END LEVEL STRUCTURE ---

// In resetActivityState(), reference currentLevel.value instead of hardcoded values
function resetActivityState() {
  // ... existing resets ...
  // Use: const lvl = currentLevel.value
}
</script>

<template>
  <!-- In header, add level indicator: -->
  <p class="text-xs font-medium text-slate-500">
    Level {{ currentInternalLevel + 1 }} van {{ totalInternalLevels }}
  </p>

  <!-- After feedback section, replace single "Afronden" button with: -->
  <button v-if="isCorrect && currentInternalLevel < totalInternalLevels - 1"
          @click="nextLevel" class="...">
    Volgend Level
  </button>
  <button v-if="isCorrect && currentInternalLevel >= totalInternalLevels - 1"
          @click="goToNextStep" class="...">
    Afronden
  </button>
</template>
```

## Batch Sizing Strategy

| Batch size | Best for | Pitfall |
|---|---|---|
| 1 file at a time | Most reliable, highest quality | Slow (dozens of roundtrips) |
| 3 files at a time | **Sweet spot** for quality vs speed | Agent may still skip files 2-3 |
| 5+ files at a time | Fast but risky | Agent rushes, quality drops |
| Parallel subagents | Fastest for large codebases | Need clear file boundaries |

For large codebases (50+ files), **launch multiple parallel subagents** each
handling a non-overlapping batch of 3 files. This speeds up the work
significantly without sacrificing quality.

## The 3-Run Pipeline

### Run 1: Initial Generation ("Level 1")

**Goal:** Create one `.vue` component per learning goal with basic interactivity.

**Prompt structure:**
- Instruct the agent to work LPD-by-LPD, using a **forced chain-of-thought**:
  STAP 1 (Analyse & Brainstorm as markdown) → STAP 2 (Self-review checklist) →
  STAP 3 (Generate code) → STAP 4 (Pause & ask for confirmation).
- The checklist must include didactic checks (CPA, active interaction,
  visual/concrete elements, specific feedback).
- Require Vue 3 `<script setup>`, TailwindCSS, `@phosphor-icons/vue`.
- **Critical:** After each LPD, the agent MUST stop and ask "Wil je doorgaan
  naar LPD [X+1]?" — this prevents context-window overload and rushing.

**Quality pitfalls at Run 1:**
- Agent will produce multiple-choice instead of drag/slider interaction.
- Agent will hardcode all data instead of using `resetActivityState()`.
- Agent will claim completion with placeholder code.

### Run 2: Brilliant.org Upgrade ("Level 2")

**Goal:** Turn static visualisation+quiz patterns into "interaction is the answer."

**Prompt structure:**
- Declare this "Fase 2: Brilliant.org Upgrade".
- Replace multiple-choice with physical manipulation (sliders, dragging points,
  graph tweaking).
- Replace static data with **arrays of 3 internal levels** per activity.
- Add specific didactic hints instead of generic "Fout" feedback.
- Use the same pause-after-each-file or batch-of-3 approach.

**Quality pitfalls at Run 2:**
- Agent will skip files without noticing (especially files at the end of a
  listing, high-numbered LPDs, or supplementary B/K LPDs).
- Agent will claim "alles is afgerond" after only partial coverage.
- Agent will do a shallow sweep: add a `levels` array but not change the
  interaction model.

**Mitigation — count the files!**
```bash
# Before starting, inventory:
BEFORE=$(ls -1 w-activities/*.vue | wc -l)
ls -lt w-activities/*.vue | head -5
# After completion, recount. Any discrepancy means files were skipped.
AFTER=$(ls -1 w-activities/*.vue | wc -l)
echo "Files: $BEFORE → $AFTER"
# Check which files still have old timestamps:
find w-activities/ -name "*.vue" -newer /tmp/reference_point | wc -l
```

### Run 3: Deep Quality Pass ("Level 3")

**Goal:** Upgrade all 117 LPD files to true Brilliant.org quality by adding
randomisation, progressive hints, and manipulation=answer.

**Three pillars of Level 3:**

1. **Randomization / Replayability** — Replace hardcoded `levels[]` arrays with
   a `generateLevel()` function called inside `resetActivityState()`. Level 1
   uses constrained random (small numbers), Levels 2-3 use wider ranges. Each
   time the activity opens, new numbers/targets are generated.
2. **Progressive Hints (3-traps scaffolding)** — Add `const attemptCount = ref(0)`.
   On error 1: vague hint. Error 2: specific hint targeting the misconception.
   Error 3+: direct directive ("Probeer a = 2 in te stellen"). `feedback.text`
   becomes dynamic based on `attemptCount`.
3. **Manipulation = Answer (Interaction as Answer)** — Wherever possible,
   `isCorrect` becomes true during manipulation (click, drag, slider match)
   instead of via a check button. For activities where a check button remains,
   it only shows "klopt/niet" while real guidance comes from hints.

#### Concrete Level 3 Code Pattern

Add these to the existing Level 2 structure:

```vue
<script setup>
// ... existing Level 2 structure (currentInternalLevel, totalInternalLevels, nextLevel) ...

// 1. RANDOMIZATION — replace const levels with generateLevel()
const levels = ref([])

function generateLevel() {
  // Return 3 level configs with randomized parameters
  // Level 0: constrained random (easy numbers)
  // Level 1: wider ranges
  // Level 2: full range / more complex
  return [
    { /* randomized params for level 1 */ },
    { /* randomized params for level 2 */ },
    { /* randomized params for level 3 */ },
  ]
}

// 2. PROGRESSIVE HINTS
const attemptCount = ref(0)

function getHint(level, errorType) {
  // attemptCount starts at 0, incremented on each wrong attempt
  if (attemptCount.value <= 1) return 'Vague hint: think about the concept...'
  else if (attemptCount.value === 2) return 'Specific hint: check your calculation...'
  else return 'Directive: the answer is...'
}

function resetActivityState() {
  // ... existing resets ...
  levels.value = generateLevel()   // fresh randomization
  attemptCount.value = 0            // reset hints
  // ... ensure currentLevel computed still works:
  // currentLevel = computed(() => levels.value[currentInternalLevel.value])
}
</script>

<template>
  <!-- 3. MANIPULATION = ANSWER: conditional button logic -->
  <button v-if="!isCorrect && needsCheckButton" @click="checkAnswer">
    Controleer
  </button>
  <button v-if="!isCorrect && isAutoCorrect" disabled class="...">
    Schuif/klik naar het juiste antwoord
  </button>
  <button v-if="!isCorrect && showHintButton" @click="showHint">
    Geef me een hint
  </button>
  <!-- Volgend Level / Afronden buttons unchanged from Level 2 -->
</template>
```

#### Interaction-to-Treatment Rules for Manipulation = Answer

| Interaction type (detect from existing code) | Rule |
|---|---|
| Click-on-target (SVG grid, radar, clickable shapes) | **Auto-correct** — set `isCorrect.value = true` in click handler. Remove Controleer button entirely. Replace with a hint button or instructional text. |
| Drag-and-drop into correct slot(s) | **Auto-correct** — validate on each drop; when all slots filled correctly, set `isCorrect.value = true`. Remove Controleer button. |
| Slider matching a visible target (ghost overlay) | **Auto-correct** — use `watch` on the slider value with a debounce (800ms-1.5s). When value matches target within threshold, set `isCorrect.value = true`. Remove Controleer. |
| Slider exploration + separate answer field | **Keep check button** — slider is for exploration, answer is typed. Use `attemptCount`-based hints in feedback. |
| Number/equation text input | **Keep check button** — on wrong, show `attemptCount`-based progressive hint. Button only shows "klopt/niet". |
| Multi-step calculation (drag operations, button sequence) | **Keep check button** — the answer is a process, not a single interaction. Use `attemptCount`-based hints. |

**Auto-correct hint pattern:** For auto-correct activities, replace the removed
"Controleer" button with a "Geef me een hint" button that reveals progressively
more specific guidance by incrementing `attemptCount` and showing the hint tier.

#### Git-Based Rollback Strategy

Run 3 processes many files — a bad batch can corrupt prior work. Use git commits
as incremental backup points:

```bash
# Before each batch:
git add -A && git commit -m "backup before batch N"

# Run the batch...

# After batch verification:
#   PASS → git add -A && git commit -m "batch N complete"
#   FAIL → git reset --hard HEAD~1  # restore to pre-batch state
```

This gives clean rollback for any batch without losing prior batches.

#### Batch Sizing & Parallel Execution (verified working 2026-06-17)

When upgrading 117 files from Level 2 → Level 3:

- **Split into 5 batches of ~23 files each** (logical LPD grouping)
- **Per batch: launch 3 parallel subagents, each handling 7-8 files**
- Chunk size of 7-8 files per agent works well with the "CRITICAL: write_file"
  instruction — agents complete without rushing
- Verify after each batch before proceeding
- The `batch` skill can be used or manual agent launches with `agent` tool

#### Verification (Level 3 specific)

Check ALL three pillars with grep:

```bash
echo "=== Randomization ==="
for f in w-activities/LPD*.vue; do
  c=$(grep -c "generateLevel" "$f" 2>/dev/null || echo "0")
  [ "$c" -eq 0 ] && echo "❌ NO RANDOM: $(basename $f)"
done

echo "=== Progressive Hints ==="
for f in w-activities/LPD*.vue; do
  c=$(grep -c "attemptCount" "$f" 2>/dev/null || echo "0")
  [ "$c" -eq 0 ] && echo "❌ NO HINTS: $(basename $f)"
done

echo "=== Summary ==="
grep -l "generateLevel" w-activities/LPD*.vue | wc -l   # randomization count
grep -l "attemptCount" w-activities/LPD*.vue | wc -l     # hints count
```

**Note on false negatives:** Some agents use alternative randomization
strategies (template shuffling, pool-based selection) instead of a function
literally named `generateLevel`. These still count as having randomization.
Spot-check 2-3 files per batch for manipulation=answer correctness.

#### Known Pitfalls (Level 3 specific)

| Problem | Solution |
|---|---|
| Agent names the generator function differently | Accept alternative randomization (shuffle, pool, randomInt) — verify intent, not exact name |
| Agent adds hints only to 1-2 levels, not all 3 | Check `attemptCount` usage spans all 3 levels in `checkAnswer()` |
| Agent writes `isCorrect = true` but keeps the Controleer button | Spot-check: verify button is removed/hidden for auto-correct activities |
| Agent skips manipulation=answer entirely and just adds hints | Enforce "you MUST apply ALL three pillars" in the prompt |
| Agent declares success without writing files (~60% failure rate) | Verify with `grep -c "generateLevel"` + `grep -c "attemptCount"` immediately after each batch; re-run with explicit "write_file" instruction

## Verification After Subagents

Always verify that subagents actually wrote their files. Agents consistently
claim completion while files remain untouched.

```bash
# 1. Check ALL target files for the structural element:
for f in w-activities/LPD*.vue; do
  count=$(grep -c "currentInternalLevel" "$f" 2>/dev/null || echo "0")
  if [ "$count" -eq 0 ]; then
    echo "❌ MISSING: $(basename $f)"
  fi
done

# 2. Get a summary:
TOTAL=$(ls -1 w-activities/LPD*.vue | wc -l)
UPGRADED=$(ls w-activities/LPD*.vue | xargs grep -l "currentInternalLevel" 2>/dev/null | wc -l)
echo "Total: $TOTAL | Upgraded: $UPGRADED | Missing: $((TOTAL - UPGRADED))"
```

If any files are missing, the agent silently failed. Re-run with explicit
"CRITICAL: you MUST write the complete file back using write_file" instruction.

## Enforcement Mechanisms

| Problem | Solution |
|---|---|
| Agent rushes past files | Force batches of **exactly 3 files**, pause after each |
| Agent hallucinates completion | Give the agent the **exact file count** before starting; verify with `ls -lt` after |
| Agent skips same files repeatedly | Provide the **explicit filename list** of what needs upgrading |
| Agent writes placeholders | Ban `// rest of the code` explicitly in the prompt |
| Agent skips the pause step | Instruct: "Write NO code after the pause — only the question" |
| Agent gives vague feedback | Require feedback to name *what* is visually wrong |
| Large codebase (50+ files) | Use parallel subagents for independent batches |

## File-Naming Convention

Use meaningful names that incorporate the LPD number and topic:
```
LPD{Nr}_{Grade}_{Topic}.vue
LPD31_2_QuadraticFeatures.vue
LPD15_2_TrigCircle.vue
LPD_K1_CircleProperties.vue
```

## Template Requirements (remind the agent every run)

- Use the project's `CustomActivityStarter.vue` as base.
- Prefer `@phosphor-icons/vue` over emoji or plain text icons.
- Every component must expose `props.isOpen`, `emit('close')`, `emit('complete')`.
- Use `resetActivityState()` for initialisation.
- Use `isCorrect`, `isChecked`, `feedback` (type + text) for state.
