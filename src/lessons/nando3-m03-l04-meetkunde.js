export default {
    id: 'nando3-m03-l04-meetkunde',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 03 - Les 4',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M03L4',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '3-Wiskunde',
        textbook: 'Nando 3 Module 03'
    },
    goals: [
        'Ik werk zelfstandig op mijn eigen niveau.',
        'Ik begrijp de theorie uit het handboek en kan de signaaloefeningen oplossen.'
    ],
    workbook: {
        title: 'Werkboek Oefeningen',
        subtitle: 'Zelfstandig werken',
        instruction: `<div class="space-y-4"><div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h4 class="font-bold text-emerald-600 mb-2">Oefeningen</h4><p class="text-sm">1. a) Meet en noteer de norm van u in symbolen.<br>[Afbeelding: Vector u]<br>[ ... invulveld: ||u|| = 2,2 cm ... ]<br>1. b) Schrap wat niet past.<br>[Afbeelding: Verticale vector t, pijl naar beneden]<br>De ~~richting~~ / zin van deze vector is verticaal.<br>De richting / ~~zin~~ van deze vector is naar beneden.<br>2. a) Noteer de vectoren met dezelfde richting en de vectoren met dezelfde grootte.<br>[Afbeelding: Vectoren u, v, w, s, t getekend]<br>- vectoren met dezelfde richting: [ ... invulveld: u en v; w en s ... ]<br>- vectoren met dezelfde grootte: [ ... invulveld: u en s; w en t ... ]<br>2. b) Noteer de gelijke vectoren en de tegengestelde vectoren.<br>[Afbeelding: Vier vectoren v1, v2, v3, v4 getekend. v1 en v4 zijn tegengesteld, v3 en v4 zijn gelijk.]<br>- gelijke vectoren: [ ... invulveld: v3 en v4 ... ]<br>- tegengestelde vectoren: [ ... invulveld: v1 en v2 ... ]<br>3. Bestudeer de volgende afbeelding. Markeer daarna de juiste opties in de tekst.<br>[Afbeelding: Touwtrekken tussen twee teams, krachten F1 en F2 aangeduid met vectoren]<br>- De kracht die het rechtse team uitoefent op de tegenstander wordt hier weergegeven met de vector ~~F1~~ / [F2].<br>- De vectoren F1 en F2 hebben dezelfde [richting] / ~~zin~~ maar een tegenstelde ~~richting~~ / [zin].<br>- Het linkse team oefent een kracht uit die groter / [even groot] / kleiner is dan het rechtse team.<br>- Daarom wint het rechtse team / [geen enkel team] / het linkse team.<br>4. Teken de somvector AB + CD die he</p></div></div>`,
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'vectors', icon: 'PhArrowUpRight' }
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
        'vectors': {
            type: 'vectors',
            title: 'Vectoren'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 3 Module 03', subtitle: 'Deel 4', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Instap', content: 'Laten we beginnen.' }
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
        questions: [{ id: 'ex1', type: 'mc', question: '1. Teken de punten X en Y zodat AX = BC en YB = CA.', options: ['Begrepen', 'Nog moeite', 'Hulp nodig'], correct: 0 }]
    }
};
