export default {
    id: 'nando3-m02-l03-wortels',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 02 - Les 3',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M02L3',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '3-Wiskunde',
        textbook: 'Nando 3 Module 02'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm"></p></div></div>`,
        formulaHint: 'Raadpleeg het handboek voor de volledige theorie.'
    },
    timeline: {
        stepA: {
            step: 'A', title: 'Instap', time: '15 min',
            cards: [
                { id: 'card-entry', type: 'digital', title: 'Diagnostische Toets', description: 'Wat weet je al?', action: 'entry-ticket', icon: 'PhQuestion' },
                { id: 'card-pres-a', type: 'class', title: 'Inleidende Instructie', description: 'Korte theorie.', action: 'presentation', slidesKey: 'slidesA' }
            ]
        },
        stepB: {
            step: 'B', title: 'Verwerken', time: '30 min',
            cards: [
                { id: 'card-pres-b', type: 'class', title: 'Uitgebreide Theorie', description: 'Stap voor stap uitgewerkt.', action: 'presentation', slidesKey: 'slidesB' },
                { id: 'card-workbook', type: 'paper', title: 'Boek Oefeningen', description: 'Maak oefeningen in het handboek.', action: 'workbook', icon: 'PhBookOpen' },
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'realNumbers', icon: 'PhMathOperations' }
            ]
        },
        stepC: {
            step: 'C', title: 'Afsluiting', time: '5 min',
            cards: [
                { id: 'card-pres-c', type: 'class', title: 'Samenvatting', description: 'Kern van de les.', action: 'presentation', slidesKey: 'slidesC' },
                { id: 'card-exit', type: 'digital', title: 'Exit Ticket', description: 'Reflectie op de les.', action: 'exit-ticket', icon: 'PhTarget' }
            ]
        }
    },
    activities: {
        'realNumbers': {
            type: 'realNumbers',
            title: 'Reële getallen'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 3 Module 02', subtitle: 'Deel 3', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Intervallen en deelverzamelingen', content: '## 3.1 Intervallen<br>Soms is het zinvol om maar een deel van de verzameling van de reële getallen te gebruiken. In zo\'n geval maak je gebruik van intervallen.<br>**Voorbeeld**<br>[-3, 7[<br>De ondergrens van dit interval is -3. Het vierkante haakje is **gesloten**.<br>-3 behoort tot het interval.<br>De bovengrens van dit interval is 7. Het vierkante haakje is **open**.<br>7 behoort niet tot het interval.<br>Alle reële getallen die groter dan of gelijk zijn aan -3, maar kleiner dan 7.<br>IN SYMBOLEN: -3 ⩽ x < 7<br>[Afbeelding: Getallenas. Een groen gevuld bolletje op -3, een rode open cirkel op 7. Daartussen een groene lijn.]<br>**AFSPRAAK**<br>We spreken af dat als het getal erbij hoort, we dit op de getallenas aanduiden met een **groen gevuld bolletje**. Hoort het getal er niet bij, dan duiden we het aan met een **rood open cirkeltje**. Alle getallen tussen de twee grenswaarden duiden we in het groen aan. We krijgen dus een groen lijnstukje.<br>**Voorbeelden**<br>| BETEKENIS | NOTAT', icon: 'book-open' }
    ],
    slidesB: [
        
    ],
    slidesC: [
        { layout: 'summary', title: 'Samenvatting', items: ['Je kunt nu op eigen tempo verder.'] },
        { layout: 'celebration', title: 'Klaar!', subtitle: 'Goed gewerkt.' }
    ],
    entryTicket: {
        questions: [{ id: 'en1', type: 'mc', question: 'Ben je klaar om te starten?', options: ['Ja', 'Nee'], correct: 0 }]
    },
    exitTicket: {
        questions: [{ id: 'ex1', type: 'mc', question: 'Begrijp je de kern van deze theorie?', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};
