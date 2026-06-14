import { ref, defineAsyncComponent, shallowRef } from 'vue'

// Async Components (Lazy Loaded)
const FillBlanksActivity = defineAsyncComponent(() => import('../components/activities/FillBlanksActivity.vue'))
const HotspotActivity = defineAsyncComponent(() => import('../components/activities/HotspotActivity.vue'))
const ChemicalBondingActivity = defineAsyncComponent(() => import('../components/activities/ChemicalBondingActivity.vue'))
const IonicBondingActivity = defineAsyncComponent(() => import('../components/activities/IonicBondingActivity.vue'))
const MetalBondingActivity = defineAsyncComponent(() => import('../components/activities/MetalBondingActivity.vue'))
const AtomicLattice = defineAsyncComponent(() => import('../components/activities/AtomicLattice.vue'))
const ArchimedesActivity = defineAsyncComponent(() => import('../components/activities/ArchimedesActivity.vue'))
const ArchimedesConceptLab = defineAsyncComponent(() => import('../components/activities/ArchimedesConceptLab.vue'))
const ArchimedesDerivationBuilder = defineAsyncComponent(() => import('../components/activities/ArchimedesDerivationBuilder.vue'))
const StrategyHelperActivity = defineAsyncComponent(() => import('../components/activities/StrategyHelperActivity.vue'))
const ArchimedesTheoryQuest = defineAsyncComponent(() => import('../components/activities/ArchimedesTheoryQuest.vue'))
const IcebergDensityActivity = defineAsyncComponent(() => import('../components/activities/IcebergDensityActivity.vue'))
const EurekaActivity = defineAsyncComponent(() => import('../components/activities/EurekaActivity.vue'))

// Registry
const COMPONENT_MAP = {
    fillBlanks: FillBlanksActivity,
    hotspot: HotspotActivity,
    chemicalBonding: ChemicalBondingActivity,
    ionicBonding: IonicBondingActivity,
    metalBonding: MetalBondingActivity,
    atomicLattice: AtomicLattice,
    archimedesActivity: ArchimedesActivity,
    archimedesConceptLab: ArchimedesConceptLab,
    archimedesDerivationBuilder: ArchimedesDerivationBuilder,
    strategyHelper: StrategyHelperActivity,
    archimedesTheoryQuest: ArchimedesTheoryQuest,
    icebergDensityActivity: IcebergDensityActivity,
    eurekaStory: EurekaActivity
}

export function useActivitySystem(lessonData, markAsDoneCallback) {
    const activeActivity = shallowRef(null) // { id, component, props }

    // Helper: Normalize props (e.g. sequence steps -> items)
function getActivityProps(type, data) {
        const { type: _t, ...otherData } = data
        return { ...otherData }
    }

    function handleOpenActivity(id, sourceCardId = null) {
        // Request fullscreen immediately to stay within the user gesture call stack
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {
                // Ignore failure if already handled or blocked
            })
        }

        // Dynamic Lookup
        let cleanId = id.replace('card-', '')

        // Find data
        let data = lessonData.activities?.[id] || lessonData.activities?.[cleanId]

        // Fallback: case insensitive key search for lessonData.activities
        if (!data) {
            const key = Object.keys(lessonData.activities || {}).find(k => k.toLowerCase() === cleanId.toLowerCase())
            if (key) data = lessonData.activities[key]
        }

        if (data) {
            let type = data.type
            // Infer type from key if missing
            if (!type) {
                const key = Object.keys(lessonData.activities).find(k => lessonData.activities[k] === data)
                if (COMPONENT_MAP[key]) type = key
            }

            if (type && COMPONENT_MAP[type]) {
                activeActivity.value = {
                    id: cleanId,
                    component: COMPONENT_MAP[type],
                    props: getActivityProps(type, data),
                    sourceCardId
                }
            } else {
                console.warn(`[ActivitySystem] Unknown type '${type}' for ID '${id}'`)
            }
        }
        // Standalone activities: if ID matches a component directly, open without data
        else {
            const compKey = Object.keys(COMPONENT_MAP).find(k => k.toLowerCase() === cleanId.toLowerCase())
            if (compKey) {
                activeActivity.value = {
                    id: cleanId,
                    component: COMPONENT_MAP[compKey],
                    props: {},
                    sourceCardId
                }
            } else {
                console.warn(`[ActivitySystem] No data found for ID '${id}'`)
            }
        }
    }

    function closeActivity() {
        activeActivity.value = null
    }

    function completeActivity() {
        if (activeActivity.value && activeActivity.value.id) {
            if (markAsDoneCallback) {
                if (activeActivity.value.sourceCardId) {
                    markAsDoneCallback(activeActivity.value.sourceCardId)
                } else {
                    markAsDoneCallback('card-' + activeActivity.value.id)
                }
            }
        }
        closeActivity()
    }

    return {
        activeActivity,
        handleOpenActivity,
        closeActivity,
        completeActivity
    }
}
