import { reactive, watch } from 'vue'

const STORAGE_KEY = 'lab-report-data'

const reportData = reactive({
    student: {
        name: '',
        class: ''
    },
    team: {
        size: 2,
        members: [] // [{ name: 'Leerling 1', role: 'material' }, ...]
    },
    prep: {
        problemStatement: '', // Step 1
        variables: { independent: null, dependent: null }, // Step 2 (Onderzoeksvraag)
        hypothesis: { value1: null, value2: null, graph: null, motivation: '' }, // Step 3
        setupMotivation: '', // Step 4
        safety: null // Check
    },
    lab: {
        mode: 'dynamometer',
        rows: [],
        calculatedG: 0,
        chartImage: null,
        // Step 6: Verwerking
        relationship: { type: null, equation: '' },
        // Step 7: Terugkoppeling
        hypothesisCheck: { match: null, explanation: '' },
        // Step 8: Theodore
        theoryLink: '',
        // Step 9: Analysis
        filesDownloaded: false,
        slopeMeaning: null
    },
    conclusion: ''
})

// Auto-save on changes
watch(reportData, () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reportData))
}, { deep: true })

export function useLabReport() {
    // Load from storage
    function loadReport() {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                // Merge carefully
                if (parsed.student) Object.assign(reportData.student, parsed.student)
                if (parsed.prep) Object.assign(reportData.prep, parsed.prep)
                if (parsed.lab) Object.assign(reportData.lab, parsed.lab)
                if (parsed.conclusion !== undefined) reportData.conclusion = parsed.conclusion
            } catch (e) {
                console.error('Failed to parse lab report', e)
            }
        }
    }

    // Save to storage (Manual)
    function saveReport() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reportData))
    }

    // Reset
    function resetReport() {
        localStorage.removeItem(STORAGE_KEY)
        Object.assign(reportData.student, { name: '', class: '' })
        Object.assign(reportData.prep, { problemStatement: '', variables: { independent: null, dependent: null }, hypothesis: { value1: null, value2: null, graph: null, motivation: '' }, setupMotivation: '', safety: null })
        Object.assign(reportData.lab, { mode: 'dynamometer', rows: [], calculatedG: 0, chartImage: null, relationship: { type: null, equation: '' }, hypothesisCheck: { match: null, explanation: '' }, theoryLink: '', filesDownloaded: false, slopeMeaning: null })
        reportData.conclusion = ''
    }

    return {
        reportData,
        loadReport,
        saveReport,
        resetReport
    }
}
