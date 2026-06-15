/**
 * 📘 MASTER LESSON TEMPLATE (v2.0 - Volledig Dynamisch)
 * 
 * HOE DIT BESTAND TE GEBRUIKEN:
 * 1. Kopieer dit bestand naar een nieuwe naam (bijv. chemie-zuren.js).
 * 2. Vul de 9 onderstaande gebieden in.
 * 3. Importeer je nieuwe bestand in App.vue (regel ~11).
 * 
 * RICHTLIJNEN:
 * - Gebruik GEEN emojis in de teksten.
 * - Gebruik HTML tags zoals <strong> en <br> voor opmaak in beschrijvingen.
 * - Alle 'correct' velden zijn 0-indexed (0 = eerste optie, 1 = tweede, etc.).
 */

export default {
    // 1. ============================================
    // METADATA (Algemene informatie)
    // ============================================
    id: 'vak-onderwerp',              // Unieke ID (lowercase, kebab-case, bijv. 'fysica-licht')
    subject: 'physics',                // 'physics' | 'chemistry' | 'science'
    className: '4NWb',                 // Klasnaam voor weergave
    title: '[TITEL VAN DE LES]',       // Verschijnt groot in de header
    description: '[Korte samenvatting van de les]', // Ondertitel in header

    // 2. ============================================
    // CONFIG (Ondersteunende data & links)
    // ============================================
    config: {
        groenCode: 'CODE123',            // Code verschijnt op het groene antwoordblad
        groenAntwoord: 'antwoord',       // Wachtwoord om digitale uitwerkingen te openen
        masterCode: 'docent-overrule',   // Mastercode voor de leerkracht
        cursusLink: 'https://...',       // Link naar het digitale handboek (PDF/Website)
        classId: '4-Newton',             // ID die verwijst naar de leerlingenlijst in students.js

        // Optionele extra tools in de toolbox (PSE is al standaard aanwezig)
        extraTools: [
            { label: 'Formularium', url: 'https://...', icon: 'PhFilePdf', color: 'text-rose-600' }
        ],

        // Invidivuele oplossingen met optioneel wachtwoord
        oplossingen: [
            { label: 'Oplossingen Deel 1', url: 'https://...', password: 'code' }
        ],

        textbook: '[NAAM HANDBOEK] - Pagina X tot Y'
    },

    // 3. ============================================
    // GOALS (De 3-5 leerdoelen voor deze les)
    // ============================================
    goals: [
        'Ik kan de definitie van ... geven',
        'Ik kan de formule ... toepassen op een vraagstuk',
        'Ik kan het verschil tussen ... en ... uitleggen'
    ],

    // 4. ============================================
    // WORKBOOK (Instellingen voor de werkboek-modal)
    // ============================================
    workbook: {
        title: 'Werkboek: [ONDERWERP]',
        subtitle: '[VAK] • [THEMA]',
        instruction: 'Maak de oefeningen hieronder in je werkboek.', // Optioneel — korte instructie boven de tabel
        formulaHint: 'Tip: Denk aan de formule [X = Y * Z]', // Optioneel
        exercises: [
            // Elke rij = één oefening in de inhoudstafel
            // { nr: 'Oef 1', title: 'Oefening over breuken',   page: 'p19' },
            // { nr: 'Oef 2', title: 'Vermenigvuldiging',        page: 'p21' },
            // { nr: 'Oef 3', title: 'Deling met rest',          page: 'p23' },
        ]
    },

    // 5. ============================================
    // TIMELINE (De flow van de les)
    // ============================================
    // Structuur: Stap A → Stap B → Stap C → etc.
    timeline: {
        // STAP A: Altijd de start (bijv. klassikale instructie)
        stepA: {
            step: 'A',
            title: 'Instructie',
            time: '20 min',
            cards: [
                {
                    id: 'card-pres',
                    type: 'class',              // 'class' (rood) | 'digital' (blauw) | 'paper' (groen) | 'check' (paars)
                    title: '[TITEL ACTIVITEIT A]',
                    description: '[Wat gaan we doen?]',
                    action: 'presentation'      // 'presentation' opent de slides
                },
                {
                    id: 'card-entry',
                    type: 'digital',
                    title: 'Toegangsticket',
                    description: 'Check je voorkennis voor we beginnen.',
                    action: 'entry-ticket',
                    icon: 'PhQuestion'
                }
            ]
        },

        // STAP B: Basis of Begeleide Oefening
        stepB: {
            step: 'B',
            title: 'Oefening',
            time: '30 min',
            cards: [
                {
                    id: 'card-workbook-b',
                    type: 'paper',
                    title: 'Verdieping in het werkboek',
                    description: 'Oefen de theorie zelfstandig.',
                    action: 'workbook',
                    icon: 'PhBookOpen'
                }
            ],
            extraActivities: [
                { id: 'dragdrop', title: 'Begrippen Herhalen', category: 'Actief', icon: 'PhArrowsDownUp' }
            ]
        },

        // STAP C t/m E: De rest van de lesflow (meestal klassikaal of individueel onderzoek)
        stepC: {
            step: 'C',
            title: '[TITEL STAP C]',
            time: '20 min',
            cards: [
                {
                    id: 'card-c1',
                    type: 'digital',
                    title: '[TITEL KAART C]',
                    description: '[Beschrijving]',
                    action: 'external-link',
                    url: 'https://...',        // Nodig bij action: 'external-link'
                    icon: 'PhGameController'
                }
            ]
        },

        stepD: {
            step: 'D',
            title: '[TITEL STAP D]',
            time: '15 min',
            cards: [
                {
                    id: 'card-d1',
                    type: 'paper',
                    title: '[TITEL KAART D]',
                    description: '[Beschrijving]',
                    action: 'custom',           // Hoeft alleen gemarkeerd te worden als 'klaar'
                    icon: 'PhFlask'
                }
            ]
        },

        stepE: {
            step: 'E',
            title: 'Afsluiting',
            time: '10 min',
            cards: [
                {
                    id: 'card-exit',
                    type: 'check',
                    title: 'Exit Ticket',
                    description: 'Laat zien wat je vandaag hebt geleerd.',
                    action: 'exit-ticket',
                    icon: 'PhTrophy'
                }
            ]
        }
    },

    // 6. ============================================
    // ACTIVITIES (De "Holy 5" Interactieve Modules)
    // ============================================
    activities: {
        dragDrop: {
            title: 'Begrippen Matchen',
            instruction: 'Sleep elk begrip naar de juiste definitie',
            pairs: [
                { term: 'Begriff A', definition: 'Definitie A' },
                { term: 'Begriff B', definition: 'Definitie B' }
                // Minimaal 4, maximaal 8 paren
            ]
        },
        fillBlanks: {
            title: 'Vul de Lege Plekken In',
            instruction: 'Typ de juiste woorden in de tekst.',
            questions: [
                { sentence: 'De hoofdstad van België is ___.', answer: 'brussel', hint: 'Begint met een B' }
                // Minimaal 4 vragen
            ]
        },
        categorySort: {
            title: 'Sorteren en Classificeren',
            instruction: 'Sorteer de items in de juiste kolommen.',
            columns: [
                { id: 'cat1', label: 'Groep 1' },
                { id: 'cat2', label: 'Groep 2' }
            ],
            items: [
                { id: 'i1', text: 'Item X', columnId: 'cat1' },
                { id: 'i2', text: 'Item Y', columnId: 'cat2' }
                // Minimaal 6 items
            ]
        },

    },

    // 7. ============================================
    // ROUTE ASSESSMENT (De quiz die de route bepaalt)
    // ============================================
    routeAssessment: {
        threshold: 75,                  // Score >= 75% gaat naar 'advanced', anders naar 'default'
        questions: [
            {
                id: 'q1',
                question: '[VRAAG 1]',
                options: ['Optie A', 'Optie B', 'Optie C', 'Optie D'],
                correct: 1              // 0-indexed: B is correct
            }
            // PRECIES 4 VRAGEN NODIG
        ]
    },

    // 8. ============================================
    // PRESENTATION SLIDES (Basis layouts: 13 types)
    // ============================================
    // Types: 'title', 'hero', 'steps', 'predict', 'standard', 'realworld', 
    //        'big', 'equation', 'attention', 'multichoice', 'recap', 'summary', 'celebration'
    slides: [
        {
            layout: 'title',
            title: '[TITEL]',
            subtitle: '[ONDERTITEL]',
            badge: '[VAK] • [MODULE]',
            icon: 'atom'               // 'atom', 'flask', 'fire', 'drop', 'scales', 'lightbulb', 'function'
        },
        {
            layout: 'hero',
            title: '[HOOK]',
            subtitle: '[BOEIENDE STATEMENT]',
            image: 'https://images.unsplash.com/...',
            credit: 'Bron info'
        },
        {
            layout: 'steps',
            title: 'Wat ga je leren?',
            steps: [
                { icon: 'flask', text: 'Stap 1' },
                { icon: 'function', text: 'Stap 2' }
            ]
        },
        {
            layout: 'predict',
            title: 'Voorspelling',
            question: '[VRAAG DIE VOORKENNIS ACTIVEERT]?',
            hint: 'Denk aan...',
            revealText: '[HET ANTWOORD DAT LATER VERSCHIJNT]'
        },
        {
            layout: 'standard',
            title: '[TITEL UITLEG]',
            content: 'Hier komt de hoofdtekst van je uitleg. Gebruik <strong>vet</strong> voor focus.'
        },
        {
            layout: 'big',
            title: '[LABEL/WET]',
            content: 'GROTE BOODSCHAP',
            subtext: 'Kleine toelichting'
        },
        {
            layout: 'equation',
            title: 'De Formule',
            equation: 'A = B * C',
            parts: [
                { label: 'A', items: ['Omschrijving A'], color: 'teal' },
                { label: 'B', items: ['Omschrijving B'], color: 'violet' }
            ],
            note: 'Let op eenheden!'
        },
        {
            layout: 'multichoice',
            title: 'Check',
            question: '[QUIZ VRAAG]?',
            options: [
                { id: 'A', text: 'Antwoord A', correct: false },
                { id: 'B', text: 'Antwoord B', correct: true }
            ],
            explanation: 'Uitleg waarom B juist is.'
        },
        {
            layout: 'summary',
            title: 'Samenvatting',
            items: [
                'Punt 1: ...',
                'Punt 2: ...'
            ]
        },
        {
            layout: 'celebration',
            title: 'Klaar!',
            subtitle: 'Je kunt nu starten met de oefeningen.',
            stats: [
                { label: 'Moeilijkheid', value: '4/5' },
                { label: 'Status', value: 'VOLTOOID' }
            ]
        }
    ],

    // 9. ============================================
    // ENTRY TICKET (Diagnostische toets — start van de les)
    // ============================================
    entryTicket: {
        questions: [
            {
                id: 'en1',
                type: 'mc',
                question: '[VOORKENNISVRAAG]?',
                options: ['Optie A', 'Optie B', 'Optie C', 'Optie D'],
                correct: 2
            }
            // 3-5 VRAGEN AANBEVOLEN
        ]
    },

    // EXIT TICKET (De quiz aan het einde van de les)
    // ============================================
    exitTicket: {
        questions: [
            {
                id: 'e1',
                type: 'mc',             // 'mc' = meerkeuze
                question: '[VRAAG 1]?',
                options: ['Optie A', 'Optie B', 'Optie C', 'Optie D'],
                correct: 2
            },
            {
                id: 'open',
                type: 'open',           // 'open' = tekstveld
                question: '[REFLECTIEVRAAG]',
                description: 'Leg in je eigen woorden uit hoe...'
            }
            // 3-5 VRAGEN AANBEVOLEN
        ]
    }
}
