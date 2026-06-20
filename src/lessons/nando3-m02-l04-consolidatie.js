export default {
    id: 'nando3-m02-l04-consolidatie',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 02 - Les 4',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M02L4',
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
        { layout: 'title', title: 'Nando 3 Module 02', subtitle: 'Deel 4', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Vierkantswortels en derdemachtswortels', content: '## 4.1 Vierkantswortel van een positief reëel getal<br>Als we de waarde van x willen berekenen in deze evenredigheid: 4/x = x/9<br>stellen we vast dat er twee oplossingen zijn.<br>x² = 36<br>Er zijn twee reële getallen waarvan het kwadraat 36 is:<br>namelijk 6 en -6.<br>x = √36 of x = −√36<br>x = 6 of x = −6<br>√36 is de **positieve vierkantswortel** uit 36.<br>−√36 is de **negatieve vierkantswortel** uit 36.<br>**definitie** | b is een **vierkantswortel** van een positief reëel getal a als en slechts als het kwadraat van b gelijk is aan a.<br>**Merk op**<br>- Je kunt van elk strikt positief reëel getal een positieve vierkantswortel en een negatieve vierkantswortel bepalen. Als men spreekt over de vierkantswortel van een positief reëel getal, bedoelt men de positieve vierkantswortel van dat getal.<br>- De positieve en negatieve vierkantswortel van 0 is gelijk aan 0.<br>√0 = 0 = −√0<br>- We kunnen geen vierkantswortel trekken van een strikt negatief reëel getal.<br>Bijvoorbeeld: we kunn', icon: 'book-open' }
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
