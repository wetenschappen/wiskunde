import { ref, defineAsyncComponent, shallowRef } from 'vue'

// Async Components (Lazy Loaded)
const DragDropActivity = defineAsyncComponent(() => import('../components/activities/DragDropActivity.vue'))
const FillBlanksActivity = defineAsyncComponent(() => import('../components/activities/FillBlanksActivity.vue'))
const AnalyticGeometryActivity = defineAsyncComponent(() => import('../components/activities/AnalyticGeometryActivity.vue'))
const CategorySortActivity = defineAsyncComponent(() => import('../components/activities/CategorySortActivity.vue'))
const CircleGeometryActivity = defineAsyncComponent(() => import('../components/activities/CircleGeometryActivity.vue'))
const RealNumbersActivity = defineAsyncComponent(() => import('../components/activities/RealNumbersActivity.vue'))
const VectorsActivity = defineAsyncComponent(() => import('../components/activities/VectorsActivity.vue'))
const LogicActivity = defineAsyncComponent(() => import('../components/activities/LogicActivity.vue'))
const LinearEquationsActivity = defineAsyncComponent(() => import('../components/activities/LinearEquationsActivity.vue'))
const LinearSystemsActivity = defineAsyncComponent(() => import('../components/activities/LinearSystemsActivity.vue'))
const SimilarityActivity = defineAsyncComponent(() => import('../components/activities/SimilarityActivity.vue'))
const SymbolDrillActivity = defineAsyncComponent(() => import('../components/activities/SymbolDrillActivity.vue'))
const MixedRetrievalActivity = defineAsyncComponent(() => import('../components/activities/MixedRetrievalActivity.vue'))
const HotspotActivity = defineAsyncComponent(() => import('../components/activities/HotspotActivity.vue'))
const DescriptiveStatisticsActivity = defineAsyncComponent(() => import('../components/activities/DescriptiveStatisticsActivity.vue'))
const PythagorasActivity = defineAsyncComponent(() => import('../components/activities/PythagorasActivity.vue'))
const LinearFunctionsActivity = defineAsyncComponent(() => import('../components/activities/LinearFunctionsActivity.vue'))
const QuadraticFunctionsActivity = defineAsyncComponent(() => import('../components/activities/QuadraticFunctionsActivity.vue'))
const TrigonometryCircleActivity = defineAsyncComponent(() => import('../components/activities/TrigonometryCircleActivity.vue'))
const TrigonometryRightTriangleActivity = defineAsyncComponent(() => import('../components/activities/TrigonometryRightTriangleActivity.vue'))
const FunctionIntroductionActivity = defineAsyncComponent(() => import('../components/activities/FunctionIntroductionActivity.vue'))
const GraphTheoryActivity = defineAsyncComponent(() => import('../components/activities/GraphTheoryActivity.vue'))
const CountingProblemsActivity = defineAsyncComponent(() => import('../components/activities/CountingProblemsActivity.vue'))
const QuadraticEquationsActivity = defineAsyncComponent(() => import('../components/activities/QuadraticEquationsActivity.vue'))
const CorrelationActivity = defineAsyncComponent(() => import('../components/activities/CorrelationActivity.vue'))
const RationalFunctionsActivity = defineAsyncComponent(() => import('../components/activities/RationalFunctionsActivity.vue'))
const PolynomialDivisionActivity = defineAsyncComponent(() => import('../components/activities/PolynomialDivisionActivity.vue'))
const SpatialGeometryActivity = defineAsyncComponent(() => import('../components/activities/SpatialGeometryActivity.vue'))
const MathFillBlanksActivity  = defineAsyncComponent(() => import('../components/activities/MathFillBlanksActivity.vue'))
const FunctionMachineActivity = defineAsyncComponent(() => import('../../w-activities/LPD_FunctionMachine.vue'))

// Registry
const COMPONENT_MAP = {
    dragDrop: DragDropActivity,
    fillBlanks: FillBlanksActivity,
    categorySort: CategorySortActivity,
    circleGeometry: CircleGeometryActivity,
    realNumbers: RealNumbersActivity,
    vectors: VectorsActivity,
    symbolDrill: SymbolDrillActivity,
    mixedRetrieval: MixedRetrievalActivity,
    logic: LogicActivity,
    linearEquations: LinearEquationsActivity,
    linearSystems: LinearSystemsActivity,
    analyticGeometry: AnalyticGeometryActivity,
    similarity: SimilarityActivity,
    pythagoras: PythagorasActivity,
    trigonometryCircle: TrigonometryCircleActivity,
    trigonometryRightTriangle: TrigonometryRightTriangleActivity,
    functionIntroduction: FunctionIntroductionActivity,
    hotspot: HotspotActivity,
    descriptiveStatistics: DescriptiveStatisticsActivity,
    linearFunctions: LinearFunctionsActivity,
    quadraticFunctions: QuadraticFunctionsActivity,
    graphTheory: GraphTheoryActivity,
    countingProblems: CountingProblemsActivity,
    quadraticEquations: QuadraticEquationsActivity,
    correlation: CorrelationActivity,
    rationalFunctions: RationalFunctionsActivity,
    polynomialDivision: PolynomialDivisionActivity,
    spatialGeometry:  SpatialGeometryActivity,
    mathFillBlanks:   MathFillBlanksActivity,
    functionMachine:  FunctionMachineActivity
}

export function useActivitySystem(lessonData, markAsDoneCallback) {
    const activeActivity = shallowRef(null) // { id, component, props }

    function getActivityProps(type, data) {
        const { type: _t, ...otherData } = data
        const props = { ...otherData }
        return props
    }

    function handleOpenActivity(id) {
        let cleanId = id.replace('card-', '').replace('oly-', '')
        if (cleanId === 'sort') cleanId = 'categorySort'

        let data = lessonData.activities?.[id] || lessonData.activities?.[cleanId]

        if (!data) {
            const key = Object.keys(lessonData.activities || {}).find(k => k.toLowerCase() === cleanId.toLowerCase())
            if (key) data = lessonData.activities[key]
        }

        if (data) {
            let type = data.type
            if (!type) {
                const key = Object.keys(lessonData.activities).find(k => lessonData.activities[k] === data)
                if (COMPONENT_MAP[key]) type = key
                if (cleanId === 'sort') type = 'categorySort'
            }

            if (type && COMPONENT_MAP[type]) {
                activeActivity.value = {
                    id: cleanId,
                    component: COMPONENT_MAP[type],
                    props: getActivityProps(type, data)
                }
            } else {
                console.warn(`[ActivitySystem] Unknown type '${type}' for ID '${id}'`)
            }
        } else {
            console.warn(`[ActivitySystem] No data found for ID '${id}'`)
        }
    }

    function closeActivity() {
        activeActivity.value = null
    }

    function completeActivity() {
        if (activeActivity.value && activeActivity.value.id) {
            if (markAsDoneCallback) {
                markAsDoneCallback('card-' + activeActivity.value.id)
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
