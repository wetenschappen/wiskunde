import { reactive, watch } from 'vue'

export function useProgress(lessonId) {
    const progress = reactive({
        done: []
    })

    function restoreProgress() {
        if (!lessonId) return
        const stored = localStorage.getItem(lessonId)
        if (stored) {
            try {
                const p = JSON.parse(stored)
                progress.done = p.done || []
            } catch (e) {
                console.error('Failed to parse progress', e)
            }
        }
    }

    function saveProgress() {
        if (!lessonId) return
        localStorage.setItem(lessonId, JSON.stringify(progress))
    }

    function markAsDone(id) {
        if (!id) return
        if (!progress.done.includes(id)) {
            progress.done.push(id)
            saveProgress()
        }
    }

    function isDone(id) {
        return progress.done.includes(id)
    }

    function resetProgress(routeKey) {
        if (confirm('Weet je zeker dat je alle voortgang wilt wissen?')) {
            localStorage.removeItem(lessonId)
            localStorage.removeItem('planner-goals-newton') // Legacy cleanup
            if (routeKey) localStorage.removeItem(routeKey)
            location.reload()
        }
    }

    return {
        progress,
        restoreProgress,
        saveProgress,
        markAsDone,
        isDone,
        resetProgress
    }
}
