/**
 * useActivityPedagogy.js
 * Shared composable for the 5 pedagogical improvement patterns:
 * 1. Worked examples (I do → we do → you do)
 * 2. Prediction gates (force commitment before interaction)
 * 3. Method-teaching hints (3-level, never reveal answer)
 * 4. Conceptual "why" explanations after success
 * 5. Error analysis (common misconception detection)
 * 6. Deep reflection (structural understanding, not calculation)
 *
 * Usage in any w-activity:
 *   import { useActivityPedagogy } from './useActivityPedagogy.js'
 *   const ped = useActivityPedagogy({ totalLevels: 3 })
 *
 * Template patterns:
 *   - ped.showWorkedExample → show worked example div
 *   - ped.showPrediction → show prediction gate
 *   - ped.showReflection → show reflection input
 *   - ped.feedback → feedback message
 *   - ped.isCorrect → activity state
 *   - ped.hintCount → for hint button
 *   - ped.attemptCount → for tracking
 */

import { ref, computed } from 'vue'

/**
 * @param {Object} opts
 * @param {number} opts.totalLevels - Number of levels (default 3)
 * @param {string[]} opts.levelLabels - Labels per level (default ['Toepassen', 'Analyseren', 'Evalueren'])
 * @param {boolean} opts.showWorkedOnFirst - Show worked example on level 0 (default true)
 */
export function useActivityPedagogy(opts = {}) {
  const totalLevels = opts.totalLevels || 3
  const levelLabels = opts.levelLabels || ['Toepassen', 'Analyseren', 'Evalueren']
  const showWorkedOnFirst = opts.showWorkedOnFirst !== false

  // ========== State ==========
  const currentLevel = ref(0)
  const isCorrect = ref(false)
  const celebrationDone = ref(false)
  const attemptCount = ref(0)
  const hintCount = ref(0)
  const feedback = ref({ type: 'info', text: '' })

  // Worked example
  const showWorkedExample = ref(showWorkedOnFirst)

  // Prediction gate
  const showPrediction = ref(true)
  const predictedAnswer = ref(null)

  // Reflection
  const showReflection = ref(false)
  const reflectionAnswer = ref('')

  // "Why" explanation
  const showWhy = ref(false)
  const whyText = ref('')

  // Error analysis
  const errorDetected = ref('')

  // ========== Computed ==========
  const isLastLevel = computed(() => currentLevel.value >= totalLevels - 1)
  const levelNumber = computed(() => currentLevel.value + 1)

  // ========== Methods ==========

  /**
   * Skip the worked example and move to the prediction gate or task.
   */
  function skipWorkedExample() {
    showWorkedExample.value = false
    showPrediction.value = !isCorrect.value
  }

  /**
   * Initialize prediction gate (should be called after new level start).
   */
  function initPrediction() {
    showPrediction.value = !showWorkedExample.value && !isCorrect.value
    predictedAnswer.value = null
  }

  /**
   * Check prediction against correct answer.
   * @param {string|number} correctId - The correct option ID
   * @param {Object} options - { successText, errorText }
   * @returns {boolean} Whether prediction was correct
   */
  function checkPrediction(correctId, options = {}) {
    if (predictedAnswer.value === correctId) {
      showPrediction.value = false
      setFeedback('success', options.successText || 'Juist!')
      return true
    } else {
      attemptCount.value++
      setFeedback('error', options.errorText || 'Niet juist. Probeer opnieuw.')
      return false
    }
  }

  /**
   * Show the next-level hint. Hints should follow the 3-level pattern:
   * 1: conceptual direction + formula reminder (no specific values)
   * 2: worked example with DIFFERENT numbers
   * 3: step-by-step with actual numbers, final blank
   * @param {string[]} hints - Array of 3 hint strings
   */
  function showHint(hints) {
    hintCount.value++
    const idx = Math.min(hintCount.value - 1, hints.length - 1)
    if (idx >= 0) {
      setFeedback('info', hints[idx])
    }
  }

  /**
   * Show a conceptual "why" explanation after success.
   * @param {string} text - 2-3 sentence explanation
   */
  function showWhyExplanation(text) {
    showWhy.value = true
    whyText.value = text
  }

  /**
   * Check reflection answer against expected keywords.
   * @param {string[]} keywords - Array of terms the answer should include
   * @param {Object} options - { minLength, errorText }
   * @returns {boolean} Whether reflection passed
   */
  function checkReflection(keywords, options = {}) {
    const ans = reflectionAnswer.value.toLowerCase().trim()
    const minLen = options.minLength || 5
    const hasKeyword = keywords.some(k => ans.includes(k.toLowerCase()))
    if (hasKeyword && ans.length >= minLen) {
      showReflection.value = false
      celebrationDone.value = false
      setFeedback('success', options.successText || 'Goed nagedacht!')
      return true
    } else {
      setFeedback('info', options.errorText || 'Probeer het uit te leggen met de juiste wiskundige termen.')
      return false
    }
  }

  /**
   * Detect common error patterns in a value.
   * @param {*} val - The value to check
   * @param {Array} errors - Array of { id, detect(val) => boolean, feedback }
   * @returns {boolean} Whether an error was detected
   */
  function detectErrors(val, errors) {
    for (const err of errors) {
      if (err.detect(val)) {
        attemptCount.value++
        errorDetected.value = err.id
        setFeedback('error', err.feedback)
        return true
      }
    }
    return false
  }

  /**
   * Advance to the next level, or signal completion.
   * @returns {boolean} Whether all levels are complete (caller should emit 'complete')
   */
  function advanceLevel() {
    if (currentLevel.value < totalLevels - 1) {
      currentLevel.value++
      resetLevel()
      return false
    }
    return true // all done
  }

  /**
   * Reset the current level state (keep level index).
   */
  function resetLevel() {
    isCorrect.value = false
    celebrationDone.value = false
    attemptCount.value = 0
    hintCount.value = 0
    showWorkedExample.value = showWorkedOnFirst && currentLevel.value === 0
    showPrediction.value = false
    showReflection.value = false
    showWhy.value = false
    whyText.value = ''
    errorDetected.value = ''
    predictedAnswer.value = null
    reflectionAnswer.value = ''
    feedback.value = { type: 'info', text: '' }
  }

  /**
   * Full reset to level 0.
   */
  function fullReset() {
    currentLevel.value = 0
    resetLevel()
  }

  /**
   * Set feedback message.
   */
  function setFeedback(type, text) {
    feedback.value = { type, text }
  }

  return {
    // State — one-directional
    currentLevel,
    totalLevels,
    isCorrect,
    celebrationDone,
    attemptCount,
    hintCount,
    feedback,

    // Pedagogical state
    showWorkedExample,
    showPrediction,
    predictedAnswer,
    showReflection,
    reflectionAnswer,
    showWhy,
    whyText,
    errorDetected,

    // Computed
    isLastLevel,
    levelNumber,
    levelLabels,

    // Methods
    skipWorkedExample,
    initPrediction,
    checkPrediction,
    showHint,
    showWhyExplanation,
    checkReflection,
    detectErrors,
    advanceLevel,
    resetLevel,
    fullReset,
    setFeedback,
  }
}
