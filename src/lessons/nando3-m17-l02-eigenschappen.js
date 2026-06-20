export default {
    id: 'nando3-m17-l02-eigenschappen',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 17 - Les 2',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M17L2',
        groenAntwoord: 'wiskunde',
        masterCode: 'nando',
        classId: '3-Wiskunde',
        textbook: 'Nando 3 Module 17'
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
                { id: 'card-activity', type: 'digital', title: 'Interactieve Verwerking', description: 'Verken visueel.', action: 'activity', activityId: 'circleGeometry', icon: 'PhCircle' }
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
        'circleGeometry': {
            type: 'circleGeometry',
            title: 'Cirkelmeetkunde'
            
        }
    },
    slidesA: [
        { layout: 'title', title: 'Nando 3 Module 17', subtitle: 'Deel 2', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Eigenschappen in de cirkel', content: '## 2.1 Basisbegrippen<br>**definitie** Een **cirkel** is de verzameling van alle punten die even ver liggen van een welbepaald punt, het middelpunt.<br>**NOTATIE:** c(M, r)<br>Dit lees je als \'de cirkel c met middelpunt M en straal r\'.<br>[Afbeelding: Een cirkel c met middelpunt M. Er zijn lijnstukken getekend: MA (straal), BC (koorde), DE (middellijn/diameter), MF (apothema loodrecht op BC).]<br>**definitie** Een **straal** van een cirkel is (de lengte van) een lijnstuk, bepaald door het middelpunt en een punt op de cirkel.<br>[MA] is een straal van de cirkel c(M, r).<br>|MA| is de lengte van de straal [MA] van de cirkel c(M, r).<br>**definitie** Een **koorde** van een cirkel is een lijnstuk dat twee punten van de cirkel verbindt.<br>De rechte DE is een middellijn van de cirkel c(M, r).<br>**definitie** Een **diameter of middellijn** is (de lengte van) een koorde door het middelpunt van de cirkel.<br>[DE] is een diameter van de cirkel c(M, r).<br>|DE| is de lengte van de diameter [B', icon: 'book-open' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Raaklijnen', content: '## 3.1 Definitie<br>Een rechte en een cirkel kunnen twee snijpunten, één snijpunt of geen snijpunt hebben.<br>[Afbeelding: Drie scenario\'s. Links: rechte a snijdt de cirkel in twee punten A en B. Midden: rechte a raakt de cirkel in één punt R. Rechts: rechte a snijdt de cirkel nergens.]<br>**definitie** Een **raaklijn** aan een cirkel is een rechte die met die cirkel één punt gemeenschappelijk heeft.<br>Dit gemeenschappelijk punt met de cirkel noemen we het **raakpunt**.<br>## 3.2 Eigenschappen van een raaklijn aan een cirkel<br>**eigenschap** De loodlijn in een snijpunt van een middellijn met de cirkel, is een raaklijn aan deze cirkel.<br>**Gegeven:** een cirkel c(M, r)<br>AB een middellijn van c(M, r)<br>A ∈ a en a ⟘ AB<br>**Te bewijzen:** a is een raaklijn aan c(M, r)<br>[Afbeelding: Cirkel c met middelpunt M en middellijn AB. Een loodlijn a is getekend door punt A. Een punt P ligt op a.]<br>**Bewijs:**<br>Kies een punt P op de rechte a verschillend van A.<br>∆MAP is rechthoekig in', icon: 'book-open' }
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
