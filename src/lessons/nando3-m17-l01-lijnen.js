export default {
    id: 'nando3-m17-l01-lijnen',
    subject: 'math',
    className: '3de Middelbaar',
    title: 'Module 17 - Les 1',
    description: 'ABC Methode Digitaal',
    config: {
        groenCode: 'M17L1',
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
            step: 'A', title: 'Diagnostisch & Instap', time: '15 min',
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
            step: 'C', title: 'Samenvatting & Exit', time: '5 min',
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
        { layout: 'title', title: 'Nando 3 Module 17', subtitle: 'Deel 1', badge: 'Wiskunde', icon: 'function' },
        { layout: 'standard', title: 'Instap', content: '## Opdracht 1<br>Noteer de juiste naam van de getekende merkwaardige lijn in de driehoek.<br>[Afbeelding: Vier driehoeken met elk een getekende merkwaardige lijn. De eerste heeft een lijn uit de basis loodrecht omhoog in het midden (middelloodlijn). De tweede heeft een lijn uit de top loodrecht op de basis (hoogtelijn). De derde heeft een lijn uit de top naar het midden van de overstaande zijde (zwaartelijn). De vierde heeft een lijn die de hoek in twee gelijke delen verdeelt (bissectrice).]<br>...', icon: 'rocket' }
    ],
    slidesB: [
        { layout: 'standard', title: 'Merkwaardige lijnen in de cirkel', content: 'D-FINALITEIT 5 UUR – MEETKUNDE<br>[Afbeelding: Achtergrond van een gebouw met een groot rood label waarop \"CORRECTIESLEUTEL\" staat]<br>## wat je al kunt<br>- de begrippen eigen aan een cirkel zoals apothema, straal, middellijn en koorde van een cirkel definiëren<br>- de eigenschappen van de middelloodlijn van een lijnstuk verwoorden<br>- de eigenschappen van hoeken in gelijkbenige driehoeken verwoorden<br>- de eigenschap van de hoogtelijn uit de top van een gelijkbenige driehoek verwoorden<br>- de stelling van Pythagoras in een rechthoekige driehoek verwoorden<br>- de sinus, cosinus en tangens van een scherpe hoek berekenen<br>## in de kijker<br>Je kan met behulp van een **duidelijke tekening** op een correcte manier een **wiskundige redenering** opbouwen.<br>## wat je leert in deze module<br>- de ingeschreven en omgeschreven cirkel van een driehoek tekenen<br>- de cartesische vergelijking van een merkwaardige lijn bepalen<br>- eigenschappen van de cirkel ontdekken en gebruiken om co', icon: 'book-open' },
        { layout: 'standard', title: 'Merkwaardige lijnen', content: '## 1.1 Definities en eigenschappen<br>**definitie** Een **middelloodlijn** in een driehoek is een rechte die door het midden van een zijde gaat en loodrecht staat op de drager van die zijde.<br>[Afbeelding: Een driehoek ABC met een middelloodlijn m op zijde BC.]<br>**definitie** Een **zwaartelijn** in een driehoek is een rechte die door een hoekpunt en door het midden van de overstaande zijde gaat.<br>**eigenschap IN WOORDEN**<br>Het zwaartepunt van een driehoek verdeelt elke zwaartelijn in twee stukken die zich verhouden als 2:1.<br>**IN SYMBOLEN**<br>|AZ| / |ZN| = |BZ| / |ZD| = 2 / 1<br>[Afbeelding: Een driehoek ABC met zwaartelijnen AN en BD. Ze snijden elkaar in punt Z.]<br>**definitie** Een **bissectrice** in een driehoek is een rechte die door een hoekpunt gaat en de bijhorende hoek in twee even grote hoeken verdeelt.<br>**eigenschap IN WOORDEN**<br>In een driehoek verdeelt de bissectrice van een hoek de overstaande zijde in stukken die evenredig zijn met de aanliggende zijden.<b', icon: 'book-open' }
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
