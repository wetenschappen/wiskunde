export default {
    id: 'nando3-m05-l03-wortels',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 05 - Les 3',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M05L3',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '3-Wiskunde',
        textbook: 'Nando 3 Module 05'
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'realNumbers', icon: 'PhCalculator' }
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
            title: 'Rekenen in R'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 3 Module 05', subtitle: 'Deel 3', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Rekenen met vierkantswortels', content: '## 5.1 Vierkantswortels vereenvoudigen<br>Je kunt het grondtal van een vierkantswortel schrijven als een product van factoren. De factoren die een volkomen kwadraat zijn kun je buiten het wortelteken brengen.<br>√18 = √(9 · 2)<br>= √9 · √2<br>= 3√2<br>√40 = √(4 · 10)<br>= 2√10<br>[Afbeelding: Tip kader met de kwadraten van 1 tot en met 12]<br>**TIP**<br>Het is zinvol als je de eerste volkomen kwadraten uit het hoofd kent.<br>| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |<br>|---|---|---|---|---|---|---|---|---|---|---|---|<br>| 1 | 4 | 9 | 16 | 25 | 36 | 49 | 64 | 81 | 100 | 121 | 144 |<br>Herken je geen volkomen kwadraten, dan kun je het grondtal ontbinden in priemfactoren. Vooral bij grotere grondtallen is dit handig.<br>√288 = √(2^5 · 3^2)<br>= √(2^4 · 2 · 3^2)<br>= 2^2 · 3√2<br>= 12√2<br>288 ontbinden in priemfactoren:<br>288 | 2<br>144 | 2<br>72 | 2<br>36 | 2<br>18 | 2<br>9 | 3<br>3 | 3<br>1 |<br>288 = 2^5 · 3^2<br>**Merk op**<br>Je kan √288 vereenvoudigen door 288 te schrij', icon: 'book-open' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Schatten, rekenen en afronden', content: 'Vorig jaar leerde je rekenen met rationale getallen. In de diagnostische module kun je de signaaloefeningen maken om te zien waar jij best nog wat verder op oefent. Het is belangrijk om jouw rekenvaardigheid verder te onderhouden.<br>In heel wat situaties zul je voor de berekeningen ook gebruik maken van een rekenmachine. Denk maar aan toepassingen binnen natuurwetenschappen, economische situaties, verhoudingen …<br>## 6.1 Schatten<br>**Voorbeeld 1:** Je leerde al dat je een inschatting kan maken van de grootte van een vierkantswortel. Zo is √26 iets groter dan 5 (want √25 = 5).<br>**Voorbeeld 2:** Bij een schatting kan je gebruik maken van afgeronde of benaderende waarden. Als je weet dat π ≈ 3,14 dan kan je een schatting maken van 200π.<br>Schatting: 200π ≈ 628<br>Exacte waarde: 200π ≈ 628,31853...<br>Wanneer je bij het oplossen van een probleem een berekening moet uitvoeren, kun je het verkregen resultaat altijd aftoetsen aan een eerder gemaakte schatting.<br>**Voorbeeld**<br>De pap', icon: 'book-open' }
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
