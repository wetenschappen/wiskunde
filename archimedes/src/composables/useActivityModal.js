import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'

/**
 * useActivityModal
 * - manages fullscreen request/exit
 * - listens for Escape key to close
 * - closes activity when fullscreen state is lost
 * - provides a focus-trap helper (bind ref to modal root)
 * - provides simple persistence helpers (save/load by key)
 */
export function useActivityModal(props, emit) {
  const shouldPulse = ref(false)
  const modalRoot = ref(null)

  function handleKeydown(e) {
    if (e.key === 'Escape' && props.isOpen) {
      emit('close')
    }

    // Focus trap: intercept Tab
    if (e.key === 'Tab' && modalRoot.value) {
      const focusable = modalRoot.value.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')
      const nodes = Array.prototype.slice.call(focusable).filter(n => n.offsetParent !== null)
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    }
  }

  const handleFullscreenChange = () => {
    if (props.isOpen && props.fullscreen && !document.fullscreenElement) {
      emit('close')
    }
  }

  const requestFullscreen = () => {
    if (props.fullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        console.warn('[useActivityModal] Fullscreen request failed/blocked')
      })
    }
  }

  watch(() => props.isOpen, (val) => {
    if (!val) {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
      window.removeEventListener('keydown', handleKeydown)
      shouldPulse.value = false
    } else {
      window.addEventListener('keydown', handleKeydown)
      
      // Fullscreen request
      requestFullscreen()

      nextTick(() => {
        shouldPulse.value = true
        setTimeout(() => { shouldPulse.value = false }, 3000)
        // focus first focusable element inside modal
        if (modalRoot.value) {
          const focusable = modalRoot.value.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')
          const nodes = Array.prototype.slice.call(focusable).filter(n => n.offsetParent !== null)
          if (nodes.length) nodes[0].focus()
        }
      })
    }
  }, { immediate: true })

  onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
  })

  // Persistence helpers
  function persistKey(base) {
    if (!base) return null
    return `activity-${base.replace(/\s+/g, '-').toLowerCase()}`
  }

  function saveProgress(key, data) {
    try {
      const k = persistKey(key)
      if (!k) return
      localStorage.setItem(k, JSON.stringify(data))
    } catch (e) {
      // ignore
    }
  }

  function loadProgress(key) {
    try {
      const k = persistKey(key)
      if (!k) return null
      const raw = localStorage.getItem(k)
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  }

  return {
    shouldPulse,
    modalRoot,
    saveProgress,
    loadProgress
  }
}

export default useActivityModal
