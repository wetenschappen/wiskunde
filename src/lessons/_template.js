/**
 * LESSON TEMPLATE — ABC Methode (v3.0)
 *
 * HOE GEBRUIKEN:
 *   cp src/lessons/_template.js src/lessons/nando3-mXX-lXX-onderwerp.js
 *   Vervang alle [PLACEHOLDERS] en registreer het bestand in src/data/modules.js
 *
 * VASTE STRUCTUUR (niet aanpassen):
 *   A  Diagnostisch & Instap  → entry-ticket + slidesA
 *   B  Verwerken              → slidesB + workbook + activity (+extraActivities)
 *   C  Samenvatting & Exit    → slidesC + exit-ticket
 */

export default {

    // ─── 1. METADATA ────────────────────────────────────────────────────────────
    id: 'nando3-mXX-lXX-onderwerp',     // Moet exact overeenkomen met de bestandsnaam (zonder .js)
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module XX - Les X',
    description: '[Korte beschrijving van de les]',

    // ─── 2. CONFIG ──────────────────────────────────────────────────────────────
    config: {
        groenCode: 'MXXLX',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '3-Wiskunde',          // Verwijst naar src/data/students.js
        textbook: 'Nando 3 Module XX',
        // cursusLink: 'https://...',   // Optioneel: opent in Toolbox
    },

    // ─── 3. GOALS ───────────────────────────────────────────────────────────────
    goals: [
        'Ik kan ...',
        'Ik begrijp ...',
        'Ik pas ... toe op ...'
    ],

    // ─── 4. WORKBOOK ────────────────────────────────────────────────────────────
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Module XX',
        instruction: '<p>Maak <strong>oefeningen X–X</strong> op pagina XX.</p>',
        formulaHint: 'Raadpleeg het handboek voor de volledige theorie.'
    },

    // ─── 5. TIMELINE ────────────────────────────────────────────────────────────
    // NIET aanpassen: de 3 stappen, card-id's en acties zijn standaard.
    // Pas alleen title/description/slidesKey/activityId aan indien nodig.
    timeline: {

        // ── STAP A: Diagnostisch & Instap (± 15 min) ──────────────────────────
        stepA: {
            step: 'A', title: 'Diagnostisch & Instap', time: '15 min',
            cards: [
                {
                    id: 'card-entry',
                    type: 'digital',
                    title: 'Diagnostische Toets',
                    description: 'Wat weet je al?',
                    action: 'entry-ticket',
                    icon: 'PhQuestion'
                },
                {
                    id: 'card-pres-a',
                    type: 'class',
                    title: 'Inleidende Instructie',
                    description: 'Korte theorie.',
                    action: 'presentation',
                    slidesKey: 'slidesA'
                }
            ]
        },

        // ── STAP B: Verwerken (± 30 min) ──────────────────────────────────────
        stepB: {
            step: 'B', title: 'Verwerken', time: '30 min',
            cards: [
                {
                    id: 'card-pres-b',
                    type: 'class',
                    title: 'Uitgebreide Theorie',
                    description: 'Stap voor stap uitgewerkt.',
                    action: 'presentation',
                    slidesKey: 'slidesB'
                },
                {
                    id: 'card-workbook',
                    type: 'paper',
                    title: 'Boek Oefeningen',
                    description: 'Maak oefeningen in het handboek.',
                    action: 'workbook',
                    icon: 'PhBookOpen'
                },
                {
                    id: 'card-activity',
                    type: 'digital',
                    title: 'Interactieve Verwerking',
                    description: 'Visuele verkenning.',
                    action: 'activity',
                    activityId: 'main',     // Verwijst naar activities.main hieronder
                    icon: 'PhShapes'
                }
            ],
            // extraActivities: Optioneel — verwijder dit blok als er niets is.
            // De "+ Extra Materiaal" knop verschijnt altijd; dit vult de inhoud.
            // extraActivities: [
            //     { id: 'mixedRetrieval', title: 'Gemengde Herhaling', category: 'Herhaling', icon: 'PhArrowsClockwise' }
            // ]
        },

        // ── STAP C: Samenvatting & Exit (± 5 min) ─────────────────────────────
        stepC: {
            step: 'C', title: 'Samenvatting & Exit', time: '5 min',
            cards: [
                {
                    id: 'card-pres-c',
                    type: 'class',
                    title: 'Samenvatting',
                    description: 'Kern van de les.',
                    action: 'presentation',
                    slidesKey: 'slidesC'
                },
                {
                    id: 'card-exit',
                    type: 'digital',
                    title: 'Exit Ticket',
                    description: 'Reflectie op de les.',
                    action: 'exit-ticket',
                    icon: 'PhTarget'
                }
            ]
        }
    },

    // ─── 6. ACTIVITIES ──────────────────────────────────────────────────────────
    // Voeg hier een entry toe voor elk activityId dat in de timeline gebruikt wordt.
    // Zie AGENTS.md voor de volledige lijst van beschikbare activity-types.
    activities: {
        main: {
            type: 'dragDrop',           // Vervang door het gewenste type
            title: '[Activiteitsnaam]'
        },
        // mixedRetrieval: {
        //     type: 'mixedRetrieval',
        //     title: 'Gemengde Herhaling'
        // }
    },

    // ─── 7. SLIDES ──────────────────────────────────────────────────────────────
    // Elke slidesKey in de timeline-kaarten moet hier als top-level key bestaan.

    slidesA: [
        { layout: 'title', title: 'Nando 3 Module XX', subtitle: '[Onderwerp]', badge: 'Wiskunde', icon: 'function' },
        { layout: 'steps', title: 'Wat ga je leren?', steps: [
            { icon: 'function', text: '[Leerdoel 1]' },
            { icon: 'function', text: '[Leerdoel 2]' }
        ]},
        { layout: 'predict', title: 'Wat weet je al?', question: '[Activeringsvraag]?', hint: 'Denk aan...', revealText: '[Antwoord]' }
    ],

    slidesB: [
        { layout: 'definition', term: '[Begrip]', definition: '[Definitie]' },
        { layout: 'worked-example', title: '[Voorbeeldtitel]', steps: [
            { label: 'Gegeven',    content: '[Wat is gegeven?]' },
            { label: 'Stap 1',    content: '[Eerste stap]' },
            { label: 'Oplossing', content: '[Eindantwoord]' }
        ]},
        { layout: 'multichoice', title: 'Check', question: '[Tussentijdse vraag]?', options: [
            { id: 'A', text: '[Optie A]', correct: false },
            { id: 'B', text: '[Optie B]', correct: true }
        ], explanation: '[Uitleg waarom B juist is.]' }
    ],

    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: [
            '[Kernpunt 1]',
            '[Kernpunt 2]',
            '[Kernpunt 3]'
        ]},
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt vandaag.',
          stats: [{ label: 'Module', value: 'XX' }, { label: 'Status', value: 'TOP' }] }
    ],

    // ─── 8. TICKETS ─────────────────────────────────────────────────────────────

    entryTicket: {
        questions: [
            { id: 'en1', type: 'mc', question: '[Voorkennisvraag]?',
              options: ['[Optie A]', '[Optie B]', '[Optie C]'], correct: 0 },
            { id: 'en2', type: 'mc', question: '[Tweede voorkennisvraag]?',
              options: ['[Optie A]', '[Optie B]', '[Optie C]'], correct: 1 }
        ]
    },

    exitTicket: {
        questions: [
            { id: 'ex1', type: 'mc', question: '[Leerdoelvraag 1]?',
              options: ['[Optie A]', '[Optie B]', '[Optie C]'], correct: 0 },
            { id: 'ex2', type: 'open', question: '[Reflectievraag]',
              description: 'Leg in je eigen woorden uit ...' }
        ]
    },

    // ─── 9. SPOT CHECK (optioneel) ───────────────────────────────────────────────
    // spotCheck: {
    //     questions: [{ question: '[Vraag]', answer: '[Antwoord]' }]
    // }
}
