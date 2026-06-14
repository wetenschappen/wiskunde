import { markRaw } from 'vue'
import FunctionIntroductionActivity from '../components/activities/FunctionIntroductionActivity.vue'

export default {
    id: 'wiskunde-functies-1',
    config: {
        id: 'wiskunde-functies-1',
        title: 'Functies: Basisbegrippen & Grafieken',
        subject: 'math',
        className: '4 Wiskunde',
        date: 'Week 1',
        prerequisites: [
            'Je weet wat een assenstelsel is',
            'Je kent de begrippen x-as en y-as'
        ],
        equipment: ['Rekenmachine', 'Geodriehoek'],
        textbook: 'Wiskunde 4 - Hoofdstuk 1: Functies',
        cursusLink: '/cursus/wiskunde-functies.pdf',
        extraTools: []
    },
    goals: [
        { id: 'f1', text: 'Ik begrijp de definitie van een functie.' },
        { id: 'f2', text: 'Ik kan een grafiek herkennen via de verticale lijn test.' },
        { id: 'f3', text: 'Ik kan domein en beeld bepalen van standaardfuncties.' }
    ],
    timeline: [
        {
            id: 'intro',
            step: 1,
            title: 'Introductie tot functies',
            time: '15 min',
            cards: [
                {
                    id: 'card-pres',
                    type: 'class',
                    action: 'presentation',
                    title: 'Theorie: Wat is een functie?',
                    description: 'We ontdekken de functiemachine en de verschillende representaties (tabel, grafiek, wiskundige formule).',
                    icon: 'PhPresentationChart'
                }
            ]
        },
        {
            id: 'lab',
            step: 2,
            title: 'Verwerking: Functies Lab',
            time: '20 min',
            cards: [
                {
                    id: 'card-workbook',
                    type: 'paper',
                    action: 'workbook',
                    title: 'Werkboek',
                    description: 'Vul theorie in op pagina 1-3.',
                    icon: 'PhFilePdf'
                },
                {
                    id: 'card-function-intro',
                    type: 'digital',
                    action: 'activity',
                    activityId: 'function-intro',
                    title: 'Digitaal Lab: Functies Verkennen',
                    description: 'Experimenteer met de functiemachine, bepaal het domein en test jezelf op grafieken.',
                    icon: 'PhMathOperations'
                }
            ],
            extraActivities: [
                {
                    id: 'linear-functions',
                    title: 'Extra: Lineaire functies',
                    category: 'Verdieping',
                    icon: 'PhChartLine'
                }
            ]
        },
        {
            id: 'exit',
            step: 3,
            title: 'Exit Ticket',
            time: '5 min',
            cards: [
                {
                    id: 'card-exit',
                    type: 'digital',
                    action: 'exit-ticket',
                    title: 'Check-up',
                    description: 'Korte test om te zien of je de theorie hebt begrepen.',
                    icon: 'PhTarget'
                }
            ]
        }
    ],
    activities: {
        'function-intro': {
            component: markRaw(FunctionIntroductionActivity),
            props: { initialMode: 'analysis' }
        }
    },
    slides: [
        {
            title: 'Wat is een Functie?',
            layout: 'standard',
            content: `
Een **functie** is een wiskundige regel die aan elke invoerwaarde ($x$) hoogstens één uitvoerwaarde ($y$) toekent.
De verzameling van alle mogelijke invoerwaarden noemen we het **domein**.
            `
        },
        {
            title: 'Voorbeeld van een grafiek',
            content: `
We bekijken de functie $f(x) = x^2$.  
In onderstaande grafiek kun je perfect de vorm zien.
            `,
            layout: 'math-graph',
            header: 'Functie Grafiek',
            steps: [
                {
                    text: 'De grafiek toont de functie $f(x) = x^2$.',
                    mathConfig: {
                        domain: [-5, 5],
                        range: [-2, 10],
                        functions: [
                            { id: 'f1', fn: (x) => x * x, color: '#059669', width: 3 }
                        ],
                        points: []
                    }
                },
                {
                    text: 'De top ligt in het punt $(0,0)$.',
                    mathConfig: {
                        domain: [-5, 5],
                        range: [-2, 10],
                        functions: [
                            { id: 'f1', fn: (x) => x * x, color: '#059669', width: 3 }
                        ],
                        points: [
                            { id: 'v', x: 0, y: 0, label: 'Top (0,0)', color: '#ea580c' }
                        ]
                    }
                }
            ]
        }
    ],
    exitTicket: [
        {
            id: 'q1',
            type: 'multiple-choice',
            question: 'Is een cirkel de grafiek van een functie?',
            options: ['Ja, want je kan het tekenen.', 'Nee, want bij bepaalde x-waarden horen twee y-waarden.'],
            correctAnswer: 1,
            feedback: 'Correct! Een functie heeft per x-waarde hoogstens één y-waarde. Dit kun je testen met de verticale-lijntest.'
        },
        {
            id: 'q2',
            type: 'graph-point',
            question: 'Duid de top aan van de functie f(x) = x^2',
            description: 'Klik op de grafiek om het punt te plaatsen.',
            mathConfig: {
                domain: [-5, 5],
                range: [-2, 5],
                functions: [
                    { id: 'f1', fn: (x) => x * x, color: '#059669', width: 3 }
                ]
            },
            correctPoint: { x: 0, y: 0 },
            tolerance: 0.5
        }
    ]
}
