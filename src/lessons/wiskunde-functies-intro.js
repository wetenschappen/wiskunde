import { markRaw } from 'vue'
import FunctionIntroductionActivity from '../components/activities/FunctionIntroductionActivity.vue'

export default {
    id: 'wiskunde-functies-intro',
    subject: 'math',
    className: '4 Wiskunde',
    title: 'Functies: Een Introductie',
    description: 'Wat is een functie? Van context naar formule, tabel en grafiek.',
    
    config: {
        groenCode: 'FUNC24',
        groenAntwoord: 'functie',
        masterCode: 'docent',
        cursusLink: 'https://albertshalaj.github.io/3nw',
        classId: '4-Newton',
        textbook: 'Wiskunde 4 - Hoofdstuk 1: Functies',
        extraTools: []
    },

    goals: [
        'Ik kan uitleggen wat een functie is (aan elke x hoogstens één y).',
        'Ik herken een functie in een grafiek met de verticale-lijntest.',
        'Ik kan de vier representaties van een functie benoemen: verwoording, tabel, grafiek, voorschrift.',
        'Ik kan domein en beeld van een functie aflezen uit een grafiek.'
    ],

    workbook: {
        title: 'Werkboek: Functies',
        subtitle: 'Wiskunde • Inleiding tot functies',
        instruction: 'Vul de theorie in op <strong>pagina 1 tot 5</strong>. Noteer de definitie, de vier representaties en maak <strong>oefeningen 1 tot 8</strong>.',
        formulaHint: 'Tip: f(x) = ... betekent "f van x is gelijk aan ..."'
    },

    timeline: {
        stepA: {
            step: '1',
            title: 'Start: Wat gaan we leren?',
            time: '15 min',
            cards: [
                {
                    id: 'card-entry',
                    type: 'digital',
                    title: 'Toegangsticket',
                    description: 'Check je voorkennis over grafieken en coördinaten.',
                    action: 'entry-ticket',
                    icon: 'PhQuestion'
                },
                {
                    id: 'card-pres-intro',
                    type: 'class',
                    title: 'Intro: De Functiemachine',
                    description: 'We starten met een herkenbaar voorbeeld: wat gebeurt er als je een getal in een machine stopt?',
                    action: 'presentation',
                    icon: 'PhPresentationChart'
                }
            ]
        },
        stepB: {
            step: '2',
            title: 'Kern: Functies Ontdekken',
            time: '30 min',
            cards: [
                {
                    id: 'card-workbook',
                    type: 'paper',
                    title: 'Werkboek',
                    description: 'Vul de theoriepagina\'s in over de definitie, representaties en het domein/beeld.',
                    action: 'workbook',
                    icon: 'PhFilePdf'
                },
                {
                    id: 'card-pres-theory',
                    type: 'class',
                    title: 'Theorie: Representaties & Domein',
                    description: 'Diepere uitleg over de vier representaties, domein, beeld en de verticale-lijntest.',
                    action: 'presentation',
                    slidesKey: 'slidesTheory'
                },
                {
                    id: 'card-function-explore',
                    type: 'digital',
                    title: 'Digitaal Lab: Functies Verkennen',
                    description: 'Experimenteer met de functiemachine, converteer representaties en test grafieken met de verticale-lijntest.',
                    action: 'activity',
                    activityId: 'function-intro',
                    icon: 'PhMathOperations'
                }
            ]
        },
        stepC: {
            step: '3',
            title: 'Afsluiting: Wat heb je geleerd?',
            time: '10 min',
            cards: [
                {
                    id: 'card-pres-summary',
                    type: 'class',
                    title: 'Samenvatting',
                    description: 'We overlopen samen wat we vandaag geleerd hebben.',
                    action: 'presentation',
                    slidesKey: 'slidesSummary',
                    icon: 'PhPresentationChart'
                },
                {
                    id: 'card-exit',
                    type: 'digital',
                    title: 'Exit Ticket',
                    description: 'Laat zien wat je vandaag hebt geleerd over functies.',
                    action: 'exit-ticket',
                    icon: 'PhTarget'
                }
            ]
        }
    },

    activities: {
        'function-intro': {
            component: markRaw(FunctionIntroductionActivity),
            props: { initialMode: 'analysis' }
        }
    },

    slides: [
        {
            layout: 'title',
            title: 'Functies',
            subtitle: 'Een introductie',
            badge: 'Wiskunde • Functieleer',
            icon: 'function'
        },
        {
            layout: 'hero',
            title: 'De Functiemachine',
            subtitle: 'Wat gebeurt er als je een getal invoert?',
            image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200',
            credit: 'Denk aan een chocoladefabriek: je stopt er melk in en er komt chocolade uit.'
        },
        {
            layout: 'steps',
            title: 'Wat ga je leren?',
            steps: [
                { icon: 'function', text: 'De definitie van een functie (aan elke x hoogstens één y)' },
                { icon: 'presentation-chart', text: 'Grafieken herkennen met de verticale-lijntest' },
                { icon: 'lightbulb', text: 'De vier representaties: verwoording, tabel, grafiek, voorschrift' },
                { icon: 'arrow-down', text: 'Domein en beeld bepalen uit een grafiek' }
            ]
        },
        {
            layout: 'definition',
            term: 'Functie',
            formula: 'f : x ↦ f(x)',
            explanation: 'Een functie is een regel die aan elke invoerwaarde x precies één uitvoerwaarde f(x) toekent.',
            relatedTerms: ['domein', 'bereik', 'variabele']
        },
        {
            layout: 'predict',
            title: 'Voorspelling',
            question: 'Is een cirkel de grafiek van een functie?',
            hint: 'Denk aan de definitie: één x-waarde mag maar één y-waarde hebben.',
            revealText: 'Nee! Bij een cirkel horen bij één x-waarde vaak twee y-waarden (bovenkant én onderkant). Een functie mag per x-waarde hoogstens één y hebben.'
        }
    ],

    slidesTheory: [
        {
            layout: 'title',
            title: 'Functies: De Theorie',
            subtitle: 'Representaties, domein en beeld',
            badge: 'Wiskunde • Functieleer',
            icon: 'function'
        },
        {
            layout: 'standard',
            title: 'Wat is een functie?',
            content: `
Een <strong>functie</strong> is een regel die aan elke invoerwaarde ($x$) hoogstens één uitvoerwaarde ($y$) toekent.
<br><br>
<strong>Voorbeeld:</strong> Een snoepautomaat — je drukt op een knop (x) en krijgt precies één soort snoep (y).
Als je op dezelfde knop soms snoep A en soms snoep B zou krijgen, is het géén functie.
            `
        },
        {
            layout: 'standard',
            title: 'De Vier Representaties',
            content: `
Een functie kan je op vier manieren voorstellen:
<br><br>
1. <strong>Verwoording:</strong> "De oppervlakte van een vierkant is de zijde in het kwadraat"<br>
2. <strong>Tabel:</strong> x | 1 | 2 | 3 ; y | 1 | 4 | 9<br>
3. <strong>Grafiek:</strong> punten in een assenstelsel<br>
4. <strong>Voorschrift:</strong> $f(x) = x^2$
<br><br>
Al deze vier stellen <strong>dezelfde functie</strong> voor.
            `
        },
        {
            layout: 'worked-example',
            title: 'Voorbeeld: Kwadratische Functie',
            problem: 'Gegeven de functie f(x) = x², bereken f(3) en f(-2).',
            steps: [
                { action: 'Vervang x door 3', result: 'f(3) = 3² = 9' },
                { action: 'Vervang x door -2', result: 'f(-2) = (-2)² = 4' }
            ],
            answer: 'f(3) = 9 en f(-2) = 4'
        },
        {
            layout: 'value-table',
            title: 'Waardetabel van f(x) = x²',
            headers: ['x', 'f(x)'],
            rows: [
                { x: -3, y: 9 },
                { x: -2, y: 4 },
                { x: -1, y: 1 },
                { x: 0, y: 0, highlight: true },
                { x: 1, y: 1 },
                { x: 2, y: 4 },
                { x: 3, y: 9 }
            ]
        },
        {
            layout: 'big',
            title: 'De Definitie',
            subtitle: 'Aan elke x hoogstens één y',
        },
        {
            layout: 'math-graph',
            title: 'Verticale-Lijntest',
            content: 'Hoe controleren we of een grafiek een functie is?',
            steps: [
                {
                    title: 'Stap 1: Teken een verticale lijn',
                    description: 'Elke verticale lijn mag de grafiek hoogstens één keer snijden.',
                    mathConfig: {
                        domain: [-5, 5],
                        range: [-2, 10],
                        functions: [
                            { id: 'f1', fn: (x) => x * x, color: '#0f172a', width: 3 }
                        ],
                        points: []
                    }
                },
                {
                    title: 'Stap 2: Analyseer snijpunten',
                    description: 'Voor $f(x) = x^2$ snijdt elke verticale lijn precies één keer. Dit is dus WEL een functie.',
                    mathConfig: {
                        domain: [-5, 5],
                        range: [-2, 10],
                        functions: [
                            { id: 'f1', fn: (x) => x * x, color: '#0f172a', width: 3 }
                        ],
                        points: [
                            { id: 'p1', x: 2, y: 4, label: 'x = 2', color: '#ea580c' }
                        ]
                    }
                }
            ]
        },
        {
            layout: 'properties',
            title: 'Eigenschappen van f(x) = x²',
            properties: [
                { label: 'Domein', value: 'ℝ (alle reële getallen)', icon: 'infinity' },
                { label: 'Bereik', value: '[0, +∞)', icon: 'arrow-up' },
                { label: 'Symmetrie', value: 'Even functie: f(-x) = f(x)', icon: 'properties' },
                { label: 'Nulpunt', value: 'x = 0', icon: 'info' }
            ],
            summary: 'De kwadratische functie f(x) = x² is een parabool met het minimum in de oorsprong.'
        },
        {
            layout: 'theorem-proof',
            title: 'Symmetrie van de Parabool',
            given: 'De kwadratische functie $f(x) = x^2$',
            toProve: 'De functie is even (symmetrisch t.o.v. de y-as), ofwel $f(-x) = f(x)$',
            steps: [
                { text: 'Start met het linkerlid van de te bewijzen formule:', formula: 'f(-x)' },
                { text: 'Substitueer $-x$ in het voorschrift $f(x) = x^2$:', formula: 'f(-x) = (-x)^2' },
                { text: 'Het kwadraat van een negatieve waarde is gelijk aan het kwadraat van de positieve waarde:', formula: '(-x)^2 = x^2' },
                { text: 'Herken het oorspronkelijke voorschrift van de functie $f(x)$:', formula: 'x^2 = f(x)' },
                { text: 'We besluiten dat:', formula: 'f(-x) = f(x)' }
            ]
        },
        {
            layout: 'equation-solver',
            title: 'Vergelijking Oplossen: f(x) = 4',
            steps: [
                { left: 'f(x)', operator: '=', right: '4', annotation: 'Gegeven' },
                { left: 'x^2', operator: '=', right: '4', annotation: 'Substitueer f(x)' },
                { left: 'x', operator: '=', right: '\\pm \\sqrt{4}', annotation: 'Neem wortel' },
                { left: 'x', operator: '=', right: '\\pm 2', annotation: 'Vereenvoudig' },
                { left: 'V', operator: '=', right: '\\{-2, 2\\}', annotation: 'Oplossingsverzameling' }
            ]
        },
        {
            layout: 'equation',
            title: 'Domein en Beeld',
            equation: 'Domein ↦ Functie ↦ Beeld',
            parts: [
                { label: 'Domein', items: ['Alle mogelijke invoerwaarden (x)', 'Welke getallen mag je invullen?'], color: 'teal' },
                { label: 'Beeld (Bereik)', items: ['Alle mogelijke uitvoerwaarden (y)', 'Welke getallen kunnen eruit komen?'], color: 'orange' }
            ],
            note: 'Voor f(x) = x²: domein is alle reële getallen, beeld is [0, +∞)'
        },
        {
            layout: 'recap',
            title: 'Herhaling: Functies',
            questions: [
                { question: 'Wat is de definitie van een functie?', answer: 'Een wiskundige regel die aan elke x-waarde hoogstens één y-waarde toekent.' },
                { question: 'Hoe werkt de verticale-lijntest?', answer: 'Teken verticale lijnen op de grafiek. Snijdt elke lijn de grafiek maximaal één keer? Dan is het een functie.' },
                { question: 'Wat is het verschil tussen domein en beeld?', answer: 'Domein bevat alle mogelijke x-waarden (invoer), beeld bevat alle mogelijke y-waarden (uitvoer).' }
            ]
        }
    ],

    // MEMO: Voor de 'slidesSummary' (samenvatting slidedeck) is het didactisch enkel toegestaan om inhoudelijke slides (zoals layout: 'summary') op te nemen.
    // Introductie- en afrondingsslides (zoals 'title' of 'celebration') dienen te worden uitgesloten om de didactische flow vlot te houden.
    slidesSummary: [
        {
            layout: 'summary',
            title: 'Samengevat',
            items: [
                'Een functie kent aan elke x-waarde hoogstens één y-waarde toe.',
                'De verticale-lijntest: een verticale lijn mag een functiegrafiek hoogstens één keer snijden.',
                'Vier representaties: verwoording, tabel, grafiek, voorschrift.',
                'Domein = alle toegelaten x-waarden; Beeld = alle mogelijke y-waarden.',
                'Voorbeeld: f(x) = x² heeft domein = ℝ en beeld = [0, +∞).'
            ],
            keyTakeaway: 'Een functie is een eenduidige relatie: elke invoer heeft precies één uitvoer.'
        }
    ],

    entryTicket: {
        questions: [
            {
                id: 'en1',
                type: 'mc',
                question: 'Wat is een assenstelsel?',
                options: [
                    'Een lijst met getallen',
                    'Twee loodrechte assen (x-as en y-as) waarmee je punten kunt tekenen',
                    'Een soort grafiek',
                    'Een tabel met rijen en kolommen'
                ],
                correct: 1
            },
            {
                id: 'en2',
                type: 'mc',
                question: 'Wat betekent het punt (3, 5) in een assenstelsel?',
                options: [
                    'x = 5 en y = 3',
                    'x = 3 en y = 5',
                    'De afstand tussen 3 en 5',
                    'De som is 8'
                ],
                correct: 1
            },
            {
                id: 'en3',
                type: 'mc',
                question: 'Wat is een variabele in de wiskunde?',
                options: [
                    'Een vast getal dat nooit verandert',
                    'Een symbool (zoals x of y) dat verschillende waarden kan aannemen',
                    'Het antwoord van een berekening',
                    'Een fout in een formule'
                ],
                correct: 1
            }
        ]
    },

    exitTicket: {
        questions: [
            {
                id: 'ex1',
                type: 'mc',
                question: 'Wat is de definitie van een functie?',
                options: [
                    'Een grafiek die je kunt tekenen',
                    'Een regel die aan elke x-waarde hoogstens één y-waarde toekent',
                    'Elke lijn in een assenstelsel',
                    'Een formule met een x erin'
                ],
                correct: 1
            },
            {
                id: 'ex2',
                type: 'mc',
                question: 'Welke test gebruik je om te controleren of een grafiek een functie is?',
                options: [
                    'De horizontale-lijntest',
                    'De diagonale-lijntest',
                    'De verticale-lijntest',
                    'De cirkeltest'
                ],
                correct: 2
            },
            {
                id: 'ex3',
                type: 'open',
                question: 'Leg in je eigen woorden uit waarom een cirkel geen functie is.',
                description: 'Gebruik de definitie van een functie in je antwoord.'
            },
            {
                id: 'ex4',
                type: 'graph-point',
                question: 'Duid de top van de functie f(x) = x² aan.',
                description: 'Klik op de grafiek om het laagste punt te plaatsen.',
                mathConfig: {
                    domain: [-5, 5],
                    range: [-2, 10],
                    functions: [
                        { id: 'f1', fn: (x) => x * x, color: '#0f172a', width: 3 }
                    ]
                },
                correctPoint: { x: 0, y: 0 },
                tolerance: 0.5
            }
        ]
    }
}
