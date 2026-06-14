import { computed } from 'vue'

export function useLesson(lessonData) {
    // Flatten config for easier usage
    const lessonConfig = {
        id: lessonData.id,
        subject: lessonData.subject,
        className: lessonData.className,
        title: lessonData.title,
        description: lessonData.description,
        ...lessonData.config
    }

    // Transform timeline object -> Array of steps
    const timeline = computed(() => {
        if (!lessonData.timeline) return []

        const steps = []
        const keys = Object.keys(lessonData.timeline)

        keys.forEach(key => {
            const step = lessonData.timeline[key]

            // We omit route visibility logic and just populate the steps
            steps.push({
                id: key,
                ...step,
            })
        })

        return steps
    })

    return {
        config: lessonConfig,
        timeline: timeline,
        rawTimeline: lessonData.timeline,
        goals: lessonData.goals,
        workbook: lessonData.workbook,
        slides: lessonData.slides || [],
        exitTicket: lessonData.exitTicket?.questions || [],
        spotCheck: lessonData.spotCheck?.questions || [],
        lessonHeaders: lessonData.lessonHeaders || []
    }
}
