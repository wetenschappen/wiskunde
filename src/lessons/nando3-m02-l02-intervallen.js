export default {
    id: 'nando3-m02-l02-intervallen',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 02 - Les 2',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M02L2',
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
        { layout: 'title', title: 'Nando 3 Module 02', subtitle: 'Deel 2', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Reële getallen', content: '## 2.1 De verzameling van de reële getallen<br>**definitie** | Een **reëel getal** is ofwel een rationaal getal ofwel een irrationaal getal.<br>De verzameling van de reële getallen stellen we voor met het symbool IR.<br>[Afbeelding: Tekening van twee mannetjes bij een trechter/machine. Het linker mannetje (\"IRRATIONAAL\") gooit irrationale getallen zoals √2, π, √15 in de machine. Het rechter mannetje (\"RATIONAAL\") gooit rationale getallen zoals -3, 1,25, 4/5, -4 in de machine. Uit de machine komt een blok met \"IR REËEL\". Venndiagram ernaast toont RATIONALE GETALLEN (Q) links en IRRATIONALE GETALLEN rechts, samen in de grote verzameling IR.]<br>| SYMBOOL | OMSCHRIJVING |<br>|---|---|<br>| Q | de verzameling van de rationale getallen |<br>| IR | de verzameling van de reële getallen |<br>| IR \ Q | de verzameling van de irrationale getallen |<br>**Merk op**<br>Sommige wortelvormen zijn rationale getallen, sommige wortelvormen zijn irrationale getallen.<br>**Samengevat:**<br>| DECIMAL', icon: 'book-open' }
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
