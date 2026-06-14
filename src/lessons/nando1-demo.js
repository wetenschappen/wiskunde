export default {
    id: 'nando1-demo',
    subject: 'math',
    className: '1ste Jaar',
    title: 'Demo Lecture: Wiskunde',
    description: 'Een uitgebreide demonstratie van alle slide layouts',
    config: {
        groenCode: 'DEMO1',
        groenAntwoord: 'demo',
        masterCode: 'nando',
        classId: '1-Wiskunde',
        textbook: 'Nando 1 - Demo'
    },
    goals: [
        'Ik ontdek de nieuwe stijlvolle slide layouts.',
        'Ik kan de interactieve mogelijkheden van de leeromgeving benutten.'
    ],
    workbook: {
        title: 'Werkboek: Oefeningen',
        subtitle: 'Wiskunde • Demo',
        instruction: 'Maak oefeningen 1 tot 3 op de uitgedeelde blaadjes.',
    },
    timeline: {
        stepA: {
            step: 'A', title: 'Introductie', time: '10 min',
            cards: [
                { id: 'card-entry', type: 'digital', title: 'Start', description: 'Wat weet je al?', action: 'entry-ticket', icon: 'PhQuestion' },
                { id: 'card-pres-a', type: 'class', title: 'Alle Slides', description: 'Presentatie van de layouts.', action: 'presentation', slidesKey: 'slidesA' }
            ]
        },
        stepB: {
            step: 'B', title: 'Verwerken', time: '15 min',
            cards: [
                { id: 'card-workbook', type: 'paper', title: 'Boek Oefeningen', description: 'Oefen de theorie zelfstandig.', action: 'workbook', icon: 'PhBookOpen' }
            ]
        },
        stepC: {
            step: 'C', title: 'Afsluiting', time: '5 min',
            cards: [
                { id: 'card-exit', type: 'digital', title: 'Exit Ticket', description: 'Reflectie op de les.', action: 'exit-ticket', icon: 'PhTarget' }
            ]
        }
    },
    activities: {},
    slidesA: [
        { 
            layout: 'title', 
            title: 'De Wiskundige Revolutie', 
            subtitle: 'Een overzicht van alle academische slide layouts in deze leeromgeving.', 
            badge: 'Wiskunde 1' 
        },
        { 
            layout: 'hero', 
            title: 'Ontdek de Wereld', 
            subtitle: 'Wiskunde is overal om ons heen.', 
            image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', 
            credit: 'Unsplash - Geometrie' 
        },
        { 
            layout: 'steps', 
            title: 'Stappenplan', 
            steps: [
                { icon: 'function', text: 'Analyseer het probleem grondig' },
                { icon: 'flask', text: 'Kies de juiste methode of formule' },
                { icon: 'atom', text: 'Werk de oplossing stap voor stap uit' },
                { icon: 'check', text: 'Controleer je antwoord kritisch' }
            ]
        },
        { 
            layout: 'predict', 
            title: 'Voorspelling', 
            question: 'Wat denk je dat er gebeurt als we de straal van een cirkel verdubbelen?', 
            hint: 'Denk aan de formule voor de oppervlakte van een cirkel.', 
            revealText: 'De oppervlakte wordt verviervoudigd, omdat de oppervlakte schaalt met het kwadraat van de straal (r²).' 
        },
        { 
            layout: 'standard', 
            title: 'Stelling van Pythagoras', 
            content: 'In een rechthoekige driehoek is het kwadraat van de schuine zijde gelijk aan de som van de kwadraten van de beide rechthoekszijden. Deze stelling is een fundamenteel onderdeel van de Euclidische meetkunde en wordt wereldwijd gebruikt voor afstandsmetingen.' 
        },
        { 
            layout: 'equation', 
            title: 'Fundamentele Formule', 
            equation: 'a² + b² = c²', 
            parts: [
                { label: 'A en B', items: ['Lengtes van de rechthoekszijden', 'Staan loodrecht op elkaar'], color: 'amber' },
                { label: 'C', items: ['Schuine zijde (hypotenusa)', 'De langste zijde van de driehoek'], color: 'violet' }
            ] 
        },
        { 
            layout: 'multichoice', 
            title: 'Kennischeck', 
            question: 'Als a=3 en b=4, wat is dan c in een rechthoekige driehoek?', 
            options: [
                { id: 'A', text: '5', correct: true },
                { id: 'B', text: '7', correct: false },
                { id: 'C', text: '25', correct: false }
            ], 
            explanation: 'a² + b² = 3² + 4² = 9 + 16 = 25. c = √25 = 5.' 
        },
        { 
            layout: 'summary', 
            title: 'Samenvatting', 
            items: [
                'We hebben de titel slide gezien met een prachtige layout.',
                'De hero slide met een academische donkere achtergrond.',
                'Stappen, formules en meerkeuze vragen.',
                'Alles heeft een samenhangende styling net als in de Planner.'
            ] 
        },
        { 
            layout: 'celebration', 
            title: 'Klaar!', 
            subtitle: 'Je kunt nu starten met de oefeningen.', 
            stats: [
                { label: 'Moeilijkheid', value: 'Gemiddeld' },
                { label: 'Status', value: 'VOLTOOID' }
            ] 
        }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om deze layouts te bekijken?', options: ['Ja, absoluut!', 'Laat maar komen'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: 'Vond je de academische stijl mooi?', options: ['Zeer mooi', 'Prachtig', 'Perfect'], correct: 2 }]
    }
};
