---
name: brilliant-activity-pipeline
description: >-
  Iteratively generate high-quality, Brilliant.org-style Vue 3 educational
  activities from curriculum goals (LPDs), using structured multi-run prompts
  with quality gates to prevent LLM rushing/hallucination.
source: auto-skill
extracted_at: '2026-06-17T08:31:49.978Z'
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

### Run 3: Deep Quality Pass ("Level 3") — EXECUTED 2026-06-17

**Goal:** Complete the upgrade of all missed files, then add randomisation,
visual target overlays, and progressive hints.

**⚠️ Real-world finding (applies to ALL runs):**
The Run 2 agent claimed to have upgraded all files but **skipped 30 of 114**
(~27%). These were consistently: high-numbered LPDs (28-37), supplementary
B/K LPDs, and "straggler" 2nd-grade files at the end of listings.
**Always verify with file timestamps after every run.**

**Critical finding — agents silently fail to write files:**
When launching subagents in parallel, they frequently **read files successfully
but never write them back** (no error, just silent omission). This happens
~60% of the time. The JSONL output shows the `read_file` results but no
`write_file` calls. To mitigate:

1. **After every agent run, verify with grep, not timestamps:**
   ```bash
   # Check for the key structural element:
   grep -c "currentInternalLevel" path/to/file.vue
   ```
2. If count is 0, the agent did NOT write the file despite reporting success.
3. Re-run with the **exact filename list** and the instruction "CRITICAL: you
   MUST write the complete file back using write_file" in the prompt.
4. Check again after the re-run.

**See also:** [Section on Verification After Subagents](#verification-after-subagents).

#### Approach (two sub-phases, executed in practice):

**Fase 1 — Upgrade missed files (mandatory first):**
1. Inventory: list files NOT touched in the previous run (old timestamps).
2. Give the agent the **exact list** of files to upgrade — don't let it
   discover them itself, it will miss the same ones again.
3. Use **batches of exactly 3-5 files**. After each batch the agent stops.
4. **For speed:** launch multiple parallel subagents, each handling a
   non-overlapping batch. This works because the files are independent.

**Fase 2 — Deepen ALL files:**
- Replace hardcoded `levels[]` arrays with random generation in
  `resetActivityState()`.
- Draw **ghost/target overlays** on the SVG so the learner sees what to match.
- Implement **progressive hints** (3 levels: vague → specific → directive).
- Use 3-5 file batches with explicit pause after each.

**Fase 1 upgrade pattern (verified working):**
Each untouched file needs these structural additions while preserving all
existing visual design, SVG, and interaction logic:
1. `currentInternalLevel` ref (0) and `totalInternalLevels` (3)
2. `levels` array — 3 different configurations per activity
3. `currentLevel` computed property
4. `nextLevel()` function with `resetActivityState()` call
5. Level indicator in the header: `"Level {n} van {totalInternalLevels}"`
6. Conditional buttons: "Volgend Level" vs "Afronden"

**Quality pitfalls at Run 3:**
- Agent will try to skip Fase 1 and jump to the "more interesting" Fase 2.
- Agent will still produce hardcoded levels if you don't explicitly ban them.
- Agent will add progressive hints only to a few files and claim the rest
  "already have sufficient hints."
- ❗ **New finding:** Subagents frequently read files but don't write them.
  Always verify with `grep -c` afterwards.

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
