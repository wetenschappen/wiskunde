import { computed } from 'vue'

function normalizeGoals(raw) {
    if (!Array.isArray(raw)) return []
    return raw.map(g => {
        if (typeof g === 'string') return g
        if (g && typeof g === 'object' && g.text) return g.text
        return String(g)
    })
}

function normalizeQuestion(q) {
    let type = q.type || 'mc'
    if (type === 'multiple-choice') type = 'mc'

    let options = q.options
    let correct = q.correct !== undefined ? q.correct : q.correctAnswer

    if (type === 'juist-fout') {
        type = 'mc'
        options = ['Juist', 'Fout']
        if (typeof correct === 'boolean') correct = correct ? 0 : 1
    }

    return {
        ...q,
        type,
        options,
        correct
    }
}

function normalizeTicket(raw) {
    if (!raw) return { questions: [] }
    if (Array.isArray(raw)) return { questions: raw.map(normalizeQuestion) }
    if (raw.questions) return { questions: raw.questions.map(normalizeQuestion) }
    return { questions: [] }
}

export function normalizeLesson(lessonData) {
    return {
        ...lessonData,
        goals: normalizeGoals(lessonData.goals),
        exitTicket: normalizeTicket(lessonData.exitTicket),
        entryTicket: normalizeTicket(lessonData.entryTicket),
        spotCheck: normalizeTicket(lessonData.spotCheck)
    }
}

export function useLesson(rawLessonData) {
    const lessonData = normalizeLesson(rawLessonData)

    const lessonConfig = {
        id: lessonData.id,
        subject: lessonData.subject,
        className: lessonData.className,
        title: lessonData.title,
        description: lessonData.description,
        ...lessonData.config
    }

    const timeline = computed(() => {
        if (!lessonData.timeline) return []

        const steps = []
        const keys = Object.keys(lessonData.timeline)

        keys.forEach(key => {
            const step = lessonData.timeline[key]
            steps.push({
                id: key,
                ...step
            })
        })

        return steps
    })

    return {
        config: lessonConfig,
        timeline,
        rawTimeline: lessonData.timeline,
        goals: lessonData.goals,
        workbook: lessonData.workbook,
        slides: lessonData.slides || [],
        exitTicket: lessonData.exitTicket?.questions || [],
        spotCheck: lessonData.spotCheck?.questions || [],
        lessonHeaders: lessonData.lessonHeaders || []
    }
}
